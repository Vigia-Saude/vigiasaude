import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('../config/prisma', () => ({
  default: {
    messageLog: {
      create: vi.fn().mockResolvedValue({ id: 'log-123' }),
    },
  },
}));

vi.mock('axios');

import { ChatBotGateway } from '../services/messaging/ChatBotGateway';

describe('ChatBotGateway - Integração com ChatBot Vinhedo', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      CHATBOT_URL: 'https://chatbot.test.gov.br',
      CHATBOT_API_KEY: 'test-api-key-123',
      CHATBOT_TENANT_ID: 'tenant-test-id',
      VIGIA_PUBLIC_URL: 'https://vigia.test.gov.br',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('deve enviar confirmação com payload e headers corretos', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { messageId: 'wamid.123456', status: 'SENT' },
    });

    const gateway = new ChatBotGateway();
    const result = await gateway.enviarConfirmacao({
      telefone: '5567999990001',
      nomePaciente: 'Maria Souza',
      procedimento: 'Mamografia',
      dataAgendada: '02/09/2026',
      templateName: 'confirmacao_agendamento',
      callbackId: '11111111-1111-1111-1111-111111111111',
    });

    expect(result).toEqual({ messageId: 'wamid.123456', status: 'SENT' });
    expect(axios.post).toHaveBeenCalledTimes(1);

    const [url, body, options] = vi.mocked(axios.post).mock.calls[0];
    expect(url).toBe('https://chatbot.test.gov.br/api/saude/enviar-mensagem');
    expect(options?.headers).toEqual({
      'Content-Type': 'application/json',
      'X-API-Key': 'test-api-key-123',
      'X-Tenant-Id': 'tenant-test-id',
    });

    expect(body).toEqual({
      tipo: 'CONFIRMACAO',
      telefone: '5567999990001',
      nomePaciente: 'Maria Souza',
      procedimento: 'Mamografia',
      dataAgendada: '02/09/2026',
      templateName: 'confirmacao_agendamento',
      callbackUrl: 'https://vigia.test.gov.br/api/regulacao/confirmacao/callback',
      callbackId: '11111111-1111-1111-1111-111111111111',
    });
  });

  it('deve enviar convocação com sucesso', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { messageId: 'wamid.789', status: 'SENT' },
    });

    const gateway = new ChatBotGateway();
    const result = await gateway.enviarConvocacao({
      telefone: '5567999990002',
      nomePaciente: 'José Silva',
      procedimento: 'Ultrassom',
      dataAgendada: '05/09/2026',
      templateName: 'convocacao_vaga',
      callbackId: '22222222-2222-2222-2222-222222222222',
    });

    expect(result).toEqual({ messageId: 'wamid.789', status: 'SENT' });
    const [, body] = vi.mocked(axios.post).mock.calls[0];
    expect(body.tipo).toBe('CONVOCACAO');
    expect(body.nomePaciente).toBe('José Silva');
  });

  it('deve enviar coleta de motivo com sucesso', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { messageId: 'wamid.999', status: 'SENT' },
    });

    const gateway = new ChatBotGateway();
    const result = await gateway.enviarColetaMotivo({
      telefone: '5567999990003',
      nomePaciente: 'Ana Lima',
      templateName: 'coleta_motivo_recusa',
      callbackId: '33333333-3333-3333-3333-333333333333',
    });

    expect(result).toEqual({ messageId: 'wamid.999', status: 'SENT' });
    const [, body] = vi.mocked(axios.post).mock.calls[0];
    expect(body.tipo).toBe('COLETA_MOTIVO');
  });

  it('deve registrar erro e lançar exceção quando a chamada falhar', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: {
        data: { erro: 'Template não encontrado.' },
      },
    });

    const gateway = new ChatBotGateway();
    await expect(
      gateway.enviarConfirmacao({
        telefone: '5567999990001',
        nomePaciente: 'Maria Souza',
        procedimento: 'Mamografia',
        dataAgendada: '02/09/2026',
        templateName: 'template_inexistente',
        callbackId: '11111111-1111-1111-1111-111111111111',
      })
    ).rejects.toThrow('Template não encontrado.');
  });
});
