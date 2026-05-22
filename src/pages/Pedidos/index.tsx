import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { 
  getPedidos, 
  updatePedidoStatus 
} from '../../services/pedidoService';
import { getFornecedores } from '../../services/fornecedorService';
import type { PedidoCompra, Fornecedor } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import type { ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { ModalDetalhesPedido } from './ModalDetalhesPedido';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react';

export function PedidosLista() {
  const [pedidos, setPedidos] = useState<PedidoCompra[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [busca, setBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fornecedorFilter, setFornecedorFilter] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [pedidoToCancel, setPedidoToCancel] = useState<{ id: string; numero: string } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);

  const handleViewDetails = (id: string) => {
    setSelectedPedidoId(id);
    setDetailsModalOpen(true);
  };

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBusca(busca);
    }, 450);
    return () => clearTimeout(handler);
  }, [busca]);

  // Load suppliers once
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await getFornecedores();
        setFornecedores(data);
      } catch (err) {
        console.error('Erro ao carregar fornecedores:', err);
      }
    };
    loadSuppliers();
  }, []);

  // Fetch pedidos when filters change
  const fetchPedidosData = useCallback(async () => {
    await Promise.resolve();
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = {
        busca: debouncedBusca || undefined,
        status: statusFilter || undefined,
        fornecedorId: fornecedorFilter || undefined,
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined
      };

      const result = await getPedidos(filters);
      setPedidos(result);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Ocorreu um erro ao carregar a lista de Pedidos de Compra.');
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedBusca, statusFilter, fornecedorFilter, dataInicio, dataFim]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchPedidosData();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchPedidosData]);

  // Trigger Cancel Dialog
  const handleCancelClick = (id: string, numero: string) => {
    setPedidoToCancel({ id, numero });
    setCancelModalOpen(true);
  };

  // Perform Cancel Action
  const handleConfirmCancel = async () => {
    if (!pedidoToCancel) return;

    try {
      setIsCancelling(true);
      await updatePedidoStatus(pedidoToCancel.id, 'CANCELADO', 'Pedido cancelado pelo usuário na listagem.');
      toast.success(`Pedido ${pedidoToCancel.numero} cancelado com sucesso!`);
      setCancelModalOpen(false);
      setPedidoToCancel(null);
      fetchPedidosData();
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { error?: string } } };
      const errMsg = axiosError.response?.data?.error || 'Erro ao cancelar o pedido.';
      toast.error(errMsg);
    } finally {
      setIsCancelling(false);
    }
  };

  // Helper formatting functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  // Calculate stats cards metrics
  const stats = useMemo(() => {
    const totalCount = pedidos.length;
    
    // Compromised values = status in active transit (PENDENTE, ACEITO, APROVADO, EM_TRANSITO, ENTREGUE)
    const comprometido = pedidos
      .filter(p => ['PENDENTE', 'ACEITO', 'APROVADO', 'EM_TRANSITO', 'ENTREGUE'].includes(p.status))
      .reduce((acc, curr) => acc + curr.valorTotal, 0);

    // Delivered values = status ENTREGUE
    const entregue = pedidos
      .filter(p => p.status === 'ENTREGUE')
      .reduce((acc, curr) => acc + curr.valorTotal, 0);

    return { totalCount, comprometido, entregue };
  }, [pedidos]);

  // Define columns for DataTable
  const columns: ColumnDef<PedidoCompra>[] = [
    {
      header: 'Número PdC',
      accessorKey: 'numero',
      sortable: true,
      cell: (row) => <span className="font-semibold text-gray-900 uppercase">{row.numero}</span>
    },
    {
      header: 'Medicamento',
      cell: (row) => {
        const itens = row.itens || [];
        if (itens.length === 0) return <span className="text-gray-400 italic">Sem itens</span>;
        
        const firstItem = itens[0];
        const extraCount = itens.length - 1;
        
        return (
          <div className="max-w-[200px] sm:max-w-xs">
            <span className="font-medium text-gray-800 block truncate" title={firstItem.medicamentoNome}>
              {firstItem.medicamentoNome}
            </span>
            {extraCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                +{extraCount} {extraCount === 1 ? 'outro item' : 'outros itens'}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Fornecedor',
      cell: (row) => (
        <span className="text-gray-700 font-medium">
          {row.fornecedor?.nomeFantasia || row.fornecedor?.razaoSocial || 'Não informado'}
        </span>
      )
    },
    {
      header: 'Valor Total',
      accessorKey: 'valorTotal',
      sortable: true,
      cell: (row) => <span className="font-bold text-gray-950">{formatCurrency(row.valorTotal)}</span>
    },
    {
      header: 'ATA Vinculada',
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {row.ata?.numero || 'Sem ATA'}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        let variant: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'gray' = 'gray';
        if (row.status === 'APROVADO') variant = 'blue';
        if (row.status === 'EM_TRANSITO') variant = 'yellow';
        if (row.status === 'ENTREGUE') variant = 'green';
        if (row.status === 'CANCELADO') variant = 'red';
        if (row.status === 'REJEITADO') variant = 'red';
        if (row.status === 'PENDENTE') variant = 'orange';
        if (row.status === 'ACEITO') variant = 'purple';
        
        return <StatusBadge status={row.status} variant={variant} />;
      }
    },
    {
      header: 'Data de Envio',
      accessorKey: 'dataSolicitacao',
      sortable: true,
      cell: (row) => formatDate(row.dataSolicitacao)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-blue-600" />
            Pedidos de Compra (PdC)
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os pedidos de compra (PdCs), acompanhe o recebimento e realize controle de saldos.
          </p>
        </div>
        <Link
          to="/pedidos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo PdC
        </Link>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total de PdCs</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.totalCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Comprometido</p>
            <p className="text-2xl font-extrabold text-yellow-600 mt-1">{formatCurrency(stats.comprometido)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Entregue</p>
            <p className="text-2xl font-extrabold text-green-600 mt-1">{formatCurrency(stats.entregue)}</p>
          </div>
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Busca Textual */}
          <div className="md:col-span-4 relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Número do PdC, fornecedor, medicamento..."
                className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro Status */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Status</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ACEITO">Aceito</option>
              <option value="REJEITADO">Rejeitado</option>
              <option value="ENTREGUE">Entregue</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {/* Filtro Fornecedor */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Fornecedor</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              value={fornecedorFilter}
              onChange={(e) => setFornecedorFilter(e.target.value)}
            >
              <option value="">Todos</option>
              {fornecedores.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nomeFantasia || f.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          {/* Período: Início */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">De</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="pl-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
          </div>

          {/* Período: Fim */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Até</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="pl-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(busca || statusFilter || fornecedorFilter || dataInicio || dataFim) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setBusca('');
                setStatusFilter('');
                setFornecedorFilter('');
                setDataInicio('');
                setDataFim('');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      {isLoading ? (
        <TableSkeleton columns={7} rows={6} />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-semibold text-red-900">Erro no carregamento</h3>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button 
            onClick={fetchPedidosData}
            className="mt-4 text-sm font-semibold text-red-600 hover:text-red-500 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataTable 
            data={pedidos} 
            columns={columns} 
            rowActions={(row) => {
              const isDraft = row.status === 'RASCUNHO';
              const isPendingOrAccepted = ['PENDENTE', 'ACEITO'].includes(row.status);
              
              return (
                <div className="flex items-center justify-end gap-2">
                  {/* Visualizar Detalhes */}
                  <button
                    onClick={() => handleViewDetails(row.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                    title="Visualizar Detalhes"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Detalhes</span>
                  </button>

                  {/* Edit Draft */}
                  {isDraft && (
                    <Link 
                      to={`/pedidos/novo?id=${row.id}`} 
                      className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-2.5 py-1.5 rounded-md transition-colors"
                      title="Editar Rascunho"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </Link>
                  )}

                  {/* Confirm Delivery */}
                  {isPendingOrAccepted && (
                    <Link 
                      to={`/confirmar-entrega/${row.id}`} 
                      className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-md transition-colors"
                      title="Confirmar recebimento da entrega"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Receber</span>
                    </Link>
                  )}

                  {/* Cancel Order */}
                  {isPendingOrAccepted && (
                    <button
                      onClick={() => handleCancelClick(row.id, row.numero)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                      title="Cancelar Pedido"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Cancelar</span>
                    </button>
                  )}
                </div>
              );
            }}
          />
        </div>
      )}

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          if (!isCancelling) {
            setCancelModalOpen(false);
            setPedidoToCancel(null);
          }
        }}
        onConfirm={handleConfirmCancel}
        title="Cancelar Pedido de Compra?"
        message={`Tem certeza que deseja cancelar o pedido ${pedidoToCancel?.numero || ''}? Esta ação é irreversível e irá estornar/devolver todos os saldos consumidos na ATA correspondente.`}
        confirmText="Sim, Cancelar Pedido"
        cancelText="Voltar"
        isDanger={true}
        isLoading={isCancelling}
      />

      {/* Detail Modal */}
      <ModalDetalhesPedido
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedPedidoId(null);
        }}
        pedidoId={selectedPedidoId}
      />
    </div>
  );
}
