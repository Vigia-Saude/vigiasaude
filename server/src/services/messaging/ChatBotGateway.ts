import type {
  IMessagingGateway,
  GatewayResult,
  EnviarConfirmacaoParams,
  EnviarColetaMotivoParams,
  EnviarConvocacaoParams,
} from './IMessagingGateway';

// STUB — implementação real para a fase futura.
//
// Fará POST autenticado (X-API-Key AES-256 por município + TLS) para a API do
// ChatBot Vinhedo, conforme o contrato da seção 5 do documento de requisitos:
//   POST {CHATBOT_URL}/api/saude/enviar-mensagem
// e receberá as respostas dos pacientes via callback HMAC-SHA256 em
//   POST {VIGIA_URL}/api/regulacao/confirmacao/callback
//
// Enquanto não implementado, lança erro para deixar claro que `MESSAGING_GATEWAY`
// está configurado como `chatbot` sem a integração pronta.

export class ChatBotGateway implements IMessagingGateway {
  private naoImplementado(metodo: string): never {
    throw new Error(
      `ChatBotGateway.${metodo} ainda não implementado. ` +
        `Defina MESSAGING_GATEWAY=mock nesta fase, ou implemente a integração com o ChatBot Vinhedo.`
    );
  }

  async enviarConfirmacao(_params: EnviarConfirmacaoParams): Promise<GatewayResult> {
    return this.naoImplementado('enviarConfirmacao');
  }

  async enviarColetaMotivo(_params: EnviarColetaMotivoParams): Promise<GatewayResult> {
    return this.naoImplementado('enviarColetaMotivo');
  }

  async enviarConvocacao(_params: EnviarConvocacaoParams): Promise<GatewayResult> {
    return this.naoImplementado('enviarConvocacao');
  }
}
