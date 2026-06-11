import { Truck } from 'lucide-react';

export function EntregasReposicao() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Truck className="h-6 w-6 text-emerald-600" />
          Entregas de Reposição
        </h1>
        <p className="mt-1 text-sm text-gray-500">Acompanhamento e recebimento de cargas enviadas pelo Centro de Distribuição.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500 font-medium">
        <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-950 font-bold mb-1">Entregas e Recebimentos</p>
        <p className="text-sm text-gray-400">As remessas em trânsito e a conferência de recebimento das caixas estarão disponíveis aqui.</p>
      </div>
    </div>
  );
}
