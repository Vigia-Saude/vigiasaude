import { useState, useEffect, useCallback } from 'react';
import { Home, Package, TrendingUp, AlertCircle, RefreshCw, ShoppingCart, Loader2, BarChart2, PieChart } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface DashboardMetrics {
  itensEstoque: number;
  totalUnidades: number;
  dispensacoesHoje: number;
  unidadesDispensadasHoje: number;
  alertasAtivos: number;
  pedidosPendentes: number;
}

export function DashboardPosto() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    itensEstoque: 0,
    totalUnidades: 0,
    dispensacoesHoje: 0,
    unidadesDispensadasHoje: 0,
    alertasAtivos: 0,
    pedidosPendentes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [estoqueRes, dispensacoesRes, alertasRes, pedidosRes] = await Promise.allSettled([
        apiClient.get('/api/cd/estoque', { params: { limit: 100 } }),
        apiClient.get('/api/farmacia/dispensacoes/recentes'),
        apiClient.get('/api/cd/alertas'),
        apiClient.get('/api/cd/pedidos-reposicao', { params: { limit: 1 } }),
      ]);

      let itensEstoque = 0;
      let totalUnidades = 0;
      if (estoqueRes.status === 'fulfilled') {
        const dados = estoqueRes.value.data?.dados || estoqueRes.value.data || [];
        itensEstoque = Array.isArray(dados) ? dados.length : 0;
        totalUnidades = Array.isArray(dados) 
          ? dados.reduce((acc: number, item: any) => acc + (Number(item.quantidadeAtual) || 0), 0)
          : 0;
      }

      let dispensacoesHoje = 0;
      let unidadesDispensadasHoje = 0;
      if (dispensacoesRes.status === 'fulfilled') {
        const dispList = Array.isArray(dispensacoesRes.value.data) ? dispensacoesRes.value.data : [];
        dispensacoesHoje = dispList.length;
        unidadesDispensadasHoje = dispList.reduce((acc: number, d: any) => {
          const itemQty = Array.isArray(d.itens) 
            ? d.itens.reduce((sum: number, it: any) => sum + (Number(it.quantidade) || 0), 0)
            : 0;
          return acc + itemQty;
        }, 0);
      }

      let alertasAtivos = 0;
      if (alertasRes.status === 'fulfilled') {
        const alertList = Array.isArray(alertasRes.value.data) ? alertasRes.value.data : [];
        alertasAtivos = alertList.filter((a: any) => a.status === 'NOVO' || a.status === 'PENDENTE').length;
      }

      let pedidosPendentes = 0;
      if (pedidosRes.status === 'fulfilled') {
        pedidosPendentes = pedidosRes.value.data?.stats?.pendentes || 0;
      }

      setMetrics({
        itensEstoque,
        totalUnidades,
        dispensacoesHoje,
        unidadesDispensadasHoje,
        alertasAtivos,
        pedidosPendentes,
      });
    } catch (err) {
      console.error('Erro ao carregar métricas do posto:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Home className="h-6 w-6 text-cyan-600" />
            Dashboard do Posto de Saúde
          </h1>
          <p className="mt-1 text-sm text-gray-500">Métricas operacionais reais, controle de dispensação e status do posto.</p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-600' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Itens em Estoque</span>
          {loading ? (
            <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <span className="text-3xl font-black text-gray-900">{metrics.itensEstoque}</span>
          )}
          <span className="text-xs text-cyan-600 font-medium flex items-center gap-1 mt-1">
            <Package className="h-3.5 w-3.5" />
            {metrics.totalUnidades.toLocaleString('pt-BR')} unidades no total
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dispensações Hoje</span>
          {loading ? (
            <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <span className="text-3xl font-black text-gray-900">{metrics.dispensacoesHoje} receitas</span>
          )}
          <span className="text-xs text-gray-500 font-medium mt-1">
            {metrics.unidadesDispensadasHoje} unidades entregues
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recomposição Pendente</span>
          {loading ? (
            <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <span className="text-3xl font-black text-blue-600">{metrics.pedidosPendentes} pedidos</span>
          )}
          <span className="text-xs text-blue-500 font-medium flex items-center gap-1 mt-1">
            <ShoppingCart className="h-3.5 w-3.5" />
            Aguardando atendimento do CD
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alertas Ativos</span>
          {loading ? (
            <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <span className={`text-3xl font-black ${metrics.alertasAtivos > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {metrics.alertasAtivos} {metrics.alertasAtivos === 1 ? 'alerta' : 'alertas'}
            </span>
          )}
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
            <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
            {metrics.alertasAtivos > 0 ? 'Estoque crítico ou validade próxima' : 'Sem alertas de estoque no momento'}
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-cyan-600" />
            Giro de Estoque do Posto de Saúde
          </h3>
          <div className="h-64 rounded-xl bg-gray-50/50 border border-gray-150 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <BarChart2 className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-xs font-bold text-gray-600">Nenhuma movimentação para exibir no gráfico</p>
            <p className="text-[11px] text-gray-400 max-w-sm mt-1">
              Os dados de consumo e giro serão consolidados conforme novas dispensações forem registradas no posto.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-cyan-600" />
            Categorias Dispensadas
          </h3>
          <div className="h-64 rounded-xl bg-gray-50/50 border border-gray-150 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <PieChart className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-xs font-bold text-gray-600">Sem categorias registradas</p>
            <p className="text-[11px] text-gray-400 max-w-xs mt-1">
              A distribuição por categoria aparecerá automaticamente com o histórico de dispensações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

