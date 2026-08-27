import { randomUUID } from 'crypto';
import prisma from '../config/prisma';
import { getMessagingGateway } from './messaging';
import type {
  QueueEntry,
  ConfiguracaoRegulacao,
  Paciente,
  MotivoRecusa,
} from '@prisma/client';

// ====================================================================
// Serviço de Confirmação Automatizada — máquina de estados (Fase A)
//
// Lógica de negócio independente de HTTP, reutilizada pelo controller e
// pelos cron jobs. Todo o envio de mensagens passa pelo IMessagingGateway
// (mockado nesta fase).
// ====================================================================

// --- Configuração (com defaults quando o município ainda não salvou) ---

export type ConfigResolvida = Pick<
  ConfiguracaoRegulacao,
  | 'qtdConfirmacoes'
  | 'diasAntesConfirmacao'
  | 'qtdReenvios'
  | 'intervaloReenvioHoras'
  | 'timeoutRespostaHoras'
  | 'horarioInicio'
  | 'horarioFim'
  | 'timezone'
  | 'templateConfirmacao'
  | 'templateReconfirmacao'
  | 'templateColetaMotivo'
  | 'templateConvocacao'
>;

export const CONFIG_PADRAO: ConfigResolvida = {
  qtdConfirmacoes: 2,
  diasAntesConfirmacao: [7, 1],
  qtdReenvios: 2,
  intervaloReenvioHoras: 12,
  timeoutRespostaHoras: 24,
  horarioInicio: '07:00',
  horarioFim: '20:00',
  timezone: 'America/Campo_Grande',
  templateConfirmacao: 'confirmacao_agendamento',
  templateReconfirmacao: 'reconfirmacao_agendamento',
  templateColetaMotivo: 'coleta_motivo_recusa',
  templateConvocacao: 'convocacao_vaga',
};

export async function getConfig(unidadeId: string | null | undefined): Promise<ConfigResolvida> {
  if (!unidadeId) return CONFIG_PADRAO;
  const cfg = await prisma.configuracaoRegulacao.findUnique({ where: { unidadeId } });
  return cfg ?? CONFIG_PADRAO;
}

// --- Score de absenteísmo (seção 4.7) ---

export const DELTA_SCORE = {
  CONFIRMOU: 2,
  RECUSOU: -5,
  NAO_RESPONDEU: -15,
} as const;

export type TipoDesfecho = keyof typeof DELTA_SCORE;

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

/** Novo score (0-100) após aplicar o delta do desfecho. Puro/testável. */
export function calcularNovoScore(scoreAtual: number, tipo: TipoDesfecho): number {
  return clamp((scoreAtual ?? 100) + DELTA_SCORE[tipo]);
}

export async function atualizarScore(
  pacienteId: string,
  unidadeId: string | null,
  tipo: TipoDesfecho,
  motivo?: string | null,
  queueEntryId?: string | null
): Promise<number> {
  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  if (!paciente) return 0;

  const delta = DELTA_SCORE[tipo];
  const scoreResultante = calcularNovoScore(paciente.scoreConfianca ?? 100, tipo);

  await prisma.$transaction([
    prisma.paciente.update({
      where: { id: pacienteId },
      data: { scoreConfianca: scoreResultante },
    }),
    prisma.historicoAbsenteismo.create({
      data: {
        pacienteId,
        unidadeId: unidadeId ?? null,
        queueEntryId: queueEntryId ?? null,
        tipo,
        motivo: motivo ?? null,
        delta,
        scoreResultante,
      },
    }),
  ]);

  return scoreResultante;
}

// --- Horário de operação (seção 4.10) ---

function horaLocal(timezone: string, agora: Date): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(agora);
  } catch {
    // timezone inválido → usa horário do servidor
    return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
  }
}

export function dentroDoHorario(config: ConfigResolvida, agora: Date = new Date()): boolean {
  const hhmm = horaLocal(config.timezone, agora);
  return hhmm >= config.horarioInicio && hhmm <= config.horarioFim;
}

// --- Helpers de paciente/data ---

function telefoneDe(paciente: Pick<Paciente, 'telefone' | 'celular'>): string {
  const t = (paciente.telefone || paciente.celular || '').replace(/\D/g, '');
  return t;
}

function formatarData(data: Date | null | undefined): string {
  if (!data) return 'a definir';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(data);
}

export function grupoDe(entry: Pick<QueueEntry, 'procedimentoNome' | 'procedimentoId'>): string {
  return entry.procedimentoNome || entry.procedimentoId || 'Regulação';
}

const RANK_URGENCIA: Record<string, number> = { VERMELHO: 3, AMARELO: 2, NORMAL: 1 };

/**
 * Ordena a fila por urgência (VERMELHO > AMARELO > NORMAL) e, em empate,
 * por posição (FIFO — quem aguarda há mais tempo). Puro/testável.
 */
export function ordenarFila<T extends { nivelUrgencia: string; posicao: number }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ra = RANK_URGENCIA[a.nivelUrgencia] ?? 1;
    const rb = RANK_URGENCIA[b.nivelUrgencia] ?? 1;
    if (rb !== ra) return rb - ra; // urgência desc (VERMELHO primeiro)
    return a.posicao - b.posicao; // FIFO
  });
}

// ====================================================================
// Disparo de uma etapa de confirmação / convocação
// ====================================================================

interface DispararOpts {
  entry: QueueEntry;
  etapa: number;
  tentativa?: number;
  config: ConfigResolvida;
  tipo: 'CONFIRMACAO' | 'CONVOCACAO';
}

export async function dispararEtapa({ entry, etapa, tentativa = 1, config, tipo }: DispararOpts) {
  const paciente = await prisma.paciente.findUnique({ where: { id: entry.pacienteId } });
  if (!paciente) throw new Error(`Paciente ${entry.pacienteId} não encontrado.`);

  const gateway = getMessagingGateway();
  const callbackId = randomUUID();
  const telefone = telefoneDe(paciente);
  const nomePaciente = paciente.nomeCompleto;
  const procedimento = grupoDe(entry);
  const dataAgendada = formatarData(entry.dataAgendada);

  const templateName =
    tipo === 'CONVOCACAO'
      ? config.templateConvocacao
      : etapa === 1
        ? config.templateConfirmacao
        : config.templateReconfirmacao;

  const enviadoEm = new Date();
  const expiraEm = new Date(enviadoEm.getTime() + config.timeoutRespostaHoras * 3600_000);

  const resultado =
    tipo === 'CONVOCACAO'
      ? await gateway.enviarConvocacao({ telefone, nomePaciente, procedimento, dataAgendada, templateName, callbackId })
      : await gateway.enviarConfirmacao({ telefone, nomePaciente, procedimento, dataAgendada, templateName, callbackId });

  const ciclo = await prisma.cicloConfirmacao.create({
    data: {
      queueEntryId: entry.id,
      unidadeId: entry.unidadeId,
      etapa,
      tentativa,
      status: 'CONVOCADO',
      templateName,
      callbackId,
      messageId: resultado.messageId,
      enviadoEm,
      expiraEm,
    },
  });

  await prisma.queueEntry.update({
    where: { id: entry.id },
    data: {
      statusPaciente: 'CONVOCADO',
      status: 'AWAITING_RESPONSE',
      notificadoEm: enviadoEm,
      expiraEm,
    },
  });

  console.log(
    `[Confirmacao] ${tipo} etapa=${etapa} tentativa=${tentativa} paciente=${nomePaciente} entry=${entry.id} ciclo=${ciclo.id}`
  );
  return ciclo;
}

// ====================================================================
// Processamento da resposta do paciente (callback do ChatBot / simulação)
// ====================================================================

export interface RespostaPayload {
  resposta: 'SIM' | 'NAO';
  motivoRecusa?: MotivoRecusa | null;
  motivoTextoLivre?: string | null;
  timestamp?: string;
  wamid?: string | null;
}

export interface ResultadoResposta {
  ok: boolean;
  mensagem: string;
  statusPaciente?: string;
  proximoConvocado?: string | null;
}

export async function processarResposta(
  callbackId: string,
  payload: RespostaPayload
): Promise<ResultadoResposta> {
  const ciclo = await prisma.cicloConfirmacao.findUnique({ where: { callbackId } });
  if (!ciclo) return { ok: false, mensagem: 'callbackId não encontrado.' };
  if (ciclo.status !== 'CONVOCADO') {
    return { ok: false, mensagem: `Ciclo já resolvido (status=${ciclo.status}).` };
  }

  const entry = await prisma.queueEntry.findUnique({ where: { id: ciclo.queueEntryId } });
  if (!entry) return { ok: false, mensagem: 'Entrada da fila não encontrada.' };

  const config = await getConfig(entry.unidadeId);
  const agora = new Date();

  // Log da resposta recebida (INBOUND).
  await prisma.messageLog.create({
    data: {
      queueEntryId: entry.id,
      pacienteId: entry.pacienteId,
      direction: 'INBOUND',
      wamid: payload.wamid ?? null,
      body:
        payload.resposta === 'NAO'
          ? `NAO${payload.motivoRecusa ? ` (${payload.motivoRecusa})` : ''}${payload.motivoTextoLivre ? `: ${payload.motivoTextoLivre}` : ''}`
          : 'SIM',
      status: 'RECEIVED',
      rawPayload: payload as any,
    },
  });

  // ----- Resposta SIM -----
  if (payload.resposta === 'SIM') {
    await prisma.cicloConfirmacao.update({
      where: { id: ciclo.id },
      data: { status: 'CONFIRMADO', respondidoEm: agora, resposta: 'SIM' },
    });

    // Ainda há etapas de reconfirmação pendentes?
    if (ciclo.etapa < config.qtdConfirmacoes) {
      await dispararEtapa({ entry, etapa: ciclo.etapa + 1, config, tipo: 'CONFIRMACAO' });
      return { ok: true, mensagem: `Etapa ${ciclo.etapa} confirmada; reconfirmação enviada.`, statusPaciente: 'CONVOCADO' };
    }

    // Última etapa — confirmação final.
    const statusFinal = config.qtdConfirmacoes >= 2 ? 'RECONFIRMADO' : 'CONFIRMADO';
    await prisma.queueEntry.update({
      where: { id: entry.id },
      data: { statusPaciente: statusFinal, status: 'CONFIRMED', respondidoEm: agora },
    });
    await atualizarScore(entry.pacienteId, entry.unidadeId, 'CONFIRMOU', null, entry.id);
    return { ok: true, mensagem: 'Presença confirmada.', statusPaciente: statusFinal };
  }

  // ----- Resposta NÃO -----
  await prisma.cicloConfirmacao.update({
    where: { id: ciclo.id },
    data: {
      status: 'RECUSADO',
      respondidoEm: agora,
      resposta: 'NAO',
      motivoRecusa: payload.motivoRecusa ?? null,
      motivoTextoLivre: payload.motivoTextoLivre ?? null,
    },
  });

  // Envia mensagem de coleta de motivo (ack) — mockado.
  const paciente = await prisma.paciente.findUnique({ where: { id: entry.pacienteId } });
  if (paciente) {
    await getMessagingGateway().enviarColetaMotivo({
      telefone: telefoneDe(paciente),
      nomePaciente: paciente.nomeCompleto,
      templateName: config.templateColetaMotivo,
      callbackId: ciclo.callbackId,
    });
  }

  await prisma.queueEntry.update({
    where: { id: entry.id },
    data: { statusPaciente: 'RECUSOU', status: 'DECLINED', respondidoEm: agora },
  });
  await atualizarScore(
    entry.pacienteId,
    entry.unidadeId,
    'RECUSOU',
    payload.motivoRecusa ?? payload.motivoTextoLivre ?? null,
    entry.id
  );

  // Vaga aberta → convoca o próximo da fila.
  const proximo = await convocarProximo(entry.unidadeId, grupoDe(entry), entry.dataAgendada);
  return {
    ok: true,
    mensagem: 'Recusa registrada; próximo da fila convocado (se elegível).',
    statusPaciente: 'RECUSOU',
    proximoConvocado: proximo?.pacienteId ?? null,
  };
}

// ====================================================================
// Capacidade / vagas por procedimento/dia (seção 4.8)
// ====================================================================

export interface VagasInfo {
  definido: boolean;
  capacidadeTotal: number | null;
  confirmados: number;
  convocados: number;
  disponiveis: number | null; // null quando a capacidade não foi definida
}

/** Uso atual de um grupo (confirmados ocupam vaga; convocados a reservam). */
async function contarUso(
  unidadeId: string | null,
  grupo: string,
  dataAgendada: Date | null
): Promise<{ confirmados: number; convocados: number }> {
  const entries = await prisma.queueEntry.findMany({
    where: {
      unidadeId: unidadeId ?? undefined,
      ...(dataAgendada ? { dataAgendada } : {}),
      statusPaciente: { in: ['CONVOCADO', 'CONFIRMADO', 'RECONFIRMADO'] },
    },
  });
  const doGrupo = entries.filter((e) => grupoDe(e) === grupo);
  return {
    confirmados: doGrupo.filter((e) => e.statusPaciente === 'CONFIRMADO' || e.statusPaciente === 'RECONFIRMADO').length,
    convocados: doGrupo.filter((e) => e.statusPaciente === 'CONVOCADO').length,
  };
}

export async function vagasInfo(
  unidadeId: string | null,
  grupo: string,
  dataAgendada: Date | null
): Promise<VagasInfo> {
  const slot =
    unidadeId && dataAgendada
      ? await prisma.slotAgenda.findUnique({
          where: { unidadeId_procedimento_data: { unidadeId, procedimento: grupo, data: dataAgendada } },
        })
      : null;
  const { confirmados, convocados } = await contarUso(unidadeId, grupo, dataAgendada);
  if (!slot) {
    return { definido: false, capacidadeTotal: null, confirmados, convocados, disponiveis: null };
  }
  return {
    definido: true,
    capacidadeTotal: slot.capacidadeTotal,
    confirmados,
    convocados,
    disponiveis: Math.max(0, slot.capacidadeTotal - confirmados - convocados),
  };
}

/**
 * Há vaga para convocar mais um paciente? Quando a capacidade não foi definida,
 * NÃO bloqueia (retorna true) — o regulador é alertado em separado (seção 4.8).
 * Quando definida, exige disponiveis > 0.
 */
export async function temVaga(unidadeId: string | null, grupo: string, dataAgendada: Date | null): Promise<boolean> {
  const info = await vagasInfo(unidadeId, grupo, dataAgendada);
  if (!info.definido) return true;
  return (info.disponiveis ?? 0) > 0;
}

// ====================================================================
// Convocação automática do próximo da fila (seção 4.6)
// ====================================================================

/** Busca o próximo `AGUARDANDO` do grupo, ordenado por urgência e FIFO. */
export async function proximoElegivel(
  unidadeId: string | null,
  grupo: string,
  dataAgendada: Date | null
): Promise<QueueEntry | null> {
  const candidatos = await prisma.queueEntry.findMany({
    where: {
      unidadeId: unidadeId ?? undefined,
      statusPaciente: 'AGUARDANDO',
      ...(dataAgendada ? { dataAgendada } : {}),
    },
  });
  const doGrupo = candidatos.filter((c) => grupoDe(c) === grupo);
  if (doGrupo.length === 0) return null;
  return ordenarFila(doGrupo)[0];
}

/**
 * Convoca o próximo paciente `AGUARDANDO` do grupo. Respeita o horário de
 * operação: fora do horário, adia (retorna null) — o cron recupera depois.
 */
export async function convocarProximo(
  unidadeId: string | null,
  grupo: string,
  dataAgendada: Date | null
): Promise<QueueEntry | null> {
  const config = await getConfig(unidadeId);
  if (!dentroDoHorario(config)) {
    console.log(`[Confirmacao] Convocação adiada (fora do horário de operação) grupo="${grupo}".`);
    return null;
  }

  const proximo = await proximoElegivel(unidadeId, grupo, dataAgendada);
  if (!proximo) {
    console.log(`[Confirmacao] Nenhum paciente AGUARDANDO para convocar no grupo "${grupo}".`);
    return null;
  }

  // Verifica capacidade/vagas (seção 4.6.4). Capacidade indefinida não bloqueia.
  if (!(await temVaga(unidadeId, grupo, dataAgendada))) {
    console.log(`[Confirmacao] Sem vagas disponíveis no grupo "${grupo}" — convocação não realizada.`);
    return null;
  }

  await dispararEtapa({ entry: proximo, etapa: 1, config, tipo: 'CONVOCACAO' });
  return proximo;
}

/**
 * Recupera convocações adiadas fora do horário: para grupos que têm pacientes
 * AGUARDANDO, ninguém CONVOCADO e ao menos uma saída negativa (vaga aberta),
 * convoca o próximo. Chamado pelo cron dentro do horário de operação.
 */
export async function recuperarConvocacoesAdiadas(unidadeId: string | null): Promise<number> {
  const entries = await prisma.queueEntry.findMany({
    where: { unidadeId: unidadeId ?? undefined },
  });

  // Agrupa por (grupo + data).
  const grupos = new Map<string, QueueEntry[]>();
  for (const e of entries) {
    const chave = `${grupoDe(e)}__${e.dataAgendada?.toISOString() ?? 'sem-data'}`;
    const arr = grupos.get(chave) ?? [];
    arr.push(e);
    grupos.set(chave, arr);
  }

  let convocados = 0;
  for (const [, arr] of grupos) {
    const temConvocado = arr.some((e) => e.statusPaciente === 'CONVOCADO');
    const temAguardando = arr.some((e) => e.statusPaciente === 'AGUARDANDO');
    const vagaAberta = arr.some((e) =>
      ['RECUSOU', 'NAO_RESPONDEU', 'CANCELADO'].includes(e.statusPaciente)
    );
    if (!temConvocado && temAguardando && vagaAberta) {
      const ref = arr[0];
      const proximo = await convocarProximo(unidadeId, grupoDe(ref), ref.dataAgendada);
      if (proximo) convocados++;
    }
  }
  return convocados;
}

// ====================================================================
// Timeouts e reenvios (cron 7.1)
// ====================================================================

export async function verificarTimeouts(agora: Date = new Date()): Promise<{ reenviados: number; naoResponderam: number }> {
  const vencidos = await prisma.cicloConfirmacao.findMany({
    where: { status: 'CONVOCADO', expiraEm: { lt: agora } },
  });

  let reenviados = 0;
  let naoResponderam = 0;

  for (const ciclo of vencidos) {
    const entry = await prisma.queueEntry.findUnique({ where: { id: ciclo.queueEntryId } });
    if (!entry) continue;
    const config = await getConfig(entry.unidadeId);

    // Só age dentro do horário de operação (seção 4.10).
    if (!dentroDoHorario(config, agora)) continue;

    if (ciclo.tentativa <= config.qtdReenvios) {
      // Ainda há reenvios: expira o ciclo atual e dispara novo com tentativa+1.
      await prisma.cicloConfirmacao.update({ where: { id: ciclo.id }, data: { status: 'EXPIRADO' } });
      await dispararEtapa({ entry, etapa: ciclo.etapa, tentativa: ciclo.tentativa + 1, config, tipo: 'CONFIRMACAO' });
      reenviados++;
    } else {
      // Esgotou as tentativas → NAO_RESPONDEU + score + convoca próximo.
      await prisma.cicloConfirmacao.update({ where: { id: ciclo.id }, data: { status: 'EXPIRADO' } });
      await prisma.queueEntry.update({
        where: { id: entry.id },
        data: { statusPaciente: 'NAO_RESPONDEU', status: 'EXPIRED' },
      });
      await atualizarScore(entry.pacienteId, entry.unidadeId, 'NAO_RESPONDEU', null, entry.id);
      await convocarProximo(entry.unidadeId, grupoDe(entry), entry.dataAgendada);
      naoResponderam++;
    }
  }

  // Recupera convocações adiadas para todos os municípios com config/fila ativa.
  const unidades = await prisma.queueEntry.findMany({
    where: { statusPaciente: { in: ['AGUARDANDO', 'RECUSOU', 'NAO_RESPONDEU', 'CANCELADO'] } },
    distinct: ['unidadeId'],
    select: { unidadeId: true },
  });
  for (const u of unidades) {
    await recuperarConvocacoesAdiadas(u.unidadeId);
  }

  return { reenviados, naoResponderam };
}

// ====================================================================
// Disparos programados diários (cron 7.2)
// ====================================================================

/** Distância em dias inteiros entre hoje e a data agendada (>= 0). */
function diasAte(dataAgendada: Date, agora: Date): number {
  const d0 = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
  const d1 = Date.UTC(dataAgendada.getUTCFullYear(), dataAgendada.getUTCMonth(), dataAgendada.getUTCDate());
  return Math.round((d1 - d0) / 86_400_000);
}

export async function dispararProgramados(agora: Date = new Date()): Promise<number> {
  const aguardando = await prisma.queueEntry.findMany({
    where: { statusPaciente: 'AGUARDANDO', dataAgendada: { not: null } },
  });

  let disparos = 0;
  for (const entry of aguardando) {
    if (!entry.dataAgendada) continue;
    const config = await getConfig(entry.unidadeId);
    if (!dentroDoHorario(config, agora)) continue;

    const dias = diasAte(entry.dataAgendada, agora);
    if (dias < 0) continue; // consulta no passado
    if (!config.diasAntesConfirmacao.includes(dias)) continue;

    // Respeita a capacidade do slot (capacidade indefinida não bloqueia).
    if (!(await temVaga(entry.unidadeId, grupoDe(entry), entry.dataAgendada))) continue;

    // Evita duplicar disparo no mesmo dia para a mesma entrada.
    const jaDisparadoHoje = await prisma.cicloConfirmacao.findFirst({
      where: {
        queueEntryId: entry.id,
        enviadoEm: { gte: new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate())) },
      },
    });
    if (jaDisparadoHoje) continue;

    await dispararEtapa({ entry, etapa: 1, config, tipo: 'CONFIRMACAO' });
    disparos++;
  }
  return disparos;
}

// ====================================================================
// Ações manuais do regulador (seção 4.1)
// ====================================================================

/** Convoca o próximo AGUARDANDO da fila do município (respeitando a ordem). */
export async function dispararManualProximo(unidadeId: string | null): Promise<QueueEntry | null> {
  const config = await getConfig(unidadeId);
  const candidatos = await prisma.queueEntry.findMany({
    where: { unidadeId: unidadeId ?? undefined, statusPaciente: 'AGUARDANDO' },
  });
  if (candidatos.length === 0) return null;

  const proximo = ordenarFila(candidatos)[0];
  await dispararEtapa({ entry: proximo, etapa: 1, config, tipo: 'CONFIRMACAO' });
  return proximo;
}

/** Convoca uma entrada específica, validando que é a próxima elegível do grupo. */
export async function convocarEntrada(unidadeId: string | null, queueEntryId: string): Promise<QueueEntry> {
  const entry = await prisma.queueEntry.findUnique({ where: { id: queueEntryId } });
  if (!entry) throw new Error('Entrada da fila não encontrada.');
  // REGULADOR é central do município — não bloqueia por unidade do usuário.
  void unidadeId;
  if (entry.statusPaciente !== 'AGUARDANDO') {
    throw new Error(`Paciente não está AGUARDANDO (status=${entry.statusPaciente}).`);
  }

  const proximo = await proximoElegivel(entry.unidadeId, grupoDe(entry), entry.dataAgendada);
  if (proximo && proximo.id !== entry.id) {
    throw new Error('Não é possível pular a fila: há paciente com prioridade/ordem anterior.');
  }

  // Capacidade definida e esgotada bloqueia a convocação manual (seção 4.8).
  const info = await vagasInfo(entry.unidadeId, grupoDe(entry), entry.dataAgendada);
  if (info.definido && (info.disponiveis ?? 0) <= 0) {
    throw new Error('Sem vagas disponíveis para este procedimento/dia. Ajuste a capacidade antes de convocar.');
  }

  const config = await getConfig(entry.unidadeId);
  await dispararEtapa({ entry, etapa: 1, config, tipo: 'CONFIRMACAO' });
  return entry;
}
