import { Settings } from 'lucide-react';

export function ConfiguracoesPosto() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-600" />
          Configurações do Posto de Saúde
        </h1>
        <p className="mt-1 text-sm text-gray-500">Parâmetros operacionais e preferências locais do posto de saúde.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500 font-medium">
        <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-950 font-bold mb-1">Configurações do Perfil</p>
        <p className="text-sm text-gray-400">Opções de layout, notificações e dados da unidade estarão disponíveis aqui.</p>
      </div>
    </div>
  );
}
