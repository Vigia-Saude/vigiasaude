import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { WhatsAppService } from '../services/whatsapp.service';

export class FilaWhatsappController {
  // GET /api/regulacao/whatsapp/filas
  obterResumoFilas = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const entries = await prisma.queueEntry.findMany({
        select: { status: true }
      });

      const count = (status: string) => entries.filter(e => e.status === status).length;

      const summary = {
        total: entries.length,
        pending: count('PENDING'),
        awaitingResponse: count('AWAITING_RESPONSE'),
        confirmed: count('CONFIRMED'),
        declined: count('DECLINED'),
        expired: count('EXPIRED'),
        cancelled: count('CANCELLED')
      };

      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ erro: err.message });
    }
  };

  // GET /api/regulacao/whatsapp/filas/detalhes
  detalhesFila = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const entries = await prisma.queueEntry.findMany({
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
  dispararProximo = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const nextEntry = await prisma.queueEntry.findFirst({
        where: { status: 'PENDING' },
        orderBy: { posicao: 'asc' }
      });

      if (!nextEntry) {
        res.status(404).json({ erro: 'Nenhum paciente pendente na fila para notificar.' });
        return;
      }

      const paciente = await prisma.paciente.findUnique({
        where: { id: nextEntry.pacienteId }
      });

      const templateName = process.env.WHATSAPP_TEMPLATE_CONFIRMATION || 'confirmacao_agendamento';
      const patientPhone = paciente?.telefone || paciente?.celular || '5567999999999';

      const result = await WhatsAppService.sendConfirmationTemplate({
        to: patientPhone,
        templateName,
        queueEntryId: nextEntry.id,
        patientName: paciente?.nomeCompleto,
        procedureName: 'Consulta / Exame Regulação'
      });

      // Atualiza status para AWAITING_RESPONSE
      const expiraEm = new Date();
      expiraEm.setHours(expiraEm.getHours() + 24);

      await prisma.queueEntry.update({
        where: { id: nextEntry.id },
        data: {
          status: 'AWAITING_RESPONSE',
          notificadoEm: new Date(),
          expiraEm
        }
      });

      // Registra mensagem no log
      await prisma.messageLog.create({
        data: {
          queueEntryId: nextEntry.id,
          pacienteId: nextEntry.pacienteId,
          direction: 'OUTBOUND',
          wamid: result.wamid,
          templateName,
          status: 'SENT',
          rawPayload: result.rawPayload as any
        }
      });

      res.json({ mensagem: 'Disparo efetuado com sucesso!', queueEntryId: nextEntry.id, wamid: result.wamid });
    } catch (err: any) {
      console.error('Erro ao disparar mensagem:', err);
      res.status(500).json({ erro: err.message });
    }
  };

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

  // Webhook POST /api/webhooks/whatsapp (Recepção de Respostas dos Pacientes)
  receiveWebhook = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ status: 'ok' }); // Responde Meta imediatamente

    try {
      const body = req.body;

      for (const entry of body?.entry ?? []) {
        for (const change of entry?.changes ?? []) {
          const value = change?.value;

          // 1) Processar mensagens recebidas dos pacientes
          for (const message of value?.messages ?? []) {
            const buttonPayload: string | undefined =
              message?.interactive?.button_reply?.id ?? message?.button?.payload;

            await prisma.messageLog.create({
              data: {
                direction: 'INBOUND',
                wamid: message.id,
                body: message?.text?.body || buttonPayload || '',
                status: 'RECEIVED',
                rawPayload: message as any
              }
            });

            if (!buttonPayload) continue;

            const [action, queueEntryId] = buttonPayload.split(':');
            if (!queueEntryId || !['confirm', 'decline'].includes(action)) continue;

            const qe = await prisma.queueEntry.findUnique({
              where: { id: queueEntryId }
            });

            if (!qe || qe.status !== 'AWAITING_RESPONSE') continue;

            const newStatus = action === 'confirm' ? 'CONFIRMED' : 'DECLINED';
            await prisma.queueEntry.update({
              where: { id: queueEntryId },
              data: {
                status: newStatus,
                respondidoEm: new Date()
              }
            });

            console.log(`[WhatsApp Webhook] Paciente respondeu ${newStatus} para a vaga ${queueEntryId}`);
          }

          // 2) Atualizar status de entrega (SENT, DELIVERED, READ, FAILED)
          for (const status of value?.statuses ?? []) {
            if (status.id) {
              await prisma.messageLog.updateMany({
                where: { wamid: status.id },
                data: {
                  status: status.status.toUpperCase() as any,
                  error: status?.errors?.[0]?.title || null
                }
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao processar Webhook do WhatsApp:', err);
    }
  };
}
