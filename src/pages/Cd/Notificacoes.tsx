import { useState } from 'react';
import { Bell, CheckSquare, AlertTriangle, AlertCircle, Info, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';

interface AlertaCD {
  id: string;
  tipo: 'ESTOQUE_MINIMO' | 'DIVERGENCIA_NF' | 'RECALL' | string;
  referenciaId: string;
  referenciaTipo: string;
  titulo: string;
  descricao: string;
  status: 'NOVO' | 'LIDO' | 'RESOLVIDO';
  criadoEm: string;
  lidoEm?: string | null;
}

export function Notificacoes() {
  const queryClient = useQueryClient();
  const [markingAll, setMarkingAll] = useState(false);

  const { data: alertas = [], isLoading, isRefetching, refetch } = useQuery<AlertaCD[]>({
    queryKey: ['cdAlertas'],
    queryFn: async () => {
      const response = await apiClient.get('/api/cd/alertas');
      return response.data?.dados || response.data || [];
    },
    refetchInterval: 15000 // Refetch automatic every 15s for live updates
  });

  const handleMarcarLido = async (id: string) => {
    try {
      await apiClient.patch(`/api/cd/alertas/${id}/lido`);
      queryClient.invalidateQueries({ queryKey: ['cdAlertas'] });
      queryClient.invalidateQueries({ queryKey: ['cdDashboardStats'] });
    } catch (err) {
      console.error('Erro ao marcar alerta como lido:', err);
    }
  };

  const handleMarcarTodasLidas = async () => {
    const naoLidos = alertas.filter(a => a.status === 'NOVO');
    if (naoLidos.length === 0) return;

    try {
      setMarkingAll(true);
      await Promise.all(naoLidos.map(a => apiClient.patch(`/api/cd/alertas/${a.id}/lido`)));
      queryClient.invalidateQueries({ queryKey: ['cdAlertas'] });
      queryClient.invalidateQueries({ queryKey: ['cdDashboardStats'] });
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getNaoLidosCount = () => alertas.filter(a => a.status === 'NOVO').length;

  const renderIcon = (tipo: string) => {
    switch (tipo) {
      case 'ESTOQUE_MINIMO':
        return <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />;
      case 'RECALL':
        return <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />;
      case 'DIVERGENCIA_NF':
        return <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />;
    }
  };

  const formatTime = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Central de Notificações
            {getNaoLidosCount() > 0 && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500 text-white">
                {getNaoLidosCount()} novas
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Alertas urgentes do Centro de Distribuição e mensagens do sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="p-2 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-100 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            title="Atualizar Notificações"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleMarcarTodasLidas}
            disabled={markingAll || getNaoLidosCount() === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-0 cursor-pointer"
          >
            <CheckSquare className="h-4 w-4 text-emerald-600" />
            {markingAll ? 'Marcando...' : 'Marcar todas como lidas'}
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-150 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <RefreshCw className="h-7 w-7 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Carregando notificações...</p>
          </div>
        ) : alertas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-sm font-bold text-gray-700">Tudo em dia!</p>
            <p className="text-xs text-gray-400">Nenhum alerta pendente no momento.</p>
          </div>
        ) : (
          alertas.map((alerta) => {
            const isNovo = alerta.status === 'NOVO';
            return (
              <div
                key={alerta.id}
                className={`p-4 flex gap-4 transition-colors ${
                  isNovo ? 'bg-red-50/20 border-l-4 border-l-red-500' : 'bg-white hover:bg-gray-50/60'
                }`}
              >
                {renderIcon(alerta.tipo)}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-sm ${isNovo ? 'text-gray-900 font-extrabold' : 'text-gray-700'}`}>
                        {alerta.titulo}
                      </h4>
                      {alerta.tipo === 'ESTOQUE_MINIMO' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          Estoque Crítico
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {formatTime(alerta.criadoEm)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                  {isNovo && (
                    <button
                      onClick={() => handleMarcarLido(alerta.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
