import { ScanBarcode, Camera } from 'lucide-react';

export function Rastreabilidade() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ScanBarcode className="h-6 w-6 text-blue-600" />
          Rastreabilidade de Medicamentos
        </h1>
        <p className="mt-1 text-sm text-gray-500">Consulte a cadeia de custódia completa e o histórico dos lotes e caixas.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Código Serial ou GS1</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite o código Datamatrix, UDI ou Código de Barras..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
              Rastrear
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-center w-full md:w-64 cursor-pointer hover:bg-gray-100 transition-colors">
          <Camera className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm font-bold text-gray-750">Escanear com a Câmera</span>
          <span className="text-xs text-gray-400">Leitor Datamatrix/QR Code</span>
        </div>
      </div>
    </div>
  );
}
