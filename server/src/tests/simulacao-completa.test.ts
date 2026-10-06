import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';

// ====================================================================
// Mock do Prisma Client
// ====================================================================
vi.mock('../config/prisma', () => {
  const mock: any = {
    cicloConfirmacao: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    queueEntry: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    paciente: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    unidade: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    historicoAbsenteismo: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    messageLog: {
      create: vi.fn(),
    },
    configuracaoRegulacao: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    slotAgenda: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  mock.$transaction.mockImplementation((ops: any) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mock)
  );

  return { default: mock, prisma: mock };
});

import prisma from '../config/prisma';
import { ConfirmacaoController } from '../controllers/ConfirmacaoController';
import {
  dispararEtapa,
  convocarEntrada,
  processarResposta,
  dispararProgramados,
  verificarLembretes4Horas,
  verificarTimeouts,
  CONFIG_PADRAO,
  type ConfigResolvida,
} from '../services/confirmacao.service';
import { setMessagingGateway } from '../services/messaging';

const p: any = prisma;

const gatewayFake = {
  enviarConfirmacao: vi.fn().mockResolvedValue({ messageId: 'mock.conf.1', status: 'SENT' }),
  enviarColetaMotivo: vi.fn().mockResolvedValue({ messageId: 'mock.motivo.1', status: 'SENT' }),
  enviarConvocacao: vi.fn().mockResolvedValue({ messageId: 'mock.conv.1', status: 'SENT' }),
  enviarLembrete: vi.fn().mockResolvedValue({ messageId: 'mock.lembr.1', status: 'SENT' }),
};

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (
  body: any = {},
  params: any = {},
  user: any = { id: 'user-admin', unidadeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', perfil: 'REGULADOR' }
): AuthRequest =>
  ({
    body,
    params,
    user,
    headers: {},
  } as any);

const UNIDADE_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Configuração permissiva (24h aberta) para previsibilidade nos testes
const config24h: ConfigResolvida = {
  ...CONFIG_PADRAO,
  qtdConfirmacoes: 2,
  diasAntesConfirmacao: [7, 1],
  qtdReenvios: 2,
  intervaloReenvioHoras: 12,
  timeoutRespostaHoras: 24,
  horarioInicio: '00:00',
  horarioFim: '23:59',
  timezone: 'UTC',
};

beforeEach(() => {
  vi.clearAllMocks();
  setMessagingGateway(gatewayFake as any);
  p.$transaction.mockImplementation((ops: any) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(p)
  );
  p.configuracaoRegulacao.findUnique.mockResolvedValue(config24h);
  p.slotAgenda.findUnique.mockResolvedValue(null); // Capacidade indefinida não bloqueia
  p.queueEntry.findMany.mockResolvedValue([]);
});

// ====================================================================
// Testes E2E do Ciclo de Confirmação e Regulação
// ====================================================================

describe('Simulação Completa do Ciclo de Confirmação e Regulação (E2E Integration)', () => {
  const controller = new ConfirmacaoController();

  // ------------------------------------------------------------------
  // 1. Inserção manual na fila (inserirFila)
  // ------------------------------------------------------------------
  describe('1. Inserção manual na fila (inserirFila)', () => {
    it('cria novo paciente se não existir, calcula próxima posição (N+1) e define status AGUARDANDO', async () => {
      const req = mockRequest({
        nomeCompleto: 'Carlos Eduardo',
        telefone: '(67) 99988-7766',
        procedimentoNome: 'Ultrassonografia',
        dataAgendada: '2026-10-20T10:00:00.000Z',
        horaAgendada: '10:30',
        unidadeId: UNIDADE_UUID,
        nivelUrgencia: 'AMARELO',
      });
      const res = mockResponse();

      // Paciente ainda não cadastrado
      p.paciente.findFirst.mockResolvedValue(null);
      p.paciente.create.mockResolvedValue({
        id: 'pac-novo-1',
        nomeCompleto: 'CARLOS EDUARDO',
        telefone: '67999887766',
        celular: '67999887766',
        scoreConfianca: 100,
      });

      // Última entrada na fila está na posição 4 -> próxima deve ser 5
      p.queueEntry.findFirst.mockResolvedValue({ posicao: 4 });
      p.queueEntry.create.mockResolvedValue({
        id: 'entry-novo-1',
        pacienteId: 'pac-novo-1',
        unidadeId: UNIDADE_UUID,
        procedimentoNome: 'Ultrassonografia',
        posicao: 5,
        status: 'PENDING',
        statusPaciente: 'AGUARDANDO',
        nivelUrgencia: 'AMARELO',
        horaAgendada: '10:30',
      });

      await controller.inserirFila(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Paciente inserido na fila com sucesso!',
          queueEntryId: 'entry-novo-1',
          pacienteId: 'pac-novo-1',
          statusPaciente: 'AGUARDANDO',
        })
      );

      // Verificação do paciente criado com score inicial de 100
      expect(p.paciente.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nomeCompleto: 'CARLOS EDUARDO',
            telefone: '67999887766',
            scoreConfianca: 100,
          }),
        })
      );

      // Verificação do cálculo de posição = 5 e status AGUARDANDO
      expect(p.queueEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pacienteId: 'pac-novo-1',
            posicao: 5,
            statusPaciente: 'AGUARDANDO',
            status: 'PENDING',
            nivelUrgencia: 'AMARELO',
          }),
        })
      );
    });

    it('atualiza telefone se paciente já existir e inicia na posição 1 se fila estiver vazia', async () => {
      const req = mockRequest({
        nomeCompleto: 'Ana Paula',
        telefone: '67988881122',
        procedimentoNome: 'Cardiologia',
        unidadeId: UNIDADE_UUID,
      });
      const res = mockResponse();

      // Paciente já existe com telefone antigo
      p.paciente.findFirst.mockResolvedValue({
        id: 'pac-existente-1',
        nomeCompleto: 'ANA PAULA',
        telefone: '67900000000',
        scoreConfianca: 90,
      });
      p.paciente.update.mockResolvedValue({
        id: 'pac-existente-1',
        telefone: '67988881122',
      });

      // Fila vazia para este procedimento
      p.queueEntry.findFirst.mockResolvedValue(null);
      p.queueEntry.create.mockResolvedValue({
        id: 'entry-novo-2',
        pacienteId: 'pac-existente-1',
        posicao: 1,
        statusPaciente: 'AGUARDANDO',
      });

      await controller.inserirFila(req, res);

      expect(p.paciente.update).toHaveBeenCalledWith({
        where: { id: 'pac-existente-1' },
        data: { telefone: '67988881122', celular: '67988881122' },
      });
      expect(p.queueEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            posicao: 1,
            statusPaciente: 'AGUARDANDO',
          }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('retorna 400 se os dados forem inválidos segundo o schema Zod', async () => {
      const req = mockRequest({
        nomeCompleto: '', // inválido (< 2 caracteres)
        telefone: '123',   // inválido (< 8 caracteres)
        procedimentoNome: 'X',
      });
      const res = mockResponse();

      await controller.inserirFila(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: 'Dados inválidos',
        })
      );
    });
  });

  // ------------------------------------------------------------------
  // 2. Disparo inicial e Convocação (dispararEtapa / convocarEntrada)
  // ------------------------------------------------------------------
  describe('2. Disparo inicial e Convocação (dispararEtapa / convocarEntrada)', () => {
    const entryAguardando = {
      id: 'entry-conv-1',
      pacienteId: 'pac-conv-1',
      unidadeId: UNIDADE_UUID,
      procedimentoNome: 'Ultrassonografia',
      posicao: 1,
      statusPaciente: 'AGUARDANDO',
      status: 'PENDING',
      nivelUrgencia: 'NORMAL',
      dataAgendada: new Date('2026-10-20T10:00:00.000Z'),
      horaAgendada: '10:30',
    };

    it('convoca entrada AGUARDANDO, cria CicloConfirmacao com expiraEm (+24h) e chama gateway', async () => {
      p.queueEntry.findUnique.mockResolvedValue(entryAguardando);
      p.paciente.findUnique.mockResolvedValue({
        id: 'pac-conv-1',
        nomeCompleto: 'Carlos Eduardo',
        telefone: '67999887766',
        celular: '',
      });
      p.unidade.findUnique.mockResolvedValue({
        id: UNIDADE_UUID,
        nome: 'UBS Vila Esperança',
      });
      p.cicloConfirmacao.create.mockImplementation((args: any) =>
        Promise.resolve({ id: 'ciclo-conv-1', ...args.data })
      );
      p.queueEntry.update.mockResolvedValue({});

      const dataAntes = Date.now();
      const resultado = await convocarEntrada(UNIDADE_UUID, 'entry-conv-1');

      expect(resultado.id).toBe('entry-conv-1');

      // Gateway de convocação foi chamado com os parâmetros esperados
      expect(gatewayFake.enviarConvocacao).toHaveBeenCalledTimes(1);
      expect(gatewayFake.enviarConvocacao).toHaveBeenCalledWith(
        expect.objectContaining({
          telefone: '67999887766',
          nomePaciente: 'Carlos Eduardo',
          procedimento: 'Ultrassonografia',
          dataAgendada: '20/10/2026',
          horaAgendada: '10:30',
          local: 'UBS Vila Esperança',
          templateName: config24h.templateConvocacao,
          callbackId: expect.any(String),
        })
      );

      // Ciclo de confirmação criado com status CONVOCADO e expiração calculada (+24h)
      expect(p.cicloConfirmacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            queueEntryId: 'entry-conv-1',
            etapa: 1,
            tentativa: 1,
            status: 'CONVOCADO',
            templateName: config24h.templateConvocacao,
          }),
        })
      );

      const cicloArgs = p.cicloConfirmacao.create.mock.calls[0][0].data;
      const diffMs = cicloArgs.expiraEm.getTime() - cicloArgs.enviadoEm.getTime();
      expect(diffMs).toBe(24 * 60 * 60 * 1000); // 24 horas

      // QueueEntry atualizada para CONVOCADO e AWAITING_RESPONSE
      expect(p.queueEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'entry-conv-1' },
          data: expect.objectContaining({
            statusPaciente: 'CONVOCADO',
            status: 'AWAITING_RESPONSE',
            notificadoEm: expect.any(Date),
            expiraEm: expect.any(Date),
          }),
        })
      );
    });

    it('rejeita convocação se o paciente não estiver com status AGUARDANDO', async () => {
      p.queueEntry.findUnique.mockResolvedValue({
        ...entryAguardando,
        statusPaciente: 'CONFIRMADO',
      });

      await expect(convocarEntrada(UNIDADE_UUID, 'entry-conv-1')).rejects.toThrow(
        /não está AGUARDANDO/
      );
    });

    it('bloqueia convocação manual quando a capacidade do slot estiver esgotada', async () => {
      p.queueEntry.findUnique.mockResolvedValue(entryAguardando);
      p.slotAgenda.findUnique.mockResolvedValue({
        capacidadeTotal: 1,
      });
      // Já existe 1 confirmado preenchendo a vaga
      p.queueEntry.findMany.mockResolvedValue([
        { procedimentoNome: 'Ultrassonografia', statusPaciente: 'CONFIRMADO' },
      ]);

      await expect(convocarEntrada(UNIDADE_UUID, 'entry-conv-1')).rejects.toThrow(
        /Sem vagas disponíveis/
      );
    });
  });

  // ------------------------------------------------------------------
  // 3. Resposta do paciente SIM (processarResposta)
  // ------------------------------------------------------------------
  describe('3. Resposta do paciente SIM (processarResposta)', () => {
    const entryConvocada = {
      id: 'entry-resp-1',
      pacienteId: 'pac-resp-1',
      unidadeId: UNIDADE_UUID,
      procedimentoNome: 'Ultrassonografia',
      dataAgendada: new Date('2026-10-20T10:00:00.000Z'),
      statusPaciente: 'CONVOCADO',
    };

    const cicloAtivo = {
      id: 'ciclo-resp-1',
      queueEntryId: 'entry-resp-1',
      etapa: 1,
      tentativa: 1,
      status: 'CONVOCADO',
      callbackId: 'cb-sim-1234',
    };

    it('marca Ciclo e QueueEntry como CONFIRMADO, bonifica score em +2 e gera log INBOUND', async () => {
      p.cicloConfirmacao.findUnique.mockResolvedValue(cicloAtivo);
      p.queueEntry.findUnique.mockResolvedValue(entryConvocada);
      p.paciente.findUnique.mockResolvedValue({
        id: 'pac-resp-1',
        nomeCompleto: 'Carlos Eduardo',
        scoreConfianca: 90,
      });

      const resposta = await processarResposta('cb-sim-1234', {
        resposta: 'SIM',
        wamid: 'wamid.inbound.sim.1',
      });

      expect(resposta.ok).toBe(true);
      expect(resposta.statusPaciente).toBe('CONFIRMADO');

      // Ciclo marcado como CONFIRMADO
      expect(p.cicloConfirmacao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ciclo-resp-1' },
          data: expect.objectContaining({
            status: 'CONFIRMADO',
            resposta: 'SIM',
            respondidoEm: expect.any(Date),
          }),
        })
      );

      // QueueEntry marcada como CONFIRMADO / CONFIRMED
      expect(p.queueEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'entry-resp-1' },
          data: expect.objectContaining({
            statusPaciente: 'CONFIRMADO',
            status: 'CONFIRMED',
            respondidoEm: expect.any(Date),
          }),
        })
      );

      // Bonificação do score de absenteísmo (+2): 90 -> 92
      expect(p.paciente.update).toHaveBeenCalledWith({
        where: { id: 'pac-resp-1' },
        data: { scoreConfianca: 92 },
      });
      expect(p.historicoAbsenteismo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pacienteId: 'pac-resp-1',
            queueEntryId: 'entry-resp-1',
            tipo: 'CONFIRMOU',
            delta: 2,
            scoreResultante: 92,
          }),
        })
      );

      // Log de mensagem INBOUND registrado
      expect(p.messageLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            queueEntryId: 'entry-resp-1',
            pacienteId: 'pac-resp-1',
            direction: 'INBOUND',
            wamid: 'wamid.inbound.sim.1',
            body: 'SIM',
            status: 'RECEIVED',
          }),
        })
      );
    });

    it('marca como RECONFIRMADO se responder SIM na etapa 2 (etapa >= qtdConfirmacoes)', async () => {
      p.cicloConfirmacao.findUnique.mockResolvedValue({
        ...cicloAtivo,
        etapa: 2,
        callbackId: 'cb-reconf-sim',
      });
      p.queueEntry.findUnique.mockResolvedValue(entryConvocada);
      p.paciente.findUnique.mockResolvedValue({
        id: 'pac-resp-1',
        nomeCompleto: 'Carlos Eduardo',
        scoreConfianca: 92,
      });

      const resposta = await processarResposta('cb-reconf-sim', { resposta: 'SIM' });

      expect(resposta.ok).toBe(true);
      expect(resposta.statusPaciente).toBe('RECONFIRMADO');
      expect(p.queueEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'entry-resp-1' },
          data: expect.objectContaining({
            statusPaciente: 'RECONFIRMADO',
            status: 'CONFIRMED',
          }),
        })
      );
    });
  });

  // ------------------------------------------------------------------
  // 4. Redefinição de fila (redefinirEntrada)
  // ------------------------------------------------------------------
  describe('4. Redefinição de fila (redefinirEntrada)', () => {
    it('cancela ciclos anteriores via deleteMany e reseta QueueEntry para AGUARDANDO / PENDING', async () => {
      const req = mockRequest({}, { queueEntryId: 'entry-reset-1' });
      const res = mockResponse();

      p.queueEntry.findUnique.mockResolvedValue({
        id: 'entry-reset-1',
        pacienteId: 'pac-1',
        statusPaciente: 'CONFIRMADO',
      });
      p.cicloConfirmacao.deleteMany.mockResolvedValue({ count: 2 });
      p.queueEntry.update.mockResolvedValue({
        id: 'entry-reset-1',
        statusPaciente: 'AGUARDANDO',
        status: 'PENDING',
      });

      await controller.redefinirEntrada(req, res);

      // Deleta ciclos anteriores
      expect(p.cicloConfirmacao.deleteMany).toHaveBeenCalledWith({
        where: { queueEntryId: 'entry-reset-1' },
      });

      // Limpa todos os marcadores de notificação e volta a AGUARDANDO
      expect(p.queueEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-reset-1' },
        data: {
          statusPaciente: 'AGUARDANDO',
          status: 'PENDING',
          notificadoEm: null,
          respondidoEm: null,
          expiraEm: null,
          lembreteEnviadoEm: null,
        },
      });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Paciente redefinido para AGUARDANDO com sucesso!',
          queueEntryId: 'entry-reset-1',
          statusPaciente: 'AGUARDANDO',
        })
      );
    });

    it('retorna 404 se a entrada da fila não for encontrada', async () => {
      const req = mockRequest({}, { queueEntryId: 'entry-inexistente' });
      const res = mockResponse();

      p.queueEntry.findUnique.mockResolvedValue(null);

      await controller.redefinirEntrada(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          erro: 'Entrada da fila não encontrada.',
        })
      );
    });
  });

  // ------------------------------------------------------------------
  // 5. Re-convocação e Recusa "NAO" com motivo (processarResposta com motivoRecusa)
  // ------------------------------------------------------------------
  describe('5. Re-convocação e Recusa "NAO" com motivo (processarResposta com SEM_TRANSPORTE)', () => {
    const entryRecusa = {
      id: 'entry-recusa-1',
      pacienteId: 'pac-recusa-1',
      unidadeId: UNIDADE_UUID,
      procedimentoNome: 'Ultrassonografia',
      dataAgendada: new Date('2026-10-20T10:00:00.000Z'),
      statusPaciente: 'CONVOCADO',
    };

    const cicloRecusa = {
      id: 'ciclo-recusa-1',
      queueEntryId: 'entry-recusa-1',
      etapa: 1,
      tentativa: 1,
      status: 'CONVOCADO',
      callbackId: 'cb-recusa-1234',
    };

    it('marca Ciclo e QueueEntry como RECUSADO, debita score (-5), não chama coleta de motivo e convoca próximo', async () => {
      p.cicloConfirmacao.findUnique.mockResolvedValue(cicloRecusa);
      p.queueEntry.findUnique.mockResolvedValue(entryRecusa);
      p.paciente.findUnique.mockImplementation(async (args: any) => {
        if (args?.where?.id === 'pac-recusa-1') {
          return {
            id: 'pac-recusa-1',
            nomeCompleto: 'Carlos Eduardo',
            telefone: '67999887766',
            scoreConfianca: 92,
          };
        }
        if (args?.where?.id === 'pac-proximo-2') {
          return {
            id: 'pac-proximo-2',
            nomeCompleto: 'Beatriz Lima',
            telefone: '67988882233',
            scoreConfianca: 100,
          };
        }
        return null;
      });

      // Próximo paciente na fila aguardando convocação
      const proximoEntry = {
        id: 'entry-proximo-2',
        pacienteId: 'pac-proximo-2',
        unidadeId: UNIDADE_UUID,
        procedimentoNome: 'Ultrassonografia',
        posicao: 2,
        statusPaciente: 'AGUARDANDO',
        nivelUrgencia: 'NORMAL',
        dataAgendada: new Date('2026-10-20T10:00:00.000Z'),
      };
      p.queueEntry.findMany.mockResolvedValue([proximoEntry]);
      p.cicloConfirmacao.create.mockResolvedValue({ id: 'ciclo-proximo-2' });
      p.queueEntry.update.mockResolvedValue({});

      const resposta = await processarResposta('cb-recusa-1234', {
        resposta: 'NAO',
        motivoRecusa: 'SEM_TRANSPORTE',
        motivoTextoLivre: 'Sem linha de ônibus no horário',
      });

      expect(resposta.ok).toBe(true);
      expect(resposta.statusPaciente).toBe('RECUSOU');
      expect(resposta.proximoConvocado).toBe('pac-proximo-2');

      // Ciclo gravado como RECUSADO com motivo
      expect(p.cicloConfirmacao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ciclo-recusa-1' },
          data: expect.objectContaining({
            status: 'RECUSADO',
            resposta: 'NAO',
            motivoRecusa: 'SEM_TRANSPORTE',
            motivoTextoLivre: 'Sem linha de ônibus no horário',
          }),
        })
      );

      // QueueEntry atualizada para RECUSOU / DECLINED
      expect(p.queueEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'entry-recusa-1' },
          data: expect.objectContaining({
            statusPaciente: 'RECUSOU',
            status: 'DECLINED',
          }),
        })
      );

      // Débito no score de absenteísmo (-5): 92 -> 87
      expect(p.paciente.update).toHaveBeenCalledWith({
        where: { id: 'pac-recusa-1' },
        data: { scoreConfianca: 87 },
      });
      expect(p.historicoAbsenteismo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pacienteId: 'pac-recusa-1',
            queueEntryId: 'entry-recusa-1',
            tipo: 'RECUSOU',
            delta: -5,
            scoreResultante: 87,
            motivo: 'SEM_TRANSPORTE',
          }),
        })
      );

      // Não deve chamar enviarColetaMotivo pois o bot já informou o motivo
      expect(gatewayFake.enviarColetaMotivo).not.toHaveBeenCalled();

      // Convocou o próximo paciente da fila (Beatriz)
      expect(gatewayFake.enviarConvocacao).toHaveBeenCalledWith(
        expect.objectContaining({
          nomePaciente: 'Beatriz Lima',
          queueEntryId: 'entry-proximo-2',
        })
      );
    });

    it('atualização posterior de motivo em ciclo já RECUSADO não duplica débito de score (no double deduction)', async () => {
      // Ciclo já resolvido como RECUSADO
      p.cicloConfirmacao.findUnique.mockResolvedValue({
        id: 'ciclo-recusa-1',
        queueEntryId: 'entry-recusa-1',
        status: 'RECUSADO',
        motivoRecusa: null,
      });
      p.queueEntry.findUnique.mockResolvedValue(entryRecusa);

      // Histórico original de absenteísmo existente
      p.historicoAbsenteismo.findFirst.mockResolvedValue({
        id: 'hist-antigo-1',
        queueEntryId: 'entry-recusa-1',
        tipo: 'RECUSOU',
      });
      p.historicoAbsenteismo.update.mockResolvedValue({});

      const resposta = await processarResposta('cb-recusa-1234', {
        resposta: 'NAO',
        motivoRecusa: 'SEM_TRANSPORTE',
      });

      expect(resposta.ok).toBe(true);
      expect(resposta.mensagem).toContain('Motivo de recusa registrado com sucesso');

      // Atualiza o histórico existente sem chamar historicoAbsenteismo.create nem paciente.update
      expect(p.historicoAbsenteismo.update).toHaveBeenCalledWith({
        where: { id: 'hist-antigo-1' },
        data: { motivo: 'SEM_TRANSPORTE' },
      });
      expect(p.historicoAbsenteismo.create).not.toHaveBeenCalled();
      expect(p.paciente.update).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // 6. Reconfirmação de véspera (dispararProgramados com dias=1)
  // ------------------------------------------------------------------
  describe('6. Reconfirmação de véspera (dispararProgramados com dias=1)', () => {
    const agoraHoje = new Date('2026-10-19T09:00:00Z'); // Hoje é 19/10
    const consultaAmanha = new Date('2026-10-20T10:30:00Z'); // Amanhã é 20/10 (dias = 1)

    const entryConfirmado = {
      id: 'entry-reconf-1',
      pacienteId: 'pac-reconf-1',
      unidadeId: UNIDADE_UUID,
      procedimentoNome: 'Ultrassonografia',
      dataAgendada: consultaAmanha,
      horaAgendada: '10:30',
      statusPaciente: 'CONFIRMADO',
      posicao: 1,
      nivelUrgencia: 'NORMAL',
    };

    it('dispara Etapa 2 para paciente CONFIRMADO na véspera, usa templateReconfirmacao e atualiza para RECONFIRMADO', async () => {
      p.queueEntry.findMany.mockImplementation((args: any) => {
        if (args?.where?.statusPaciente === 'CONFIRMADO') return Promise.resolve([entryConfirmado]);
        return Promise.resolve([]);
      });

      p.cicloConfirmacao.findFirst.mockResolvedValue(null); // Ainda não disparou hoje
      p.paciente.findUnique.mockResolvedValue({
        id: 'pac-reconf-1',
        nomeCompleto: 'Beatriz Lima',
        telefone: '67988882233',
        celular: '',
      });
      p.unidade.findUnique.mockResolvedValue({
        id: UNIDADE_UUID,
        nome: 'UBS Vila Esperança',
      });
      p.cicloConfirmacao.create.mockResolvedValue({ id: 'ciclo-etapa2-1' });
      p.queueEntry.update.mockResolvedValue({});

      const totalDisparos = await dispararProgramados(agoraHoje);

      expect(totalDisparos).toBe(1);

      // Enviou reconfirmação com o template correto
      expect(gatewayFake.enviarConfirmacao).toHaveBeenCalledWith(
        expect.objectContaining({
          nomePaciente: 'Beatriz Lima',
          templateName: config24h.templateReconfirmacao,
          dataAgendada: '20/10/2026',
          horaAgendada: '10:30',
          local: 'UBS Vila Esperança',
          queueEntryId: 'entry-reconf-1',
        })
      );

      // Criou ciclo na etapa 2 com templateReconfirmacao
      expect(p.cicloConfirmacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            queueEntryId: 'entry-reconf-1',
            etapa: 2,
            tentativa: 1,
            status: 'CONVOCADO',
            templateName: config24h.templateReconfirmacao,
          }),
        })
      );

      // Atualizou statusPaciente para RECONFIRMADO e status AWAITING_RESPONSE
      expect(p.queueEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'entry-reconf-1' },
          data: expect.objectContaining({
            statusPaciente: 'RECONFIRMADO',
            status: 'AWAITING_RESPONSE',
          }),
        })
      );
    });

    it('não dispara Etapa 2 se já tiver sido disparado hoje para a mesma entrada', async () => {
      p.queueEntry.findMany.mockImplementation((args: any) => {
        if (args?.where?.statusPaciente === 'CONFIRMADO') return Promise.resolve([entryConfirmado]);
        return Promise.resolve([]);
      });
      p.cicloConfirmacao.findFirst.mockResolvedValue({ id: 'ciclo-existente-hoje' });

      const totalDisparos = await dispararProgramados(agoraHoje);

      expect(totalDisparos).toBe(0);
      expect(gatewayFake.enviarConfirmacao).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // 7. Lembrete de 4 horas antes da consulta (verificarLembretes4Horas)
  // ------------------------------------------------------------------
  describe('7. Lembrete de 4 horas antes da consulta (verificarLembretes4Horas)', () => {
    const agoraDiaConsulta = new Date('2026-10-20T08:00:00Z'); // 08:00 UTC

    const entryConsultaHoje = {
      id: 'entry-lembrete-1',
      pacienteId: 'pac-reconf-1',
      unidadeId: UNIDADE_UUID,
      procedimentoNome: 'Ultrassonografia',
      dataAgendada: new Date('2026-10-20T00:00:00Z'),
      horaAgendada: '10:30', // Faltam 150 minutos (0 <= 150 <= 240)
      statusPaciente: 'RECONFIRMADO',
      lembreteEnviadoEm: null,
    };

    it('envia lembrete quando 0 <= diffMinutos <= 240 e grava lembreteEnviadoEm', async () => {
      p.queueEntry.findMany.mockResolvedValue([entryConsultaHoje]);
      p.paciente.findUnique.mockResolvedValue({
        id: 'pac-reconf-1',
        nomeCompleto: 'Beatriz Lima',
        telefone: '67988882233',
        celular: '',
      });
      p.unidade.findUnique.mockResolvedValue({
        id: UNIDADE_UUID,
        nome: 'UBS Vila Esperança',
      });
      p.queueEntry.update.mockResolvedValue({});

      const enviados = await verificarLembretes4Horas(agoraDiaConsulta);

      expect(enviados).toBe(1);
      expect(gatewayFake.enviarLembrete).toHaveBeenCalledWith(
        expect.objectContaining({
          nomePaciente: 'Beatriz Lima',
          procedimento: 'Ultrassonografia',
          dataAgendada: '20/10/2026',
          horaAgendada: '10:30',
          local: 'UBS Vila Esperança',
          queueEntryId: 'entry-lembrete-1',
        })
      );

      expect(p.queueEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-lembrete-1' },
        data: { lembreteEnviadoEm: agoraDiaConsulta },
      });
    });

    it('é idempotente em re-execuções (não reenvia se lembreteEnviadoEm já estiver definido)', async () => {
      // Query busca apenas com lembreteEnviadoEm: null
      p.queueEntry.findMany.mockResolvedValue([]);

      const enviados = await verificarLembretes4Horas(agoraDiaConsulta);

      expect(enviados).toBe(0);
      expect(gatewayFake.enviarLembrete).not.toHaveBeenCalled();
    });

    it('não envia lembrete para consultas fora da janela de 4h (> 240 minutos ou no passado)', async () => {
      const entryLonge = {
        ...entryConsultaHoje,
        horaAgendada: '16:00', // 480 minutos à frente (> 240)
      };
      p.queueEntry.findMany.mockResolvedValue([entryLonge]);

      const enviados = await verificarLembretes4Horas(agoraDiaConsulta);

      expect(enviados).toBe(0);
      expect(gatewayFake.enviarLembrete).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // 8. Timeouts, reenvios e esgotamento de tentativas (verificarTimeouts)
  // ------------------------------------------------------------------
  describe('8. Timeouts, reenvios e esgotamento de tentativas (verificarTimeouts)', () => {
    const agoraTimeout = new Date('2026-10-21T12:00:00Z');

    const entryPendente = {
      id: 'entry-timeout-1',
      pacienteId: 'pac-timeout-1',
      unidadeId: UNIDADE_UUID,
      procedimentoNome: 'Ultrassonografia',
      statusPaciente: 'CONVOCADO',
      dataAgendada: new Date('2026-10-25T10:00:00Z'),
    };

    it('reenvia notificação incrementando tentativa quando tentativa <= qtdReenvios (ex: tentativa 1 de 2)', async () => {
      const cicloExpiradoTentativa1 = {
        id: 'ciclo-timeout-1',
        queueEntryId: 'entry-timeout-1',
        etapa: 1,
        tentativa: 1, // <= config.qtdReenvios (2)
        status: 'CONVOCADO',
        expiraEm: new Date('2026-10-21T10:00:00Z'), // Expirou às 10:00
      };

      p.cicloConfirmacao.findMany.mockResolvedValue([cicloExpiradoTentativa1]);
      p.queueEntry.findUnique.mockResolvedValue(entryPendente);
      p.paciente.findUnique.mockResolvedValue({
        id: 'pac-timeout-1',
        nomeCompleto: 'Daniel Costa',
        telefone: '67977773344',
      });
      p.unidade.findUnique.mockResolvedValue({ id: UNIDADE_UUID, nome: 'UBS Central' });
      p.cicloConfirmacao.update.mockResolvedValue({});
      p.cicloConfirmacao.create.mockResolvedValue({ id: 'ciclo-timeout-2' });
      p.queueEntry.update.mockResolvedValue({});

      const resultado = await verificarTimeouts(agoraTimeout);

      expect(resultado.reenviados).toBe(1);
      expect(resultado.naoResponderam).toBe(0);

      // Marca o ciclo vencido como EXPIRADO
      expect(p.cicloConfirmacao.update).toHaveBeenCalledWith({
        where: { id: 'ciclo-timeout-1' },
        data: { status: 'EXPIRADO' },
      });

      // Cria novo ciclo com tentativa = 2
      expect(p.cicloConfirmacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            queueEntryId: 'entry-timeout-1',
            etapa: 1,
            tentativa: 2,
            status: 'CONVOCADO',
          }),
        })
      );

      // Reenvia mensagem via gateway
      expect(gatewayFake.enviarConfirmacao).toHaveBeenCalledTimes(1);
    });

    it('esgota tentativas (tentativa > qtdReenvios): marca ciclo EXPIRADO, QueueEntry NAO_RESPONDEU, debita -15 e convoca próximo', async () => {
      const cicloEsgotadoTentativa3 = {
        id: 'ciclo-timeout-3',
        queueEntryId: 'entry-timeout-1',
        etapa: 1,
        tentativa: 3, // > config.qtdReenvios (2)
        status: 'CONVOCADO',
        expiraEm: new Date('2026-10-21T10:00:00Z'),
      };

      p.cicloConfirmacao.findMany.mockResolvedValue([cicloEsgotadoTentativa3]);
      p.queueEntry.findUnique.mockResolvedValue(entryPendente);
      p.paciente.findUnique
        .mockResolvedValueOnce({
          id: 'pac-timeout-1',
          nomeCompleto: 'Daniel Costa',
          scoreConfianca: 80,
        })
        .mockResolvedValueOnce({
          id: 'pac-proximo-3',
          nomeCompleto: 'Eduarda Santos',
          telefone: '67966665544',
        });

      // Próximo da fila para ser convocado após desistência por timeout
      const proximoEntry = {
        id: 'entry-proximo-3',
        pacienteId: 'pac-proximo-3',
        unidadeId: UNIDADE_UUID,
        procedimentoNome: 'Ultrassonografia',
        posicao: 3,
        statusPaciente: 'AGUARDANDO',
        nivelUrgencia: 'NORMAL',
        dataAgendada: new Date('2026-10-25T10:00:00Z'),
      };
      p.queueEntry.findMany.mockImplementation((args: any) => {
        if (args?.where?.statusPaciente === 'AGUARDANDO') return Promise.resolve([proximoEntry]);
        return Promise.resolve([]);
      });
      p.cicloConfirmacao.update.mockResolvedValue({});
      p.queueEntry.update.mockResolvedValue({});
      p.cicloConfirmacao.create.mockResolvedValue({ id: 'ciclo-proximo-3' });

      const resultado = await verificarTimeouts(agoraTimeout);

      expect(resultado.reenviados).toBe(0);
      expect(resultado.naoResponderam).toBe(1);

      // Marca ciclo como EXPIRADO
      expect(p.cicloConfirmacao.update).toHaveBeenCalledWith({
        where: { id: 'ciclo-timeout-3' },
        data: { status: 'EXPIRADO' },
      });

      // Marca QueueEntry como NAO_RESPONDEU / EXPIRED
      expect(p.queueEntry.update).toHaveBeenCalledWith({
        where: { id: 'entry-timeout-1' },
        data: { statusPaciente: 'NAO_RESPONDEU', status: 'EXPIRED' },
      });

      // Aplica penalidade máxima de absenteísmo (-15): 80 -> 65
      expect(p.paciente.update).toHaveBeenCalledWith({
        where: { id: 'pac-timeout-1' },
        data: { scoreConfianca: 65 },
      });
      expect(p.historicoAbsenteismo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pacienteId: 'pac-timeout-1',
            queueEntryId: 'entry-timeout-1',
            tipo: 'NAO_RESPONDEU',
            delta: -15,
            scoreResultante: 65,
          }),
        })
      );

      // Convoca automaticamente o próximo paciente (Eduarda)
      expect(gatewayFake.enviarConvocacao).toHaveBeenCalledWith(
        expect.objectContaining({
          nomePaciente: 'Eduarda Santos',
          queueEntryId: 'entry-proximo-3',
        })
      );
    });
  });

  // ------------------------------------------------------------------
  // 9. Cenário Integrado Completo Ponta a Ponta
  // ------------------------------------------------------------------
  describe('9. Cenário Integrado Completo Ponta a Ponta (Simulação Sequencial)', () => {
    it('executa a jornada do paciente: inserção -> convocação -> confirmação -> redefinição -> recusa -> convocação do próximo', async () => {
      // Passo 1: Inserir Paciente 1 na fila
      p.paciente.findFirst.mockResolvedValue(null);
      p.paciente.create.mockResolvedValue({
        id: 'pac-jornada-1',
        nomeCompleto: 'FERNANDO ALVES',
        telefone: '67991112233',
        scoreConfianca: 100,
      });
      p.queueEntry.findFirst.mockResolvedValue(null);
      p.queueEntry.create.mockResolvedValue({
        id: 'entry-jornada-1',
        pacienteId: 'pac-jornada-1',
        unidadeId: UNIDADE_UUID,
        procedimentoNome: 'Cardiologia',
        posicao: 1,
        statusPaciente: 'AGUARDANDO',
      });

      const resInsert = mockResponse();
      await controller.inserirFila(
        mockRequest({
          nomeCompleto: 'Fernando Alves',
          telefone: '67991112233',
          procedimentoNome: 'Cardiologia',
          unidadeId: UNIDADE_UUID,
        }),
        resInsert
      );
      expect(resInsert.status).toHaveBeenCalledWith(201);

      // Passo 2: Convocação do Paciente 1
      const entryObj = {
        id: 'entry-jornada-1',
        pacienteId: 'pac-jornada-1',
        unidadeId: UNIDADE_UUID,
        procedimentoNome: 'Cardiologia',
        statusPaciente: 'AGUARDANDO',
        dataAgendada: new Date('2026-10-30T09:00:00Z'),
      };
      p.queueEntry.findUnique.mockResolvedValue(entryObj);
      p.paciente.findUnique.mockResolvedValue({
        id: 'pac-jornada-1',
        nomeCompleto: 'FERNANDO ALVES',
        telefone: '67991112233',
      });
      p.unidade.findUnique.mockResolvedValue({ id: UNIDADE_UUID, nome: 'Centro de Especialidades' });
      p.cicloConfirmacao.create.mockResolvedValue({
        id: 'ciclo-jornada-1',
        callbackId: 'cb-jornada-1',
        status: 'CONVOCADO',
      });

      await convocarEntrada(UNIDADE_UUID, 'entry-jornada-1');
      expect(gatewayFake.enviarConvocacao).toHaveBeenCalledTimes(1);

      // Passo 3: Paciente 1 confirma presença (SIM)
      p.cicloConfirmacao.findUnique.mockResolvedValue({
        id: 'ciclo-jornada-1',
        queueEntryId: 'entry-jornada-1',
        etapa: 1,
        status: 'CONVOCADO',
      });
      const resSim = await processarResposta('cb-jornada-1', { resposta: 'SIM' });
      expect(resSim.ok).toBe(true);
      expect(resSim.statusPaciente).toBe('CONFIRMADO');

      // Passo 4: Regulador redefine entrada de Paciente 1
      const resRedefinir = mockResponse();
      p.queueEntry.findUnique.mockResolvedValue({
        id: 'entry-jornada-1',
        statusPaciente: 'CONFIRMADO',
      });
      await controller.redefinirEntrada(
        mockRequest({}, { queueEntryId: 'entry-jornada-1' }),
        resRedefinir
      );
      expect(p.cicloConfirmacao.deleteMany).toHaveBeenCalledWith({
        where: { queueEntryId: 'entry-jornada-1' },
      });

      // Passo 5: Paciente 1 é re-convocado e responde NÃO com motivo
      p.cicloConfirmacao.findUnique.mockResolvedValue({
        id: 'ciclo-jornada-2',
        queueEntryId: 'entry-jornada-1',
        etapa: 1,
        status: 'CONVOCADO',
      });
      p.queueEntry.findUnique.mockResolvedValue({
        id: 'entry-jornada-1',
        pacienteId: 'pac-jornada-1',
        unidadeId: UNIDADE_UUID,
        procedimentoNome: 'Cardiologia',
        statusPaciente: 'CONVOCADO',
      });
      p.paciente.findUnique.mockImplementation(async (args: any) => {
        if (args?.where?.id === 'pac-jornada-1') {
          return {
            id: 'pac-jornada-1',
            nomeCompleto: 'FERNANDO ALVES',
            telefone: '67991112233',
            scoreConfianca: 100,
          };
        }
        if (args?.where?.id === 'pac-jornada-2') {
          return {
            id: 'pac-jornada-2',
            nomeCompleto: 'GABRIELA DIAS',
            telefone: '67992223344',
            scoreConfianca: 100,
          };
        }
        return null;
      });

      // Paciente 2 está AGUARDANDO e é o próximo
      const entryObj2 = {
        id: 'entry-jornada-2',
        pacienteId: 'pac-jornada-2',
        unidadeId: UNIDADE_UUID,
        procedimentoNome: 'Cardiologia',
        posicao: 2,
        statusPaciente: 'AGUARDANDO',
        nivelUrgencia: 'NORMAL',
      };
      p.queueEntry.findMany.mockResolvedValue([entryObj2]);

      const resNao = await processarResposta('cb-jornada-2', {
        resposta: 'NAO',
        motivoRecusa: 'SEM_TRANSPORTE',
      });

      expect(resNao.ok).toBe(true);
      expect(resNao.statusPaciente).toBe('RECUSOU');
      expect(resNao.proximoConvocado).toBe('pac-jornada-2');

      // Verifica convocação de Gabriela (Paciente 2)
      expect(gatewayFake.enviarConvocacao).toHaveBeenCalledWith(
        expect.objectContaining({
          nomePaciente: 'GABRIELA DIAS',
          queueEntryId: 'entry-jornada-2',
        })
      );
    });
  });
});
