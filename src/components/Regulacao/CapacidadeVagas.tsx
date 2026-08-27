import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarRange, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { getSlots, salvarSlot, type SlotComVagas, type PendenteCapacidade } from '../../services/confirmacaoService';

interface Props {
  procedureName?: string;
}

function formatData(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

interface LinhaCapacidade {
  data: string; // YYYY-MM-DD
  definido: boolean;
  capacidadeTotal: number | null;
  confirmados: number;
  disponiveis: number | null;
  pacientes?: number;
}

export function CapacidadeVagas({ procedureName }: Props) {
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({ queryKey: ['slots'], queryFn: getSlots });

  const salvarMut = useMutation({
    mutationFn: salvarSlot,
    onSuccess: () => {
      toast.success('Capacidade salva.');
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['confirmacao-detalhes'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Falha ao salvar capacidade.'),
  });

  const linhas: LinhaCapacidade[] = useMemo(() => {
    if (!data || !procedureName) return [];
    const norm = procedureName.toLowerCase();
    const definidos: LinhaCapacidade[] = (data.slots as SlotComVagas[])
      .filter((s) => s.procedimento.toLowerCase() === norm)
      .map((s) => ({
        data: s.data.slice(0, 10),
        definido: true,
        capacidadeTotal: s.capacidadeTotal,
        confirmados: s.confirmados,
        disponiveis: s.disponiveis,
      }));
    const pendentes: LinhaCapacidade[] = (data.pendentes as PendenteCapacidade[])
      .filter((p) => p.procedimento.toLowerCase() === norm)
      .map((p) => ({ data: p.data, definido: false, capacidadeTotal: null, confirmados: 0, disponiveis: null, pacientes: p.pacientes }));
    return [...definidos, ...pendentes].sort((a, b) => a.data.localeCompare(b.data));
  }, [data, procedureName]);

  const pendentesCount = linhas.filter((l) => !l.definido).length;

  if (!procedureName) return null;
  if (isLoading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-400">Carregando capacidade...</div>;
  }
  if (linhas.length === 0) return null;

  const salvar = (data: string) => {
    const valor = parseInt(edits[data] ?? '', 10);
    if (isNaN(valor) || valor < 0) {
      toast.error('Informe uma capacidade válida.');
      return;
    }
    salvarMut.mutate({ procedimento: procedureName, data, capacidadeTotal: valor });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <CalendarRange className="h-4 w-4 text-indigo-600" /> Capacidade / Vagas por dia
      </h3>

      {pendentesCount > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            {pendentesCount} data(s) com pacientes na fila ainda <strong>sem capacidade definida</strong>. Defina as vagas
            antes de disparar as confirmações.
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[520px]">
          <thead>
            <tr className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Capacidade</th>
              <th className="py-2 pr-4">Confirmados</th>
              <th className="py-2 pr-4">Disponíveis</th>
              <th className="py-2 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {linhas.map((l) => (
              <tr key={l.data} className={l.definido ? '' : 'bg-amber-50/40'}>
                <td className="py-2 pr-4 font-semibold text-slate-700 whitespace-nowrap">{formatData(l.data)}</td>
                <td className="py-2 pr-4">
                  <input
                    type="number"
                    min={0}
                    placeholder={l.definido ? String(l.capacidadeTotal) : 'definir'}
                    value={edits[l.data] ?? (l.definido ? String(l.capacidadeTotal) : '')}
                    onChange={(e) => setEdits((s) => ({ ...s, [l.data]: e.target.value }))}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </td>
                <td className="py-2 pr-4 text-slate-600">{l.definido ? l.confirmados : '—'}</td>
                <td className="py-2 pr-4">
                  {l.definido ? (
                    <span
                      className={`font-bold ${
                        (l.disponiveis ?? 0) > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                      {l.disponiveis}
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold">não definida</span>
                  )}
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => salvar(l.data)}
                    disabled={salvarMut.isPending}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg disabled:opacity-50 cursor-pointer">
                    {salvarMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Salvar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
