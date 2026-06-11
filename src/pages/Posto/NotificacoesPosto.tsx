import { Bell } from 'lucide-react';

export function NotificacoesPosto() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6 text-cyan-600" />
          Central de Notificações
        </h1>
        <p className="mt-1 text-sm text-gray-500">Alertas de recall de medicamentos, vencimentos próximos e mensagens do sistema.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500 font-medium">
        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-950 font-bold mb-1">Notificações e Alertas</p>
        <p className="text-sm text-gray-400">As notificações direcionadas a este posto de saúde serão listadas aqui.</p>
      </div>
    </div>
  );
}
