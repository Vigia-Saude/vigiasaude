import { useState, useMemo, useEffect } from 'react';
import { getAuditoriaLogs, BackendAuditoriaLog } from '../../services/auditoriaService';
import { 
  Search, 
  Terminal, 
  AlertTriangle, 
  Users, 
  Activity, 
  Calendar,
  ChevronDown, 
  ChevronUp, 
  Download, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

type Aba = 'todos' | 'criticas' | 'modificacoes';

function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-orange-500 text-white',
    'bg-blue-500 text-white',
    'bg-emerald-500 text-white',
    'bg-purple-500 text-white',
    'bg-rose-500 text-white',
    'bg-amber-500 text-white',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

export function AuditoriaLista() {
  const [logs, setLogs] = useState<BackendAuditoriaLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState('90');
  const [abaAtiva, setAbaAtiva] = useState<Aba>('todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await getAuditoriaLogs();
      setLogs(data);
    } catch (err) {
      console.error('Erro ao carregar logs de auditoria:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  // Filter and compute categories
  const processedLogs = useMemo(() => {
    return logs.map(log => {
      const acaoUpper = log.acao.toUpperCase();
      const isCritica = 
        acaoUpper.includes('EXCLUSAO') || 
        acaoUpper.includes('DESATIVACAO') || 
        acaoUpper.includes('BLOQUEIO') || 
        acaoUpper.includes('REJEICAO') ||
        acaoUpper.includes('CANCELADO') ||
        acaoUpper.includes('RECUSA');
      
      const isModificacao = 
        acaoUpper.includes('CRIACAO') || 
        acaoUpper.includes('ATUALIZACAO') || 
        acaoUpper.includes('APROVACAO') || 
        acaoUpper.includes('EDICAO') || 
        acaoUpper.includes('CONSUMO') || 
        acaoUpper.includes('ENTREGA');

      return {
        ...log,
        isCritica,
        isModificacao,
        usuarioNome: log.usuario?.nome || 'Sistema / Cron',
        usuarioEmail: log.usuario?.email || 'N/A',
        usuarioRole: log.usuario?.role || 'SISTEMA'
      };
    });
  }, [logs]);

  // General counts for the header cards
  const counts = useMemo(() => {
    const total = processedLogs.length;
    const criticas = processedLogs.filter(l => l.isCritica).length;
    
    // Unique users
    const uniqueUsersSet = new Set(processedLogs.map(l => l.usuarioId).filter(Boolean));
    const usuariosUnicos = uniqueUsersSet.size;

    return { total, criticas, usuariosUnicos };
  }, [processedLogs]);

  // Apply filters: Search, Period and Active Tab
  const filteredLogs = useMemo(() => {
    return processedLogs.filter(log => {
      // 1. Search text filter
      const lower = filtroTexto.toLowerCase();
      const matchText = 
        log.usuarioNome.toLowerCase().includes(lower) ||
        log.acao.toLowerCase().includes(lower) ||
        log.entidadeId.toLowerCase().includes(lower) ||
        (log.justificativa && log.justificativa.toLowerCase().includes(lower));

      // 2. Period filter
      const logDate = new Date(log.dataHora);
      const diffTime = Math.abs(new Date().getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const matchPeriod = diffDays <= Number(periodo);

      // 3. Tab filter
      let matchTab = true;
      if (abaAtiva === 'criticas') matchTab = log.isCritica;
      if (abaAtiva === 'modificacoes') matchTab = log.isModificacao;

      return matchText && matchPeriod && matchTab;
    });
  }, [processedLogs, filtroTexto, periodo, abaAtiva]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  const getActionBadgeClass = (acao: string) => {
    const acaoUpper = acao.toUpperCase();
    if (
      acaoUpper.includes('CRIACAO') || 
      acaoUpper.includes('ATIVACAO') || 
      acaoUpper.includes('APROVACAO')
    ) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    if (
      acaoUpper.includes('ATUALIZACAO') || 
      acaoUpper.includes('EDICAO') ||
      acaoUpper.includes('CONSUMO') ||
      acaoUpper.includes('ENTREGA')
    ) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    if (
      acaoUpper.includes('EXCLUSAO') || 
      acaoUpper.includes('DESATIVACAO') || 
      acaoUpper.includes('BLOQUEIO') || 
      acaoUpper.includes('REJEICAO')
    ) {
      return 'bg-red-50 text-red-700 border-red-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-250';
  };

  const handleExportCSV = () => {
    // Basic CSV exporter matching standard reports
    const headers = ['Data Hora', 'Usuario', 'Role', 'Acao', 'Recurso ID', 'Justificativa'];
    const rows = filteredLogs.map(log => [
      new Date(log.dataHora).toLocaleString('pt-BR'),
      log.usuarioNome,
      log.usuarioRole,
      log.acao,
      log.entidadeId,
      log.justificativa || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_relatorio_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex justify-between items-end border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Auditoria e Compliance (Rastreabilidade TCU)
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">
            Registro imutável de ações executadas no sistema para fiscalização e auditoria regulatória
          </p>
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar Relatório CSV
        </button>
      </header>

      {/* 3 Summary Cards at top */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Total Events */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total de Eventos</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-blue-600">{counts.total}</span>
              <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">Logs gerais</span>
            </div>
          </div>
          <button 
            onClick={() => setAbaAtiva('todos')} 
            className="mt-4 text-left text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
          >
            Ver todos eventos →
          </button>
        </div>

        {/* Card 2: Critical Actions */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-650" />
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Ações Críticas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-red-600">{counts.criticas}</span>
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-md animate-pulse">Requer atenção</span>
            </div>
          </div>
          <button 
            onClick={() => setAbaAtiva('criticas')} 
            className="mt-4 text-left text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
          >
            Ver ações críticas →
          </button>
        </div>

        {/* Card 3: Unique Users */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Usuários Únicos</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-emerald-600">{counts.usuariosUnicos}</span>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Com atividade</span>
            </div>
          </div>
          <div className="mt-4 text-left text-xs font-bold text-emerald-600 flex items-center gap-1">
            Visualizando logs no período
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Abas de auditoria">
          <button
            type="button"
            onClick={() => {
              setAbaAtiva('todos');
              setExpandedLogId(null);
            }}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer bg-transparent border-0 ${
              abaAtiva === 'todos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>Todos os Eventos</span>
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full transition-all ${
              abaAtiva === 'todos'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAbaAtiva('criticas');
              setExpandedLogId(null);
            }}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer bg-transparent border-0 ${
              abaAtiva === 'criticas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>Ações Críticas</span>
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full transition-all ${
              abaAtiva === 'criticas'
                ? 'bg-red-100 text-red-650'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {counts.criticas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAbaAtiva('modificacoes');
              setExpandedLogId(null);
            }}
            className={`py-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer bg-transparent border-0 ${
              abaAtiva === 'modificacoes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Criações e Edições
          </button>
        </nav>
      </div>

      {/* Main Column Grid: Search/Filter + Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search bar */}
          <div className="flex-1 space-y-1.5 min-w-[280px]">
            <label className="text-[10px] font-bold uppercase text-gray-400">Buscar no Histórico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                placeholder="Buscar por usuário, ação, recurso ou justificativa..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-950 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Period Filter */}
          <div className="space-y-1.5 shrink-0">
            <label className="text-[10px] font-bold uppercase text-gray-400">Período de dias</label>
            <div className="relative">
              <select 
                value={periodo} 
                onChange={(e) => setPeriodo(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 block w-44 p-2.5 pr-8 outline-none font-semibold cursor-pointer"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="365">Último ano</option>
              </select>
              <Clock className="w-4 h-4 text-gray-400 absolute right-2.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Auditoria Table */}
        <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-xs bg-white">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-400 font-semibold">Buscando logs de auditoria imutáveis...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Data / Hora</th>
                    <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Usuário</th>
                    <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ação</th>
                    <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID Recurso</th>
                    <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resumo</th>
                    <th scope="col" className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400 font-semibold italic">
                        Nenhum registro de auditoria encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isExpanded = expandedLogId === log.id;
                      return (
                        <>
                          <tr 
                            key={log.id} 
                            onClick={() => toggleExpand(log.id)}
                            className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                          >
                            {/* Date/Time */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                              {new Date(log.dataHora).toLocaleString('pt-BR')}
                            </td>
                            
                            {/* User Avatar & Details */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold shadow-xs shrink-0 ${getAvatarColor(log.usuarioNome)}`}>
                                  {getInitials(log.usuarioNome)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {log.usuarioNome}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                    {log.usuarioRole}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Action badge */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide ${getActionBadgeClass(log.acao)}`}>
                                {log.acao.replace(/_/g, ' ')}
                              </span>
                            </td>

                            {/* Resource ID */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                              {log.entidadeId ? `#${log.entidadeId.substring(0, 8)}...` : '-'}
                            </td>

                            {/* Resumo */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-650 max-w-[200px] truncate">
                              {log.justificativa || `Ação executada no recurso ${log.entidadeId}`}
                            </td>

                            {/* Toggle action */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-100"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-3.5 w-3.5" />
                                    Fechar
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3.5 w-3.5" />
                                    Detalhar
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                          
                          {/* Expanded content */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-6 py-0 bg-gray-50/50 border-y border-gray-150">
                                <div className="py-6 px-4 space-y-5 animate-fade-in text-left">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Data states block (Left) */}
                                    <div className="space-y-3">
                                      <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                        <Terminal className="w-4 h-4 text-blue-500" />
                                        Rastreabilidade de Dados
                                      </h4>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                                          <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Estado Anterior</p>
                                          {log.dadosAntes ? (
                                            <pre className="text-[10px] text-gray-600 font-mono overflow-auto max-h-40 p-1.5 bg-gray-50/30 rounded-lg">
                                              {JSON.stringify(log.dadosAntes, null, 2)}
                                            </pre>
                                          ) : (
                                            <p className="text-xs text-gray-400 italic font-medium p-1">Nulo (Criação inicial)</p>
                                          )}
                                        </div>
                                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                                          <p className="text-[9px] font-bold text-blue-500 uppercase mb-2">Estado Novo</p>
                                          {log.dadosDepois ? (
                                            <pre className="text-[10px] text-gray-700 font-mono overflow-auto max-h-40 p-1.5 bg-blue-50/10 rounded-lg">
                                              {JSON.stringify(log.dadosDepois, null, 2)}
                                            </pre>
                                          ) : (
                                            <p className="text-xs text-gray-400 italic font-medium p-1">Nulo (Exclusão física/lógica)</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Context details block (Right) */}
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Justificativa da Alteração</h4>
                                        <p className="text-xs text-gray-700 bg-white p-4 rounded-xl border border-gray-200 border-l-4 border-l-blue-500 italic shadow-2xs leading-relaxed">
                                          "{log.justificativa || 'Nenhuma justificativa textual registrada para esta alteração.'}"
                                        </p>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h5 className="text-[9px] font-bold uppercase text-gray-400 mb-0.5">ID do Evento</h5>
                                          <code className="text-xs font-mono font-bold text-gray-700">#{log.id}</code>
                                        </div>
                                        <div>
                                          <h5 className="text-[9px] font-bold uppercase text-gray-400 mb-0.5">Usuário CPF / Email</h5>
                                          <p className="text-xs font-semibold text-gray-600 truncate">{log.usuarioEmail}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
