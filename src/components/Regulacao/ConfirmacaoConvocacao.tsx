import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Megaphone, Send, ChevronDown, ChevronRight, ArrowDownLeft, ArrowUpRight, Bot, Loader2, FlaskConical,
  CheckCheck, AlertCircle, Clock, UserPlus, Edit2, Phone, X, Calendar as CalendarIcon, RotateCcw,
} from 'lucide-react';
import {
  listarConfirmacaoDetalhes,
  listarUnidadesResponsaveis,
  getConfirmacaoConfig,
  convocarPaciente,
  convocarTodos,
  simularResposta,
  inserirPacienteFila,
  atualizarTelefoneFila,
  redefinirEntradaFila,
  faixaScore,
  STATUS_PACIENTE_LABEL,
  type EntradaConfirmacao,
  type PacienteFilaStatus,
  type NivelUrgencia,
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

function maskTelefoneInput(val: string): string {
  const d = val.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function ConfirmacaoConvocacao({ procedureName }: Props) {
  const qc = useQueryClient();
  const [expandido, setExpandido] = useState<string | null>(null);
  const [scoreModal, setScoreModal] = useState<{ id: string; nome: string } | null>(null);
  const [modalConvocarTodos, setModalConvocarTodos] = useState(false);
  const [modalInserir, setModalInserir] = useState(false);
  const [formInserir, setFormInserir] = useState({
    unidadeId: '', cartaoSus: '', dataNascimento: '', localAtendimento: '',
    nomeCompleto: '',
    telefone: '',
    procedimentoNome: procedureName || '',
    dataAgendada: '',
    horaAgendada: '',
    nivelUrgencia: 'NORMAL' as NivelUrgencia,
  });

  const [editandoTelefone, setEditandoTelefone] = useState<{
    id: string;
    nome: string;
    telefone: string;
  } | null>(null);
  const [novoTelefone, setNovoTelefone] = useState('');

  const { data: unidades = [] } = useQuery({queryKey:['unidades-responsaveis'],queryFn:listarUnidadesResponsaveis});
  const { data: entradas = [], isLoading, isError } = useQuery({
    queryKey: ['confirmacao-detalhes'],
    queryFn: listarConfirmacaoDetalhes,
    refetchInterval: 5000,
  });
  const { data: config } = useQuery({ queryKey: ['confirmacao-config'], queryFn: getConfirmacaoConfig });

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['confirmacao-detalhes'] });
  };

  const convocarMut = useMutation({
    mutationFn: (id: string) => convocarPaciente(id),
    onSuccess: (r) => { if (['FAILED','UNKNOWN'].includes((r as any).statusEnvio)) toast.error(r.mensagem); else toast.success(r.mensagem); invalidar(); },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Não foi possível convocar.'),
  });

  const convocarTodosMut = useMutation({
    mutationFn: () => convocarTodos({ procedureName }),
    onSuccess: (r) => {
      toast.success(r.mensagem || `${r.convocados} convocações registradas. Aguarde a confirmação de entrega.`);
      setModalConvocarTodos(false);
      invalidar();
    },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Falha ao preencher as vagas.'),
  });

  const inserirMut = useMutation({
    mutationFn: inserirPacienteFila,
    onSuccess: (r: any) => {
      toast.success(r.mensagem || 'Paciente inserido na fila com sucesso!');
      setModalInserir(false);
      setFormInserir({
        unidadeId: '', cartaoSus: '', dataNascimento: '', localAtendimento: '',
    nomeCompleto: '',
        telefone: '',
        procedimentoNome: procedureName || '',
        dataAgendada: '',
        horaAgendada: '',
        nivelUrgencia: 'NORMAL',
      });
      invalidar();
    },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Erro ao inserir paciente na fila.'),
  });

  const atualizarTelefoneMut = useMutation({
    mutationFn: ({ id, telefone }: { id: string; telefone: string }) =>
      atualizarTelefoneFila(id, telefone),
    onSuccess: (r: any) => {
      toast.success(r.mensagem || 'Telefone atualizado com sucesso!');
      setEditandoTelefone(null);
      setNovoTelefone('');
      invalidar();
    },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Erro ao atualizar telefone.'),
  });

  const redefinirMut = useMutation({
    mutationFn: (id: string) => redefinirEntradaFila(id),
    onSuccess: (r: any) => {
      toast.success(r.mensagem || 'Paciente redefinido para Aguardando!');
      invalidar();
    },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Erro ao redefinir paciente.'),
  });

  const simularMut = useMutation({
    mutationFn: simularResposta,
    onSuccess: (r: any) => { toast.success(r?.mensagem || 'Resposta simulada.'); invalidar(); },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Falha ao simular resposta.'),
  });

  // Filtra pela fila do procedimento (quando informado) e ordena na ordem de
  // convocação: ativos primeiro (aguardando/convocado), depois por urgência
  // (VERMELHO > AMARELO > NORMAL) e, por fim, FIFO por posição.
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
    const ordenado = [...aguardando].filter(e => !e.bloqueioEnvio).sort((a, b) => a.posicao - b.posicao);
    if (!ordenado.length) return null;
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
      {isError && <div className="p-3 text-rose-700 bg-rose-50 rounded-xl">Não foi possível consultar a fila. Verifique a disponibilidade da API antes de convocar.</div>}
      <CapacidadeVagas procedureName={procedureName} />

      {/* Banner de ações automáticas */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        <div className="flex items-start gap-3 flex-1 min-w-[280px]">
          <Bot className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-indigo-800">Convocação automática ativa</p>
            <p className="text-indigo-700 text-xs mt-0.5">
              O sistema convoca o próximo da fila quando uma vaga abre. {contadores.aguardando} aguardando convocação ·{' '}
              {contadores.convocados} aguardando resposta · {contadores.confirmados} confirmados · {contadores.recusados} recusaram.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setFormInserir((prev) => ({
                ...prev,
                procedimentoNome: procedureName || prev.procedimentoNome,
              }));
              setModalInserir(true);
            }}
            className="flex items-center gap-2 text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95">
            <UserPlus className="h-4 w-4 text-indigo-600" />
            <span>Inserir Paciente</span>
          </button>

          <button
            onClick={() => proximoElegivelId && convocarMut.mutate(proximoElegivelId)}
            disabled={convocarMut.isPending || convocarTodosMut.isPending || !proximoElegivelId}
            title={proximoElegivelId ? 'Convocar o próximo da fila' : 'Nenhum paciente aguardando'}
            className={`flex items-center gap-2 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition-all duration-200 cursor-pointer ${
              convocarMut.isPending
                ? 'bg-indigo-700 animate-pulse ring-2 ring-indigo-300 cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}>
            {convocarMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Disparando WhatsApp...</span>
              </>
            ) : (
              <>
                <Megaphone className="h-4 w-4" />
                <span>Disparar próximo</span>
              </>
            )}
          </button>

          <button
            onClick={() => setModalConvocarTodos(true)}
            disabled={convocarMut.isPending || convocarTodosMut.isPending || contadores.aguardando === 0}
            title={contadores.aguardando > 0 ? `Convocar todos os ${contadores.aguardando} pacientes aguardando` : 'Nenhum paciente aguardando'}
            className={`flex items-center gap-2 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition-all duration-200 cursor-pointer ${
              convocarTodosMut.isPending
                ? 'bg-emerald-700 animate-pulse ring-2 ring-emerald-300 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}>
            {convocarTodosMut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Convocando todos...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Preencher Vagas ({contadores.aguardando})</span>
              </>
            )}
          </button>
        </div>
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
                  onEditarTelefone={() => {
                    const tel = e.paciente?.celular || e.paciente?.telefone || '';
                    setEditandoTelefone({
                      id: e.id,
                      nome: e.paciente?.nomeCompleto || 'Paciente',
                      telefone: tel,
                    });
                    setNovoTelefone(tel);
                  }}
                  podeConvocar={e.statusPaciente === 'AGUARDANDO' || (['CONVOCADO','CONFIRMADO','RECONFIRMADO'].includes(e.statusPaciente) && e.cicloAtual?.deliveryStatus === 'FAILED')}
                  onConvocar={() => convocarMut.mutate(e.id)}
                  convocando={convocarMut.isPending && convocarMut.variables === e.id}
                  onRedefinir={() => redefinirMut.mutate(e.id)}
                  redefinindo={redefinirMut.isPending && redefinirMut.variables === e.id}
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

      {/* Modal de Confirmação: Preencher Vagas */}
      {modalConvocarTodos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Send className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Preencher Vagas os Pacientes</h3>
                <p className="text-xs text-slate-500">Disparo em lote via WhatsApp</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-900 space-y-1">
              <p>
                Deseja disparar as mensagens de convocação para todos os <strong>{contadores.aguardando} pacientes</strong> que estão aguardando nesta fila?
              </p>
              <p className="text-emerald-700 mt-1 font-medium">
                As mensagens de WhatsApp serão enviadas para todos eles simultaneamente.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalConvocarTodos(false)}
                disabled={convocarTodosMut.isPending}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => convocarTodosMut.mutate()}
                disabled={convocarTodosMut.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer">
                {convocarTodosMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {convocarTodosMut.isPending ? 'Enviando convocações...' : 'Sim, preencher vagas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inserir Paciente */}
      {modalInserir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                  <UserPlus className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Inserir Paciente na Fila</h3>
                  <p className="text-xs text-slate-500">Adicione um paciente manualmente para disparo e regulação</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalInserir(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!formInserir.nomeCompleto.trim()) {
                  toast.error('Informe o nome do paciente');
                  return;
                }
                const numTel = formInserir.telefone.replace(/\D/g, '');
                if (numTel.length < 10) {
                  toast.error('Informe um número de WhatsApp válido com DDD (ex: 67 99665-5593)');
                  return;
                }
                if (!formInserir.procedimentoNome.trim()) {
                  toast.error('Informe o procedimento/especialidade');
                  return;
                }
                inserirMut.mutate(formInserir);
              }}
              className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">Unidade responsável pela agenda *
                <select required value={formInserir.unidadeId} onChange={(e)=>setFormInserir(p=>({...p,unidadeId:e.target.value}))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 mt-1 bg-white">
                  <option value="">Selecione a unidade</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </label>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva Sauro"
                  value={formInserir.nomeCompleto}
                  onChange={(e) => setFormInserir((p) => ({ ...p, nomeCompleto: e.target.value }))}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs font-bold text-slate-700">CNS *
                  <input required inputMode="numeric" pattern="[0-9]{15}" maxLength={15} value={formInserir.cartaoSus}
                    onChange={(e) => setFormInserir(p => ({ ...p, cartaoSus: e.target.value.replace(/\D/g,'') }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 mt-1" />
                </label>
                <label className="text-xs font-bold text-slate-700">Nascimento *
                  <input required type="date" value={formInserir.dataNascimento}
                    onChange={(e) => setFormInserir(p => ({ ...p, dataNascimento: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 mt-1" />
                </label>
              </div>
              <label className="block text-xs font-bold text-slate-700">Local do atendimento *
                <input required value={formInserir.localAtendimento}
                  onChange={(e) => setFormInserir(p => ({ ...p, localAtendimento: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 mt-1" />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp com DDD *
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="(67) 99665-5593"
                      value={formInserir.telefone}
                      onChange={(e) => setFormInserir((p) => ({ ...p, telefone: maskTelefoneInput(e.target.value) }))}
                      className="w-full text-xs rounded-xl border border-slate-200 pl-9 p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Grau de Urgência
                  </label>
                  <select
                    value={formInserir.nivelUrgencia}
                    onChange={(e) => setFormInserir((p) => ({ ...p, nivelUrgencia: e.target.value as NivelUrgencia }))}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium bg-white">
                    <option value="NORMAL">Normal (Verde)</option>
                    <option value="AMARELO">Atenção (Amarelo)</option>
                    <option value="VERMELHO">Urgente (Vermelho)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Procedimento / Especialidade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consulta Cardiologia ou Ultrassom Abdominal"
                  value={formInserir.procedimentoNome}
                  onChange={(e) => setFormInserir((p) => ({ ...p, procedimentoNome: e.target.value }))}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data da Consulta / Exame
                  </label>
                  <div className="relative">
                    <CalendarIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="date" required
                      value={formInserir.dataAgendada}
                      onChange={(e) => setFormInserir((p) => ({ ...p, dataAgendada: e.target.value }))}
                      className="w-full text-xs rounded-xl border border-slate-200 pl-9 p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horário da Consulta (HH:mm)
                  </label>
                  <div className="relative">
                    <Clock className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="time" required
                      value={formInserir.horaAgendada}
                      onChange={(e) => setFormInserir((p) => ({ ...p, horaAgendada: e.target.value }))}
                      className="w-full text-xs rounded-xl border border-slate-200 pl-9 p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 space-y-1">
                <p>
                  💡 <strong>Fluxo completo:</strong> O paciente entrará na fila em status <em>AGUARDANDO</em>. Ao clicar em <strong>Convocar</strong>, ele receberá a mensagem oficial no WhatsApp e o acompanhamento de 1 semana, 1 dia e 4 horas antes começará automaticamente.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalInserir(false)}
                  disabled={inserirMut.isPending}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={inserirMut.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer">
                  {inserirMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {inserirMut.isPending ? 'Inserindo paciente...' : 'Inserir Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Telefone */}
      {editandoTelefone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 rounded-2xl">
                  <Phone className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Editar WhatsApp</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]" title={editandoTelefone.nome}>
                    {editandoTelefone.nome}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditandoTelefone(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Novo Número de WhatsApp com DDD
              </label>
              <input
                type="text"
                autoFocus
                placeholder="(67) 99665-5593"
                value={novoTelefone}
                onChange={(e) => setNovoTelefone(maskTelefoneInput(e.target.value))}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              />
              <p className="text-[11px] text-slate-400">
                O número será atualizado no cadastro do paciente e utilizado para todos os próximos disparos.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditandoTelefone(null)}
                disabled={atualizarTelefoneMut.isPending}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const limpo = novoTelefone.replace(/\D/g, '');
                  if (limpo.length < 10) {
                    toast.error('Informe um telefone válido com DDD (mínimo 10 dígitos)');
                    return;
                  }
                  atualizarTelefoneMut.mutate({ id: editandoTelefone.id, telefone: novoTelefone });
                }}
                disabled={atualizarTelefoneMut.isPending || novoTelefone.replace(/\D/g, '').length < 10}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer">
                {atualizarTelefoneMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-3.5 w-3.5" />}
                {atualizarTelefoneMut.isPending ? 'Salvando...' : 'Salvar Telefone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface LinhaProps {
  entrada: EntradaConfirmacao;
  expandido: boolean;
  onToggle: () => void;
  onScore: () => void;
  onEditarTelefone: () => void;
  podeConvocar: boolean;
  onConvocar: () => void;
  convocando: boolean;
  onRedefinir: () => void;
  redefinindo: boolean;
  onSimular: (resposta: 'SIM' | 'NAO', motivo?: 'SEM_TRANSPORTE') => void;
  simulando: boolean;
  totalTentativas: number;
}

function LinhaPaciente({
  entrada: e,
  expandido,
  onToggle,
  onScore,
  onEditarTelefone,
  podeConvocar,
  onConvocar,
  convocando,
  onRedefinir,
  redefinindo,
  onSimular,
  simulando,
  totalTentativas,
}: LinhaProps) {
  const score = e.paciente?.scoreConfianca ?? 100;
  const fx = faixaScore(score);
  const scorePill =
    fx.faixa === 'CONFIAVEL' ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : fx.faixa === 'ATENCAO' ? 'text-amber-700 bg-amber-50 border-amber-200'
        : 'text-rose-700 bg-rose-50 border-rose-200';

  const ultimaMsg = e.messages?.[0];

  return (
    <>
      <tr className={`transition-all duration-300 align-top ${convocando ? 'bg-emerald-50/90 ring-2 ring-emerald-400/60 shadow-inner' : 'hover:bg-slate-50/70'}`}>
        <td className="py-4 px-5">
          <button onClick={onToggle} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            {expandido ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </td>
        <td className="py-4 px-5">
          <div className="font-bold text-slate-900">{e.paciente?.nomeCompleto ?? 'Paciente'}</div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Posição {e.posicao} · {e.paciente?.cartaoSus ?? '—'}</div>
          {e.bloqueioEnvio && <div className="text-xs text-rose-600">{e.bloqueioEnvio}</div>}
          {e.cicloAtual && <div className="text-xs text-slate-600">Envio: {({QUEUED:'Pendente',ACCEPTED:'Aceito pelo provedor',SENT:'Aceito pelo provedor',DELIVERED:'Entregue',READ:'Lido',FAILED:'Falhou',UNKNOWN:'Incerto — aguarda conciliação'} as Record<string,string>)[e.cicloAtual.deliveryStatus || 'QUEUED']}</div>}
          {e.cicloAtual?.envioErro && <div className="text-xs text-rose-600">{e.cicloAtual.envioErro}</div>}
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
          <div className="flex items-center gap-1.5">
            <span>{formatTelefone(e.paciente?.telefone, e.paciente?.celular)}</span>
            <button
              onClick={onEditarTelefone}
              title="Editar telefone do WhatsApp"
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>
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
          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold border px-3 py-1 rounded-full transition-all duration-300 ${STATUS_PILL[e.statusPaciente]}`}>
              {STATUS_PACIENTE_LABEL[e.statusPaciente]}
            </span>

            {/* Tracking em tempo real de entrega no WhatsApp */}
            {e.statusPaciente === 'CONVOCADO' && ultimaMsg && (
              <div>
                {ultimaMsg.status === 'READ' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    <CheckCheck className="h-3 w-3 text-blue-600" /> Lido no WhatsApp
                  </span>
                ) : ultimaMsg.status === 'DELIVERED' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <CheckCheck className="h-3 w-3 text-emerald-600" /> Entregue no WhatsApp
                  </span>
                ) : ultimaMsg.status === 'FAILED' ? (
                  <span title={ultimaMsg.error || 'Falha no envio'} className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md cursor-help">
                    <AlertCircle className="h-3 w-3 text-rose-600" /> Falha no envio
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    <Clock className="h-3 w-3 text-amber-600" /> Disparado
                  </span>
                )}
              </div>
            )}
          </div>
        </td>
        <td className="py-4 px-5 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1.5">
            {import.meta.env.DEV && e.statusPaciente !== 'AGUARDANDO' && (
              <button
                onClick={onRedefinir}
                disabled={redefinindo}
                title="Redefinir para Aguardando (reiniciar teste/convocação)"
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-2xs transition-all cursor-pointer disabled:opacity-50">
                <RotateCcw className={`h-3.5 w-3.5 ${redefinindo ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                <span>Redefinir</span>
              </button>
            )}

            <button
              onClick={onConvocar}
              disabled={!podeConvocar || convocando}
              title={podeConvocar ? 'Convocar este paciente via WhatsApp' : 'Paciente já convocado ou concluído'}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all duration-200 cursor-pointer ${
                convocando
                  ? 'bg-emerald-600 text-white shadow-md animate-pulse ring-2 ring-emerald-300 cursor-wait'
                  : podeConvocar
                  ? 'border border-emerald-300 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 hover:scale-105 active:scale-95 shadow-sm'
                  : 'border border-slate-200 bg-slate-50 text-slate-400 opacity-40 cursor-not-allowed'
              }`}>
              {convocando ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Enviando WhatsApp...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>{e.cicloAtual?.deliveryStatus === 'FAILED' ? 'Tentar envio novamente' : 'Convocar'}</span>
                </>
              )}
            </button>
          </div>
        </td>
      </tr>

      {expandido && (
        <tr className="bg-slate-50/40">
          <td colSpan={8} className="px-5 pb-5 pt-1">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Timeline de mensagens */}
              <div>
                <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Histórico de mensagens do WhatsApp
                </h5>
                {e.messages.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhuma mensagem registrada.</p>
                ) : (
                  <ul className="space-y-2">
                    {e.messages.map((m) => (
                      <li key={m.id} className="flex items-start gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
                        {m.direction === 'OUTBOUND' ? (
                          <ArrowUpRight className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-slate-700 whitespace-pre-wrap">{m.body || m.templateName || '(mensagem)'}</div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="font-semibold text-slate-600">{m.direction === 'OUTBOUND' ? 'Enviada' : 'Recebida'}</span>
                            <span>·</span>
                            <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              m.status === 'READ' ? 'text-blue-700 bg-blue-50 border border-blue-200'
                              : m.status === 'DELIVERED' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : m.status === 'FAILED' ? 'text-rose-700 bg-rose-50 border border-rose-200 font-bold'
                              : 'text-amber-700 bg-amber-50 border border-amber-200'
                            }`}>
                              {m.status === 'READ' ? '✓✓ Lido' : m.status === 'DELIVERED' ? '✓✓ Entregue' : m.status === 'FAILED' ? '✕ Falha' : m.status}
                            </span>
                            <span>·</span>
                            <span>{formatHora(m.criadoEm)}</span>
                          </div>
                          {m.error && (
                            <div className="text-[11px] text-rose-600 font-medium mt-1.5 bg-rose-50 border border-rose-100 p-2 rounded-xl">
                              <strong>Motivo da falha:</strong> {m.error}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Simulação (teste do fluxo mockado) */}
              {import.meta.env.DEV && e.statusPaciente === 'CONVOCADO' && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 space-y-3">
                  <h5 className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <FlaskConical className="h-3.5 w-3.5 text-indigo-600" /> Simular resposta do paciente (teste)
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Caso queira testar a resposta do paciente sem precisar responder pelo celular:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onSimular('SIM')}
                      disabled={simulando}
                      className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 cursor-pointer shadow-xs">
                      Simular Resposta: SIM (Confirmar)
                    </button>
                    <button
                      onClick={() => onSimular('NAO', 'SEM_TRANSPORTE')}
                      disabled={simulando}
                      className="text-xs font-bold px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 cursor-pointer shadow-xs">
                      Simular Resposta: NÃO (Sem transporte)
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
