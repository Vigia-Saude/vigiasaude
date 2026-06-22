import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Truck,
  Search,
  Pill,
  User,
  MapPin,
  Calendar,
  Hash,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  FileText,
  Shield,
  ClipboardCheck
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'sonner';
import { formatCPF } from '../../lib/utils';


/* ─── Types ─── */
interface Lote {
  id: string;
  numeroLote: string;
  validade: string;
  quantidadeAtual: number;
}

interface MedicamentoEstoque {
  id: string;
  nome: string;
  catmatCodigo?: string;
  lotes: Lote[];
}

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
}

interface EntregaItem {
  id: string;
  medicamentoId: string;
  medicamentoNome: string;
  loteId: string;
  numeroLote: string;
  quantidade: number;
}

interface Entrega {
  id: string;
  numero: string;
  status: 'PENDENTE' | 'EM_ROTA' | 'ENTREGUE' | 'DEVOLVIDO';
  prioridade: 'NORMAL' | 'URGENTE';
  pacienteId?: string;
  pacienteNome: string;
  pacienteCpf?: string;
  endereco: string;
  entregadorNome?: string;
  codigoRastreio?: string;
  observacoes?: string;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
  itens: EntregaItem[];
}

interface DeliveryStats {
  pendentes: number;
  emRota: number;
  entreguesHoje: number;
  devolvidos: number;
}

export function EntregasReposicao() {
  // Page lists & stats
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({ pendentes: 0, emRota: 0, entreguesHoje: 0, devolvidos: 0 });
  const [estoque, setEstoque] = useState<MedicamentoEstoque[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [estoqueLoading, setEstoqueLoading] = useState(true);

  // Filters & Accordions
  const [activeTab, setActiveTab] = useState<'TODOS' | 'PENDENTE' | 'EM_ROTA' | 'ENTREGUE' | 'DEVOLVIDO'>('TODOS');
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);

  // Modals state
  const [isNewDeliveryOpen, setIsNewDeliveryOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [selectedDeliveryToCollect, setSelectedDeliveryToCollect] = useState<Entrega | null>(null);

  // Nova Entrega form state
  const [patientResults, setPatientResults] = useState<Paciente[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientCpf, setManualPatientCpf] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENTE'>('NORMAL');
  const [observations, setObservations] = useState('');
  
  // Add medicine in form
  const [medSearch, setMedSearch] = useState('');
  const [medResults, setMedResults] = useState<MedicamentoEstoque[]>([]);
  const [medLoading, setMedLoading] = useState(false);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicamentoEstoque | null>(null);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [medQuantity, setMedQuantity] = useState(1);
  const medDropdownRef = useRef<HTMLDivElement>(null);

  // Added items list
  const [addedItems, setAddedItems] = useState<Array<{
    medicamentoId: string;
    medicamentoNome: string;
    loteId: string;
    numeroLote: string;
    quantidade: number;
    maxQuantidade: number;
  }>>([]);

  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  // Confirm Coleta form state
  const [driverName, setDriverName] = useState('Carlos Motorista'); // carlos is the default in database
  const [trackingCode, setTrackingCode] = useState('');
  const [submittingColeta, setSubmittingColeta] = useState(false);

  /* ─── API Fetches ─── */
  const fetchEntregas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/farmacia/entregas');
      setEntregas(res.data || []);
    } catch {
      toast.error('Erro ao carregar entregas.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get('/api/farmacia/entregas/stats');
      setStats(res.data || { pendentes: 0, emRota: 0, entreguesHoje: 0, devolvidos: 0 });
    } catch {
      // Silently fail stats
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchEstoque = useCallback(async () => {
    try {
      setEstoqueLoading(true);
      const res = await apiClient.get('/api/farmacia/estoque');
      setEstoque(res.data || []);
    } catch {
      // Silently fail stock
    } finally {
      setEstoqueLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntregas();
    fetchStats();
    fetchEstoque();
  }, [fetchEntregas, fetchStats, fetchEstoque]);



  /* ─── Patient Autocomplete Search ─── */
  const loadPatients = useCallback(async (searchVal: string) => {
    try {
      setPatientLoading(true);
      const res = await apiClient.get('/api/farmacia/pacientes', {
        params: { search: searchVal.trim() },
      });
      setPatientResults(res.data || []);
      setShowPatientDropdown(true);
    } catch {
      toast.error('Erro ao buscar pacientes.');
    } finally {
      setPatientLoading(false);
    }
  }, []);

  useEffect(() => {
    if (manualPatientName.trim() === '') {
      if (document.activeElement?.id === 'patient-name-input') {
        loadPatients('');
      } else {
        setPatientResults([]);
        setShowPatientDropdown(false);
      }
      return;
    }

    // Se já selecionou um paciente e o nome não mudou, não busca novamente
    if (selectedPatient && selectedPatient.nome === manualPatientName) {
      setPatientResults([]);
      setShowPatientDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      loadPatients(manualPatientName);
    }, 350);

    return () => clearTimeout(timer);
  }, [manualPatientName, selectedPatient, loadPatients]);

  /* ─── Medication Autocomplete Search ─── */
  const loadMeds = useCallback(async (searchVal: string) => {
    try {
      setMedLoading(true);
      const res = await apiClient.get('/api/farmacia/estoque', {
        params: { search: searchVal.trim() },
      });
      setMedResults(res.data || []);
      setShowMedDropdown(true);
    } catch {
      toast.error('Erro ao buscar medicamentos.');
    } finally {
      setMedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (medSearch.trim() === '') {
      if (document.activeElement?.id === 'med-search-input') {
        loadMeds('');
      } else {
        setMedResults([]);
        setShowMedDropdown(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      loadMeds(medSearch);
    }, 350);

    return () => clearTimeout(timer);
  }, [medSearch, loadMeds]);

  /* ─── Click outside dropdown handler ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false);
      }
      if (medDropdownRef.current && !medDropdownRef.current.contains(e.target as Node)) {
        setShowMedDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Form Handlers ─── */
  const handleSelectPatient = (pat: Paciente) => {
    setSelectedPatient(pat);
    setManualPatientName(pat.nome);
    setManualPatientCpf(formatCPF(pat.cpf));
    setShowPatientDropdown(false);
  };

  const handleSelectMed = (med: MedicamentoEstoque) => {
    setSelectedMed(med);
    setMedSearch('');
    setShowMedDropdown(false);
    setMedQuantity(1);
    
    // FEFO Selection
    if (med.lotes && med.lotes.length > 0) {
      const sorted = [...med.lotes].sort(
        (a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime()
      );
      setSelectedLote(sorted[0]);
    } else {
      setSelectedLote(null);
    }
  };

  const handleAddMedItem = () => {
    if (!selectedMed || !selectedLote) {
      toast.error('Selecione o medicamento e lote.');
      return;
    }
    if (medQuantity <= 0) {
      toast.error('Quantidade inválida.');
      return;
    }
    if (medQuantity > selectedLote.quantidadeAtual) {
      toast.error(`Quantidade indisponível. Máximo em lote: ${selectedLote.quantidadeAtual}`);
      return;
    }

    // Check if item already added (same lote)
    const exists = addedItems.find(i => i.loteId === selectedLote.id);
    if (exists) {
      toast.error('Medicamento com este lote já foi adicionado.');
      return;
    }

    setAddedItems(prev => [
      ...prev,
      {
        medicamentoId: selectedMed.id,
        medicamentoNome: selectedMed.nome,
        loteId: selectedLote.id,
        numeroLote: selectedLote.numeroLote,
        quantidade: medQuantity,
        maxQuantidade: selectedLote.quantidadeAtual
      }
    ]);

    setSelectedMed(null);
    setSelectedLote(null);
    setMedQuantity(1);
  };

  const handleRemoveAddedItem = (loteId: string) => {
    setAddedItems(prev => prev.filter(i => i.loteId !== loteId));
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPatientName.trim()) {
      toast.error('O nome do paciente é obrigatório.');
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error('O endereço de entrega é obrigatório.');
      return;
    }
    if (addedItems.length === 0) {
      toast.error('Adicione pelo menos um medicamento à entrega.');
      return;
    }

    try {
      setSubmittingDelivery(true);
      await apiClient.post('/api/farmacia/entregas', {
        pacienteId: selectedPatient?.id || null,
        pacienteNome: manualPatientName.trim(),
        pacienteCpf: manualPatientCpf.trim() || null,
        endereco: deliveryAddress.trim(),
        prioridade: priority,
        observacoes: observations.trim() || null,
        itens: addedItems.map(i => ({
          medicamentoId: i.medicamentoId,
          loteId: i.loteId,
          quantidade: i.quantidade
        }))
      });

      toast.success('Solicitação de entrega criada!');
      setIsNewDeliveryOpen(false);
      
      // Reset Form State
      setSelectedPatient(null);
      setManualPatientName('');
      setManualPatientCpf('');
      setDeliveryAddress('');
      setPriority('NORMAL');
      setObservations('');
      setAddedItems([]);

      // Refresh Data
      fetchEntregas();
      fetchStats();
      fetchEstoque();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'Erro ao criar solicitação de entrega.';
      toast.error(msg);
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const handleConfirmColeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryToCollect) return;
    if (!driverName.trim()) {
      toast.error('Preencha o nome do entregador.');
      return;
    }

    try {
      setSubmittingColeta(true);
      await apiClient.patch(`/api/farmacia/entregas/${selectedDeliveryToCollect.id}/coletar`, {
        entregadorNome: driverName.trim(),
        codigoRastreio: trackingCode.trim() || null
      });

      toast.success(`Entrega ${selectedDeliveryToCollect.numero} em rota!`);
      setIsCollectOpen(false);
      setSelectedDeliveryToCollect(null);
      setTrackingCode('');
      
      // Refresh Data
      fetchEntregas();
      fetchStats();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'Erro ao confirmar coleta.';
      toast.error(msg);
    } finally {
      setSubmittingColeta(false);
    }
  };

  const handleUpdateStatus = async (id: string, numero: string, status: 'ENTREGUE' | 'DEVOLVIDO') => {
    const confirmMsg = status === 'ENTREGUE' 
      ? `Confirmar que a entrega ${numero} foi realizada com sucesso?`
      : `Confirmar devolução da entrega ${numero}? Os itens voltarão para o estoque.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await apiClient.patch(`/api/farmacia/entregas/${id}/status`, { status });
      toast.success(status === 'ENTREGUE' ? 'Entrega concluída!' : 'Entrega devolvida com sucesso.');
      
      // Refresh Data
      fetchEntregas();
      fetchStats();
      fetchEstoque();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'Erro ao atualizar status.';
      toast.error(msg);
    }
  };

  /* ─── Helpers ─── */
  const formatDate = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return '';
    const date = new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const time = new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${date} às ${time}`;
  };

  // Client side tab filter
  const filteredEntregas = entregas.filter(item => {
    if (activeTab === 'TODOS') return true;
    return item.status === activeTab;
  });

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Truck className="h-6 w-6 text-emerald-600" />
            Gestão de Entregas
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Controle de remessas domiciliares para pacientes da unidade.
          </p>
        </div>
        <button
          onClick={() => setIsNewDeliveryOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition-all cursor-pointer select-none shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          Nova Entrega para Paciente
        </button>
      </div>

      {/* ─── Top Cards: Stock & Metrics ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Estoque Disponível */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estoque Domiciliar</h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              Disponível
            </span>
          </div>

          <div className="space-y-2.5 max-h-[140px] overflow-y-auto">
            {estoqueLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
              </div>
            ) : estoque.length === 0 ? (
              <p className="text-xs font-semibold text-gray-400 text-center py-6">Sem estoque disponível na farmácia.</p>
            ) : (
              estoque.slice(0, 5).map(med => {
                const total = med.lotes.reduce((sum, l) => sum + Number(l.quantidadeAtual), 0);
                return (
                  <div key={med.id} className="flex items-center justify-between text-xs border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                    <span className="font-bold text-gray-800 truncate max-w-[170px]" title={med.nome}>
                      {med.nome}
                    </span>
                    <span className="font-black text-gray-500 shrink-0 bg-gray-50 px-2 py-0.5 rounded-md">
                      {total} un
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Pendentes */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">Pendentes</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-gray-900">
                {statsLoading ? '...' : stats.pendentes}
              </span>
              <Clock className="h-5 w-5 text-amber-300" />
            </div>
          </div>

          {/* Em Rota */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider">Em Rota</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-gray-900">
                {statsLoading ? '...' : stats.emRota}
              </span>
              <Truck className="h-5 w-5 text-blue-300" />
            </div>
          </div>

          {/* Entregues Hoje */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider">Entregues Hoje</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-gray-900">
                {statsLoading ? '...' : stats.entreguesHoje}
              </span>
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            </div>
          </div>

          {/* Devolvidos */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider">Devolvidos</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-gray-900">
                {statsLoading ? '...' : stats.devolvidos}
              </span>
              <XCircle className="h-5 w-5 text-red-300" />
            </div>
          </div>
        </div>

      </div>

      {/* ─── Tabs Filter ─── */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {(['TODOS', 'PENDENTE', 'EM_ROTA', 'ENTREGUE', 'DEVOLVIDO'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/20'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
            }`}
          >
            {tab === 'TODOS' ? 'Todos os Pedidos' : 
             tab === 'PENDENTE' ? 'Pendentes' :
             tab === 'EM_ROTA' ? 'Em Rota' :
             tab === 'ENTREGUE' ? 'Entregues' : 'Devolvidos'}
          </button>
        ))}
      </div>

      {/* ─── List of Deliveries ─── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-500">Buscando registros no banco de dados...</p>
        </div>
      ) : filteredEntregas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center">
          <Truck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-900">Nenhum pedido encontrado</h3>
          <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto mt-1">
            Não existem solicitações correspondentes a esta tab no momento. Crie um novo pedido para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntregas.map(item => {
            const isExpanded = expandedDeliveryId === item.id;
            const isUrgente = item.prioridade === 'URGENTE';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col justify-between ${
                  isExpanded ? 'ring-1 ring-emerald-500 border-emerald-500' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header card info */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {item.numero}
                      </span>
                      {isUrgente && (
                        <span className="ml-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                          <AlertTriangle className="h-3 w-3" />
                          Urgente
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border ${
                      item.status === 'PENDENTE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      item.status === 'EM_ROTA' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      item.status === 'ENTREGUE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {item.status === 'PENDENTE' ? 'Aguardando Coleta' :
                       item.status === 'EM_ROTA' ? 'Em Rota' :
                       item.status === 'ENTREGUE' ? 'Entregue' : 'Devolvido'}
                    </span>
                  </div>

                  {/* Paciente info */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-bold text-gray-900 truncate">{item.pacienteNome}</span>
                    </div>
                    {item.pacienteCpf && (
                      <p className="text-[10px] text-gray-400 font-semibold pl-6">CPF: {item.pacienteCpf}</p>
                    )}
                    <div className="flex items-start gap-2 text-xs text-gray-500 font-medium">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item.endereco}</span>
                    </div>
                  </div>

                  {/* Driver / Tracking code */}
                  {(item.entregadorNome || item.codigoRastreio) && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-[11px] font-semibold text-gray-600 space-y-1">
                      {item.entregadorNome && (
                        <p>
                          <span className="text-gray-400">Entregador:</span>{' '}
                          <span className="font-bold text-gray-800">{item.entregadorNome}</span>
                        </p>
                      )}
                      {item.codigoRastreio && (
                        <p>
                          <span className="text-gray-400">Rastreamento:</span>{' '}
                          <span className="font-bold text-gray-800 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                            {item.codigoRastreio}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expand button & items list */}
                  <div className="border-t border-gray-100 pt-3">
                    <button
                      onClick={() => setExpandedDeliveryId(isExpanded ? null : item.id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Ver itens do pedido ({item.itens?.length || 0})
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isExpanded && item.itens && (
                      <div className="mt-3 bg-emerald-50/20 border border-emerald-100/50 rounded-xl p-3 space-y-2 animate-in fade-in slide-in-from-top-1">
                        {item.itens.map(subItem => (
                          <div key={subItem.id} className="flex items-start justify-between text-xs">
                            <div>
                              <p className="font-bold text-gray-850 flex items-center gap-1">
                                <Pill className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                {subItem.medicamentoNome}
                              </p>
                              {subItem.numeroLote && (
                                <p className="text-[10px] text-gray-400 font-semibold pl-4.5 mt-0.5">
                                  Lote: {subItem.numeroLote}
                                </p>
                              )}
                            </div>
                            <span className="font-extrabold text-emerald-700 shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                              {subItem.quantidade} un
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Dynamic actions */}
                <div className="bg-gray-50 border-t border-gray-100 px-5 py-3.5 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-gray-400">
                    Criado em: {formatDateTime(item.criadoEm)}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.status === 'PENDENTE' && (
                      <button
                        onClick={() => {
                          setSelectedDeliveryToCollect(item);
                          setIsCollectOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Confirmar Coleta
                      </button>
                    )}

                    {item.status === 'EM_ROTA' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item.id, item.numero, 'DEVOLVIDO')}
                          className="px-3.5 py-2 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                        >
                          Devolver
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, item.numero, 'ENTREGUE')}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Entregue
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal 1: Nova Entrega ─── */}
      {isNewDeliveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                Nova Entrega para Paciente
              </h2>
              <button
                onClick={() => setIsNewDeliveryOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-150 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateDelivery} className="p-6 space-y-5 flex-1">
              
              {/* Nome Completo do Destinatário (DB Autocomplete) */}
              <div className="relative" ref={patientDropdownRef}>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                  Nome Completo do Destinatário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="patient-name-input"
                    type="text"
                    required
                    placeholder="Nome do paciente (comece a digitar para pesquisar no banco)"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white"
                    value={manualPatientName}
                    onChange={(e) => {
                      setManualPatientName(e.target.value);
                      if (selectedPatient && selectedPatient.nome !== e.target.value) {
                        setSelectedPatient(null);
                      }
                    }}
                    onFocus={() => loadPatients(manualPatientName)}
                  />
                  {patientLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 animate-spin" />
                  )}
                </div>

                {showPatientDropdown && patientResults.length > 0 && (
                  <div className="absolute z-45 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                    {patientResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className="w-full flex flex-col px-4 py-2 hover:bg-emerald-50 text-left border-b border-gray-100 last:border-b-0 cursor-pointer"
                      >
                        <span className="text-xs font-bold text-gray-900">{p.nome}</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5">CPF: {formatCPF(p.cpf)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CPF e Prioridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                    CPF (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white"
                    value={manualPatientCpf}
                    onChange={(e) => setManualPatientCpf(formatCPF(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                    Prioridade da Entrega
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPriority('NORMAL')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        priority === 'NORMAL'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-300'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('URGENTE')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        priority === 'URGENTE'
                          ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-300'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Urgente
                    </button>
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                  Endereço de Entrega
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-400" />
                  <textarea
                    required
                    rows={2}
                    placeholder="Rua, Número, Bairro, Complemento, CEP..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* ─── ADD MEDICAMENT SECTION ─── */}
              <div className="border border-emerald-100 bg-emerald-50/10 rounded-2xl p-4 space-y-4">
                <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
                  Adicionar Medicamento ao Pedido
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative" ref={medDropdownRef}>
                  {/* Busca Medicamento */}
                  <div className="relative">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Medicamento
                    </label>
                    {selectedMed ? (
                      <div className="flex items-center justify-between p-2 px-3 border border-emerald-200 bg-emerald-50 rounded-xl">
                        <span className="text-xs font-bold text-gray-800 truncate">{selectedMed.nome}</span>
                        <button
                          type="button"
                          onClick={() => { setSelectedMed(null); setSelectedLote(null); }}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Limpar
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          id="med-search-input"
                          type="text"
                          placeholder="Buscar medicamento..."
                          className="w-full pl-8.5 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                          value={medSearch}
                          onChange={(e) => setMedSearch(e.target.value)}
                          onFocus={() => loadMeds(medSearch)}
                        />
                        {medLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500 animate-spin" />
                        )}
                      </div>
                    )}

                    {showMedDropdown && medResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {medResults.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSelectMed(m)}
                            className="w-full px-4 py-2 hover:bg-emerald-50 text-left border-b border-gray-100 last:border-b-0 cursor-pointer text-xs font-bold text-gray-800"
                          >
                            {m.nome}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lote Selector */}
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Lote Disponível
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                      disabled={!selectedMed || !selectedMed.lotes}
                      value={selectedLote?.id ?? ''}
                      onChange={(e) => {
                        const l = selectedMed?.lotes.find(x => x.id === e.target.value);
                        setSelectedLote(l || null);
                        setMedQuantity(1);
                      }}
                    >
                      {!selectedMed && <option>Selecione um medicamento primeiro</option>}
                      {selectedMed && selectedMed.lotes?.map(l => (
                        <option key={l.id} value={l.id}>
                          Lote {l.numeroLote} — Val: {formatDate(l.validade)} ({l.quantidadeAtual} un)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Qtd & Add Action */}
                {selectedLote && (
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMedQuantity(q => Math.max(1, q - 1))}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={selectedLote.quantidadeAtual}
                        value={medQuantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setMedQuantity(Math.max(1, Math.min(val, selectedLote.quantidadeAtual)));
                        }}
                        className="w-16 h-9 text-center text-xs font-bold border border-gray-200 rounded-lg bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setMedQuantity(q => Math.min(q + 1, selectedLote.quantidadeAtual))}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] text-gray-400 font-semibold ml-1">
                        de {selectedLote.quantidadeAtual} disponíveis
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMedItem}
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                )}

                {/* Items List inside form */}
                {addedItems.length > 0 && (
                  <div className="border border-gray-200/60 rounded-xl bg-white divide-y divide-gray-100 max-h-32 overflow-y-auto">
                    {addedItems.map(item => (
                      <div key={item.loteId} className="flex items-center justify-between p-2 px-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-800 truncate">{item.medicamentoNome}</p>
                          <p className="text-[9px] font-semibold text-gray-400 mt-0.5">Lote: {item.numeroLote}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {item.quantidade} un
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddedItem(item.loteId)}
                            className="text-red-500 hover:text-red-700 font-bold text-[10px]"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações / Instruções */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                  Observações / Instruções
                </label>
                <input
                  type="text"
                  placeholder="Ex: Deixar na portaria, campainha estragada..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewDeliveryOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingDelivery}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/15 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingDelivery ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Criar Entrega
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Confirmar Coleta ─── */}
      {isCollectOpen && selectedDeliveryToCollect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Confirmar Coleta de Carga
              </h2>
              <button
                onClick={() => { setIsCollectOpen(false); setSelectedDeliveryToCollect(null); }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-150 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleConfirmColeta} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Order Info Summary */}
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 space-y-2 text-xs">
                <p className="font-extrabold text-gray-800 flex items-center gap-1.5">
                  Pedido: {selectedDeliveryToCollect.numero}
                </p>
                <p className="text-gray-650 font-semibold">
                  <span className="text-gray-400">Paciente:</span> {selectedDeliveryToCollect.pacienteNome}
                </p>
                <p className="text-gray-650 font-semibold">
                  <span className="text-gray-400">Endereço:</span> {selectedDeliveryToCollect.endereco}
                </p>

                {/* Items List */}
                <div className="border-t border-emerald-100/50 pt-2 mt-2 space-y-1 text-[11px] font-semibold text-emerald-950/80">
                  {selectedDeliveryToCollect.itens?.map(it => (
                    <div key={it.id} className="flex justify-between">
                      <span className="truncate max-w-[200px]">{it.medicamentoNome}</span>
                      <span>{it.quantidade} un</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver input */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nome do Entregador / Motorista
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do entregador"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white shadow-sm"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                />
              </div>

              {/* Tracking input */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                  Código de Rastreamento (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: TRK-2026-94821"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 bg-white shadow-sm"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsCollectOpen(false); setSelectedDeliveryToCollect(null); }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={submittingColeta || !driverName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/15 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submittingColeta ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4" />
                      Iniciar Rota de Entrega
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
