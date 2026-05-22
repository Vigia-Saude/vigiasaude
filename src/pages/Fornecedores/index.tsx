import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Building2, Plus, Search, Eye, Edit, Power, X, Mail, Phone, 
  AlertCircle, ShieldAlert, Award, FileText, ClipboardList, Ban, CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  getFornecedores, getFornecedorDetalhes, createFornecedor, 
  updateFornecedor, toggleFornecedorStatus, FornecedorDetails 
} from '../../services/fornecedorService';
import type { Fornecedor, FornecedorStatus } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import type { ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TableSkeleton } from '../../components/ui/TableSkeleton';

// Masking helpers
export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Allowed categories
const CATEGORIES = [
  'Material Hospitalar',
  'Medicamentos',
  'Equipamentos',
  'Genéricos',
  'Controlados',
  'Importados'
];

// Zod Schema
const fornecedorSchema = z.object({
  cnpj: z.string().min(18, 'CNPJ incompleto').max(18, 'CNPJ inválido'),
  razaoSocial: z.string().min(3, 'Mínimo de 3 caracteres'),
  nomeFantasia: z.string().min(3, 'Mínimo de 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  whatsapp: z.string().min(14, 'WhatsApp incompleto'),
  categorias: z.array(z.string()).min(1, 'Selecione pelo menos uma categoria'),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

export function FornecedoresLista() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Debounce search query to avoid flickering on every key press
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Modals / Drawer State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerDetails, setDrawerDetails] = useState<FornecedorDetails | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const total = fornecedores.length;
    const ativos = fornecedores.filter(f => f.status === 'ATIVO').length;
    const inativos = total - ativos;
    const mediaTaxa = total > 0 
      ? Number(fornecedores.reduce((acc, curr) => acc + Number(curr.taxaAceitacao), 0) / total) 
      : 100;
    return { total, ativos, inativos, mediaTaxa };
  }, [fornecedores]);

  // Fetch Data Function
  const fetchFornecedoresData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        query: debouncedQuery || undefined,
        status: statusFilter || undefined,
        categoria: categoryFilter || undefined
      };
      const result = await getFornecedores(params);
      setFornecedores(result);
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
      setError('Ocorreu um erro ao carregar a lista de fornecedores.');
      toast.error('Erro ao carregar fornecedores');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch on filter change
  useEffect(() => {
    fetchFornecedoresData();
  }, [debouncedQuery, statusFilter, categoryFilter]);

  // Handle toggle status
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleFornecedorStatus(id);
      toast.success('Status do fornecedor alterado com sucesso!');
      fetchFornecedoresData();
      
      // Update drawer if open
      if (isDrawerOpen && drawerDetails && drawerDetails.id === id) {
        openDrawer(id);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao alterar status do fornecedor.';
      toast.error(errorMsg);
    }
  };

  // Open details drawer
  const openDrawer = async (id: string) => {
    setIsDrawerOpen(true);
    setIsDrawerLoading(true);
    setDrawerDetails(null);
    try {
      const details = await getFornecedorDetalhes(id);
      setDrawerDetails(details);
    } catch (err) {
      console.error('Erro ao carregar detalhes do fornecedor:', err);
      toast.error('Não foi possível carregar os detalhes do fornecedor.');
      setIsDrawerOpen(false);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  // Form setups
  const createForm = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    mode: 'onChange',
    defaultValues: {
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      email: '',
      whatsapp: '',
      categorias: [],
    }
  });

  const editForm = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    mode: 'onChange'
  });

  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjLookupError, setCnpjLookupError] = useState<string | null>(null);

  const cnpjValue = createForm.watch('cnpj');

  // Auto-fetch Razão Social and Nome Fantasia from BrasilAPI when CNPJ is valid
  useEffect(() => {
    if (!cnpjValue) {
      setCnpjLookupError(null);
      return;
    }
    const cleanCnpj = cnpjValue.replace(/\D/g, '');
    if (cleanCnpj.length === 14) {
      const fetchCnpj = async () => {
        try {
          setIsSearchingCnpj(true);
          setCnpjLookupError(null);
          const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
          if (res.ok) {
            const data = await res.json();
            if (data.razao_social) {
              createForm.setValue('razaoSocial', data.razao_social, { shouldValidate: true });
              if (data.nome_fantasia) {
                createForm.setValue('nomeFantasia', data.nome_fantasia, { shouldValidate: true });
              }
              toast.success('Fornecedor localizado com sucesso via BrasilAPI!');
            } else {
              setCnpjLookupError('CNPJ válido, mas dados da Razão Social não encontrados.');
              createForm.setError('cnpj', { type: 'manual', message: 'Dados da Razão Social não encontrados' });
            }
          } else {
            setCnpjLookupError('CNPJ não encontrado na base do BrasilAPI.');
            createForm.setError('cnpj', { type: 'manual', message: 'CNPJ não encontrado ou inválido' });
          }
        } catch (err) {
          console.error('Erro ao buscar CNPJ:', err);
          setCnpjLookupError('Erro de conexão ao buscar CNPJ.');
          createForm.setError('cnpj', { type: 'manual', message: 'Erro ao validar CNPJ' });
        } finally {
          setIsSearchingCnpj(false);
        }
      };
      fetchCnpj();
    } else if (cleanCnpj.length > 0 && cleanCnpj.length < 14) {
      setCnpjLookupError('CNPJ incompleto');
    } else {
      setCnpjLookupError(null);
    }
  }, [cnpjValue, createForm]);

  // Handle open modals
  const handleOpenCreate = () => {
    createForm.reset({
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      email: '',
      whatsapp: '',
      categorias: [],
    });
    setCnpjLookupError(null);
    setIsSearchingCnpj(false);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    editForm.reset({
      cnpj: fornecedor.cnpj,
      razaoSocial: fornecedor.razaoSocial,
      nomeFantasia: fornecedor.nomeFantasia,
      email: fornecedor.email,
      whatsapp: fornecedor.whatsapp,
      categorias: fornecedor.categorias || [],
    });
    setIsEditOpen(true);
  };

  // Submit operations
  const onCreateSubmit = async (data: FornecedorFormData) => {
    try {
      await createFornecedor(data);
      toast.success('Fornecedor cadastrado com sucesso!');
      setIsCreateOpen(false);
      fetchFornecedoresData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao cadastrar fornecedor.';
      toast.error(errorMsg);
    }
  };

  const onEditSubmit = async (data: FornecedorFormData) => {
    if (!selectedFornecedor) return;
    try {
      await updateFornecedor(selectedFornecedor.id, {
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        email: data.email,
        whatsapp: data.whatsapp,
        categorias: data.categorias
      });
      toast.success('Fornecedor atualizado com sucesso!');
      setIsEditOpen(false);
      fetchFornecedoresData();
      
      // Update drawer if open
      if (isDrawerOpen && drawerDetails && drawerDetails.id === selectedFornecedor.id) {
        openDrawer(selectedFornecedor.id);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar fornecedor.';
      toast.error(errorMsg);
    }
  };

  // Datatable Columns
  const columns: ColumnDef<Fornecedor>[] = [
    {
      header: 'Razão Social',
      accessorKey: 'razaoSocial',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-gray-900 leading-tight">{row.razaoSocial}</span>
      ),
    },
    {
      header: 'Nome Fantasia',
      accessorKey: 'nomeFantasia',
      sortable: true,
      cell: (row) => (
        <span className="text-gray-700 font-medium">{row.nomeFantasia}</span>
      ),
    },
    {
      header: 'CNPJ',
      accessorKey: 'cnpj',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs text-gray-700">{row.cnpj}</span>,
    },
    {
      header: 'Contatos',
      cell: (row) => (
        <div className="flex flex-col gap-0.5 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>{row.whatsapp}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Categorias',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.categorias?.map(cat => (
            <span 
              key={cat} 
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
            >
              {cat}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Taxa de Aceitação',
      accessorKey: 'taxaAceitacao',
      sortable: true,
      cell: (row) => {
        const val = Number(row.taxaAceitacao);
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${val >= 90 ? 'text-green-600' : val >= 75 ? 'text-orange-500' : 'text-red-500'}`}>
              {val.toFixed(1)}%
            </span>
            <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${val >= 90 ? 'bg-green-500' : val >= 75 ? 'bg-orange-400' : 'bg-red-500'}`} 
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => (
        <StatusBadge 
          status={row.status === 'ATIVO' ? 'ATIVO' : 'INATIVO'} 
          variant={row.status === 'ATIVO' ? 'green' : 'gray'} 
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Gestão de Fornecedores
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre novos fornecedores parceiros, edite informações de contato e consulte dados gerais.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Fornecedor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">Total de Fornecedores</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">Fornecedores Ativos</p>
          <p className="text-3xl font-extrabold text-green-600 mt-2">{stats.ativos}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">Fornecedores Inativos</p>
          <p className="text-3xl font-extrabold text-gray-400 mt-2">{stats.inativos}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-500">Taxa de Aceitação Média</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">
            {stats.mediaTaxa.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por CNPJ, Razão Social ou Nome Fantasia..."
            className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>

        <div className="w-full md:w-56">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas as Categorias</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {(query || statusFilter || categoryFilter) && (
          <button
            onClick={() => {
              setQuery('');
              setStatusFilter('');
              setCategoryFilter('');
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors w-full md:w-auto text-center"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Main Table */}
      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-semibold text-red-900">Erro no carregamento</h3>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button 
            onClick={fetchFornecedoresData}
            className="mt-4 inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-500"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <DataTable
          data={fornecedores}
          columns={columns}
          rowActions={(row) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => openDrawer(row.id)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9"
                title="Visualizar Detalhes"
              >
                <Eye className="h-4.5 w-4.5 text-blue-600" />
              </button>
              
              <button
                onClick={() => handleOpenEdit(row)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9"
                title="Editar Fornecedor"
              >
                <Edit className="h-4.5 w-4.5 text-yellow-600" />
              </button>

              <button
                onClick={() => handleToggleStatus(row.id)}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 w-9 ${
                  row.status === 'ATIVO' ? 'text-red-600' : 'text-green-600'
                }`}
                title={row.status === 'ATIVO' ? 'Inativar Fornecedor' : 'Ativar Fornecedor'}
              >
                <Power className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        />
      )}

      {/* ================= REGISTER MODAL ================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Cadastrar Novo Fornecedor
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CNPJ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="00.000.000/0000-00"
                      className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 ${
                        createForm.formState.errors.cnpj || cnpjLookupError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                      }`}
                      {...createForm.register('cnpj')}
                      onChange={(e) => {
                        const masked = maskCNPJ(e.target.value);
                        createForm.setValue('cnpj', masked, { shouldValidate: true });
                      }}
                    />
                    {isSearchingCnpj && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  {(createForm.formState.errors.cnpj || cnpjLookupError) && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {createForm.formState.errors.cnpj?.message || cnpjLookupError}
                    </p>
                  )}
                </div>

                {/* Razão Social */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    placeholder="Empresa Ltda"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      createForm.formState.errors.razaoSocial ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                    }`}
                    {...createForm.register('razaoSocial')}
                  />
                  {createForm.formState.errors.razaoSocial && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{createForm.formState.errors.razaoSocial.message}</p>
                  )}
                </div>

                {/* Nome Fantasia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia *</label>
                  <input
                    type="text"
                    placeholder="Nome Comercial"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      createForm.formState.errors.nomeFantasia ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                    }`}
                    {...createForm.register('nomeFantasia')}
                  />
                  {createForm.formState.errors.nomeFantasia && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{createForm.formState.errors.nomeFantasia.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="contato@fornecedor.com"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      createForm.formState.errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                    }`}
                    {...createForm.register('email')}
                  />
                  {createForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{createForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      createForm.formState.errors.whatsapp ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                    }`}
                    {...createForm.register('whatsapp')}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      createForm.setValue('whatsapp', masked, { shouldValidate: true });
                    }}
                  />
                  {createForm.formState.errors.whatsapp && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{createForm.formState.errors.whatsapp.message}</p>
                  )}
                </div>
              </div>

              {/* Categories Selector */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categorias Atendidas *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const currentSelected = createForm.watch('categorias') || [];
                    const isChecked = currentSelected.includes(cat);
                    
                    return (
                      <label 
                        key={cat} 
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm cursor-pointer transition-all select-none hover:bg-gray-50 ${
                          isChecked 
                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-medium' 
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isChecked}
                          onChange={() => {
                            const nextVal = isChecked 
                              ? currentSelected.filter(item => item !== cat)
                              : [...currentSelected, cat];
                            createForm.setValue('categorias', nextVal, { shouldValidate: true });
                          }}
                        />
                        {cat}
                      </label>
                    );
                  })}
                </div>
                {createForm.formState.errors.categorias && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{createForm.formState.errors.categorias.message}</p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!createForm.formState.isValid}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {isEditOpen && selectedFornecedor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Editar Fornecedor: {selectedFornecedor.nomeFantasia}
              </h2>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CNPJ (Disabled/Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">CNPJ (Não alterável)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                    {...editForm.register('cnpj')}
                  />
                </div>

                {/* Razão Social */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    placeholder="Empresa Ltda"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      editForm.formState.errors.razaoSocial ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                    }`}
                    {...editForm.register('razaoSocial')}
                  />
                  {editForm.formState.errors.razaoSocial && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{editForm.formState.errors.razaoSocial.message}</p>
                  )}
                </div>

                {/* Nome Fantasia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia *</label>
                  <input
                    type="text"
                    placeholder="Nome Comercial"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      editForm.formState.errors.nomeFantasia ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                    }`}
                    {...editForm.register('nomeFantasia')}
                  />
                  {editForm.formState.errors.nomeFantasia && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{editForm.formState.errors.nomeFantasia.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="contato@fornecedor.com"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      editForm.formState.errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                    }`}
                    {...editForm.register('email')}
                  />
                  {editForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{editForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      editForm.formState.errors.whatsapp ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-100'
                    }`}
                    {...editForm.register('whatsapp')}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      editForm.setValue('whatsapp', masked, { shouldValidate: true });
                    }}
                  />
                  {editForm.formState.errors.whatsapp && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{editForm.formState.errors.whatsapp.message}</p>
                  )}
                </div>
              </div>

              {/* Categories Selector */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categorias Atendidas *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const currentSelected = editForm.watch('categorias') || [];
                    const isChecked = currentSelected.includes(cat);
                    
                    return (
                      <label 
                        key={cat} 
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm cursor-pointer transition-all select-none hover:bg-gray-50 ${
                          isChecked 
                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-medium' 
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isChecked}
                          onChange={() => {
                            const nextVal = isChecked 
                              ? currentSelected.filter(item => item !== cat)
                              : [...currentSelected, cat];
                            editForm.setValue('categorias', nextVal, { shouldValidate: true });
                          }}
                        />
                        {cat}
                      </label>
                    );
                  })}
                </div>
                {editForm.formState.errors.categorias && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{editForm.formState.errors.categorias.message}</p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!editForm.formState.isValid}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DETAILS DRAWER ================= */}
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <div 
            onClick={() => setIsDrawerOpen(false)} 
            className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Detalhes do Fornecedor</h2>
                <p className="text-xs text-gray-500 mt-0.5">Visão geral do parceiro credenciado</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isDrawerLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-150 rounded"></div>
                  <div className="border border-gray-100 rounded-xl p-4 space-y-3 mt-4">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-150 rounded"></div>
                  </div>
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                </div>
              ) : drawerDetails ? (
                <>
                  {/* Visual Header Identity */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">{drawerDetails.nomeFantasia}</h3>
                        <StatusBadge 
                          status={drawerDetails.status === 'ATIVO' ? 'ATIVO' : 'INATIVO'} 
                          variant={drawerDetails.status === 'ATIVO' ? 'green' : 'gray'} 
                        />
                      </div>
                      <p className="text-sm text-gray-500 font-mono mt-0.5">{drawerDetails.cnpj}</p>
                    </div>
                  </div>

                  {/* Informações Básicas & Desempenho */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Razão Social</span>
                      <span className="text-sm font-semibold text-gray-900 mt-1 block leading-tight">{drawerDetails.razaoSocial}</span>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Taxa de Aceitação</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Award className={`w-4 h-4 ${Number(drawerDetails.taxaAceitacao) >= 90 ? 'text-green-500' : 'text-orange-500'}`} />
                          <span className="text-base font-bold text-gray-900">{Number(drawerDetails.taxaAceitacao).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mt-1.5">
                        <div 
                          className={`h-full rounded-full ${Number(drawerDetails.taxaAceitacao) >= 90 ? 'bg-green-500' : 'bg-orange-500'}`} 
                          style={{ width: `${drawerDetails.taxaAceitacao}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contatos */}
                  <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Contatos e Comunicação</h4>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`mailto:${drawerDetails.email}`} 
                          className="font-medium hover:text-blue-600 hover:underline transition-colors"
                        >
                          {drawerDetails.email}
                        </a>
                      </div>
                      <a 
                        href={`mailto:${drawerDetails.email}`} 
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Enviar E-mail
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{drawerDetails.whatsapp}</span>
                      </div>
                      <a 
                        href={`https://wa.me/${drawerDetails.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-semibold text-green-600 hover:underline"
                      >
                        Chamar no WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Categorias */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Categorias Atendidas</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {drawerDetails.categorias?.map(cat => (
                        <span 
                          key={cat} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {cat}
                        </span>
                      ))}
                      {(!drawerDetails.categorias || drawerDetails.categorias.length === 0) && (
                        <span className="text-xs text-gray-400 italic">Nenhuma categoria registrada</span>
                      )}
                    </div>
                  </div>

                  {/* Atas Vinculadas */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Atas de Registro de Preço Vinculadas
                    </h4>
                    {drawerDetails.atas && drawerDetails.atas.length > 0 ? (
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs text-gray-500">
                          <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                            <tr>
                              <th className="px-4 py-2">Número</th>
                              <th className="px-4 py-2">Vigência Fim</th>
                              <th className="px-4 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {drawerDetails.atas.map(ata => {
                              const ataDate = ata.vigenciaFim || ata.dataFim;
                              return (
                                <tr key={ata.id} className="hover:bg-gray-50/50">
                                  <td className="px-4 py-2.5 font-semibold text-gray-800">{ata.numero}</td>
                                  <td className="px-4 py-2.5">
                                    {ataDate ? new Date(ataDate).toLocaleDateString('pt-BR') : '-'}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <StatusBadge 
                                      status={ata.status} 
                                      variant={ata.status === 'ATIVA' ? 'green' : 'gray'} 
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-xs">
                        Nenhuma Ata de Registro de Preço encontrada para este fornecedor.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Não foi possível encontrar dados para este fornecedor.
                </div>
              )}
            </div>

            {/* Footer */}
            {drawerDetails && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleOpenEdit(drawerDetails);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Editar Cadastro
                </button>
                <button
                  onClick={() => handleToggleStatus(drawerDetails.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    drawerDetails.status === 'ATIVO' 
                      ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100' 
                      : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {drawerDetails.status === 'ATIVO' ? 'Inativar Fornecedor' : 'Ativar Fornecedor'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
