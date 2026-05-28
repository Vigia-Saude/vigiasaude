import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  ShoppingCart, 
  AlertCircle, 
  FileCheck, 
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { getFornecedores } from '../../services/fornecedorService';
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
  dataEmissao: string;
  valorTotal: number;
  itens: ParsedNfeItem[];
}

export function ImportarNota() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [xmlContent, setXmlContent] = useState<string>('');
  
  // React State mapping as strictly requested by user
  const [numeroNF, setNumeroNF] = useState('');
  const [serie, setSerie] = useState('');
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [fornecedorCnpj, setFornecedorCnpj] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');
  const [valorTotal, setValorTotal] = useState(0);
  const [itens, setItens] = useState<ParsedNfeItem[]>([]);
  
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [matchedFornecedor, setMatchedFornecedor] = useState<Fornecedor | null>(null);
  const [selectedFornecedorId, setSelectedFornecedorId] = useState('');
  
  const [pedidosCompra, setPedidosCompra] = useState<PedidoCompra[]>([]);
  const [selectedPedidoId, setSelectedPedidoId] = useState('');
  
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [successNf, setSuccessNf] = useState<any>(null);

  // Load suppliers
  useEffect(() => {
    async function loadFornecedores() {
      try {
        const list = await getFornecedores();
        setFornecedores(list);
      } catch (err) {
        console.error('Erro ao buscar fornecedores:', err);
      }
    }
    void loadFornecedores();
  }, []);

  // Match supplier by CNPJ when XML is parsed
  useEffect(() => {
    if (fornecedorCnpj && fornecedores.length > 0) {
      const cleanCnpj = fornecedorCnpj.replace(/\D/g, '');
      const found = fornecedores.find(f => f.cnpj.replace(/\D/g, '') === cleanCnpj);
      if (found) {
        setMatchedFornecedor(found);
        setSelectedFornecedorId(found.id);
      } else {
        setMatchedFornecedor(null);
        setSelectedFornecedorId('');
      }
    }
  }, [fornecedorCnpj, fornecedores]);

  // Load orders for selected supplier
  useEffect(() => {
    async function loadPedidos() {
      if (!selectedFornecedorId) {
        setPedidosCompra([]);
        return;
      }
      try {
        const response = await apiClient.get<{ data: PedidoCompra[] } | PedidoCompra[]>('/api/pedidos');
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        // Filter orders of this supplier that are APROVADO or EM_TRANSITO or PENDENTE
        const supplierPedidos = list.filter(
          p => p.fornecedorId === selectedFornecedorId && p.status !== 'ENTREGUE' && p.status !== 'CANCELADO'
        );
        setPedidosCompra(supplierPedidos);
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
      }
    }
    void loadPedidos();
  }, [selectedFornecedorId]);

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
        setXmlContent(text);

        // Call backend XML parser endpoint
        const response = await apiClient.post<NfeData & { fornecedorId?: string }>('/api/cd/notas-fiscais/xml', { xml: text });
        const data = response.data;

        // Map values into state
        setNumeroNF(data.numeroNF);
        setSerie(data.serie || '1');
        setChaveAcesso(data.chaveAcesso);
        setFornecedorCnpj(data.fornecedorCnpj);
        setDataEmissao(data.dataEmissao);
        setValorTotal(data.valorTotal);
        
        // Ensure every item has a default quantidade_recebida matching expected
        const itemsWithReceived = data.itens.map(item => ({
          ...item,
          quantidade_recebida: item.quantidade_esperada,
          observacao_divergencia: ''
        }));
        setItens(itemsWithReceived);

        // Auto-selecionar o fornecedor resolvido e recarregar lista
        if (data.fornecedorId) {
          setSelectedFornecedorId(data.fornecedorId);
          try {
            const list = await getFornecedores();
            setFornecedores(list);
          } catch (err) {
            console.error('Erro ao atualizar fornecedores:', err);
          }
        }

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

  const handleQtdChange = (index: number, val: number) => {
    const updated = [...itens];
    updated[index].quantidade_recebida = val >= 0 ? val : 0;
    setItens(updated);
  };

  const handleObsChange = (index: number, val: string) => {
    const updated = [...itens];
    updated[index].observacao_divergencia = val;
    setItens(updated);
  };

  const hasDivergences = () => {
    return itens.some(item => item.quantidade_recebida !== item.quantidade_esperada);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!numeroNF) {
        setErrorMsg('Por favor, faça o upload do XML da nota fiscal.');
        return;
      }
      if (!selectedFornecedorId) {
        setErrorMsg('Fornecedor não identificado. Selecione o fornecedor manualmente abaixo para continuar.');
        return;
      }
      setErrorMsg(null);
      setStep(2);
    } else if (step === 2) {
      // Validate that all items with divergence have observation
      const missingObs = itens.some(
        item => item.quantidade_recebida !== item.quantidade_esperada && !item.observacao_divergencia?.trim()
      );
      if (missingObs) {
        setErrorMsg('Por favor, informe a justificativa/observação de divergência para todos os itens destacados.');
        return;
      }
      setErrorMsg(null);
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Step 3.1: Save NF Draft
      const payloadNf = {
        numeroNf: numeroNF,
        serie,
        chaveAcesso,
        dataEmissao,
        fornecedorId: selectedFornecedorId,
        pedidoCompraId: selectedPedidoId || null,
        valorTotal,
        xmlUrl: null,
        observacoes: observacoesGerais || null,
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

      // Step 3.2: Submit Physical conference
      // Map frontend item array index or keys to created database item IDs
      const conferenceItens = createdNf.itens.map((dbItem: any) => {
        // Find matching item in frontend state
        const matchingFeItem = itens.find(
          fe => fe.medicamentoCatmatId === dbItem.catmatCodigo && fe.lote === dbItem.numeroLote
        );
        return {
          itemId: dbItem.id,
          quantidadeRecebida: matchingFeItem ? Number(matchingFeItem.quantidade_recebida) : dbItem.quantidadeEsperada,
          observacaoDivergencia: matchingFeItem?.observacao_divergencia || null
        };
      });

      const resConf = await apiClient.post(`/api/cd/notas-fiscais/${createdNf.id}/conferir`, {
        itens: conferenceItens
      });

      setSuccessNf(resConf.data);
      setSuccessMsg('Nota Fiscal e conferência física registradas com sucesso.');
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.erro || 'Erro ao registrar Nota Fiscal no servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setXmlFile(null);
    setXmlContent('');
    setNumeroNF('');
    setSerie('');
    setChaveAcesso('');
    setFornecedorCnpj('');
    setDataEmissao('');
    setValorTotal(0);
    setItens([]);
    setMatchedFornecedor(null);
    setSelectedFornecedorId('');
    setSelectedPedidoId('');
    setObservacoesGerais('');
    setSuccessMsg(null);
    setSuccessNf(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <header className="border-b border-gray-150 pb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <FileCheck className="h-7 w-7 text-blue-600" />
          Recebimento de Mercadorias (Conferência de Notas Fiscais)
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 font-medium">
          Importe arquivos XML de Notas Fiscais e realize a conferência física e fiscal para registro no estoque do Centro de Distribuição
        </p>
      </header>

      {/* Stepper progress indicator */}
      {step <= 3 && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center w-full justify-around relative">
            <div className="absolute left-[15%] right-[15%] top-1/2 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            <div className="absolute left-[15%] right-[15%] top-1/2 h-0.5 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-300" 
                 style={{ width: `${(step - 1) * 35}%` }} />
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step === 1 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : step > 1 
                  ? 'bg-blue-50 border-blue-500 text-blue-600' 
                  : 'bg-white border-gray-250 text-gray-400'
              }`}>
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <span className={`text-xs font-bold ${step === 1 ? 'text-blue-600' : 'text-gray-500'}`}>Identificação</span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step === 2 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : step > 2 
                  ? 'bg-blue-50 border-blue-500 text-blue-600' 
                  : 'bg-white border-gray-250 text-gray-400'
              }`}>
                {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
              </div>
              <span className={`text-xs font-bold ${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}>Contagem Física</span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step === 3 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-white border-gray-250 text-gray-400'
              }`}>
                3
              </div>
              <span className={`text-xs font-bold ${step === 3 ? 'text-blue-600' : 'text-gray-500'}`}>Validação Fiscal</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-semibold text-red-700 whitespace-pre-line">{errorMsg}</div>
        </div>
      )}

      {/* Step Contents */}

      {/* STEP 1: Identification & Upload */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900">Upload do XML da Nota Fiscal</h2>
              <p className="text-xs text-gray-500">Faça o upload do arquivo XML obtido no portal nacional da SEFAZ para preenchimento dos dados.</p>
              
              {!xmlFile ? (
                <label className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-blue-50/10 transition-all cursor-pointer relative group">
                  <input type="file" accept=".xml" onChange={handleFileUpload} className="hidden" />
                  {loading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-xs text-gray-500 font-semibold mt-2">Processando XML da SEFAZ...</span>
                    </div>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">Selecione o arquivo XML da nota</p>
                        <p className="text-xs text-gray-400 mt-1">Formatos suportados: .xml (Tamanho máx. 5MB)</p>
                      </div>
                    </>
                  )}
                </label>
              ) : (
                <div className="border border-blue-100 bg-blue-50/20 p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500 text-white flex items-center justify-center rounded-xl font-bold text-xs shadow-sm">
                      XML
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{xmlFile.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{(xmlFile.size / 1024).toFixed(1)} KB • Pronto para importação</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent"
                    title="Excluir arquivo"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </div>

            {/* General Info (If XML Loaded) */}
            {numeroNF && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 animate-fade-in">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  Dados Gerais Extraídos da NF-e
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Número da NF-e</span>
                    <p className="text-sm font-bold text-gray-800">{numeroNF}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Série</span>
                    <p className="text-sm font-bold text-gray-800">{serie || '1'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data de Emissão</span>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {new Date(dataEmissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="col-span-2 md:col-span-3 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chave de Acesso (44 Dígitos)</span>
                    <code className="block p-2 bg-gray-50 text-[11px] font-mono text-gray-600 rounded-lg select-all border border-gray-100 break-all">
                      {chaveAcesso}
                    </code>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CNPJ do Emitente</span>
                    <p className="text-sm font-semibold text-gray-700">
                      {fornecedorCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                    </p>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valor Total da Nota</span>
                    <p className="text-base font-extrabold text-blue-600">
                      {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Supplier Matching & Purchase Order */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Associações no Sistema</h3>

              {/* Supplier Info */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-gray-400">Fornecedor Associado</label>
                {matchedFornecedor ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700 uppercase">Identificado no Sistema</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{matchedFornecedor.nomeFantasia}</span>
                    <span className="text-[11px] text-gray-500 font-medium">{matchedFornecedor.razaoSocial}</span>
                  </div>
                ) : fornecedorCnpj ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                      <div className="text-xs font-bold text-red-700">CNPJ não encontrado no sistema</div>
                    </div>
                    
                    <select
                      value={selectedFornecedorId}
                      onChange={(e) => setSelectedFornecedorId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                    >
                      <option value="">Selecione o Fornecedor Manualmente...</option>
                      {fornecedores.map(f => (
                        <option key={f.id} value={f.id}>{f.nomeFantasia} ({f.cnpj})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs text-gray-450 italic font-medium">Faça o upload do XML para mapear o fornecedor.</p>
                )}
              </div>

              {/* Purchase Order Association */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Pedido de Compra (Opcional)</label>
                  {selectedFornecedorId && (
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                      {pedidosCompra.length} pendentes
                    </span>
                  )}
                </div>
                {selectedFornecedorId ? (
                  <select
                    value={selectedPedidoId}
                    onChange={(e) => setSelectedPedidoId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                  >
                    <option value="">Nenhum pedido associado (Compra emergencial)</option>
                    {pedidosCompra.map(p => (
                      <option key={p.id} value={p.id}>Pedido {p.numero} - {p.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-gray-450 italic font-medium">Selecione ou identifique o fornecedor primeiro.</p>
                )}
              </div>
            </div>

            {/* Next buttons */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!numeroNF || !selectedFornecedorId}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Prosseguir para Contagem Física
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Physical Count & Divergences */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Etapa 2: Contagem Física dos Medicamentos</h2>
              <p className="text-xs text-gray-500">Confirme a quantidade real recebida de cada item na entrega. O sistema irá sinalizar divergências.</p>
            </div>
            
            <div className="flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
              <Layers className="h-4 w-4" />
              <span>{itens.length} itens a conferir</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150 border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Medicamento / CATMAT</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Lote</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Validade</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 uppercase">Qtd Esperada</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 uppercase w-32">Qtd Recebida</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Observação de Divergência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {itens.map((item, index) => {
                  const hasDiff = item.quantidade_recebida !== item.quantidade_esperada;
                  return (
                    <tr key={index} className={`transition-colors ${hasDiff ? 'bg-orange-50/30' : 'hover:bg-gray-50/40'}`}>
                      {/* Name / CATMAT */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{item.medicamentoNome}</span>
                          <span className="text-[10px] font-mono text-gray-400 mt-0.5">CATMAT: {item.medicamentoCatmatId}</span>
                        </div>
                      </td>
                      
                      {/* Lote */}
                      <td className="px-4 py-4 text-xs font-semibold text-gray-600">{item.lote}</td>
                      
                      {/* Validade */}
                      <td className="px-4 py-4 text-xs font-medium text-gray-500">
                        {new Date(item.validade).toLocaleDateString('pt-BR')}
                      </td>
                      
                      {/* Expected */}
                      <td className="px-4 py-4 text-center text-sm font-bold text-gray-700 bg-gray-50/50">
                        {item.quantidade_esperada.toLocaleString('pt-BR')}
                      </td>
                      
                      {/* Received input */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.quantidade_recebida}
                          onChange={(e) => handleQtdChange(index, Number(e.target.value))}
                          className={`w-24 px-3 py-1.5 text-center text-sm font-extrabold rounded-lg border focus:ring-2 outline-none transition-all ${
                            hasDiff 
                              ? 'border-orange-400 bg-orange-50 text-orange-800 focus:ring-orange-200' 
                              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                          }`}
                        />
                      </td>

                      {/* Divergence observation */}
                      <td className="px-4 py-4">
                        {hasDiff ? (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                            <input
                              type="text"
                              placeholder="Justifique a divergência..."
                              value={item.observacao_divergencia || ''}
                              onChange={(e) => handleObsChange(index, e.target.value)}
                              className="flex-1 bg-white border border-orange-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-800 placeholder-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                              required
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sem divergências</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer shadow-md transition-all"
            >
              Prosseguir para Validação
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Fiscal Validation & Confirmation */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Fiscal review details */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-gray-900">Resumo da Nota Fiscal</h2>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Nota Fiscal / Série</span>
                  <span className="text-gray-850 font-bold text-sm">Nº {numeroNF} - Série {serie}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Data Emissão</span>
                  <span className="text-gray-850 font-semibold">{new Date(dataEmissao).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">Emitente</span>
                  <span className="text-gray-850 font-bold">{matchedFornecedor?.razaoSocial || 'Fornecedor avulso'}</span>
                </div>
              </div>

              {/* Highlight discrepancies */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Itens da Conferência</h3>
                
                <div className="space-y-2.5">
                  {itens.map((item, idx) => {
                    const hasDiff = item.quantidade_recebida !== item.quantidade_esperada;
                    return (
                      <div key={idx} className={`p-3 rounded-xl border text-xs flex justify-between items-start transition-all ${
                        hasDiff ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-gray-150'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {hasDiff && <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />}
                            <span className="font-bold text-gray-800">{item.medicamentoNome}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">Lote: {item.lote} • Validade: {new Date(item.validade).toLocaleDateString('pt-BR')}</p>
                          {hasDiff && (
                            <p className="text-[11px] text-orange-700 bg-orange-100/50 px-2 py-0.5 rounded-md mt-1 italic font-medium">
                              "Obs: {item.observacao_divergencia}"
                            </p>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 font-semibold">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Quantidade</span>
                          {hasDiff ? (
                            <div className="flex items-center gap-1.5">
                              <span className="line-through text-gray-400 font-medium">{item.quantidade_esperada}</span>
                              <span className="text-orange-600 font-bold text-sm bg-orange-50 px-1.5 py-0.5 rounded">{item.quantidade_recebida}</span>
                            </div>
                          ) : (
                            <span className="text-gray-700 font-bold text-sm">{item.quantidade_esperada}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action validation panel */}
          <div className="space-y-6">
            {/* General observations */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Validação & Observações Finais</h3>
              
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Observações Gerais de Recebimento</span>
                <textarea
                  placeholder="Informações adicionais do recebimento físico, estado das caixas, lacres, temperatura, etc."
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {hasDivergences() ? (
                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl space-y-2">
                  <div className="flex items-center gap-2 text-orange-800 font-bold text-xs uppercase">
                    <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                    <span>Atenção: Divergência Detectada</span>
                  </div>
                  <p className="text-[11px] text-orange-700 leading-normal font-semibold">
                    Há divergências entre a quantidade da nota e a contagem física. Ao confirmar, o sistema gerará um Alerta de Divergência para os perfis competentes e a nota ficará retida como CONFERIDO COM DIVERGÊNCIA.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>Conferência 100% Correta</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-normal font-semibold">
                    Nenhuma divergência de quantidade foi detectada. A nota será marcada como CONFERIDA e a entrada no estoque do CD ocorrerá automaticamente para cada lote.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full inline-flex items-center justify-center gap-2 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer ${
                  loading 
                    ? 'bg-blue-400 pointer-events-none' 
                    : hasDivergences()
                    ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                }`}
              >
                {loading ? (
                  <>
                    <div className="h-4.5 w-4.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4.5 w-4.5" />
                    Finalizar Conferência e Gravar
                  </>
                )}
              </button>
            </div>

            {/* Back button */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar à Contagem Física
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Success state */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-md text-center space-y-6 animate-scale-up">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-10 w-10 stroke-[1.5]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-gray-900">Recebimento Registrado!</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">
              A Nota Fiscal Nº {numeroNF} foi registrada e processada no Centro de Distribuição com sucesso.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl text-left text-xs max-w-md mx-auto space-y-2 border border-gray-100">
            <p className="font-bold text-gray-400 uppercase tracking-wide text-[10px]">Resumo do Status</p>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-500">ID do Registro:</span>
              <span className="text-gray-800 font-mono">#{successNf?.id?.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-500">Situação da Nota:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                successNf?.status === 'CONFERIDA' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-orange-50 text-orange-700'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  successNf?.status === 'CONFERIDA' ? 'bg-emerald-500' : 'bg-orange-500'
                }`} />
                {successNf?.status}
              </span>
            </div>
            {successNf?.status === 'CONFERIDA' ? (
              <p className="text-[11px] text-emerald-600 bg-emerald-100/50 p-2.5 rounded-lg font-medium">
                Os lotes dos medicamentos foram inseridos automaticamente como DISPONÍVEIS no estoque do CD.
              </p>
            ) : (
              <p className="text-[11px] text-orange-650 bg-orange-100/50 p-2.5 rounded-lg font-medium">
                Devido à divergência na conferência, a Nota Fiscal foi retida e um Alerta de Divergência foi enviado para o Secretário.
              </p>
            )}
          </div>

          <div className="flex gap-4 max-w-sm mx-auto pt-2">
            <button
              onClick={handleReset}
              className="flex-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-150 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              Novo Recebimento
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer border-0"
            >
              Ir para o Painel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
