import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Truck,
  Users,
  Loader2,
  PackageOpen,
  X,
  CheckCircle2,
  MapPin,
  Clock,
  Play,
  Check,
  FileText,
  Plus,
  Car,
  UserCheck,
  UserX,
  Radio,
  Navigation,
  RotateCw
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';
import { viagemService, ViagemTransporte } from '../../services/viagemService';
import SignatureCanvas from '../../components/SignatureCanvas';
import RelatorioViagemModal from '../../components/RelatorioViagemModal';
import BipagemTracker from '../../components/Bipagem/BipagemTracker';

interface EntregaItemMedicamento {
  id: string;
  medicamentoNome: string;
  quantidade: number;
  catmatCodigo?: string;
  loteSugerido?: string;
}

interface Entrega {
  id: string;
  numero: string;
  unidadeNome: string;
  itens: EntregaItemMedicamento[];
}

export function MinhasEntregas() {
  const [activeTab, setActiveTab] = useState<'viagens' | 'insumos'>('viagens');

  // === ESTADO DE VIAGENS DE PACIENTES ===
  const [viagens, setViagens] = useState<ViagemTransporte[]>([]);
  const [loadingViagens, setLoadingViagens] = useState(true);
  
  // GPS Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [gpsPontosCount, setGpsPontosCount] = useState(0);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const activeViagemIdRef = useRef<string | null>(null);

  // Modal de Conclusão com Assinatura Digital (Etapa 4: Chegada na Cidade)
  const [concluirModalViagem, setConcluirModalViagem] = useState<ViagemTransporte | null>(null);
  const [observacoesViagem, setObservacoesViagem] = useState('');
  const [assinaturaBase64, setAssinaturaBase64] = useState('');
  const [concluindoViagem, setConcluindoViagem] = useState(false);

  // Modal de Relatório Consolidado
  const [relatorioModalViagemId, setRelatorioModalViagemId] = useState<string | null>(null);

  // Modal de Nova Viagem Rápida
  const [showNovaViagemModal, setShowNovaViagemModal] = useState(false);
  const [novaViagemData, setNovaViagemData] = useState({
    veiculo: 'Van Master TFD - Municipal',
    placa: '',
    origem: 'UBS Central / Regulação',
    destino: '',
    dataViagem: new Date().toISOString().substring(0, 10),
    pacienteNome: '',
    pacienteSus: '',
    acompanhante: ''
  });
  const [criandoViagem, setCriandoViagem] = useState(false);

  // === ESTADO DE ENTREGAS DE INSUMOS ===
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loadingEntregas, setLoadingEntregas] = useState(false);
  const [showBipagem, setShowBipagem] = useState(false);
  const [bipagemPedido, setBipagemPedido] = useState<Entrega | null>(null);

  // Carregar Viagens de Pacientes
  const fetchViagens = useCallback(async () => {
    setLoadingViagens(true);
    try {
      const data = await viagemService.listar();
      setViagens(data || []);
      
      const emTransito = data.find(v => 
        v.status === 'SAIDA_CIDADE' || v.status === 'CHEGADA_DESTINO' || v.status === 'RETORNO_DESTINO'
      );

      if (emTransito) {
        iniciarGpsWatch(emTransito.id);
      }
    } catch (err) {
      console.error('Erro ao carregar viagens:', err);
      toast.error('Não foi possível carregar as viagens.');
    } finally {
      setLoadingViagens(false);
    }
  }, []);

  // Carregar Entregas de Insumos
  const fetchEntregas = useCallback(async () => {
    setLoadingEntregas(true);
    try {
      const res = await apiClient.get('/api/motorista/entregas');
      setEntregas(res.data.data || res.data || []);
    } catch (err) {
      console.error('Erro ao carregar entregas:', err);
    } finally {
      setLoadingEntregas(false);
    }
  }, []);

  useEffect(() => {
    fetchViagens();
    fetchEntregas();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [fetchViagens, fetchEntregas]);

  // Iniciar Rastreamento GPS
  const iniciarGpsWatch = (viagemId: string) => {
    if (!('geolocation' in navigator)) return;

    activeViagemIdRef.current = viagemId;
    setIsTracking(true);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    let lastSent = 0;
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });

        const now = Date.now();
        if (now - lastSent > 15000) {
          lastSent = now;
          try {
            const res = await viagemService.registrarPontoGps(viagemId, {
              lat: latitude,
              lng: longitude,
              precisao: accuracy,
              velocidade: speed || undefined
            });
            setGpsPontosCount(res.totalPontos);
          } catch (err) {}
        }
      },
      (err) => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const getCoords = async (): Promise<{ lat?: number; lng?: number }> => {
    if (currentCoords) return currentCoords;
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000, enableHighAccuracy: true });
        });
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const handleAvancarEtapa = async (
    viagem: ViagemTransporte,
    etapa: 'SAIDA_CIDADE' | 'CHEGADA_DESTINO' | 'RETORNO_DESTINO'
  ) => {
    try {
      if (etapa === 'SAIDA_CIDADE') {
        const pendentes = viagem.passageiros?.filter(p => p.status === 'PENDENTE') || [];
        if (pendentes.length > 0) {
          toast.warning(
            `Atenção: Por favor, marque quem embarcou e quem faltou antes de sair da cidade (${pendentes.length} pendente(s)).`,
            { duration: 5000 }
          );
          return;
        }
      }

      const coords = await getCoords();
      await viagemService.avancarEtapa(viagem.id, {
        etapa,
        lat: coords.lat,
        lng: coords.lng
      });

      if (etapa === 'SAIDA_CIDADE') {
        toast.success('Etapa 1: Saída da Cidade registrada!');
        iniciarGpsWatch(viagem.id);
      } else if (etapa === 'CHEGADA_DESTINO') {
        toast.success('Etapa 2: Chegada no Destino registrada!');
      } else if (etapa === 'RETORNO_DESTINO') {
        toast.success('Etapa 3: Início do Retorno registrado!');
      }

      fetchViagens();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao registrar etapa.');
    }
  };

  const handlePassageiroStatus = async (passageiroId: string, status: 'EMBARCOU' | 'NAO_COMPARECEU') => {
    try {
      await viagemService.atualizarStatusPassageiro(passageiroId, status);
      toast.success(status === 'EMBARCOU' ? 'Embarque confirmado!' : 'Marcado como ausente.');
      fetchViagens();
    } catch (err) {
      toast.error('Erro ao atualizar passageiro.');
    }
  };

  const handleConcluirEtapa4 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concluirModalViagem) return;

    if (!assinaturaBase64) {
      toast.error('Por favor, faça sua assinatura na tela.');
      return;
    }

    setConcluindoViagem(true);
    try {
      const coords = await getCoords();
      await viagemService.avancarEtapa(concluirModalViagem.id, {
        etapa: 'CONCLUIDA',
        lat: coords.lat,
        lng: coords.lng,
        assinaturaBase64,
        observacoes: observacoesViagem || undefined
      });

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);

      toast.success('Viagem finalizada com sucesso!');
      
      const viagemConcluidaId = concluirModalViagem.id;
      setConcluirModalViagem(null);
      setAssinaturaBase64('');
      setObservacoesViagem('');
      
      await fetchViagens();
      setRelatorioModalViagemId(viagemConcluidaId);
    } catch (err: any) {
      toast.error('Erro ao concluir viagem.');
    } finally {
      setConcluindoViagem(false);
    }
  };

  const handleCriarNovaViagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaViagemData.destino.trim() || !novaViagemData.pacienteNome.trim()) {
      toast.error('Informe o destino e o nome do paciente.');
      return;
    }

    setCriandoViagem(true);
    try {
      await viagemService.criar({
        veiculo: novaViagemData.veiculo,
        placa: novaViagemData.placa || undefined,
        origem: novaViagemData.origem,
        destino: novaViagemData.destino,
        dataViagem: novaViagemData.dataViagem,
        passageiros: [
          {
            nomePaciente: novaViagemData.pacienteNome,
            cartaoSus: novaViagemData.pacienteSus || undefined,
            acompanhante: novaViagemData.acompanhante || undefined
          }
        ]
      });

      toast.success('Viagem agendada!');
      setShowNovaViagemModal(false);
      fetchViagens();
    } catch (err: any) {
      toast.error('Erro ao agendar viagem.');
    } finally {
      setCriandoViagem(false);
    }
  };

  const formatHora = (dataStr?: string | null) => {
    if (!dataStr) return '--:--';
    return new Date(dataStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-5 pb-12">
      
      {/* Cabeçalho Oficial Laranja / Âmbar do Motorista */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Truck className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white">
                Painel do Motorista
              </h1>
              <p className="text-xs sm:text-sm text-amber-200 font-medium mt-0.5">
                Transporte Sanitário de Pacientes (TFD) &bull; 4 Etapas
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNovaViagemModal(true)}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-amber-950 rounded-2xl flex items-center gap-2 text-xs font-black shadow-md transition-all cursor-pointer"
            title="Adicionar Viagem"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">Nova Viagem</span>
          </button>
        </div>
      </div>

      {/* Tabs Laranja / Âmbar */}
      <div className="grid grid-cols-2 gap-2 bg-amber-100/60 p-1.5 rounded-2xl border border-amber-200">
        <button
          onClick={() => setActiveTab('viagens')}
          className={`py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'viagens'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-amber-900 hover:bg-amber-200/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Transporte de Pacientes
          {viagens.length > 0 && (
            <span className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-black ${
              activeTab === 'viagens' ? 'bg-white text-amber-800' : 'bg-amber-200 text-amber-900'
            }`}>
              {viagens.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('insumos')}
          className={`py-3 text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'insumos'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-amber-900 hover:bg-amber-200/50'
          }`}
        >
          <PackageOpen className="w-4 h-4" />
          Entregas de Insumos
        </button>
      </div>

      {/* Banner de Rastreamento GPS */}
      {isTracking && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs">
          <div className="w-4 h-4 bg-amber-600 rounded-full animate-ping shrink-0" />
          <div>
            <span className="text-sm font-black text-amber-950 block">
              Rastreamento GPS Ativo na Rota
            </span>
            <span className="text-xs font-semibold text-amber-800">
              {currentCoords ? `Sinal OK (${gpsPontosCount} pontos de trajeto registrados)` : 'Buscando satélites GPS...'}
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: VIAGENS DE PACIENTES */}
      {activeTab === 'viagens' && (
        <div className="space-y-4">
          {loadingViagens ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-amber-200">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
              <p className="text-sm font-bold text-amber-900">Carregando viagens...</p>
            </div>
          ) : viagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl border border-amber-200 text-center space-y-4">
              <Car className="w-14 h-14 text-amber-300" />
              <div>
                <h3 className="text-lg font-black text-gray-800">Nenhuma viagem no momento</h3>
                <p className="text-xs text-gray-500 mt-1">Toque no botão abaixo para agendar uma viagem.</p>
              </div>
              <button
                onClick={() => setShowNovaViagemModal(true)}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-base shadow-md cursor-pointer active:scale-98"
              >
                + Agendar Viagem
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {viagens.map((viagem) => {
                const isAgendada = viagem.status === 'AGENDADA';
                const isEtapa1 = viagem.status === 'SAIDA_CIDADE';
                const isEtapa2 = viagem.status === 'CHEGADA_DESTINO';
                const isEtapa3 = viagem.status === 'RETORNO_DESTINO';
                const isConcluida = viagem.status === 'CONCLUIDA';
                
                const totalPassageiros = viagem.passageiros?.length || 0;
                const embarcados = viagem.passageiros?.filter(p => p.status === 'EMBARCOU').length || 0;

                return (
                  <div
                    key={viagem.id}
                    className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm transition-all ${
                      isConcluida
                        ? 'border-gray-200 opacity-95'
                        : 'border-amber-400 ring-4 ring-amber-50'
                    }`}
                  >
                    <div className="p-5 sm:p-6 space-y-5">
                      
                      {/* Destino & Veículo (Texto Grande) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                            Destino da Viagem
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            isConcluida ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {isConcluida ? 'FINALIZADA' : 'EM ANDAMENTO'}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                          {viagem.destino}
                        </h2>
                        <p className="text-xs text-gray-600 font-medium pt-1">
                          Veículo: <strong className="text-gray-900">{viagem.veiculo}</strong> {viagem.placa ? `(${viagem.placa})` : ''}
                        </p>
                      </div>

                      {/* As 4 Etapas Visuais Grandes (Paleta Âmbar/Laranja) */}
                      <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wide block">
                          Etapas da Rota:
                        </span>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={`p-3 rounded-xl border-2 flex flex-col justify-between ${
                            viagem.saidaOrigemEm || isEtapa1 || isEtapa2 || isEtapa3 || isConcluida
                              ? 'bg-white border-amber-500 shadow-xs'
                              : 'bg-gray-100/70 border-gray-200 opacity-50'
                          }`}>
                            <span className="font-bold text-gray-700">1. Saída Cidade</span>
                            <span className="text-sm font-black text-amber-700 mt-1">
                              {viagem.saidaOrigemEm || isEtapa1 ? formatHora(viagem.saidaOrigemEm || viagem.iniciadaEm) : '--:--'}
                            </span>
                          </div>

                          <div className={`p-3 rounded-xl border-2 flex flex-col justify-between ${
                            viagem.chegadaDestinoEm || isEtapa2 || isEtapa3 || isConcluida
                              ? 'bg-white border-amber-500 shadow-xs'
                              : 'bg-gray-100/70 border-gray-200 opacity-50'
                          }`}>
                            <span className="font-bold text-gray-700">2. No Destino</span>
                            <span className="text-sm font-black text-amber-700 mt-1">
                              {viagem.chegadaDestinoEm ? formatHora(viagem.chegadaDestinoEm) : '--:--'}
                            </span>
                          </div>

                          <div className={`p-3 rounded-xl border-2 flex flex-col justify-between ${
                            viagem.saidaDestinoEm || isEtapa3 || isConcluida
                              ? 'bg-white border-amber-500 shadow-xs'
                              : 'bg-gray-100/70 border-gray-200 opacity-50'
                          }`}>
                            <span className="font-bold text-gray-700">3. Saída Destino</span>
                            <span className="text-sm font-black text-amber-700 mt-1">
                              {viagem.saidaDestinoEm ? formatHora(viagem.saidaDestinoEm) : '--:--'}
                            </span>
                          </div>

                          <div className={`p-3 rounded-xl border-2 flex flex-col justify-between ${
                            viagem.chegadaOrigemEm || isConcluida
                              ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                              : 'bg-gray-100/70 border-gray-200 opacity-50'
                          }`}>
                            <span className="font-bold text-gray-700">4. Na Cidade</span>
                            <span className="text-sm font-black text-emerald-800 mt-1">
                              {viagem.chegadaOrigemEm || isConcluida ? formatHora(viagem.chegadaOrigemEm || viagem.concluidaEm) : '--:--'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lista de Passageiros */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-gray-700 uppercase tracking-wide">
                            Lista de Passageiros ({embarcados}/{totalPassageiros} no carro)
                          </span>
                        </div>

                        {isAgendada && viagem.passageiros?.some(p => p.status === 'PENDENTE') && (
                          <div className="p-3.5 bg-amber-100 border-2 border-amber-300 rounded-2xl text-xs font-bold text-amber-950 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>Atenção: Toque em <strong>"Marcar Embarque"</strong> ou <strong>"Ausente"</strong> em cada paciente antes de sair da cidade.</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          {viagem.passageiros?.map((p) => {
                            const embarcou = p.status === 'EMBARCOU';
                            const ausente = p.status === 'NAO_COMPARECEU';

                            return (
                              <div
                                key={p.id}
                                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  embarcou
                                    ? 'bg-emerald-50 border-emerald-300'
                                    : ausente
                                    ? 'bg-rose-50 border-rose-200 opacity-70'
                                    : 'bg-amber-50/40 border-amber-200'
                                }`}
                              >
                                <div>
                                  <span className="text-base font-bold text-gray-900 block leading-tight">
                                    {p.nomePaciente}
                                  </span>
                                  {p.acompanhante && (
                                    <span className="text-xs text-gray-600 block mt-0.5">
                                      Acompanhante: {p.acompanhante}
                                    </span>
                                  )}
                                  {p.cartaoSus && (
                                    <span className="text-[11px] text-gray-500 font-mono block">
                                      SUS: {p.cartaoSus}
                                    </span>
                                  )}
                                </div>

                                {!isConcluida && (
                                  <div className="flex items-center gap-2 pt-1 sm:pt-0">
                                    <button
                                      type="button"
                                      onClick={() => handlePassageiroStatus(p.id, 'EMBARCOU')}
                                      className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        embarcou
                                          ? 'bg-emerald-600 text-white shadow-sm'
                                          : 'bg-white border-2 border-emerald-500 text-emerald-800 active:bg-emerald-100'
                                      }`}
                                    >
                                      <UserCheck className="w-4 h-4" />
                                      {embarcou ? 'Embarcou' : 'Marcar Embarque'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handlePassageiroStatus(p.id, 'NAO_COMPARECEU')}
                                      className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                        ausente
                                          ? 'bg-rose-600 text-white shadow-sm'
                                          : 'bg-white border border-gray-300 text-gray-600 active:bg-rose-50'
                                      }`}
                                      title="Não compareceu"
                                    >
                                      <UserX className="w-4 h-4" />
                                      {ausente ? 'Faltou' : 'Ausente'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* BOTÃO PRINCIPAL GIGANTE LARANJA / ÂMBAR */}
                      <div className="pt-2">
                        
                        {/* Passo 1 */}
                        {isAgendada && (
                          <button
                            onClick={() => handleAvancarEtapa(viagem, 'SAIDA_CIDADE')}
                            className="w-full py-4.5 px-6 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
                          >
                            <Play className="w-6 h-6 fill-white" />
                            1. REGISTRAR SAÍDA DA CIDADE
                          </button>
                        )}

                        {/* Passo 2 */}
                        {isEtapa1 && (
                          <button
                            onClick={() => handleAvancarEtapa(viagem, 'CHEGADA_DESTINO')}
                            className="w-full py-4.5 px-6 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
                          >
                            <MapPin className="w-6 h-6" />
                            2. CHEGUEI NO DESTINO (HOSPITAL)
                          </button>
                        )}

                        {/* Passo 3 */}
                        {isEtapa2 && (
                          <button
                            onClick={() => handleAvancarEtapa(viagem, 'RETORNO_DESTINO')}
                            className="w-full py-4.5 px-6 bg-amber-700 hover:bg-amber-800 active:scale-98 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-700/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
                          >
                            <RotateCw className="w-6 h-6" />
                            3. INICIAR RETORNO PARA CIDADE
                          </button>
                        )}

                        {/* Passo 4 */}
                        {isEtapa3 && (
                          <button
                            onClick={() => setConcluirModalViagem(viagem)}
                            className="w-full py-4.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer animate-pulse"
                          >
                            <Check className="w-6 h-6 stroke-[3]" />
                            4. CHEGUEI NA CIDADE (FINALIZAR)
                          </button>
                        )}

                        {/* Concluída */}
                        {isConcluida && (
                          <button
                            onClick={() => setRelatorioModalViagemId(viagem.id)}
                            className="w-full py-4 px-6 bg-amber-950 hover:bg-black active:scale-98 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <FileText className="w-5 h-5 text-amber-400" />
                            Ver Relatório Consolidado (PDF)
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INSUMOS */}
      {activeTab === 'insumos' && (
        <div className="space-y-3">
          {loadingEntregas ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : entregas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-amber-200 text-gray-500 text-sm">
              Nenhuma entrega de insumos em aberto.
            </div>
          ) : (
            <div className="space-y-3">
              {entregas.map((entrega) => (
                <div key={entrega.id} className="p-4 bg-white rounded-2xl border border-amber-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-800">Pedido #{entrega.numero}</span>
                    <p className="text-xs text-gray-500">Destino: {entrega.unidadeNome}</p>
                  </div>
                  <button
                    onClick={() => {
                      setBipagemPedido(entrega);
                      setShowBipagem(true);
                    }}
                    className="px-4 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl"
                  >
                    Bipar Itens
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL ETAPA 4: ASSINATURA DIGITAL NA TELA (MOBILE-FRIENDLY) */}
      {concluirModalViagem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  4. Finalizar Viagem
                </h3>
                <p className="text-xs text-gray-500">
                  Faça sua assinatura abaixo com o dedo para concluir:
                </p>
              </div>

              <button
                onClick={() => setConcluirModalViagem(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleConcluirEtapa4} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Assine com o dedo na tela *
                </label>
                <SignatureCanvas
                  height={190}
                  onSave={(base64) => setAssinaturaBase64(base64)}
                  onClear={() => setAssinaturaBase64('')}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Alguma observação? (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Viagem tranquila, todos os pacientes entregues..."
                  value={observacoesViagem}
                  onChange={(e) => setObservacoesViagem(e.target.value)}
                  className="w-full p-3 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConcluirModalViagem(null)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-sm cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={concluindoViagem || !assinaturaBase64}
                  className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {concluindoViagem ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Confirmar & Finalizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE NOVA VIAGEM RÁPIDA */}
      {showNovaViagemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-600" />
                Agendar Viagem
              </h3>
              <button
                onClick={() => setShowNovaViagemModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarNovaViagem} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Destino / Hospital *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hospital Regional / Cacoal"
                  value={novaViagemData.destino}
                  onChange={(e) => setNovaViagemData({ ...novaViagemData, destino: e.target.value })}
                  className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome do Paciente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria das Graças"
                  value={novaViagemData.pacienteNome}
                  onChange={(e) => setNovaViagemData({ ...novaViagemData, pacienteNome: e.target.value })}
                  className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Cartão SUS</label>
                  <input
                    type="text"
                    placeholder="7000..."
                    value={novaViagemData.pacienteSus}
                    onChange={(e) => setNovaViagemData({ ...novaViagemData, pacienteSus: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Acompanhante</label>
                  <input
                    type="text"
                    placeholder="Ex: Filho"
                    value={novaViagemData.acompanhante}
                    onChange={(e) => setNovaViagemData({ ...novaViagemData, acompanhante: e.target.value })}
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovaViagemModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criandoViagem}
                  className="flex-2 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {criandoViagem && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE RELATÓRIO CONSOLIDADO */}
      {relatorioModalViagemId && (
        <RelatorioViagemModal
          viagemId={relatorioModalViagemId}
          onClose={() => setRelatorioModalViagemId(null)}
        />
      )}

      {/* BIPAGEM MODAL */}
      {showBipagem && bipagemPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Bipagem de Itens #{bipagemPedido.numero}</h3>
              <button onClick={() => setShowBipagem(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <BipagemTracker
              items={bipagemPedido.itens.map(i => ({
                id: i.id,
                nome: i.medicamentoNome,
                quantidade: i.quantidade,
                codigo: i.catmatCodigo || i.id,
                lote: i.loteSugerido
              }))}
              pedidoNumero={bipagemPedido.numero}
              tipo="ENTREGA"
              onCancel={() => setShowBipagem(false)}
              onComplete={() => {
                setShowBipagem(false);
                toast.success('Bipagem concluída!');
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default MinhasEntregas;
