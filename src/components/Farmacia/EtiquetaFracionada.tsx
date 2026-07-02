import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { X, Printer, CheckCircle } from 'lucide-react';

interface EtiquetaFracionadaProps {
  isOpen: boolean;
  onClose: () => void;
  dados: {
    codigoQr: string;
    quantidadeAtual: number;
    numeroLote: string;
    validade: string;
    medicamentoNome: string;
    unidadeMedida: string;
    caixasAbertas?: number;
  } | null;
}

export const EtiquetaFracionada: React.FC<EtiquetaFracionadaProps> = ({
  isOpen,
  onClose,
  dados,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !dados) return null;

  const handlePrint = () => {
    // Adiciona classe de impressão no body e aciona print
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Abre janela de impressão limpa
      const printWindow = window.open('', '_blank', 'width=600,height=400');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Etiqueta Fracionada - Vigia Saúde</title>
              <style>
                @page {
                  size: 50mm 30mm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 2mm;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  font-size: 7.5pt;
                  line-height: 1.1;
                  color: #000;
                  background: #fff;
                  box-sizing: border-box;
                  width: 50mm;
                  height: 30mm;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }
                .label-container {
                  display: flex;
                  width: 100%;
                  height: 100%;
                  align-items: center;
                  gap: 2mm;
                }
                .qr-section {
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 22mm;
                  height: 22mm;
                }
                .qr-section svg {
                  width: 100% !important;
                  height: 100% !important;
                }
                .info-section {
                  flex-grow: 1;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  height: 100%;
                  overflow: hidden;
                }
                .title {
                  font-weight: 700;
                  font-size: 8pt;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  text-transform: uppercase;
                }
                .code {
                  font-family: monospace;
                  font-weight: bold;
                  font-size: 7pt;
                  background: #e2e8f0;
                  padding: 0.2mm 0.8mm;
                  border-radius: 0.5mm;
                  width: fit-content;
                }
                .detail {
                  font-size: 6.5pt;
                  color: #334155;
                }
                .qty {
                  font-size: 9pt;
                  font-weight: 800;
                  color: #000;
                  border-top: 0.2mm solid #cbd5e1;
                  padding-top: 0.5mm;
                  margin-top: 0.5mm;
                }
              </style>
            </head>
            <body>
              ${printContent}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const formatValidade = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();
      return `${mes}/${ano}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">Dispensação Concluída</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-slate-300 text-sm">
              O medicamento foi dispensado com sucesso!
            </p>
            {dados.caixasAbertas && dados.caixasAbertas > 0 ? (
              <p className="text-amber-400 font-medium text-sm mt-1">
                ⚠️ Atenção: Foi aberta {dados.caixasAbertas} caixa(s) fechada(s).
              </p>
            ) : null}
            <p className="text-emerald-400 font-medium text-sm mt-1">
              Imprima a etiqueta abaixo e cole no saquinho (Ziplock) com os comprimidos avulsos.
            </p>
          </div>

          {/* Label Preview Container */}
          <div className="flex justify-center p-6 bg-slate-950 border border-slate-800 rounded-xl mb-6">
            
            {/* The actual label design that matches print layout */}
            <div 
              ref={printAreaRef}
              className="bg-white text-black p-3 rounded shadow-md flex items-center justify-between gap-3 select-none"
              style={{ width: '220px', height: '130px', boxSizing: 'border-box' }}
            >
              <div className="label-container flex items-center w-full h-full gap-2">
                {/* QR Section */}
                <div className="qr-section flex-shrink-0 flex items-center justify-center" style={{ width: '80px', height: '80px' }}>
                  <QRCode 
                    value={dados.codigoQr} 
                    size={80}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                {/* Info Section */}
                <div className="info-section flex-grow flex flex-col justify-between h-full text-[9px] leading-tight overflow-hidden text-left">
                  <div>
                    <div className="title font-bold text-[10px] truncate max-w-[110px]" title={dados.medicamentoNome}>
                      {dados.medicamentoNome}
                    </div>
                    <div className="code font-mono font-bold text-[8px] bg-slate-200 px-1 rounded inline-block mt-0.5">
                      {dados.codigoQr}
                    </div>
                  </div>
                  
                  <div className="detail text-slate-600 text-[8px] mt-1">
                    <div>Lote: {dados.numeroLote}</div>
                    <div>Val: {formatValidade(dados.validade)}</div>
                  </div>
                  
                  <div className="qty text-[11px] font-extrabold border-t border-slate-300 pt-0.5 mt-0.5">
                    Saldo: {dados.quantidadeAtual} {dados.unidadeMedida}(s)
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-850 font-medium rounded-xl text-slate-300 transition-all text-sm"
            >
              Concluir sem Imprimir
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-white shadow-lg shadow-indigo-600/25 transition-all text-sm"
            >
              <Printer className="h-4 w-4" />
              Imprimir Etiqueta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
