import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { ConfirmacaoController } from './ConfirmacaoController';

export class FilaWhatsappController {
  // GET /api/regulacao/whatsapp/filas
  obterResumoFilas = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const grouped = await prisma.queueEntry.groupBy({
        by: ['status'],
        _count: { _all: true },
      });

      const counts: Record<string, number> = {};
      let total = 0;

      for (const item of grouped) {
        counts[item.status] = item._count._all;
        total += item._count._all;
      }

      const summary = {
        total,
        pending: counts['PENDING'] || 0,
        awaitingResponse: counts['AWAITING_RESPONSE'] || 0,
        confirmed: counts['CONFIRMED'] || 0,
        declined: counts['DECLINED'] || 0,
        expired: counts['EXPIRED'] || 0,
        cancelled: counts['CANCELLED'] || 0
      };

      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/whatsapp/filas/detalhes
  detalhesFila = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const take = req.query.limit ? Number(req.query.limit) : 100;
      const page = req.query.page ? Number(req.query.page) : 1;
      const skip = (page - 1) * take;

      const entries = await prisma.queueEntry.findMany({
        take: Math.min(take, 200),
        skip: Math.max(skip, 0),
        orderBy: { posicao: 'asc' },
        include: {
          import: { select: { originalFilename: true } },
          messages: {
            orderBy: { criadoEm: 'desc' },
            take: 5
          }
        }
      });

      // Busca dados dos pacientes cadastrados
      const pacienteIds = entries.map(e => e.pacienteId);
      const pacientes = await prisma.paciente.findMany({
        where: { id: { in: pacienteIds } }
      });
      const pacienteMap = new Map(pacientes.map(p => [p.id, p]));

      const enriched = entries.map(entry => ({
        ...entry,
        paciente: pacienteMap.get(entry.pacienteId) || null
      }));

      res.json(enriched);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // POST /api/regulacao/whatsapp/filas/disparar-proximo
  dispararProximo = new ConfirmacaoController().dispararManual;

  // Webhook GET /api/webhooks/whatsapp (Verificação da Meta)
  verifyWebhook = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'ppsaude-webhook-2026';

    if (mode === 'subscribe' && token === verifyToken) {
      res.status(200).send(challenge);
      return;
    }
    res.sendStatus(403);
  };

  // Webhook POST /api/webhooks/whatsapp (Recepção de Respostas dos Pacientes e Status da Meta)
  receiveWebhook = async (req: Request, res: Response): Promise<void> => {
    res.status(410).json({ erro: 'Use o webhook do ChatBot e o callback autenticado da regulação.' });
  };
}
