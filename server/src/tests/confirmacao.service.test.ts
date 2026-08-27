import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock do prisma (mesmo padrão de PedidoController.test.ts) ---
vi.mock('../config/prisma', () => {
  const mock: any = {
    cicloConfirmacao: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    queueEntry: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    paciente: { findUnique: vi.fn(), update: vi.fn() },
    historicoAbsenteismo: { create: vi.fn() },
    messageLog: { create: vi.fn() },
    configuracaoRegulacao: { findUnique: vi.fn() },
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
  CONFIG_PADRAO,
  type ConfigResolvida,
} from '../services/confirmacao.service';
import { setMessagingGateway } from '../services/messaging';

const p: any = prisma;

const gatewayFake = {
  enviarConfirmacao: vi.fn().mockResolvedValue({ messageId: 'mock.1', status: 'SENT' }),
  enviarColetaMotivo: vi.fn().mockResolvedValue({ messageId: 'mock.2', status: 'SENT' }),
  enviarConvocacao: vi.fn().mockResolvedValue({ messageId: 'mock.3', status: 'SENT' }),
};

beforeEach(() => {
  vi.clearAllMocks();
  setMessagingGateway(gatewayFake as any);
  p.$transaction.mockImplementation((ops: any) => (Array.isArray(ops) ? Promise.all(ops) : ops(p)));
});

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
  it('urgência VERMELHO > AMARELO > NORMAL e, em empate, FIFO por posição', () => {
    const entries = [
      { id: 'a', nivelUrgencia: 'NORMAL', posicao: 1 },
      { id: 'b', nivelUrgencia: 'VERMELHO', posicao: 5 },
      { id: 'c', nivelUrgencia: 'AMARELO', posicao: 3 },
      { id: 'd', nivelUrgencia: 'VERMELHO', posicao: 2 },
    ];
    const ordem = ordenarFila(entries).map((e) => e.id);
    expect(ordem).toEqual(['d', 'b', 'c', 'a']); // VERMELHO(pos2, pos5), AMARELO, NORMAL
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
    posicao: 1,
  };
  // Config sempre dentro do horário para os testes.
  const configAberta = { ...CONFIG_PADRAO, horarioInicio: '00:00', horarioFim: '23:59' };

  it('SIM na última etapa → CONFIRMADO/RECONFIRMADO e sobe o score', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue({
      id: 'ciclo-1', queueEntryId: 'entry-1', etapa: 2, status: 'CONVOCADO', callbackId: 'cb-1',
    });
    p.queueEntry.findUnique.mockResolvedValue(entry);
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta); // qtdConfirmacoes=2
    p.paciente.findUnique.mockResolvedValue({ id: 'pac-1', nomeCompleto: 'João', scoreConfianca: 90, telefone: '5567999', celular: '' });

    const r = await processarResposta('cb-1', { resposta: 'SIM' });

    expect(r.ok).toBe(true);
    expect(r.statusPaciente).toBe('RECONFIRMADO'); // qtdConfirmacoes >= 2
    // queueEntry marcado como CONFIRMED (legado) + statusPaciente RECONFIRMADO
    expect(p.queueEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ statusPaciente: 'RECONFIRMADO', status: 'CONFIRMED' }) })
    );
    // score atualizado (+2)
    expect(p.historicoAbsenteismo.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tipo: 'CONFIRMOU', delta: 2, scoreResultante: 92 }) })
    );
  });

  it('SIM antes da última etapa → dispara reconfirmação (segue CONVOCADO)', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue({
      id: 'ciclo-1', queueEntryId: 'entry-1', etapa: 1, status: 'CONVOCADO', callbackId: 'cb-1',
    });
    p.queueEntry.findUnique.mockResolvedValue(entry);
    p.configuracaoRegulacao.findUnique.mockResolvedValue(configAberta); // qtdConfirmacoes=2
    p.paciente.findUnique.mockResolvedValue({ id: 'pac-1', nomeCompleto: 'João', scoreConfianca: 90, telefone: '5567999', celular: '' });
    p.cicloConfirmacao.create.mockResolvedValue({ id: 'ciclo-2' });

    const r = await processarResposta('cb-1', { resposta: 'SIM' });

    expect(r.statusPaciente).toBe('CONVOCADO');
    expect(gatewayFake.enviarConfirmacao).toHaveBeenCalledTimes(1); // reconfirmação enviada
    expect(p.historicoAbsenteismo.create).not.toHaveBeenCalled(); // ainda não pontua
  });

  it('NÃO → RECUSOU, registra motivo, derruba score e tenta convocar o próximo', async () => {
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
    expect(gatewayFake.enviarColetaMotivo).toHaveBeenCalledTimes(1);
    expect(p.historicoAbsenteismo.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tipo: 'RECUSOU', delta: -5, scoreResultante: 85 }) })
    );
    expect(p.queueEntry.findMany).toHaveBeenCalled(); // convocarProximo tentou buscar o próximo
  });

  it('callbackId inexistente → ok:false', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue(null);
    const r = await processarResposta('cb-x', { resposta: 'SIM' });
    expect(r.ok).toBe(false);
  });

  it('ciclo já resolvido → ok:false (idempotente)', async () => {
    p.cicloConfirmacao.findUnique.mockResolvedValue({ id: 'ciclo-1', status: 'CONFIRMADO' });
    const r = await processarResposta('cb-1', { resposta: 'SIM' });
    expect(r.ok).toBe(false);
  });
});
