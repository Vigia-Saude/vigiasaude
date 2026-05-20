import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { getAtas } from '../../services/ataService';
import type { AtaWithFornecedor } from '../../services/ataService';
import { DataTable } from '../../components/ui/DataTable';
import type { ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import { ModalNovaAta } from '../../components/Atas/ModalNovaAta';
import { Eye, Clock, AlertCircle } from 'lucide-react';

export function AtasLista() {
  const [data, setData] = useState<AtaWithFornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await getAtas();
      setData(result);
    } catch (err) {
      console.error('Erro ao carregar atas:', err);
      setError('Ocorreu um erro ao carregar os dados das Atas.');
      toast.error('Erro ao carregar atas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isVencendoEm45DiasOuMenos = (dataFim: string) => {
    const hoje = new Date();
    const fim = new Date(dataFim);
    const difTempo = fim.getTime() - hoje.getTime();
    const difDias = Math.ceil(difTempo / (1000 * 3600 * 24));
    return difDias >= 0 && difDias <= 45;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  const columns: ColumnDef<AtaWithFornecedor>[] = [
    {
      header: 'Número da Ata',
      accessorKey: 'numero',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{row.numero}</span>
          {isVencendoEm45DiasOuMenos(row.dataFim) && (
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse" title="Vencendo em 45 dias ou menos">
              <Clock className="w-3 h-3" />
              <span>Próx. Vencimento</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Fornecedor',
      accessorKey: 'fornecedorNome',
      sortable: true,
    },
    {
      header: 'Fim da Vigência',
      accessorKey: 'dataFim',
      sortable: true,
      cell: (row) => formatDate(row.dataFim),
    },
    {
      header: 'Valor Teto',
      accessorKey: 'valorTeto',
      sortable: true,
      cell: (row) => formatCurrency(row.valorTeto),
    },
    {
      header: 'Valor Consumido',
      accessorKey: 'valorConsumido',
      sortable: true,
      cell: (row) => {
        const pct = row.valorTeto > 0 ? (Number(row.valorConsumido) / Number(row.valorTeto)) * 100 : 0;
        
        let colorClass = 'bg-blue-500';
        let badgeClass = 'text-blue-700 bg-blue-50';
        
        if (pct >= 100) {
          colorClass = 'bg-red-500';
          badgeClass = 'text-red-700 bg-red-50';
        } else if (pct >= 80) {
          colorClass = 'bg-amber-500';
          badgeClass = 'text-amber-700 bg-amber-50';
        } else {
          colorClass = 'bg-blue-500';
          badgeClass = 'text-blue-600 bg-blue-50';
        }
        
        return (
          <div className="flex flex-col gap-1 min-w-[130px]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-900">{formatCurrency(row.valorConsumido || 0)}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${badgeClass}`}>
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${colorClass}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        let variant: any = 'gray';
        if (row.status === 'ATIVA') variant = 'green';
        if (row.status === 'VENCIDA') variant = 'red';
        if (row.status === 'CANCELADA') variant = 'gray';
        if (row.status === 'EM_REVISAO') variant = 'yellow';
        if (row.status === 'ESGOTADA') variant = 'red';
        return <StatusBadge status={row.status} variant={variant} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Atas (SRP)</h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe as Atas de Registro de Preços ativas e histórico.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all"
        >
          + Nova Ata
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} rows={3} />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-semibold text-red-900">Erro no carregamento</h3>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="mt-4 text-sm font-medium text-red-600 hover:text-red-500 underline"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <DataTable 
          data={data} 
          columns={columns} 
          rowActions={(row) => (
            <Link 
              to={`/atas/${row.id}`} 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 hover:bg-gray-100 hover:text-gray-900 h-9 w-9 border border-gray-200"
              title="Visualizar Detalhes"
            >
              <Eye className="h-4 w-4 text-blue-600" />
            </Link>
          )}
        />
      )}

      {/* Modal Slide-Over de Nova Ata */}
      <ModalNovaAta 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={() => {
          fetchData();
          toast.success('Listagem de Atas atualizada.');
        }} 
      />
    </div>
  );
}
