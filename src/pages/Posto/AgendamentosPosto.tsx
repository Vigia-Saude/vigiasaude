import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  Search, 
  User, 
  Clock, 
  Filter, 
  RefreshCw,
  FilePlus2
} from 'lucide-react';
import { Link } from 'react-router';
import { listarFilaRegulacao } from '../../services/regulacaoService';
import { formatCPF } from '../../lib/utils';
import type { FilaRegulacao } from '../../types';

export function AgendamentosPosto() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ['agendamentos-posto'],
    queryFn: () => listarFilaRegulacao(),
  });

  const fichas: FilaRegulacao[] = Array.isArray(responseData) ? responseData : responseData?.dados || responseData?.fichas || [];

  const agendamentosFiltrados = fichas.filter((f: FilaRegulacao) => {
    const term = searchTerm.toLowerCase();
    const nome = f.paciente?.nomeCompleto?.toLowerCase() || '';
    const cpf = f.paciente?.cpf || '';
    const proc = f.procedimentoSolicitado?.toLowerCase() || '';

    const matchesSearch = nome.includes(term) || cpf.includes(term) || proc.includes(term);
    const matchesStatus = statusFilter === 'TODOS' || f.statusAgendamento === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="h-7 w-7 text-cyan-600" />
            Agendamentos do Dia da UBS
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Agenda e lista de pacientes vinculados aos atendimentos da unidade de saúde.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
          <Link
            to="/posto/regulacao/nova"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-xs transition-all"
          >
            <FilePlus2 className="h-4 w-4" />
            Nova Ficha
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por paciente, CPF ou procedimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="AGUARDANDO_REGULACAO">Aguardando Regulação</option>
            <option value="PRE_AGENDADO">Pré-Agendado</option>
            <option value="CONFIRMADO">Confirmado</option>
          </select>
        </div>
      </div>

      {/* List / Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-150">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-600" />
          <span className="ml-2 text-sm text-gray-500">Carregando agendamentos...</span>
        </div>
      ) : agendamentosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-150">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Nenhum agendamento encontrado</h3>
          <p className="text-xs text-gray-500 mt-1">Não existem solicitações cadastradas com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase border-b border-gray-150">
                <tr>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">CPF</th>
                  <th className="px-6 py-3.5">Procedimento</th>
                  <th className="px-6 py-3.5">Profissional / ACS</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agendamentosFiltrados.map((item: FilaRegulacao) => (
                  <tr key={item.id} className="hover:bg-cyan-50/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                        <User className="h-4 w-4" />
                      </div>
                      {item.paciente?.nomeCompleto || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {item.paciente?.cpf ? formatCPF(item.paciente.cpf) : '-'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.procedimentoSolicitado}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div><span className="font-semibold text-gray-700">Resp:</span> {item.responsavelEncaminhamento}</div>
                      <div><span className="font-semibold text-gray-700">ACS:</span> {item.acsResponsavel}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        {item.statusAgendamento || 'REGULAÇÃO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/posto/regulacao/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Ver Ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
