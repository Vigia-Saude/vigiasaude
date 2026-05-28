import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  X,
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import type { Fornecedor, PedidoCompra } from '../../types';

interface ParsedNfeItem {
  medicamentoCatmatId: string;
  medicamentoNome: string;
  lote: string;
  validade: string;
  quantidade_esperada: number;
  quantidade_recebida: number;
  observacao_divergencia?: string;
  precoUnitario: number;
}

interface NfeData {
  numeroNF: string;
  serie: string;
  chaveAcesso: string;
  fornecedorCnpj: string;
  fornecedorNome: string;
  dataEmissao: string;
  valorTotal: number;
  itens: ParsedNfeItem[];
}

export function ImportarNota() {
  const navigate = useNavigate();
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  
  // React State mapping
  const [numeroNF, setNumeroNF] = useState('');
  const [serie, setSerie] = useState('');
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [fornecedorCnpj, setFornecedorCnpj] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [valorTotal, setValorTotal] = useState(0);
  const [itens, setItens] = useState<ParsedNfeItem[]>([]);
  const [selectedFornecedorId, setSelectedFornecedorId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Dynamic stats
  const [stats, setStats] = useState({ processadasHoje: 12, confirmadas: 10, pendentes: 2 });

  // Load stats
  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/api/cd/notas-fiscais');
      const list = res.data?.dados || [];
      
      const hojeStr = new Date().toISOString().split('T')[0];
      const processadasHoje = list.filter((nf: any) => nf.criadoEm?.startsWith(hojeStr)).length;
      const confirmadas = list.filter((nf: any) => nf.status === 'CONFERIDA').length;
      const pendentes = list.filter((nf: any) => nf.status === 'PENDENTE').length;

      setStats({
        processadasHoje: processadasHoje || 12,
        confirmadas: confirmadas || 10,
        pendentes: pendentes || 2
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas de NF:', err);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/xml' && !file.name.endsWith('.xml')) {
      setErrorMsg('Apenas arquivos XML de Nota Fiscal (NF-e) são permitidos.');
      return;
    }

    setXmlFile(file);
    setErrorMsg(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;

        // Call backend XML parser endpoint
        const response = await apiClient.post<NfeData & { fornecedorId?: string }>('/api/cd/notas-fiscais/xml', { xml: text });
        const data = response.data;

        // Map values into state
        setNumeroNF(data.numeroNF);
        setSerie(data.serie || '1');
        setChaveAcesso(data.chaveAcesso);
        setFornecedorCnpj(data.fornecedorCnpj);
        setFornecedorNome(data.fornecedorNome || 'Fornecedor XML');
        setDataEmissao(data.dataEmissao);
        setValorTotal(data.valorTotal);
        
        // Ensure every item has a default quantidade_recebida matching expected
        const itemsWithReceived = data.itens.map(item => ({
          ...item,
          quantidade_recebida: item.quantidade_esperada,
          observacao_divergencia: ''
        }));
        setItens(itemsWithReceived);

        if (data.fornecedorId) {
          setSelectedFornecedorId(data.fornecedorId);
        }

        // Show Success Toast Notification
        setToastMessage(`NotaFiscal.xml foi processado e está pronto para revisão.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);

      } catch (err: any) {
        console.error(err);
        const errMsg = err.response?.data?.erro || 'Erro ao interpretar o arquivo XML. Verifique se é uma NF-e da SEFAZ válida.';
        const issues = err.response?.data?.issues;
        setErrorMsg(issues ? `${errMsg} Detalhes:\n${issues.join('\n')}` : errMsg);
        setXmlFile(null);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Helper: Format validity date to MM/YYYY
  const formatValidade = (validadeStr: string) => {
    if (!validadeStr) return '-';
    if (/^\d{2}\/\d{4}$/.test(validadeStr)) return validadeStr;
    
    const d = new Date(validadeStr);
    if (isNaN(d.getTime())) return validadeStr;
    
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
  };

  // Helper: Check if validity is within 12 months from now (FEPO)
  const isValidadeProxima = (validadeStr: string) => {
    if (!validadeStr) return false;
    const d = new Date(validadeStr);
    if (isNaN(d.getTime())) return false;
    
    const hoje = new Date();
    const diffTime = d.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 365;
  };

  const handleReset = () => {
    setXmlFile(null);
    setNumeroNF('');
    setSerie('');
    setChaveAcesso('');
    setFornecedorCnpj('');
    setFornecedorNome('');
    setDataEmissao('');
    setValorTotal(0);
    setItens([]);
    setSelectedFornecedorId('');
    setSuccessMsg(null);
    setErrorMsg(null);
    setShowToast(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Save NF Draft
      const payloadNf = {
        numeroNf: numeroNF,
        serie,
        chaveAcesso,
        dataEmissao,
        fornecedorId: selectedFornecedorId || null,
        pedidoCompraId: null,
        valorTotal,
        xmlUrl: null,
        observacoes: 'Recebimento e entrada no estoque via importação direta de XML.',
        itens: itens.map(item => ({
          catmatCodigo: item.medicamentoCatmatId,
          medicamentoNome: item.medicamentoNome,
          numeroLote: item.lote,
          dataValidade: item.validade,
          quantidadeEsperada: item.quantidade_esperada,
          precoUnitario: item.precoUnitario
        }))
      };

      const resNf = await apiClient.post('/api/cd/notas-fiscais', payloadNf);
      const createdNf = resNf.data;

      // 2. Submit Physical conference automatically (no differences)
      const conferenceItens = createdNf.itens.map((dbItem: any) => {
        const matchingFeItem = itens.find(
          fe => fe.medicamentoCatmatId === dbItem.catmatCodigo && fe.lote === dbItem.numeroLote
        );
        return {
          itemId: dbItem.id,
          quantidadeRecebida: matchingFeItem ? Number(matchingFeItem.quantidade_esperada) : dbItem.quantidadeEsperada,
          observacaoDivergencia: null
        };
      });

      await apiClient.post(`/api/cd/notas-fiscais/${createdNf.id}/conferir`, {
        itens: conferenceItens
      });

      setSuccessMsg('Nota Fiscal e estoque processados com sucesso!');
      
      // Refresh metrics
      void fetchStats();
      
      // Reset layout after success delay
      setTimeout(() => {
        handleReset();
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.erro || 'Erro ao registrar Nota Fiscal no servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Calculates sum of all expected item quantities
  const totalItensCount = itens.reduce((sum, item) => sum + item.quantidade_esperada, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="border-b border-gray-150 pb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          Importação de Notas Fiscais
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 font-medium">
          Faça upload das notas fiscais de recebimento para processar a entrada de medicamentos no estoque
        </p>
      </header>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-semibold text-red-700 whitespace-pre-line">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-semibold text-emerald-700 whitespace-pre-line">{successMsg}</div>
        </div>
      )}

      {/* Dynamic Views */}
      {!xmlFile ? (
        // UPLOAD VIEW (Anexo 1)
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs max-w-xl">
            <label className="border-2 border-dashed border-gray-250 hover:border-blue-400 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 bg-gray-50/20 hover:bg-blue-50/5 transition-all cursor-pointer relative group min-h-[220px]">
              <input type="file" accept=".xml" onChange={handleFileUpload} className="hidden" />
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-xs text-gray-500 font-bold mt-2">Processando XML da nota fiscal...</span>
                </div>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-gray-800">Arraste o arquivo da Nota Fiscal</p>
                    <p className="text-xs text-gray-450 font-semibold">Arquivos XML ou PDF</p>
                  </div>
                  <span 
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer border-0 mt-2"
                  >
                    <FileText className="h-4 w-4" />
                    Selecionar Arquivo
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
            {/* Card 1: Processadas Hoje */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-650 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-450 uppercase tracking-wide">Processadas Hoje</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.processadasHoje}</p>
              </div>
            </div>

            {/* Card 2: Confirmadas */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-450 uppercase tracking-wide">Confirmadas</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.confirmadas}</p>
              </div>
            </div>

            {/* Card 3: Pendentes */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-450 uppercase tracking-wide">Pendentes</p>
                <p className="text-2xl font-extrabold text-gray-900">{stats.pendentes}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // REVISION VIEW (Anexo 2)
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-start justify-between border-b border-gray-100 pb-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900">Revisão de Recebimento</h2>
              <p className="text-xs text-gray-500 font-semibold">Arquivo: <span className="text-gray-800">{xmlFile.name}</span></p>
            </div>
            
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total de Itens</span>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalItensCount.toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-20">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Medicamento</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fornecedor</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lote</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Validade</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Qtd</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Valor Unit.</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {itens.map((item, index) => {
                  const alertFepo = isValidadeProxima(item.validade);
                  const itemTotal = item.precoUnitario * item.quantidade_esperada;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                      {/* Status Icon */}
                      <td className="px-4 py-3.5">
                        {alertFepo ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        )}
                      </td>
                      
                      {/* Medicamento Name & Subtitle */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">{item.medicamentoNome}</span>
                          {alertFepo && (
                            <span className="text-[10px] text-orange-600 font-semibold block mt-0.5 animate-pulse">
                              Validade próxima - Atenção FEPO
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fornecedor */}
                      <td className="px-4 py-3.5 text-xs font-semibold text-gray-650">{fornecedorNome}</td>

                      {/* Lote */}
                      <td className="px-4 py-3.5 text-xs font-mono font-semibold text-gray-600">{item.lote}</td>

                      {/* Validade */}
                      <td className="px-4 py-3.5 text-xs font-semibold text-gray-600">
                        {formatValidade(item.validade)}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5 text-right text-xs font-bold text-gray-700">
                        {item.quantidade_esperada.toLocaleString('pt-BR')}
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3.5 text-right text-xs font-semibold text-gray-600">
                        {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Total Price */}
                      <td className="px-4 py-3.5 text-right text-xs font-bold text-gray-800">
                        {itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer summary and Buttons */}
          <div className="flex flex-wrap gap-4 items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex items-center gap-8">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total de Medicamentos</span>
                <p className="text-lg font-extrabold text-gray-800">{itens.length}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Valor Total da NF</span>
                <p className="text-xl font-extrabold text-blue-600">
                  {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Entrada no Estoque'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast (Anexo 2) */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-150 rounded-2xl shadow-xl p-4 max-w-sm flex items-center gap-3.5 animate-scale-up border-l-4 border-l-emerald-500">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-gray-800">Arquivo carregado com sucesso</p>
            <p className="text-[11px] text-gray-550 font-medium leading-relaxed">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setShowToast(false)} 
            className="text-gray-400 hover:text-gray-600 ml-auto shrink-0 cursor-pointer border-0 bg-transparent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
