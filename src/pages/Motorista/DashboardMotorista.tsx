import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Home, ClipboardList, Truck, CheckCircle2, BarChart3, RefreshCw, Loader2, PackageOpen, ArrowRight } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface DashboardStats {
  coletasPendentes: number;
  emTransito: number;
  concluidasHoje: number;
  totalMes: number;
}

interface ColetaItem {
  id: string;
  numero: string;
  unidadeNome: string;
  totalItens: number;
  urgencia: 'ALTA' | 'MEDIA' | 'BAIXA';
  criadoEm: string;
}

const urgencyBadge = (urgencia: string) => {
  switch (urgencia) {
    case 'ALTA':
      return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Alta</span>;
    case 'MEDIA':
      return <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Média</span>;
    case 'BAIXA':
      return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Baixa</span>;
    default:
      return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{urgencia}</span>;
  }
};

export function DashboardMotorista() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [coletas, setColetas] = useState<ColetaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, coletasRes] = await Promise.all([
        apiClient.get('/api/motorista/dashboard'),
        apiClient.get('/api/motorista/coletas', { params: { page: 1, limit: 5 } }),
      ]);
      setStats(statsRes.data);
      const coletasData = coletasRes.data;
      const coletasArray = Array.isArray(coletasData) ? coletasData : (Array.isArray(coletasData?.dados) ? coletasData.dados : (Array.isArray(coletasData?.data) ? coletasData.data : []));
      setColetas(coletasArray);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpiCards = [
    {
      label: 'Coletas Pendentes',
      value: stats?.coletasPendentes ?? 0,
      icon: ClipboardList,
      color: 'text-amber-500',
      bgIcon: 'bg-amber-50',
    },
    {
      label: 'Em Trânsito',
      value: stats?.emTransito ?? 0,
      icon: Truck,
      color: 'text-blue-500',
      bgIcon: 'bg-blue-50',
    },
    {
      label: 'Concluídas Hoje',
      value: stats?.concluidasHoje ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgIcon: 'bg-emerald-50',
    },
    {
      label: 'Total do Mês',
      value: stats?.totalMes ?? 0,
      icon: BarChart3,
      color: 'text-purple-500',
      bgIcon: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Home className="h-6 w-6 text-amber-600" />
            Dashboard do Motorista
          </h1>
          <p className="mt-1 text-sm text-gray-500">Acompanhe suas coletas, entregas e métricas do dia.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
              <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${kpi.bgIcon} shrink-0`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                  <span className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Próximas Coletas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-500" />
            Próximas Coletas
          </h3>
          <Link
            to="/motorista/coletas"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : coletas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <PackageOpen className="h-12 w-12 mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium">Nenhuma coleta pendente no momento</p>
            <p className="text-xs mt-1">Novas coletas aparecerão aqui automaticamente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {coletas.map((coleta) => (
              <div key={coleta.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-50 shrink-0">
                    <ClipboardList className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{coleta.unidadeNome}</p>
                      {urgencyBadge(coleta.urgencia)}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {coleta.totalItens} {coleta.totalItens === 1 ? 'item' : 'itens'} · {new Date(coleta.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Link
                  to="/motorista/coletas"
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap transition-colors"
                >
                  Ver detalhes
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
