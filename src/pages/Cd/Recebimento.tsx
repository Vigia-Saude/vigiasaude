import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Truck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  FileCheck, 
  ExternalLink,
  Plus,
  Minus
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import type { Fornecedor } from '../../types';

interface NotaFiscalItem {
  id: string;
  catmatCodigo: string | null;
  medicamentoNome: string;
  numeroLote: string;
  dataValidade: string;
  quantidadeEsperada: number;
  quantidadeRecebida: number | null;
  observacaoDivergencia?: string | null;
}

interface NotaFiscal {
  id: string;
  numeroNf: string;
  serie: string;
  chaveAcesso: string | null;
  dataEmissao: string;
  fornecedorId: string;
  pedidoCompraId: string | null;
  valorTotal: string;
  status: string;
  fornecedor: {
    razaoSocial: string;
    cnpj: string;
  };
  itens: NotaFiscalItem[];
}

export function Recebimento() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Pending NFs list and selection
  const [pendingNfs, setPendingNfs] = useState<any[]>([]);
  const [selectedNfId, setSelectedNfId] = useState('');
  const [notaFiscal, setNotaFiscal] = useState<NotaFiscal | null>(null);
  
  // Quantities for Step 2
  const [conferidos, setConferidos] = useState<{ [itemId: string]: number }>({});
  const [observacoes, setObservacoes] = useState<{ [itemId: string]: string }>({});
  
  // Observações fiscais for Step 3
  const [observacoesFiscais, setObservacoesFiscais] = useState('');

  // Fetch pending NFs on load
  useEffect(() => {
    async function loadPendingNfs() {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/cd/notas-fiscais?status=PENDENTE');
        // If the query returns a paginated object, handle it
        const data = response.data?.dados || response.data || [];
        setPendingNfs(data);
      } catch (err) {
        console.error('Erro ao buscar notas fiscais pendentes:', err);
        setErrorMsg('Não foi possível carregar a lista de Notas Fiscais pendentes.');
      } finally {
        setLoading(false);
      }
    }
    void loadPendingNfs();
  }, []);

  // Fetch selected NF details
  useEffect(() => {
    if (!selectedNfId) {
      setNotaFiscal(null);
      return;
    }

    async function loadNfDetails() {
      try {
        setLoading(true);
        setErrorMsg(null);
        const response = await apiClient.get(`/api/cd/notas-fiscais/${selectedNfId}`);
        const nfData: NotaFiscal = response.data;
        setNotaFiscal(nfData);
        
        // Initialize counts to expected quantity
        const initialConferidos: { [itemId: string]: number } = {};
        const initialObservacoes: { [itemId: string]: string } = {};
        nfData.itens.forEach(item => {
          initialConferidos[item.id] = item.quantidadeRecebida ?? item.quantidadeEsperada;
          initialObservacoes[item.id] = item.observacaoDivergencia ?? '';
        });
        setConferidos(initialConferidos);
        setObservacoes(initialObservacoes);
      } catch (err) {
        console.error('Erro ao buscar detalhes da NF:', err);
        setErrorMsg('Erro ao carregar detalhes da Nota Fiscal.');
      } finally {
        setLoading(false);
      }
    }
    void loadNfDetails();
  }, [selectedNfId]);

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!notaFiscal) {
        setErrorMsg('Por favor, selecione uma Nota Fiscal para iniciar a conferência.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = (itemId: string, max: number) => {
    setConferidos(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleDecrement = (itemId: string) => {
    setConferidos(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
    }));
  };

  const handleQtdInputChange = (itemId: string, val: string) => {
    const parsed = parseInt(val, 10);
    setConferidos(prev => ({
      ...prev,
      [itemId]: isNaN(parsed) ? 0 : parsed
    }));
  };

  const totalEsperado = notaFiscal?.itens.reduce((acc, item) => acc + item.quantidadeEsperada, 0) || 0;
  const totalConferido = notaFiscal?.itens.reduce((acc, item) => acc + (conferidos[item.id] || 0), 0) || 0;

  const handleFinalSubmit = async () => {
    if (!notaFiscal) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const itemsPayload = Object.keys(conferidos).map(itemId => {
        const item = notaFiscal.itens.find(i => i.id === itemId);
        const diff = (conferidos[itemId] ?? 0) !== (item?.quantidadeEsperada ?? 0);
        return {
          itemId,
          quantidadeRecebida: Number(conferidos[itemId]),
          quantidade_recebida: Number(conferidos[itemId]), // Send both camelCase and snake_case for maximum compatibility
          observacaoDivergencia: diff ? (observacoes[itemId] || 'Divergência de quantidade') : null
        };
      });

      await apiClient.post(`/api/cd/notas-fiscais/${notaFiscal.id}/conferir`, {
        itens: itemsPayload,
        descricaoCD: observacoesFiscais || 'Conferência física concluída no CD'
      });

      setStep(4);
    } catch (err: any) {
      console.error('Erro ao salvar conferência:', err);
      setErrorMsg(err.response?.data?.erro || 'Erro ao salvar a conferência da Nota Fiscal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Top Header Controls */}
      <div className="flex justify-between items-center text-sm font-medium">
        <button 
          onClick={() => navigate('/cd/dashboard')} 
          className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 border-0 bg-transparent cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao Início
        </button>
        <button 
          onClick={() => navigate('/cd/portal-publico')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all border-0 cursor-pointer"
        >
          Ver Portal Público
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Recebimento de Mercadoria</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Processo de 3 etapas para recebimento seguro e rastreável de medicamentos</p>
      </div>

      {/* Stepper (Steps 1, 2, 3) */}
      {step <= 3 && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center w-full justify-around relative">
            <div className="absolute left-[15%] right-[15%] top-1/2 h-0.5 bg-gray-150 -translate-y-1/2 z-0" />
            <div className="absolute left-[15%] right-[15%] top-1/2 h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-300" 
                 style={{ width: `${(step - 1) * 35}%` }} />
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step === 1 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : step > 1 
                  ? 'bg-green-600 border-green-600 text-white shadow-sm' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <div className="text-center">
                <p className={`text-xs font-bold ${step === 1 ? 'text-blue-650' : 'text-gray-700'}`}>Pré-Recebimento</p>
                <p className="text-[10px] text-gray-400 font-medium hidden md:block">Identificar e registrar a Nota Fiscal</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step === 2 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : step > 2 
                  ? 'bg-green-600 border-green-600 text-white shadow-sm' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
              </div>
              <div className="text-center">
                <p className={`text-xs font-bold ${step === 2 ? 'text-blue-650' : 'text-gray-700'}`}>Conferência Física</p>
                <p className="text-[10px] text-gray-400 font-medium hidden md:block">Verificar quantidades e identificar divergências</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step === 3 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                3
              </div>
              <div className="text-center">
                <p className={`text-xs font-bold ${step === 3 ? 'text-blue-650' : 'text-gray-700'}`}>Conferência Fiscal</p>
                <p className="text-[10px] text-gray-400 font-medium hidden md:block">Validar dados fiscais e confirmar entrada</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errorMsg && (
        <div className="p-4 bg-red-55 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 select-none">
          <AlertCircle className="h-5 w-5 text-red-650 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold text-red-800">{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: PRE-RECEBIMENTO (IDENTIFICACAO) */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-150 pb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Etapa 1 — Identificação da Nota Fiscal
            </h2>
            <p className="text-xs text-gray-500 font-medium">Informe os dados da NF antes de iniciar a conferência física dos itens</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Número da Nota Fiscal *</label>
              <select
                value={selectedNfId}
                onChange={(e) => setSelectedNfId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none font-semibold"
              >
                <option value="">Selecione ou busque a Nota Fiscal...</option>
                {pendingNfs.map(nf => (
                  <option key={nf.id} value={nf.id}>NF {nf.numeroNf} - {nf.fornecedor?.razaoSocial || 'Fornecedor avulso'}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Fornecedor *</label>
              <input
                type="text"
                readOnly
                disabled
                value={notaFiscal?.fornecedor.razaoSocial || ''}
                placeholder="Ex: Farmacorp Ltda"
                className="w-full bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-xl block p-3 outline-none font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          {/* Table of Expected Items */}
          {notaFiscal && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Itens esperados nesta entrega</h3>
              
              <div className="space-y-2.5">
                {notaFiscal.itens.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.medicamentoNome}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">CATMAT: {item.catmatCodigo || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-gray-900 text-sm">{item.quantidadeEsperada} un</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">Val: {new Date(item.dataValidade).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-100/50 border border-gray-150 rounded-xl font-bold text-xs select-none">
                <span className="text-gray-500">Total esperado</span>
                <span className="text-gray-900 text-sm">{totalEsperado} unidades</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!notaFiscal}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              Iniciar Conferência Física
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CONFERENCIA FISICA (VALIDACAO) */}
      {step === 2 && notaFiscal && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-150 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gray-900">
                NF <span className="text-blue-600 font-extrabold">{notaFiscal.numeroNf}</span> — {notaFiscal.fornecedor.razaoSocial}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Ajuste as quantidades recebidas. Divergências serão registradas automaticamente.</p>
            </div>
            <div className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
              {totalConferido} / {totalEsperado} un verificadas
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150 border border-gray-100 rounded-xl overflow-hidden">
              <thead className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3.5">Medicamento</th>
                  <th className="px-4 py-3.5">Lote / Validade</th>
                  <th className="px-4 py-3.5 text-center w-28">Esperado</th>
                  <th className="px-4 py-3.5 text-center w-40">Qtd. Recebida</th>
                  <th className="px-4 py-3.5 text-center w-28">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
                {notaFiscal.itens.map((item) => {
                  const currentQty = conferidos[item.id] ?? 0;
                  const isMatch = currentQty === item.quantidadeEsperada;
                  
                  return (
                    <tr key={item.id} className={`transition-colors ${!isMatch ? 'bg-orange-50/20' : 'hover:bg-gray-55/20'}`}>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{item.medicamentoNome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">{item.numeroLote}</span>
                          <span className="text-[10px] text-gray-400 font-medium mt-0.5">Val: {new Date(item.dataValidade).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-sm text-gray-800 bg-gray-50/40">
                        {item.quantidadeEsperada}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDecrement(item.id)}
                            className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center border-0 cursor-pointer transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          
                          <input
                            type="text"
                            value={currentQty}
                            onChange={(e) => handleQtdInputChange(item.id, e.target.value)}
                            className={`w-16 h-8 text-center text-sm font-extrabold rounded-lg border outline-none ${
                              !isMatch 
                                ? 'border-orange-400 bg-orange-50/50 text-orange-850 focus:ring-2 focus:ring-orange-100' 
                                : 'border-gray-200 focus:border-blue-500'
                            }`}
                          />
                          
                          <button
                            type="button"
                            onClick={() => handleIncrement(item.id, item.quantidadeEsperada)}
                            className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center border-0 cursor-pointer transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isMatch ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 select-none">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-150 select-none animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            Divergente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Divergences justifications fields if any */}
          {notaFiscal.itens.some(i => (conferidos[i.id] ?? 0) !== i.quantidadeEsperada) && (
            <div className="space-y-4 bg-orange-50/20 p-5 rounded-2xl border border-orange-200/50">
              <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5" />
                Justificativas de Divergência
              </h4>
              
              <div className="space-y-3">
                {notaFiscal.itens.filter(item => (conferidos[item.id] ?? 0) !== item.quantidadeEsperada).map(item => {
                  if ((conferidos[item.id] ?? 0) === item.quantidadeEsperada) return null;
                  return (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <span className="text-xs font-bold text-gray-800">{item.medicamentoNome}</span>
                      <input
                        type="text"
                        placeholder="Informe o motivo da divergência..."
                        value={observacoes[item.id] || ''}
                        onChange={(e) => setObservacoes(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="bg-white border border-orange-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-orange-100 outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-gray-150 pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer shadow-md transition-all"
            >
              Concluir Conferência e Avançar para Verificação Fiscal
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONFERENCIA FISCAL (FINALIZACAO) */}
      {step === 3 && notaFiscal && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-150 pb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Etapa 3 — Conferência Fiscal
            </h2>
            <p className="text-xs text-gray-500 font-medium">Revise o resumo da entrada e confirme no sistema</p>
          </div>

          {/* NF Summary Card */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Dados da Nota Fiscal</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Número da NF</span>
                <span className="text-gray-900 font-extrabold text-sm">{notaFiscal.numeroNf}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Fornecedor</span>
                <span className="text-gray-900 font-bold text-sm">{notaFiscal.fornecedor.razaoSocial}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Total de itens</span>
                <span className="text-gray-900 font-bold text-sm">{notaFiscal.itens.length} medicamentos</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Total de unidades</span>
                <span className="text-gray-900 font-extrabold text-sm">{totalConferido} unidades</span>
              </div>
            </div>
          </div>

          {/* Confirmed list */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Itens Confirmados</h3>
            
            <div className="space-y-2.5">
              {notaFiscal.itens.map((item) => {
                const currentQty = conferidos[item.id] ?? 0;
                const isMatch = currentQty === item.quantidadeEsperada;

                return (
                  <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center text-xs ${
                    !isMatch ? 'bg-orange-50/45 border-orange-200' : 'bg-white border-gray-150'
                  }`}>
                    <div>
                      <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                        {item.medicamentoNome}
                        {isMatch && <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />}
                      </p>
                      <p className="text-[10px] text-gray-450 mt-1">Lote: {item.numeroLote} • Validade: {new Date(item.dataValidade).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-gray-900 text-sm">{currentQty} un</span>
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* General observations textarea */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Observações Fiscais (opcional)</label>
            <textarea
              placeholder="Alguma observação sobre a nota fiscal ou condições de entrega..."
              value={observacoesFiscais}
              onChange={(e) => setObservacoesFiscais(e.target.value)}
              rows={4}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex justify-between items-center border-t border-gray-150 pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar à Contagem Física
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer shadow-md transition-all border-0"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  Confirmar Entrada no Estoque
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS SUCCESS SUCCESS */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-gray-200 shadow-md text-center space-y-6 animate-scale-up">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-10 w-10 stroke-[1.5]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-gray-900">Recebimento Concluído!</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">
              O estoque foi atualizado e a conferência física e fiscal da Nota Fiscal foi gravada com sucesso.
            </p>
          </div>

          <div className="flex gap-4 max-w-sm mx-auto pt-2">
            <button
              onClick={() => {
                setStep(1);
                setSelectedNfId('');
                setNotaFiscal(null);
                setObservacoesFiscais('');
              }}
              className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
            >
              Fazer Outro Recebimento
            </button>
            <button
              onClick={() => navigate('/cd/dashboard')}
              className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer border-0"
            >
              Ir para o Painel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
