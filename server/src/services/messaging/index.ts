import type { IMessagingGateway } from './IMessagingGateway';
import { MockMessagingGateway } from './MockMessagingGateway';
import { ChatBotGateway } from './ChatBotGateway';

export type { IMessagingGateway } from './IMessagingGateway';

let injectedInstance: IMessagingGateway | null = null;

// Factory: seleciona a implementação do gateway dinamicamente a cada requisição.
export function getMessagingGateway(): IMessagingGateway {
  if (injectedInstance) return injectedInstance;

  const modo = (process.env.MESSAGING_GATEWAY || 'mock').toLowerCase().trim();
  console.log(`[messaging] Obtendo gateway de mensageria: modo="${modo}"`);

  if (modo === 'chatbot') {
    return new ChatBotGateway();
  }

  if (modo !== 'mock') {
    console.warn(`[messaging] MESSAGING_GATEWAY="${modo}" desconhecido; usando mock.`);
  }
  return new MockMessagingGateway();
}

// Permite injetar um gateway nos testes.
export function setMessagingGateway(gw: IMessagingGateway | null): void {
  injectedInstance = gw;
}
