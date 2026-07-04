import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ListOrdered,
  Search,
  RefreshCw,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  Building2,
} from 'lucide-react';
import { listarFilaRegulacao } from '../../services/regulacaoService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import { cn } from '../../lib/utils';
import type { FilaRegulacao } from '../../types';

type TabFilter = '' | 'AGUARDANDO_REGULACAO' | 'PRE_AGENDADO' | 'CONFIRMADO' | 'CANCELADO';

function getStatusBadgeProps(status: string) {
  switch (status) {
    case 'AGUARDANDO_REGULACAO':
      return { label: 'Aguardando Regulação', variant: 'yellow' as const };
    case 'PRE_AGENDADO':
      return { label: 'Pré-Agendado', variant: 'blue' as const };
    case 'AGUARDANDO_RESPOSTA_PACIENTE':
      return { label: 'Aguardando Paciente', variant: 'orange' as const };
    case 'CONFIRMADO':
      return { label: 'Confirmado', variant: 'green' as const };
    case 'CANCELADO':
      return { label: 'Cancelado', variant: 'red' as const };
    default:
      return { label: status, variant: 'gray' as const };
  }
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function FilaRegulacaoSecretaria() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TabFilter>('');
  const [busca, setBusca] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['regulacao-fila', statusFilter],
    queryFn: () => listarFilaRegulacao(statusFilter ? { status: statusFilter } : undefined),
    select: (res) => {
      const fichas: FilaRegulacao[] = res.dados || res || [];
      return fichas;
    },
  });

  const fichas = data || [];

  // Fetch all for counts (unfiltered)
  const { data: allData } = useQuery({
    queryKey: ['regulacao-fila-counts'],
    queryFn: () => listarFilaRegulacao(),
    select: (res) => {
      const all: FilaRegulacao[] = res.dados || res || [];
      return {
        total: all.length,
        aguardando: all.filter(f => f.statusAgendamento === 'AGUARDANDO_REGULACAO').length,
        preAgendado: all.filter(f => f.statusAgendamento === 'PRE_AGENDADO').length,
        confirmado: all.filter(f => f.statusAgendamento === 'CONFIRMADO').length,
        cancelado: all.filter(f => f.statusAgendamento === 'CANCELADO').length,
        agendadosHoje: all.filter(f => {
          if (!f.dataAgendada) return false;
          const today = new Date().toISOString().split('T')[0];
          return f.dataAgendada === today;
        }).length,
      };
    },
  });

  const counts = allData || { total: 0, aguardando: 0, preAgendado: 0, confirmado: 0, cancelado: 0, agendadosHoje: 0 };

  // Client-side search filter
  const filteredFichas = busca.trim()
    ? fichas.filter(f =>
        f.paciente?.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
        f.paciente?.cpf.replace(/\D/g, '').includes(busca.replace(/\D/g, ''))
      )
    : fichas;

  // Sort by creation date (FIFO - oldest first)
  const sortedFichas = [...filteredFichas].sort(
    (a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
  );

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: '', label: 'Todos', count: counts.total },
    { key: 'AGUARDANDO_REGULACAO', label: 'Aguardando', count: counts.aguardando },
    { key: 'PRE_AGENDADO', label: 'Pré-Agendado', count: counts.preAgendado },
    { key: 'CONFIRMADO', label: 'Confirmado', count: counts.confirmado },
    { key: 'CANCELADO', label: 'Cancelado', count: counts.cancelado },
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ListOrdered className="h-6 w-6 text-indigo-600" />
            Fila de Regulação
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Gerencie e agende fichas de regulação dos postos de saúde
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 transition-all cursor-pointer active:scale-95 shadow-xs"
          title="Atualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total na Fila</span>
          <span className="text-3xl font-black text-gray-900">{counts.total}</span>
          <div className="absolute right-3 bottom-3 text-gray-100 group-hover:text-indigo-50 transition-colors">
            <ListOrdered className="h-12 w-12" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-blue-500 border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Agendados Hoje</span>
          <span className="text-3xl font-black text-gray-900">{counts.agendadosHoje}</span>
          <div className="absolute right-3 bottom-3 text-blue-50">
            <Calendar className="h-12 w-12" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-500 border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Confirmados</span>
          <span className="text-3xl font-black text-gray-900">{counts.confirmado}</span>
          <div className="absolute right-3 bottom-3 text-emerald-50">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-red-400 border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Cancelados</span>
          <span className="text-3xl font-black text-gray-900">{counts.cancelado}</span>
          <div className="absolute right-3 bottom-3 text-red-50">
            <XCircle className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95',
                statusFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              {tab.label}
              <span className={cn(
                'inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold min-w-[20px]',
                statusFilter === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200/80 text-gray-600'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do paciente ou CPF..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 placeholder:text-gray-400 bg-white"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-gray-900 mb-1">Erro ao carregar</h3>
          <p className="text-xs text-gray-500 mb-4">Não foi possível carregar a fila de regulação.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      ) : sortedFichas.length === 0 ? (
        <EmptyState
          title="Nenhuma ficha encontrada"
          description={busca ? 'Nenhum resultado para a busca informada.' : 'Não há fichas com este status na fila de regulação.'}
          icon={busca ? 'search' : 'database'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Unidade Solicitante</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Procedimento</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Solicitação</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedFichas.map((ficha, index) => {
                  const badgeProps = getStatusBadgeProps(ficha.statusAgendamento);
                  return (
                    <tr key={ficha.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span className="text-xs font-semibold text-gray-700">{ficha.unidadeEsfNome || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900">{ficha.paciente?.nomeCompleto}</span>
                          <span className="text-[10px] text-gray-500">{ficha.paciente?.cpf}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-700 truncate max-w-[200px] inline-block">
                          {ficha.procedimentoSolicitado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">{formatDate(ficha.criadoEm)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={badgeProps.label} variant={badgeProps.variant} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ficha.statusAgendamento === 'AGUARDANDO_REGULACAO' ? (
                          <button
                            onClick={() => navigate(`/regulador/agendamento/${ficha.id}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                          >
                            <CalendarCheck className="h-3.5 w-3.5" />
                            Agendar
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/regulador/ficha/${ficha.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                          >
                            Ver Detalhes
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-500 font-medium">
              Exibindo <span className="font-bold text-gray-700">{sortedFichas.length}</span> fichas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
