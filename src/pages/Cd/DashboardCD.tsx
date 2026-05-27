import { Home, Package, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export function DashboardCD() {
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
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <RefreshCw className="h-4 w-4" />
          Atualizar Dados
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Itens Cadastrados</span>
          <span className="text-3xl font-bold text-gray-900">1.240</span>
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
            <TrendingUp className="h-3.5 w-3.5" />
            +4.2% em relação ao mês anterior
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Volume Ocupado</span>
          <span className="text-3xl font-bold text-gray-900">74%</span>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '74%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recebimentos Hoje</span>
          <span className="text-3xl font-bold text-gray-900">8 lotes</span>
          <span className="text-xs text-gray-500 font-medium mt-2">Total de 45.000 unidades</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alertas Ativos</span>
          <span className="text-3xl font-bold text-red-650">3 alertas</span>
          <div className="text-xs text-red-500 font-medium flex items-center gap-1 mt-2">
            <AlertCircle className="h-3.5 w-3.5" />
            Validade próxima ou estoque crítico
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Giro de Estoque</h3>
          <div className="h-64 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-medium">
            Visualização de Gráfico de Linhas (Giro de Medicamentos)
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Categorias de Medicamentos</h3>
          <div className="h-64 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-medium">
            Visualização de Gráfico de Rosca (Distribuição)
          </div>
        </div>
      </div>
    </div>
  );
}
