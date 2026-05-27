import { FileDigit, UploadCloud } from 'lucide-react';

export function ImportacaoNF() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FileDigit className="h-6 w-6 text-blue-600" />
          Importação de Nota Fiscal (XML)
        </h1>
        <p className="mt-1 text-sm text-gray-500">Importe arquivos XML para dar entrada automática em lotes e estoques.</p>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-8 rounded-xl border border-gray-250 shadow-sm">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer select-none">
          <UploadCloud className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Arraste e solte o arquivo XML</h3>
          <p className="text-sm text-gray-500 mb-4">Ou clique para procurar em seu computador</p>
          <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
            Selecionar Arquivo
          </span>
        </div>
      </div>
    </div>
  );
}
