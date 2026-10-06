import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mock do prisma (mesmo padrão de PedidoController.test.ts) ---
vi.mock('../config/prisma', () => {
  const mock: any = {
    cicloConfirmacao: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    queueEntry: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    paciente: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
    unidade: { findUnique: vi.fn() },
    historicoAbsenteismo: { create: vi.fn(), updateMany: vi.fn() },
    messageLog: { create: vi.fn(), updateMany: vi.fn() },
    configuracaoRegulacao: { findUnique: vi.fn() },
    slotAgenda: { findUnique: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    regulacaoOutbox: { create: vi.fn(), findMany: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  };
  mock.$transaction.mockImplementation((ops: any) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mock)
  );
  return { default: mock, prisma: mock };
});

import prisma from '../config/prisma';
import {
  dentroDoHorario,
  calcularNovoScore,
  ordenarFila,
  processarResposta,
  vagasInfo,
  temVaga,
  dispararProgramados,
  verificarLembretes4Horas,
  CONFIG_PADRAO,
  type ConfigResolvida,
} from '../services/confirmacao.service';
import { setMessagingGateway } from '../services/messaging';

const p: any = prisma;

const gatewayFake = {
  enviarConfirmacao: vi.fn().mockResolvedValue({ messageId: 'mock.1', status: 'SENT' }),
  enviarColetaMotivo: vi.fn().mockResolvedValue({ messageId: 'mock.2', status: 'SENT' }),
  enviarConvocacao: vi.fn().mockResolvedValue({ messageId: 'mock.3', status: 'SENT' }),
  enviarLembrete: vi.fn().mockResolvedValue({ messageId: 'mock.4', status: 'SENT' }),
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-10T10:00:00Z'));
  for (const fn of Object.values(gatewayFake)) fn.mockResolvedValue({ messageId: 'mock.1', status: 'SENT' });
  setMessagingGateway(gatewayFake as any);
  p.$transaction.mockImplementation((ops: any) => (Array.isArray(ops) ? Promise.all(ops) : ops(p)));
  p.$queryRaw.mockResolvedValue([{id:'slot-1',ocupadas:0,capacidade_total:5,event_id:'event'}]);
  p.queueEntry.findUniqueOrThrow.mockImplementation((args:any)=>p.queueEntry.findUnique(args));
  p.paciente.findUniqueOrThrow.mockImplementation((args:any)=>p.paciente.findUnique(args));
  p.queueEntry.findMany.mockResolvedValue([]);
  p.queueEntry.count.mockResolvedValue(0);
  p.queueEntry.updateMany.mockResolvedValue({count:1});
  p.cicloConfirmacao.updateMany.mockResolvedValue({count:1});
  p.slotAgenda.findMany.mockResolvedValue([]);
  const cycles:any[]=[],outbox:any[]=[];
  p.cicloConfirmacao.create.mockImplementation(async ({data}:any)=>{const c={...data,id:`cycle-${cycles.length}`};cycles.push(c);return c});
  p.cicloConfirmacao.findUnique.mockImplementation(async ({where}:any)=>cycles.find(c=>where.id?c.id===where.id:c.callbackId===where.callbackId)||null);
  p.cicloConfirmacao.findUniqueOrThrow.mockImplementation((args:any)=>p.cicloConfirmacao.findUnique(args));
  p.cicloConfirmacao.findFirst.mockResolvedValue(null);
  p.regulacaoOutbox.create.mockImplementation(async ({data}:any)=>{const item={...data,id:`outbox-${outbox.length}`,status:'PENDING'};outbox.push(item);return item});
  p.regulacaoOutbox.findMany.mockImplementation(async ({where}:any)=>outbox.filter(x=>where.status.in.includes(x.status)&&(!where.callbackId||where.callbackId===x.callbackId)));
  p.regulacaoOutbox.updateMany.mockImplementation(async ({where,data}:any)=>{const items=outbox.filter(x=>(!where.id||where.id===x.id)&&x.status===where.status);items.forEach(x=>Object.assign(x,data));return {count:items.length}});
  p.regulacaoOutbox.update.mockImplementation(async ({where,data}:any)=>Object.assign(outbox.find(x=>x.id===where.id),data));
});
afterEach(()=>vi.useRealTimers());

// ====================================================================
// 1. Horário de operação (seção 4.10) — puro
// ====================================================================
describe('dentroDoHorario', () => {
  const base: ConfigResolvida = { ...CONFIG_PADRAO, timezone: 'UTC' };

  it('retorna true às 10:00 UTC dentro de 07:00-20:00', () => {
    const agora = new Date('2026-08-27T10:00:00Z');
    expect(dentroDoHorario(base, agora)).toBe(true);
  });

  it('retorna false às 03:00 UTC (madrugada)', () => {
    const agora = new Date('2026-08-27T03:00:00Z');
    expect(dentroDoHorario(base, agora)).toBe(false);
  });

  it('retorna false às 21:00 UTC (após o fim)', () => {
    const agora = new Date('2026-08-27T21:00:00Z');
    expect(dentroDoHorario(base, agora)).toBe(false);
  });

  it('respeita o timezone: 10:00 UTC = 07:00 America/Campo_Grande (limite inferior)', () => {
    const cfg: ConfigResolvida = { ...CONFIG_PADRAO, timezone: 'America/Campo_Grande' };
    // Campo_Grande = UTC-4 → 10:00Z = 06:00 local (antes do início 07:00)
    expect(dentroDoHorario(cfg, new Date('2026-08-27T10:00:00Z'))).toBe(false);
    // 12:00Z = 08:00 local (dentro)
    expect(dentroDoHorario(cfg, new Date('2026-08-27T12:00:00Z'))).toBe(true);
  });
});

// ====================================================================
// 2. Score de absenteísmo (seção 4.7) — puro
// ====================================================================
describe('calcularNovoScore', () => {
  it('CONFIRMOU sobe +2', () => expect(calcularNovoScore(90, 'CONFIRMOU')).toBe(92));
  it('RECUSOU cai -5', () => expect(calcularNovoScore(90, 'RECUSOU')).toBe(85));
  it('NAO_RESPONDEU cai -15', () => expect(calcularNovoScore(90, 'NAO_RESPONDEU')).toBe(75));
  it('nunca ultrapassa 100', () => expect(calcularNovoScore(100, 'CONFIRMOU')).toBe(100));
  it('nunca fica abaixo de 0', () => expect(calcularNovoScore(5, 'NAO_RESPONDEU')).toBe(0));
});

// ====================================================================
// 3. Ordenação da fila (seção 4.6) — puro
// ====================================================================
describe('ordenarFila', () => {
  it('preserva exclusivamente a posição, mesmo quando existe urgência', () => {
    const entries = [
      { id: 'a', nivelUrgencia: 'NORMAL', posicao: 1 },
      { id: 'b', nivelUrgencia: 'VERMELHO', posicao: 5 },
      { id: 'c', nivelUrgencia: 'AMARELO', posicao: 3 },
      { id: 'd', nivelUrgencia: 'VERMELHO', posicao: 2 },
    ];
    const ordem = ordenarFila(entries).map((e) => e.id);
    expect(ordem).toEqual(['a', 'd', 'c', 'b']);
  });
});

// ====================================================================
// 4. Transições da máquina de estados (processarResposta)
// ====================================================================
describe('processarResposta', () => {
  const entry = {
    id: 'entry-1',
    pacienteId: 'pac-1',
    unidadeId: 'uni-1',
    dataAgendada: new Date('2026-09-10T00:00:00Z'),
    procedimentoNome: 'Cardiologia',
    nivelUrgencia: 'NORMAL',
    statusPaciente: 'CONVOCADO',
    posicao: 1,
  };
  // Config sempre dentro do horário para os testes.
  const configAberta = { ...CONFIG_PADRAO, horarioInicio: '00:00', horarioFim: '23:59' };

  it('SIM → CONFIRMADO e sobe o score no fluxo conversacional', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue({
      id: 'ciclo-1', queueEntryId: 'entry-1', etapa: 1, status: 'CONVOCADO', callbackId: 'cb-1',
    });
    p.queueEntry.findUnique.mockResolvedValue(entry);
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta); // qtdConfirmacoes=2
    p.paciente.findUnique.mockResolvedValue({ id: 'pac-1', nomeCompleto: 'João', scoreConfianca: 90, telefone: '5567999', celular: '' });

    const r = await processarResposta('cb-1', { resposta: 'SIM' });

    expect(r.ok).toBe(true);
    expect(r.statusPaciente).toBe('CONFIRMADO');
    // queueEntry marcado como CONFIRMED (legado) + statusPaciente CONFIRMADO
    expect(p.queueEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ statusPaciente: 'CONFIRMADO', status: 'CONFIRMED' }) })
    );
    // score atualizado (+2)
    expect(p.historicoAbsenteismo.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tipo: 'CONFIRMOU', delta: 2, scoreResultante: 92 }) })
    );
  });

  it('SIM na etapa final (etapa >= qtdConfirmacoes) → RECONFIRMADO', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue({
      id: 'ciclo-2', queueEntryId: 'entry-1', etapa: 2, status: 'CONVOCADO', callbackId: 'cb-2',
    });
    p.queueEntry.findUnique.mockResolvedValue(entry);
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta); // qtdConfirmacoes=2
    p.paciente.findUnique.mockResolvedValue({ id: 'pac-1', nomeCompleto: 'João', scoreConfianca: 90, telefone: '5567999', celular: '' });

    const r = await processarResposta('cb-2', { resposta: 'SIM' });

    expect(r.ok).toBe(true);
    expect(r.statusPaciente).toBe('RECONFIRMADO');
    expect(p.queueEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ statusPaciente: 'RECONFIRMADO', status: 'CONFIRMED' }) })
    );
  });

  it('NÃO com motivo informado → RECUSOU, não reenvia coleta de motivo, derruba score e tenta convocar próximo', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue({
      id: 'ciclo-1', queueEntryId: 'entry-1', etapa: 1, status: 'CONVOCADO', callbackId: 'cb-1',
    });
    p.queueEntry.findUnique.mockResolvedValue(entry);
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta);
    p.paciente.findUnique.mockResolvedValue({ id: 'pac-1', nomeCompleto: 'João', scoreConfianca: 90, telefone: '5567999', celular: '' });
    p.queueEntry.findMany.mockResolvedValue([]); // ninguém AGUARDANDO para convocar

    const r = await processarResposta('cb-1', { resposta: 'NAO', motivoRecusa: 'SEM_TRANSPORTE' });

    expect(r.ok).toBe(true);
    expect(r.statusPaciente).toBe('RECUSOU');
    expect(p.cicloConfirmacao.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'RECUSADO', motivoRecusa: 'SEM_TRANSPORTE' }) })
    );
    expect(gatewayFake.enviarColetaMotivo).not.toHaveBeenCalled(); // motivo já veio do bot
    expect(p.historicoAbsenteismo.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tipo: 'RECUSOU', delta: -5, scoreResultante: 85 }) })
    );
    expect(p.queueEntry.findMany).toHaveBeenCalled(); // convocarProximo tentou buscar o próximo
  });

  it('NÃO sem motivo libera imediatamente; o bot coleta o motivo separadamente', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue({
      id: 'ciclo-1', queueEntryId: 'entry-1', etapa: 1, status: 'CONVOCADO', callbackId: 'cb-1',
    });
    p.queueEntry.findUnique.mockResolvedValue(entry);
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta);
    p.paciente.findUnique.mockResolvedValue({ id: 'pac-1', nomeCompleto: 'João', scoreConfianca: 90, telefone: '5567999', celular: '' });
    p.queueEntry.findMany.mockResolvedValue([]);

    const r = await processarResposta('cb-1', { resposta: 'NAO' });

    expect(r.ok).toBe(true);
    expect(r.statusPaciente).toBe('RECUSOU');
    expect(gatewayFake.enviarColetaMotivo).not.toHaveBeenCalled();
  });

  it('callbackId inexistente → ok:false', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue(null);
    const r = await processarResposta('cb-x', { resposta: 'SIM' });
    expect(r.ok).toBe(false);
  });

  it('confirmação duplicada retorna sucesso sem repetir score', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue({ id: 'ciclo-1', queueEntryId: 'entry-1', status: 'CONFIRMADO' });
    p.queueEntry.findUnique.mockResolvedValue(entry);
    const r = await processarResposta('cb-1', { resposta: 'SIM' });
    expect(r.ok).toBe(true);
    expect(p.historicoAbsenteismo.create).not.toHaveBeenCalled();
  });
});

// ====================================================================
// 5. Capacidade / vagas (seção 4.8)
// ====================================================================
describe('vagasInfo / temVaga', () => {
  const data = new Date('2026-09-10T00:00:00Z');

  it('capacidade indefinida (sem slot) bloqueia', async () => {
    p.slotAgenda.findUnique.mockResolvedValue(null);
    p.queueEntry.findMany.mockResolvedValue([]);
    const info = await vagasInfo('uni-1', 'Cardiologia', data);
    expect(info.definido).toBe(false);
    expect(info.disponiveis).toBeNull();
    expect(await temVaga('uni-1', 'Cardiologia', data)).toBe(false);
  });

  it('disponiveis = capacidade - confirmados - convocados', async () => {
    p.slotAgenda.findUnique.mockResolvedValue({ capacidadeTotal: 5, ocupadas: 3 });
    p.queueEntry.findMany.mockResolvedValue([
      { procedimentoNome: 'Cardiologia', procedimentoId: null, statusPaciente: 'CONFIRMADO' },
      { procedimentoNome: 'Cardiologia', procedimentoId: null, statusPaciente: 'RECONFIRMADO' },
      { procedimentoNome: 'Cardiologia', procedimentoId: null, statusPaciente: 'CONVOCADO' },
    ]);
    const info = await vagasInfo('uni-1', 'Cardiologia', data);
    expect(info.confirmados).toBe(2);
    expect(info.convocados).toBe(1);
    expect(info.disponiveis).toBe(2); // 5 - 2 - 1
    expect(await temVaga('uni-1', 'Cardiologia', data)).toBe(true);
  });

  it('capacidade esgotada → temVaga false', async () => {
    p.slotAgenda.findUnique.mockResolvedValue({ capacidadeTotal: 2, ocupadas: 2 });
    p.queueEntry.findMany.mockResolvedValue([
      { procedimentoNome: 'Cardiologia', procedimentoId: null, statusPaciente: 'CONFIRMADO' },
      { procedimentoNome: 'Cardiologia', procedimentoId: null, statusPaciente: 'CONVOCADO' },
    ]);
    expect(await temVaga('uni-1', 'Cardiologia', data)).toBe(false);
  });
});

// ====================================================================
// 6. Disparos programados diários (dispararProgramados - cron 7.2)
// ====================================================================
describe('dispararProgramados', () => {
  const agora = new Date('2026-09-10T10:00:00Z');
  const configAberta = {
    ...CONFIG_PADRAO,
    qtdConfirmacoes: 2,
    diasAntesConfirmacao: [7, 1],
    horarioInicio: '00:00',
    horarioFim: '23:59',
    timezone: 'UTC',
  };

  it('Etapa 2: envia reconfirmação para paciente CONFIRMADO na véspera (dias = 1)', async () => {
    const dataAmanha = new Date('2026-09-11T14:00:00Z'); // 1 dia depois
    const entryConfirmado = {
      id: 'entry-conf-1',
      pacienteId: 'pac-conf-1',
      unidadeId: 'uni-1',
      dataAgendada: dataAmanha,
      procedimentoNome: 'Cardiologia',
      nivelUrgencia: 'NORMAL',
      posicao: 1,
      statusPaciente: 'CONFIRMADO',
    };

    p.queueEntry.findMany.mockImplementation((args: any) => {
      if (args?.where?.statusPaciente === 'AGUARDANDO') return Promise.resolve([]);
      if (args?.where?.statusPaciente === 'CONFIRMADO') return Promise.resolve([entryConfirmado]);
      return Promise.resolve([]);
    });

    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta);
    p.cicloConfirmacao.findFirst.mockResolvedValue(null); // não disparado hoje
    p.paciente.findUnique.mockResolvedValue({
      id: 'pac-conf-1',
      nomeCompleto: 'Maria Souza',cartaoSus:'700000000000001',dataNascimento:new Date('1980-01-01'),
      telefone: '5567999990001',
      celular: '',
    });
    p.unidade.findUnique.mockResolvedValue({ id: 'uni-1', nome: 'UBS Central' });
    p.queueEntry.findUnique.mockResolvedValue({ ...entryConfirmado, horaAgendada:'14:00', localAtendimento: 'UBS Central' });
    p.queueEntry.update.mockResolvedValue({});

    const total = await dispararProgramados(agora);

    expect(total).toBe(1);
    expect(gatewayFake.enviarConfirmacao).toHaveBeenCalledTimes(1);
    expect(gatewayFake.enviarConfirmacao).toHaveBeenCalledWith(
      expect.objectContaining({
        telefone: '5567999990001',
        nomePaciente: 'Maria Souza',
        procedimento: 'Cardiologia',
        dataAgendada: '11/09/2026',
        local: 'UBS Central',
        templateName: configAberta.templateReconfirmacao,
        queueEntryId: 'entry-conf-1',
        pacienteId: 'pac-conf-1',
      })
    );
    expect(p.cicloConfirmacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          queueEntryId: 'entry-conf-1',
          etapa: 2,
          tentativa: 1,
          status: 'CONVOCADO',
          templateName: configAberta.templateReconfirmacao,
        }),
      })
    );
    expect(p.queueEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'entry-conf-1' },
        data: expect.objectContaining({
          statusPaciente: 'CONVOCADO',
          status: 'AWAITING_RESPONSE',
        }),
      })
    );
  });

  it('não dispara Etapa 2 se qtdConfirmacoes < 2', async () => {
    const dataAmanha = new Date('2026-09-11T14:00:00Z');
    const entryConfirmado = {
      id: 'entry-conf-1',
      pacienteId: 'pac-conf-1',
      unidadeId: 'uni-1',
      dataAgendada: dataAmanha,
      procedimentoNome: 'Cardiologia',
      statusPaciente: 'CONFIRMADO',
    };

    p.queueEntry.findMany.mockImplementation((args: any) => {
      if (args?.where?.statusPaciente === 'AGUARDANDO') return Promise.resolve([]);
      if (args?.where?.statusPaciente === 'CONFIRMADO') return Promise.resolve([entryConfirmado]);
      return Promise.resolve([]);
    });

    p.configuracaoRegulacao.findUnique.mockResolvedValue({
      ...configAberta,
      qtdConfirmacoes: 1,
    });

    const total = await dispararProgramados(agora);
    expect(total).toBe(0);
    expect(gatewayFake.enviarConfirmacao).not.toHaveBeenCalled();
  });

  it('não dispara Etapa 2 se já disparou hoje para a mesma entrada', async () => {
    const dataAmanha = new Date('2026-09-11T14:00:00Z');
    const entryConfirmado = {
      id: 'entry-conf-1',
      pacienteId: 'pac-conf-1',
      unidadeId: 'uni-1',
      dataAgendada: dataAmanha,
      procedimentoNome: 'Cardiologia',
      statusPaciente: 'CONFIRMADO',
    };

    p.queueEntry.findMany.mockImplementation((args: any) => {
      if (args?.where?.statusPaciente === 'AGUARDANDO') return Promise.resolve([]);
      if (args?.where?.statusPaciente === 'CONFIRMADO') return Promise.resolve([entryConfirmado]);
      return Promise.resolve([]);
    });

    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta);
    p.cicloConfirmacao.findFirst.mockResolvedValue({ id: 'ciclo-ja-disparado' }); // já disparado hoje

    const total = await dispararProgramados(agora);
    expect(total).toBe(0);
    expect(gatewayFake.enviarConfirmacao).not.toHaveBeenCalled();
  });

  it('não dispara Etapa 2 se dias até consulta for diferente de 1 (ou menor configurado)', async () => {
    const dataEmTresDias = new Date('2026-09-13T14:00:00Z'); // 3 dias depois
    const entryConfirmado = {
      id: 'entry-conf-1',
      pacienteId: 'pac-conf-1',
      unidadeId: 'uni-1',
      dataAgendada: dataEmTresDias,
      procedimentoNome: 'Cardiologia',
      statusPaciente: 'CONFIRMADO',
    };

    p.queueEntry.findMany.mockImplementation((args: any) => {
      if (args?.where?.statusPaciente === 'AGUARDANDO') return Promise.resolve([]);
      if (args?.where?.statusPaciente === 'CONFIRMADO') return Promise.resolve([entryConfirmado]);
      return Promise.resolve([]);
    });

    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta);

    const total = await dispararProgramados(agora);
    expect(total).toBe(0);
    expect(gatewayFake.enviarConfirmacao).not.toHaveBeenCalled();
  });
});

// ====================================================================
// 7. Lembretes 4 horas antes do agendamento (verificarLembretes4Horas - cron 7.3)
// ====================================================================
describe('verificarLembretes4Horas', () => {
  const agora = new Date('2026-09-10T10:00:00Z'); // 10:00 UTC
  const configAberta = {
    ...CONFIG_PADRAO,
    horarioInicio: '00:00',
    horarioFim: '23:59',
    timezone: 'UTC',
  };

  it('envia lembrete para paciente CONFIRMADO ou RECONFIRMADO com consulta hoje em até 240 minutos e atualiza lembreteEnviadoEm', async () => {
    const dataHoje = new Date('2026-09-10T00:00:00Z');
    const entryConfirmado = {
      id: 'entry-lembrete-1',
      pacienteId: 'pac-1',
      unidadeId: 'uni-1',
      dataAgendada: dataHoje,
      horaAgendada: '13:30', // faltam 210 minutos (<= 240)
      procedimentoNome: 'Cardiologia',
      statusPaciente: 'CONFIRMADO',
      lembreteEnviadoEm: null,
    };
    const entryReconfirmado = {
      id: 'entry-lembrete-2',
      pacienteId: 'pac-2',
      unidadeId: 'uni-1',
      dataAgendada: dataHoje,
      horaAgendada: '12:00', // faltam 120 minutos (<= 240)
      procedimentoNome: 'Pediatria',
      statusPaciente: 'RECONFIRMADO',
      lembreteEnviadoEm: null,
    };

    p.queueEntry.findMany.mockResolvedValue([entryConfirmado, entryReconfirmado]);
    p.queueEntry.findUnique.mockImplementation(async ({where}:any)=>({...([entryConfirmado,entryReconfirmado].find(e=>e.id===where.id)), localAtendimento:'Policlínica Central'}));
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta);
    p.paciente.findUnique
      .mockResolvedValueOnce({ id: 'pac-1', nomeCompleto: 'João Silva',cartaoSus:'700000000000001',dataNascimento:new Date('1980-01-01'), telefone: '5567999990001', celular: '' })
      .mockResolvedValueOnce({ id: 'pac-2', nomeCompleto: 'Ana Paula',cartaoSus:'700000000000002',dataNascimento:new Date('1980-01-01'), telefone: '5567999990002', celular: '' });
    p.unidade.findUnique.mockResolvedValue({ id: 'uni-1', nome: 'Policlínica Central' });
    p.queueEntry.update.mockResolvedValue({});

    const enviados = await verificarLembretes4Horas(agora);

    expect(enviados).toBe(2);
    expect(gatewayFake.enviarLembrete).toHaveBeenCalledTimes(2);

    expect(gatewayFake.enviarLembrete).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        telefone: '5567999990001',
        nomePaciente: 'João Silva',
        procedimento: 'Cardiologia',
        dataAgendada: '10/09/2026',
        horaAgendada: '13:30',
        local: 'Policlínica Central',
        queueEntryId: 'entry-lembrete-1',
        pacienteId: 'pac-1',
      })
    );

    expect(gatewayFake.enviarLembrete).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        telefone: '5567999990002',
        nomePaciente: 'Ana Paula',
        procedimento: 'Pediatria',
        dataAgendada: '10/09/2026',
        horaAgendada: '12:00',
        local: 'Policlínica Central',
        queueEntryId: 'entry-lembrete-2',
        pacienteId: 'pac-2',
      })
    );

    expect(p.queueEntry.update).toHaveBeenCalledWith({
      where: { id: 'entry-lembrete-1' },
      data: { lembreteEnviadoEm: agora },
    });
    expect(p.queueEntry.update).toHaveBeenCalledWith({
      where: { id: 'entry-lembrete-2' },
      data: { lembreteEnviadoEm: agora },
    });
  });

  it('não envia lembrete se a consulta estiver a mais de 240 minutos de distância', async () => {
    const dataHoje = new Date('2026-09-10T00:00:00Z');
    const entryLonge = {
      id: 'entry-longe',
      pacienteId: 'pac-3',
      unidadeId: 'uni-1',
      dataAgendada: dataHoje,
      horaAgendada: '16:00', // faltam 360 minutos (> 240)
      procedimentoNome: 'Cardiologia',
      statusPaciente: 'CONFIRMADO',
      lembreteEnviadoEm: null,
    };

    p.queueEntry.findMany.mockResolvedValue([entryLonge]);
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta);

    const enviados = await verificarLembretes4Horas(agora);
    expect(enviados).toBe(0);
    expect(gatewayFake.enviarLembrete).not.toHaveBeenCalled();
    expect(p.queueEntry.update).not.toHaveBeenCalled();
  });

  it('não envia lembrete se a consulta já passou há mais de 30 minutos', async () => {
    const dataHoje = new Date('2026-09-10T00:00:00Z');
    const entryPassado = {
      id: 'entry-passado',
      pacienteId: 'pac-4',
      unidadeId: 'uni-1',
      dataAgendada: dataHoje,
      horaAgendada: '09:00', // -60 minutos (< -30)
      procedimentoNome: 'Cardiologia',
      statusPaciente: 'CONFIRMADO',
      lembreteEnviadoEm: null,
    };

    p.queueEntry.findMany.mockResolvedValue([entryPassado]);
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta);

    const enviados = await verificarLembretes4Horas(agora);
    expect(enviados).toBe(0);
    expect(gatewayFake.enviarLembrete).not.toHaveBeenCalled();
    expect(p.queueEntry.update).not.toHaveBeenCalled();
  });

  it('não envia lembrete se estiver fora do horário de operação', async () => {
    const dataHoje = new Date('2026-09-10T00:00:00Z');
    const entry = {
      id: 'entry-madrugada',
      pacienteId: 'pac-5',
      unidadeId: 'uni-1',
      dataAgendada: dataHoje,
      horaAgendada: '08:00',
      procedimentoNome: 'Cardiologia',
      statusPaciente: 'CONFIRMADO',
      lembreteEnviadoEm: null,
    };

    p.queueEntry.findMany.mockResolvedValue([entry]);
    p.configuracaoRegulacao.findUnique.mockResolvedValue({
      ...configAberta,
      horarioInicio: '08:00',
      horarioFim: '18:00',
    });

    const madrugada = new Date('2026-09-10T05:00:00Z');
    const enviados = await verificarLembretes4Horas(madrugada);
    expect(enviados).toBe(0);
    expect(gatewayFake.enviarLembrete).not.toHaveBeenCalled();
  });
});
