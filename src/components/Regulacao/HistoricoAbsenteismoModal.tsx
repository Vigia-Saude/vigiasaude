import { useQuery } from '@tanstack/react-query';
import { X, TrendingUp, TrendingDown, Minus, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { getAbsenteismo, faixaScore, type HistoricoAbsenteismoItem } from '../../services/confirmacaoService';

interface Props {
  pacienteId: string;
  pacienteNome?: string;
  onClose: () => void;
}

function iconeTipo(item: HistoricoAbsenteismoItem) {
  if (item.delta > 0) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
  if (item.delta < 0) return <TrendingDown className="h-4 w-4 text-rose-600" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

const TIPO_LABEL: Record<string, string> = {
  CONFIRMOU: 'Confirmou presença',
  RECUSOU: 'Recusou',
  NAO_RESPONDEU: 'Não respondeu',
};

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoricoAbsenteismoModal({ pacienteId, pacienteNome, onClose }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['absenteismo', pacienteId],
    queryFn: () => getAbsenteismo(pacienteId),
  });

  const score = data?.paciente.scoreConfianca ?? 100;
  const faixa = faixaScore(score);

  const faixaEstilo =
    faixa.faixa === 'CONFIAVEL'
      ? { anel: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: ShieldCheck }
      : faixa.faixa === 'ATENCAO'
        ? { anel: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', Icon: AlertTriangle }
        : { anel: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', Icon: AlertOctagon };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Histórico de Absenteísmo</h3>
            <p className="text-xs text-slate-500 mt-0.5">{pacienteNome ?? data?.paciente.nomeCompleto ?? 'Paciente'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Score */}
        <div className="p-6">
          <div className={`flex items-center gap-4 rounded-2xl border ${faixaEstilo.border} ${faixaEstilo.bg} p-4`}>
            <faixaEstilo.Icon className={`h-10 w-10 ${faixaEstilo.anel}`} />
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${faixaEstilo.anel}`}>{score}</span>
                <span className="text-sm font-semibold text-slate-500">/ 100</span>
              </div>
              <div className="text-sm font-bold text-slate-700">
                {faixa.emoji} {faixa.label}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-6 pb-6 overflow-y-auto">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Linha do tempo</h4>
          {isLoading && <p className="text-sm text-slate-400 py-6 text-center">Carregando histórico...</p>}
          {isError && <p className="text-sm text-rose-500 py-6 text-center">Falha ao carregar o histórico.</p>}
          {!isLoading && !isError && (data?.historico.length ?? 0) === 0 && (
            <p className="text-sm text-slate-400 py-6 text-center">Nenhum desfecho registrado ainda.</p>
          )}
          <ul className="space-y-3">
            {data?.historico.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {iconeTipo(item)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-800">{TIPO_LABEL[item.tipo] ?? item.tipo}</span>
                    <span
                      className={`text-xs font-extrabold ${
                        item.delta > 0 ? 'text-emerald-600' : item.delta < 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                      {item.delta > 0 ? '+' : ''}
                      {item.delta} → {item.scoreResultante}
                    </span>
                  </div>
                  {item.motivo && <div className="text-xs text-slate-500 mt-0.5">Motivo: {item.motivo}</div>}
                  <div className="text-[11px] text-slate-400 mt-0.5">{formatarDataHora(item.criadoEm)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
