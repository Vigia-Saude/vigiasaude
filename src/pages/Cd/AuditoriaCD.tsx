import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Eye, 
  ArrowRight,
  Database,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Package,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle,
  Truck,
  HelpCircle
} from 'lucide-react';
import apiClient from '../../services/apiClient';

interface AuditUser {
  nome: string;
  email: string;
  perfil: string;
  role: string;
}

interface AuditLog {
  id: string;
  dataHora: string;
  usuarioId: string;
  usuario: AuditUser;
  acao: string;
  entidadeId: string;
  dadosAntes: any;
  dadosDepois: any;
  justificativa: string | null;
}

type Categoria = 'TODOS' | 'ENTRADAS' | 'DISPENSACOES' | 'RECALLS' | 'TRANSFERENCIAS' | 'PEDIDOS';

export function AuditoriaCD() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Selected Log for Details Modal/Panel
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, string> = {};
      if (busca) params.busca = busca;
      if (categoria !== 'TODOS') params.categoria = categoria;
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;

      const response = await apiClient.get<AuditLog[]>('/cd/auditoria', { params });
      setLogs(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao carregar registros de auditoria. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      void fetchLogs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busca, categoria, dataInicio, dataFim]);

  const clearFilters = () => {
    setBusca('');
    setCategoria('TODOS');
    setDataInicio('');
    setDataFim('');
  };

  // Helper to format date nicely
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Helper to display initials for user avatars
  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Maps database acao values to descriptive and translated labels
  const getActionDetails = (acao: string) => {
    switch (acao) {
      case 'ENTRADA_ESTOQUE':
        return {
          label: 'Entrada de Estoque',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          icon: <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
        };
      case 'DISPENSACAO':
        return {
          label: 'Dispensação',
          color: 'bg-amber-50 text-amber-700 border-amber-100',
          icon: <ArrowUpRight className="h-4 w-4 text-amber-600" />
        };
      case 'RECALL_REGISTRADO':
        return {
          label: 'Recall Registrado',
          color: 'bg-rose-50 text-rose-700 border-rose-100',
          icon: <AlertTriangle className="h-4 w-4 text-rose-600" />
        };
      case 'RECALL_ENCERRADO':
        return {
          label: 'Recall Encerrado',
          color: 'bg-blue-50 text-blue-700 border-blue-100',
          icon: <CheckCircle className="h-4 w-4 text-blue-600" />
        };
      case 'PEDIDO_CRIADO':
        return {
          label: 'Pedido de Reposição Criado',
          color: 'bg-violet-50 text-violet-700 border-violet-100',
          icon: <FileText className="h-4 w-4 text-violet-600" />
        };
      case 'PEDIDO_APROVADO':
        return {
          label: 'Pedido Aprovado',
          color: 'bg-teal-50 text-teal-700 border-teal-100',
          icon: <CheckCircle className="h-4 w-4 text-teal-600" />
        };
      case 'PEDIDO_REJEITADO':
        return {
          label: 'Pedido Rejeitado',
          color: 'bg-red-50 text-red-700 border-red-100',
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />
        };
      case 'TRANSFERENCIA_INICIADA':
        return {
          label: 'Transferência Iniciada',
          color: 'bg-sky-50 text-sky-700 border-sky-100',
          icon: <Truck className="h-4 w-4 text-sky-600" />
        };
      case 'TRANSFERENCIA_CONCLUIDA':
        return {
          label: 'Transferência Concluída',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          icon: <Package className="h-4 w-4 text-indigo-600" />
        };
      default:
        return {
          label: acao,
          color: 'bg-gray-50 text-gray-700 border-gray-100',
          icon: <Database className="h-4 w-4 text-gray-600" />
        };
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600" />
            Auditoria e Logs de Operações
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Histórico imutável de movimentações de estoque, conferências, recalls e transferências no CD.
          </p>
        </div>
        <button 
          onClick={() => void fetchLogs()} 
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-98 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total de Registros</p>
            <h3 className="text-2xl font-bold text-gray-800">{logs.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowDownLeft className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entradas e Lotes</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {logs.filter(l => l.acao === 'ENTRADA_ESTOQUE').length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ocorrências de Recall</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {logs.filter(l => l.acao.startsWith('RECALL')).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-2">
        {(['TODOS', 'ENTRADAS', 'DISPENSACOES', 'RECALLS', 'TRANSFERENCIAS', 'PEDIDOS'] as Categoria[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setCategoria(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              categoria === tab
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase().replace('acoes', 'ações')}
          </button>
        ))}
      </div>

      {/* Filters Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquise por usuário, ID do evento ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-gray-400"
          />
        </div>
        {/* Date start */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-gray-700"
          />
        </div>
        {/* Date end */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all text-gray-700"
          />
        </div>
      </div>

      {/* Table & Data section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            <div className="h-6 bg-gray-100 rounded-md w-1/4 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="h-14 bg-gray-50 rounded-lg animate-pulse flex items-center justify-between px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-1/12"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 font-semibold mb-4">{error}</p>
            <button 
              onClick={() => void fetchLogs()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="inline-flex p-4 bg-gray-50 text-gray-400 rounded-2xl">
              <History className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Nenhum log de auditoria encontrado</h3>
              <p className="text-sm text-gray-500 mt-1">
                Tente ajustar os filtros, termo de busca ou período selecionado.
              </p>
            </div>
            {(busca || dataInicio || dataFim || categoria !== 'TODOS') && (
              <button 
                onClick={clearFilters} 
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/55 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Evento / Ação</th>
                  <th className="px-6 py-4">Usuário Responsável</th>
                  <th className="px-6 py-4">Data / Hora</th>
                  <th className="px-6 py-4">Justificativa / Descrição</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => {
                  const details = getActionDetails(log.acao);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${details.color}`}>
                            {details.icon}
                            {details.label}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] font-mono text-gray-400">
                          ID: {log.entidadeId || log.id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${log.usuario?.nome ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                            {getInitials(log.usuario?.nome)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">
                              {log.usuario?.nome || 'Sistema (Automático)'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {log.usuario?.email || 'sistema@vigiasaude.com.br'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {formatDateTime(log.dataHora)}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs md:max-w-md">
                        <p className="text-sm text-gray-600 truncate">
                          {log.justificativa || 'Nenhuma justificativa inserida.'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Side Panel/Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detalhes da Auditoria</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {selectedLog.id}</p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-95 transition-all text-sm font-semibold"
              >
                Fechar
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Event Summary */}
              <div className="bg-gray-50 p-4.5 rounded-2xl border border-gray-100 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ação / Operação</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getActionDetails(selectedLog.acao).color}`}>
                    {getActionDetails(selectedLog.acao).icon}
                    {getActionDetails(selectedLog.acao).label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data e Hora</span>
                  <span className="text-sm font-semibold text-gray-700">{formatDateTime(selectedLog.dataHora)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Referência Interna (Entidade)</span>
                  <span className="text-sm font-mono font-semibold text-gray-750">{selectedLog.entidadeId || 'N/A'}</span>
                </div>
              </div>

              {/* Responsible User details */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Operador</h4>
                <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
                  <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {getInitials(selectedLog.usuario?.nome)}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">{selectedLog.usuario?.nome || 'Processo do Sistema'}</h5>
                    <p className="text-xs text-gray-400">{selectedLog.usuario?.email || 'sistema@vigiasaude.com.br'}</p>
                    {selectedLog.usuario?.perfil && (
                      <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        {selectedLog.usuario.perfil.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Justification details */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Justificativa / Descrição</h4>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-600 italic">
                  "{selectedLog.justificativa || 'Nenhuma justificativa inserida para esta alteração.'}"
                </div>
              </div>

              {/* Before and After States comparison */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Estado da Informação</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      Estado Anterior (Antes)
                    </span>
                    <div className="p-4 bg-gray-900 text-gray-100 font-mono text-xs rounded-xl overflow-x-auto max-h-60 border border-gray-800">
                      {selectedLog.dadosAntes ? (
                        <pre>{JSON.stringify(selectedLog.dadosAntes, null, 2)}</pre>
                      ) : (
                        <span className="text-gray-550 italic">Sem registros anteriores (Criação/Novo)</span>
                      )}
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Estado Resultante (Depois)
                    </span>
                    <div className="p-4 bg-gray-900 text-gray-100 font-mono text-xs rounded-xl overflow-x-auto max-h-60 border border-gray-800">
                      {selectedLog.dadosDepois ? (
                        <pre>{JSON.stringify(selectedLog.dadosDepois, null, 2)}</pre>
                      ) : (
                        <span className="text-gray-550 italic">Sem registros finais (Exclusão)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                Registros de auditoria são imutáveis
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
              >
                Concluir Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
