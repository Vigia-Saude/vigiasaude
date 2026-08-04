import apiClient from './apiClient';

export interface CdDashboardStats {
  itensCadastradosCount: number;
  lotesDisponiveisCount: number;
  recebimentosHojeLotes: number;
  recebimentosHojeUnidades: number;
  alertasAtivosCount: number;
}

export const getCdDashboardStats = async (): Promise<CdDashboardStats> => {
  const response = await apiClient.get<CdDashboardStats>('/api/cd/dashboard/stats');
  return response.data;
};

export const getNotasFiscais = async (status?: string) => {
  const url = status ? `/api/cd/notas-fiscais?status=${status}` : '/api/cd/notas-fiscais';
  const response = await apiClient.get(url);
  return response.data?.dados || response.data || [];
};

export interface AtualizarEstoqueMinimoParams {
  medicamentoNome: string;
  catmatCodigo?: string | null;
  quantidadeMinima: number;
}

export const atualizarEstoqueMinimo = async (params: AtualizarEstoqueMinimoParams) => {
  const response = await apiClient.put('/api/cd/estoque/minimo', params);
  return response.data;
};
