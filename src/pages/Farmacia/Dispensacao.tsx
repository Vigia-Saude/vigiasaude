import { Pill } from 'lucide-react';

export function Dispensacao() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Pill className="h-6 w-6 text-emerald-600" />
          Dispensação de Medicamentos
        </h1>
        <p className="mt-1 text-sm text-gray-500">Registro de entrega de medicamentos para pacientes com base em receitas médicas.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500 font-medium">
        <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-950 font-bold mb-1">Dispensação de Medicamentos</p>
        <p className="text-sm text-gray-400">O fluxo de busca de receitas, validação de lotes e registro de dispensação será implementado aqui.</p>
      </div>
    </div>
  );
}
