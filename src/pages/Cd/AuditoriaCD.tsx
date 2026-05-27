import { History, Calendar, Download } from 'lucide-react';

export function AuditoriaCD() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600" />
            Auditoria e Logs do CD
          </h1>
          <p className="mt-1 text-sm text-gray-500">Histórico detalhado e imutável de todas as movimentações e operações de estoque.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 border border-gray-350 rounded-lg px-3 py-2 bg-white text-sm text-gray-750">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>Últimos 7 dias</span>
        </div>
        <select className="border border-gray-350 rounded-lg px-3 py-2 bg-white text-sm text-gray-750 focus:outline-none">
          <option>Todos os Operadores</option>
        </select>
        <select className="border border-gray-350 rounded-lg px-3 py-2 bg-white text-sm text-gray-750 focus:outline-none">
          <option>Todas as Ações</option>
          <option>Entrada de Estoque</option>
          <option>Saída de Estoque</option>
          <option>Ajuste de Inventário</option>
        </select>
      </div>

      {/* Logs layout */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
        <div className="p-6 text-center text-gray-500 font-medium">
          Nenhum registro de auditoria encontrado para o período selecionado.
        </div>
      </div>
    </div>
  );
}
