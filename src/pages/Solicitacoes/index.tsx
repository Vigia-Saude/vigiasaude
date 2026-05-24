import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Shield, 
  Clock, 
  Search, 
  Eye, 
  X, 
  Mail, 
  Phone, 
  AlertCircle, 
  UserCheck, 
  UserX,
  ChevronDown,
  Filter,
  CheckCircle2
} from 'lucide-react';

type Perfil = 'SECRETARIO_SAUDE' | 'GESTOR_ESTOQUE' | 'FARMACIA' | 'MEDICO' | 'ENTREGADOR';
type Aba = 'pendentes' | 'ativos' | 'desativados';

interface PendingUser {
  id: string;
  nome: string;
  cpf: string;
  email: string | null;
  telefone?: string | null;
  role: 'COMPRADOR' | 'FORNECEDOR';
  perfil: Perfil | null;
  justificativa: string | null;
  fornecedorId: string | null;
  fornecedor?: {
    nomeFantasia: string;
  } | null;
  criadoEm: string;
  aprovadoEm?: string | null;
  atualizadoEm?: string | null;
  unidadeId?: string | null;
  tenantSchema?: string | null;
  status?: string;
}

interface Unidade {
  id: string;
  nome: string;
  cnes: string | null;
  tenant_schema: string;
  ativa: boolean;
}

interface PermissaoExtra {
  key: string;
  label: string;
  badge?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PERFIS: Array<{ value: Perfil; label: string }> = [
  { value: 'SECRETARIO_SAUDE', label: 'Secretário de Saúde' },
  { value: 'GESTOR_ESTOQUE', label: 'Gestor de Estoque' },
  { value: 'FARMACIA', label: 'Farmácia' },
  { value: 'MEDICO', label: 'Médico' },
  { value: 'ENTREGADOR', label: 'Entregador' },
];

const PERMISSOES_EXTRAS: PermissaoExtra[] = [
  { key: 'acesso_estoque', label: 'Acesso ao Estoque', badge: 'EXTRA' },
  { key: 'gestao_compras', label: 'Gestão de Compras' },
  { key: 'gestao_fornecedores', label: 'Gestão de Fornecedores' },
  { key: 'monitoramento_lead_time', label: 'Monitoramento de Lead Time' },
];

const PERFIL_PERMISSOES_PREVIEW: Record<Perfil, string[]> = {
  SECRETARIO_SAUDE: [
    'Painel Geral (Dashboard)',
    'Gestão de Atas (ARPs)',
    'Pedidos de Compra',
    'Cadastro de Fornecedores',
    'Solicitações de Acesso (Hub)',
    'Auditoria do Sistema'
  ],
  GESTOR_ESTOQUE: [
    'Painel do Estoque',
    'Entrada de Medicamentos',
    'Inventário Geral',
    'Pedidos de Compra'
  ],
  FARMACIA: [
    'Dispensação de Medicamentos',
    'Estoque da Farmácia',
    'Atendimento ao Cidadão'
  ],
  MEDICO: [
    'Prescrição Médica',
    'Histórico de Pacientes',
    'Consulta CATMAT'
  ],
  ENTREGADOR: [
    'Minhas Entregas',
    'Confirmação com Assinatura',
    'Rotas'
  ]
};

function getAuthToken() {
  return localStorage.getItem('vigia_token') || localStorage.getItem('vigiasaude_token');
}

function formatCPF(cpf: string | null) {
  if (!cpf) return '-';
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getPerfilLabel(perfil: Perfil | null) {
  return PERFIS.find((item) => item.value === perfil)?.label || '-';
}

function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-orange-500 text-white',
    'bg-blue-500 text-white',
    'bg-emerald-500 text-white',
    'bg-purple-500 text-white',
    'bg-rose-500 text-white',
    'bg-amber-500 text-white',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

function getPerfilBadgeClass(perfil: Perfil | null) {
  if (!perfil) return 'bg-gray-50 text-gray-700 border-gray-200';
  switch (perfil) {
    case 'SECRETARIO_SAUDE':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'GESTOR_ESTOQUE':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'FARMACIA':
      return 'bg-purple-50 text-purple-700 border-purple-100';
    case 'MEDICO':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'ENTREGADOR':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error || data.message || 'Erro ao processar a solicitação.';
  } catch {
    return 'Erro ao processar a solicitação.';
  }
}

interface ModalAprovacaoProps {
  usuario: PendingUser;
  unidades: Unidade[];
  onClose: () => void;
  onFinished: (message: string) => void;
  onAuthError: () => void;
}

function ModalAprovacao({ usuario, unidades, onClose, onFinished, onAuthError }: ModalAprovacaoProps) {
  const [perfil, setPerfil] = useState<Perfil>(usuario.perfil || 'GESTOR_ESTOQUE');
  const [unidadeId, setUnidadeId] = useState(unidades[0]?.id || '');
  const [permissoesExtras, setPermissoesExtras] = useState<Record<string, boolean>>({});
  const [mostrarMotivoRecusa, setMostrarMotivoRecusa] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const unidadeSelecionada = unidades.find((unidade) => unidade.id === unidadeId);

  const request = async (url: string, body: unknown) => {
    const token = getAuthToken();
    if (!token) {
      onAuthError();
      return null;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401 || response.status === 403) {
      onAuthError();
      return null;
    }

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response;
  };

  const handleTogglePermissao = (key: string, checked: boolean) => {
    setPermissoesExtras((current) => ({ ...current, [key]: checked }));
  };

  const handleAprovar = async () => {
    if (!unidadeSelecionada) {
      setErrorMsg('Selecione uma unidade para aprovar o cadastro.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const extrasSelecionadas = Object.fromEntries(
        Object.entries(permissoesExtras).filter(([, checked]) => checked)
      );

      const response = await request(`/auth/aprovar/${usuario.id}`, {
        perfil,
        unidadeId,
        tenantSchema: unidadeSelecionada.tenant_schema,
        permissoesExtras: Object.keys(extrasSelecionadas).length > 0 ? extrasSelecionadas : undefined,
      });

      if (response) {
        onFinished(`Cadastro de ${usuario.nome} aprovado com sucesso.`);
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Erro ao aprovar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecusar = async () => {
    if (!mostrarMotivoRecusa) {
      setMostrarMotivoRecusa(true);
      return;
    }

    if (motivoRecusa.trim().length < 5) {
      setErrorMsg('Informe um motivo de recusa com pelo menos 5 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await request(`/auth/recusar/${usuario.id}`, {
        motivoRecusa: motivoRecusa.trim(),
      });

      if (response) {
        onFinished(`Solicitação de ${usuario.nome} recusada com sucesso.`);
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Erro ao recusar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col transform transition-all animate-scale-up">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-150 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-base font-extrabold shadow-sm ${getAvatarColor(usuario.nome)}`}>
              {getInitials(usuario.nome)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{usuario.nome}</h2>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">CPF: {formatCPF(usuario.cpf)}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-8 grid gap-8 md:grid-cols-2 flex-1">
          
          {/* Left Column: Informações do Solicitante */}
          <div className="space-y-6">
            <div>
              <span className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3">
                Informações de Contato
              </span>
              <div className="grid gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={usuario.email || 'Não informado'}
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500"
                    placeholder="E-mail"
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 right-3 text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                    E-mail
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    disabled
                    value={usuario.telefone || 'Não informado'}
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500"
                    placeholder="Telefone"
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 right-3 text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                    Telefone
                  </span>
                </div>
              </div>
            </div>

            {/* Justificativa */}
            <div>
              <span className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2.5">
                Justificativa
              </span>
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
                <p className="text-xs text-amber-800 italic leading-relaxed">
                  "{usuario.justificativa || 'Nenhuma justificativa apresentada pelo solicitante.'}"
                </p>
              </div>
            </div>

            {/* Perfil & Data cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <span className="block text-[10px] font-bold text-blue-700 tracking-wider uppercase mb-1">
                  Perfil Solicitado
                </span>
                <span className="text-sm font-bold text-blue-900">{getPerfilLabel(usuario.perfil)}</span>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <span className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">
                  Data do Pedido
                </span>
                <span className="text-sm font-bold text-gray-800">{formatDate(usuario.criadoEm)}</span>
              </div>
            </div>

            {/* Registro de Auditoria */}
            <div>
              <span className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2.5">
                Registro de Auditoria
              </span>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Solicitado em {formatDate(usuario.criadoEm)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  <span className="font-bold text-gray-700 uppercase tracking-wide text-[9px]">
                    {usuario.status || 'PENDENTE'} • Admin Gestor
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Decisão do Controlador */}
          <div className="space-y-6">
            <span className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Decisão do Controlador
            </span>

            <div className="space-y-4">
              <div>
                <label htmlFor="perfil-base" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Perfil Base
                </label>
                <div className="relative">
                  <select
                    id="perfil-base"
                    value={perfil}
                    onChange={(event) => setPerfil(event.target.value as Perfil)}
                    className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
                  >
                    {PERFIS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="unidade" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Unidade de Saúde
                </label>
                <div className="relative">
                  <select
                    id="unidade"
                    value={unidadeId}
                    onChange={(event) => setUnidadeId(event.target.value)}
                    className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
                  >
                    {unidades.length === 0 ? (
                      <option value="">Nenhuma unidade disponível</option>
                    ) : (
                      unidades.map((unidade) => (
                        <option key={unidade.id} value={unidade.id}>
                          {unidade.nome}{unidade.cnes ? ` - CNES ${unidade.cnes}` : ''}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Permissões Complementares
                </span>
                <div className="border border-gray-250 rounded-2xl p-4 bg-gray-50/70 max-h-[160px] overflow-y-auto space-y-2">
                  {PERMISSOES_EXTRAS.map((permissao) => (
                    <label 
                      key={permissao.key} 
                      className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-blue-50/30 border border-gray-200 transition-all cursor-pointer text-xs font-semibold text-gray-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={Boolean(permissoesExtras[permissao.key])}
                          onChange={(event) => handleTogglePermissao(permissao.key, event.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                        />
                        <span>{permissao.label}</span>
                      </div>
                      {permissao.badge && (
                        <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-orange-500 text-white rounded uppercase tracking-wider">
                          {permissao.badge}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {mostrarMotivoRecusa && (
              <div className="space-y-1.5 animate-slide-down">
                <label htmlFor="motivo-recusa" className="block text-xs font-bold text-red-750 uppercase tracking-wide">
                  Motivo da Recusa *
                </label>
                <textarea
                  id="motivo-recusa"
                  value={motivoRecusa}
                  onChange={(event) => setMotivoRecusa(event.target.value)}
                  placeholder="Descreva o motivo pelo qual este cadastro está sendo recusado..."
                  className="block w-full rounded-xl border border-red-305 bg-white px-4 py-2.5 text-xs text-gray-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-150 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={handleRecusar}
            disabled={loading}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mostrarMotivoRecusa
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/10'
                : 'border border-red-200 text-red-600 hover:bg-red-50'
            }`}
          >
            <UserX className="h-4 w-4" />
            {mostrarMotivoRecusa ? 'Confirmar Recusa' : 'Recusar'}
          </button>
          <button
            type="button"
            onClick={handleAprovar}
            disabled={loading || !unidadeId}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/10 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <UserCheck className="h-4 w-4" />
            Aprovar Cadastro
          </button>
        </div>
      </div>
    </div>
  );
}

interface HubDashboardProps {
  pendentes: PendingUser[];
  ativos: PendingUser[];
  desativados: PendingUser[];
  abaAtiva: Aba;
  onChangeAba: (aba: Aba) => void;
  onOpenDetalhes: (usuario: PendingUser) => void;
}

function HubDashboard({ pendentes, ativos, desativados, abaAtiva, onChangeAba, onOpenDetalhes }: HubDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewPerfil, setPreviewPerfil] = useState<Perfil | null>(null);

  const filterUsers = (list: PendingUser[]) => {
    if (!searchTerm.trim()) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter((u) => 
      u.nome.toLowerCase().includes(lower) || 
      u.cpf.includes(lower.replace(/\D/g, ''))
    );
  };

  const renderUsuariosTable = (usuarios: PendingUser[], emptyMessage: string) => {
    const filtered = filterUsers(usuarios);
    return (
      <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/70">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nome Completo</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">CPF</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Perfil</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400 font-semibold italic">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((usuario) => (
                  <tr 
                    key={usuario.id} 
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    onClick={() => setPreviewPerfil(usuario.perfil)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-extrabold shadow-sm ${getAvatarColor(usuario.nome)}`}>
                          {getInitials(usuario.nome)}
                        </div>
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{usuario.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-600">{formatCPF(usuario.cpf)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{usuario.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${getPerfilBadgeClass(usuario.perfil)}`}>
                        {getPerfilLabel(usuario.perfil)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        usuario.status === 'ATIVO' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : usuario.status === 'PENDENTE'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          usuario.status === 'ATIVO' 
                            ? 'bg-emerald-500' 
                            : usuario.status === 'PENDENTE'
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`} />
                        {usuario.status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(usuario.aprovadoEm || usuario.atualizadoEm || usuario.criadoEm)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 3 Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Active Users */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-500">Usuários Ativos</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-emerald-600">{ativos.length}</span>
              <button 
                onClick={() => onChangeAba('ativos')} 
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Filtrar ativos"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
            <button 
              onClick={() => onChangeAba('ativos')} 
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
            >
              Ver todos aprovados
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Configured Profiles */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <span className="text-sm font-semibold text-gray-500">Perfis Configurados</span>
            <span className="block text-3xl font-extrabold text-gray-900">{PERFIS.length}</span>
            <span className="block text-xs text-gray-400 truncate max-w-[220px]">
              Médico, Fornecedor, Entregador...
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 flex-shrink-0">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-orange-50/40 border border-orange-200 p-6 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-sm font-bold text-orange-800 tracking-wide uppercase">Usuários Aguardando</span>
            <span className="block text-3xl font-extrabold text-orange-600">{pendentes.length}</span>
            <button 
              onClick={() => onChangeAba('pendentes')} 
              className="text-xs font-semibold text-orange-700 hover:text-orange-800 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
            >
              ⚡ Clique para revisar agora
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Abas de solicitações">
          <button
            type="button"
            onClick={() => {
              onChangeAba('pendentes');
              setSearchTerm('');
            }}
            className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
              abaAtiva === 'pendentes'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span>Solicitações Pendentes</span>
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full transition-all ${
              abaAtiva === 'pendentes'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {pendentes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeAba('ativos');
              setSearchTerm('');
            }}
            className={`py-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer ${
              abaAtiva === 'ativos'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usuários Ativos
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeAba('desativados');
              setSearchTerm('');
            }}
            className={`py-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer ${
              abaAtiva === 'desativados'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usuários Desativados
          </button>
        </nav>
      </div>

      {/* Main Grid: List/Table + Preview Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-start">
        {/* Left: Active Tab View */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
          {abaAtiva === 'pendentes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-gray-900">Solicitações Pendentes</h4>
                  <p className="text-xs text-gray-500">Analise e aprove os acessos ao sistema</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                  {pendentes.length} aguardando
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-950 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>

              {/* Pendentes Table */}
              <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/70">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nome Completo</th>
                        <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">CPF</th>
                        <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Permissão Desejada</th>
                        <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Data</th>
                        <th scope="col" className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filterUsers(pendentes).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400 font-semibold italic">
                            Nenhuma solicitação pendente encontrada.
                          </td>
                        </tr>
                      ) : (
                        filterUsers(pendentes).map((usuario) => (
                          <tr 
                            key={usuario.id} 
                            className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                            onClick={() => setPreviewPerfil(usuario.perfil)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-extrabold shadow-sm ${getAvatarColor(usuario.nome)}`}>
                                  {getInitials(usuario.nome)}
                                </div>
                                <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{usuario.nome}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-600">{formatCPF(usuario.cpf)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold border ${getPerfilBadgeClass(usuario.perfil)}`}>
                                {getPerfilLabel(usuario.perfil)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{formatDate(usuario.criadoEm)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => onOpenDetalhes(usuario)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'ativos' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-gray-900">Usuários Ativos</h4>
                <p className="text-xs text-gray-500">Lista de usuários aprovados e ativos no sistema</p>
              </div>
              {/* Search Bar */}
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-950 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>
              {renderUsuariosTable(ativos, 'Nenhum usuário ativo encontrado.')}
            </div>
          )}

          {abaAtiva === 'desativados' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-gray-900">Usuários Desativados</h4>
                <p className="text-xs text-gray-500">Lista de usuários com o acesso suspenso</p>
              </div>
              {/* Search Bar */}
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-950 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>
              {renderUsuariosTable(desativados, 'Nenhum usuário desativado encontrado.')}
            </div>
          )}
        </div>

        {/* Right: Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <h3 className="font-bold text-gray-900 text-sm">Pré-visualização</h3>
            </div>
            <p className="text-[10px] text-gray-400 mb-4 leading-normal">
              {previewPerfil 
                ? `Exibindo menu para ${getPerfilLabel(previewPerfil)}` 
                : 'Selecione um perfil na tabela para visualizar suas permissões'
              }
            </p>

            {/* App Screen Mockup */}
            <div className="min-h-[360px] bg-blue-900 text-white rounded-2xl p-5 flex flex-col relative overflow-hidden shadow-inner">
              {/* Orb background decoration */}
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
              
              {/* App Brand Header */}
              <div className="border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold tracking-wide uppercase">Vigia Saúde</h4>
                  <span className="text-[8px] text-white/50 block">Município Teste - MS</span>
                </div>
              </div>

              {previewPerfil ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">
                    Funcionalidades Disponíveis
                  </div>
                  <ul className="space-y-2 flex-1 overflow-y-auto max-h-[220px] pr-1">
                    {PERFIL_PERMISSOES_PREVIEW[previewPerfil].map((link, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/90 hover:bg-white/10 transition-all"
                      >
                        <div className="h-1 w-1.5 rounded-full bg-blue-400" />
                        <span className="truncate">{link}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setPreviewPerfil(null)}
                    className="w-full py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl text-[9px] font-bold transition-all mt-auto cursor-pointer"
                  >
                    Voltar
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Eye className="h-5 w-5 text-white/40" />
                  </div>
                  <h5 className="text-xs font-bold text-white/90 mb-1">Sistema vazio</h5>
                  <p className="text-[9px] text-white/50 max-w-[150px] leading-relaxed">
                    Vincule um perfil a um usuário para revelar as funcionalidades
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SolicitacoesMembro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendentes, setPendentes] = useState<PendingUser[]>([]);
  const [ativos, setAtivos] = useState<PendingUser[]>([]);
  const [desativados, setDesativados] = useState<PendingUser[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<Aba>('pendentes');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('vigia_token');
    localStorage.removeItem('vigiasaude_token');
    localStorage.removeItem('vigiasaude_user');
    navigate('/', { replace: true });
  }, [navigate]);

  const privateFetch = useCallback(async <T,>(path: string): Promise<T> => {
    const token = getAuthToken();
    if (!token) {
      handleAuthError();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      handleAuthError();
      throw new Error('Acesso não autorizado.');
    }

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json() as Promise<T>;
  }, [handleAuthError]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const [pendentesResponse, ativosResponse, desativadosResponse, unidadesResponse] = await Promise.all([
        privateFetch<PendingUser[]>('/auth/pendentes'),
        privateFetch<PendingUser[]>('/auth/ativos'),
        privateFetch<PendingUser[]>('/auth/desativados'),
        privateFetch<Unidade[]>('/api/unidades'),
      ]);

      setPendentes(pendentesResponse);
      setAtivos(ativosResponse);
      setDesativados(desativadosResponse);
      setUnidades(unidadesResponse);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Não foi possível carregar as solicitações.');
    } finally {
      setLoading(false);
    }
  }, [privateFetch]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const hasSecretarioProfile = useMemo(() => user?.perfil === 'SECRETARIO_SAUDE', [user?.perfil]);

  const handleFinished = (message: string) => {
    setSelectedUser(null);
    setSuccessMsg(message);
    void loadData();
  };

  if (!hasSecretarioProfile) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-3xl border border-gray-100 shadow-md text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Acesso Restrito</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Apenas o Secretário de Saúde possui autorização para acessar o Hub Master de aprovação de cadastros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-b border-gray-150 pb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Central de Aprovação de Cadastros e Gestão de Usuários (Hub Master)
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 font-medium">
          Controle central do sistema: analise solicitações e gerencie acessos de usuários
        </p>
      </header>

      {/* Message Notifications */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">{successMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-semibold">Carregando solicitações...</p>
        </div>
      ) : (
        <HubDashboard
          pendentes={pendentes}
          ativos={ativos}
          desativados={desativados}
          abaAtiva={abaAtiva}
          onChangeAba={setAbaAtiva}
          onOpenDetalhes={setSelectedUser}
        />
      )}

      {/* Approval Modal */}
      {selectedUser && (
        <ModalAprovacao
          usuario={selectedUser}
          unidades={unidades}
          onClose={() => setSelectedUser(null)}
          onFinished={handleFinished}
          onAuthError={handleAuthError}
        />
      )}
    </div>
  );
}
