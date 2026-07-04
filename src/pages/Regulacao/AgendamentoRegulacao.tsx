import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarCheck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Building2,
  FileText,
  Stethoscope,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { detalhesFichaRegulacao, agendarFichaRegulacao } from '../../services/regulacaoService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCPF } from '../../lib/utils';
import type { FilaRegulacao } from '../../types';

function getStatusBadgeProps(status: string) {
  switch (status) {
    case 'AGUARDANDO_REGULACAO':
      return { label: 'Aguardando Regulação', variant: 'yellow' as const };
    case 'PRE_AGENDADO':
      return { label: 'Pré-Agendado', variant: 'blue' as const };
    case 'CONFIRMADO':
      return { label: 'Confirmado', variant: 'green' as const };
    case 'CANCELADO':
      return { label: 'Cancelado', variant: 'red' as const };
    default:
      return { label: status, variant: 'gray' as const };
  }
}

export function AgendamentoRegulacao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dataAgendada, setDataAgendada] = useState('');
  const [horaAgendada, setHoraAgendada] = useState('');
  const [localAgendamento, setLocalAgendamento] = useState('');

  const { data: ficha, isLoading, isError } = useQuery({
    queryKey: ['regulacao-detalhe', id],
    queryFn: () => detalhesFichaRegulacao(id!),
    enabled: !!id,
    select: (res): FilaRegulacao => res.dados || res,
  });

  const agendarMutation = useMutation({
    mutationFn: () => agendarFichaRegulacao(id!, { dataAgendada, horaAgendada, localAgendamento }),
    onSuccess: () => {
      toast.success('Agendamento confirmado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['regulacao-fila'] });
      queryClient.invalidateQueries({ queryKey: ['regulacao-fila-counts'] });
      navigate(-1);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.erro || 'Erro ao confirmar agendamento.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataAgendada || !horaAgendada || !localAgendamento.trim()) {
      toast.error('Preencha todos os campos do agendamento.');
      return;
    }

    agendarMutation.mutate();
  };

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

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-indigo-600" />
            Agendamento de Regulação
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Analise os documentos e agende o procedimento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={badgeProps.label} variant={badgeProps.variant} />
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT SIDE: Document Viewer (60%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Paciente</span>
                  <span className="text-sm font-bold text-gray-900">{ficha.paciente?.nomeCompleto}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CPF</span>
                  <span className="text-sm font-semibold text-gray-700">{formatCPF(ficha.paciente?.cpf || '')}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Stethoscope className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Procedimento</span>
                  <span className="text-sm font-bold text-indigo-700">{ficha.procedimentoSolicitado}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Solicitado em</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {new Date(ficha.criadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {ficha.observacaoClinica && (
              <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">Observação Clínica</span>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">{ficha.observacaoClinica}</p>
              </div>
            )}
          </div>

          {/* Document Viewer */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              {isAnexoPdf ? (
                <FileText className="h-4 w-4 text-red-500" />
              ) : (
                <ImageIcon className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-xs font-bold text-gray-700">Documento Anexado</span>
            </div>

            {anexoUrl ? (
              <div className="bg-gray-100">
                {isAnexoPdf ? (
                  <iframe
                    src={`${anexoUrl}?token=${token}`}
                    className="w-full h-[600px] border-0"
                    title="Documento PDF"
                  />
                ) : isAnexoImage ? (
                  <div className="p-4 flex items-center justify-center min-h-[400px]">
                    <img
                      src={`${anexoUrl}?token=${token}`}
                      alt="Documento anexado"
                      className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">Formato não suportado para visualização</p>
                    <a
                      href={`${anexoUrl}?token=${token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs font-bold text-indigo-600 hover:text-indigo-500"
                    >
                      Baixar arquivo
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">Nenhum documento anexado</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Scheduling Form (40%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Read-only Info */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              Informações da Solicitação
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Unidade Solicitante</span>
                <span className="text-sm font-semibold text-gray-800">{ficha.unidadeEsfNome || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Responsável</span>
                <span className="text-sm font-semibold text-gray-800">{ficha.responsavelEncaminhamento}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ACS Responsável</span>
                <span className="text-sm font-semibold text-gray-800">{ficha.acsResponsavel}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tipo de Atendimento</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                  ficha.tipoAtendimento === 'SUS'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-purple-50 text-purple-700 border border-purple-100'
                }`}>
                  {ficha.tipoAtendimento}
                </span>
              </div>
            </div>
          </div>

          {/* Scheduling Form */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-transparent">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-indigo-600" />
                Agendar Procedimento
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Defina a data, hora e local do agendamento</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Data do Agendamento *</label>
                <input
                  type="date"
                  value={dataAgendada}
                  onChange={(e) => setDataAgendada(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Horário *</label>
                <input
                  type="time"
                  value={horaAgendada}
                  onChange={(e) => setHoraAgendada(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Local *</label>
                <input
                  type="text"
                  value={localAgendamento}
                  onChange={(e) => setLocalAgendamento(e.target.value)}
                  placeholder="Ex: Hospital Municipal, Sala 201"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={agendarMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {agendarMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {agendarMutation.isPending ? 'Confirmando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
