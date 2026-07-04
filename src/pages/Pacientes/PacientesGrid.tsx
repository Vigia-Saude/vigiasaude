import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { 
  Users, 
  Search, 
  UserPlus, 
  RefreshCw, 
  Eye, 
  Edit,
  AlertCircle
} from 'lucide-react';
import { listarPacientes } from '../../services/pacienteService';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { TableSkeleton } from '../../components/ui/TableSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import type { Paciente } from '../../types';

export function PacientesGrid() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Se for CPF exato (ou CNS exato) ou termo com mais de 3 chars, atualizamos imediatamente/rapidamente
    const isDoc = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value) || /^\d{11}$/.test(value) || /^\d{15}$/.test(value);
    
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1); // Reseta para a primeira página ao buscar
    }, isDoc ? 100 : 400);

    return () => clearTimeout(timeoutId);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['pacientes', debouncedSearch, currentPage],
    queryFn: () => listarPacientes({ busca: debouncedSearch, page: currentPage, limit: 10 }),
  });

  const response = data || { total: 0, dados: [] };
  const pacientes: Paciente[] = response.dados || [];
  const total = response.total || 0;

  // Relações do grid de colunas
  const columns: ColumnDef<Paciente>[] = [
    {
      header: 'Prontuário',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
          {row.prontuario}
        </span>
      ),
    },
    {
      header: 'Nome Completo',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.nomeCompleto}</span>
          {row.nomeMae && (
            <span className="text-xs text-gray-400 font-normal">Mãe: {row.nomeMae}</span>
          )}
        </div>
      ),
    },
    {
      header: 'CPF / Cartão SUS',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-gray-700 font-mono">{row.cpf}</span>
          {row.cartaoSus && (
            <span className="text-xs text-gray-500 font-mono">SUS: {row.cartaoSus}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Telefone',
      cell: (row) => <span className="text-sm text-gray-600 font-mono">{row.telefone}</span>,
    },
    {
      header: 'Data de Nascimento',
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </span>
      ),
    },
  ];

  const handleRowActions = (row: Paciente) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(`/posto/pacientes/editar/${row.id}`)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        title="Editar Paciente"
      >
        <Edit className="h-4.5 w-4.5 stroke-[1.5]" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-600" />
            Cadastro de Pacientes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie o cadastro de pacientes vinculados a esta unidade de saúde.
          </p>
        </div>
        <button
          onClick={() => navigate('/posto/pacientes/novo')}
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" />
          Cadastrar Paciente
        </button>
      </div>

      {/* Search & Refresh */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400 stroke-[1.8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por Nome, CPF ou Cartão SUS..."
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors w-full md:w-auto justify-center"
        >
          <RefreshCw className="h-4 w-4" />
          Recarregar
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <TableSkeleton rows={5} columns={5} />
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-semibold text-sm">Erro ao carregar pacientes</h3>
            <p className="text-xs text-red-650 mt-0.5">Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.</p>
          </div>
        </div>
      ) : pacientes.length === 0 ? (
        <EmptyState
          title="Nenhum paciente cadastrado"
          description={
            debouncedSearch 
              ? `Nenhum paciente encontrado para a busca "${debouncedSearch}".`
              : "Cadastre pacientes para poder criar Fichas de Regulação."
          }
          icon={debouncedSearch ? 'search' : 'database'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <DataTable
            data={pacientes}
            columns={columns}
            rowActions={handleRowActions}
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
}
export default PacientesGrid;
