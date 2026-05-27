import { AlertTriangle } from 'lucide-react';

export function Recalls() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          Alertas de Recall (Bloqueio Sanitário)
        </h1>
        <p className="mt-1 text-sm text-gray-500">Alertas da ANVISA ou problemas de qualidade de lotes sob quarentena.</p>
      </div>

      {/* Recalls lists */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex gap-4 select-none">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-red-155 text-red-700 flex items-center justify-center font-bold">
            01
          </div>
          <div>
            <h3 className="font-bold text-red-950">Lote #XPT-9087 (Amoxicilina 500mg)</h3>
            <p className="text-sm text-red-800 mt-1">
              Desvio de qualidade relatado pela ANVISA. Bloqueio imediato do estoque físico e proibição de dispensação.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4 select-none">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-amber-155 text-amber-700 flex items-center justify-center font-bold">
            02
          </div>
          <div>
            <h3 className="font-bold text-amber-950">Lote #MED-4411 (Paracetamol Suspensão)</h3>
            <p className="text-sm text-amber-800 mt-1">
              Investigação interna por suspeita de avaria em caixa master. Manter em quarentena até liberação da auditoria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
