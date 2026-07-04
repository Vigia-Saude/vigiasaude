import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Upload config para Regulação (PDF + Imagens) ───────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadRegulacaoConfig = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Apenas PDF ou imagens (JPEG/PNG) são permitidos!'));
  },
});

export class RegulacaoController {
  // POST /api/regulacao
  criar = async (req: AuthRequest, res: Response) => {
    const {
      unidadeEsfId,
      responsavelEncaminhamento,
      acsResponsavel,
      pacienteId,
      tipoAtendimento,
      procedimentoSolicitado,
      observacaoClinica,
    } = req.body;

    // Validações de campos obrigatórios
    if (
      !responsavelEncaminhamento ||
      !acsResponsavel ||
      !pacienteId ||
      !procedimentoSolicitado
    ) {
      res.status(400).json({ erro: 'Campos obrigatórios: responsavelEncaminhamento, acsResponsavel, pacienteId, procedimentoSolicitado.' });
      return;
    }

    try {
      // Verificar se o paciente existe
      const paciente = await prisma.paciente.findUnique({
        where: { id: pacienteId }
      });

      if (!paciente) {
        res.status(400).json({ erro: 'Paciente selecionado não encontrado no sistema.' });
        return;
      }

      // Determinar unidadeEsfId: POSTO_SAUDE usa req.user.unidadeId automaticamente
      let finalUnidadeEsfId = unidadeEsfId;
      if (req.user?.perfil === 'POSTO_SAUDE' && req.user?.unidadeId) {
        finalUnidadeEsfId = req.user.unidadeId;
      }

      if (!finalUnidadeEsfId) {
        res.status(400).json({ erro: 'Unidade ESF é obrigatória.' });
        return;
      }

      // Salvar anexo no disco se enviado
      let anexoUrl: string | null = null;
      if (req.file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(req.file.originalname).toLowerCase();
        const filename = `regulacao-${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadDir, filename);
        await fs.promises.writeFile(filePath, req.file.buffer);
        anexoUrl = `/uploads/${filename}`;
      }

      const ficha = await prisma.filaRegulacao.create({
        data: {
          unidadeEsfId: finalUnidadeEsfId,
          responsavelEncaminhamento,
          acsResponsavel,
          pacienteId,
          tipoAtendimento: tipoAtendimento || 'SUS',
          procedimentoSolicitado,
          observacaoClinica: observacaoClinica || null,
          anexoUrl,
          statusAgendamento: 'AGUARDANDO_REGULACAO',
          criadoPorUsuarioId: req.user!.id,
        },
        include: {
          paciente: true,
          unidadeEsf: { select: { id: true, nome: true } }
        }
      });

      res.status(201).json(ficha);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao criar ficha de regulação.' });
    }
  };

  // GET /api/regulacao
  listar = async (req: AuthRequest, res: Response) => {
    const { status, page = '1', limit = '20' } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
    const take = Math.min(100, Number(limit));

    try {
      const where: Prisma.FilaRegulacaoWhereInput = {};

      // Filtro por perfil
      if (req.user?.perfil === 'POSTO_SAUDE' && req.user?.unidadeId) {
        where.unidadeEsfId = req.user.unidadeId;
      }
      // REGULADOR vê tudo (sem filtro de unidade)

      // Filtro por status
      if (status) {
        where.statusAgendamento = status as any;
      }

      const [total, fichas] = await Promise.all([
        prisma.filaRegulacao.count({ where }),
        prisma.filaRegulacao.findMany({
          where,
          skip,
          take,
          orderBy: { criadoEm: 'desc' },
          include: {
            unidadeEsf: { select: { id: true, nome: true } },
            criadoPor: { select: { id: true, nome: true } },
            paciente: { select: { id: true, nomeCompleto: true, cpf: true, telefone: true } }
          },
        }),
      ]);

      res.json({
        total,
        pagina: Number(page),
        dados: fichas,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar fichas de regulação.' });
    }
  };

  // GET /api/regulacao/:id
  detalhes = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);

    try {
      const ficha = await prisma.filaRegulacao.findUnique({
        where: { id },
        include: {
          unidadeEsf: { select: { id: true, nome: true, endereco: true, telefone: true } },
          criadoPor: { select: { id: true, nome: true, email: true } },
          agendadoPor: { select: { id: true, nome: true, email: true } },
          paciente: true
        },
      });

      if (!ficha) {
        res.status(404).json({ erro: 'Ficha de regulação não encontrada.' });
        return;
      }

      // POSTO_SAUDE só vê fichas da própria unidade
      if (req.user?.perfil === 'POSTO_SAUDE' && req.user?.unidadeId) {
        if (ficha.unidadeEsfId !== req.user.unidadeId) {
          res.status(403).json({ erro: 'Acesso negado: ficha não pertence à sua unidade.' });
          return;
        }
      }

      res.json(ficha);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar detalhes da ficha.' });
    }
  };

  // PATCH /api/regulacao/:id/agendar
  agendar = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const { dataAgendada, horaAgendada, localAgendamento } = req.body;

    if (!dataAgendada || !horaAgendada || !localAgendamento) {
      res.status(400).json({ erro: 'Campos obrigatórios: dataAgendada, horaAgendada, localAgendamento.' });
      return;
    }

    // Validar formato da hora HH:MM
    const horaRegex = /^\d{2}:\d{2}$/;
    if (!horaRegex.test(horaAgendada)) {
      res.status(400).json({ erro: 'Formato de hora inválido. Use: HH:MM' });
      return;
    }

    try {
      const ficha = await prisma.filaRegulacao.findUnique({ where: { id } });

      if (!ficha) {
        res.status(404).json({ erro: 'Ficha de regulação não encontrada.' });
        return;
      }

      const fichaAtualizada = await prisma.filaRegulacao.update({
        where: { id },
        data: {
          dataAgendada: new Date(dataAgendada),
          horaAgendada,
          localAgendamento,
          statusAgendamento: 'PRE_AGENDADO',
          agendadoPorUsuarioId: req.user!.id,
        },
        include: {
          unidadeEsf: { select: { id: true, nome: true } },
          criadoPor: { select: { id: true, nome: true } },
          agendadoPor: { select: { id: true, nome: true } },
          paciente: true
        },
      });

      res.json(fichaAtualizada);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao agendar ficha de regulação.' });
    }
  };

  // PATCH /api/regulacao/:id/avisar-paciente
  avisarPaciente = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);

    try {
      const ficha = await prisma.filaRegulacao.findUnique({
        where: { id },
        include: { paciente: true }
      });

      if (!ficha) {
        res.status(404).json({ erro: 'Ficha de regulação não encontrada.' });
        return;
      }

      if (ficha.statusAgendamento !== 'PRE_AGENDADO') {
        res.status(400).json({ erro: 'Ficha precisa estar com status PRE_AGENDADO para avisar o paciente.' });
        return;
      }

      // Atualizar status
      const fichaAtualizada = await prisma.filaRegulacao.update({
        where: { id },
        data: {
          statusAgendamento: 'AGUARDANDO_RESPOSTA_PACIENTE',
        },
        include: { paciente: true }
      });

      // Gerar payload do webhook (telefone somente dígitos)
      const telefoneDigitos = ficha.paciente.telefone.replace(/\D/g, '');

      const webhookPayload = {
        id: ficha.id,
        nome: ficha.paciente.nomeCompleto,
        telefone: telefoneDigitos,
        procedimento: ficha.procedimentoSolicitado,
        data: ficha.dataAgendada,
        hora: ficha.horaAgendada,
        local: ficha.localAgendamento,
      };

      res.json({
        ficha: fichaAtualizada,
        webhookPayload,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao avisar paciente.' });
    }
  };

  // GET /api/regulacao/consulta-rapida
  consultaRapida = async (req: AuthRequest, res: Response) => {
    const { busca } = req.query;

    if (!busca || String(busca).trim().length === 0) {
      res.status(400).json({ erro: 'Parâmetro de busca é obrigatório.' });
      return;
    }

    const termo = String(busca).trim();

    try {
      const where: Prisma.FilaRegulacaoWhereInput = {
        paciente: {}
      };

      // POSTO_SAUDE filtra pela unidade
      if (req.user?.perfil === 'POSTO_SAUDE' && req.user?.unidadeId) {
        where.unidadeEsfId = req.user.unidadeId;
      }

      // Verificar se é CPF (contém pontos ou traços) ou nome
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (cpfRegex.test(termo)) {
        where.paciente = { cpf: termo };
      } else {
        where.paciente = { nomeCompleto: { contains: termo, mode: 'insensitive' } };
      }

      const fichas = await prisma.filaRegulacao.findMany({
        where,
        include: {
          paciente: {
            select: {
              nomeCompleto: true,
              cpf: true,
            }
          }
        },
        orderBy: { criadoEm: 'desc' },
        take: 20,
      });

      const resultado = fichas.map(f => ({
        id: f.id,
        pacienteId: f.pacienteId,
        paciente: {
          nomeCompleto: f.paciente.nomeCompleto,
          cpf: f.paciente.cpf,
        },
        procedimentoSolicitado: f.procedimentoSolicitado,
        statusAgendamento: f.statusAgendamento,
        dataAgendada: f.dataAgendada,
        horaAgendada: f.horaAgendada,
        localAgendamento: f.localAgendamento,
      }));

      res.json(resultado);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro na consulta rápida.' });
    }
  };

  // PATCH /api/regulacao/:id/status
  atualizarStatus = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const { status } = req.body;

    const statusValidos = ['CONFIRMADO', 'CANCELADO'];
    if (!status || !statusValidos.includes(status)) {
      res.status(400).json({ erro: 'Status inválido. Valores aceitos: CONFIRMADO, CANCELADO.' });
      return;
    }

    try {
      const ficha = await prisma.filaRegulacao.findUnique({ where: { id } });

      if (!ficha) {
        res.status(404).json({ erro: 'Ficha de regulação não encontrada.' });
        return;
      }

      const fichaAtualizada = await prisma.filaRegulacao.update({
        where: { id },
        data: {
          statusAgendamento: status as any,
        },
      });

      res.json(fichaAtualizada);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao atualizar status da ficha.' });
    }
  };
}
