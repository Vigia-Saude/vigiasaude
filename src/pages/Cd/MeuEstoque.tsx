import { Package, Search, Filter } from 'lucide-react';

export function MeuEstoque() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          Meu Estoque
        </h1>
        <p className="mt-1 text-sm text-gray-500">Visualização de saldos de produtos, lotes, endereçamento e controle de validades.</p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, lote, código de barras..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full md:w-auto justify-center">
          <Filter className="h-4 w-4" />
          Filtros Avançados
        </button>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 text-center text-gray-500 font-medium h-80 flex flex-col justify-center items-center">
          <Package className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-900 font-bold mb-1">Tabela de Controle do Inventário</p>
          <p className="text-sm text-gray-400">Os dados detalhados dos lotes do Centro de Distribuição serão exibidos aqui.</p>
        </div>
      </div>
    </div>
  );
}
