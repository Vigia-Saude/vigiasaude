import { Home, AlertCircle, RefreshCw, Loader2, Layers, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCdDashboardStats } from '../../services/cdService';

export function DashboardCD() {
  const { data: stats, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['cdDashboardStats'],
    queryFn: getCdDashboardStats,
  });

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Home className="h-6 w-6 text-blue-600" />
            Dashboard do Centro de Distribuição
          </h1>
          <p className="mt-1 text-sm text-gray-500">Métricas operacionais, controle de inventário e status de abastecimento.</p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          Não foi possível carregar as estatísticas do Centro de Distribuição.
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card Itens Cadastrados */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Itens Cadastrados</span>
              <span className="text-3xl font-bold text-gray-900">
                {stats?.itensCadastradosCount?.toLocaleString('pt-BR') || 0}
              </span>
              <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-2">
                Medicamentos distintos no CD
              </div>
            </div>

            {/* Card Lotes no Estoque */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lotes no Estoque</span>
              <span className="text-3xl font-bold text-gray-900">
                {stats?.lotesDisponiveisCount?.toLocaleString('pt-BR') || 0}
              </span>
              <div className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-2">
                <Layers className="h-3.5 w-3.5 text-blue-500" />
                Lotes disponíveis para atendimento
              </div>
            </div>

            {/* Card Recebimentos Hoje */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recebimentos Hoje</span>
              <span className="text-3xl font-bold text-gray-900">
                {stats?.recebimentosHojeLotes || 0} {stats?.recebimentosHojeLotes === 1 ? 'lote' : 'lotes'}
              </span>
              <span className="text-xs text-gray-500 font-medium mt-2">
                Total de {(stats?.recebimentosHojeUnidades || 0).toLocaleString('pt-BR')} unidades
              </span>
            </div>

            {/* Card Alertas Ativos */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alertas Ativos</span>
              <span className={`text-3xl font-bold ${stats?.alertasAtivosCount ? 'text-red-600' : 'text-gray-900'}`}>
                {stats?.alertasAtivosCount || 0} {stats?.alertasAtivosCount === 1 ? 'alerta' : 'alertas'}
              </span>
              <div className={`text-xs font-medium flex items-center gap-1 mt-2 ${stats?.alertasAtivosCount ? 'text-red-500' : 'text-emerald-600'}`}>
                {stats?.alertasAtivosCount ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    Validade próxima ou estoque crítico
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Nenhum alerta pendente
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Giro de Estoque</h3>
              <div className="h-64 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 font-medium gap-1">
                <span>Giro de Medicamentos</span>
                <span className="text-xs text-gray-400">Nenhum dado cadastrado para exibição do gráfico</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Categorias de Medicamentos</h3>
              <div className="h-64 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 font-medium gap-1">
                <span>Distribuição de Categorias</span>
                <span className="text-xs text-gray-400">Nenhum dado cadastrado para exibição do gráfico</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
