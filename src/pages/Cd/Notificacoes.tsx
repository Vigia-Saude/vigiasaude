import { Bell, CheckSquare } from 'lucide-react';

export function Notificacoes() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Central de Notificações
          </h1>
          <p className="mt-1 text-sm text-gray-500">Alertas urgentes do Centro de Distribuição e mensagens do sistema.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          <CheckSquare className="h-4 w-4" />
          Marcar todas como lidas
        </button>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-150 overflow-hidden">
        <div className="p-4 flex gap-4 bg-blue-50/40 select-none">
          <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-gray-900 text-sm">Pedido de Recomposição Urgente</h4>
              <span className="text-xs text-gray-400 font-medium">Há 10 min</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Farmácia Central solicitou reforço urgente de Insulina NPH.</p>
          </div>
        </div>

        <div className="p-4 flex gap-4 bg-blue-50/40 select-none">
          <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-gray-900 text-sm">Alerta de Temperatura da Câmara Fria</h4>
              <span className="text-xs text-gray-400 font-medium">Há 25 min</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Sensor #3 detectou elevação momentânea de temperatura (+6°C).</p>
          </div>
        </div>

        <div className="p-4 flex gap-4 bg-blue-50/40 select-none">
          <span className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-gray-900 text-sm">Recebimento Confirmado</h4>
              <span className="text-xs text-gray-400 font-medium">Há 1 hora</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Nota Fiscal XML #45892 importada e lotes criados com sucesso.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
