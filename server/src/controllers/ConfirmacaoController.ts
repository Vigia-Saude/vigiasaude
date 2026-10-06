import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ultimaPosicaoFila } from '../services/filaPosicoes.service';
import { z } from 'zod';
import prisma from '../config/prisma';
import { parseCalendarDate, validPhone } from '../services/regulacaoConfiavel.service';
import { AuthRequest } from '../middlewares/auth';
import {
  processarResposta,
  dispararManualProximo,
  convocarEntrada,
  convocarTodosService,
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
    timezone: z.string().min(1).max(64).refine(value => { try { new Intl.DateTimeFormat('pt-BR', { timeZone: value }); return true; } catch { return false; } }, 'Fuso horário inválido'),
    templateConfirmacao: z.string().min(1).max(120),
    templateReconfirmacao: z.string().min(1).max(120),
    templateColetaMotivo: z.string().min(1).max(120),
    templateConvocacao: z.string().min(1).max(120),
  })
  .partial();

const slotSchema = z.object({
  unidadeId: z.string().uuid(),
  procedimento: z.string().min(1).max(200),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  capacidadeTotal: z.number().int().min(0).max(1000),
});

const respostaSchema = z.object({
  callbackId: z.string().uuid().optional(),
  queueEntryId: z.string().uuid().optional(),
  resposta: z.enum(['SIM', 'NAO']).optional(),
  eventId: z.string().min(1).max(250).optional(),
  eventType: z.enum(['RESPOSTA', 'MOTIVO', 'DELIVERY']).optional(),
  deliveryStatus: z.enum(['SENT', 'DELIVERED', 'READ', 'FAILED', 'ACCEPTED']).optional(),
  error: z.string().max(1000).optional(),
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
}).refine(v => v.eventType === 'DELIVERY' ? !!v.deliveryStatus : !!v.resposta, { message: 'Resposta ou status de entrega obrigatório.' });

const inserirFilaSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome é obrigatório').max(200),
  cartaoSus: z.string().regex(/^\d{15}$/,'CNS deve conter 15 dígitos'),
  dataNascimento: z.string(),
  localAtendimento: z.string().trim().min(3).max(300),
  telefone: z.string().min(8, 'Telefone inválido').max(30),
  procedimentoNome: z.string().min(2, 'Procedimento é obrigatório').max(200),
  dataAgendada: z.string(),
  horaAgendada: z.string().regex(HHMM, 'Hora deve estar no formato HH:MM'),
  unidadeId: z.string().uuid(),
  nivelUrgencia: z.enum(['NORMAL', 'AMARELO', 'VERMELHO']).default('NORMAL'),
});

const atualizarTelefoneSchema = z.object({
  telefone: z.string().min(8, 'Telefone inválido').max(30),
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
      let unidadeId = req.user?.unidadeId ?? null;
      if (!unidadeId) {
        const firstUnidade = (await prisma.unidade.findFirst({ where: { ativa: true } })) || (await prisma.unidade.findFirst());
        unidadeId = firstUnidade?.id ?? null;
      }
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
      const ciclo = await prisma.cicloConfirmacao.findFirst({ where: { queueEntryId: entry.id }, orderBy: { enviadoEm: 'desc' } });
      const statusEnvio = ciclo?.deliveryStatus || 'QUEUED';
      res.json({ mensagem: statusEnvio === 'FAILED' ? `Falha no envio: ${ciclo?.envioErro || 'verifique o disparo'}. A vaga permanece reservada.` : statusEnvio === 'UNKNOWN' ? 'Resultado do envio incerto. A vaga permanece reservada enquanto o sistema confere o disparo.' : 'Convocação registrada. Aguarde a confirmação de entrega do WhatsApp.', statusEnvio, queueEntryId: entry.id });
    } catch (err: any) {
      res.status(400).json({ erro: err.message });
    }
  };

  // POST /api/regulacao/confirmacao/convocar-todos
  convocarTodos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const unidadeId = req.user?.unidadeId ?? null;
      const { procedureName, dataAgendada } = req.body || {};
      const dataParsed = dataAgendada ? new Date(dataAgendada) : null;
      const resultado = await convocarTodosService(unidadeId, procedureName, dataParsed);
      res.json({
        mensagem: `${resultado.convocados} convocação(ões) registrada(s). Confira os estados de entrega e as falhas na lista.`,
        ...resultado,
      });
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
  // O REGULADOR é central do município: enxerga a fila inteira (sem filtro por
  // unidade do usuário), consistente com RegulacaoController.listar.
  detalhes = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const entries = await prisma.queueEntry.findMany({
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
        where: {},
        orderBy: [{ data: 'asc' }, { procedimento: 'asc' }],
      });

      const comUso = await Promise.all(
        slots.map(async (s) => ({
          id: s.id,
          procedimento: s.procedimento,
          data: s.data,
          origem: s.origem,
          unidadeId: s.unidadeId,
          ocupadas: s.ocupadas,
          ...(await vagasInfo(s.unidadeId, s.procedimento, s.data)),
        }))
      );

      // Grupos com fila ativa mas sem capacidade definida (alerta — seção 4.8)
      const entries = await prisma.queueEntry.findMany({
        where: {
          statusPaciente: { in: ['AGUARDANDO', 'CONVOCADO'] },
          dataAgendada: { not: null },
        },
        select: { unidadeId: true, procedimentoNome: true, procedimentoId: true, dataAgendada: true },
      });
      const mapa = new Map<string, { unidadeId: string | null; procedimento: string; data: string; pacientes: number }>();
      for (const e of entries) {
        if (!e.dataAgendada) continue;
        const procedimento = grupoDe(e);
        const dataStr = e.dataAgendada.toISOString().slice(0, 10);
        const chave = `${e.unidadeId}__${procedimento}__${dataStr}`;
        const atual = mapa.get(chave) ?? { unidadeId: e.unidadeId, procedimento, data: dataStr, pacientes: 0 };
        atual.pacientes++;
        mapa.set(chave, atual);
      }
      const pendentes = [...mapa.values()].filter(
        (g) => !slots.some((s) => s.unidadeId === g.unidadeId && s.procedimento === g.procedimento && s.data.toISOString().slice(0, 10) === g.data)
      );

      res.json({ slots: comUso, pendentes });
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // PUT /api/regulacao/slots  — define/atualiza a capacidade de um procedimento/dia
  salvarSlot = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parsed = slotSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.issues });
        return;
      }
      const { procedimento, data, capacidadeTotal } = parsed.data;
      const unidadeId = parsed.data.unidadeId;
      const dataDate = parseCalendarDate(data);
      if (!dataDate) { res.status(400).json({ erro: 'Data inválida.' }); return; }

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
      // Segredo compartilhado obrigatório na integração.
      const secret = process.env.VIGIA_WEBHOOK_SECRET;
      if (!secret || req.headers['x-webhook-secret'] !== secret) {
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
      if (process.env.NODE_ENV === 'production') { res.status(404).json({ erro: 'Simulação indisponível em produção.' }); return; }
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

  // POST /api/regulacao/confirmacao/inserir-fila
  inserirFila = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parsed = inserirFilaSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ erro: 'Dados inválidos', detalhes: parsed.error.issues });
        return;
      }
      const data = parsed.data;
      const telefoneLimpo = data.telefone.replace(/\D/g, '');
      if (!validPhone(telefoneLimpo)) { res.status(400).json({ erro: 'Celular inválido.' }); return; }

      const unidadeId = data.unidadeId;
      if (!await prisma.unidade.findFirst({ where: { id: unidadeId, ativa: true } })) { res.status(400).json({ erro: 'Selecione uma unidade responsável ativa.' }); return; }

      const nascimento = parseCalendarDate(data.dataNascimento);
      if (!nascimento || nascimento > new Date()) { res.status(400).json({ erro: 'Informe a data de nascimento correta.' }); return; }
      const dataAgendada = parseCalendarDate(data.dataAgendada);
      if (!dataAgendada) { res.status(400).json({ erro: 'Informe uma data válida para a agenda.' }); return; }
      const novaEntrada = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('regulacao-importacao'))`;
      // Telefone pode pertencer a uma família; a identidade é o CNS.
      let paciente = await tx.paciente.findFirst({ where: { cartaoSus: data.cartaoSus } });
      if (paciente && (paciente.nomeCompleto.trim().toUpperCase() !== data.nomeCompleto.trim().toUpperCase() || paciente.dataNascimento.getTime() !== nascimento.getTime())) {
        throw new Error('O CNS pertence a um cadastro com nome ou nascimento diferente. Confira os dados.');
      }
      if (!paciente) paciente = await tx.paciente.create({ data: {
        nomeCompleto: data.nomeCompleto.trim().toUpperCase(), telefone: telefoneLimpo, celular: telefoneLimpo,
        cartaoSus: data.cartaoSus, cpf: null, prontuario: `PRONT-${randomUUID()}`, dataNascimento: nascimento,
        sexo: 'OUTRO', cep: '', logradouro: '', numero: '', bairro: '', municipio: '', scoreConfianca: 100,
      } });
      else await tx.paciente.update({ where: { id: paciente.id }, data: { telefone: telefoneLimpo, celular: telefoneLimpo } });

      const existente = await tx.queueEntry.findFirst({ where: { pacienteId: paciente.id, unidadeId, procedimentoNome: data.procedimentoNome.trim(), dataAgendada, horaAgendada: data.horaAgendada, statusPaciente: { in: ['AGUARDANDO','CONVOCADO','CONFIRMADO','RECONFIRMADO'] } } });
      if (existente) return existente;
      const proximaPosicao = (await ultimaPosicaoFila(tx)) + 1;

      const criada = await tx.queueEntry.create({
        data: {
          pacienteId: paciente.id,
          unidadeId,
          procedimentoNome: data.procedimentoNome.trim(),
          posicao: proximaPosicao,
          status: 'PENDING',
          statusPaciente: 'AGUARDANDO',
          nivelUrgencia: data.nivelUrgencia,
          dataAgendada,
          horaAgendada: data.horaAgendada || null,
          localAtendimento: data.localAtendimento,
        },
      });

      return criada;
      });

      res.status(201).json({
        mensagem: 'Paciente inserido na fila com sucesso!',
        queueEntryId: novaEntrada.id,
        pacienteId: novaEntrada.pacienteId,
        statusPaciente: novaEntrada.statusPaciente,
      });
    } catch (err: any) {
      console.error('[ConfirmacaoController] Erro ao inserir na fila:', err);
      res.status(500).json({ erro: err.message || 'Erro interno ao inserir paciente na fila.' });
    }
  };

  // PATCH /api/regulacao/confirmacao/entrada/:queueEntryId/telefone
  atualizarTelefone = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const queueEntryId = String(req.params.queueEntryId);
      const parsed = atualizarTelefoneSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ erro: 'Telefone inválido', detalhes: parsed.error.issues });
        return;
      }
      const telefoneLimpo = parsed.data.telefone.replace(/\D/g, '');
      if (!validPhone(telefoneLimpo)) { res.status(400).json({ erro: 'Celular inválido.' }); return; }

      const entry = await prisma.queueEntry.findUnique({
        where: { id: queueEntryId },
      });
      if (!entry) {
        res.status(404).json({ erro: 'Entrada da fila não encontrada.' });
        return;
      }

      await prisma.paciente.update({
        where: { id: entry.pacienteId },
        data: { telefone: telefoneLimpo, celular: telefoneLimpo },
      });

      res.json({ mensagem: 'Telefone atualizado com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // POST /api/regulacao/confirmacao/entrada/:queueEntryId/redefinir
  redefinirEntrada = async (req: AuthRequest, res: Response): Promise<void> => {
    if (process.env.NODE_ENV === 'production') { res.status(404).json({ erro: 'Reinício de teste indisponível em produção.' }); return; }
    try {
      const queueEntryId = String(req.params.queueEntryId);
      const entry = await prisma.queueEntry.findUnique({
        where: { id: queueEntryId },
      });
      if (!entry) {
        res.status(404).json({ erro: 'Entrada da fila não encontrada.' });
        return;
      }

      const pendente = await prisma.cicloConfirmacao.findFirst({ where: { queueEntryId, deliveryStatus: { in: ['QUEUED','UNKNOWN','ACCEPTED','SENT'] }, status: 'CONVOCADO' } });
      if (pendente) { res.status(409).json({ erro: 'Concilie o envio pendente antes de liberar ou redefinir a vaga.' }); return; }
      await prisma.cicloConfirmacao.updateMany({ where: { queueEntryId, status: 'CONVOCADO' }, data: { status: 'EXPIRADO' } });

      const atualizado = await prisma.queueEntry.update({
        where: { id: queueEntryId },
        data: {
          statusPaciente: 'AGUARDANDO',
          bloqueioEnvio: null,
          status: 'PENDING',
          notificadoEm: null,
          respondidoEm: null,
          expiraEm: null,
          lembreteEnviadoEm: null,
        },
      });

      res.json({
        mensagem: 'Paciente redefinido para AGUARDANDO com sucesso!',
        queueEntryId: atualizado.id,
        statusPaciente: atualizado.statusPaciente,
      });
    } catch (err: any) {
      res.status(500).json({ erro: err.message || 'Erro ao redefinir entrada.' });
    }
  };
}
