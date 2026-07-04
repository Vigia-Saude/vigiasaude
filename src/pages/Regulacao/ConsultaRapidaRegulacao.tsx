import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { consultaRapidaRegulacao } from '../../services/regulacaoService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { FilaRegulacao } from '../../types';
import { formatCPF } from '../../lib/utils';

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
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function ConsultaRapidaRegulacao() {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<FilaRegulacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (busca.trim().length < 3) {
      setResultados([]);
      if (busca.trim().length === 0) setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
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
    }, 300);

    return () => clearTimeout(timer);
  }, [busca]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
          <Stethoscope className="h-8 w-8 text-teal-600" />
          Consulta Rápida — Regulação
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Pesquise por nome ou CPF do paciente para verificar o status do agendamento
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input
            type="text"
            placeholder="Digite o nome ou CPF do paciente..."
            className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl text-lg font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 placeholder:text-gray-400 bg-white shadow-sm transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
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

        {!loading && searched && resultados.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Nenhum resultado encontrado</h3>
            <p className="text-sm text-gray-500 mt-1">
              Verifique o nome ou CPF digitado e tente novamente.
            </p>
          </div>
        )}

        {!loading && resultados.map((ficha) => {
          const badgeProps = getStatusBadgeProps(ficha.statusAgendamento);
          const isScheduled = ficha.statusAgendamento === 'PRE_AGENDADO' || ficha.statusAgendamento === 'CONFIRMADO';
          const isAguardando = ficha.statusAgendamento === 'AGUARDANDO_REGULACAO' || ficha.statusAgendamento === 'AGUARDANDO_RESPOSTA_PACIENTE';
          const isCancelado = ficha.statusAgendamento === 'CANCELADO';

          return (
            <div
              key={ficha.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Patient Info Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{ficha.paciente?.nomeCompleto}</h3>
                    <p className="text-xs text-gray-500 font-medium">CPF: {formatCPF(ficha.paciente?.cpf || '')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={badgeProps.label} variant={badgeProps.variant} />
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {ficha.procedimentoSolicitado}
                  </span>
                </div>
              </div>

              {/* Scheduling Section — LARGE and BOLD for scheduled fichas */}
              {isScheduled && (
                <div className={`px-6 py-8 ${
                  ficha.statusAgendamento === 'CONFIRMADO'
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-b-4 border-emerald-500'
                    : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-b-4 border-blue-500'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className={`h-8 w-8 ${
                        ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-600' : 'text-blue-600'
                      }`} />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Data</span>
                      <span className={`text-4xl font-black tracking-tight ${
                        ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'
                      }`}>
                        {ficha.dataAgendada ? formatDateBR(ficha.dataAgendada) : '—'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <Clock className={`h-8 w-8 ${
                        ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-600' : 'text-blue-600'
                      }`} />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Horário</span>
                      <span className={`text-4xl font-black tracking-tight ${
                        ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'
                      }`}>
                        {ficha.horaAgendada || '—'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <MapPin className={`h-8 w-8 ${
                        ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-600' : 'text-blue-600'
                      }`} />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Local</span>
                      <span className={`text-2xl font-black tracking-tight ${
                        ficha.statusAgendamento === 'CONFIRMADO' ? 'text-emerald-800' : 'text-blue-800'
                      }`}>
                        {ficha.localAgendamento || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Aguardando Regulação */}
              {isAguardando && (
                <div className="px-6 py-6 bg-gray-50/70 flex items-center justify-center gap-3">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500">
                    {ficha.statusAgendamento === 'AGUARDANDO_REGULACAO'
                      ? 'Aguardando agendamento pela Secretaria'
                      : 'Aguardando confirmação do paciente'}
                  </span>
                </div>
              )}

              {/* Cancelado */}
              {isCancelado && (
                <div className="px-6 py-6 bg-red-50/50 flex items-center justify-center gap-3">
                  <XCircle className="h-6 w-6 text-red-400" />
                  <span className="text-sm font-semibold text-red-600">
                    Este agendamento foi cancelado
                  </span>
                </div>
              )}
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
            Digite o nome ou CPF do paciente na barra acima para verificar seu agendamento.
          </p>
        </div>
      )}
    </div>
  );
}
