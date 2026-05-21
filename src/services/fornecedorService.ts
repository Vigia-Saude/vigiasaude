import apiClient from './apiClient';
import type { Fornecedor, Ata } from '../types';

export interface FornecedorDetails extends Fornecedor {
  atas: Ata[];
}

export interface ListFornecedoresParams {
  query?: string;
  status?: string;
  categoria?: string;
}

export const getFornecedores = async (params?: ListFornecedoresParams): Promise<Fornecedor[]> => {
  const response = await apiClient.get<Fornecedor[]>('/api/fornecedores', { params });
  return response.data;
};

export const getFornecedorDetalhes = async (id: string): Promise<FornecedorDetails> => {
  const response = await apiClient.get<FornecedorDetails>(`/api/fornecedores/${id}`);
  return response.data;
};

export const createFornecedor = async (
  data: Omit<Fornecedor, 'id' | 'status' | 'taxaAceitacao' | 'criadoEm' | 'atualizadoEm'>
): Promise<Fornecedor> => {
  const response = await apiClient.post<Fornecedor>('/api/fornecedores', data);
  return response.data;
};

export const updateFornecedor = async (
  id: string,
  data: Partial<Omit<Fornecedor, 'id' | 'cnpj' | 'status' | 'taxaAceitacao' | 'criadoEm' | 'atualizadoEm'>>
): Promise<Fornecedor> => {
  const response = await apiClient.put<Fornecedor>(`/api/fornecedores/${id}`, data);
  return response.data;
};

export const toggleFornecedorStatus = async (id: string): Promise<Fornecedor> => {
  const response = await apiClient.patch<Fornecedor>(`/api/fornecedores/${id}/status`);
  return response.data;
};
