import { prepararDisparo, processarOutbox, calendarDate, localDate } from './regulacaoConfiavel.service';
export { processarRespostaConfiavel as processarResposta, verificarTimeoutsConfiavel as verificarTimeouts, recuperarReposicoes as recuperarConvocacoesAdiadas } from './regulacaoConfiavel.service';
import prisma from '../config/prisma';
import { getMessagingGateway } from './messaging';
import type {
  QueueEntry,
  ConfiguracaoRegulacao,
  Paciente,
  MotivoRecusa,
  PacienteFilaStatus,
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
  templateConfirmacao: 'convocacao_vaga',
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

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

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

export function ordenarFila<T extends { nivelUrgencia: string; posicao: number }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.posicao - b.posicao);
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
  agora?: Date;
}

export async function dispararEtapa(opts: DispararOpts & { anteriorId?: string }) {
  const ciclo = await prepararDisparo(opts);
  await processarOutbox(ciclo.callbackId);
  return prisma.cicloConfirmacao.findUniqueOrThrow({ where: { id: ciclo.id } });
}

// ====================================================================
// Processamento da resposta do paciente (callback do ChatBot / simulação)
// ====================================================================

export interface RespostaPayload {
  resposta?: 'SIM' | 'NAO';
  eventId?: string;
  eventType?: 'RESPOSTA' | 'MOTIVO' | 'DELIVERY';
  deliveryStatus?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'ACCEPTED';
  error?: string;
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
    disponiveis: Math.max(0, slot.capacidadeTotal - slot.ocupadas),
  };
}

/**
 * Há vaga para convocar mais um paciente? Quando a capacidade não foi definida,
 * bloqueia o disparo até o regulador definir as vagas.
 * Quando definida, exige disponiveis > 0.
 */
export async function temVaga(unidadeId: string | null, grupo: string, dataAgendada: Date | null): Promise<boolean> {
  const info = await vagasInfo(unidadeId, grupo, dataAgendada);
  if (!info.definido) return false;
  return (info.disponiveis ?? 0) > 0;
}

// ====================================================================
// Convocação automática do próximo da fila (seção 4.6)
// ====================================================================

/** Busca o próximo `AGUARDANDO` do grupo, ordenado exclusivamente pela posição original. */
export async function proximoElegivel(
  unidadeId: string | null,
  grupo: string,
  dataAgendada: Date | null
): Promise<QueueEntry | null> {
  const candidatos = await prisma.queueEntry.findMany({
    where: {
      unidadeId: unidadeId ?? undefined,
      statusPaciente: 'AGUARDANDO', bloqueioEnvio: null,
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

  // Verifica capacidade/vagas (seção 4.6.4). Capacidade indefinida bloqueia.
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
// ====================================================================
// Timeouts e reenvios (cron 7.1)
// ====================================================================

// ====================================================================
// Disparos programados diários (cron 7.2)
// ====================================================================

/** Distância em dias inteiros entre hoje e a data agendada (>= 0). */
function diasAte(dataAgendada: Date, agora: Date, timezone: string): number {
  const d0 = new Date(`${localDate(agora, timezone)}T00:00:00Z`).getTime();
  const d1 = Date.UTC(dataAgendada.getUTCFullYear(), dataAgendada.getUTCMonth(), dataAgendada.getUTCDate());
  return Math.round((d1 - d0) / 86_400_000);
}

export async function dispararProgramados(agora: Date = new Date()): Promise<number> {
  let disparos = 0;

  // 1. Etapa 1: Convocação / Confirmação inicial para pacientes AGUARDANDO (ex: 7 dias antes)
  const aguardando = await prisma.queueEntry.findMany({
    where: { statusPaciente: 'AGUARDANDO', bloqueioEnvio: null, dataAgendada: { not: null } },
  });

  for (const entry of ordenarFila(aguardando)) {
    if (!entry.dataAgendada) continue;
    const config = await getConfig(entry.unidadeId);
    if (!dentroDoHorario(config, agora)) continue;

    const dias = diasAte(entry.dataAgendada, agora, config.timezone);
    if (dias < 0) continue; // consulta no passado
    if (!config.diasAntesConfirmacao.includes(dias)) continue;

    // Respeita a capacidade do slot (capacidade ausente impede disparos).
    if (!(await temVaga(entry.unidadeId, grupoDe(entry), entry.dataAgendada))) continue;

    // Evita duplicar disparo no mesmo dia para a mesma entrada.
    const jaDisparadoHoje = await prisma.cicloConfirmacao.findFirst({
      where: {
        queueEntryId: entry.id,
        enviadoEm: { gte: new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate())) },
      },
    });
    if (jaDisparadoHoje) continue;

    try { await dispararEtapa({ entry, etapa: 1, config, tipo: 'CONFIRMACAO', agora }); disparos++; } catch (err) { console.error('[Confirmacao] Agenda não disparada:', err); }
  }

  // 2. Etapa 2: Reconfirmação da véspera (1 dia antes) para pacientes CONFIRMADOS
  const confirmados = await prisma.queueEntry.findMany({
    where: { statusPaciente: 'CONFIRMADO', dataAgendada: { not: null } },
  });

  for (const entry of confirmados) {
    if (!entry.dataAgendada) continue;
    const config = await getConfig(entry.unidadeId);
    if (config.qtdConfirmacoes < 2) continue; // município configurado apenas com 1 confirmação
    if (!dentroDoHorario(config, agora)) continue;

    const dias = diasAte(entry.dataAgendada, agora, config.timezone);
    // Véspera da consulta (1 dia antes ou menor dia configurado)
    const diaReconfirmacao = Math.min(...config.diasAntesConfirmacao);
    if (dias !== diaReconfirmacao && dias !== 1) continue;

    // Evita duplicar disparo no mesmo dia para a mesma entrada
    const jaDisparadoHoje = await prisma.cicloConfirmacao.findFirst({
      where: {
        queueEntryId: entry.id,
        enviadoEm: { gte: new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate())) },
      },
    });
    if (jaDisparadoHoje) continue;

    try { await dispararEtapa({ entry, etapa: 2, config, tipo: 'CONFIRMACAO', agora }); disparos++; } catch (err) { console.error('[Confirmacao] Reconfirmação não disparada:', err); }
  }

  return disparos;
}

// ====================================================================
// Lembretes 4 horas antes do agendamento (cron 7.3)
// ====================================================================

export async function verificarLembretes4Horas(agora: Date = new Date()): Promise<number> {
  const hojeInicio = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
  const hojeFim = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(), 23, 59, 59, 999));

  const elegiveis = await prisma.queueEntry.findMany({
    where: {
      statusPaciente: { in: ['CONFIRMADO', 'RECONFIRMADO'] },
      dataAgendada: { not: null },
      lembreteEnviadoEm: null,
    },
  });

  let enviados = 0;
  for (const entry of elegiveis) {
    const config = await getConfig(entry.unidadeId);
    if (!dentroDoHorario(config, agora)) continue;

    // Se não tiver hora agendada válida, não é possível calcular a antecedência de 4h
    if (!entry.horaAgendada || !HHMM.test(entry.horaAgendada)) {
      continue;
    }

    const [hStr, mStr] = entry.horaAgendada.split(':');
    const minConsulta = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);

    const hhmmAtual = horaLocal(config.timezone, agora);
    const [hAtual, mAtual] = hhmmAtual.split(':').map(Number);
    const minAtual = hAtual * 60 + mAtual;

    const diffMinutos = minConsulta - minAtual;
    // Dispara quando faltar 4 horas ou menos (entre 0 e 240 minutos antes da consulta)
    if (diffMinutos > 240 || diffMinutos < 0) {
      continue;
    }

    try {
      const ciclo = await prepararDisparo({ entry, etapa: config.qtdConfirmacoes, config, tipo: 'LEMBRETE', agora });
      await processarOutbox(ciclo.callbackId); enviados++;
    } catch (err) { console.error('[Confirmacao] Lembrete pendente:', err); }
  }

  return enviados;
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

/** Convoca uma entrada específica escolhida manualmente pelo Regulador. */
export async function convocarEntrada(unidadeId: string | null, queueEntryId: string): Promise<QueueEntry> {
  const entry = await prisma.queueEntry.findUnique({ where: { id: queueEntryId } });
  if (!entry) throw new Error('Entrada da fila não encontrada.');
  // REGULADOR é central do município — não bloqueia por unidade do usuário.
  void unidadeId;
  const config = await getConfig(entry.unidadeId);
  if (['CONVOCADO','CONFIRMADO','RECONFIRMADO'].includes(entry.statusPaciente)) {
    const anterior = await prisma.cicloConfirmacao.findFirst({ where: { queueEntryId, status: 'CONVOCADO' }, orderBy: { enviadoEm: 'desc' } });
    if (anterior?.deliveryStatus === 'FAILED') {
      const tipo = anterior.tipo as 'CONFIRMACAO' | 'CONVOCACAO' | 'LEMBRETE';
      const ciclo = await prepararDisparo({ entry, etapa: anterior.etapa, tentativa: anterior.tentativa, config, tipo, anteriorId: anterior.id });
      await processarOutbox(ciclo.callbackId);
      return entry;
    }
  }
  if (entry.statusPaciente !== 'AGUARDANDO') {
    throw new Error(`Paciente não está AGUARDANDO (status=${entry.statusPaciente}).`);
  }

  // Capacidade definida e esgotada bloqueia a convocação manual (seção 4.8).
  const info = await vagasInfo(entry.unidadeId, grupoDe(entry), entry.dataAgendada);
  if (info.definido && (info.disponiveis ?? 0) <= 0) {
    throw new Error('Sem vagas disponíveis para este procedimento/dia. Ajuste a capacidade antes de convocar.');
  }

  await dispararEtapa({ entry, etapa: 1, config, tipo: 'CONVOCACAO' });
  return entry;
}

/** Preenche somente as vagas disponíveis em cada agenda, pela posição da fila. */
export async function convocarTodosService(
  unidadeId: string | null,
  procedureName?: string,
  dataAgendada?: Date | null
): Promise<{ total: number; convocados: number; falhas: number }> {
  const config = await getConfig(unidadeId);
  const candidatos = await prisma.queueEntry.findMany({
    where: {
      unidadeId: unidadeId ?? undefined,
      statusPaciente: 'AGUARDANDO', bloqueioEnvio: null,
      ...(dataAgendada ? { dataAgendada } : {}),
    },
  });

  const doGrupo = procedureName
    ? candidatos.filter((c) => (c.procedimentoNome || '').toLowerCase() === procedureName.toLowerCase())
    : candidatos;

  let convocados = 0;
  let falhas = 0;

  for (const entry of ordenarFila(doGrupo)) {
    try {
      if (!(await temVaga(entry.unidadeId, grupoDe(entry), entry.dataAgendada))) continue;
      await dispararEtapa({ entry, etapa: 1, config: await getConfig(entry.unidadeId), tipo: 'CONVOCACAO' });
      convocados++;
    } catch (err) {
      console.error(`Falha ao convocar entrada ${entry.id}:`, err);
      falhas++;
    }
  }

  return { total: doGrupo.length, convocados, falhas };
}
