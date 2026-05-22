import apiClient from './apiClient';

export interface BackendAuditoriaLog {
  id: string;
  dataHora: string;
  usuarioId: string;
  acao: string;
  entidadeId: string;
  dadosAntes?: any;
  dadosDepois?: any;
  justificativa?: string;
  usuario: {
    nome: string;
    email: string;
    role: string;
  };
}

export const getAuditoriaLogs = async (): Promise<BackendAuditoriaLog[]> => {
  const response = await apiClient.get<BackendAuditoriaLog[]>('/api/auditoria');
  return response.data;
};
