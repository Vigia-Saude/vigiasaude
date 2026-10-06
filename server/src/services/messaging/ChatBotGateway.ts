import axios from 'axios';
import { randomUUID } from 'crypto';
import type {
  IMessagingGateway,
  GatewayResult,
  EnviarConfirmacaoParams,
  EnviarColetaMotivoParams,
  EnviarConvocacaoParams,
  EnviarLembreteParams,
} from './IMessagingGateway';

type Tipo = 'CONFIRMACAO' | 'COLETA_MOTIVO' | 'CONVOCACAO' | 'LEMBRETE';

interface CorpoEnvio {
  queueEntryId?: string;
  expiresAt?: string;
  tipo: Tipo;
  telefone: string;
  nomePaciente: string;
  procedimento?: string;
  dataAgendada?: string;
  horaAgendada?: string;
  local?: string;
  templateName: string;
  callbackUrl: string;
  callbackId: string;
  webhookSecret?: string;
}

export class ChatBotGateway implements IMessagingGateway {
  private getBaseUrl(): string {
    const raw = (process.env.CHATBOT_URL || '').trim() || 'https://taxinha-bot.vercel.app';
    return raw.replace(/\/+$/, '');
  }

  private getCallbackUrl(): string {
    const raw = ((process.env.VIGIA_PUBLIC_URL || '').trim() || 'https://api.13.140.41.170.sslip.io').replace(/\/+$/, '');
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
      horaAgendada?: string;
      local?: string;
      queueEntryId?: string;
      pacienteId?: string;
      expiresAt?: string;
    }
  ): Promise<GatewayResult> {
    const base = this.getBaseUrl();
    const apiKey = process.env.CHATBOT_API_KEY?.trim() || '';
    const tenantId = (process.env.CHATBOT_TENANT_ID || '').trim() || 'dd135a7e-5b8c-4c2d-9ca0-b5a67e55b545';
    const callbackUrl = this.getCallbackUrl();
    const webhookSecret = process.env.VIGIA_WEBHOOK_SECRET?.trim() || undefined;

    const endpoint = `${base}/api/saude/enviar-mensagem`;

    const corpo: CorpoEnvio = {
      tipo,
      telefone: params.telefone,
      nomePaciente: params.nomePaciente,
      procedimento: params.procedimento,
      dataAgendada: params.dataAgendada,
      horaAgendada: params.horaAgendada,
      local: params.local,
      templateName: params.templateName,
      callbackUrl,
      callbackId: params.callbackId,
      webhookSecret,
      queueEntryId: params.queueEntryId,
      expiresAt: params.expiresAt,
    };

    if (process.env.NODE_ENV === 'production' && (!apiKey || !webhookSecret)) {
      throw Object.assign(new Error('Configure CHATBOT_API_KEY e VIGIA_WEBHOOK_SECRET antes do envio.'), { definitive: true });
    }
    console.log(`[ChatBotGateway] ${tipo} callback=${params.callbackId} via ${endpoint}`);

    let messageId = '';
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
      messageId = data.messageId ?? data.wamid ?? data.id ?? '';
      status = data.status ?? 'UNKNOWN';
      if (!messageId && !['UNKNOWN','SENDING','FAILED'].includes(status)) throw new Error('Bot não retornou identificador do provedor; resultado incerto.');
      console.log(`[ChatBotGateway] Mensagem enviada com sucesso! messageId=${messageId}`);
    } catch (err: any) {
      status = 'FAILED';
      error = err?.response?.data?.erro || err?.response?.data?.message || err?.message || 'Falha ao enviar ao ChatBot';
      console.error(`[ChatBotGateway] ERRO ao enviar para ChatBot:`, error, err?.response?.data);

      throw Object.assign(new Error(error!), { definitive: !!err?.response && err.response.status < 500 && ![408, 409, 429].includes(err.response.status) });
    }

    return { messageId, status };
  }

  async enviarConfirmacao(params: EnviarConfirmacaoParams): Promise<GatewayResult> {
    return this.enviar('CONFIRMACAO', params);
  }

  async consultarEnvio(callbackId: string): Promise<GatewayResult> {
    const resp = await axios.get(`${this.getBaseUrl()}/api/saude/enviar-mensagem?callbackId=${encodeURIComponent(callbackId)}`, {
      headers: { 'X-API-Key': process.env.CHATBOT_API_KEY || '', 'X-Tenant-Id': process.env.CHATBOT_TENANT_ID || '' },
      timeout: 10000,
    });
    return resp.data;
  }

  async enviarColetaMotivo(params: EnviarColetaMotivoParams): Promise<GatewayResult> {
    return this.enviar('COLETA_MOTIVO', params);
  }

  async enviarConvocacao(params: EnviarConvocacaoParams): Promise<GatewayResult> {
    return this.enviar('CONVOCACAO', params);
  }

  async enviarLembrete(params: EnviarLembreteParams): Promise<GatewayResult> {
    return this.enviar('LEMBRETE', {
      telefone: params.telefone,
      nomePaciente: params.nomePaciente,
      procedimento: params.procedimento,
      dataAgendada: params.dataAgendada,
      horaAgendada: params.horaAgendada,
      local: params.local,
      templateName: 'lembrete_consulta',
      callbackId: params.callbackId || randomUUID(),
      queueEntryId: params.queueEntryId,
      pacienteId: params.pacienteId,
      expiresAt: params.expiresAt,
    });
  }
}
