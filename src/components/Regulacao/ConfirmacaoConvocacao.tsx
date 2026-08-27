import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Megaphone, Send, ChevronDown, ChevronRight, ArrowDownLeft, ArrowUpRight, Bot, Loader2, FlaskConical,
} from 'lucide-react';
import {
  listarConfirmacaoDetalhes,
  getConfirmacaoConfig,
  dispararManualProximo,
  convocarPaciente,
  simularResposta,
  faixaScore,
  STATUS_PACIENTE_LABEL,
  type EntradaConfirmacao,
  type PacienteFilaStatus,
} from '../../services/confirmacaoService';
import { HistoricoAbsenteismoModal } from './HistoricoAbsenteismoModal';
import { CapacidadeVagas } from './CapacidadeVagas';

interface Props {
  /** Nome do procedimento para filtrar a fila (opcional: sem filtro mostra tudo). */
  procedureName?: string;
}

const RANK: Record<string, number> = { VERMELHO: 3, AMARELO: 2, NORMAL: 1 };

const STATUS_PILL: Record<PacienteFilaStatus, string> = {
  AGUARDANDO: 'text-slate-600 bg-slate-100 border-slate-200',
  CONVOCADO: 'text-amber-700 bg-amber-50 border-amber-300',
  CONFIRMADO: 'text-emerald-700 bg-emerald-50 border-emerald-300',
  RECONFIRMADO: 'text-emerald-700 bg-emerald-50 border-emerald-300',
  RECUSOU: 'text-rose-700 bg-rose-50 border-rose-300',
  NAO_RESPONDEU: 'text-orange-700 bg-orange-50 border-orange-300',
  CANCELADO: 'text-slate-500 bg-slate-100 border-slate-200',
};

const URGENCIA_PILL: Record<string, string> = {
  VERMELHO: 'text-rose-700 bg-rose-50 border-rose-200',
  AMARELO: 'text-amber-700 bg-amber-50 border-amber-200',
  NORMAL: 'text-slate-500 bg-slate-50 border-slate-200',
};

function formatTelefone(...vals: (string | null | undefined)[]): string {
  const raw = vals.find((v) => v && v.replace(/\D/g, '').length >= 10);
  if (!raw) return '—';
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function ConfirmacaoConvocacao({ procedureName }: Props) {
  const qc = useQueryClient();
  const [expandido, setExpandido] = useState<string | null>(null);
  const [scoreModal, setScoreModal] = useState<{ id: string; nome: string } | null>(null);

  const { data: entradas = [], isLoading } = useQuery({
    queryKey: ['confirmacao-detalhes'],
    queryFn: listarConfirmacaoDetalhes,
  });
  const { data: config } = useQuery({ queryKey: ['confirmacao-config'], queryFn: getConfirmacaoConfig });

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['confirmacao-detalhes'] });
  };

  const dispararMut = useMutation({
    mutationFn: dispararManualProximo,
    onSuccess: (r) => { toast.success(r.mensagem); invalidar(); },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Falha ao disparar.'),
  });
  const convocarMut = useMutation({
    mutationFn: (id: string) => convocarPaciente(id),
    onSuccess: (r) => { toast.success(r.mensagem); invalidar(); },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Não foi possível convocar.'),
  });
  const simularMut = useMutation({
    mutationFn: simularResposta,
    onSuccess: (r: any) => { toast.success(r?.mensagem || 'Resposta simulada.'); invalidar(); },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Falha ao simular resposta.'),
  });

  // Filtra pela fila do procedimento (quando informado).
  const lista = useMemo(() => {
    const arr = procedureName
      ? entradas.filter((e) => (e.procedimentoNome ?? '').toLowerCase() === procedureName.toLowerCase())
      : entradas;
    return [...arr].sort((a, b) => a.posicao - b.posicao);
  }, [entradas, procedureName]);

  // Próximo elegível para convocar (urgência + FIFO entre os AGUARDANDO).
  const proximoElegivelId = useMemo(() => {
    const aguardando = lista.filter((e) => e.statusPaciente === 'AGUARDANDO');
    if (aguardando.length === 0) return null;
    const ordenado = [...aguardando].sort((a, b) => {
      const r = (RANK[b.nivelUrgencia] ?? 1) - (RANK[a.nivelUrgencia] ?? 1);
      return r !== 0 ? r : a.posicao - b.posicao;
    });
    return ordenado[0].id;
  }, [lista]);

  const contadores = useMemo(() => {
    const c = { convocados: 0, confirmados: 0, recusados: 0, naoResponderam: 0, aguardando: 0 };
    for (const e of lista) {
      if (e.statusPaciente === 'CONVOCADO') c.convocados++;
      else if (e.statusPaciente === 'CONFIRMADO' || e.statusPaciente === 'RECONFIRMADO') c.confirmados++;
      else if (e.statusPaciente === 'RECUSOU') c.recusados++;
      else if (e.statusPaciente === 'NAO_RESPONDEU') c.naoResponderam++;
      else if (e.statusPaciente === 'AGUARDANDO') c.aguardando++;
    }
    return c;
  }, [lista]);

  const totalTentativas = (config?.qtdReenvios ?? 2) + 1;

  return (
    <div className="space-y-4">
      {/* Capacidade / vagas por dia (seção 4.8) */}
      <CapacidadeVagas procedureName={procedureName} />

      {/* Banner de ações automáticas */}
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        <Bot className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-bold text-indigo-800">Convocação automática ativa</p>
          <p className="text-indigo-700 text-xs mt-0.5">
            O sistema convoca o próximo da fila (urgência + ordem de chegada) quando uma vaga abre, respeita o horário de
            operação e reenvia mensagens sem resposta. {contadores.convocados} aguardando resposta ·{' '}
            {contadores.confirmados} confirmados · {contadores.recusados} recusaram · {contadores.naoResponderam} não
            responderam.
          </p>
        </div>
        <button
          onClick={() => dispararMut.mutate()}
          disabled={dispararMut.isPending || contadores.aguardando === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm disabled:opacity-50 cursor-pointer shrink-0">
          {dispararMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
          Disparar próximo
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-5 w-8"></th>
              <th className="py-4 px-5">Paciente / CNS</th>
              <th className="py-4 px-5">Score</th>
              <th className="py-4 px-5">Telefone</th>
              <th className="py-4 px-5">Urgência</th>
              <th className="py-4 px-5">Ciclo</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              <tr><td colSpan={8} className="py-16 text-center text-slate-400">Carregando fila de confirmação...</td></tr>
            ) : lista.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-slate-400">Nenhum paciente nesta fila.</td></tr>
            ) : (
              lista.map((e) => (
                <LinhaPaciente
                  key={e.id}
                  entrada={e}
                  expandido={expandido === e.id}
                  onToggle={() => setExpandido(expandido === e.id ? null : e.id)}
                  onScore={() => e.paciente && setScoreModal({ id: e.paciente.id, nome: e.paciente.nomeCompleto })}
                  podeConvocar={e.id === proximoElegivelId}
                  onConvocar={() => convocarMut.mutate(e.id)}
                  convocando={convocarMut.isPending && convocarMut.variables === e.id}
                  onSimular={(resposta, motivo) =>
                    simularMut.mutate({ queueEntryId: e.id, resposta, motivoRecusa: motivo })
                  }
                  simulando={simularMut.isPending && (simularMut.variables as any)?.queueEntryId === e.id}
                  totalTentativas={totalTentativas}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {scoreModal && (
        <HistoricoAbsenteismoModal
          pacienteId={scoreModal.id}
          pacienteNome={scoreModal.nome}
          onClose={() => setScoreModal(null)}
        />
      )}
    </div>
  );
}

interface LinhaProps {
  entrada: EntradaConfirmacao;
  expandido: boolean;
  onToggle: () => void;
  onScore: () => void;
  podeConvocar: boolean;
  onConvocar: () => void;
  convocando: boolean;
  onSimular: (resposta: 'SIM' | 'NAO', motivo?: 'SEM_TRANSPORTE') => void;
  simulando: boolean;
  totalTentativas: number;
}

function LinhaPaciente({
  entrada: e, expandido, onToggle, onScore, podeConvocar, onConvocar, convocando, onSimular, simulando, totalTentativas,
}: LinhaProps) {
  const score = e.paciente?.scoreConfianca ?? 100;
  const fx = faixaScore(score);
  const scorePill =
    fx.faixa === 'CONFIAVEL' ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : fx.faixa === 'ATENCAO' ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <>
      <tr className="hover:bg-slate-50/70 transition-colors align-top">
        <td className="py-4 px-5">
          <button onClick={onToggle} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            {expandido ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </td>
        <td className="py-4 px-5">
          <div className="font-bold text-slate-900">{e.paciente?.nomeCompleto ?? 'Paciente'}</div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">{e.paciente?.cartaoSus ?? '—'}</div>
        </td>
        <td className="py-4 px-5">
          <button
            onClick={onScore}
            title="Ver histórico de absenteísmo"
            className={`inline-flex items-center gap-1 text-xs font-bold border px-2.5 py-1 rounded-full cursor-pointer ${scorePill}`}>
            <span>{fx.emoji}</span>
            <span>{score}</span>
          </button>
        </td>
        <td className="py-4 px-5 font-semibold text-slate-700 whitespace-nowrap">
          {formatTelefone(e.paciente?.telefone, e.paciente?.celular)}
        </td>
        <td className="py-4 px-5">
          <span className={`text-[11px] font-bold border px-2 py-0.5 rounded-full ${URGENCIA_PILL[e.nivelUrgencia]}`}>
            {e.nivelUrgencia}
          </span>
        </td>
        <td className="py-4 px-5 whitespace-nowrap">
          {e.cicloAtual ? (
            <div className="text-slate-600">
              <div className="font-semibold">Etapa {e.cicloAtual.etapa}</div>
              <div className="text-[11px] text-slate-400">Tentativa {e.cicloAtual.tentativa}/{totalTentativas}</div>
            </div>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </td>
        <td className="py-4 px-5 whitespace-nowrap">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold border px-3 py-1 rounded-full ${STATUS_PILL[e.statusPaciente]}`}>
            {STATUS_PACIENTE_LABEL[e.statusPaciente]}
          </span>
        </td>
        <td className="py-4 px-5 text-right whitespace-nowrap">
          <button
            onClick={onConvocar}
            disabled={!podeConvocar || convocando}
            title={podeConvocar ? 'Convocar este paciente' : 'Apenas o próximo da fila pode ser convocado'}
            className="inline-flex items-center gap-1 text-xs border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
            {convocando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Convocar
          </button>
        </td>
      </tr>

      {expandido && (
        <tr className="bg-slate-50/40">
          <td colSpan={8} className="px-5 pb-5 pt-1">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Timeline de mensagens */}
              <div>
                <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Histórico de mensagens
                </h5>
                {e.messages.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhuma mensagem registrada.</p>
                ) : (
                  <ul className="space-y-2">
                    {e.messages.map((m) => (
                      <li key={m.id} className="flex items-start gap-2">
                        {m.direction === 'OUTBOUND' ? (
                          <ArrowUpRight className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs text-slate-700">{m.body || m.templateName || '(mensagem)'}</div>
                          <div className="text-[11px] text-slate-400">
                            {m.direction === 'OUTBOUND' ? 'Enviada' : 'Recebida'} · {m.status} · {formatHora(m.criadoEm)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Simulação (teste do fluxo mockado) */}
              {e.statusPaciente === 'CONVOCADO' && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3">
                  <h5 className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                    <FlaskConical className="h-3.5 w-3.5" /> Simular resposta (teste)
                  </h5>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Sem WhatsApp real — injeta a resposta do paciente para testar o fluxo.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onSimular('SIM')}
                      disabled={simulando}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 cursor-pointer">
                      Responder SIM
                    </button>
                    <button
                      onClick={() => onSimular('NAO', 'SEM_TRANSPORTE')}
                      disabled={simulando}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 cursor-pointer">
                      Responder NÃO (sem transporte)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
