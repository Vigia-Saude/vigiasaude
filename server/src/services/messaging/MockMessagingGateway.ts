import { randomUUID } from 'crypto';
import prisma from '../../config/prisma';
import type {
  IMessagingGateway,
  GatewayResult,
  EnviarConfirmacaoParams,
  EnviarColetaMotivoParams,
  EnviarConvocacaoParams,
} from './IMessagingGateway';

// Implementação MOCK do gateway (fase atual).
//
// Não envia WhatsApp real: apenas loga no console e grava a mensagem em
// `MessageLog` (OUTBOUND / SENT), permitindo testar o fluxo completo de
// confirmação sem depender do ChatBot Vinhedo. Retorna um `messageId`
// simulado (`mock.<uuid>`).

async function registrar(
  tipo: 'CONFIRMACAO' | 'COLETA_MOTIVO' | 'CONVOCACAO',
  templateName: string,
  callbackId: string,
  telefone: string,
  corpo: string
): Promise<GatewayResult> {
  const messageId = `mock.${randomUUID()}`;

  // Log legível no console (visível ao regulador em ambiente de dev).
  console.log(
    `[MockGateway] ${tipo} → ${telefone} | template="${templateName}" | callbackId=${callbackId} | msg="${corpo}" | messageId=${messageId}`
  );

  // Persiste no log de mensagens (mesmo audit trail do envio real).
  await prisma.messageLog.create({
    data: {
      direction: 'OUTBOUND',
      wamid: messageId,
      templateName,
      body: corpo,
      status: 'SENT',
      rawPayload: { tipo, callbackId, telefone, mock: true } as any,
    },
  });

  return { messageId, status: 'SENT' };
}

export class MockMessagingGateway implements IMessagingGateway {
  async enviarConfirmacao(params: EnviarConfirmacaoParams): Promise<GatewayResult> {
    const corpo = `Olá ${params.nomePaciente}, sua consulta de ${params.procedimento} está marcada para ${params.dataAgendada}. Você confirma presença? [Sim] [Não]`;
    return registrar('CONFIRMACAO', params.templateName, params.callbackId, params.telefone, corpo);
  }

  async enviarColetaMotivo(params: EnviarColetaMotivoParams): Promise<GatewayResult> {
    const corpo = `Entendemos, ${params.nomePaciente}. Poderia nos informar o motivo? [Melhora dos sintomas] [Sem transporte] [Outro motivo]`;
    return registrar('COLETA_MOTIVO', params.templateName, params.callbackId, params.telefone, corpo);
  }

  async enviarConvocacao(params: EnviarConvocacaoParams): Promise<GatewayResult> {
    const corpo = `Olá ${params.nomePaciente}, abriu uma vaga de ${params.procedimento} para ${params.dataAgendada}. Você confirma presença? [Sim] [Não]`;
    return registrar('CONVOCACAO', params.templateName, params.callbackId, params.telefone, corpo);
  }
}
