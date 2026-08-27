// Interface abstrata do gateway de mensagens (seção 6 do documento de requisitos).
//
// Nesta fase existe apenas a implementação `MockMessagingGateway`, que loga no
// console e grava em `MessageLog`. Numa fase futura será criada a implementação
// `ChatBotGateway`, que fará POST real para a API do ChatBot Vinhedo.
//
// O Vigia-Saúde NUNCA envia dados clínicos ao gateway — apenas telefone, nome do
// paciente, procedimento e data (LGPD, seção 2 do documento).

export interface GatewayResult {
  /** Identificador da mensagem devolvido pelo gateway (mock: `mock.<uuid>`). */
  messageId: string;
  /** Status inicial da mensagem (ex.: `SENT`). */
  status: string;
}

export interface EnviarConfirmacaoParams {
  telefone: string;
  nomePaciente: string;
  procedimento: string;
  dataAgendada: string;
  templateName: string;
  /** Correlaciona o disparo com a resposta recebida no callback. */
  callbackId: string;
}

export interface EnviarColetaMotivoParams {
  telefone: string;
  nomePaciente: string;
  templateName: string;
  callbackId: string;
}

export interface EnviarConvocacaoParams {
  telefone: string;
  nomePaciente: string;
  procedimento: string;
  dataAgendada: string;
  templateName: string;
  callbackId: string;
}

export interface IMessagingGateway {
  /** Mensagem de confirmação/reconfirmação de presença (etapas 1..N). */
  enviarConfirmacao(params: EnviarConfirmacaoParams): Promise<GatewayResult>;

  /** Mensagem de coleta do motivo quando o paciente recusa. */
  enviarColetaMotivo(params: EnviarColetaMotivoParams): Promise<GatewayResult>;

  /** Mensagem de convocação quando uma vaga abre para o paciente. */
  enviarConvocacao(params: EnviarConvocacaoParams): Promise<GatewayResult>;
}
