import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ChevronRight, Calendar, CheckCircle2, Clock, XCircle, Users, Megaphone, ThumbsDown, PhoneOff, Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';
import { listarConfirmacaoDetalhes, getSlots, excluirFila } from '../../services/confirmacaoService';

interface QueueSummary {
  procedureId: string;
  name: string;
  total: number;
  confirmed: number;
  awaiting: number;
  cancelled: number;
}

export function GestaoFilasPage() {
  const qc = useQueryClient();
  const [queueToDelete, setQueueToDelete] = useState<QueueSummary | null>(null);

  const { data: queues = [], isLoading: loading } = useQuery<QueueSummary[]>({
    queryKey: ['queues-summary'],
    queryFn: async () => {
      const res = await apiClient.get<QueueSummary[]>('/api/regulacao/queues');
      return res.data;
    },
  });

  const excluirMut = useMutation({
    mutationFn: (procedureId: string) => excluirFila(procedureId),
    onSuccess: (data) => {
      toast.success(data?.mensagem || 'Fila excluída com sucesso!');
      setQueueToDelete(null);
      qc.invalidateQueries({ queryKey: ['queues-summary'] });
      qc.invalidateQueries({ queryKey: ['confirmacao-detalhes'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.erro || err?.message || 'Falha ao excluir a fila.');
    },
  });

  const { data: confirmacaoEntradas = [] } = useQuery({
    queryKey: ['confirmacao-detalhes'],
    queryFn: listarConfirmacaoDetalhes,
  });

  const confirmacao = useMemo(() => {
    const c = { convocados: 0, confirmados: 0, recusados: 0, naoResponderam: 0 };
    for (const e of confirmacaoEntradas) {
      if (e.statusPaciente === 'CONVOCADO') c.convocados++;
      else if (e.statusPaciente === 'CONFIRMADO' || e.statusPaciente === 'RECONFIRMADO') c.confirmados++;
      else if (e.statusPaciente === 'RECUSOU') c.recusados++;
      else if (e.statusPaciente === 'NAO_RESPONDEU') c.naoResponderam++;
    }
    return c;
  }, [confirmacaoEntradas]);

  const { data: slotsData } = useQuery({ queryKey: ['slots'], queryFn: getSlots });
  const vagas = useMemo(() => {
    const disponiveis = (slotsData?.slots ?? []).reduce((acc, s) => acc + (s.disponiveis ?? 0), 0);
    return { disponiveis, pendentes: slotsData?.pendentes.length ?? 0 };
  }, [slotsData]);

  const totals = queues.reduce(
    (acc, q) => ({
      total: acc.total + q.total,
      confirmed: acc.confirmed + q.confirmed,
      awaiting: acc.awaiting + q.awaiting,
      cancelled: acc.cancelled + q.cancelled,
    }),
    { total: 0, confirmed: 0, awaiting: 0, cancelled: 0 }
  );

  const formattedDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestão de Filas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Selecione uma fila para ver os detalhes · {formattedDate}
        </p>
      </div>

      {/* KPI Stats Top Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-slate-200/70 text-slate-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-none">{totals.total}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Total agendados</div>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-700 leading-none">{totals.confirmed}</div>
            <div className="text-xs text-emerald-600 font-bold mt-0.5">Confirmados</div>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-700 leading-none">{totals.awaiting}</div>
            <div className="text-xs text-amber-600 font-bold mt-0.5">Aguardando</div>
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-rose-700 leading-none">{totals.cancelled}</div>
            <div className="text-xs text-rose-600 font-bold mt-0.5">Cancelados</div>
          </div>
        </div>
      </div>

      {/* Contadores de Confirmação (WhatsApp) */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Confirmação (WhatsApp)</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700"><Megaphone className="h-5 w-5" /></div>
            <div>
              <div className="text-xl font-extrabold text-amber-700 leading-none">{confirmacao.convocados}</div>
              <div className="text-xs text-amber-600 font-bold mt-0.5">Convocados</div>
            </div>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></div>
            <div>
              <div className="text-xl font-extrabold text-emerald-700 leading-none">{confirmacao.confirmados}</div>
              <div className="text-xs text-emerald-600 font-bold mt-0.5">Confirmados</div>
            </div>
          </div>
          <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700"><ThumbsDown className="h-5 w-5" /></div>
            <div>
              <div className="text-xl font-extrabold text-rose-700 leading-none">{confirmacao.recusados}</div>
              <div className="text-xs text-rose-600 font-bold mt-0.5">Recusados</div>
            </div>
          </div>
          <div className="bg-orange-50/70 border border-orange-200/70 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700"><PhoneOff className="h-5 w-5" /></div>
            <div>
              <div className="text-xl font-extrabold text-orange-700 leading-none">{confirmacao.naoResponderam}</div>
              <div className="text-xs text-orange-600 font-bold mt-0.5">Não responderam</div>
            </div>
          </div>
          <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm text-blue-700">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700"><Calendar className="h-5 w-5" /></div>
            <div>
              <div className="text-xl font-extrabold text-blue-700 leading-none">{vagas.disponiveis}</div>
              <div className="text-xs text-blue-600 font-bold mt-0.5">Vagas disponíveis</div>
              {vagas.pendentes > 0 && (
                <div className="text-[11px] text-amber-600 font-semibold mt-0.5">{vagas.pendentes} sem capacidade definida</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Filas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">Carregando filas de regulação...</div>
        ) : queues.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl text-sm text-slate-400">
            Nenhuma fila registrada no momento. Valide um PDF para criar novas filas.
          </div>
        ) : (
          queues.map((q, idx) => {
            const letter = String.fromCharCode(65 + (idx % 26));
            const reservaCount = Math.max(0, q.total - 5);

            return (
              <div
                key={q.procedureId}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      to={`/regulador/filas/${q.procedureId}`}
                      className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold text-lg flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                        {letter}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition-colors truncate">
                          {q.name}
                        </h2>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Excluir esta fila"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQueueToDelete(q);
                        }}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/regulador/filas/${q.procedureId}`}
                        className="p-2 text-slate-400 hover:text-emerald-700">
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>

                  <Link to={`/regulador/filas/${q.procedureId}`} className="block">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3 px-1">
                      <span>Ocupação</span>
                      <span className="text-slate-800 font-bold">{q.total}/{q.total}</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full w-full" />
                    </div>

                    {/* Badges de Status */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-xl p-2.5">
                        <div className="font-extrabold text-sm">{q.confirmed}</div>
                        <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5">CONFIRM.</div>
                      </div>
                      <div className="bg-amber-50 text-amber-800 border border-amber-200/60 rounded-xl p-2.5">
                        <div className="font-extrabold text-sm">{q.awaiting}</div>
                        <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5">AGUARD.</div>
                      </div>
                      <div className="bg-rose-50 text-rose-800 border border-rose-200/60 rounded-xl p-2.5">
                        <div className="font-extrabold text-sm">{q.cancelled}</div>
                        <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5">CANCELAD.</div>
                      </div>
                    </div>
                  </Link>
                </div>

                <Link
                  to={`/regulador/filas/${q.procedureId}`}
                  className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-blue-700 bg-blue-50/60 border border-blue-100 rounded-xl p-3 font-semibold hover:bg-blue-100/70 transition-colors">
                  <Users className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{reservaCount} na reserva • pronto para convocar</span>
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {queueToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Excluir Fila de Regulação</h3>
                <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-900 space-y-1">
              <p>
                Você está prestes a excluir permanentemente a fila <strong>{queueToDelete.name}</strong>.
              </p>
              <p className="text-rose-700">
                Todos os <strong>{queueToDelete.total} pacientes</strong>, agendamentos, mensagens e vagas configuradas desta fila serão removidos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQueueToDelete(null)}
                disabled={excluirMut.isPending}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => excluirMut.mutate(queueToDelete.procedureId)}
                disabled={excluirMut.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer">
                {excluirMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {excluirMut.isPending ? 'Excluindo...' : 'Sim, excluir fila'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
