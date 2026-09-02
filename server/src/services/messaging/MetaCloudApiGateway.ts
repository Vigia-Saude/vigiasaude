import axios from 'axios';
import prisma from '../../config/prisma';
import type {
  IMessagingGateway,
  GatewayResult,
  EnviarConfirmacaoParams,
  EnviarColetaMotivoParams,
  EnviarConvocacaoParams,
} from './IMessagingGateway';

function formatarTelefoneWhatsApp(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';

  // Se já começar com 55 e tiver tamanho de telefone brasileiro (12 ou 13 dígitos)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Se tem 10 ou 11 dígitos (DDD + número), adiciona o DDI 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

export class MetaCloudApiGateway implements IMessagingGateway {
  private token: string;
  private phoneNumberId: string;
  private apiVersion: string = 'v21.0';

  constructor() {
    this.token = process.env.WHATSAPP_TOKEN?.trim() || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || '';
  }

  private async enviarMensagem(
    tipo: 'CONFIRMACAO' | 'COLETA_MOTIVO' | 'CONVOCACAO',
    params: {
      telefone: string;
      nomePaciente: string;
      templateName: string;
      callbackId: string;
      corpoTexto: string;
      queueEntryId?: string;
      pacienteId?: string;
      botoes?: Array<{ id: string; title: string }>;
    }
  ): Promise<GatewayResult> {
    const to = formatarTelefoneWhatsApp(params.telefone);
    if (!to) {
      throw new Error(`Telefone inválido ou não informado para ${params.nomePaciente}.`);
    }

    if (!this.token || !this.phoneNumberId) {
      throw new Error('WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurados no servidor.');
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    // 1) Montar payload interativo com botões de resposta rápida
    let payload: any;
    if (params.botoes && params.botoes.length > 0) {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: params.corpoTexto,
          },
          action: {
            buttons: params.botoes.map((b) => ({
              type: 'reply',
              reply: {
                id: b.id,
                title: b.title.slice(0, 20), // limite de 20 caracteres da Meta
              },
            })),
          },
        },
      };
    } else {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: params.corpoTexto,
        },
      };
    }

    console.log(`[MetaCloudAPI] Enviando ${tipo} para ${to} (callbackId=${params.callbackId}):`, JSON.stringify(payload));

    try {
      const resp = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      const messageId = resp.data?.messages?.[0]?.id || `wamid.${Date.now()}`;
      console.log(`[MetaCloudAPI] Mensagem enviada com sucesso para ${to}! wamid=${messageId}`);

      // Registrar no MessageLog com status SENT
      await prisma.messageLog.create({
        data: {
          queueEntryId: params.queueEntryId ?? null,
          pacienteId: params.pacienteId ?? null,
          direction: 'OUTBOUND',
          wamid: messageId,
          templateName: params.templateName,
          body: params.corpoTexto,
          status: 'SENT',
          rawPayload: { tipo, callbackId: params.callbackId, metaResponse: resp.data } as any,
        },
      });

      return { messageId, status: 'SENT' };
    } catch (err: any) {
      const metaError = err.response?.data?.error;
      const errorMsg =
        metaError?.error_user_msg ||
        metaError?.message ||
        err.message ||
        'Falha ao enviar mensagem via Meta Cloud API';

      console.error(`[MetaCloudAPI] ERRO no envio para ${to}:`, {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMsg,
      });

      // Registra a falha no MessageLog para auditoria e exibição no painel
      await prisma.messageLog.create({
        data: {
          queueEntryId: params.queueEntryId ?? null,
          pacienteId: params.pacienteId ?? null,
          direction: 'OUTBOUND',
          wamid: null,
          templateName: params.templateName,
          body: params.corpoTexto,
          status: 'FAILED',
          error: errorMsg,
          rawPayload: { tipo, callbackId: params.callbackId, metaError } as any,
        },
      });

      throw new Error(`WhatsApp Meta: ${errorMsg}`);
    }
  }

  async enviarConfirmacao(params: EnviarConfirmacaoParams): Promise<GatewayResult> {
    const dataStr = params.dataAgendada || 'em breve';
    const procStr = params.procedimento || 'sua consulta/exame';
    const corpo = `Olá, *${params.nomePaciente}*!\n\nSeu agendamento para *${procStr}* está previsto para *${dataStr}*.\n\nPor favor, confirme se você comparecerá:`;

    return this.enviarMensagem('CONFIRMACAO', {
      telefone: params.telefone,
      nomePaciente: params.nomePaciente,
      templateName: params.templateName,
      callbackId: params.callbackId,
      corpoTexto: corpo,
      queueEntryId: params.queueEntryId,
      pacienteId: params.pacienteId,
      botoes: [
        { id: `confirm:${params.callbackId}`, title: 'Sim, confirmo' },
        { id: `decline:${params.callbackId}`, title: 'Não poderei ir' },
      ],
    });
  }

  async enviarColetaMotivo(params: EnviarColetaMotivoParams): Promise<GatewayResult> {
    const corpo = `Entendemos, *${params.nomePaciente}*. Poderia nos informar o motivo da recusa?\n\n1 - Melhora dos sintomas\n2 - Sem transporte\n3 - Compromisso de trabalho\n4 - Outro motivo\n\n_Responda com o número correspondente._`;

    return this.enviarMensagem('COLETA_MOTIVO', {
      telefone: params.telefone,
      nomePaciente: params.nomePaciente,
      templateName: params.templateName,
      callbackId: params.callbackId,
      corpoTexto: corpo,
      queueEntryId: params.queueEntryId,
      pacienteId: params.pacienteId,
    });
  }

  async enviarConvocacao(params: EnviarConvocacaoParams): Promise<GatewayResult> {
    const dataStr = params.dataAgendada || 'em data a ser informada';
    const procStr = params.procedimento || 'seu procedimento';
    const corpo = `Olá, *${params.nomePaciente}*!\n\nAbriu uma vaga prioritária para *${procStr}* prevista para *${dataStr}*.\n\nVocê tem interesse e disponibilidade para comparecer?`;

    return this.enviarMensagem('CONVOCACAO', {
      telefone: params.telefone,
      nomePaciente: params.nomePaciente,
      templateName: params.templateName,
      callbackId: params.callbackId,
      corpoTexto: corpo,
      queueEntryId: params.queueEntryId,
      pacienteId: params.pacienteId,
      botoes: [
        { id: `confirm:${params.callbackId}`, title: 'Sim, quero a vaga' },
        { id: `decline:${params.callbackId}`, title: 'Não poderei ir' },
      ],
    });
  }
}
