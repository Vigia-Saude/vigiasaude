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
