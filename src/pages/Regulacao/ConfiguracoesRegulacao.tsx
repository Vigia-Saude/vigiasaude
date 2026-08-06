import { Settings, AlertCircle } from 'lucide-react';

export function ConfiguracoesRegulacao() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-500" />
          Configurações da Regulação
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerenciamento de parâmetros e preferências da central de regulação.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 mb-4 border border-amber-100">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Nenhuma configuração disponível
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Não há nada configurável por aqui no momento. As opções do perfil da regulação serão disponibilizadas futuramente.
        </p>
      </div>
    </div>
  );
}
