import { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Calendar, 
  Eye, 
  RefreshCw, 
  Download, 
  Clock, 
  Search as SearchIcon, 
  Package, 
  Truck, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Loader2, 
  XCircle, 
  Check, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { toast } from 'sonner';

interface PedidoItem {
  id: string;
  catmatCodigo: string | null;
  medicamentoNome: string;
  quantidade: number;
  disponivel?: boolean;
  loteSugerido?: string | null;
  validadeSugerida?: string | null;
  totalQtdDisponivel?: number;
}

interface PedidoReposicao {
  id: string;
  numero: string;
  status: 'PENDENTE' | 'EM_ANALISE' | 'EM_SEPARACAO' | 'AGUARDANDO_MOTORISTA' | 'EM_TRANSITO' | 'CONCLUIDO' | 'REJEITADO';
  urgencia: 'BAIXA' | 'MEDIA' | 'ALTA';
  unidadeId: string;
  unidadeNome: string;
  justificativa?: string | null;
  motivoRejeicao?: string | null;
  criadoEm: string;
  solicitadoPor: { nome: string };
  motorista?: { nome: string } | null;
  itens: PedidoItem[];
}

interface Motorista {
  id: string;
  nome: string;
  email: string;
}

export function PedidosCD() {
  const [activeTab, setActiveTab] = useState<'UNIDADES' | 'SOLICITACOES_COMPRA'>('UNIDADES');

  // Estados de Pedidos de Reposição (Unidades)
  const [pedidos, setPedidos] = useState<PedidoReposicao[]>([]);
  const [stats, setStats] = useState({ total: 0, pendentes: 0, emAnalise: 0, emSeparacao: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Estados de Solicitações de Compra (Enviadas ao Secretário)
  const [solicitaCompras, setSolicitaCompras] = useState<any[]>([]);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [modalNovaCompra, setModalNovaCompra] = useState(false);
  const [submittingCompra, setSubmittingCompra] = useState(false);
  
  // Form Nova Solicitação Compra
  const [medicamentoNome, setMedicamentoNome] = useState('');
  const [catmatCodigo, setCatmatCodigo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [selectedPedidoCompraDetails, setSelectedPedidoCompraDetails] = useState<any | null>(null);

  // Filters State
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dataFilter, setDataFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Details Modal State
  const [selectedPedido, setSelectedPedido] = useState<PedidoReposicao | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Rejection Confirmation State
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);

  // Approval/Transfer State (Driver Selection)
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [selectedMotoristaId, setSelectedMotoristaId] = useState('');
  const [motoristasLoading, setMotoristasLoading] = useState(false);
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(false);

      const params: any = {
        page,
        limit: 10
      };

      if (busca) params.busca = busca;
      if (statusFilter) params.status = statusFilter;
      if (dataFilter) params.data = dataFilter;

      const response = await apiClient.get('/api/cd/pedidos-reposicao', { params });
      setPedidos(response.data.dados);
      setStats(response.data.stats);
      setTotalPages(Math.ceil(response.data.total / 10) || 1);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error('Erro ao buscar pedidos de recomposição.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitacoesCompra = async () => {
    try {
      setLoadingCompras(true);
      const res = await apiClient.get('/api/pedidos');
      setSolicitaCompras(res.data.pedidos || res.data || []);
    } catch (err) {
      console.error('Erro ao buscar solicitações de compra:', err);
    } finally {
      setLoadingCompras(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchSolicitacoesCompra();
  }, [page, statusFilter, dataFilter]);

  const handleCriarSolicitacaoCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicamentoNome || !quantidade || Number(quantidade) <= 0) {
      toast.error('Informe o nome do medicamento e uma quantidade válida.');
      return;
    }

    try {
      setSubmittingCompra(true);
      const payload = {
        medicamentoNome,
        catmatCodigo: catmatCodigo || null,
        justificativa: justificativa || 'Solicitação de compra de reposição de estoque do CD.',
        status: 'PENDENTE',
        itens: [
          {
            medicamentoNome,
            catmatCodigo: catmatCodigo || null,
            quantidade: Number(quantidade),
            precoUnitario: Number(precoUnitario) || 0
          }
        ]
      };

      await apiClient.post('/api/pedidos', payload);
      toast.success('Solicitação de compra enviada com sucesso ao Secretário de Saúde!');
      setModalNovaCompra(false);
      setMedicamentoNome('');
      setCatmatCodigo('');
      setQuantidade('');
      setPrecoUnitario('');
      setJustificativa('');
      fetchSolicitacoesCompra();
    } catch (err: any) {
      console.error('Erro ao criar solicitação de compra:', err);
      toast.error(err?.response?.data?.error || 'Erro ao enviar solicitação de compra.');
    } finally {
      setSubmittingCompra(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchPedidos();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [busca]);

  const handleOpenDetails = async (id: string) => {
    try {
      setDetailsLoading(true);
      setDetailsOpen(true);
      const response = await apiClient.get(`/api/cd/pedidos-reposicao/${id}`);
      setSelectedPedido(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar detalhes do pedido.');
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOpenRejection = () => {
    setRejectionReason('');
    setRejectionOpen(true);
  };

  const handleConfirmRejection = async () => {
    if (!selectedPedido) return;
    if (!rejectionReason.trim()) {
      toast.error('Informe o motivo da rejeição.');
      return;
    }

    try {
      setSubmittingRejection(true);
      await apiClient.patch(`/api/cd/pedidos-reposicao/${selectedPedido.id}/status`, {
        status: 'REJEITADO',
        motivoRejeicao: rejectionReason
      });
      toast.success('Pedido rejeitado com sucesso.');
      setRejectionOpen(false);
      setDetailsOpen(false);
      fetchPedidos();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao rejeitar pedido.');
    } finally {
      setSubmittingRejection(false);
    }
  };

  const handleOpenApproval = async () => {
    setApprovalOpen(true);
    setSelectedMotoristaId('');
    try {
      setMotoristasLoading(true);
      const response = await apiClient.get('/api/cd/pedidos-reposicao/motoristas');
      setMotoristas(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar lista de motoristas.');
    } finally {
      setMotoristasLoading(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (!selectedPedido) return;

    try {
      setSubmittingApproval(true);
      
      // Se motorista for selecionado, encaminha para ele. Caso contrário, apenas muda o status
      const payload: any = {
        status: 'AGUARDANDO_MOTORISTA'
      };

      if (selectedMotoristaId) {
        payload.motoristaId = selectedMotoristaId;
      }

      await apiClient.patch(`/api/cd/pedidos-reposicao/${selectedPedido.id}/status`, {
        ...payload
      });

      toast.success('Pedido aprovado e encaminhado para entrega!');
      setApprovalOpen(false);
      setDetailsOpen(false);
      fetchPedidos();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao aprovar pedido.');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleExport = () => {
    toast.success('Funcionalidade de exportação iniciada.');
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return { statusText: 'Pendente', variant: 'yellow' as const };
      case 'EM_ANALISE':
        return { statusText: 'Em Análise', variant: 'blue' as const };
      case 'EM_SEPARACAO':
        return { statusText: 'Em Separação', variant: 'purple' as const };
      case 'AGUARDANDO_MOTORISTA':
        return { statusText: 'Aguardando Motorista', variant: 'orange' as const };
      case 'EM_TRANSITO':
        return { statusText: 'Enviado', variant: 'blue' as const };
      case 'CONCLUIDO':
        return { statusText: 'Concluído', variant: 'green' as const };
      case 'REJEITADO':
        return { statusText: 'Rejeitado', variant: 'red' as const };
      default:
        return { statusText: status, variant: 'gray' as const };
    }
  };

  const getUrgencyBadgeProps = (urgencia: string) => {
    switch (urgencia) {
      case 'ALTA':
        return { text: 'Alta', className: 'bg-red-50 text-red-700 border-red-100 border' };
      case 'MEDIA':
        return { text: 'Média', className: 'bg-amber-50 text-amber-700 border-amber-200 border' };
      case 'BAIXA':
        return { text: 'Baixa', className: 'bg-emerald-50 text-emerald-700 border-emerald-100 border' };
      default:
        return { text: urgencia, className: 'bg-gray-50 text-gray-700 border-gray-100 border' };
    }
  };

  // Helper values for details stepper status index
  const getStepperActiveIndex = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 0;
      case 'EM_ANALISE':
        return 1;
      case 'EM_SEPARACAO':
        return 2;
      case 'AGUARDANDO_MOTORISTA':
      case 'EM_TRANSITO':
        return 3;
      case 'CONCLUIDO':
        return 4;
      default:
        return -1;
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            Módulo de Pedidos e Reposição
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Gerencie o atendimento a unidades e solicitações de compra ao Secretário de Saúde</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => { fetchPedidos(); fetchSolicitacoesCompra(); }}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setModalNovaCompra(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer border-0"
          >
            <ShoppingCart className="h-4 w-4" />
            + Solicitar Compra de Estoque
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab('UNIDADES')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'UNIDADES'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Atendimento a Unidades (Recebidos)
        </button>
        <button
          onClick={() => setActiveTab('SOLICITACOES_COMPRA')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'SOLICITACOES_COMPRA'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Minhas Solicitações de Compra (Secretário)
          {solicitaCompras.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-black">
              {solicitaCompras.length}
            </span>
          )}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-gray-450 uppercase tracking-wider">Total de Pedidos</span>
          <span className="text-3xl font-black text-gray-900">{stats.total}</span>
          <div className="absolute right-4 bottom-4 text-gray-100 group-hover:text-blue-50/50 transition-colors">
            <ShoppingCart className="h-12 w-12" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-amber-400 border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pendentes</span>
          <span className="text-3xl font-black text-gray-900">{stats.pendentes}</span>
          <div className="absolute right-4 bottom-4 text-amber-50/20">
            <Clock className="h-12 w-12" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-blue-500 border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Em Análise</span>
          <span className="text-3xl font-black text-gray-900">{stats.emAnalise}</span>
          <div className="absolute right-4 bottom-4 text-blue-50/20">
            <SearchIcon className="h-12 w-12" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-purple-500 border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Em Separação</span>
          <span className="text-3xl font-black text-gray-900">{stats.emSeparacao}</span>
          <div className="absolute right-4 bottom-4 text-purple-50/20">
            <Package className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID do Pedido ou Unidade..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder:text-gray-450 bg-white"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="EM_SEPARACAO">Em Separação</option>
              <option value="AGUARDANDO_MOTORISTA">Aguardando Motorista</option>
              <option value="EM_TRANSITO">Enviado</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="REJEITADO">Rejeitado</option>
            </select>

            <div className="relative">
              <input
                type="date"
                className="pl-4 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white text-gray-500"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
              />
            </div>

            {(busca || statusFilter || dataFilter) && (
              <button
                onClick={() => {
                  setBusca('');
                  setStatusFilter('');
                  setDataFilter('');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors py-2 px-1 cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      {activeTab === 'SOLICITACOES_COMPRA' ? (
        loadingCompras ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <span className="text-xs font-bold text-gray-500">Carregando solicitações de compra...</span>
          </div>
        ) : solicitaCompras.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center text-gray-500">
            <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-950 font-bold mb-1 text-sm">Nenhuma solicitação de compra enviada</p>
            <p className="text-xs text-gray-400 mb-4">Clique no botão acima para enviar um novo pedido de compra de estoque ao Secretário de Saúde.</p>
            <button
              onClick={() => setModalNovaCompra(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-all cursor-pointer border-0"
            >
              + Nova Solicitação de Compra
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Número do Pedido</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data de Envio</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Medicamento Principal</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 text-right uppercase tracking-wider">Valor Total</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status no Secretário</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 text-right uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {solicitaCompras.map((item: any) => {
                    const isPendente = item.status === 'PENDENTE';
                    const isAprovado = item.status === 'APROVADO' || item.status === 'EM_TRANSITO' || item.status === 'ENTREGUE';
                    const isRejeitado = item.status === 'REJEITADO' || item.status === 'CANCELADO';
                    const firstItem = item.itens?.[0]?.medicamentoNome || 'Medicamento de estoque';

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md tracking-tight font-mono">{item.numero}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          {new Date(item.dataSolicitacao || item.criadoEm).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-900">
                          {firstItem}
                          {item.itens?.length > 1 && (
                            <span className="ml-2 text-[10px] text-gray-400 font-normal">+{item.itens.length - 1} item(ns)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-extrabold text-gray-900 text-right">
                          R$ {Number(item.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isPendente
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isAprovado
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isRejeitado
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isPendente ? 'Aguardando Secretário' : isAprovado ? 'Aprovado & Efetivado' : isRejeitado ? 'Rejeitado' : item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedPedidoCompraDetails(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border-0 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <span className="text-xs font-bold text-gray-500">Carregando pedidos...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-900 mb-1">Erro ao carregar</h3>
          <p className="text-xs text-gray-500 mb-4">Não foi possível carregar a lista de pedidos de reposição.</p>
          <button 
            onClick={fetchPedidos}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-all active:scale-95 cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center text-gray-500">
          <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-950 font-bold mb-1 text-sm">Nenhum pedido encontrado</p>
          <p className="text-xs text-gray-400">Não há solicitações de reposição cadastradas para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ID do Pedido</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Unidade Solicitante</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data Solicitação</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Urgência</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status Atual</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 text-right uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidos.map((pedido) => {
                  const badgeProps = getStatusBadgeProps(pedido.status);
                  const urgencyProps = getUrgencyBadgeProps(pedido.urgencia);
                  const totalItensCount = pedido.itens.length;

                  return (
                    <tr key={pedido.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md tracking-tight">{pedido.numero}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{pedido.unidadeNome}</span>
                          <span className="text-xs font-medium text-gray-500 mt-0.5">{totalItensCount} medicamento(s)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-650">{formatDate(pedido.criadoEm)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${urgencyProps.className}`}>
                          {urgencyProps.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={badgeProps.statusText} variant={badgeProps.variant} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(pedido.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-gray-450" />
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-xs font-semibold text-gray-500">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 transition-opacity" onClick={() => !detailsLoading && setDetailsOpen(false)} />
          
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 relative z-10">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-2 flex items-start justify-between relative bg-white">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {selectedPedido ? (selectedPedido.numero.includes('-') ? selectedPedido.numero.split('-').pop() : selectedPedido.numero) : 'Carregando...'}
                </span>
                <span className="text-sm font-normal text-gray-500">
                  {selectedPedido ? selectedPedido.unidadeNome : 'Aguarde...'}
                </span>
              </div>
              <div className="flex items-center gap-3 pr-8 mt-1">
                {selectedPedido && selectedPedido.urgencia === 'ALTA' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    Urgente
                  </span>
                )}
              </div>
              <button 
                onClick={() => setDetailsOpen(false)} 
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            {detailsLoading || !selectedPedido ? (
              <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                <span className="text-xs font-bold text-gray-500">Carregando informações do pedido...</span>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Stepper Status Progress */}
                {selectedPedido.status !== 'REJEITADO' && (
                  <div className="relative py-4">
                    {/* Stepper Line background */}
                    <div className="absolute top-8 left-6 right-6 h-0.5 bg-gray-100 -z-10" />
                    
                    {/* Stepper Line filled progress */}
                    <div 
                      className="absolute top-8 left-6 h-0.5 bg-emerald-500 -z-10 transition-all duration-500 delay-300" 
                      style={{ 
                        width: `${Math.max(0, getStepperActiveIndex(selectedPedido.status) * 25)}%` 
                      }} 
                    />

                    <div className="flex justify-between items-start">
                      {[
                        { label: 'Pendente', icon: Clock },
                        { label: 'Em Análise', icon: Package },
                        { label: 'Em Separação', icon: Package },
                        { label: 'Enviado', icon: Truck },
                        { label: 'Concluído', icon: CheckCircle2 }
                      ].map((step, idx) => {
                        const activeIdx = getStepperActiveIndex(selectedPedido.status);
                        const isCompleted = idx < activeIdx;
                        const isActive = idx === activeIdx;
                        const StepIcon = step.icon;

                        return (
                          <div key={idx} className="flex flex-col items-center text-center w-20 relative">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                              isCompleted 
                                ? 'bg-emerald-500 text-white border-emerald-500' 
                                : isActive 
                                  ? 'bg-[#0056C6] text-white border-[#0056C6] ring-4 ring-blue-50' 
                                  : 'bg-white text-gray-400 border-gray-200'
                            }`}>
                              <StepIcon className="h-4 w-4" />
                            </div>
                            <span className={`text-[10px] font-bold mt-2 leading-tight ${
                              isActive ? 'text-[#0056C6] font-extrabold' : isCompleted ? 'text-emerald-600' : 'text-gray-450'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedPedido.status === 'REJEITADO' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-start">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-950">Pedido Rejeitado</h4>
                      <p className="text-xs text-red-650 mt-1">
                        Motivo: <span className="font-semibold text-red-900">{selectedPedido.motivoRejeicao || 'Não informado'}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Justification details */}
                {selectedPedido.justificativa && (
                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Justificativa do Pedido</h4>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{selectedPedido.justificativa}</p>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Medicamentos Solicitados</h4>
                  <div className="border border-gray-150 rounded-xl overflow-hidden bg-white">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-450 uppercase">Medicamento</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-450 uppercase text-center">Qtd Solicitada</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-450 uppercase text-right">CD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {selectedPedido.itens.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/20 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{item.medicamentoNome}</span>
                                {item.disponivel && item.loteSugerido ? (
                                  <span className="text-[10px] font-semibold text-gray-500 mt-1">
                                    Lote: {item.loteSugerido} · Val: {item.validadeSugerida ? new Date(item.validadeSugerida).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : 'N/D'}
                                  </span>
                                ) : !item.disponivel ? (
                                  <span className="text-[10px] font-bold text-red-500 mt-1">
                                    Sem lotes disponíveis em estoque
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-gray-800">
                              {item.quantidade} un
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {item.disponivel ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                                  Disponível
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                                  <XCircle className="h-3 w-3 text-red-500" />
                                  Indisponível
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-450 px-1 pt-1">
                    <span>{selectedPedido.itens.length} item(s)</span>
                    {selectedPedido.motorista && (
                      <span className="text-blue-600 flex items-center gap-1 bg-blue-50/50 border border-blue-100/50 px-2 py-0.5 rounded">
                        <Truck className="h-3.5 w-3.5" />
                        Motorista: {selectedPedido.motorista.nome}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            {selectedPedido && !detailsLoading && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="px-4 py-2 border border-gray-250 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                  Fechar
                </button>
                
                {['PENDENTE', 'EM_ANALISE', 'EM_SEPARACAO'].includes(selectedPedido.status) && (
                  <>
                    <button
                      onClick={handleOpenRejection}
                      className="px-4 py-2 border border-red-200 rounded-xl text-xs font-bold text-red-650 bg-white hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar Pedido
                    </button>
                    <button
                      onClick={handleOpenApproval}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Truck className="h-4 w-4" />
                      Confirmar Envio para Farmácia
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Driver Selection Modal */}
      {approvalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 transition-opacity" onClick={() => !submittingApproval && setApprovalOpen(false)} />
          
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 sm:p-8 transform transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200 relative z-10">
            <div className="flex flex-col">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4 border border-blue-100">
                <Truck className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Aprovar e Encaminhar Pedido</h3>
              <p className="text-xs text-gray-500 text-center leading-relaxed mb-6">
                Selecione o motorista responsável pela entrega ou apenas confirme para deixar disponível para os entregadores ativos.
              </p>

              {/* Driver Select */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Responsável pela Entrega</label>
                  {motoristasLoading ? (
                    <div className="py-3 text-center border border-gray-200 rounded-xl">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 mx-auto" />
                    </div>
                  ) : (
                    <select
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                      value={selectedMotoristaId}
                      onChange={(e) => setSelectedMotoristaId(e.target.value)}
                    >
                      <option value="">Apenas aprovar (Sem motorista pré-definido)</option>
                      {motoristas.map((mot) => (
                        <option key={mot.id} value={mot.id}>
                          {mot.nome} ({mot.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setApprovalOpen(false)}
                  disabled={submittingApproval}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproval}
                  disabled={submittingApproval}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {submittingApproval && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirmar Aprovação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 transition-opacity" onClick={() => !submittingRejection && setRejectionOpen(false)} />
          
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 sm:p-8 transform transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200 relative z-10">
            <div className="flex flex-col">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-650 mb-4 border border-red-150">
                <AlertTriangle className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Rejeitar Solicitação?</h3>
              <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
                Esta ação rejeitará definitivamente o pedido de reposição. Por favor, forneça o motivo da rejeição.
              </p>

              {/* Justification TextArea */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Motivo da Rejeição</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white placeholder:text-gray-400"
                    placeholder="Ex: Quantidades solicitadas incompatíveis com o teto mensal da unidade."
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectionOpen(false)}
                  disabled={submittingRejection}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejection}
                  disabled={submittingRejection}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {submittingRejection && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirmar Rejeição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Solicitação de Compra (Enviada ao Secretário) */}
      {modalNovaCompra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Nova Solicitação de Compra de Estoque
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Solicite ao Secretário de Saúde a autorização para efetivar pedido de compra de reposição.
                </p>
              </div>
              <button
                onClick={() => setModalNovaCompra(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border-0 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCriarSolicitacaoCompra} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Medicamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amoxicilina 500mg cápsula"
                  value={medicamentoNome}
                  onChange={(e) => setMedicamentoNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código CATMAT</label>
                  <input
                    type="text"
                    placeholder="Ex: 458921"
                    value={catmatCodigo}
                    onChange={(e) => setCatmatCodigo(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Qtd. Solicitada *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Ex: 5000"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Preço Est. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1.50"
                    value={precoUnitario}
                    onChange={(e) => setPrecoUnitario(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Justificativa da Reposição</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Estoque atual zerado no CD e com alta demanda das UBS para os próximos 30 dias."
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalNovaCompra(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border-0 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingCompra}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer border-0 flex items-center gap-1.5"
                >
                  {submittingCompra && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Enviar ao Secretário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Solicitação de Compra */}
      {selectedPedidoCompraDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Detalhes do Pedido de Compra: {selectedPedidoCompraDetails.numero}
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Solicitado em: {new Date(selectedPedidoCompraDetails.dataSolicitacao || selectedPedidoCompraDetails.criadoEm).toLocaleString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedPedidoCompraDetails(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border-0 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase">Status no Secretário</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700">
                  {selectedPedidoCompraDetails.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Itens Solicitados</h4>
                <div className="bg-gray-50 rounded-xl p-3 divide-y divide-gray-100 border border-gray-150">
                  {selectedPedidoCompraDetails.itens?.map((it: any) => (
                    <div key={it.id} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{it.medicamentoNome}</span>
                        {it.catmatCodigo && <span className="text-[10px] text-gray-400 ml-2 font-mono">CATMAT: {it.catmatCodigo}</span>}
                      </div>
                      <span className="font-extrabold text-gray-800">{it.quantidade} un</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">Justificativa</h4>
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-150 italic">
                  "{selectedPedidoCompraDetails.justificativa || 'Sem justificativa informada.'}"
                </p>
              </div>

              <div className="pt-3 flex justify-end border-t border-gray-100">
                <button
                  onClick={() => setSelectedPedidoCompraDetails(null)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all border-0 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
