import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, Calendar, CheckCircle2, Clock, XCircle, Users, Megaphone, ThumbsDown, PhoneOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { listarConfirmacaoDetalhes } from '../../services/confirmacaoService';

interface QueueSummary {
  procedureId: string;
  name: string;
  total: number;
  confirmed: number;
  awaiting: number;
  cancelled: number;
}

export function GestaoFilasPage() {
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<QueueSummary[]>('/api/regulacao/queues')
      .then((res) => setQueues(res.data))
      .catch(() => setQueues([]))
      .finally(() => setLoading(false));
  }, []);

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

      {/* KPI Stats Top Bar Idêntica à Imagem 3 */}
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
              <div className="text-sm font-extrabold leading-tight">Vagas disponíveis</div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Capacidade por dia — próxima fase</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Filas Idêntico à Imagem 3 */}
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
              <Link
                key={q.procedureId}
                to={`/regulador/filas/${q.procedureId}`}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold text-lg flex items-center justify-center border border-emerald-100 shadow-sm">
                        {letter}
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition-colors">
                          {q.name}
                        </h2>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </div>

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
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-blue-700 bg-blue-50/60 border border-blue-100 rounded-xl p-3 font-semibold">
                  <Users className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{reservaCount} na reserva • pronto para convocar</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
