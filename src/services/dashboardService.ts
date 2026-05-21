import apiClient from './apiClient';

export interface DashboardStats {
  expiringAtasCount: number;
  activeAtasCount: number;
  pendingPdcsCount: number;
  recentPdcs: {
    id: string;
    numero: string;
    descricao: string;
    data: string;
    status: string;
    valorTotal: number;
  }[];
  budget: {
    total: number;
    consumido: number;
    comprometido: number;
    disponivel: number;
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/api/dashboard/stats');
  return response.data;
};
