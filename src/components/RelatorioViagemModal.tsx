import React, { useEffect, useState, useRef } from 'react';
import { X, Printer, MapPin, CheckCircle, Clock, Car, User, FileText, AlertCircle, ShieldCheck, Navigation } from 'lucide-react';
import { viagemService, RelatorioViagemResponse } from '../services/viagemService';

interface RelatorioViagemModalProps {
  viagemId: string;
  onClose: () => void;
}

export const RelatorioViagemModal: React.FC<RelatorioViagemModalProps> = ({ viagemId, onClose }) => {
  const [data, setData] = useState<RelatorioViagemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRelatorio = async () => {
      try {
        setLoading(true);
        const res = await viagemService.obterRelatorio(viagemId);
        setData(res);
      } catch (err: any) {
        console.error('Erro ao carregar relatório:', err);
        setError('Não foi possível carregar o relatório da viagem.');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorio();
  }, [viagemId]);

  // Função de Impressão 100% Confiável e Isolada
  const handlePrint = () => {
    const element = document.getElementById('relatorio-imprimivel');
    if (!element) {
      window.print();
      return;
    }

    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (iframe) {
      document.body.removeChild(iframe);
    }

    iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(s => s.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Relatório de Viagem - Vigia Saúde</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            body {
              background: #ffffff !important;
              color: #111827 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #relatorio-imprimivel {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }
          </style>
        </head>
        <body class="bg-white p-2">
          <div id="relatorio-imprimivel">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  };

  const formatarDataHora = (dataStr?: string | null) => {
    if (!dataStr) return 'Não registrado';
    return new Date(dataStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-amber-900">Gerando relatório consolidado...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-bold">Erro no Relatório</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">{error || 'Dados não encontrados.'}</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const { viagem, resumo } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Barra Superior de Ações */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-200 bg-amber-50/70">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-amber-950">Relatório de Transporte Sanitário & Viagem</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório Oficial (Imprimível em A4) */}
        <div className="p-6 sm:p-8 overflow-y-auto text-gray-900 bg-white" id="relatorio-imprimivel" ref={reportRef}>
          
          {/* Cabeçalho Oficial do Município */}
          <div className="flex items-center justify-between pb-5 border-b-2 border-gray-900 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
                VS
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 uppercase">
                  Prefeitura Municipal &bull; Secretaria de Saúde
                </h1>
                <p className="text-xs font-bold text-amber-900 uppercase">
                  Vigia-Saúde &bull; Sistema Integrado de Regulação e Transporte Sanitário (TFD)
                </p>
                <p className="text-[11px] text-gray-500">
                  Comprovante Oficial de Viagem e Deslocamento de Pacientes
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle className="w-3.5 h-3.5" />
                VIAGEM CONCLUÍDA
              </span>
              <p className="text-[11px] text-gray-500 mt-1 font-mono">
                ID: {viagem.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Dados Gerais da Viagem & Veículo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-amber-50/40 border border-amber-200 mb-6 text-xs">
            <div>
              <span className="text-gray-500 font-medium block">Motorista Responsável</span>
              <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                {viagem.motorista?.nome || 'Motorista Municipal'}
              </span>
              {viagem.motorista?.cpf && (
                <span className="text-[11px] text-gray-500 font-mono">CPF: {viagem.motorista.cpf}</span>
              )}
            </div>

            <div>
              <span className="text-gray-500 font-medium block">Veículo / Placa</span>
              <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5 mt-0.5">
                <Car className="w-3.5 h-3.5 text-amber-600" />
                {viagem.veiculo}
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                Placa: {viagem.placa || 'Oficial'}
              </span>
            </div>

            <div>
              <span className="text-gray-500 font-medium block">Origem & Destino</span>
              <span className="font-bold text-gray-900 text-sm block mt-0.5">
                {viagem.origem}
              </span>
              <span className="text-[11px] text-amber-800 font-bold block">
                &rarr; {viagem.destino}
              </span>
            </div>

            <div>
              <span className="text-gray-500 font-medium block">Tempo Total de Rota</span>
              <span className="font-bold text-amber-800 text-sm block mt-0.5">
                {resumo.tempoTotalMinutos ? `${resumo.tempoTotalMinutos} minutos` : 'Concluída'}
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                Data: {new Date(viagem.dataViagem).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* AS 4 ETAPAS DA JORNADA */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-600" />
              1. Registro das 4 Etapas da Jornada
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70">
                <span className="text-[10px] font-black text-amber-800 uppercase block">Etapa 1</span>
                <span className="font-bold text-gray-900 text-xs block mt-0.5">Saída da Cidade</span>
                <span className="text-[11px] text-gray-600 block mt-1 font-mono">
                  {formatarDataHora(viagem.saidaOrigemEm || viagem.iniciadaEm)}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70">
                <span className="text-[10px] font-black text-amber-800 uppercase block">Etapa 2</span>
                <span className="font-bold text-gray-900 text-xs block mt-0.5">Chegada no Destino</span>
                <span className="text-[11px] text-gray-600 block mt-1 font-mono">
                  {formatarDataHora(viagem.chegadaDestinoEm)}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70">
                <span className="text-[10px] font-black text-amber-800 uppercase block">Etapa 3</span>
                <span className="font-bold text-gray-900 text-xs block mt-0.5">Saída do Destino</span>
                <span className="text-[11px] text-gray-600 block mt-1 font-mono">
                  {formatarDataHora(viagem.saidaDestinoEm)}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50/70">
                <span className="text-[10px] font-black text-emerald-800 uppercase block">Etapa 4</span>
                <span className="font-bold text-gray-900 text-xs block mt-0.5">Chegada na Cidade</span>
                <span className="text-[11px] text-gray-600 block mt-1 font-mono">
                  {formatarDataHora(viagem.chegadaOrigemEm || viagem.concluidaEm)}
                </span>
              </div>
            </div>
          </div>

          {/* Telemetria GPS */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              2. Rastreamento e Telemetria GPS
            </h3>

            <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-800">Coordenadas de Rota Auditadas:</span>
                <span className="text-gray-600 ml-2 font-mono">
                  Início: {viagem.gpsInicioLat ? `${viagem.gpsInicioLat.toFixed(5)}, ${viagem.gpsInicioLng?.toFixed(5)}` : 'Registrado'} | 
                  Fim: {viagem.gpsFimLat ? `${viagem.gpsFimLat.toFixed(5)}, ${viagem.gpsFimLng?.toFixed(5)}` : 'Registrado'}
                </span>
              </div>
              <span className="font-bold text-amber-800 font-mono">
                {resumo.totalPontosGps} pontos de GPS salvos
              </span>
            </div>
          </div>

          {/* Lista de Passageiros / Pacientes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-amber-700" />
                3. Lista de Pacientes & Passageiros Transportados
              </h3>
              <span className="text-xs font-semibold text-gray-600">
                Total: {resumo.totalPassageiros} | Embarcados: {resumo.embarcados} | Ausentes: {resumo.ausentes}
              </span>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-100/60 text-amber-950 font-bold border-b border-amber-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Nome do Paciente</th>
                    <th className="py-2.5 px-3">Cartão SUS / CPF</th>
                    <th className="py-2.5 px-3">Acompanhante</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {viagem.passageiros.map((p, idx) => {
                    const isEmbarcou = p.status === 'EMBARCOU' || p.status === 'DESEMBARCOU';
                    return (
                      <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="py-2.5 px-3 text-gray-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">
                          {p.nomePaciente}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">
                          {p.cartaoSus || p.paciente?.cartaoSus || p.paciente?.cpf || '---'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {p.acompanhante || 'Sem acompanhante'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isEmbarcou
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'NAO_COMPARECEU'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isEmbarcou ? 'EMBARCOU' : p.status === 'NAO_COMPARECEU' ? 'AUSENTE' : 'PENDENTE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assinatura Digital de Conclusão */}
          <div className="border-t-2 border-gray-200 pt-5">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              4. Fechamento da Viagem & Assinatura Digital
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div>
                <span className="text-xs text-gray-500 font-medium block">Motorista Responsável</span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">
                  {viagem.motorista?.nome || 'Motorista'}
                </span>

                {viagem.observacoes && (
                  <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded-lg border border-gray-200">
                    <span className="font-semibold">Observações: </span>{viagem.observacoes}
                  </p>
                )}

                <div className="mt-2 text-[11px] text-gray-500">
                  <p>&bull; Viagem de 4 etapas concluída e registrada no SUS.</p>
                  <p>&bull; Data de Fechamento: {formatarDataHora(viagem.chegadaOrigemEm || viagem.concluidaEm)}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-300">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Assinatura Digital de Conclusão
                </span>

                {viagem.assinaturaBase64 ? (
                  <div className="w-full max-w-[240px] h-[80px] bg-white flex items-center justify-center border-b border-gray-800">
                    <img
                      src={viagem.assinaturaBase64}
                      alt="Assinatura Digital"
                      className="max-h-[75px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-[75px] flex items-center justify-center text-xs text-gray-400 italic">
                    Assinatura não coletada
                  </div>
                )}

                <span className="text-[10px] text-gray-400 font-mono mt-1">Autenticação Digital Vigia-Saúde</span>
              </div>
            </div>
          </div>

          {/* Rodapé de Autenticidade */}
          <div className="mt-5 pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400">
            <span>Documento emitido eletronicamente pelo Vigia-Saúde em {new Date().toLocaleString('pt-BR')}</span>
            <span className="font-mono">Hash: {viagem.id.replace(/-/g, '').substring(0, 24).toUpperCase()}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
export default RelatorioViagemModal;
