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

// Implementação REAL do gateway: fala com o ChatBot Vinhedo (seção 5 do
// documento e docs/INTEGRACAO_CHATBOT.md). Ativa com MESSAGING_GATEWAY=chatbot.
//
// Envia apenas dados mínimos (telefone, nome, procedimento, data) — nenhum dado
// clínico sai do Vigia (LGPD). Correlaciona a resposta via callbackId.

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
}

export class ChatBotGateway implements IMessagingGateway {
  private base = process.env.CHATBOT_URL;
  private apiKey = process.env.CHATBOT_API_KEY;
  private tenantId = process.env.CHATBOT_TENANT_ID;
  private callbackUrl = `${process.env.VIGIA_PUBLIC_URL || ''}/api/regulacao/confirmacao/callback`;

  private async enviar(
    tipo: Tipo,
    params: { telefone: string; nomePaciente: string; templateName: string; callbackId: string; procedimento?: string; dataAgendada?: string }
  ): Promise<GatewayResult> {
    if (!this.base) throw new Error('CHATBOT_URL não configurada para MESSAGING_GATEWAY=chatbot.');

    const corpo: CorpoEnvio = {
      tipo,
      telefone: params.telefone,
      nomePaciente: params.nomePaciente,
      procedimento: params.procedimento,
      dataAgendada: params.dataAgendada,
      templateName: params.templateName,
      callbackUrl: this.callbackUrl,
      callbackId: params.callbackId,
    };

    let messageId = `chatbot.${randomUUID()}`;
    let status = 'SENT';
    let error: string | null = null;

    try {
      const resp = await axios.post(`${this.base}/api/saude/enviar-mensagem`, corpo, {
        headers: {
          'X-API-Key': this.apiKey ?? '',
          'X-Tenant-Id': this.tenantId ?? '',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
      const data = resp.data ?? {};
      messageId = data.messageId ?? data.wamid ?? data.id ?? messageId;
      status = data.status ?? 'SENT';
    } catch (err: any) {
      status = 'FAILED';
      error = err?.response?.data?.erro ?? err?.message ?? 'Falha ao enviar ao ChatBot';
      // Registra a falha e propaga (o serviço decide o que fazer).
      await prisma.messageLog.create({
        data: {
          direction: 'OUTBOUND',
          wamid: null,
          templateName: params.templateName,
          body: `${tipo} → ${params.telefone}`,
          status: 'FAILED',
          error,
          rawPayload: { tipo, callbackId: params.callbackId } as any,
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
