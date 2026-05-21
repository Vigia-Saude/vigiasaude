export type FornecedorStatus = 'ATIVO' | 'INATIVO';

export interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  email: string;
  whatsapp: string;
  status: FornecedorStatus;
  taxaAceitacao: number;
  categorias: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export type AtaStatus = 'ATIVA' | 'VENCIDA' | 'CANCELADA' | 'EM_REVISAO' | 'ESGOTADA';

export interface Ata {
  id: string;
  numero: string;
  fornecedorNome: string;
  fornecedorCnpj?: string;
  fornecedorId?: string; // para compatibilidade retroativa
  processoLicitatorio?: string;
  numeroPregao?: string;
  numeroEdital?: string;
  vigenciaInicio: string; // ISO date string
  vigenciaFim: string; // ISO date string
  dataInicio: string; // ISO date string para compatibilidade retroativa
  dataFim: string; // ISO date string para compatibilidade retroativa
  valorTeto: number;
  valorConsumido: number;
  status: AtaStatus;
  documentoPdfUrl?: string;
  observacoes?: string;
}

export interface MedicamentoAta {
  id: string;
  ataId: string;
  catmatCodigo?: string;
  nome: string;
  unidadeFornecimento?: string;
  unidadeAta?: string;
  marca?: string;
  modelo?: string;
  precoUnitario: number;
  qtdeInicial: number; // quantidadeInicial no banco
  quantidadeInicial?: number; // compatibilidade retroativa
  quantidadeUsada: number;
  saldoAtual?: number;
  valorTotalItem?: number;
  precoBPS?: number;
  precoCMED?: number;
  observacoes?: string;
  consumos?: AtaConsumo[];
}

export interface AtaConsumo {
  id: string;
  ataId: string;
  ataItemId: string;
  dataConsumo: string; // ISO date
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  setorSolicitante?: string;
  observacao?: string;
  criadoEm: string;
}

export interface CatmatMedicamento {
  id: string;
  codigoBr: string;
  descricao: string;
  unidadeFornecimento: string;
}

export type PedidoCompraStatus = 
  | 'RASCUNHO' 
  | 'PENDENTE' 
  | 'APROVADO' 
  | 'EM_TRANSITO' 
  | 'ENTREGUE' 
  | 'CANCELADO';

export interface PedidoCompraItem {
  medicamentoId: string;
  quantidade: number;
  precoUnitario: number; // Preço no momento do pedido
}

export interface PedidoCompra {
  id: string;
  status: PedidoCompraStatus;
  ataId: string;
  itens: PedidoCompraItem[];
  valorTotal: number;
  dataCriacao: string; // ISO date string
}

export type AuditoriaAcao = 'CRIACAO' | 'ATUALIZACAO' | 'EXCLUSAO' | 'APROVACAO' | 'BLOQUEIO';

export interface Auditoria {
  id: string;
  timestamp: string; // ISO date string
  usuarioId: string;
  acao: AuditoriaAcao;
  entidadeId: string;
  detalhes: string;
  estadoAnterior?: any;
  estadoNovo?: any;
  ip?: string;
  justificativa?: string;
}

export type UserRole = 'COMPRADOR' | 'FORNECEDOR';

export type User = {
  id: string;
  nome: string;
  role: UserRole;
  email: string;
};
