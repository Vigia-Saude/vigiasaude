import axios from 'axios';
import { randomUUID } from 'crypto';
import prisma from '../../config/prisma';
import type {
  IMessagingGateway,
  GatewayResult,
  EnviarConfirmacaoParams,
  EnviarColetaMotivoParams,
  EnviarConvocacaoParams,
} from './IMessagingGateway';

type Tipo = 'CONFIRMACAO' | 'COLETA_MOTIVO' | 'CONVOCACAO';

interface CorpoEnvio {
  tipo: Tipo;
  telefone: string;
  nomePaciente: string;
  procedimento?: string;
  dataAgendada?: string;
  templateName: string;
  callbackUrl: string;
  callbackId: string;
  webhookSecret?: string;
}

export class ChatBotGateway implements IMessagingGateway {
  private getBaseUrl(): string {
    const raw = process.env.CHATBOT_URL?.trim();
    if (!raw) {
      throw new Error('CHATBOT_URL não configurada para MESSAGING_GATEWAY=chatbot.');
    }
    return raw.replace(/\/+$/, '');
  }

  private getCallbackUrl(): string {
    const raw = (process.env.VIGIA_PUBLIC_URL || '').trim().replace(/\/+$/, '');
    return `${raw}/api/regulacao/confirmacao/callback`;
  }

  private async enviar(
    tipo: Tipo,
    params: {
      telefone: string;
      nomePaciente: string;
      templateName: string;
      callbackId: string;
      procedimento?: string;
      dataAgendada?: string;
    }
  ): Promise<GatewayResult> {
    const base = this.getBaseUrl();
    const apiKey = process.env.CHATBOT_API_KEY?.trim() || '';
    const tenantId = process.env.CHATBOT_TENANT_ID?.trim() || '';
    const callbackUrl = this.getCallbackUrl();
    const webhookSecret = process.env.VIGIA_WEBHOOK_SECRET?.trim() || undefined;

    const endpoint = `${base}/api/saude/enviar-mensagem`;

    const corpo: CorpoEnvio = {
      tipo,
      telefone: params.telefone,
      nomePaciente: params.nomePaciente,
      procedimento: params.procedimento,
      dataAgendada: params.dataAgendada,
      templateName: params.templateName,
      callbackUrl,
      callbackId: params.callbackId,
      webhookSecret,
    };

    console.log(`[ChatBotGateway] Disparando ${tipo} para ${params.telefone} via ${endpoint} (tenant=${tenantId}):`, corpo);

    let messageId = `chatbot.${randomUUID()}`;
    let status = 'SENT';
    let error: string | null = null;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) headers['X-API-Key'] = apiKey;
      if (tenantId) headers['X-Tenant-Id'] = tenantId;

      const resp = await axios.post(endpoint, corpo, {
        headers,
        timeout: 15000,
      });
      const data = resp.data ?? {};
      messageId = data.messageId ?? data.wamid ?? data.id ?? messageId;
      status = data.status ?? 'SENT';
      console.log(`[ChatBotGateway] Mensagem enviada com sucesso! messageId=${messageId}`);
    } catch (err: any) {
      status = 'FAILED';
      error = err?.response?.data?.erro || err?.response?.data?.message || err?.message || 'Falha ao enviar ao ChatBot';
      console.error(`[ChatBotGateway] ERRO ao enviar para ChatBot:`, error, err?.response?.data);

      await prisma.messageLog.create({
        data: {
          direction: 'OUTBOUND',
          wamid: null,
          templateName: params.templateName,
          body: `${tipo} → ${params.telefone}`,
          status: 'FAILED',
          error,
          rawPayload: { tipo, callbackId: params.callbackId, erroDetalhe: err?.response?.data } as any,
        },
      });
      throw new Error(error!);
    }

    await prisma.messageLog.create({
      data: {
        direction: 'OUTBOUND',
        wamid: messageId,
        templateName: params.templateName,
        body: `${tipo} → ${params.telefone}`,
        status: 'SENT',
        rawPayload: { tipo, callbackId: params.callbackId, chatbot: true } as any,
      },
    });

    return { messageId, status };
  }

  async enviarConfirmacao(params: EnviarConfirmacaoParams): Promise<GatewayResult> {
    return this.enviar('CONFIRMACAO', params);
  }

  async enviarColetaMotivo(params: EnviarColetaMotivoParams): Promise<GatewayResult> {
    return this.enviar('COLETA_MOTIVO', params);
  }

  async enviarConvocacao(params: EnviarConvocacaoParams): Promise<GatewayResult> {
    return this.enviar('CONVOCACAO', params);
  }
}
