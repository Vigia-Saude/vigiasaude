import apiClient from './apiClient';
import type { PedidoCompra, PedidoCompraStatus } from '../types';
import type { PaginatedResponse } from './ataService';

export interface GetPedidosFilters {
  busca?: string;
  fornecedorId?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export const getPedidos = async (filters?: GetPedidosFilters): Promise<PaginatedResponse<PedidoCompra>> => {
  const response = await apiClient.get<PaginatedResponse<PedidoCompra>>('/api/pedidos', { params: filters });
  return response.data;
};

export const getPedidoById = async (id: string): Promise<PedidoCompra | null> => {
  const response = await apiClient.get<PedidoCompra>(`/api/pedidos/${id}`);
  return response.data;
};

export interface CreatePedidoPayload {
  ataId?: string | null;
  fornecedorId?: string | null;
  status: PedidoCompraStatus;
  dataSolicitacao?: string;
  itens: {
    medicamentoId?: string | null;
    medicamentoNome: string;
    quantidade: number;
    precoUnitario: number;
    ataItemId?: string | null;
  }[];
  justificativa?: string;
}

export const createPedido = async (payload: CreatePedidoPayload): Promise<PedidoCompra> => {
  const response = await apiClient.post<PedidoCompra>('/api/pedidos', payload);
  return response.data;
};

export const updatePedido = async (id: string, payload: CreatePedidoPayload): Promise<PedidoCompra> => {
  const response = await apiClient.put<PedidoCompra>(`/api/pedidos/${id}`, payload);
  return response.data;
};

export const updatePedidoStatus = async (id: string, status: string, justificativa?: string): Promise<PedidoCompra> => {
  const response = await apiClient.patch<PedidoCompra>(`/api/pedidos/${id}/status`, { status, justificativa });
  return response.data;
};

export const confirmarEntrega = async (id: string): Promise<PedidoCompra> => {
  const response = await apiClient.patch<PedidoCompra>(`/api/pedidos/${id}/entrega`);
  return response.data;
};
