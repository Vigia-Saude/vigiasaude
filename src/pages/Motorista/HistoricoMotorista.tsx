import React, { useState, useEffect, useCallback } from 'react';
import { History, Loader2, PackageOpen, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface HistoricoItem {
  id: string;
  numero: string;
  unidadeNome: string;
  status: 'CONCLUIDO' | 'REJEITADO';
  dataConclusao: string;
  totalItens: number;
  motivoRejeicao?: string;
  itens?: {
    id: string;
    medicamentoNome: string;
    quantidade: number;
  }[];
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'CONCLUIDO':
      return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Concluído</span>;
    case 'REJEITADO':
      return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Rejeitado</span>;
    default:
      return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{status}</span>;
  }
};

export function HistoricoMotorista() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filters
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const limit = 10;

  const fetchHistorico = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;
      if (statusFilter) params.status = statusFilter;

      const res = await apiClient.get('/api/motorista/historico', { params });
      const data = res.data;
      const historicoArray = Array.isArray(data) ? data : (Array.isArray(data?.dados) ? data.dados : (Array.isArray(data?.data) ? data.data : []));
      setHistorico(historicoArray);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  }, [page, dataInicio, dataFim, statusFilter]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  const handleSearch = () => {
    setPage(1);
    fetchHistorico();
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-amber-600" />
          Histórico de Entregas
        </h1>
        <p className="mt-1 text-sm text-gray-500">Consulte o histórico de todas as suas entregas realizadas.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:text-sm transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Data Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:text-sm transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:text-sm transition-all"
            >
              <option value="">Todos</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="REJEITADO">Rejeitado</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-700 transition-all cursor-pointer shrink-0"
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : historico.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
          <PackageOpen className="h-14 w-14 mb-4 stroke-[1.5]" />
          <p className="text-base font-medium text-gray-500">Nenhum registro encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros de busca.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Pedido</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Unidade</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Data Conclusão</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Itens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historico.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr onClick={() => toggleRow(item.id)} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {expandedRows.has(item.id) ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        {item.numero}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.unidadeNome}</td>
                      <td className="px-6 py-4">{statusBadge(item.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.dataConclusao ? new Date(item.dataConclusao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right font-medium">{item.totalItens}</td>
                    </tr>
                    {expandedRows.has(item.id) && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={5} className="px-14 py-4">
                          <div className="space-y-4">
                            {item.status === 'REJEITADO' && item.motivoRejeicao && (
                              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Motivo da Rejeição</p>
                                <p className="text-sm text-red-700">{item.motivoRejeicao}</p>
                              </div>
                            )}
                            <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1.5 shadow-sm max-w-2xl">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Itens Entregues</p>
                              {item.itens && item.itens.map((med, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                                  <span className="text-gray-700">{med.medicamentoNome}</span>
                                  <span className="text-gray-500 font-medium ml-4">x{med.quantidade}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {historico.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div 
                  className="p-4 space-y-2 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleRow(item.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.numero}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{item.unidadeNome}</p>
                    </div>
                    {statusBadge(item.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.dataConclusao ? new Date(item.dataConclusao).toLocaleDateString('pt-BR') : '-'}</span>
                    <div className="flex items-center gap-1">
                      <span>{item.totalItens} {item.totalItens === 1 ? 'item' : 'itens'}</span>
                      {expandedRows.has(item.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {expandedRows.has(item.id) && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
                    {item.status === 'REJEITADO' && item.motivoRejeicao && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                        <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Motivo da Rejeição</p>
                        <p className="text-sm text-red-700">{item.motivoRejeicao}</p>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Itens</p>
                      {item.itens && item.itens.map((med, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                          <span className="text-gray-700">{med.medicamentoNome}</span>
                          <span className="text-gray-500 font-medium ml-2">x{med.quantidade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <span className="text-sm font-medium text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
