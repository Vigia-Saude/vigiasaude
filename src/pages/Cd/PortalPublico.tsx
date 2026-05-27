import { ExternalLink } from 'lucide-react';

export function PortalPublico() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ExternalLink className="h-6 w-6 text-blue-600" />
          Portal Público de Transparência
        </h1>
        <p className="mt-1 text-sm text-gray-500">Visualização externa do estoque e andamento dos recalls para a população.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 text-center text-gray-500 font-medium">
        <ExternalLink className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-950 font-bold mb-1">Acesso ao Portal do Cidadão</p>
        <p className="text-sm text-gray-400">Esta tela redireciona ou incorpora o painel de consulta pública de medicamentos.</p>
      </div>
    </div>
  );
}
