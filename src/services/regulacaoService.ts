import apiClient from './apiClient';

export async function criarFichaRegulacao(formData: FormData) {
  const response = await apiClient.post('/api/regulacao', formData);
  return response.data;
}

export async function listarFilaRegulacao(params?: { status?: string; page?: number; limit?: number }) {
  const response = await apiClient.get('/api/regulacao', { params });
  return response.data;
}

export async function detalhesFichaRegulacao(id: string) {
  const response = await apiClient.get(`/api/regulacao/${id}`);
  return response.data;
}

export async function agendarFichaRegulacao(id: string, data: { dataAgendada: string; horaAgendada: string; localAgendamento: string }) {
  const response = await apiClient.patch(`/api/regulacao/${id}/agendar`, data);
  return response.data;
}

export async function avisarPaciente(id: string) {
  const response = await apiClient.patch(`/api/regulacao/${id}/avisar-paciente`);
  return response.data;
}

export async function consultaRapidaRegulacao(busca: string) {
  const response = await apiClient.get('/api/regulacao/consulta-rapida', { params: { busca } });
  return response.data;
}

export async function atualizarStatusRegulacao(id: string, status: string) {
  const response = await apiClient.patch(`/api/regulacao/${id}/status`, { status });
  return response.data;
}

export async function atualizarFichaRegulacao(id: string, data: any) {
  const response = await apiClient.patch(`/api/regulacao/${id}`, data);
  return response.data;
}

export async function historicoRegulacaoPaciente(pacienteId: string) {
  const response = await apiClient.get('/api/regulacao', { params: { pacienteId, limit: 50 } });
  return response.data;
}
