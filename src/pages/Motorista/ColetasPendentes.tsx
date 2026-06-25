import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Loader2, PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';
import BipagemTracker from '../../components/Bipagem/BipagemTracker';
import type { BipagemItem, BipagemResult } from '../../components/Bipagem/BipagemTracker';

interface ColetaItemMedicamento {
  id: string;
  medicamentoNome: string;
  quantidade: number;
  catmatCodigo?: string;
  loteSugerido?: string;
}

interface Coleta {
  id: string;
  numero: string;
  unidadeNome: string;
  urgencia: 'ALTA' | 'MEDIA' | 'BAIXA';
  criadoEm: string;
  itens: ColetaItemMedicamento[];
}

const urgencyBadge = (urgencia: string) => {
  switch (urgencia) {
    case 'ALTA':
      return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Alta</span>;
    case 'MEDIA':
      return <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Média</span>;
    case 'BAIXA':
      return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Baixa</span>;
    default:
      return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{urgencia}</span>;
  }
};

export function ColetasPendentes() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBipagem, setShowBipagem] = useState(false);
  const [bipagemPedido, setBipagemPedido] = useState<Coleta | null>(null);
  const [accepting, setAccepting] = useState(false);

  const limit = 10;

  const fetchColetas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/motorista/coletas', { params: { page, limit } });
      const data = res.data;
      const coletasArray = Array.isArray(data) ? data : (Array.isArray(data?.dados) ? data.dados : (Array.isArray(data?.data) ? data.data : []));
      setColetas(coletasArray);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Erro ao carregar coletas:', err);
      toast.error('Erro ao carregar coletas pendentes');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchColetas();
  }, [fetchColetas]);

  const handleIniciarColeta = (pedido: Coleta) => {
    setBipagemPedido(pedido);
    setShowBipagem(true);
  };

  const handleBipagemComplete = async (bipagens: BipagemResult[]) => {
    if (!bipagemPedido) return;
    setAccepting(true);
    try {
      await apiClient.patch(`/api/motorista/coletas/${bipagemPedido.id}/aceitar`);
      toast.success('Coleta confirmada com sucesso! A entrega foi iniciada.');
      setColetas((prev) => prev.filter((c) => c.id !== bipagemPedido.id));
      setShowBipagem(false);
      setBipagemPedido(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao confirmar coleta. Tente novamente.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-amber-600" />
          Coletas Pendentes
        </h1>
        <p className="mt-1 text-sm text-gray-500">Visualize e aceite as coletas disponíveis para entrega.</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : coletas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
          <PackageOpen className="h-14 w-14 mb-4 stroke-[1.5]" />
          <p className="text-base font-medium text-gray-500">Nenhuma coleta pendente</p>
          <p className="text-sm mt-1">Quando novas coletas estiverem disponíveis, elas aparecerão aqui.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coletas.map((coleta) => (
              <div key={coleta.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{coleta.numero}</p>
                    <p className="text-base font-bold text-gray-900 mt-1">{coleta.unidadeNome}</p>
                  </div>
                  {urgencyBadge(coleta.urgencia)}
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500">
                  Criado em {new Date(coleta.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Items List */}
                {coleta.itens && coleta.itens.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Itens</p>
                    {coleta.itens.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate">{item.medicamentoNome}</span>
                        <span className="text-gray-500 font-medium shrink-0 ml-2">x{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleIniciarColeta(coleta)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-700 transition-all cursor-pointer mt-auto"
                >
                  Iniciar Coleta
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <span className="text-sm font-medium text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Bipagem Tracker Modal */}
      {showBipagem && bipagemPedido && (
        <BipagemTracker
          items={bipagemPedido.itens.map((item) => ({
            id: item.id,
            codigo: item.catmatCodigo || item.id,
            nome: item.medicamentoNome,
            quantidade: item.quantidade,
            lote: item.loteSugerido || undefined,
          }))}
          pedidoNumero={bipagemPedido.numero}
          tipo="COLETA"
          onComplete={handleBipagemComplete}
          onCancel={() => {
            setShowBipagem(false);
            setBipagemPedido(null);
          }}
        />
      )}
    </div>
  );
}
