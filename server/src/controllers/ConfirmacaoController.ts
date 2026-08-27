import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import {
  processarResposta,
  dispararManualProximo,
  convocarEntrada,
  getConfig,
  CONFIG_PADRAO,
  vagasInfo,
  grupoDe,
  type RespostaPayload,
} from '../services/confirmacao.service';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const configSchema = z
  .object({
    qtdConfirmacoes: z.number().int().min(1).max(5),
    diasAntesConfirmacao: z.array(z.number().int().min(0).max(365)).max(10),
    qtdReenvios: z.number().int().min(0).max(10),
    intervaloReenvioHoras: z.number().int().min(1).max(168),
    timeoutRespostaHoras: z.number().int().min(1).max(168),
    horarioInicio: z.string().regex(HHMM),
    horarioFim: z.string().regex(HHMM),
    timezone: z.string().min(1).max(64),
    templateConfirmacao: z.string().min(1).max(120),
    templateReconfirmacao: z.string().min(1).max(120),
    templateColetaMotivo: z.string().min(1).max(120),
    templateConvocacao: z.string().min(1).max(120),
  })
  .partial();

const slotSchema = z.object({
  procedimento: z.string().min(1).max(200),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  capacidadeTotal: z.number().int().min(0).max(1000),
});

const respostaSchema = z.object({
  callbackId: z.string().uuid().optional(),
  queueEntryId: z.string().uuid().optional(),
  resposta: z.enum(['SIM', 'NAO']),
  motivoRecusa: z
    .enum([
      'MELHORA_SINTOMAS',
      'SEM_TRANSPORTE',
      'COMPROMISSO_TRABALHO',
      'PROBLEMAS_FAMILIARES',
      'JA_CONSULTOU_PARTICULAR',
      'OUTRO',
    ])
    .optional(),
  motivoTextoLivre: z.string().max(500).optional(),
  timestamp: z.string().optional(),
  wamid: z.string().optional(),
});

async function resolverCallbackId(queueEntryId: string): Promise<string | null> {
  const ciclo = await prisma.cicloConfirmacao.findFirst({
    where: { queueEntryId, status: 'CONVOCADO' },
    orderBy: { enviadoEm: 'desc' },
  });
  return ciclo?.callbackId ?? null;
}

export class ConfirmacaoController {
  // POST /api/regulacao/confirmacao/disparar-manual
  dispararManual = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const unidadeId = req.user?.unidadeId ?? null;
      const entry = await dispararManualProximo(unidadeId);
      if (!entry) {
        res.status(404).json({ erro: 'Nenhum paciente AGUARDANDO na fila.' });
        return;
      }
      res.json({ mensagem: 'Confirmação disparada para o próximo da fila.', queueEntryId: entry.id });
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // POST /api/regulacao/confirmacao/convocar/:queueEntryId
  convocar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const unidadeId = req.user?.unidadeId ?? null;
      const entry = await convocarEntrada(unidadeId, String(req.params.queueEntryId));
      res.json({ mensagem: 'Paciente convocado.', queueEntryId: entry.id });
    } catch (err: any) {
      res.status(400).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/config
  obterConfig = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const unidadeId = req.user?.unidadeId ?? null;
      const existente = unidadeId
        ? await prisma.configuracaoRegulacao.findUnique({ where: { unidadeId } })
        : null;
      res.json(existente ?? { unidadeId, ...CONFIG_PADRAO, _padrao: true });
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // PATCH /api/regulacao/config
  salvarConfig = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const unidadeId = req.user?.unidadeId ?? null;
      if (!unidadeId) {
        res.status(400).json({ erro: 'Usuário sem unidade associada.' });
        return;
      }
      const parsed = configSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.issues });
        return;
      }
      const config = await prisma.configuracaoRegulacao.upsert({
        where: { unidadeId },
        create: { unidadeId, ...parsed.data },
        update: parsed.data,
      });
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/pacientes/:id/absenteismo
  absenteismo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const pacienteId = String(req.params.id);
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId },
        select: { id: true, nomeCompleto: true, scoreConfianca: true },
      });
      if (!paciente) {
        res.status(404).json({ erro: 'Paciente não encontrado.' });
        return;
      }
      const historico = await prisma.historicoAbsenteismo.findMany({
        where: { pacienteId },
        orderBy: { criadoEm: 'desc' },
        take: 100,
      });
      const faixa =
        paciente.scoreConfianca >= 80 ? 'CONFIAVEL' : paciente.scoreConfianca >= 50 ? 'ATENCAO' : 'ALTO_RISCO';
      res.json({ paciente, faixa, historico });
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/confirmacao/filas/detalhes  (dados enriquecidos p/ o frontend)
  detalhes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const unidadeId = req.user?.unidadeId ?? null;
      const entries = await prisma.queueEntry.findMany({
        where: unidadeId ? { unidadeId } : {},
        orderBy: { posicao: 'asc' },
        take: 300,
        include: {
          ciclos: { orderBy: { enviadoEm: 'desc' }, take: 1 },
          messages: { orderBy: { criadoEm: 'desc' }, take: 10 },
        },
      });
      const pacienteIds = [...new Set(entries.map((e) => e.pacienteId))];
      const pacientes = await prisma.paciente.findMany({
        where: { id: { in: pacienteIds } },
        select: {
          id: true,
          nomeCompleto: true,
          telefone: true,
          celular: true,
          cartaoSus: true,
          scoreConfianca: true,
        },
      });
      const mapa = new Map(pacientes.map((p) => [p.id, p]));
      const enriched = entries.map((e) => ({
        ...e,
        paciente: mapa.get(e.pacienteId) ?? null,
        cicloAtual: e.ciclos[0] ?? null,
      }));
      res.json(enriched);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/slots  — capacidade/vagas + grupos sem capacidade definida
  listarSlots = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const unidadeId = req.user?.unidadeId ?? null;
      const slots = await prisma.slotAgenda.findMany({
        where: unidadeId ? { unidadeId } : {},
        orderBy: [{ data: 'asc' }, { procedimento: 'asc' }],
      });

      const comUso = await Promise.all(
        slots.map(async (s) => ({
          id: s.id,
          procedimento: s.procedimento,
          data: s.data,
          origem: s.origem,
          ...(await vagasInfo(unidadeId, s.procedimento, s.data)),
        }))
      );

      // Grupos com fila ativa mas sem capacidade definida (alerta — seção 4.8)
      const entries = await prisma.queueEntry.findMany({
        where: {
          unidadeId: unidadeId ?? undefined,
          statusPaciente: { in: ['AGUARDANDO', 'CONVOCADO'] },
          dataAgendada: { not: null },
        },
        select: { procedimentoNome: true, procedimentoId: true, dataAgendada: true },
      });
      const mapa = new Map<string, { procedimento: string; data: string; pacientes: number }>();
      for (const e of entries) {
        if (!e.dataAgendada) continue;
        const procedimento = grupoDe(e);
        const dataStr = e.dataAgendada.toISOString().slice(0, 10);
        const chave = `${procedimento}__${dataStr}`;
        const atual = mapa.get(chave) ?? { procedimento, data: dataStr, pacientes: 0 };
        atual.pacientes++;
        mapa.set(chave, atual);
      }
      const pendentes = [...mapa.values()].filter(
        (g) => !slots.some((s) => s.procedimento === g.procedimento && s.data.toISOString().slice(0, 10) === g.data)
      );

      res.json({ slots: comUso, pendentes });
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // PUT /api/regulacao/slots  — define/atualiza a capacidade de um procedimento/dia
  salvarSlot = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const unidadeId = req.user?.unidadeId ?? null;
      if (!unidadeId) {
        res.status(400).json({ erro: 'Usuário sem unidade associada.' });
        return;
      }
      const parsed = slotSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.issues });
        return;
      }
      const { procedimento, data, capacidadeTotal } = parsed.data;
      const dataDate = new Date(`${data}T00:00:00.000Z`);

      const slot = await prisma.slotAgenda.upsert({
        where: { unidadeId_procedimento_data: { unidadeId, procedimento, data: dataDate } },
        create: { unidadeId, procedimento, data: dataDate, capacidadeTotal, origem: 'MANUAL' },
        update: { capacidadeTotal },
      });

      const info = await vagasInfo(unidadeId, procedimento, dataDate);
      res.json({ ...slot, ...info });
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // POST /api/regulacao/confirmacao/callback  (PÚBLICO — chamado pelo ChatBot)
  callback = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificação opcional de segredo compartilhado (HMAC real = fase futura).
      const secret = process.env.VIGIA_WEBHOOK_SECRET;
      if (secret && req.headers['x-webhook-secret'] !== secret) {
        res.status(401).json({ erro: 'Assinatura do webhook inválida.' });
        return;
      }
      const parsed = respostaSchema.safeParse(req.body);
      if (!parsed.success || !parsed.data.callbackId) {
        res.status(400).json({ erro: 'Payload inválido (callbackId obrigatório).' });
        return;
      }
      const { callbackId, ...payload } = parsed.data;
      const resultado = await processarResposta(callbackId, payload as RespostaPayload);
      res.status(resultado.ok ? 200 : 409).json(resultado);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // POST /api/regulacao/confirmacao/simular-resposta  (DEV — REGULADOR)
  // Injeta um callback simulado por callbackId OU queueEntryId, sem WhatsApp real.
  simularResposta = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parsed = respostaSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.issues });
        return;
      }
      let { callbackId } = parsed.data;
      if (!callbackId && parsed.data.queueEntryId) {
        callbackId = (await resolverCallbackId(parsed.data.queueEntryId)) ?? undefined;
      }
      if (!callbackId) {
        res.status(404).json({ erro: 'Nenhum ciclo CONVOCADO encontrado para simular a resposta.' });
        return;
      }
      const { callbackId: _c, queueEntryId: _q, ...payload } = parsed.data;
      const resultado = await processarResposta(callbackId, payload as RespostaPayload);
      res.status(resultado.ok ? 200 : 409).json(resultado);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };
}
