import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Heart,
  CalendarCheck,
  Shield,
  Building2,
  FileText,
  Image as ImageIcon,
  Clock,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { detalhesFichaRegulacao } from '../../services/regulacaoService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCPF, formatPhone } from '../../lib/utils';
import type { FilaRegulacao, StatusAgendamento } from '../../types';

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

function formatDateBR(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatDateTimeBR(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TimelineStep {
  label: string;
  status: StatusAgendamento;
  description: string;
  reached: boolean;
  current: boolean;
}

function getTimeline(currentStatus: StatusAgendamento): TimelineStep[] {
  const statusOrder: StatusAgendamento[] = [
    'AGUARDANDO_REGULACAO',
    'PRE_AGENDADO',
    'AGUARDANDO_RESPOSTA_PACIENTE',
    'CONFIRMADO',
  ];

  const labels: Record<StatusAgendamento, string> = {
    AGUARDANDO_REGULACAO: 'Solicitação Recebida',
    PRE_AGENDADO: 'Pré-Agendado pela Secretaria',
    AGUARDANDO_RESPOSTA_PACIENTE: 'Paciente Notificado',
    CONFIRMADO: 'Agendamento Confirmado',
    CANCELADO: 'Cancelado',
  };

  const descriptions: Record<StatusAgendamento, string> = {
    AGUARDANDO_REGULACAO: 'Ficha inserida na fila de regulação',
    PRE_AGENDADO: 'Data e local definidos pela Secretaria',
    AGUARDANDO_RESPOSTA_PACIENTE: 'ESF notificou o paciente sobre o agendamento',
    CONFIRMADO: 'Paciente confirmou presença no agendamento',
    CANCELADO: 'Agendamento foi cancelado',
  };

  if (currentStatus === 'CANCELADO') {
    return [
      { label: labels.AGUARDANDO_REGULACAO, status: 'AGUARDANDO_REGULACAO', description: descriptions.AGUARDANDO_REGULACAO, reached: true, current: false },
      { label: labels.CANCELADO, status: 'CANCELADO', description: descriptions.CANCELADO, reached: true, current: true },
    ];
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return statusOrder.map((s, i) => ({
    label: labels[s],
    status: s,
    description: descriptions[s],
    reached: i <= currentIndex,
    current: i === currentIndex,
  }));
}

export function DetalhesFichaRegulacao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: ficha, isLoading, isError } = useQuery({
    queryKey: ['regulacao-detalhe', id],
    queryFn: () => detalhesFichaRegulacao(id!),
    enabled: !!id,
    select: (res): FilaRegulacao => res.dados || res,
  });

  // Build anexo URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('vigiasaude_token');
  const anexoUrl = ficha?.anexoUrl ? `${baseUrl}${ficha.anexoUrl}` : null;
  const isAnexoPdf = ficha?.anexoUrl?.toLowerCase().endsWith('.pdf');
  const isAnexoImage = ficha?.anexoUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(ficha.anexoUrl);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-500">Carregando ficha...</p>
        </div>
      </div>
    );
  }

  if (isError || !ficha) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h3 className="text-sm font-bold text-gray-900">Erro ao carregar ficha</h3>
          <p className="text-xs text-gray-500">Não foi possível encontrar os dados desta ficha.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const badgeProps = getStatusBadgeProps(ficha.statusAgendamento);
  const timeline = getTimeline(ficha.statusAgendamento);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Detalhes da Ficha
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Ficha de regulação — {ficha.paciente?.nomeCompleto}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={badgeProps.label} variant={badgeProps.variant} className="text-sm px-4 py-1" />
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-600" />
          Linha do Tempo
        </h2>
        <div className="relative">
          {timeline.map((step, idx) => (
            <div key={step.status} className="flex gap-4 mb-6 last:mb-0">
              {/* Connector */}
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                  step.current
                    ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-50'
                    : step.reached
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-gray-200 text-gray-300'
                }`}>
                  {step.reached && !step.current ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                {idx < timeline.length - 1 && (
                  <div className={`w-0.5 flex-1 min-h-[24px] ${
                    step.reached && timeline[idx + 1]?.reached ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="pt-1 pb-2">
                <h4 className={`text-sm font-bold ${
                  step.current ? 'text-indigo-700' : step.reached ? 'text-emerald-700' : 'text-gray-400'
                }`}>
                  {step.label}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section: Dados do Paciente */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Dados do Paciente
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nome Completo</span>
                <span className="text-sm font-bold text-gray-900">{ficha.paciente?.nomeCompleto}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CPF</span>
                <span className="text-sm font-semibold text-gray-700">{formatCPF(ficha.paciente?.cpf || '')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Data de Nascimento</span>
                <span className="text-sm font-semibold text-gray-700">{formatDateBR(ficha.paciente?.dataNascimento || '')}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400 mt-1" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Telefone</span>
                  <span className="text-sm font-semibold text-gray-700">{formatPhone(ficha.paciente?.telefone || '')}</span>
                </div>
              </div>
              {ficha.paciente?.cartaoSus && (
                <div className="flex items-start gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-gray-400 mt-1" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cartão SUS</span>
                    <span className="text-sm font-semibold text-gray-700">{ficha.paciente.cartaoSus}</span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tipo Atendimento</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                  ficha.tipoAtendimento === 'SUS'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-purple-50 text-purple-700 border border-purple-100'
                }`}>
                  {ficha.tipoAtendimento}
                </span>
              </div>
            </div>
            {ficha.paciente && (
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-1" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Endereço</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {ficha.paciente.logradouro}, {ficha.paciente.numero} - {ficha.paciente.bairro}, {ficha.paciente.municipio} - CEP {ficha.paciente.cep}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Agendamento */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className={`px-6 py-4 border-b border-gray-100 ${
            ficha.dataAgendada
              ? 'bg-gradient-to-r from-emerald-50/50 to-transparent'
              : 'bg-gradient-to-r from-gray-50/50 to-transparent'
          }`}>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CalendarCheck className={`h-4 w-4 ${ficha.dataAgendada ? 'text-emerald-600' : 'text-gray-400'}`} />
              Agendamento
            </h2>
          </div>

          {ficha.dataAgendada ? (
            <div className="p-6">
              <div className={`p-6 rounded-xl text-center space-y-4 ${
                ficha.statusAgendamento === 'CONFIRMADO'
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200'
              }`}>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Data</span>
                  <span className={`text-2xl font-black ${
                    ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'
                  }`}>
                    {formatDateBR(ficha.dataAgendada)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Horário</span>
                  <span className={`text-2xl font-black ${
                    ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'
                  }`}>
                    {ficha.horaAgendada || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Local</span>
                  <span className={`text-lg font-bold ${
                    ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'
                  }`}>
                    {ficha.localAgendamento || '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex items-center justify-center text-center">
              <div>
                <CalendarCheck className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">Ainda não agendado</p>
                <p className="text-xs text-gray-400 mt-1">A Secretaria irá definir data, hora e local</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section: Dados Clínicos + Documento */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50/50 to-transparent">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-600" />
            Dados Clínicos
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Procedimento Solicitado</span>
            <span className="text-sm font-bold text-gray-900">{ficha.procedimentoSolicitado}</span>
          </div>

          {ficha.observacaoClinica && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">Observação Clínica</span>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">{ficha.observacaoClinica}</p>
            </div>
          )}

          {/* Document Viewer */}
          {anexoUrl && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                {isAnexoPdf ? (
                  <FileText className="h-4 w-4 text-red-500" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-xs font-bold text-gray-700">Documento Anexado</span>
              </div>
              <div className="bg-gray-100">
                {isAnexoPdf ? (
                  <iframe
                    src={`${anexoUrl}?token=${token}`}
                    className="w-full h-[500px] border-0"
                    title="Documento PDF"
                  />
                ) : isAnexoImage ? (
                  <div className="p-4 flex items-center justify-center">
                    <img
                      src={`${anexoUrl}?token=${token}`}
                      alt="Documento anexado"
                      className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <a
                      href={`${anexoUrl}?token=${token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
                    >
                      Baixar documento
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section: Informações de Auditoria */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50/80 to-transparent">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-600" />
            Informações de Auditoria
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Rastreabilidade completa da ficha</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900">Solicitado por</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="text-xs font-semibold text-gray-700">{ficha.criadoPorNome || 'Não informado'}</span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-xs text-gray-500">{formatDateTimeBR(ficha.criadoEm)}</span>
              </div>
              {ficha.unidadeEsfNome && (
                <div className="flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3 text-gray-400" />
                  <span className="text-[10px] font-semibold text-gray-500">{ficha.unidadeEsfNome}</span>
                </div>
              )}
            </div>
          </div>

          {ficha.agendadoPorNome && (
            <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900">Agendado por</span>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-semibold text-gray-700">{ficha.agendadoPorNome}</span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{formatDateTimeBR(ficha.atualizadoEm)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
