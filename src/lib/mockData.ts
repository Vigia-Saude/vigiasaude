import type { Ata, Auditoria, Fornecedor, MedicamentoAta, PedidoCompra } from '../types';

export const mockFornecedores: Fornecedor[] = [
  { 
    id: 'f1', 
    cnpj: '12.345.678/0001-90', 
    razaoSocial: 'MedSupply Nacional LTDA', 
    nomeFantasia: 'MedSupply', 
    status: 'ATIVO', 
    email: 'contato@medsupply.com.br', 
    whatsapp: '(11) 99999-9999',
    taxaAceitacao: 98.5,
    categorias: ['Medicamentos', 'Material Hospitalar'],
    criadoEm: '2025-01-10T00:00:00Z',
    atualizadoEm: '2025-01-10T00:00:00Z'
  },
  { 
    id: 'f2', 
    cnpj: '98.765.432/0001-10', 
    razaoSocial: 'FarmaDistribuidora Regional S/A', 
    nomeFantasia: 'FarmaDistribuidora', 
    status: 'ATIVO', 
    email: 'vendas@farmadistribuidora.com.br', 
    whatsapp: '(21) 98888-8888',
    taxaAceitacao: 100.0,
    categorias: ['Medicamentos', 'Genéricos'],
    criadoEm: '2025-01-11T00:00:00Z',
    atualizadoEm: '2025-01-11T00:00:00Z'
  },
  { 
    id: 'f3', 
    cnpj: '45.678.901/0001-23', 
    razaoSocial: 'Global Health Importadora Ltda', 
    nomeFantasia: 'Global Health', 
    status: 'INATIVO', 
    email: 'cadastro@globalhealth.com', 
    whatsapp: '(11) 97777-7777',
    taxaAceitacao: 85.0,
    categorias: ['Importados', 'Equipamentos'],
    criadoEm: '2025-01-12T00:00:00Z',
    atualizadoEm: '2025-01-12T00:00:00Z'
  },
  { 
    id: 'f4', 
    cnpj: '23.456.789/0001-01', 
    razaoSocial: 'BioLogistica Sul Distribuidora', 
    nomeFantasia: 'BioLogistica Sul', 
    status: 'INATIVO', 
    email: 'legal@biologisticasul.com.br', 
    whatsapp: '(51) 96666-6666',
    taxaAceitacao: 90.0,
    categorias: ['Material Hospitalar', 'Controlados'],
    criadoEm: '2025-01-13T00:00:00Z',
    atualizadoEm: '2025-01-13T00:00:00Z'
  },
];

export const mockAtas: Ata[] = [
  {
    id: 'a1',
    numero: 'SRP 045/2025',
    dataInicio: '2025-01-10T00:00:00Z',
    dataFim: '2026-01-10T00:00:00Z',
    vigenciaInicio: '2025-01-10T00:00:00Z',
    vigenciaFim: '2026-01-10T00:00:00Z',
    valorTeto: 2500000.0,
    valorConsumido: 0,
    fornecedorId: 'f1',
    fornecedorNome: 'MedSupply Nacional LTDA',
    status: 'ATIVA',
  },
  {
    id: 'a2',
    numero: 'SRP 112/2024',
    dataInicio: '2024-05-15T00:00:00Z',
    dataFim: '2025-05-15T00:00:00Z',
    vigenciaInicio: '2024-05-15T00:00:00Z',
    vigenciaFim: '2025-05-15T00:00:00Z',
    valorTeto: 1800000.0,
    valorConsumido: 0,
    fornecedorId: 'f2',
    fornecedorNome: 'FarmaDistribuidora Regional',
    status: 'ATIVA',
  },
  {
    id: 'a3',
    numero: 'SRP 010/2023',
    dataInicio: '2023-02-20T00:00:00Z',
    dataFim: '2024-02-20T00:00:00Z',
    vigenciaInicio: '2023-02-20T00:00:00Z',
    vigenciaFim: '2024-02-20T00:00:00Z',
    valorTeto: 500000.0,
    valorConsumido: 0,
    fornecedorId: 'f1',
    fornecedorNome: 'MedSupply Nacional LTDA',
    status: 'VENCIDA',
  },
];

export const mockMedicamentosAta: MedicamentoAta[] = [
  // Ata 1 (f1)
  { id: 'm1', ataId: 'a1', nome: 'Dipirona Sódica 500mg/ml', precoUnitario: 0.85, qtdeInicial: 100000, quantidadeInicial: 100000, quantidadeUsada: 45000, precoBPS: 0.90, precoCMED: 1.20 },
  { id: 'm2', ataId: 'a1', nome: 'Paracetamol 750mg', precoUnitario: 0.45, qtdeInicial: 50000, quantidadeInicial: 50000, quantidadeUsada: 48000, precoBPS: 0.50, precoCMED: 0.75 },
  { id: 'm3', ataId: 'a1', nome: 'Amoxicilina 500mg', precoUnitario: 1.20, qtdeInicial: 20000, quantidadeInicial: 20000, quantidadeUsada: 5000, precoBPS: 1.15, precoCMED: 2.10 },
  // Ata 2 (f2)
  { id: 'm4', ataId: 'a2', nome: 'Losartana Potássica 50mg', precoUnitario: 0.30, qtdeInicial: 200000, quantidadeInicial: 200000, quantidadeUsada: 120000, precoBPS: 0.35, precoCMED: 0.60 },
  { id: 'm5', ataId: 'a2', nome: 'Omeprazol 20mg', precoUnitario: 0.60, qtdeInicial: 80000, quantidadeInicial: 80000, quantidadeUsada: 80000, precoBPS: 0.65, precoCMED: 1.05 }, // Esgotado
];

export const mockPedidosCompra: PedidoCompra[] = [
  {
    id: 'pdc1',
    numero: 'PdC-2025-0001',
    status: 'ENTREGUE',
    ataId: 'a1',
    dataSolicitacao: '2025-02-15T10:30:00Z',
    criadoEm: '2025-02-15T10:30:00Z',
    itens: [
      { medicamentoId: 'm1', medicamentoNome: 'Dipirona Sódica 500mg/ml', quantidade: 20000, precoUnitario: 0.85, valorTotal: 17000 },
      { medicamentoId: 'm2', medicamentoNome: 'Paracetamol 750mg', quantidade: 25000, precoUnitario: 0.45, valorTotal: 11250 },
    ],
    valorTotal: 17000 + 11250, // 28250
  },
  {
    id: 'pdc2',
    numero: 'PdC-2026-0002',
    status: 'EM_TRANSITO',
    ataId: 'a2',
    dataSolicitacao: '2026-05-01T14:20:00Z',
    criadoEm: '2026-05-01T14:20:00Z',
    itens: [
      { medicamentoId: 'm4', medicamentoNome: 'Losartana Potássica 50mg', quantidade: 50000, precoUnitario: 0.30, valorTotal: 15000 },
    ],
    valorTotal: 15000,
  },
  {
    id: 'pdc3',
    numero: 'PdC-2026-0003',
    status: 'RASCUNHO',
    ataId: 'a1',
    dataSolicitacao: '2026-05-10T09:00:00Z',
    criadoEm: '2026-05-10T09:00:00Z',
    itens: [
      { medicamentoId: 'm3', medicamentoNome: 'Amoxicilina 500mg', quantidade: 5000, precoUnitario: 1.20, valorTotal: 6000 },
    ],
    valorTotal: 6000,
  },
  {
    id: 'pdc4',
    numero: 'PdC-2026-0004',
    status: 'APROVADO',
    ataId: 'a1',
    dataSolicitacao: '2026-05-11T16:45:00Z',
    criadoEm: '2026-05-11T16:45:00Z',
    itens: [
      { medicamentoId: 'm1', medicamentoNome: 'Dipirona Sódica 500mg/ml', quantidade: 10000, precoUnitario: 0.85, valorTotal: 8500 },
    ],
    valorTotal: 8500,
  },
];

export const mockAuditoria: Auditoria[] = [
  { 
    id: 'aud1', 
    timestamp: '2025-01-05T08:00:00Z', 
    usuarioId: 'u1', 
    acao: 'CRIACAO', 
    entidadeId: 'f1', 
    detalhes: 'Fornecedor MedSupply cadastrado no sistema.',
    ip: '192.168.1.45',
    justificativa: 'Cadastro inicial de fornecedor habilitado em licitação.',
    estadoAnterior: null,
    estadoNovo: { id: 'f1', nome: 'MedSupply Nacional LTDA', status: 'ATIVO', email: 'contato@medsupply.com.br' }
  },
  { 
    id: 'aud2', 
    timestamp: '2025-01-10T09:30:00Z', 
    usuarioId: 'u2', 
    acao: 'CRIACAO', 
    entidadeId: 'a1', 
    detalhes: 'Ata SRP 045/2025 registrada.',
    ip: '192.168.1.12',
    justificativa: 'Assinatura de contrato após homologação.',
    estadoAnterior: null,
    estadoNovo: { id: 'a1', numero: 'SRP 045/2025', fornecedorId: 'f1', valorTeto: 2500000.0 }
  },
  { 
    id: 'aud3', 
    timestamp: '2026-05-11T16:45:00Z', 
    usuarioId: 'u3', 
    acao: 'APROVACAO', 
    entidadeId: 'pdc4', 
    detalhes: 'Pedido de compra pdc4 aprovado pela diretoria.',
    ip: '10.0.0.8',
    justificativa: 'Necessidade urgente de reposição de estoque de Dipirona.',
    estadoAnterior: { id: 'pdc4', status: 'PENDENTE' },
    estadoNovo: { id: 'pdc4', status: 'APROVADO' }
  },
  { 
    id: 'aud4', 
    timestamp: '2026-05-05T10:15:00Z', 
    usuarioId: 'u1', 
    acao: 'BLOQUEIO', 
    entidadeId: 'f4', 
    detalhes: 'Fornecedor BioLogistica Sul bloqueado por documentação irregular.',
    ip: '192.168.1.45',
    justificativa: 'Certidão negativa de débitos vencida e não renovada após prazo legal.',
    estadoAnterior: { id: 'f4', status: 'ATIVO' },
    estadoNovo: { id: 'f4', status: 'BLOQUEADO' }
  },
];
