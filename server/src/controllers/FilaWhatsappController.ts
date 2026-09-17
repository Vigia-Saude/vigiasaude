import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import { WhatsAppService } from '../services/whatsapp.service';
import { processarResposta } from '../services/confirmacao.service';

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

  // Webhook POST /api/webhooks/whatsapp (Recepção de Respostas dos Pacientes e Status da Meta)
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
            const messageBody = message?.text?.body || buttonPayload || '';

            await prisma.messageLog.create({
              data: {
                direction: 'INBOUND',
                wamid: message.id,
                body: messageBody,
                status: 'RECEIVED',
                rawPayload: message as any,
              },
            });

            // Se foi clique em botão (confirm:<callbackId> ou decline:<callbackId>)
            if (buttonPayload) {
              const [action, callbackOrQueueId] = buttonPayload.split(':');
              const resposta = action === 'confirm' ? 'SIM' : 'NAO';

              const ciclo = await prisma.cicloConfirmacao.findFirst({
                where: {
                  OR: [
                    { callbackId: callbackOrQueueId },
                    { queueEntryId: callbackOrQueueId },
                  ],
                },
                orderBy: { enviadoEm: 'desc' },
              });

              if (ciclo) {
                await processarResposta(ciclo.callbackId, {
                  resposta,
                  wamid: message.id,
                  timestamp: new Date().toISOString(),
                });
                console.log(`[WhatsApp Webhook] Paciente respondeu ${resposta} (callbackId=${ciclo.callbackId})`);
              }
            } else if (message.text?.body) {
              // Resposta de texto livre (ex: "Sim", "Não", "1", "2")
              const texto = message.text.body.trim().toUpperCase();
              const fromPhone = (message.from || '').replace(/\D/g, '');

              const paciente = await prisma.paciente.findFirst({
                where: {
                  OR: [
                    { telefone: { contains: fromPhone.slice(-8) } },
                    { celular: { contains: fromPhone.slice(-8) } },
                  ],
                },
              });

              if (paciente) {
                const queueEntry = await prisma.queueEntry.findFirst({
                  where: { pacienteId: paciente.id, statusPaciente: 'CONVOCADO' },
                  orderBy: { atualizadoEm: 'desc' },
                });

                if (queueEntry) {
                  const ciclo = await prisma.cicloConfirmacao.findFirst({
                    where: { queueEntryId: queueEntry.id, status: 'CONVOCADO' },
                    orderBy: { enviadoEm: 'desc' },
                  });

                  if (ciclo) {
                    const isSim = ['SIM', 'S', '1', 'CONFIRMO', 'CONFIRMAR', 'QUERO', 'OK'].includes(texto);
                    const isNao = ['NAO', 'NÃO', 'N', '2', 'RECUSAR', 'CANCELAR'].includes(texto);

                    if (isSim) {
                      await processarResposta(ciclo.callbackId, { resposta: 'SIM', wamid: message.id });
                    } else if (isNao) {
                      await processarResposta(ciclo.callbackId, { resposta: 'NAO', wamid: message.id });
                    }
                  }
                }
              }
            }
          }

          // 2) Atualizar status de entrega em tempo real (SENT, DELIVERED, READ, FAILED)
          for (const status of value?.statuses ?? []) {
            if (status.id) {
              const statusUpper = status.status.toUpperCase();
              const errorDetail = status?.errors?.[0]?.message || status?.errors?.[0]?.title || null;

              await prisma.messageLog.updateMany({
                where: { wamid: status.id },
                data: {
                  status: statusUpper as any,
                  error: errorDetail,
                },
              });

              console.log(`[WhatsApp Webhook] Status da mensagem ${status.id} atualizado para ${statusUpper}`);
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao processar Webhook do WhatsApp:', err);
    }
  };
}
