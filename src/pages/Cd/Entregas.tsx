import { MapPin } from 'lucide-react';

export function Entregas() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-600" />
          Controle de Entregas
        </h1>
        <p className="mt-1 text-sm text-gray-500">Acompanhamento de rotas e status das entregas nas farmácias.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500 font-medium">
        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-950 font-bold mb-1">Status de Rotas e Envios</p>
        <p className="text-sm text-gray-400">As ordens de transporte e o status do motorista serão mostrados aqui.</p>
      </div>
    </div>
  );
}
