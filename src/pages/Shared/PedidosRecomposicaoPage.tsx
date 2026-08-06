import { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  RefreshCw, 
  Clock, 
  Search as SearchIcon, 
  Package, 
  Truck, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Loader2, 
  XCircle, 
  CheckCircle,
  Plus,
  Trash2,
  Minus,
  PackageCheck
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { buscarCatmat } from '../../services/ataService';
import type { CatmatMedicamento } from '../../types';

interface PedidoItem {
  id: string;
  catmatCodigo: string | null;
  medicamentoNome: string;
  quantidade: number;
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

interface NovaSolicitacaoItem {
  codigoBr: string;
  descricao: string;
  quantidade: number;
  unidadeFornecimento?: string;
}

export function PedidosRecomposicaoPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoReposicao[]>([]);
  const [stats, setStats] = useState({ total: 0, pendentes: 0, emAnalise: 0, emSeparacao: 0, enviados: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  // New Request Modal State
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<NovaSolicitacaoItem[]>([]);
  const [urgency, setUrgency] = useState<'BAIXA' | 'ALTA'>('BAIXA');
  const [justification, setJustification] = useState('');
  
  // Catmat Autocomplete State
  const [catmatSearch, setCatmatSearch] = useState('');
  const [catmatSuggestions, setCatmatSuggestions] = useState<CatmatMedicamento[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Confirm Receipt State
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);

  const fetchPedidos = useCallback(async () => {
    if (!user?.unidadeId) return;

    try {
      setLoading(true);
      setError(false);

      const params: any = {
        page,
        limit: 10,
        unidadeId: user.unidadeId
      };

      if (busca) params.busca = busca;
      if (statusFilter) params.status = statusFilter;
      if (dataFilter) params.data = dataFilter;

      const response = await apiClient.get('/api/cd/pedidos-reposicao', { params });
      setPedidos(response.data.dados);
      setStats(response.data.stats || { total: 0, pendentes: 0, emAnalise: 0, emSeparacao: 0, enviados: 0 });
      setTotalPages(Math.ceil(response.data.total / 10) || 1);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error('Erro ao buscar pedidos de recomposição.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dataFilter, busca, user?.unidadeId]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Debounce CATMAT medication search in modal
  useEffect(() => {
    if (catmatSearch.trim().length < 2) {
      setCatmatSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const data = await buscarCatmat(catmatSearch);
        setCatmatSuggestions(data);
      } catch (err) {
        console.error('Erro ao buscar CATMAT:', err);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [catmatSearch]);

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

  const handleConfirmReceipt = async () => {
    if (!selectedPedido) return;
    try {
      setConfirmingReceipt(true);
      await apiClient.patch(`/api/cd/pedidos-reposicao/${selectedPedido.id}/status`, {
        status: 'CONCLUIDO'
      });
      toast.success('Recebimento confirmado! Pedido marcado como concluído.');
      setDetailsOpen(false);
      fetchPedidos();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao confirmar recebimento.');
    } finally {
      setConfirmingReceipt(false);
    }
  };

  const handleOpenNewRequest = () => {
    setSelectedItems([]);
    setUrgency('BAIXA');
    setJustification('');
    setCatmatSearch('');
    setCatmatSuggestions([]);
    setNewRequestOpen(true);
  };

  const handleAddMedication = (med: CatmatMedicamento) => {
    // Check if already added
    const exists = selectedItems.find(item => item.codigoBr === med.codigoBr);
    if (exists) {
      toast.warning('Este medicamento já foi adicionado.');
      return;
    }

    const newItem: NovaSolicitacaoItem = {
      codigoBr: med.codigoBr,
      descricao: med.descricao,
      quantidade: 1,
      unidadeFornecimento: med.unidadeFornecimento
    };

    setSelectedItems([...selectedItems, newItem]);
    setCatmatSearch('');
    setCatmatSuggestions([]);
  };

  const handleRemoveMedication = (codigoBr: string) => {
    setSelectedItems(selectedItems.filter(item => item.codigoBr !== codigoBr));
  };

  const handleQtyChange = (codigoBr: string, value: number) => {
    const updated = selectedItems.map(item => {
      if (item.codigoBr === codigoBr) {
        const qty = Math.max(1, value);
        return { ...item, quantidade: qty };
      }
      return item;
    });
    setSelectedItems(updated);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.unidadeId) return;

    if (selectedItems.length === 0) {
      toast.error('Adicione pelo menos um medicamento à solicitação.');
      return;
    }

    if (!justification.trim()) {
      toast.error('A justificativa é obrigatória.');
      return;
    }

    try {
      setSubmittingRequest(true);
      
      const payload = {
        unidadeId: user.unidadeId,
        urgencia: urgency,
        justificativa: justification,
        itens: selectedItems.map(item => ({
          catmatCodigo: item.codigoBr,
          medicamentoNome: item.descricao,
          quantidade: item.quantidade
        }))
      };

      await apiClient.post('/api/cd/pedidos-reposicao', payload);
      toast.success('Solicitação de recomposição criada com sucesso!');
      setNewRequestOpen(false);
      fetchPedidos();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.erro || 'Erro ao criar solicitação de recomposição.');
    } finally {
      setSubmittingRequest(false);
    }
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
            Pedidos de Recomposição
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Solicite reposição de medicamentos e acompanhe o andamento</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={fetchPedidos}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleOpenNewRequest}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nova Solicitação
          </button>
        </div>
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

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-500 border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Enviados</span>
          <span className="text-3xl font-black text-gray-900">{stats.enviados}</span>
          <div className="absolute right-4 bottom-4 text-emerald-50/20">
            <Truck className="h-12 w-12" />
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
              placeholder="Buscar por número do pedido..."
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
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <span className="text-xs font-bold text-gray-500">Carregando solicitações...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-900 mb-1">Erro ao carregar</h3>
          <p className="text-xs text-gray-500 mb-4">Não foi possível carregar suas solicitações de recomposição.</p>
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
          <p className="text-gray-950 font-bold mb-1 text-sm">Nenhuma solicitação encontrada</p>
          <p className="text-xs text-gray-400">Você ainda não enviou solicitações de recomposição ou elas não batem com os filtros.</p>
          <button
            onClick={handleOpenNewRequest}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Solicitação
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ID do Pedido</th>
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
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md tracking-tight w-max">{pedido.numero}</span>
                          <span className="text-xs font-medium text-gray-500 mt-1">{totalItensCount} medicamento(s)</span>
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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => !detailsLoading && setDetailsOpen(false)} />
          
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 relative z-10">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-2 flex items-start justify-between relative bg-white">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {selectedPedido ? selectedPedido.numero : 'Carregando...'}
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
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Justificativa da Solicitação</h4>
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
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-455 uppercase">Medicamento</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-455 uppercase text-right">Qtd Solicitada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {selectedPedido.itens.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/20 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{item.medicamentoNome}</span>
                                {item.catmatCodigo && (
                                  <span className="text-[10px] font-semibold text-gray-500 mt-1">
                                    Código CATMAT: {item.catmatCodigo}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-gray-800">
                              {item.quantidade} un
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-450 px-1 pt-1">
                    <span>{selectedPedido.itens.length} item(s) solicitado(s)</span>
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
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
              <button
                onClick={() => setDetailsOpen(false)}
                disabled={confirmingReceipt}
                className="px-4 py-2 border border-gray-250 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                Fechar
              </button>

              {selectedPedido && ['AGUARDANDO_MOTORISTA', 'EM_TRANSITO'].includes(selectedPedido.status) && (
                <button
                  onClick={handleConfirmReceipt}
                  disabled={confirmingReceipt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-75"
                >
                  {confirmingReceipt
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <PackageCheck className="h-3.5 w-3.5" />
                  }
                  Confirmar Recebimento
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {newRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => !submittingRequest && setNewRequestOpen(false)} />
          
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative z-10">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Nova Solicitação de Recomposição
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Selecione os medicamentos que deseja solicitar para repor seu estoque</p>
              </div>
              <button 
                onClick={() => setNewRequestOpen(false)} 
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                disabled={submittingRequest}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateRequest} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Autocomplete Search */}
                <div className="space-y-2 relative">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    Buscar Medicamento (CATMAT)
                  </label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Busque por nome ou código CATMAT (ex: Paracetamol)..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                      value={catmatSearch}
                      onChange={(e) => setCatmatSearch(e.target.value)}
                    />
                    {suggestionsLoading && (
                      <Loader2 className="absolute right-3 top-3 h-4.5 w-4.5 animate-spin text-blue-600" />
                    )}
                  </div>

                  {/* Suggestions List */}
                  {catmatSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[68px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-100">
                      {catmatSuggestions.map((med) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => handleAddMedication(med)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col gap-0.5 transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-gray-900">{med.descricao}</span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            Código: {med.codigoBr} · Unit: {med.unidadeFornecimento || 'un'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {catmatSearch.trim().length >= 2 && catmatSuggestions.length === 0 && !suggestionsLoading && (
                    <div className="absolute left-0 right-0 top-[68px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-center text-xs text-gray-400 z-50">
                      Nenhum medicamento encontrado para "{catmatSearch}"
                    </div>
                  )}
                </div>

                {/* Selected Items Table */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    Medicamentos Adicionados
                  </label>
                  
                  {selectedItems.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 bg-gray-50/20">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs font-bold text-gray-500">Nenhum item adicionado ainda</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Use o campo de busca acima para incluir medicamentos na solicitação</p>
                    </div>
                  ) : (
                    <div className="border border-gray-150 rounded-xl overflow-hidden bg-white">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                            <th className="px-4 py-2.5 text-[10px] font-bold text-gray-455 uppercase">Medicamento</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-gray-455 uppercase text-center w-36">Quantidade</th>
                            <th className="px-4 py-2.5 text-[10px] font-bold text-gray-455 uppercase text-right w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          {selectedItems.map((item) => (
                            <tr key={item.codigoBr} className="hover:bg-gray-50/10">
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 leading-tight">{item.descricao}</span>
                                  <span className="text-[10px] font-semibold text-gray-400 mt-1">
                                    CATMAT: {item.codigoBr}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange(item.codigoBr, item.quantidade - 1)}
                                    className="p-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-90 transition-all cursor-pointer"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantidade}
                                    onChange={(e) => handleQtyChange(item.codigoBr, parseInt(e.target.value) || 1)}
                                    className="w-14 text-center py-1 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange(item.codigoBr, item.quantidade + 1)}
                                    className="p-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-90 transition-all cursor-pointer"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedication(item.codigoBr)}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 active:scale-90 transition-all cursor-pointer"
                                  title="Remover"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Urgency and Justification */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Urgency selection */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      Urgência
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="urgency"
                          checked={urgency === 'BAIXA'}
                          onChange={() => setUrgency('BAIXA')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-100"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900">Normal</span>
                          <span className="text-[10px] text-gray-400">Reabastecimento padrão</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="urgency"
                          checked={urgency === 'ALTA'}
                          onChange={() => setUrgency('ALTA')}
                          className="h-4 w-4 text-red-650 focus:ring-red-50"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-red-650">Urgente</span>
                          <span className="text-[10px] text-red-400">Risco de desabastecimento rápido</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Justification input */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Justificativa</span>
                      <span className="text-red-500 font-medium text-[9px] uppercase tracking-normal">Obrigatório</span>
                    </label>
                    <textarea
                      placeholder="Justifique a necessidade desta reposição (ex: Aumento do fluxo de atendimentos de urgência ou estoque no nível crítico)..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white placeholder:text-gray-400"
                      rows={4}
                      required
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setNewRequestOpen(false)}
                  disabled={submittingRequest}
                  className="px-4 py-2 border border-gray-250 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {submittingRequest && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
