import type { IMessagingGateway } from './IMessagingGateway';
import { MockMessagingGateway } from './MockMessagingGateway';
import { ChatBotGateway } from './ChatBotGateway';

export type { IMessagingGateway } from './IMessagingGateway';

let instancia: IMessagingGateway | null = null;

// Factory: seleciona a implementação do gateway por variável de ambiente.
//   MESSAGING_GATEWAY=mock     (padrão nesta fase) → MockMessagingGateway
//   MESSAGING_GATEWAY=chatbot  → ChatBotGateway (stub, fase futura)
export function getMessagingGateway(): IMessagingGateway {
  if (instancia) return instancia;

  const modo = (process.env.MESSAGING_GATEWAY || 'mock').toLowerCase();
  instancia = modo === 'chatbot' ? new ChatBotGateway() : new MockMessagingGateway();

  if (modo !== 'chatbot' && modo !== 'mock') {
    console.warn(`[messaging] MESSAGING_GATEWAY="${modo}" desconhecido; usando mock.`);
  }
  return instancia;
}

// Permite injetar um gateway nos testes.
export function setMessagingGateway(gw: IMessagingGateway | null): void {
  instancia = gw;
}
