import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Phone,
  RefreshCw,
  Clock,
  CalendarCheck,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { listarFilaRegulacao, avisarPaciente } from '../../services/regulacaoService';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import type { FilaRegulacao } from '../../types';

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

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function PainelAcoesRegulacao() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedFichaId, setSelectedFichaId] = useState<string | null>(null);
  const [selectedPacienteNome, setSelectedPacienteNome] = useState('');

  // Fetch all fichas from the unit
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['regulacao-acoes'],
    queryFn: () => listarFilaRegulacao(),
    select: (res) => {
      const fichas: FilaRegulacao[] = res.dados || res || [];
      return fichas;
    },
  });

  const fichas = data || [];

  // Count by status
  const counts = {
    aguardando: fichas.filter(f => f.statusAgendamento === 'AGUARDANDO_REGULACAO').length,
    preAgendado: fichas.filter(f => f.statusAgendamento === 'PRE_AGENDADO').length,
    aguardandoPaciente: fichas.filter(f => f.statusAgendamento === 'AGUARDANDO_RESPOSTA_PACIENTE').length,
    confirmado: fichas.filter(f => f.statusAgendamento === 'CONFIRMADO').length,
    cancelado: fichas.filter(f => f.statusAgendamento === 'CANCELADO').length,
  };

  const fichasPreAgendadas = fichas.filter(f => f.statusAgendamento === 'PRE_AGENDADO');

  // Avisar paciente mutation
  const avisarMutation = useMutation({
    mutationFn: (id: string) => avisarPaciente(id),
    onSuccess: () => {
      toast.success('Paciente notificado com sucesso!');
      setConfirmModalOpen(false);
      setSelectedFichaId(null);
      queryClient.invalidateQueries({ queryKey: ['regulacao-acoes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.erro || 'Erro ao notificar paciente.');
    },
  });

  const handleAvisarPaciente = (ficha: FilaRegulacao) => {
    setSelectedFichaId(ficha.id);
    setSelectedPacienteNome(ficha.pacienteNome);
    setConfirmModalOpen(true);
  };

  const confirmAvisar = () => {
    if (selectedFichaId) {
      avisarMutation.mutate(selectedFichaId);
    }
  };

  const preAgendadoColumns: ColumnDef<FilaRegulacao>[] = [
    {
      header: 'Paciente',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-900">{row.pacienteNome}</span>
          <span className="text-[10px] text-gray-500">{row.pacienteTelefone}</span>
        </div>
      ),
    },
    {
      header: 'Procedimento',
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-700">{row.procedimentoSolicitado}</span>
      ),
    },
    {
      header: 'Data Agendada',
      cell: (row) => (
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
          {row.dataAgendada ? formatDate(row.dataAgendada) : '—'}
        </span>
      ),
    },
    {
      header: 'Hora',
      cell: (row) => (
        <span className="text-xs font-bold text-gray-800">{row.horaAgendada || '—'}</span>
      ),
    },
    {
      header: 'Local',
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-700">{row.localAgendamento || '—'}</span>
      ),
    },
  ];

  const allColumns: ColumnDef<FilaRegulacao>[] = [
    {
      header: 'Paciente',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-900">{row.pacienteNome}</span>
          <span className="text-[10px] text-gray-500">{row.pacienteCpf}</span>
        </div>
      ),
    },
    {
      header: 'Procedimento',
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-700 truncate max-w-[200px] inline-block">{row.procedimentoSolicitado}</span>
      ),
    },
    {
      header: 'Tipo',
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
          row.tipoAtendimento === 'SUS' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
        }`}>
          {row.tipoAtendimento}
        </span>
      ),
    },
    {
      header: 'Solicitação',
      cell: (row) => (
        <span className="text-xs text-gray-600">{formatDate(row.criadoEm)}</span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        const badge = getStatusBadgeProps(row.statusAgendamento);
        return <StatusBadge status={badge.label} variant={badge.variant} />;
      },
    },
  ];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-teal-600" />
            Painel de Ações — Regulação
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Gerencie fichas pré-agendadas e notifique pacientes
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 transition-all cursor-pointer active:scale-95 shadow-xs"
          title="Atualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-amber-400 border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Aguardando</span>
          <span className="text-2xl font-black text-gray-900">{counts.aguardando}</span>
          <div className="absolute right-3 bottom-3 text-amber-50">
            <Clock className="h-10 w-10" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-blue-500 border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pré-Agendados</span>
          <span className="text-2xl font-black text-gray-900">{counts.preAgendado}</span>
          <div className="absolute right-3 bottom-3 text-blue-50">
            <CalendarCheck className="h-10 w-10" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-orange-500 border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Aguardando Paciente</span>
          <span className="text-2xl font-black text-gray-900">{counts.aguardandoPaciente}</span>
          <div className="absolute right-3 bottom-3 text-orange-50">
            <MessageSquare className="h-10 w-10" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-500 border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Confirmados</span>
          <span className="text-2xl font-black text-gray-900">{counts.confirmado}</span>
          <div className="absolute right-3 bottom-3 text-emerald-50">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-red-400 border border-gray-200/80 shadow-xs flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Cancelados</span>
          <span className="text-2xl font-black text-gray-900">{counts.cancelado}</span>
          <div className="absolute right-3 bottom-3 text-red-50">
            <XCircle className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Pre-agendado Fichas - Primary Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Phone className="h-4 w-4 text-blue-600" />
          Fichas Pré-Agendadas — Avisar Pacientes
          {fichasPreAgendadas.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
              {fichasPreAgendadas.length}
            </span>
          )}
        </h2>

        {isLoading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : isError ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-gray-900 mb-1">Erro ao carregar</h3>
            <p className="text-xs text-gray-500 mb-4">Não foi possível carregar as fichas de regulação.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-all active:scale-95 cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        ) : fichasPreAgendadas.length === 0 ? (
          <EmptyState
            title="Nenhuma ficha pré-agendada"
            description="Quando a Secretaria pré-agendar fichas, elas aparecerão aqui para você notificar os pacientes."
            icon="database"
          />
        ) : (
          <DataTable
            data={fichasPreAgendadas}
            columns={preAgendadoColumns}
            rowActions={(row) => (
              <button
                onClick={() => handleAvisarPaciente(row)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                Avisar Paciente
              </button>
            )}
          />
        )}
      </div>

      {/* All Fichas - Secondary Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          Todas as Fichas da Unidade
          {fichas.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600">
              {fichas.length}
            </span>
          )}
        </h2>

        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : fichas.length === 0 ? (
          <EmptyState
            title="Nenhuma ficha cadastrada"
            description="Crie uma nova ficha de regulação para encaminhar pacientes."
            icon="database"
          />
        ) : (
          <DataTable data={fichas} columns={allColumns} pageSize={8} />
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setSelectedFichaId(null); }}
        onConfirm={confirmAvisar}
        title="Avisar Paciente"
        message={`Deseja confirmar a notificação ao paciente ${selectedPacienteNome}? O paciente será informado sobre o agendamento.`}
        confirmText="Sim, Avisar"
        cancelText="Cancelar"
        isLoading={avisarMutation.isPending}
      />
    </div>
  );
}
