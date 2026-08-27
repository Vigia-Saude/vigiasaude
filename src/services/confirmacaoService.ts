import apiClient from './apiClient';

// ==== Tipos do módulo de Confirmação Automatizada ====

export type PacienteFilaStatus =
  | 'AGUARDANDO'
  | 'CONVOCADO'
  | 'CONFIRMADO'
  | 'RECONFIRMADO'
  | 'RECUSOU'
  | 'NAO_RESPONDEU'
  | 'CANCELADO';

export type NivelUrgencia = 'NORMAL' | 'AMARELO' | 'VERMELHO';

export type MotivoRecusa =
  | 'MELHORA_SINTOMAS'
  | 'SEM_TRANSPORTE'
  | 'COMPROMISSO_TRABALHO'
  | 'PROBLEMAS_FAMILIARES'
  | 'JA_CONSULTOU_PARTICULAR'
  | 'OUTRO';

export interface ConfirmacaoConfig {
  unidadeId?: string | null;
  qtdConfirmacoes: number;
  diasAntesConfirmacao: number[];
  qtdReenvios: number;
  intervaloReenvioHoras: number;
  timeoutRespostaHoras: number;
  horarioInicio: string;
  horarioFim: string;
  timezone: string;
  templateConfirmacao: string;
  templateReconfirmacao: string;
  templateColetaMotivo: string;
  templateConvocacao: string;
  _padrao?: boolean;
}

export interface CicloAtual {
  id: string;
  etapa: number;
  tentativa: number;
  status: 'CONVOCADO' | 'CONFIRMADO' | 'RECUSADO' | 'EXPIRADO';
  templateName: string;
  enviadoEm: string;
  expiraEm: string;
  respondidoEm?: string | null;
  resposta?: string | null;
  motivoRecusa?: MotivoRecusa | null;
  motivoTextoLivre?: string | null;
}

export interface MensagemLog {
  id: string;
  direction: 'OUTBOUND' | 'INBOUND';
  body?: string | null;
  status: string;
  templateName?: string | null;
  criadoEm: string;
}

export interface PacienteFila {
  id: string;
  nomeCompleto: string;
  telefone?: string | null;
  celular?: string | null;
  cartaoSus?: string | null;
  scoreConfianca: number;
}

export interface EntradaConfirmacao {
  id: string;
  posicao: number;
  statusPaciente: PacienteFilaStatus;
  nivelUrgencia: NivelUrgencia;
  procedimentoNome?: string | null;
  dataAgendada?: string | null;
  paciente: PacienteFila | null;
  cicloAtual: CicloAtual | null;
  messages: MensagemLog[];
}

export interface HistoricoAbsenteismoItem {
  id: string;
  tipo: 'CONFIRMOU' | 'RECUSOU' | 'NAO_RESPONDEU';
  motivo?: string | null;
  delta: number;
  scoreResultante: number;
  queueEntryId?: string | null;
  criadoEm: string;
}

export interface AbsenteismoResposta {
  paciente: { id: string; nomeCompleto: string; scoreConfianca: number };
  faixa: 'CONFIAVEL' | 'ATENCAO' | 'ALTO_RISCO';
  historico: HistoricoAbsenteismoItem[];
}

export interface SimularRespostaPayload {
  queueEntryId?: string;
  callbackId?: string;
  resposta: 'SIM' | 'NAO';
  motivoRecusa?: MotivoRecusa;
  motivoTextoLivre?: string;
}

// ==== Chamadas à API ====

export async function getConfirmacaoConfig(): Promise<ConfirmacaoConfig> {
  const { data } = await apiClient.get<ConfirmacaoConfig>('/api/regulacao/config');
  return data;
}

export async function salvarConfirmacaoConfig(
  payload: Partial<ConfirmacaoConfig>
): Promise<ConfirmacaoConfig> {
  const { data } = await apiClient.patch<ConfirmacaoConfig>('/api/regulacao/config', payload);
  return data;
}

export async function listarConfirmacaoDetalhes(): Promise<EntradaConfirmacao[]> {
  const { data } = await apiClient.get<EntradaConfirmacao[]>('/api/regulacao/confirmacao/filas/detalhes');
  return data;
}

export async function dispararManualProximo(): Promise<{ mensagem: string; queueEntryId: string }> {
  const { data } = await apiClient.post('/api/regulacao/confirmacao/disparar-manual');
  return data;
}

export async function convocarPaciente(queueEntryId: string): Promise<{ mensagem: string; queueEntryId: string }> {
  const { data } = await apiClient.post(`/api/regulacao/confirmacao/convocar/${queueEntryId}`);
  return data;
}

export async function simularResposta(payload: SimularRespostaPayload) {
  const { data } = await apiClient.post('/api/regulacao/confirmacao/simular-resposta', payload);
  return data;
}

export async function getAbsenteismo(pacienteId: string): Promise<AbsenteismoResposta> {
  const { data } = await apiClient.get<AbsenteismoResposta>(`/api/regulacao/pacientes/${pacienteId}/absenteismo`);
  return data;
}

// ==== Helpers de apresentação ====

export function faixaScore(score: number): { faixa: 'CONFIAVEL' | 'ATENCAO' | 'ALTO_RISCO'; label: string; emoji: string } {
  if (score >= 80) return { faixa: 'CONFIAVEL', label: 'Confiável', emoji: '🟢' };
  if (score >= 50) return { faixa: 'ATENCAO', label: 'Atenção', emoji: '🟡' };
  return { faixa: 'ALTO_RISCO', label: 'Alto Risco', emoji: '🔴' };
}

export const STATUS_PACIENTE_LABEL: Record<PacienteFilaStatus, string> = {
  AGUARDANDO: 'Aguardando',
  CONVOCADO: 'Convocado',
  CONFIRMADO: 'Confirmado',
  RECONFIRMADO: 'Reconfirmado',
  RECUSOU: 'Recusou',
  NAO_RESPONDEU: 'Não respondeu',
  CANCELADO: 'Cancelado',
};

export const MOTIVO_RECUSA_LABEL: Record<MotivoRecusa, string> = {
  MELHORA_SINTOMAS: 'Melhora dos sintomas',
  SEM_TRANSPORTE: 'Sem transporte',
  COMPROMISSO_TRABALHO: 'Compromisso de trabalho',
  PROBLEMAS_FAMILIARES: 'Problemas familiares',
  JA_CONSULTOU_PARTICULAR: 'Já consultou particular',
  OUTRO: 'Outro motivo',
};
