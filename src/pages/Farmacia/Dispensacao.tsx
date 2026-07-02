import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Pill,
  Package,
  Calendar,
  Hash,
  Minus,
  Plus,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowDownUp,
  QrCode,
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'sonner';
import { QrScannerModal } from '../../components/Farmacia/QrScannerModal';
import { EtiquetaFracionada } from '../../components/Farmacia/EtiquetaFracionada';

/* ─── Types ─── */
interface Lote {
  id: string;
  numeroLote: string;
  validade: string;
  quantidadeAtual: number;
  quantidadeCaixasFechadas: number;
  quantidadePorCaixa: number;
  fornecedor?: string;
  embalagemFracionada?: {
    id: string;
    codigoQr: string;
    quantidadeAtual: number;
  } | null;
}

interface MedicamentoEstoque {
  id: string;
  nome: string;
  catmatCodigo?: string;
  principioAtivo?: string;
  formaFarmaceutica?: string;
  concentracao?: string;
  unidadeMedida?: string;
  estoqueMinimo: number;
  lotes: Lote[];
}

interface DispensacaoRecente {
  id: string;
  medicamentoNome: string;
  concentracao?: string;
  quantidade: number;
  dataDispensacao: string;
  pacienteNome?: string;
  numeroLote?: string;
}

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
}

/* ─── Component ─── */
export function Dispensacao() {
  // Search state
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MedicamentoEstoque[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Selected medication
  const [selected, setSelected] = useState<MedicamentoEstoque | null>(null);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [quantidade, setQuantidade] = useState(1);

  // Dispensation
  const [dispensing, setDispensing] = useState(false);

  // Recent dispensations
  const [recentes, setRecentes] = useState<DispensacaoRecente[]>([]);
  const [recentesLoading, setRecentesLoading] = useState(true);

  // Paciente state
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<Paciente[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  // QR & Printing states
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [etiquetaOpen, setEtiquetaOpen] = useState(false);
  const [etiquetaDados, setEtiquetaDados] = useState<any>(null);
  const [scannedQrCode, setScannedQrCode] = useState<string | null>(null);
  const [bipado, setBipado] = useState(false);

  /* ─── Fetch recent dispensations ─── */
  const fetchRecentes = useCallback(async () => {
    try {
      setRecentesLoading(true);
      const res = await apiClient.get('/api/farmacia/dispensacoes/recentes');
      setRecentes(res.data?.dados ?? res.data ?? []);
    } catch {
      // silently fail for sidebar data
    } finally {
      setRecentesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentes();
  }, [fetchRecentes]);

  /* ─── Debounced search ─── */
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await apiClient.get('/api/farmacia/estoque', {
          params: { search: search.trim() },
        });
        const data = res.data?.dados ?? res.data ?? [];
        setSearchResults(data);
        setShowDropdown(true);
      } catch {
        toast.error('Erro ao buscar medicamentos.');
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  /* ─── Debounced patient search ─── */
  useEffect(() => {
    if (!patientSearch.trim()) {
      setPatientResults([]);
      setShowPatientDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setPatientLoading(true);
        const res = await apiClient.get('/api/farmacia/pacientes', {
          params: { search: patientSearch.trim() },
        });
        setPatientResults(res.data || []);
        setShowPatientDropdown(true);
      } catch {
        toast.error('Erro ao buscar pacientes.');
      } finally {
        setPatientLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [patientSearch]);

  /* ─── Close dropdown on outside click ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Select medication from search ─── */
  const handleSelect = (med: MedicamentoEstoque) => {
    const totalEstoque = med.lotes.reduce((sum, l) => sum + Number(l.quantidadeAtual), 0);
    const enrichedMed = { ...med, estoqueAtual: totalEstoque };
    setSelected(enrichedMed as MedicamentoEstoque & { estoqueAtual: number });
    setQuantidade(1);
    
    // Reset scanner states
    setScannedQrCode(null);
    setBipado(false);

    // Auto-select the first lot (closest expiry / FEFO)
    if (med.lotes && med.lotes.length > 0) {
      const sortedLotes = [...med.lotes].sort(
        (a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime()
      );
      setSelectedLote(sortedLotes[0]);
    } else {
      setSelectedLote(null);
    }
    setShowDropdown(false);
    setSearch('');
  };

  /* ─── Handle QR Code Scan Success ─── */
  const handleScanSuccess = async (codigoQr: string) => {
    if (!selectedLote) return;
    
    try {
      // Valida QR contra a API
      const res = await apiClient.post('/api/farmacia/validar-qr', { codigoQr });
      
      if (res.data.loteId !== selectedLote.id) {
        toast.error('Este QR Code pertence a outro lote!');
        return;
      }
      
      setScannedQrCode(codigoQr);
      setBipado(true);
      setQrScannerOpen(false);
      toast.success('QR Code bipado com sucesso!');
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'QR Code inválido ou já esgotado.';
      toast.error(msg);
    }
  };

  /* ─── Dispense medication ─── */
  const handleDispensacao = async () => {
    if (!selected || !selectedLote) {
      toast.error('Selecione um medicamento e lote.');
      return;
    }
    if (selectedLote.embalagemFracionada && !bipado) {
      toast.error('Bipagem obrigatória: Este lote possui medicamentos avulsos em embalagem fracionada. Favor bipar o QR code.');
      return;
    }
    if (!selectedPatient) {
      toast.error('Selecione um paciente.');
      return;
    }
    if (quantidade <= 0) {
      toast.error('Quantidade deve ser maior que zero.');
      return;
    }
    if (quantidade > selectedLote.quantidadeAtual) {
      toast.error('Quantidade excede o estoque disponível neste lote.');
      return;
    }

    try {
      setDispensing(true);
      const res = await apiClient.post('/api/farmacia/dispensar', {
        medicamentoId: selected.id,
        loteId: selectedLote.id,
        quantidade,
        pacienteId: selectedPatient.id,
        codigoQr: scannedQrCode || undefined,
      });

      // Se gerou nova embalagem fracionada para impressão
      if (res.data?.novaEmbalagem) {
        setEtiquetaDados({
          codigoQr: res.data.novaEmbalagem.codigoQr,
          quantidadeAtual: res.data.novaEmbalagem.quantidadeAtual,
          numeroLote: selectedLote.numeroLote,
          validade: selectedLote.validade,
          medicamentoNome: selected.nome,
          unidadeMedida: selected.unidadeMedida || 'UNIDADE',
          caixasAbertas: res.data.caixasAbertas,
        });
        setEtiquetaOpen(true);
      } else {
        toast.success('Dispensação realizada com sucesso!');
      }

      // Reset form and refresh
      setSelected(null);
      setSelectedLote(null);
      setSelectedPatient(null);
      setQuantidade(1);
      setScannedQrCode(null);
      setBipado(false);
      fetchRecentes();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'Erro ao realizar dispensação.';
      toast.error(msg);
    } finally {
      setDispensing(false);
    }
  };

  /* ─── Helpers ─── */
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const estoqueAtual = selected
    ? (selected as any).estoqueAtual ?? selected.lotes.reduce((s, l) => s + Number(l.quantidadeAtual), 0)
    : 0;

  const isLowStock = selected
    ? estoqueAtual <= selected.estoqueMinimo
    : false;

  const isCriticalStock = selected
    ? estoqueAtual === 0
    : false;

  /* ─── Render ─── */
  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <ArrowDownUp className="h-6 w-6 text-emerald-600" />
          Saídas / Dispensação
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Registre a saída de medicamentos da farmácia
        </p>
      </div>

      {/* Two‑column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════════ LEFT COLUMN (2/3) ═══════════ */}
        <div className="lg:col-span-2 space-y-5">
          {/* Search */}
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar medicamento por nome ou código..."
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 placeholder:text-gray-400 bg-white shadow-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {searchLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-spin" />
              )}
            </div>

            {/* Search dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-20 mt-2 w-full bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">
                {searchResults.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleSelect(med)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-emerald-50/70 transition-colors text-left border-b border-gray-100 last:border-b-0 cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Pill className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{med.nome}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Estoque: {med.lotes.reduce((s, l) => s + Number(l.quantidadeAtual), 0)} un · {med.lotes?.length ?? 0} lote(s)
                      </p>
                    </div>
                    {med.lotes.reduce((s, l) => s + Number(l.quantidadeAtual), 0) <= med.estoqueMinimo && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        Baixo
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showDropdown && search.trim() && searchResults.length === 0 && !searchLoading && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-6 text-center">
                <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">Nenhum medicamento encontrado</p>
              </div>
            )}
          </div>

          {/* Selected medication card */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-5 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              {/* Name & Code */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.nome}</h2>
                  {selected.catmatCodigo && (
                    <span className="text-xs font-semibold text-gray-400 mt-1 inline-block">
                      CATMAT: {selected.catmatCodigo}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setSelected(null); setSelectedLote(null); setQuantidade(1); }}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              </div>

              {/* Lot & Expiry */}
              {selectedLote && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold">Lote:</span>
                      <span className="font-bold text-gray-900">{selectedLote.numeroLote}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold">Validade:</span>
                      <span className="font-bold text-gray-900">{formatDate(selectedLote.validade)}</span>
                    </div>
                  </div>

                  {/* Caixas Fechadas & Unidade Medida */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-gray-400" />
                      <span>Caixas Fechadas:</span>
                      <span className="font-bold text-gray-700">
                        {selectedLote.quantidadeCaixasFechadas} caixas (c/ {selectedLote.quantidadePorCaixa} {selected.unidadeMedida}(s) cada)
                      </span>
                    </div>
                  </div>

                  {/* Embalagem Fracionada (Saquinho Ziplock) se houver */}
                  {selectedLote.embalagemFracionada ? (
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                          <QrCode className="h-4 w-4" />
                          <span>Medicamentos Avulsos no Saquinho</span>
                        </div>
                        <p className="text-[10px] text-indigo-500 font-semibold mt-0.5">
                          Etiqueta: {selectedLote.embalagemFracionada.codigoQr}
                        </p>
                        <p className="text-lg font-black text-indigo-900 mt-1">
                          {selectedLote.embalagemFracionada.quantidadeAtual}
                          <span className="text-xs font-bold ml-1 text-indigo-600">{selected.unidadeMedida}(s)</span>
                        </p>
                      </div>
                      <div>
                        {bipado ? (
                          <span className="px-3 py-1.5 bg-emerald-100 border border-emerald-250 text-emerald-700 rounded-xl font-extrabold text-xs flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Bipado!
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setQrScannerOpen(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-xs cursor-pointer"
                          >
                            Bipar QR Code
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Lot selector (if multiple lots) */}
              {selected.lotes && selected.lotes.length > 1 && (
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                    Selecionar Lote
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white"
                    value={selectedLote?.id ?? ''}
                    onChange={(e) => {
                      const lote = selected.lotes.find((l) => l.id === e.target.value);
                      setSelectedLote(lote ?? null);
                      setQuantidade(1);
                    }}
                  >
                    {[...selected.lotes]
                      .sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime())
                      .map((lote) => (
                         <option key={lote.id} value={lote.id}>
                          Lote {lote.numeroLote} — Val: {formatDate(lote.validade)} — Qtd: {lote.quantidadeAtual} un
                         </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Stock mini-cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-xl p-4 border transition-all ${
                  isCriticalStock
                    ? 'bg-red-50 border-red-200'
                    : isLowStock
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isCriticalStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    Estoque Atual
                  </span>
                  <p className={`text-2xl font-black mt-1 ${
                    isCriticalStock ? 'text-red-700' : isLowStock ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {estoqueAtual}
                    <span className="text-xs font-bold ml-1">un</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    Estoque Mínimo
                  </span>
                  <p className="text-2xl font-black text-gray-700 mt-1">
                    {selected.estoqueMinimo}
                    <span className="text-xs font-bold ml-1">un</span>
                  </p>
                </div>
              </div>

              {/* Low stock alert */}
              {isLowStock && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  isCriticalStock
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold">
                    {isCriticalStock
                      ? 'Estoque zerado! Solicite reposição urgente.'
                      : 'Estoque abaixo do mínimo. Considere solicitar reposição.'}
                  </span>
                </div>
              )}

              {/* Paciente Selector */}
              <div className="relative" ref={patientDropdownRef}>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                  Paciente
                </label>
                {selectedPatient ? (
                  <div className="flex items-center justify-between p-3.5 border border-emerald-200 rounded-xl bg-emerald-50/50">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{selectedPatient.nome}</p>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">CPF: {selectedPatient.cpf}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(null)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar paciente por nome ou CPF..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      onFocus={() => setShowPatientDropdown(true)}
                    />
                    {patientLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 animate-spin" />
                    )}
                    
                    {showPatientDropdown && patientResults.length > 0 && (
                      <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {patientResults.map((pat) => (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatient(pat);
                              setShowPatientDropdown(false);
                              setPatientSearch('');
                            }}
                            className="w-full flex flex-col px-4 py-2 hover:bg-emerald-50 text-left border-b border-gray-100 last:border-b-0 cursor-pointer"
                          >
                            <span className="text-xs font-bold text-gray-900">{pat.nome}</span>
                            <span className="text-[10px] text-gray-400 font-semibold mt-0.5">CPF: {pat.cpf}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity selector */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                  Quantidade a Dispensar
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                    className="h-11 w-11 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={selectedLote?.quantidadeAtual ?? 999}
                    value={quantidade}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantidade(Math.max(1, Math.min(val, selectedLote?.quantidadeAtual ?? 999)));
                    }}
                    className="w-24 h-11 text-center text-lg font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white shadow-sm"
                  />
                  <button
                    onClick={() =>
                      setQuantidade((q) => Math.min(q + 1, selectedLote?.quantidadeAtual ?? 999))
                    }
                    className="h-11 w-11 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  {selectedLote && (
                    <span className="text-xs font-semibold text-gray-400 ml-2">
                      de {selectedLote.quantidadeAtual} disponíveis
                    </span>
                  )}
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleDispensacao}
                disabled={dispensing || !selectedLote || !selectedPatient || quantidade <= 0}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {dispensing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Confirmar Dispensação
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 mb-4">
                <Pill className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Nenhum medicamento selecionado</h3>
              <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
                Use a barra de busca acima para encontrar e selecionar um medicamento do estoque.
              </p>
            </div>
          )}
        </div>

        {/* ═══════════ RIGHT COLUMN (1/3) ═══════════ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                Dispensações Recentes
              </h3>
              <button
                onClick={fetchRecentes}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                Atualizar
              </button>
            </div>

            {/* List */}
            <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
              {recentesLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-5 w-5 text-emerald-500 animate-spin mx-auto mb-2" />
                  <span className="text-xs font-bold text-gray-400">Carregando...</span>
                </div>
              ) : recentes.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-400">Nenhuma dispensação recente</p>
                </div>
              ) : (
                recentes.map((disp) => (
                  <div
                    key={disp.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Pill className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{disp.medicamentoNome}</p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        {disp.quantidade} un dispensada(s)
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 shrink-0">
                      {formatTime(disp.dataDispensacao)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modais de Fracionamento */}
      <QrScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <EtiquetaFracionada
        isOpen={etiquetaOpen}
        onClose={() => {
          setEtiquetaOpen(false);
          setEtiquetaDados(null);
        }}
        dados={etiquetaDados}
      />
    </div>
  );
}
