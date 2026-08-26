import apiClient from './apiClient';

export interface PassageiroViagem {
  id: string;
  viagemId: string;
  pacienteId?: string | null;
  nomePaciente: string;
  cartaoSus?: string | null;
  acompanhante?: string | null;
  status: 'PENDENTE' | 'EMBARCOU' | 'NAO_COMPARECEU' | 'DESEMBARCOU';
  motivoAusencia?: string | null;
  paciente?: {
    id: string;
    nomeCompleto: string;
    cartaoSus?: string | null;
    cpf: string;
    celular?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
  };
}

export interface GpsPonto {
  lat: number;
  lng: number;
  timestamp: string;
  etapa?: string;
  precisao?: number;
  velocidade?: number;
}

export interface ViagemTransporte {
  id: string;
  motoristaId: string;
  veiculo: string;
  placa?: string | null;
  origem: string;
  destino: string;
  dataViagem: string;
  status: 'AGENDADA' | 'SAIDA_CIDADE' | 'CHEGADA_DESTINO' | 'RETORNO_DESTINO' | 'CONCLUIDA' | 'CANCELADA';
  
  // 4 Etapas
  saidaOrigemEm?: string | null;
  chegadaDestinoEm?: string | null;
  saidaDestinoEm?: string | null;
  chegadaOrigemEm?: string | null;

  gpsInicioLat?: number | null;
  gpsInicioLng?: number | null;
  gpsFimLat?: number | null;
  gpsFimLng?: number | null;
  gpsPontos?: GpsPonto[] | null;
  
  assinaturaBase64?: string | null;
  observacoes?: string | null;
  iniciadaEm?: string | null;
  concluidaEm?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  motorista?: {
    id: string;
    nome: string;
    email: string;
    cpf?: string;
    telefone?: string;
  };
  passageiros: PassageiroViagem[];
}

export interface RelatorioViagemResponse {
  viagem: ViagemTransporte;
  resumo: {
    totalPassageiros: number;
    embarcados: number;
    ausentes: number;
    totalPontosGps: number;
    tempoTotalMinutos: number | null;
  };
}

export const viagemService = {
  listar: async (params?: { status?: string; data?: string }): Promise<ViagemTransporte[]> => {
    const { data } = await apiClient.get<ViagemTransporte[]>('/api/motorista/viagens', { params });
    return data;
  },

  obterPorId: async (id: string): Promise<ViagemTransporte> => {
    const { data } = await apiClient.get<ViagemTransporte>(`/api/motorista/viagens/${id}`);
    return data;
  },

  criar: async (payload: {
    veiculo: string;
    placa?: string;
    origem?: string;
    destino: string;
    dataViagem: string;
    observacoes?: string;
    motoristaId?: string;
    passageiros?: {
      pacienteId?: string;
      nomePaciente: string;
      cartaoSus?: string;
      acompanhante?: string;
    }[];
  }): Promise<ViagemTransporte> => {
    const { data } = await apiClient.post<ViagemTransporte>('/api/motorista/viagens', payload);
    return data;
  },

  avancarEtapa: async (id: string, payload: {
    etapa: 'SAIDA_CIDADE' | 'CHEGADA_DESTINO' | 'RETORNO_DESTINO' | 'CONCLUIDA';
    lat?: number;
    lng?: number;
    assinaturaBase64?: string;
    observacoes?: string;
  }): Promise<ViagemTransporte> => {
    const { data } = await apiClient.patch<ViagemTransporte>(`/api/motorista/viagens/${id}/etapa`, payload);
    return data;
  },

  registrarPontoGps: async (id: string, ponto: { lat: number; lng: number; precisao?: number; velocidade?: number }): Promise<{ success: boolean; totalPontos: number }> => {
    const { data } = await apiClient.post<{ success: boolean; totalPontos: number }>(`/api/motorista/viagens/${id}/gps`, ponto);
    return data;
  },

  atualizarStatusPassageiro: async (passageiroId: string, status: string, motivoAusencia?: string): Promise<PassageiroViagem> => {
    const { data } = await apiClient.patch<PassageiroViagem>(`/api/motorista/viagens/passageiro/${passageiroId}`, {
      status,
      motivoAusencia
    });
    return data;
  },

  obterRelatorio: async (id: string): Promise<RelatorioViagemResponse> => {
    const { data } = await apiClient.get<RelatorioViagemResponse>(`/api/motorista/viagens/${id}/relatorio`);
    return data;
  }
};
