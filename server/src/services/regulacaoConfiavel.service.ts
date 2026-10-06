import { randomUUID } from 'crypto';
import prisma from '../config/prisma';
import { getMessagingGateway } from './messaging';
import type { ConfigResolvida } from './confirmacao.service';
import { getConfig, dentroDoHorario, convocarProximo, calcularNovoScore, DELTA_SCORE, grupoDe, type RespostaPayload, type ResultadoResposta } from './confirmacao.service';
import type { QueueEntry, Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;
export function calendarDate(date: Date): string { return date.toISOString().slice(0, 10); }
export function localDate(now: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function parseCalendarDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const iso = /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? value.split('/').reverse().join('-') : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  return !isNaN(date.getTime()) && calendarDate(date) === iso ? date : null;
}
export function validPhone(value: string | null | undefined): boolean {
  return /^(?:55)?\d{2}9\d{8}$/.test((value || '').replace(/\D/g, ''));
}
export async function lockAgenda(tx: Tx, entry: QueueEntry) {
  if (!entry.unidadeId || !entry.dataAgendada) throw new Error('Informe unidade responsável, procedimento e data da agenda.');
  const procedimento = entry.procedimentoNome || entry.procedimentoId || 'Regulação';
  const slots = await tx.$queryRaw<Array<{ id: string; ocupadas: number; capacidade_total: number }>>`
    SELECT id, ocupadas, capacidade_total FROM slots_agenda
    WHERE unidade_id=${entry.unidadeId} AND procedimento=${procedimento} AND data=${entry.dataAgendada}::date FOR UPDATE`;
  if (!slots[0]) throw new Error('Defina a capacidade desta agenda antes de convocar.');
  return slots[0];
}

export async function prepararDisparo(opts: {
  entry: QueueEntry; etapa: number; tentativa?: number; config: ConfigResolvida;
  tipo: 'CONFIRMACAO' | 'CONVOCACAO' | 'LEMBRETE'; anteriorId?: string; agora?: Date;
}) {
  const { config, etapa, tipo } = opts;
  const agora = opts.agora || new Date();
  if (!dentroDoHorario(config, agora)) throw new Error('Fora do horário permitido para disparos.');
  const callbackId = randomUUID();
  return prisma.$transaction(async (tx) => {
    const slot = await lockAgenda(tx, opts.entry);
    await tx.$queryRaw`SELECT id FROM queue_entries WHERE id=${opts.entry.id} FOR UPDATE`;
    const entry = await tx.queueEntry.findUniqueOrThrow({ where: { id: opts.entry.id } });
    if (entry.bloqueioEnvio) throw new Error(entry.bloqueioEnvio);
    if (!entry.dataAgendada || calendarDate(entry.dataAgendada) < localDate(agora, config.timezone)) {
      throw new Error('A agenda está no passado. Corrija a data antes do disparo.');
    }
    if (!entry.procedimentoNome?.trim()) throw new Error('Informe o procedimento antes de convocar.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.horaAgendada || '')) throw new Error('Informe um horário válido antes de convocar.');
    const localHour = new Intl.DateTimeFormat('en-GB', {timeZone:config.timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(agora);
    if (calendarDate(entry.dataAgendada) === localDate(agora,config.timezone) && entry.horaAgendada! <= localHour) throw new Error('O horário desta agenda já passou. Corrija a agenda antes de convocar.');
    if (tipo === 'LEMBRETE' && !['CONFIRMADO', 'RECONFIRMADO'].includes(entry.statusPaciente)) throw new Error('Lembrete exige presença confirmada.');
    if (tipo !== 'LEMBRETE' && !opts.anteriorId && etapa === 1) {
      if (entry.statusPaciente !== 'AGUARDANDO') throw new Error('Esta entrada já foi convocada.');
      if (slot.ocupadas >= slot.capacidade_total) throw new Error('Sem vagas disponíveis nesta agenda.');
      const primeiro = await tx.queueEntry.findFirst({
        where: { unidadeId: entry.unidadeId, procedimentoNome: entry.procedimentoNome, dataAgendada: entry.dataAgendada, statusPaciente: 'AGUARDANDO', bloqueioEnvio: null },
        orderBy: [{ posicao: 'asc' }, { criadoEm: 'asc' }, { id: 'asc' }],
      });
      if (primeiro?.id !== entry.id) throw new Error('Convoque primeiro o paciente anterior na ordem da fila.');
    }
    if (opts.anteriorId) {
      const anterior = await tx.cicloConfirmacao.findUniqueOrThrow({ where: { id: opts.anteriorId } });
      if (anterior.status !== 'CONVOCADO' || (tipo === 'LEMBRETE' ? !['CONFIRMADO','RECONFIRMADO'].includes(entry.statusPaciente) : entry.statusPaciente !== 'CONVOCADO')) throw new Error('Tentativa já resolvida.');
      await tx.cicloConfirmacao.update({ where: { id: anterior.id }, data: { status: 'EXPIRADO' } });
    } else if (await tx.cicloConfirmacao.findFirst({ where: { queueEntryId: entry.id, status: 'CONVOCADO' } })) {
      throw new Error('Já existe um envio pendente para este agendamento.');
    }
    const paciente = await tx.paciente.findUniqueOrThrow({ where: { id: entry.pacienteId } });
    if (!paciente.nomeCompleto?.trim() || paciente.nomeCompleto.trim().length < 3) throw new Error('Corrija o nome do paciente antes de convocar.');
    if (!paciente.dataNascimento || isNaN(paciente.dataNascimento.getTime()) || paciente.dataNascimento > agora) throw new Error('Corrija o nascimento do paciente antes de convocar.');
    if (!/^\d{15}$/.test((paciente.cartaoSus || '').replace(/\D/g,''))) {
      const origem = await tx.pdfImportRow.findFirst({ where: { queueEntryId: entry.id } });
      if (!/^\d{6,10}$/.test(String((origem?.rawData as any)?.ficha || ''))) throw new Error('Corrija a identificação do paciente antes de convocar.');
    }
    const telefone = validPhone(paciente.celular) ? paciente.celular! : paciente.telefone;
    if (!validPhone(telefone)) throw new Error('Corrija o celular do paciente antes de convocar.');
    if (!entry.localAtendimento?.trim()) throw new Error('Informe o local do atendimento antes de convocar.');
    const templateName = tipo === 'LEMBRETE' ? 'lembrete_consulta' : tipo === 'CONVOCACAO' ? config.templateConvocacao : etapa === 1 ? config.templateConfirmacao : config.templateReconfirmacao;
    const enviadoEm = agora;
    const expiraEm = new Date(enviadoEm.getTime() + config.timeoutRespostaHoras * 3600000);
    if (tipo !== 'LEMBRETE') await tx.queueEntry.update({ where: { id: entry.id }, data: { statusPaciente: 'CONVOCADO', status: 'AWAITING_RESPONSE', notificadoEm: enviadoEm, expiraEm } });
    const ciclo = await tx.cicloConfirmacao.create({ data: {
      queueEntryId: entry.id, unidadeId: entry.unidadeId, etapa, tentativa: opts.tentativa ?? 1,
      status: 'CONVOCADO', tipo, deliveryStatus: 'QUEUED', templateName, callbackId, enviadoEm, expiraEm,
    } });
    await tx.regulacaoOutbox.create({ data: { callbackId, queueEntryId: entry.id, payload: {
      tipo, telefone: (telefone || '').replace(/\D/g, ''), nomePaciente: paciente.nomeCompleto,
      procedimento: entry.procedimentoNome || entry.procedimentoId || 'Regulação',
      dataAgendada: calendarDate(entry.dataAgendada).split('-').reverse().join('/'),
      horaAgendada: entry.horaAgendada, local: entry.localAtendimento, templateName, callbackId,
      queueEntryId: entry.id, pacienteId: paciente.id, expiresAt: expiraEm.toISOString(),
    } as Prisma.InputJsonValue } });
    await tx.messageLog.create({ data: { queueEntryId: entry.id, pacienteId: paciente.id, direction: 'OUTBOUND', status: 'QUEUED', templateName, rawPayload: { callbackId } } });
    if (tipo === 'LEMBRETE') await tx.queueEntry.update({ where: { id: entry.id }, data: { lembreteEnviadoEm: enviadoEm } });
    return ciclo;
  }, { timeout: 15000 });
}

export async function processarOutbox(callbackId?: string) {
  // A crash after claiming is uncertain, not permission to send again.
  await prisma.regulacaoOutbox.updateMany({ where: { status: 'SENDING', atualizadoEm: { lt: new Date(Date.now() - 120000) } }, data: { status: 'UNKNOWN', error: 'Envio interrompido; aguardando conciliação.' } });
  const itens = await prisma.regulacaoOutbox.findMany({ where: { ...(callbackId ? { callbackId } : {}), status: { in: ['PENDING', 'UNKNOWN'] } }, orderBy: { criadoEm: 'asc' }, take: 30 });
  for (const item of itens) {
    if (item.status === 'UNKNOWN') {
      try {
        const gateway = getMessagingGateway();
        if (!gateway.consultarEnvio) continue;
        const resultado = await gateway.consultarEnvio(item.callbackId);
        if (!resultado || ['SENDING', 'UNKNOWN'].includes(resultado.status)) continue;
        if (resultado.status === 'NOT_FOUND') { await prisma.regulacaoOutbox.update({ where: { id: item.id }, data: { status: 'PENDING' } }); continue; }
        await concluirEnvio(item, resultado.messageId, resultado.status);
      } catch { /* Keep reservation until provider state is known. */ }
      continue;
    }
    const pendingCycle = await prisma.cicloConfirmacao.findUnique({ where: { callbackId: item.callbackId } });
    if (pendingCycle && !dentroDoHorario(await getConfig(pendingCycle.unidadeId))) continue;
    const claimed = await prisma.regulacaoOutbox.updateMany({ where: { id: item.id, status: 'PENDING' }, data: { status: 'SENDING', attempts: { increment: 1 } } });
    if (!claimed.count) continue;
    const ciclo = await prisma.cicloConfirmacao.findUnique({ where: { callbackId: item.callbackId } });
    if (!ciclo || ciclo.status !== 'CONVOCADO') { await prisma.regulacaoOutbox.update({ where: { id: item.id }, data: { status: 'CANCELLED' } }); continue; }
    try {
      const gateway = getMessagingGateway();
      const payload = item.payload as any;
      const result = payload.tipo === 'LEMBRETE' ? await gateway.enviarLembrete(payload) : payload.tipo === 'CONVOCACAO' ? await gateway.enviarConvocacao(payload) : await gateway.enviarConfirmacao(payload);
      await concluirEnvio(item, result.messageId, result.status);
    } catch (err: any) {
      const status = err.definitive ? 'FAILED' : 'UNKNOWN';
      await prisma.$transaction([
        prisma.regulacaoOutbox.update({ where: { id: item.id }, data: { status, error: err.message } }),
        prisma.cicloConfirmacao.update({ where: { callbackId: item.callbackId }, data: { deliveryStatus: status, envioErro: err.message } }),
        prisma.messageLog.updateMany({ where: { queueEntryId: item.queueEntryId, rawPayload: { path: ['callbackId'], equals: item.callbackId } }, data: { status: status === 'FAILED' ? 'FAILED' : 'QUEUED', error: err.message } }),
      ]);
    }
  }
}

async function concluirEnvio(item: { id: string; callbackId: string; queueEntryId: string }, messageId: string, providerStatus: string) {
  const state = providerStatus === 'FAILED' ? 'FAILED' : providerStatus === 'UNKNOWN' || providerStatus === 'SENDING' ? 'UNKNOWN' : 'ACCEPTED';
  await prisma.$transaction(async (tx) => {
    await tx.regulacaoOutbox.update({ where: { id: item.id }, data: { status: state, error: state === 'FAILED' ? 'Provedor recusou o envio.' : null } });
    const ciclo = await tx.cicloConfirmacao.findUniqueOrThrow({ where: { callbackId: item.callbackId } });
    // Delivery webhooks may beat the HTTP response; never downgrade them.
    await tx.cicloConfirmacao.update({ where: { id: ciclo.id }, data: { messageId, ...(ciclo.deliveryStatus === 'QUEUED' || ciclo.deliveryStatus === 'UNKNOWN' ? { deliveryStatus: state } : {}) } });
    await tx.messageLog.updateMany({ where: { queueEntryId: item.queueEntryId, rawPayload: { path: ['callbackId'], equals: item.callbackId }, status: 'QUEUED' }, data: { wamid: messageId || null, status: state === 'FAILED' ? 'FAILED' : state === 'UNKNOWN' ? 'QUEUED' : 'SENT' } });
  });
}

export async function processarRespostaConfiavel(callbackId: string, payload: RespostaPayload): Promise<ResultadoResposta> {
  const inicial = await prisma.cicloConfirmacao.findUnique({ where: { callbackId } });
  if (!inicial) return { ok: false, mensagem: 'callbackId não encontrado.' };
  const referencia = await prisma.queueEntry.findUnique({ where: { id: inicial.queueEntryId } });
  if (!referencia) return { ok: false, mensagem: 'Entrada da fila não encontrada.' };
  const config = await getConfig(referencia.unidadeId);
  let reporVaga = false;
  const result = await prisma.$transaction(async tx => {
    await lockAgenda(tx, referencia);
    await tx.$queryRaw`SELECT id FROM queue_entries WHERE id=${referencia.id} FOR UPDATE`;
    const ciclo = await tx.cicloConfirmacao.findUniqueOrThrow({ where: { callbackId } });
    const entry = await tx.queueEntry.findUniqueOrThrow({ where: { id: referencia.id } });
    if (payload.eventId) {
      const inserted = await tx.$queryRaw<Array<{ event_id: string }>>`INSERT INTO regulacao_eventos(event_id,callback_id) VALUES(${payload.eventId},${callbackId}) ON CONFLICT DO NOTHING RETURNING event_id`;
      if (!inserted.length) return { ok: true, mensagem: 'Evento já processado.', statusPaciente: entry.statusPaciente };
    }
    if (payload.eventType === 'DELIVERY') {
      const status = payload.deliveryStatus!;
      const rank: Record<string, number> = { QUEUED: 0, UNKNOWN: 0, ACCEPTED: 1, SENT: 1, DELIVERED: 2, READ: 3, FAILED: 4 };
      if ((rank[status] ?? 0) >= (rank[ciclo.deliveryStatus] ?? 0)) {
        const eventTime = payload.timestamp ? new Date(payload.timestamp) : new Date();
        const deliveredAt = ciclo.deliveredAt || (['DELIVERED','READ'].includes(status) ? (!isNaN(eventTime.getTime()) && eventTime.getTime() <= Date.now() + 60000 ? eventTime : new Date()) : null);
        await tx.cicloConfirmacao.update({ where: { id: ciclo.id }, data: { deliveryStatus: status, deliveredAt, envioErro: payload.error || null, ...(deliveredAt && !ciclo.deliveredAt ? { expiraEm: new Date(deliveredAt.getTime()+config.timeoutRespostaHoras*3600000) } : {}) } });
        await tx.messageLog.updateMany({ where: { queueEntryId: entry.id, rawPayload: { path: ['callbackId'], equals: callbackId } }, data: { status: status === 'ACCEPTED' ? 'SENT' : status as any, error: payload.error || null } });
      }
      return { ok: true, mensagem: 'Status de entrega registrado.', statusPaciente: entry.statusPaciente };
    }
    if (ciclo.status === 'RECUSADO' || payload.eventType === 'MOTIVO') {
      if (ciclo.status !== 'RECUSADO') throw Object.assign(new Error('Recusa ainda não registrada.'), { resultado: { ok: false, mensagem: 'Recusa ainda não registrada.' } });
      if (payload.resposta === 'SIM') throw Object.assign(new Error('Vaga liberada.'), { resultado: { ok: false, mensagem: 'Esta vaga já foi liberada após desistência.' } });
      await tx.cicloConfirmacao.update({ where: { id: ciclo.id }, data: { motivoRecusa: payload.motivoRecusa ?? ciclo.motivoRecusa, motivoTextoLivre: payload.motivoTextoLivre ?? ciclo.motivoTextoLivre } });
      await tx.historicoAbsenteismo.updateMany({ where: { queueEntryId: entry.id, tipo: 'RECUSOU' }, data: { motivo: payload.motivoRecusa || payload.motivoTextoLivre || null } });
      return { ok: true, mensagem: 'Recusa e motivo registrados.', statusPaciente: entry.statusPaciente };
    }
    if (ciclo.status === 'CONFIRMADO') { if (payload.resposta === 'NAO') throw Object.assign(new Error('Ciclo encerrado.'), { resultado: { ok: false, mensagem: 'Responda ao lembrete ou solicite cancelamento à regulação.' } }); return { ok: true, mensagem: 'Presença já confirmada.', statusPaciente: entry.statusPaciente }; }
    if (ciclo.status !== 'CONVOCADO') throw Object.assign(new Error('Tentativa encerrada.'), { resultado: { ok: false, mensagem: 'Tentativa expirada ou substituída. Esta resposta não altera a vaga.' } });
    if (!['CONVOCADO','CONFIRMADO','RECONFIRMADO'].includes(entry.statusPaciente)) throw Object.assign(new Error('Vaga liberada.'), { resultado: { ok: false, mensagem: 'A vaga deste paciente já foi liberada.' } });
    const agora = new Date(), recusou = payload.resposta === 'NAO';
    await tx.cicloConfirmacao.update({ where: { id: ciclo.id }, data: { status: recusou ? 'RECUSADO' : 'CONFIRMADO', respondidoEm: agora, resposta: payload.resposta, motivoRecusa: payload.motivoRecusa, motivoTextoLivre: payload.motivoTextoLivre } });
    const statusFinal = recusou ? 'RECUSOU' : ciclo.tipo === 'LEMBRETE' ? entry.statusPaciente : ciclo.etapa >= config.qtdConfirmacoes ? 'RECONFIRMADO' : 'CONFIRMADO';
    await tx.queueEntry.update({ where: { id: entry.id }, data: { statusPaciente: statusFinal, status: recusou ? 'DECLINED' : 'CONFIRMED', respondidoEm: agora } });
    await tx.cicloConfirmacao.updateMany({ where: { queueEntryId: entry.id, status: 'CONVOCADO', id: { not: ciclo.id } }, data: { status: 'EXPIRADO' } });
    await tx.messageLog.create({ data: { queueEntryId: entry.id, pacienteId: entry.pacienteId, direction: 'INBOUND', status: 'RECEIVED', wamid: payload.wamid, body: payload.resposta, rawPayload: payload as any } });
    if (ciclo.tipo !== 'LEMBRETE' || recusou) {
      const paciente = await tx.paciente.findUniqueOrThrow({ where: { id: entry.pacienteId } });
      const tipo = recusou ? 'RECUSOU' : 'CONFIRMOU', scoreResultante = calcularNovoScore(paciente.scoreConfianca, tipo);
      await tx.paciente.update({ where: { id: paciente.id }, data: { scoreConfianca: scoreResultante } });
      await tx.historicoAbsenteismo.create({ data: { pacienteId: paciente.id, unidadeId: entry.unidadeId, queueEntryId: entry.id, tipo, delta: DELTA_SCORE[tipo], scoreResultante, motivo: payload.motivoRecusa || payload.motivoTextoLivre || null } });
    }
    reporVaga = recusou;
    return { ok: true, mensagem: recusou ? 'Desistência registrada; reposição pendente.' : 'Presença confirmada.', statusPaciente: statusFinal };
  }, { timeout: 15000 }).catch((err: any): ResultadoResposta => { if (err.resultado) return err.resultado; throw err; });
  if (result.ok && reporVaga) {
    try { await convocarProximo(referencia.unidadeId, grupoDe(referencia), referencia.dataAgendada); }
    catch (err) { console.error('[Confirmacao] Reposição persistida; será recuperada pelo scheduler.', err); }
  }
  return result;
}

export async function recuperarReposicoes(unidadeId: string | null): Promise<number> {
  const slots = await prisma.slotAgenda.findMany({ where: { ...(unidadeId ? { unidadeId } : {}), reposicaoPendente: true } });
  let total = 0;
  for (const slot of slots) {
    try {
      if (!dentroDoHorario(await getConfig(slot.unidadeId))) continue;
      const proximo = await convocarProximo(slot.unidadeId, slot.procedimento, slot.data);
      if (proximo) total++;
      const remaining = await prisma.queueEntry.count({ where: { unidadeId: slot.unidadeId, procedimentoNome: slot.procedimento, dataAgendada: slot.data, statusPaciente: 'AGUARDANDO', bloqueioEnvio: null } });
      await prisma.slotAgenda.updateMany({ where: { id: slot.id, ...(remaining ? { ocupadas: { gte: slot.capacidadeTotal } } : {}) }, data: { reposicaoPendente: false } });
    } catch (err) { console.error('[Confirmacao] Reposição pendente:', err); }
  }
  return total;
}

export async function verificarTimeoutsConfiavel(agora: Date = new Date()): Promise<{ reenviados: number; naoResponderam: number }> {
  const ciclos = await prisma.cicloConfirmacao.findMany({ where: { status: 'CONVOCADO', tipo: { not: 'LEMBRETE' }, deliveredAt: { not: null }, deliveryStatus: { in: ['DELIVERED','READ'] } } });
  let reenviados = 0, naoResponderam = 0;
  for (const ciclo of ciclos) {
    const entry = await prisma.queueEntry.findUnique({ where: { id: ciclo.queueEntryId } });
    if (!entry || entry.statusPaciente !== 'CONVOCADO') continue;
    const config = await getConfig(entry.unidadeId);
    if (!dentroDoHorario(config, agora)) continue;
    try {
      if (ciclo.tentativa <= config.qtdReenvios) {
        if (agora.getTime() < ciclo.deliveredAt!.getTime()+config.intervaloReenvioHoras*3600000) continue;
        const novo = await prepararDisparo({ entry, etapa: ciclo.etapa, tentativa: ciclo.tentativa+1, config, tipo: ciclo.tipo as 'CONFIRMACAO' | 'CONVOCACAO', anteriorId: ciclo.id, agora });
        await processarOutbox(novo.callbackId); reenviados++;
      } else if (ciclo.expiraEm < agora) {
        const changed = await prisma.$transaction(async tx => {
          await lockAgenda(tx,entry);
          const n = await tx.cicloConfirmacao.updateMany({ where: { id: ciclo.id, status: 'CONVOCADO' }, data: { status: 'EXPIRADO' } });
          if (!n.count) return false;
          const changedEntry = await tx.queueEntry.updateMany({ where: { id: entry.id, statusPaciente: 'CONVOCADO' }, data: { statusPaciente: 'NAO_RESPONDEU', status: 'EXPIRED' } });
          if (!changedEntry.count) return false;
          const paciente = await tx.paciente.findUniqueOrThrow({ where: { id: entry.pacienteId } });
          const scoreResultante = calcularNovoScore(paciente.scoreConfianca,'NAO_RESPONDEU');
          await tx.paciente.update({ where: { id: paciente.id }, data: { scoreConfianca: scoreResultante } });
          await tx.historicoAbsenteismo.create({ data: { pacienteId: paciente.id, unidadeId: entry.unidadeId, queueEntryId: entry.id, tipo: 'NAO_RESPONDEU', delta: DELTA_SCORE.NAO_RESPONDEU, scoreResultante } });
          return true;
        });
        if (changed) { naoResponderam++; await convocarProximo(entry.unidadeId,grupoDe(entry),entry.dataAgendada); }
      }
    } catch (err) { console.error('[Confirmacao] Falha isolada de tentativa:', err); }
  }
  await recuperarReposicoes(null);
  return { reenviados, naoResponderam };
}
