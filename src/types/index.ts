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
  valorComprometido?: number;
  valorDisponivel?: number;
  diasRestantes?: number;
  porcentagemVigenciaDecorrente?: number;
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
  qtdeConsumida?: number;
  qtdeComprometida?: number;
  saldoRestante?: number;
  porcentagemConsumida?: number;
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
  principioAtivo?: string | null;
  concentracao?: string | null;
  formaFarmaceutica?: string | null;
  unidadeFornecimento: string;
}

/** Estatística de preços efetivamente pagos por órgãos públicos (BPS). */
export interface ResumoBps {
  precoMediano: number;
  precoMinimo: number;
  precoMaximo: number;
  anoCompra: number;
  amostras: number;
  unidadeFornecimento: string | null;
  /** false = amostras de apresentações diferentes; use só como ordem de grandeza. */
  filtradoPorUnidade: boolean;
}

/** Preço Máximo de Venda ao Governo por apresentação (CMED). */
export interface ApresentacaoCmed {
  produto: string;
  laboratorio: string | null;
  apresentacao: string;
  precoPmvg: number;
  aliquotaIcms: number | null;
  publicadoEm: string;
}

export interface PrecosReferencia {
  codigoBr: string;
  principioAtivo: string | null;
  bps: ResumoBps | null;
  cmed: ApresentacaoCmed[];
  avisos: string[];
}

export type PedidoCompraStatus = 
  | 'RASCUNHO' 
  | 'PENDENTE' 
  | 'APROVADO' 
  | 'EM_TRANSITO' 
  | 'ENTREGUE' 
  | 'CANCELADO'
  | 'ACEITO'
  | 'REJEITADO';

export interface PedidoCompraItem {
  id?: string;
  pedidoId?: string;
  medicamentoId?: string | null;
  medicamentoNome: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  ataItemId?: string | null;
}

export interface PedidoCompra {
  id: string;
  numero: string;
  status: PedidoCompraStatus;
  ataId?: string | null;
  fornecedorId?: string | null;
  valorTotal: number;
  dataSolicitacao: string; // ISO date string
  criadoEm: string; // ISO date string
  justificativa?: string | null;
  itens?: PedidoCompraItem[];
  ata?: {
    id: string;
    numero: string;
  } | null;
  fornecedor?: {
    id: string;
    nomeFantasia: string;
    razaoSocial: string;
  } | null;
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

export type Perfil = 'SECRETARIO_SAUDE' | 'GESTOR_ESTOQUE' | 'FARMACIA' | 'MEDICO' | 'ENTREGADOR' | 'POSTO_SAUDE' | 'REGULADOR' | 'RECEPCIONISTA_UBS' | 'GESTOR_UBS';

export interface User {
  id: string;
  nome: string;
  role: UserRole;
  email?: string;
  cpf?: string;
  perfil?: Perfil | null;
  tenantSchema?: string | null;
  unidadeId?: string | null;
  unidadeNome?: string;
}

// ─── Módulo Regulação ───────────────────────────────────────────────────────────

export type StatusAgendamento = 
  | 'AGUARDANDO_REGULACAO'
  | 'PRE_AGENDADO' 
  | 'AGUARDANDO_RESPOSTA_PACIENTE'
  | 'CONFIRMADO'
  | 'CANCELADO';

export type TipoAtendimento = 'SUS' | 'PARCERIA';

export type SexoPaciente = 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'PREFIRO_NAO_INFORMAR';

export interface Paciente {
  id: string;
  prontuario: string;
  cpf: string;
  cartaoSus?: string | null;
  nomeCompleto: string;
  dataNascimento: string; // ISO date string
  sexo: SexoPaciente;
  orientacaoSexual?: string | null;
  identidadeGenero?: string | null;
  nomeSocial?: string | null;
  municipioNascimento?: string | null;
  nacionalidade: string;
  paisNascimento: string;
  corRaca: string;
  etnia?: string | null;
  tipoSanguineo?: string | null;
  prontuariosAntigos?: string | null;
  alergias?: string | null;
  familia?: string | null;
  area?: string | null;
  subarea?: string | null;
  escolaridade?: string | null;

  celular: string;
  telefone?: string | null;
  email?: string | null;
  nomeMae?: string | null;
  maeDesconhecida: boolean;
  nomePai?: string | null;
  paiDesconhecido: boolean;

  rg?: string | null;
  orgaoEmissor?: string | null;
  ufRg?: string | null;
  dataExpedicaoRg?: string | null;
  nis?: string | null;
  certidaoNascimento?: string | null;
  dataObito?: string | null;
  tituloEleitor?: string | null;
  estadoCivil?: string | null;
  funcionarioExterno: boolean;
  observacao?: string | null;
  profissaoCbo?: string | null;
  localTrabalho?: string | null;

  situacaoRua: boolean;
  cep: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string | null;
  municipio: string;
  localizacao: string;

  unidadeOrigemId?: string | null;
  unidadeOrigemNome?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FilaRegulacao {
  id: string;
  unidadeEsfId: string;
  unidadeEsfNome?: string;
  responsavelEncaminhamento: string;
  acsResponsavel: string;
  pacienteId: string;
  paciente?: Paciente;
  tipoAtendimento: TipoAtendimento;
  procedimentoSolicitado: string;
  observacaoClinica?: string;
  anexoUrl?: string;
  dataAgendada?: string;
  horaAgendada?: string;
  localAgendamento?: string;
  statusAgendamento: StatusAgendamento;
  criadoPorUsuarioId: string;
  criadoPorNome?: string;
  agendadoPorUsuarioId?: string;
  agendadoPorNome?: string;
  criadoEm: string;
  atualizadoEm: string;
}
