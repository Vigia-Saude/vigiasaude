import apiClient from './apiClient';
import type { Ata, MedicamentoAta, PedidoCompra, AtaConsumo, CatmatMedicamento } from '../types';

export interface AtaWithFornecedor extends Ata {
  fornecedorNome: string;
  medicamentos?: MedicamentoAta[];
}

export interface AtaFullDetails extends Ata {
  medicamentos: MedicamentoAta[];
  pedidos: PedidoCompra[];
  consumos: AtaConsumo[];
}

export interface CreateAtaPayload {
  numero: string;
  fornecedorNome: string;
  fornecedorCnpj?: string;
  processoLicitatorio?: string;
  numeroPregao?: string;
  numeroEdital?: string;
  vigenciaInicio: string; // ISO date
  vigenciaFim: string; // ISO date
  valorTeto: number;
  documentoPdfUrl?: string;
  observacoes?: string;
  medicamentos: Array<{
    catmatCodigo?: string;
    nome: string;
    unidadeFornecimento?: string;
    unidadeAta?: string;
    marca?: string;
    modelo?: string;
    precoUnitario: number;
    qtdeInicial: number;
    precoBPS?: number;
    precoCMED?: number;
    observacoes?: string;
  }>;
}

export const getAtas = async (): Promise<AtaWithFornecedor[]> => {
  const response = await apiClient.get<AtaWithFornecedor[]>('/api/atas');
  return response.data;
};

export const getAtaFullDetails = async (id: string): Promise<AtaFullDetails | null> => {
  const response = await apiClient.get<AtaFullDetails>(`/api/atas/${id}`);
  return response.data;
};

export const criarAta = async (payload: CreateAtaPayload): Promise<Ata> => {
  const response = await apiClient.post<Ata>('/api/atas', payload);
  return response.data;
};

export const buscarCatmat = async (query: string): Promise<CatmatMedicamento[]> => {
  if (query.trim().length < 2) return []; // Mínimo de 2 caracteres
  const response = await apiClient.get<CatmatMedicamento[]>('/api/catmat/buscar', { params: { q: query } });
  return response.data;
};

/** Busca um medicamento CATMAT pelo código BR exato */
export const buscarCatmatPorCodigo = async (codigoBr: string): Promise<CatmatMedicamento | null> => {
  try {
    const response = await apiClient.get<CatmatMedicamento>(`/api/catmat/${codigoBr.toUpperCase().trim()}`);
    return response.data;
  } catch {
    return null; // Retorna null se não encontrar
  }
};

export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ url: string }>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const registrarConsumo = async (ataId: string, payload: {
  ataItemId: string;
  quantidade: number;
  valorUnitario: number;
  setorSolicitante?: string;
  observacao?: string;
}): Promise<AtaConsumo> => {
  const response = await apiClient.post<AtaConsumo>(`/api/atas/${ataId}/consumos`, payload);
  return response.data;
};
