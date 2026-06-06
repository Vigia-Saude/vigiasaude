import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  ShieldAlert, 
  Clock, 
  Calendar,
  Layers,
  FileText,
  User,
  Activity,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../services/apiClient';

interface Recall {
  id: string;
  catmatCodigo: string | null;
  numeroLote: string | null;
  medicamentoNome: string | null;
  fonte: string;
  risco: string;
  motivo: string;
  autoridadeEmissora: string | null;
  numeroAnvisa: string | null;
  dataEmissao: string;
  dataExpiracao: string | null;
  ativo: boolean;
  criadoPor: string;
  criadoEm: string;
  lotesAfetados: number;
}

interface StockLot {
  id: string;
  catmatCodigo: string;
  medicamentoNome: string;
  numeroLote: string;
  quantidadeAtual: number;
  status: string;
}

export function Recalls() {
  // State
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [stockLots, setStockLots] = useState<StockLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'todos' | 'ativos' | 'anvisa' | 'alto-critico'>('todos');
  const [expandedRecallId, setExpandedRecallId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedLotId, setSelectedLotId] = useState<string>('manual');
  const [medicamentoNome, setMedicamentoNome] = useState('');
  const [catmatCodigo, setCatmatCodigo] = useState('');
  const [numeroLote, setNumeroLote] = useState('');
  const [fonte, setFonte] = useState('ANVISA');
  const [risco, setRisco] = useState('MEDIO');
  const [motivo, setMotivo] = useState('');
  const [autoridadeEmissora, setAutoridadeEmissora] = useState('');
  const [numeroAnvisa, setNumeroAnvisa] = useState('');
  const [dataExpiracao, setDataExpiracao] = useState('');

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchRecallsAndStock = async () => {
    try {
      setLoading(true);
      const [recallsRes, stockRes] = await Promise.all([
        apiClient.get<Recall[]>('/api/cd/recalls'),
        apiClient.get<{ dados: StockLot[] }>('/api/cd/estoque?limit=100')
      ]);
      setRecalls(recallsRes.data);
      setStockLots(stockRes.data.dados || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados de recalls e estoque.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecallsAndStock();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleCloseRecall = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza de que deseja encerrar este recall? Os lotes afetados serão liberados caso não haja outros recalls ativos.')) {
      return;
    }

    try {
      await apiClient.patch(`/api/cd/recalls/${id}/encerrar`);
      showToast('Recall encerrado com sucesso. Lotes associados foram liberados.', 'success');
      fetchRecallsAndStock();
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao encerrar recall.', 'error');
    }
  };

  const handleLotSelectChange = (lotId: string) => {
    setSelectedLotId(lotId);
    if (lotId === 'manual') {
      setMedicamentoNome('');
      setCatmatCodigo('');
      setNumeroLote('');
    } else {
      const selected = stockLots.find(l => l.id === lotId);
      if (selected) {
        setMedicamentoNome(selected.medicamentoNome);
        setCatmatCodigo(selected.catmatCodigo);
        setNumeroLote(selected.numeroLote);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      showToast('Por favor, informe o motivo do recall.', 'error');
      return;
    }
    if (!catmatCodigo.trim() && !numeroLote.trim()) {
      showToast('Informe o código CATMAT ou o número do lote.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        catmatCodigo: catmatCodigo.trim() || null,
        numeroLote: numeroLote.trim() || null,
        medicamentoNome: medicamentoNome.trim() || null,
        fonte,
        risco,
        motivo: motivo.trim(),
        autoridadeEmissora: autoridadeEmissora.trim() || null,
        numeroAnvisa: numeroAnvisa.trim() || null,
        dataExpiracao: dataExpiracao ? new Date(dataExpiracao).toISOString() : null,
      };

      await apiClient.post('/api/cd/recalls', payload);
      showToast('Recall registrado com sucesso. Lotes afetados no CD foram bloqueados.', 'success');
      setIsModalOpen(false);
      resetForm();
      fetchRecallsAndStock();
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao registrar o recall.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedLotId('manual');
    setMedicamentoNome('');
    setCatmatCodigo('');
    setNumeroLote('');
    setFonte('ANVISA');
    setRisco('MEDIO');
    setMotivo('');
    setAutoridadeEmissora('');
    setNumeroAnvisa('');
    setDataExpiracao('');
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRecallId(prev => (prev === id ? null : id));
  };

  // KPI calculations
  const totalRecalls = recalls.length;
  const activeRecalls = recalls.filter(r => r.ativo).length;
  const anvisaActive = recalls.filter(r => r.ativo && r.fonte === 'ANVISA').length;
  const highRiskActive = recalls.filter(r => r.ativo && (r.risco === 'ALTO' || r.risco === 'CRITICO')).length;

  // Filtering
  const filteredRecalls = recalls.filter(recall => {
    // Search filter
    const matchesSearch = 
      (recall.medicamentoNome?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (recall.numeroLote?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (recall.catmatCodigo?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      recall.motivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (recall.id.toLowerCase() || '').includes(searchQuery.toLowerCase());

    // Tab filter
    if (!matchesSearch) return false;
    if (filterTab === 'ativos') return recall.ativo;
    if (filterTab === 'anvisa') return recall.ativo && recall.fonte === 'ANVISA';
    if (filterTab === 'alto-critico') return recall.ativo && (recall.risco === 'ALTO' || recall.risco === 'CRITICO');
    return true;
  });

  const getRiscoStyle = (risco: string) => {
    switch (risco.toUpperCase()) {
      case 'CRITICO':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ALTO':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getFonteStyle = (fonte: string) => {
    switch (fonte.toUpperCase()) {
      case 'ANVISA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FABRICANTE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 slide-in-from-bottom-5 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-rose-600 animate-pulse" />
            Gestão de Recalls
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Gerencie o bloqueio imediato e recolhimento de lotes com desvios de qualidade ou ordens sanitárias.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="https://www.gov.br/anvisa/pt-br/assuntos/fiscalizacao-e-monitoramento/recolhimento"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Ver Portal Público
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-sm font-bold text-white hover:from-rose-700 hover:to-rose-800 transition-all shadow-md shadow-rose-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-5 w-5" />
            Registrar Recall
          </button>
        </div>
      </div>

      {/* Active ANVISA Alert Banner */}
      {anvisaActive > 0 && (
        <div className="relative overflow-hidden bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm animate-bounce-slow">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-rose-900 pointer-events-none">
            <AlertTriangle className="h-40 w-40" />
          </div>
          <div className="p-3 bg-rose-600 rounded-xl text-white shadow-md shadow-rose-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-rose-950 text-base">Alerta Crítico: Recall ANVISA em andamento</h4>
            <p className="text-sm text-rose-800 mt-0.5 max-w-4xl font-medium">
              Existem {anvisaActive} alerta(s) de recall da ANVISA ativo(s). Todos os lotes correspondentes foram bloqueados automaticamente para movimentação física e dispensação no CD.
            </p>
          </div>
          <button 
            onClick={() => setFilterTab('anvisa')}
            className="px-4 py-2 bg-white hover:bg-rose-100/50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            Filtrar Alertas ANVISA
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gray-50 text-gray-700">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total de Recalls</span>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-0.5">{totalRecalls}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Em Andamento</span>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-0.5">{activeRecalls}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Origem ANVISA</span>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-0.5">{recalls.filter(r => r.fonte === 'ANVISA').length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Risco Alto / Crítico</span>
            <h3 className="text-2xl font-extrabold text-orange-600 mt-0.5">{recalls.filter(r => r.risco === 'ALTO' || r.risco === 'CRITICO').length}</h3>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Filters and Search */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setFilterTab('todos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'todos' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterTab('ativos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'ativos' 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Ativos ({activeRecalls})
            </button>
            <button
              onClick={() => setFilterTab('anvisa')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'anvisa' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ANVISA ({recalls.filter(r => r.fonte === 'ANVISA' && r.ativo).length})
            </button>
            <button
              onClick={() => setFilterTab('alto-critico')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'alto-critico' 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Alto/Crítico ({highRiskActive})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por medicamento, lote ou CATMAT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* Table & Loading States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 rounded-full border-4 border-rose-600 border-t-transparent animate-spin"></div>
            <span className="text-sm text-gray-500 font-semibold">Carregando recalls cadastrados...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-600 max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
            <h5 className="font-bold text-gray-900">Erro na Conexão</h5>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        ) : filteredRecalls.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto">
            <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h5 className="font-bold text-gray-900">Nenhum Recall Encontrado</h5>
            <p className="text-sm text-gray-500 mt-1">Não há alertas correspondentes aos filtros selecionados atualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase text-xxs font-bold tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-6 w-10"></th>
                  <th className="py-3.5 px-4">Código/ID</th>
                  <th className="py-3.5 px-4">Medicamento</th>
                  <th className="py-3.5 px-4">Lote Fabricante</th>
                  <th className="py-3.5 px-4">Fonte</th>
                  <th className="py-3.5 px-4">Risco</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Data Registro</th>
                  <th className="py-3.5 px-4 text-center">Lotes Afetados</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecalls.map((recall) => {
                  const isExpanded = expandedRecallId === recall.id;
                  return (
                    <React.Fragment key={recall.id}>
                      {/* Normal Row */}
                      <tr 
                        onClick={() => toggleExpandRow(recall.id)}
                        className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50/50' : ''}`}
                      >
                        <td className="py-4 px-6 text-gray-400">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {recall.id.substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-bold text-gray-900 truncate">
                            {recall.medicamentoNome || 'Todos os Medicamentos'}
                          </div>
                          {recall.catmatCodigo && (
                            <div className="text-xs text-gray-400 font-mono mt-0.5">CATMAT: {recall.catmatCodigo}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-sm font-semibold text-gray-600">
                          {recall.numeroLote ? (
                            <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-xs">
                              {recall.numeroLote}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Todos</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getFonteStyle(recall.fonte)}`}>
                            {recall.fonte}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getRiscoStyle(recall.risco)}`}>
                            {recall.risco}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {recall.ativo ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                              Resolvido
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-gray-600">
                          {new Date(recall.dataEmissao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-gray-700">
                          {recall.lotesAfetados > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-rose-50 text-rose-700 text-xs border border-rose-100">
                              {recall.lotesAfetados}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {recall.ativo && (
                            <button
                              onClick={(e) => handleCloseRecall(recall.id, e)}
                              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                            >
                              Encerrar
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="p-6 bg-gray-50 border-y border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                              
                              {/* Left Panel: Reason */}
                              <div className="md:col-span-2 space-y-3">
                                <div>
                                  <span className="text-xxs uppercase tracking-wider font-bold text-gray-400 block">Motivo / Descrição Sanitária</span>
                                  <p className="text-gray-700 mt-1 font-medium bg-white p-4 rounded-xl border border-gray-200 shadow-sm leading-relaxed">
                                    {recall.motivo}
                                  </p>
                                </div>
                              </div>

                              {/* Right Panel: Metadata details */}
                              <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h6 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Informações da Resolução</h6>
                                
                                {recall.autoridadeEmissora && (
                                  <div className="flex items-start gap-2.5">
                                    <FileText className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-xxs text-gray-400 block font-semibold uppercase">Autoridade Emissora</span>
                                      <span className="text-gray-700 font-medium">{recall.autoridadeEmissora}</span>
                                    </div>
                                  </div>
                                )}

                                {recall.numeroAnvisa && (
                                  <div className="flex items-start gap-2.5">
                                    <ShieldAlert className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-xxs text-gray-400 block font-semibold uppercase">Processo / RE ANVISA</span>
                                      <span className="text-gray-700 font-medium font-mono">{recall.numeroAnvisa}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-start gap-2.5">
                                  <Calendar className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-xxs text-gray-400 block font-semibold uppercase">Data do Recall</span>
                                    <span className="text-gray-700 font-medium">{new Date(recall.dataEmissao).toLocaleString('pt-BR')}</span>
                                  </div>
                                </div>

                                {recall.dataExpiracao && (
                                  <div className="flex items-start gap-2.5">
                                    <Clock className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-xxs text-gray-400 block font-semibold uppercase">Expiração do Alerta</span>
                                      <span className="text-gray-700 font-medium">{new Date(recall.dataExpiracao).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-start gap-2.5">
                                  <User className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="text-xxs text-gray-400 block font-semibold uppercase">Registrado Por</span>
                                    <span className="text-gray-500 font-medium text-xs">ID: {recall.criadoPor}</span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Registrar Recall */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Registrar Novo Alerta de Recall</h3>
                <p className="text-xs text-gray-500 mt-0.5">Os lotes correspondentes no estoque físico do CD serão bloqueados de imediato.</p>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Select Existing Lot or Manual */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Escolher Lote Físico no CD</label>
                <select
                  value={selectedLotId}
                  onChange={(e) => handleLotSelectChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
                >
                  <option value="manual">-- Informar Dados Manualmente --</option>
                  {stockLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.medicamentoNome} - Lote: {lot.numeroLote} ({lot.quantidadeAtual} un, {lot.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Medication Details Grid (Disabled if lot selected, editable if manual) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Nome do Medicamento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Paracetamol 500mg"
                    value={medicamentoNome}
                    onChange={(e) => setMedicamentoNome(e.target.value)}
                    disabled={selectedLotId !== 'manual'}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Código CATMAT</label>
                  <input
                    type="text"
                    placeholder="Ex: BR0280028"
                    value={catmatCodigo}
                    onChange={(e) => setCatmatCodigo(e.target.value)}
                    disabled={selectedLotId !== 'manual'}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Lote do Fabricante</label>
                  <input
                    type="text"
                    placeholder="Ex: LOT2024A123"
                    value={numeroLote}
                    onChange={(e) => setNumeroLote(e.target.value)}
                    disabled={selectedLotId !== 'manual'}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Fonte Emissora</label>
                  <select
                    value={fonte}
                    onChange={(e) => setFonte(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
                  >
                    <option value="ANVISA">ANVISA</option>
                    <option value="Fabricante">Fabricante</option>
                    <option value="Vigilância Sanitária">Vigilância Sanitária</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Grau de Risco</label>
                  <select
                    value={risco}
                    onChange={(e) => setRisco(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
                  >
                    <option value="BAIXO">Baixo</option>
                    <option value="MEDIO">Médio</option>
                    <option value="ALTO">Alto</option>
                    <option value="CRITICO">Crítico</option>
                  </select>
                </div>
              </div>

              {/* Authority & ANVISA Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Autoridade Reguladora / Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Superintendência da ANVISA, Hipolabor S.A."
                    value={autoridadeEmissora}
                    onChange={(e) => setAutoridadeEmissora(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">N.º do Processo / Resolução RE</label>
                  <input
                    type="text"
                    placeholder="Ex: RE 5.214/2026"
                    value={numeroAnvisa}
                    onChange={(e) => setNumeroAnvisa(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* Expiration date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Data de Validade/Expiração do Recall (Opcional)</label>
                <input
                  type="date"
                  value={dataExpiracao}
                  onChange={(e) => setDataExpiracao(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
                />
              </div>

              {/* Motivo Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Motivo / Descrição Detalhada</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva detalhadamente o desvio de qualidade encontrado ou os termos do alerta sanitário..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              {/* Modal Footer / Actions */}
              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-455 text-sm font-bold text-white rounded-xl shadow-md transition-all shadow-rose-200"
                >
                  {submitting ? (
                    <>
                      <div className="h-4.5 w-4.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4.5 w-4.5" />
                      Registrar Recall
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
