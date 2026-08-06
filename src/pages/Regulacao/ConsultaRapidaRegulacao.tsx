import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
  User,
  Stethoscope,
  X,
  Phone,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Home,
  CreditCard,
  History,
  ArrowLeft,
} from 'lucide-react';
import { consultaRapidaRegulacao, historicoRegulacaoPaciente } from '../../services/regulacaoService';
import { detalhesPaciente } from '../../services/pacienteService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { FilaRegulacao, Paciente } from '../../types';
import { formatCPF, formatPhone } from '../../lib/utils';

function getStatusBadgeProps(status: string) {
  switch (status) {
    case 'AGUARDANDO_REGULACAO':
      return { label: 'Aguardando Regulação', variant: 'yellow' as const };
    case 'PRE_AGENDADO':
      return { label: 'Pré-Agendado', variant: 'blue' as const };
    case 'AGUARDANDO_RESPOSTA_PACIENTE':
      return { label: 'Aguardando Paciente', variant: 'orange' as const };
    case 'CONFIRMADO':
      return { label: 'Confirmado', variant: 'green' as const };
    case 'CANCELADO':
      return { label: 'Cancelado', variant: 'red' as const };
    default:
      return { label: status, variant: 'gray' as const };
  }
}

function formatDateBR(iso: string | Date | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso instanceof Date ? iso.toISOString().split('T')[0] + 'T00:00:00' : String(iso).includes('T') ? iso : iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateShort(iso: string | Date | null | undefined) {
  if (!iso) return '—';
  const d = new Date(String(iso).includes('T') ? iso : (iso + 'T00:00:00'));
  return d.toLocaleDateString('pt-BR');
}

function calcIdade(dataNascimento: string | Date | null | undefined): string {
  if (!dataNascimento) return '';
  const nasc = new Date(String(dataNascimento).includes('T') ? dataNascimento : (dataNascimento + 'T00:00:00'));
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
  return `${anos} anos`;
}

// ─── Panel: Detalhes completos do paciente ───────────────────────────────────
interface PacienteDetailPanelProps {
  pacienteId: string;
  onClose: () => void;
}

function PacienteDetailPanel({ pacienteId, onClose }: PacienteDetailPanelProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historico, setHistorico] = useState<FilaRegulacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      detalhesPaciente(pacienteId),
      historicoRegulacaoPaciente(pacienteId),
    ])
      .then(([pac, hist]) => {
        if (cancelled) return;
        setPaciente(pac);
        const dados = hist.dados || hist || [];
        setHistorico(dados);
      })
      .catch((err) => console.error('Erro ao carregar detalhes do paciente:', err))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [pacienteId]);

  const proximo = historico.find(f =>
    (f.statusAgendamento === 'PRE_AGENDADO' || f.statusAgendamento === 'CONFIRMADO') &&
    f.dataAgendada &&
    new Date(String(f.dataAgendada).includes('T') ? f.dataAgendada : f.dataAgendada + 'T00:00:00') >= new Date()
  );

  const jaAvisado = historico.some(f =>
    f.statusAgendamento === 'AGUARDANDO_RESPOSTA_PACIENTE' || f.statusAgendamento === 'CONFIRMADO'
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Overlay click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-600 to-teal-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="font-bold text-white text-base">Detalhes do Paciente</h2>
              <p className="text-teal-100 text-xs">Cadastro completo e histórico de regulação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
              <p className="text-sm text-gray-500 font-medium">Carregando dados...</p>
            </div>
          </div>
        ) : !paciente ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
              <p className="text-sm text-gray-500">Não foi possível carregar os dados do paciente.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Próximo agendamento — destaque topo */}
            {proximo && (
              <div className={`px-6 py-4 ${proximo.statusAgendamento === 'CONFIRMADO'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
              } text-white`}>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
                  📅 Próximo Agendamento
                </p>
                <p className="font-bold text-lg">{formatDateBR(proximo.dataAgendada)}</p>
                <div className="flex items-center gap-3 mt-1 text-sm opacity-90">
                  <span>{proximo.horaAgendada}</span>
                  <span>·</span>
                  <span>{proximo.localAgendamento}</span>
                </div>
                <p className="text-xs opacity-80 mt-1">{proximo.procedimentoSolicitado}</p>
              </div>
            )}

            {/* Dados do Paciente */}
            <div className="p-6 space-y-5">
              {/* Identificação */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Identificação
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-lg leading-tight">{paciente.nomeCompleto}</p>
                      {paciente.nomeSocial && (
                        <p className="text-xs text-gray-500">Nome social: {paciente.nomeSocial}</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-1 rounded-lg shrink-0 ml-3">
                      #{paciente.prontuario}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">CPF</span>
                      <span className="font-semibold text-gray-800">{formatCPF(paciente.cpf)}</span>
                    </div>
                    {paciente.cartaoSus && (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block flex items-center gap-1">
                          <CreditCard className="h-3 w-3 inline" /> Cartão SUS
                        </span>
                        <span className="font-semibold text-gray-800">{paciente.cartaoSus}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Nascimento</span>
                      <span className="font-semibold text-gray-800">
                        {formatDateShort(paciente.dataNascimento)} ({calcIdade(paciente.dataNascimento)})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Sexo</span>
                      <span className="font-semibold text-gray-800">
                        {paciente.sexo === 'MASCULINO' ? 'Masculino'
                          : paciente.sexo === 'FEMININO' ? 'Feminino'
                          : paciente.sexo === 'OUTRO' ? 'Outro'
                          : 'Prefiro não informar'}
                      </span>
                    </div>
                    {paciente.corRaca && (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Cor/Raça</span>
                        <span className="font-semibold text-gray-800">{paciente.corRaca}</span>
                      </div>
                    )}
                    {paciente.tipoSanguineo && (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Tipo Sanguíneo</span>
                        <span className="font-semibold text-gray-800">{paciente.tipoSanguineo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Contato
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {paciente.celular && (
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4 text-green-600 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Celular (WhatsApp)</span>
                        <span className="font-semibold text-gray-800">{formatPhone(paciente.celular)}</span>
                      </div>
                    </div>
                  )}
                  {paciente.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Telefone Fixo</span>
                        <span className="font-semibold text-gray-800">{formatPhone(paciente.telefone)}</span>
                      </div>
                    </div>
                  )}
                  {paciente.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-4 w-4 text-gray-400 shrink-0 text-center">@</span>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Email</span>
                        <span className="font-semibold text-gray-800">{paciente.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5" /> Endereço
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  {paciente.situacaoRua ? (
                    <span className="text-amber-700 font-semibold">⚠️ Situação de Rua</span>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800">
                        {paciente.tipoLogradouro} {paciente.logradouro}, {paciente.numero}
                        {paciente.complemento ? `, ${paciente.complemento}` : ''}
                      </p>
                      <p className="text-gray-600">{paciente.bairro} — {paciente.municipio}</p>
                      <p className="text-gray-500 text-xs">CEP {paciente.cep}</p>
                    </div>
                  )}
                </div>
              </div>

              {paciente.alergias && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-red-700 uppercase block">Alergias</span>
                    <span className="text-sm text-red-800">{paciente.alergias}</span>
                  </div>
                </div>
              )}

              {/* Histórico de Regulação */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Histórico de Regulação ({historico.length})
                </h3>

                {historico.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <Stethoscope className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhuma ficha de regulação encontrada.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historico.map((ficha) => {
                      const badge = getStatusBadgeProps(ficha.statusAgendamento);
                      const isAgendado = ficha.statusAgendamento === 'PRE_AGENDADO' || ficha.statusAgendamento === 'CONFIRMADO';
                      const foiAvisado = ficha.statusAgendamento === 'AGUARDANDO_RESPOSTA_PACIENTE' || ficha.statusAgendamento === 'CONFIRMADO';
                      const isCancelado = ficha.statusAgendamento === 'CANCELADO';

                      return (
                        <div
                          key={ficha.id}
                          className={`rounded-xl border p-4 space-y-2 ${
                            isCancelado
                              ? 'bg-gray-50 border-gray-200 opacity-60'
                              : isAgendado
                              ? 'bg-white border-indigo-100 shadow-xs'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {ficha.procedimentoSolicitado}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                Solicitado em {formatDateShort((ficha as any).criadoEm)}
                              </p>
                            </div>
                            <StatusBadge status={badge.label} variant={badge.variant} />
                          </div>

                          {isAgendado && ficha.dataAgendada && (
                            <div className="grid grid-cols-3 gap-2 bg-indigo-50/60 rounded-lg p-2.5 text-xs">
                              <div className="flex items-center gap-1 text-indigo-800">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span className="font-semibold">{formatDateShort(ficha.dataAgendada)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-indigo-800">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span className="font-semibold">{ficha.horaAgendada || '—'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-indigo-800 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="font-semibold truncate">{ficha.localAgendamento || '—'}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-xs">
                            {foiAvisado ? (
                              <span className="flex items-center gap-1 text-green-700 font-semibold">
                                <MessageSquare className="h-3 w-3" />
                                WhatsApp enviado
                              </span>
                            ) : isAgendado ? (
                              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                <MessageSquare className="h-3 w-3" />
                                WhatsApp não enviado
                              </span>
                            ) : null}

                            {ficha.statusAgendamento === 'CONFIRMADO' && (
                              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                <CheckCircle2 className="h-3 w-3" />
                                Confirmado pelo paciente
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ConsultaRapidaRegulacao() {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<FilaRegulacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);

  // CPF mask + cartão SUS handling
  const handleBuscaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Remove separadores CPF para verificar se são apenas dígitos
    const stripped = raw.replace(/[.\-\s]/g, '');

    if (/^\d*$/.test(stripped) && stripped.length <= 11) {
      // Aplica máscara de CPF progressivamente
      setBusca(formatCPF(stripped) || stripped);
    } else {
      setBusca(raw);
    }
  }, []);

  useEffect(() => {
    const clean = busca.replace(/\D/g, '');
    const hasContent = busca.trim().length >= 3;

    if (!hasContent) {
      setResultados([]);
      if (busca.trim().length === 0) setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        // Envia o termo como está (formatado ou nome)
        const data = await consultaRapidaRegulacao(busca.trim());
        setResultados(data.dados || data || []);
        setSearched(true);
      } catch (err) {
        console.error('Erro na consulta rápida:', err);
        setResultados([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [busca]);

  // Agrupar por pacienteId para evitar duplicidade no resultado
  const pacientesUnicos = resultados.reduce<{ pacienteId: string; fichas: FilaRegulacao[] }[]>((acc, ficha) => {
    const existing = acc.find(g => g.pacienteId === ficha.pacienteId);
    if (existing) {
      existing.fichas.push(ficha);
    } else {
      acc.push({ pacienteId: ficha.pacienteId, fichas: [ficha] });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
          <Stethoscope className="h-8 w-8 text-teal-600" />
          Consulta Rápida — Regulação
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Pesquise por CPF ou Cartão SUS / CadÚnico para acesso universal aos encaminhamentos de qualquer unidade de saúde
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input
            type="text"
            placeholder="Nome, CPF (000.000.000-00) ou Cartão SUS..."
            className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl text-lg font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 placeholder:text-gray-400 bg-white shadow-sm transition-all"
            value={busca}
            onChange={handleBuscaChange}
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 animate-spin text-teal-600" />
          )}
        </div>
        {busca.trim().length > 0 && busca.trim().length < 3 && (
          <p className="text-xs text-gray-400 mt-2 text-center font-medium">
            Digite pelo menos 3 caracteres para pesquisar
          </p>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
          </div>
        )}

        {!loading && searched && pacientesUnicos.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Nenhum resultado encontrado</h3>
            <p className="text-sm text-gray-500 mt-1">
              Verifique o nome, CPF ou Cartão SUS digitado e tente novamente.
            </p>
          </div>
        )}

        {!loading && pacientesUnicos.map(({ pacienteId, fichas }) => {
          const fichaRecente = fichas[0];
          const paciente = fichaRecente.paciente!;
          const fichaAgendada = fichas.find(f =>
            f.statusAgendamento === 'PRE_AGENDADO' || f.statusAgendamento === 'CONFIRMADO'
          );
          const fichaAtiva = fichaAgendada || fichas.find(f => f.statusAgendamento === 'AGUARDANDO_REGULACAO') || fichaRecente;
          const badgeProps = getStatusBadgeProps(fichaAtiva.statusAgendamento);
          const isScheduled = fichaAtiva.statusAgendamento === 'PRE_AGENDADO' || fichaAtiva.statusAgendamento === 'CONFIRMADO';
          const isAguardando = fichaAtiva.statusAgendamento === 'AGUARDANDO_REGULACAO' || fichaAtiva.statusAgendamento === 'AGUARDANDO_RESPOSTA_PACIENTE';
          const isCancelado = fichaAtiva.statusAgendamento === 'CANCELADO';
          const jaAvisado = fichas.some(f => f.statusAgendamento === 'AGUARDANDO_RESPOSTA_PACIENTE' || f.statusAgendamento === 'CONFIRMADO');

          return (
            <div
              key={pacienteId}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer group"
              onClick={() => setSelectedPacienteId(pacienteId)}
            >
              {/* Patient Info Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:bg-teal-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{paciente?.nomeCompleto}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <span>CPF: {formatCPF(paciente?.cpf || '')}</span>
                      {(paciente as any)?.cartaoSus && (
                        <span>SUS: {(paciente as any).cartaoSus}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={badgeProps.label} variant={badgeProps.variant} />
                  {fichas.length > 1 && (
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {fichas.length} fichas
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                </div>
              </div>

              {/* Procedimento */}
              <div className="px-6 py-2 bg-gray-50/50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-600">
                  📋 {fichaAtiva.procedimentoSolicitado}
                </span>
              </div>

              {/* Scheduling Section */}
              {isScheduled && (
                <div className={`px-6 py-6 ${
                  fichaAtiva.statusAgendamento === 'CONFIRMADO'
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-b-4 border-emerald-500'
                    : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-b-4 border-blue-500'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <Calendar className={`h-7 w-7 ${fichaAtiva.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-600' : 'text-blue-600'}`} />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data</span>
                      <span className={`text-2xl font-black tracking-tight ${fichaAtiva.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'}`}>
                        {fichaAtiva.dataAgendada ? formatDateBR(fichaAtiva.dataAgendada) : '—'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <Clock className={`h-7 w-7 ${fichaAtiva.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-600' : 'text-blue-600'}`} />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Horário</span>
                      <span className={`text-2xl font-black tracking-tight ${fichaAtiva.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'}`}>
                        {fichaAtiva.horaAgendada || '—'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <MapPin className={`h-7 w-7 ${fichaAtiva.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-600' : 'text-blue-600'}`} />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Local</span>
                      <span className={`text-lg font-black tracking-tight ${fichaAtiva.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'}`}>
                        {fichaAtiva.localAgendamento || '—'}
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp status */}
                  <div className="mt-4 text-center">
                    {jaAvisado ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        <MessageSquare className="h-3 w-3" />
                        Paciente foi notificado via WhatsApp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                        <MessageSquare className="h-3 w-3" />
                        Paciente ainda não foi notificado
                      </span>
                    )}
                  </div>
                </div>
              )}

              {isAguardando && (
                <div className="px-6 py-5 bg-gray-50/70 flex items-center justify-center gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500">
                    {fichaAtiva.statusAgendamento === 'AGUARDANDO_REGULACAO'
                      ? 'Aguardando agendamento pela Secretaria'
                      : 'Aguardando confirmação do paciente'}
                  </span>
                </div>
              )}

              {isCancelado && (
                <div className="px-6 py-5 bg-red-50/50 flex items-center justify-center gap-3">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="text-sm font-semibold text-red-600">
                    Este agendamento foi cancelado
                  </span>
                </div>
              )}

              {/* Click hint */}
              <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium group-hover:text-teal-600 transition-colors">
                <User className="h-3 w-3" />
                Clique para ver o cadastro completo e histórico
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state when no search */}
      {!searched && !loading && (
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Pronto para pesquisar</h3>
          <p className="text-sm text-gray-500 mt-1">
            Digite o nome, CPF ou Cartão SUS do paciente na barra acima para verificar seu agendamento.
          </p>
        </div>
      )}

      {/* Patient Detail Panel */}
      {selectedPacienteId && (
        <PacienteDetailPanel
          pacienteId={selectedPacienteId}
          onClose={() => setSelectedPacienteId(null)}
        />
      )}
    </div>
  );
}
