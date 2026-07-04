import apiClient from './apiClient';
import type { Paciente } from '../types';

export type CriarPacienteInput = Omit<Paciente, 'id' | 'prontuario' | 'criadoEm' | 'atualizadoEm' | 'unidadeOrigemNome'>;

export async function criarPaciente(data: CriarPacienteInput): Promise<Paciente> {
  const response = await apiClient.post('/api/pacientes', data);
  return response.data;
}

export async function listarPacientes(params?: { busca?: string; page?: number; limit?: number }) {
  const response = await apiClient.get('/api/pacientes', { params });
  return response.data;
}

export async function buscarPacientes(busca: string): Promise<Paciente[]> {
  const response = await apiClient.get('/api/pacientes/busca', { params: { busca } });
  return response.data;
}

export async function detalhesPaciente(id: string): Promise<Paciente> {
  const response = await apiClient.get(`/api/pacientes/${id}`);
  return response.data;
}

export async function atualizarPaciente(id: string, data: Partial<CriarPacienteInput>): Promise<Paciente> {
  const response = await apiClient.patch(`/api/pacientes/${id}`, data);
  return response.data;
}
