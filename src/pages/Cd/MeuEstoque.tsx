import { useState, useEffect, Fragment } from 'react';
import { Package, Search, ChevronDown, ChevronRight, Download, RefreshCw, AlertCircle, ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Edit2, Check, X } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import { atualizarEstoqueMinimo } from '../../services/cdService';

interface LoteDetail {
  id: string;
  medicamentoNome?: string;
  estoqueMinimo?: number;
  numeroLote: string;
  dataValidade: string;
  quantidadeAtual: number;
  status: string;
}

interface MedicamentoGrupo {
  id: string;
  medicamentoNome: string;
  catmatCodigo: string | null;
  minimo: number;
  consumoDiario: number;
  lotes: LoteDetail[];
}



export function MeuEstoque() {
  const { user } = useAuth();
  const [dbLotes, setDbLotes] = useState<LoteDetail[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedMed = searchParams.get('medicamento');
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (selectedMed) {
      const fetchDetails = async () => {
        try {
          setLoadingDetails(true);
          const response = await apiClient.get('/api/cd/estoque/detalhes', {
            params: { nome: selectedMed }
          });
          setDetails(response.data);
        } catch (err: any) {
          console.error('Erro ao buscar detalhes do medicamento:', err);
          setDetails(null);
        } finally {
          setLoadingDetails(false);
        }
      };
      void fetchDetails();
    } else {
      setDetails(null);
    }
  }, [selectedMed]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Filters state
  const [busca, setBusca] = useState('');
  const [filialSelecionada, setFilialSelecionada] = useState('todas');
  const [activeTab, setActiveTab] = useState<'todos' | 'critico' | 'vencimento'>('todos');
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // Editing estoque minimo state
  const [editingMedName, setEditingMedName] = useState<string | null>(null);
  const [editingMinValStr, setEditingMinValStr] = useState<string>('0');
  const [savingMinimo, setSavingMinimo] = useState(false);

  const handleSaveMinimo = async (item: MedicamentoGrupo) => {
    try {
      setSavingMinimo(true);
      setErrorMsg(null);
      const parsedVal = parseInt(editingMinValStr, 10) || 0;
      await atualizarEstoqueMinimo({
        medicamentoNome: item.medicamentoNome,
        catmatCodigo: item.catmatCodigo,
        quantidadeMinima: parsedVal
      });
      
      // Update local state lotes so UI reflects change immediately
      setDbLotes(prev => prev.map(l => {
        if (l.medicamentoNome === item.medicamentoNome) {
          return { ...l, estoqueMinimo: parsedVal };
        }
        return l;
      }));

      setEditingMedName(null);
    } catch (err: any) {
      console.error('Erro ao salvar estoque mínimo:', err);
      setErrorMsg(err.response?.data?.erro || 'Não foi possível salvar o estoque mínimo.');
    } finally {
      setSavingMinimo(false);
    }
  };

  const fetchEstoque = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await apiClient.get('/api/cd/estoque', {
        params: { limit: 100 }
      });
      const data = response.data?.dados || response.data || [];
      setDbLotes(data);
    } catch (err: any) {
      console.error('Erro ao buscar estoque:', err);
      setErrorMsg('Não foi possível carregar os lotes em tempo real do banco.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEstoque();
  }, []);

  // Grouping process
  const getMergedData = (): MedicamentoGrupo[] => {
    // Group DB lotes by medicine name
    const groupedDb: { [key: string]: MedicamentoGrupo } = {};
    
    dbLotes.forEach((lote: any) => {
      const nome = lote.medicamentoNome;
      const catmat = lote.catmatCodigo;
      
      // Use values from backend if present
      const minimo = typeof lote.estoqueMinimo === 'number' ? lote.estoqueMinimo : 0;
      const consumoDiario = lote.consumoDiario || 5;
      
      if (!groupedDb[nome]) {
        groupedDb[nome] = {
          id: `db-${nome}-${catmat || ''}`,
          medicamentoNome: nome,
          catmatCodigo: catmat,
          minimo,
          consumoDiario,
          lotes: []
        };
      }
      
      groupedDb[nome].lotes.push({
        id: lote.id,
        numeroLote: lote.numeroLote,
        dataValidade: lote.dataValidade,
        quantidadeAtual: lote.quantidadeAtual,
        status: lote.status
      });
    });

    return Object.values(groupedDb);
  };

  const allItems = getMergedData();

  // Helper calculation for each grouped medication
  const getGroupMetrics = (item: MedicamentoGrupo) => {
    const qtdAtual = item.lotes.reduce((sum, l) => sum + l.quantidadeAtual, 0);
    const earliestValidade = item.lotes.length > 0
      ? [...item.lotes].sort((a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime())[0].dataValidade
      : '';
      
    const diasCob = Math.round(qtdAtual / item.consumoDiario);
    
    const recallLotes = item.lotes.filter(l => l.status === 'BLOQUEADO_RECALL' || l.status === 'RECALL');
    const hasRecall = recallLotes.length > 0;
    const allRecall = item.lotes.length > 0 && recallLotes.length === item.lotes.length;
    
    let status: 'Normal' | 'Atenção' | 'Crítico' = 'Normal';
    if (allRecall) {
      status = 'Crítico';
    } else if (qtdAtual < item.minimo || diasCob <= 5) {
      status = 'Crítico';
    } else if (diasCob <= 20) {
      status = 'Atenção';
    }

    const abaixoDoMinimo = item.minimo > 0 && qtdAtual < item.minimo;

    return { qtdAtual, earliestValidade, diasCob, status, abaixoDoMinimo, hasRecall, allRecall, recallLotesCount: recallLotes.length };
  };

  // Apply Search and Status Tab Filters
  const filteredItems = allItems.filter(item => {
    // Search filter
    const matchesSearch = busca.trim() === '' || 
      item.medicamentoNome.toLowerCase().includes(busca.toLowerCase()) ||
      (item.catmatCodigo && item.catmatCodigo.toLowerCase().includes(busca.toLowerCase())) ||
      item.lotes.some(l => l.numeroLote.toLowerCase().includes(busca.toLowerCase()));
      
    if (!matchesSearch) return false;

    const { status } = getGroupMetrics(item);

    // Tab filter
    if (activeTab === 'critico') {
      return status === 'Crítico';
    }
    
    if (activeTab === 'vencimento') {
      const today = new Date();
      const fortyFiveDaysLater = new Date();
      fortyFiveDaysLater.setDate(today.getDate() + 45);

      return item.lotes.some((l: LoteDetail) => {
        const valDate = new Date(l.dataValidade);
        return valDate >= today && valDate <= fortyFiveDaysLater;
      });
    }

    return true;
  });

  // Calculate metrics for Cards
  const totalMedications = allItems.length;
  const normalCount = allItems.filter(item => {
    const m = getGroupMetrics(item);
    return m.status === 'Normal' && !m.hasRecall;
  }).length;
  const atencaoCount = allItems.filter(item => {
    const m = getGroupMetrics(item);
    return m.status === 'Atenção' && !m.hasRecall;
  }).length;
  const criticoCount = allItems.filter(item => getGroupMetrics(item).status === 'Crítico').length;
  const recallCount = allItems.filter(item => getGroupMetrics(item).hasRecall).length;

  // Counts for tabs
  const tabTodosCount = allItems.length;
  const tabCriticoCount = allItems.filter(item => getGroupMetrics(item).status === 'Crítico').length;
  
  const tabVencimentoCount = allItems.filter(item => {
    const today = new Date();
    const fortyFiveDaysLater = new Date();
    fortyFiveDaysLater.setDate(today.getDate() + 45);
    return item.lotes.some((l: LoteDetail) => {
      const valDate = new Date(l.dataValidade);
      return valDate >= today && valDate <= fortyFiveDaysLater;
    });
  }).length;

  const toggleExpandRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const handleExport = () => {
    // Generate simple CSV
    let csvContent = 'data:text/csv;charset=utf-8,Medicamento,CATMAT,Lote,Validade,Qtd Atual,Est Minimo,Status\n';
    allItems.forEach(item => {
      const metrics = getGroupMetrics(item);
      item.lotes.forEach(l => {
        csvContent += `"${item.medicamentoNome}","${item.catmatCodigo || ''}","${l.numeroLote}","${formatDate(l.dataValidade)}",${l.quantidadeAtual},${item.minimo},"${metrics.status}"\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Estoque_CD_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedMed) {
    if (loadingDetails) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-505 font-semibold">Carregando detalhes do medicamento...</p>
        </div>
      );
    }

    if (!details) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm text-gray-550 font-semibold">Não foi possível carregar os detalhes de "{selectedMed}".</p>
          <button
            onClick={() => setSearchParams({})}
            className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Voltar ao Estoque
          </button>
        </div>
      );
    }

    const { cards, lotesReservas, graficoConsumo, historicoMovimentacoes } = details;
    const { estoqueTotal, reservado, disponivel, consumoMedio, leadTimeMedio } = cards;
    
    const diasCobertura = Math.max(0, Math.round(disponivel / consumoMedio));
    const isRupturaRisco = diasCobertura < leadTimeMedio;

    let statusBadge = 'Normal';
    if (diasCobertura <= 5) {
      statusBadge = 'Crítico';
    } else if (diasCobertura <= 20) {
      statusBadge = 'Atenção';
    }

    const getSpecs = (name: string) => {
      if (name.toLowerCase().includes('insulina')) {
        return { mainName: 'Insulina NPH', specs: '100UI/mL Frasco 10mL' };
      }
      if (name.toLowerCase().includes('amoxicilina')) {
        return { mainName: 'Amoxicilina 500mg', specs: 'Cápsula' };
      }
      if (name.toLowerCase().includes('paracetamol')) {
        return { mainName: 'Paracetamol 500mg', specs: 'Comprimido' };
      }
      const parts = name.split(' ');
      return { mainName: parts.slice(0, 2).join(' '), specs: parts.slice(2).join(' ') || 'Concentração/Apresentação' };
    };

    const specsInfo = getSpecs(selectedMed);

    const getPriorityClass = (prioridade: string) => {
      if (prioridade.startsWith('1º')) {
        return 'bg-blue-600 text-white border-blue-600';
      }
      if (prioridade.startsWith('2º')) {
        return 'bg-blue-50 text-blue-700 border-blue-100';
      }
      return 'bg-gray-100 text-gray-650 border-gray-200';
    };

    return (
      <div className="space-y-6 pb-8 animate-in fade-in duration-300">
        {/* Voltar button & Title header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 bg-transparent border-0 cursor-pointer transition-colors w-fit p-0 outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Estoque
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {specsInfo.mainName}
              </h1>
              <p className="text-sm text-gray-550 font-semibold mt-1">
                {specsInfo.specs}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 font-semibold">
                {lotesReservas.length} lote(s) em estoque
              </p>
            </div>
            
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border select-none ${
              statusBadge === 'Crítico'
                ? 'bg-red-50 text-red-650 border-red-150 animate-pulse'
                : statusBadge === 'Atenção'
                ? 'bg-amber-50 text-amber-700 border-amber-150'
                : 'bg-emerald-50 text-emerald-700 border-emerald-150'
            }`}>
              {statusBadge}
            </span>
          </div>
        </div>

        {/* Rupture Risk Banner */}
        {isRupturaRisco && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl border border-red-150 animate-in slide-in-from-top duration-300">
            <AlertTriangle className="h-5 w-5 text-red-650 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-black text-red-650 flex items-center gap-1.5">
                Risco de ruptura em {diasCobertura} dias
              </h4>
              <p className="text-xs text-red-800 font-semibold mt-1">
                Ação imediata recomendada. Lead time do fornecedor ({leadTimeMedio} dias) é maior que a cobertura atual.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-400">Estoque Total</span>
            <span className={`text-3xl font-black ${isRupturaRisco ? 'text-red-650' : 'text-gray-900'}`}>
              {estoqueTotal} un
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-400">Reservado (FEFO)</span>
            <span className="text-3xl font-black text-amber-600">
              {reservado} un
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-400">Disponível p/ Reserva</span>
            <span className="text-3xl font-black text-blue-900">
              {disponivel} un
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-400">Consumo Médio</span>
            <span className="text-3xl font-black text-gray-900">
              {consumoMedio} un/dia
            </span>
            <span className="text-[10px] text-gray-400 font-bold -mt-1">Últimos 30 dias</span>
          </div>

          <div className={`p-6 rounded-2xl border shadow-xs flex flex-col gap-2 ${
            isRupturaRisco ? 'bg-red-50/10 border-red-150' : 'bg-white border-gray-200/80'
          }`}>
            <span className="text-xs font-bold text-gray-400">Lead Time Médio</span>
            <span className={`text-3xl font-black ${isRupturaRisco ? 'text-red-650' : 'text-gray-900'}`}>
              {leadTimeMedio} dias
            </span>
            <span className="text-[10px] text-gray-400 font-bold -mt-1">Tempo de reposição</span>
          </div>
        </div>

        {/* FEFO Lot Reservations Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-150">
            <h3 className="text-sm font-bold text-gray-900">Reservas por Lote (FEFO - First Expired, First Out)</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Lotes ordenados por validade - prioridade automática para entrega</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Lote</th>
                  <th className="px-6 py-3.5">Validade</th>
                  <th className="px-6 py-3.5 text-right">Estoque</th>
                  <th className="px-6 py-3.5 text-right">Reservado</th>
                  <th className="px-6 py-3.5 text-right">Disponível</th>
                  <th className="px-6 py-3.5 text-center">Prioridade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-750">
                {lotesReservas.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{r.lote}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(r.validade).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{r.estoque}</td>
                    <td className="px-6 py-4 text-right text-amber-600 font-bold">{r.reservado}</td>
                    <td className="px-6 py-4 text-right text-blue-900 font-extrabold">{r.disponivel}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border select-none ${getPriorityClass(r.prioridade)}`}>
                        {r.prioridade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50/50 border-t border-gray-150">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs font-semibold text-blue-750">
              <AlertCircle className="h-4.5 w-4.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Regra FEFO:</strong> O sistema reserva automaticamente do lote com validade mais próxima para minimizar perdas por vencimento. As transferências sempre priorizam os lotes que vencem primeiro.
              </span>
            </div>
          </div>
        </div>

        {/* Consumo Graph & Movimentações List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Chart Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs md:col-span-7 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Gráfico de Consumo</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Tendência dos últimos 7 meses</p>
            </div>
            
            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graficoConsumo} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#2563eb" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorConsumo)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs md:col-span-5 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Histórico de Movimentações</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Rastreamento completo de entradas e saídas</p>
            </div>

            <div className="flex-1 max-h-[260px] overflow-y-auto pr-1 space-y-4">
              {historicoMovimentacoes.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs font-semibold">
                  Nenhuma movimentação registrada para este medicamento.
                </div>
              ) : (
                historicoMovimentacoes.map((mov: any) => {
                  const isEntrada = mov.tipo === 'Entrada';
                  return (
                    <div key={mov.id} className="flex items-start justify-between gap-3 text-xs border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex gap-3 items-start">
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isEntrada ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        }`}>
                          {isEntrada ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </span>
                        
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-gray-900">{mov.origemDestino}</span>
                          <span className="text-gray-400 text-[10px] font-bold">
                            {new Date(mov.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          <span className="inline-flex w-fit px-1.5 py-0.2 mt-1 rounded bg-gray-50 border border-gray-200 text-gray-500 font-bold text-[9px]">
                            {mov.lote}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col gap-0.5">
                        <span className={`font-black text-sm ${isEntrada ? 'text-emerald-600' : 'text-red-650'}`}>
                          {isEntrada ? `+${mov.quantidade}` : mov.quantidade} un
                        </span>
                        <span className="text-[10px] text-gray-450 font-bold">
                          Saldo: {mov.saldo}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getPageHeader = () => {
    if (user?.perfil === 'FARMACIA') {
      return {
        title: 'Estoque da Farmácia',
        subtitle: `Medicamentos disponíveis na unidade - ${user.unidadeNome || 'Farmácia Central'}`
      };
    }
    if (user?.perfil === 'POSTO_SAUDE') {
      return {
        title: 'Estoque do Posto de Saúde',
        subtitle: `Medicamentos disponíveis na unidade - ${user.unidadeNome || 'UBS Bairro Norte'}`
      };
    }
    return {
      title: 'Gestão de Estoque',
      subtitle: 'Visão global do Centro de Distribuição'
    };
  };

  const headerInfo = getPageHeader();

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {headerInfo.title}
          </h1>
          <p className="text-sm text-gray-500 font-medium">{headerInfo.subtitle}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={fetchEstoque} 
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-100 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Control / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative w-full md:max-w-xl">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por medicamento ou princípio ativo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder:text-gray-450"
          />
        </div>
        <select
          value={filialSelecionada}
          onChange={(e) => setFilialSelecionada(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 block px-4 py-2.5 outline-none font-bold cursor-pointer"
        >
          <option value="todas">Todas as Filiais</option>
          <option value="principal">CD Principal</option>
          <option value="norte">Filial Norte</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-150 gap-2">
        <button
          onClick={() => setActiveTab('todos')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 outline-none cursor-pointer ${
            activeTab === 'todos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Todos <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-extrabold text-[10px]">{tabTodosCount}</span>
        </button>
        <button
          onClick={() => setActiveTab('critico')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 outline-none cursor-pointer ${
            activeTab === 'critico'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Status: Crítico <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-extrabold text-[10px]">{tabCriticoCount}</span>
        </button>
        <button
          onClick={() => setActiveTab('vencimento')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 outline-none cursor-pointer ${
            activeTab === 'vencimento'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Próximos ao Vencimento <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-extrabold text-[10px]">{tabVencimentoCount}</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-400">Total de Itens</span>
          {loading ? (
            <div className="h-9 w-16 bg-gray-200 rounded-lg animate-pulse my-0.5" />
          ) : (
            <span className="text-3xl font-black text-gray-900">{totalMedications}</span>
          )}
        </div>

        {/* Normal Card */}
        <div className="bg-emerald-50/20 p-6 rounded-2xl border border-emerald-100 shadow-xs flex flex-col gap-2">
          <span className="text-xs font-bold text-emerald-800">Status Normal</span>
          {loading ? (
            <div className="h-9 w-16 bg-emerald-100/60 rounded-lg animate-pulse my-0.5" />
          ) : (
            <span className="text-3xl font-black text-emerald-600">{normalCount}</span>
          )}
        </div>

        {/* Atencao Card */}
        <div className="bg-amber-50/20 p-6 rounded-2xl border border-amber-150 shadow-xs flex flex-col gap-2">
          <span className="text-xs font-bold text-amber-800">Em Atenção</span>
          {loading ? (
            <div className="h-9 w-16 bg-amber-100/60 rounded-lg animate-pulse my-0.5" />
          ) : (
            <span className="text-3xl font-black text-amber-600">{atencaoCount}</span>
          )}
        </div>

        {/* Critico Card */}
        <div className="bg-red-50/20 p-6 rounded-2xl border border-red-150 shadow-xs flex flex-col gap-2">
          <span className="text-xs font-bold text-red-800">Crítico (Ruptura)</span>
          {loading ? (
            <div className="h-9 w-16 bg-red-100/60 rounded-lg animate-pulse my-0.5" />
          ) : (
            <span className="text-3xl font-black text-red-650">{criticoCount}</span>
          )}
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 bg-red-55 border-l-4 border-red-500 rounded-r-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-650 flex-shrink-0" />
          <span className="text-xs font-semibold text-red-800">{errorMsg}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-150">
            <thead className="bg-gray-50 text-left text-xs font-bold text-gray-400 uppercase">
              <tr>
                <th className="w-12 px-4 py-4 text-center"></th>
                <th className="px-4 py-4">Medicamento</th>
                <th className="px-4 py-4">Lote</th>
                <th className="px-4 py-4">Validade</th>
                <th className="px-4 py-4 text-right">Qtd. Atual</th>
                <th className="px-4 py-4 text-right">Est. Mínimo</th>
                <th className="px-4 py-4 text-center">Dias Cob.</th>
                <th className="px-4 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-700">
              {loading ? (
                // Table Skeleton Lines (5 mock rows)
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-4 py-4 text-center">
                      <div className="h-4 w-4 bg-gray-200 rounded mx-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-12 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-12 bg-gray-200 rounded ml-auto" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-5 w-10 bg-gray-200 rounded-lg mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-5 w-20 bg-gray-200 rounded-full mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-450">
                    Nenhum medicamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const { qtdAtual, earliestValidade, diasCob, status, abaixoDoMinimo, hasRecall, allRecall, recallLotesCount } = getGroupMetrics(item);
                  const isExpanded = !!expandedRows[item.id];
                  const hasMultipleLotes = item.lotes.length > 1;
                  const isEditingThis = editingMedName === item.medicamentoNome;

                  return (
                    <Fragment key={item.id}>
                      {/* Main Grouped Row */}
                      <tr className={`transition-colors border-b border-gray-100 ${
                        hasRecall
                          ? 'bg-red-50/60 hover:bg-red-100/50 border-l-4 border-l-red-600'
                          : abaixoDoMinimo 
                          ? 'bg-red-50/40 hover:bg-red-50/60 border-l-4 border-l-red-500' 
                          : 'hover:bg-gray-55/30'
                      }`}>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleExpandRow(item.id)}
                            className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center border-0 bg-transparent cursor-pointer text-gray-400"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4.5 w-4.5 transition-transform" />
                            ) : (
                              <ChevronRight className="h-4.5 w-4.5 transition-transform" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setSearchParams({ medicamento: item.medicamentoNome })}
                              className="text-left font-bold text-blue-650 hover:text-blue-800 hover:underline text-sm bg-transparent border-0 p-0 cursor-pointer"
                            >
                              {item.medicamentoNome}
                            </button>
                            {hasMultipleLotes && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-650 border border-gray-200 shadow-3xs">
                                {item.lotes.length} lotes
                              </span>
                            )}
                            {hasRecall && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white shadow-xs animate-pulse">
                                <AlertCircle className="h-3 w-3 text-white" />
                                {recallLotesCount === 1 ? '1 Lote sob Recall' : `${recallLotesCount} Lotes sob Recall`}
                              </span>
                            )}
                            {abaixoDoMinimo && !hasRecall && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                                <AlertTriangle className="h-3 w-3 text-red-600" />
                                Abaixo do Mínimo
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Lote */}
                        <td className="px-4 py-4 text-gray-400">—</td>
                        {/* Validade */}
                        <td className="px-4 py-4">{formatDate(earliestValidade)}</td>
                        {/* Qtd Atual */}
                        <td className={`px-4 py-4 text-right font-bold text-sm ${hasRecall || abaixoDoMinimo ? 'text-red-700 font-extrabold' : 'text-gray-900'}`}>
                          {qtdAtual.toLocaleString('pt-BR')} un
                        </td>
                        {/* Est Minimo (Editável) */}
                        <td className="px-4 py-4 text-right">
                          {isEditingThis ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoFocus
                                onFocus={(e) => e.target.select()}
                                value={editingMinValStr}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                                  setEditingMinValStr(val);
                                }}
                                className="w-20 px-2 py-1 text-xs border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-bold text-right"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveMinimo(item)}
                                disabled={savingMinimo}
                                className="p-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded cursor-pointer border-0 disabled:opacity-50"
                                title="Salvar"
                              >
                                {savingMinimo ? (
                                  <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingMedName(null)}
                                className="p-1 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer border-0"
                                title="Cancelar"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-gray-900 font-bold">{item.minimo.toLocaleString('pt-BR')} un</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMedName(item.medicamentoNome);
                                  setEditingMinValStr(String(item.minimo));
                                }}
                                className="inline-flex items-center justify-center p-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md cursor-pointer border border-blue-200 transition-all shadow-3xs"
                                title="Editar Estoque Mínimo"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                        {/* Dias Cob */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                            hasRecall || diasCob <= 5 || abaixoDoMinimo
                              ? 'bg-red-50 text-red-650 border border-red-150 animate-pulse'
                              : diasCob <= 20
                              ? 'bg-amber-50 text-amber-700 border border-amber-150'
                              : 'bg-gray-50 text-gray-650 border border-gray-200'
                          }`}>
                            {diasCob}d
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border select-none ${
                            hasRecall
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : status === 'Normal' && !abaixoDoMinimo
                              ? 'bg-emerald-50/20 text-emerald-700 border-emerald-100'
                              : status === 'Atenção' && !abaixoDoMinimo
                              ? 'bg-amber-50/25 text-amber-700 border-amber-200'
                              : 'bg-red-50/20 text-red-650 border-red-100'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              hasRecall ? 'bg-red-600' : status === 'Normal' && !abaixoDoMinimo ? 'bg-emerald-500' : status === 'Atenção' && !abaixoDoMinimo ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            {hasRecall ? 'Bloqueado (Recall)' : abaixoDoMinimo ? 'Estoque Crítico' : status}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Lots Detail */}
                      {isExpanded && item.lotes.map(l => {
                        const isLoteRecall = l.status === 'BLOQUEADO_RECALL' || l.status === 'RECALL';
                        return (
                          <tr key={l.id} className={`border-b border-gray-100/60 font-medium ${
                            isLoteRecall ? 'bg-red-100/30' : 'bg-gray-50/40'
                          }`}>
                            <td></td>
                            <td className="px-8 py-3 text-gray-500 flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${isLoteRecall ? 'bg-red-600' : 'bg-blue-500'}`} />
                              Lote físico individual
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-900">{l.numeroLote}</td>
                            <td className="px-4 py-3 text-gray-500">{new Date(l.dataValidade).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-3 text-right font-extrabold text-gray-800">{l.quantidadeAtual}</td>
                            <td className="px-4 py-3 text-right text-gray-400">—</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[10px] text-gray-450 font-bold bg-white border border-gray-150 px-1.5 py-0.5 rounded">
                                {Math.round(l.quantidadeAtual / item.consumoDiario)}d
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black ${
                                isLoteRecall
                                  ? 'bg-red-600 text-white shadow-2xs'
                                  : l.status === 'VENCIDO'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {isLoteRecall && <AlertCircle className="h-3 w-3 text-white" />}
                                {isLoteRecall ? 'BLOQUEADO — RECALL' : l.status === 'VENCIDO' ? 'Vencido' : 'Disponível'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

