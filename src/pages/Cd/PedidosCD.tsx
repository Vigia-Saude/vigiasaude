import { ShoppingCart } from 'lucide-react';

export function PedidosCD() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          Pedidos de Recomposição de Estoque
        </h1>
        <p className="mt-1 text-sm text-gray-500">Pedidos de reabastecimento solicitados pelas farmácias municipais.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500 font-medium">
        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-950 font-bold mb-1">Pedidos Pendentes das Farmácias</p>
        <p className="text-sm text-gray-400">Listagem de pedidos de transferência e separação de estoque no CD.</p>
      </div>
    </div>
  );
}
