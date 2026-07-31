import { useState, useEffect } from 'react';
import { Send, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';

interface QueueEntry {
  id: string;
  posicao: number;
  status: 'PENDING' | 'AWAITING_RESPONSE' | 'CONFIRMED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  notificadoEm?: string;
  respondidoEm?: string;
  expiraEm?: string;
  paciente?: {
    nomeCompleto: string;
    telefone?: string;
    celular?: string;
    cartaoSus?: string;
    cpf?: string;
  };
  messages?: Array<{
    id: string;
    direction: 'OUTBOUND' | 'INBOUND';
    status: string;
    criadoEm: string;
  }>;
}

interface QueueSummary {
  total: number;
  pending: number;
  awaitingResponse: number;
  confirmed: number;
  declined: number;
  expired: number;
  cancelled: number;
}

export function FilaConfirmacaoWhatsApp() {
  const [summary, setSummary] = useState<QueueSummary>({
    total: 0,
    pending: 0,
    awaitingResponse: 0,
    confirmed: 0,
    declined: 0,
    expired: 0,
    cancelled: 0
  });
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSummary, resEntries] = await Promise.all([
        apiClient.get('/api/regulacao/whatsapp/filas'),
        apiClient.get('/api/regulacao/whatsapp/filas/detalhes')
      ]);

      setSummary(resSummary.data);
      setEntries(resEntries.data);
    } catch (err) {
      console.error('Erro ao carregar fila:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispararProximo = async () => {
    setDispatching(true);
    try {
      await apiClient.post('/api/regulacao/whatsapp/filas/disparar-proximo');

      toast.success('Confirmação enviada via WhatsApp para o próximo paciente da fila!');
      fetchData();
    } catch (err: any) {
      const erroMsg = err.response?.data?.erro || err.response?.data?.error || err.message || 'Falha ao disparar confirmação';
      toast.error(erroMsg);
    } finally {
      setDispatching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Pendente</span>;
      case 'AWAITING_RESPONSE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Aguardando (24h)</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmado</span>;
      case 'DECLINED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1"><XCircle className="w-3 h-3" /> Recusou</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Expirado</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total na Fila</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-amber-600 text-xs font-medium uppercase tracking-wider mb-1">Aguardando Resposta</div>
          <div className="text-2xl font-bold text-amber-600">{summary.awaitingResponse}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-emerald-600 text-xs font-medium uppercase tracking-wider mb-1">Confirmados (Sim)</div>
          <div className="text-2xl font-bold text-emerald-600">{summary.confirmed}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-rose-600 text-xs font-medium uppercase tracking-wider mb-1">Recusados / Expirados</div>
          <div className="text-2xl font-bold text-rose-600">{summary.declined + summary.expired}</div>
        </div>
      </div>

      {/* Ações e Tabela da Fila */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Fila de Confirmação Ativa</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg transition"
              title="Atualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDispararProximo}
              disabled={dispatching || summary.pending === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {dispatching ? 'Disparando...' : 'Disparar Próximo WhatsApp'}
            </button>
          </div>
        </div>

        {/* Tabela de Posições */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
              <tr>
                <th className="p-3 w-12 text-center">Pos.</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Status Fila</th>
                <th className="p-3">Notificado Em</th>
                <th className="p-3">Respondido Em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nenhum paciente na fila de confirmação no momento.
                  </td>
                </tr>
              ) : (
                entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-center font-bold text-slate-900 dark:text-white">
                      #{entry.posicao}
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {entry.paciente?.nomeCompleto || 'Paciente'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        SUS: {entry.paciente?.cartaoSus || '—'}
                      </div>
                    </td>

                    <td className="p-3 font-mono">
                      {entry.paciente?.telefone || entry.paciente?.celular || '—'}
                    </td>

                    <td className="p-3">
                      {getStatusBadge(entry.status)}
                    </td>

                    <td className="p-3 text-slate-500">
                      {entry.notificadoEm ? new Date(entry.notificadoEm).toLocaleString('pt-BR') : '—'}
                    </td>

                    <td className="p-3 text-slate-500">
                      {entry.respondidoEm ? new Date(entry.respondidoEm).toLocaleString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
