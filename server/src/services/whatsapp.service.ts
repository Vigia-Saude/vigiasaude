import axios from 'axios';

interface SendTemplateParams {
  to: string; // Número no formato E.164 (ex: +5567999999999)
  templateName: string; // Nome do template aprovado na Meta
  queueEntryId: string;
  patientName?: string;
  procedureName?: string;
  scheduledDate?: string;
}

export class WhatsAppService {
  private static token = process.env.WHATSAPP_TOKEN;
  private static phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  /**
   * Envia uma mensagem de confirmação de agendamento via WhatsApp Cloud API da Meta
   * com botões interativos de resposta rápida (Sim/Não).
   */
  static async sendConfirmationTemplate(params: SendTemplateParams): Promise<{ wamid: string; rawPayload: any }> {
    const { to, templateName, queueEntryId, patientName, procedureName, scheduledDate } = params;

    // Se o token da Meta não estiver configurado, loga o envio em modo simulação/DEV
    if (!this.token || !this.phoneNumberId) {
      console.log(`[WhatsApp DEV Mode] Simulação de envio para ${to} (QueueID: ${queueEntryId})`);
      return {
        wamid: `wamid.DEV_SIMULATION_${Date.now()}_${queueEntryId}`,
        rawPayload: { simulation: true, to, templateName, queueEntryId }
      };
    }

    const cleanPhone = to.replace(/\D/g, '');
    const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: patientName || 'Paciente' },
              { type: 'text', text: procedureName || 'Procedimento Saúde' },
              { type: 'text', text: scheduledDate || 'Data a definir' }
            ]
          },
          {
            type: 'button',
            sub_type: 'quick_reply',
            index: '0',
            parameters: [{ type: 'payload', payload: `confirm:${queueEntryId}` }]
          },
          {
            type: 'button',
            sub_type: 'quick_reply',
            index: '1',
            parameters: [{ type: 'payload', payload: `decline:${queueEntryId}` }]
          }
        ]
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    const wamid = response.data?.messages?.[0]?.id || `wamid.${Date.now()}`;
    return { wamid, rawPayload: response.data };
  }
}
