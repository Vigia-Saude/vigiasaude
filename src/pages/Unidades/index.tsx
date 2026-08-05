import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Building
} from 'lucide-react';

export interface UnidadeSaude {
  id: string;
  nome: string;
  cnes?: string | null;
  tipo: 'UBS' | 'USF' | 'UPA' | 'FARMACIA_MUNICIPAL' | 'POSTO_SAUDE';
  telefone?: string | null;
  email?: string | null;
  responsavel?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  endereco?: string | null;
  ativa: boolean;
  criadoEm: string;
}

const TIPOS_UNIDADE = [
  { value: 'UBS', label: 'UBS - Unidade Básica de Saúde' },
  { value: 'USF', label: 'USF - Unidade de Saúde da Família' },
  { value: 'UPA', label: 'UPA - Unidade de Pronto Atendimento' },
  { value: 'FARMACIA_MUNICIPAL', label: 'Farmácia Municipal' },
  { value: 'POSTO_SAUDE', label: 'Posto de Saúde' },
];

export function UnidadesLista() {
  const [unidades, setUnidades] = useState<UnidadeSaude[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState<UnidadeSaude | null>(null);
  const [saving, setSaving] = useState(false);
  // Form State & Errors
  const [nome, setNome] = useState('');
  const [cnes, setCnes] = useState('');
  const [tipo, setTipo] = useState<'UBS' | 'USF' | 'UPA' | 'FARMACIA_MUNICIPAL' | 'POSTO_SAUDE'>('UBS');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Formaters
  const formatarCNES = (val: string) => val.replace(/\D/g, '').slice(0, 7);

  const formatarTelefone = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 10) {
      return nums.replace(/^(\d{2})(\d{4})(\d{0,4})/, (_, ddd, p1, p2) => p2 ? `(${ddd}) ${p1}-${p2}` : p1 ? `(${ddd}) ${p1}` : ddd);
    }
    return nums.replace(/^(\d{2})(\d{5})(\d{0,4})/, (_, ddd, p1, p2) => p2 ? `(${ddd}) ${p1}-${p2}` : p1 ? `(${ddd}) ${p1}` : ddd);
  };

  const formatarCEP = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 8);
    return nums.replace(/^(\d{5})(\d{0,3})/, (_, p1, p2) => p2 ? `${p1}-${p2}` : p1);
  };

  const formatarUF = (val: string) => val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);

  const validarFormulario = (): boolean => {
    const errors: Record<string, string> = {};

    if (!nome.trim()) {
      errors.nome = 'O nome da unidade é obrigatório.';
    } else if (nome.trim().length < 3) {
      errors.nome = 'O nome deve ter no mínimo 3 caracteres.';
    }

    if (cnes.trim() && cnes.trim().length !== 7) {
      errors.cnes = 'O código CNES deve conter exatamente 7 dígitos numéricos.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Informe um endereço de e-mail válido.';
    }

    if (telefone.trim() && telefone.replace(/\D/g, '').length < 10) {
      errors.telefone = 'Informe um telefone válido com DDD (mínimo 10 dígitos).';
    }

    if (cep.trim() && cep.replace(/\D/g, '').length !== 8) {
      errors.cep = 'O CEP deve conter 8 dígitos.';
    }

    if (uf.trim() && uf.trim().length !== 2) {
      errors.uf = 'A UF deve conter 2 letras.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buscarCep = async (cepInput: string) => {
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        setLoadingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        
        if (data.erro) {
          toast.error('CEP não encontrado.');
          setFieldErrors(prev => ({ ...prev, cep: 'CEP não encontrado na base do ViaCEP.' }));
          return;
        }

        if (data.logradouro) setLogradouro(data.logradouro);
        if (data.bairro) setBairro(data.bairro);
        if (data.localidade) setCidade(data.localidade);
        if (data.uf) setUf(data.uf);

        setFieldErrors(prev => {
          const newErr = { ...prev };
          delete newErr.cep;
          return newErr;
        });

        toast.success('Endereço preenchido automaticamente pelo CEP!');
      } catch (err) {
        console.error('Erro ao consultar ViaCEP:', err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatarCEP(e.target.value);
    setCep(formatted);
    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      buscarCep(cleanCep);
    }
  };

  const fetchUnidades = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (busca) params.busca = busca;
      if (tipoFilter) params.tipo = tipoFilter;

      const res = await apiClient.get('/api/unidades', { params });
      setUnidades(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar unidades de saúde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUnidades();
    }, 300);
    return () => clearTimeout(timer);
  }, [busca, tipoFilter]);

  const handleOpenModal = (unidade?: UnidadeSaude) => {
    if (unidade) {
      setEditingUnidade(unidade);
      setNome(unidade.nome);
      setCnes(unidade.cnes || '');
      setTipo(unidade.tipo || 'UBS');
      setTelefone(unidade.telefone || '');
      setEmail(unidade.email || '');
      setResponsavel(unidade.responsavel || '');
      setCep(unidade.cep || '');
      setLogradouro(unidade.logradouro || '');
      setNumero(unidade.numero || '');
      setBairro(unidade.bairro || '');
      setCidade(unidade.cidade || '');
      setUf(unidade.uf || '');
    } else {
      setEditingUnidade(null);
      setNome('');
      setCnes('');
      setTipo('UBS');
      setTelefone('');
      setEmail('');
      setResponsavel('');
      setCep('');
      setLogradouro('');
      setNumero('');
      setBairro('');
      setCidade('');
      setUf('');
    }
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) {
      toast.error('Verifique os campos destacados em vermelho antes de enviar.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nome,
        cnes,
        tipo,
        telefone,
        email,
        responsavel,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf
      };

      if (editingUnidade) {
        await apiClient.put(`/api/unidades/${editingUnidade.id}`, payload);
        toast.success('Unidade de saúde atualizada com sucesso!');
      } else {
        await apiClient.post('/api/unidades', payload);
        toast.success('Unidade de saúde cadastrada com sucesso!');
      }

      setModalOpen(false);
      fetchUnidades();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Erro ao salvar unidade.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (unidade: UnidadeSaude) => {
    try {
      await apiClient.patch(`/api/unidades/${unidade.id}/toggle-status`);
      toast.success(`Unidade ${unidade.ativa ? 'desativada' : 'ativada'} com sucesso!`);
      fetchUnidades();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao alterar status da unidade.');
    }
  };

  const getTipoBadge = (tipoItem: string) => {
    switch (tipoItem) {
      case 'UBS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USF':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UPA':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FARMACIA_MUNICIPAL':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'POSTO_SAUDE':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Unidades de Saúde
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Cadastre e gerencie as UBS, USF, UPAs e postos de saúde da rede municipal
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer border-0"
        >
          <Plus className="h-4 w-4" />
          + Nova Unidade de Saúde
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CNES ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="w-full md:w-56 px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
          >
            <option value="">Todos os Tipos</option>
            {TIPOS_UNIDADE.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <span className="text-xs font-bold text-gray-500">Carregando unidades de saúde...</span>
        </div>
      ) : unidades.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-12 text-center text-gray-500">
          <Building className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-950 font-bold mb-1 text-sm">Nenhuma unidade encontrada</p>
          <p className="text-xs text-gray-400 mb-4">Clique no botão acima para cadastrar uma nova Unidade de Saúde na rede.</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-all cursor-pointer border-0"
          >
            + Nova Unidade de Saúde
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Unidade</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">CNES</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Município / Local</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 text-right uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unidades.map((u) => {
                  const localStr = [u.bairro, u.cidade ? `${u.cidade}/${u.uf || ''}` : null].filter(Boolean).join(' - ');

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-xs">{u.nome}</div>
                        {u.responsavel && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <UserCheck className="h-3 w-3" /> Resp: {u.responsavel}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getTipoBadge(u.tipo)}`}>
                          {u.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-600">
                        {u.cnes || <span className="text-gray-300">Sem CNES</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {localStr ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                            <span>{localStr}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">Não informado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {u.telefone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{u.telefone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">Sem fone</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.ativa ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(u)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border-0 cursor-pointer"
                            title="Editar Unidade"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors border-0 cursor-pointer ${
                              u.ativa ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.ativa ? 'Desativar Unidade' : 'Ativar Unidade'}
                          >
                            {u.ativa ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cadastro / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 my-8 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {editingUnidade ? 'Editar Unidade de Saúde' : 'Nova Unidade de Saúde'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Preencha as informações para cadastrar ou atualizar a unidade na rede municipal.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border-0 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Bloco 1: Identificação */}
              <div>
                <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building className="h-4 w-4" />
                  1. Identificação da Unidade
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nome da Unidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: UBS São José"
                      value={nome}
                      onChange={(e) => {
                        setNome(e.target.value);
                        if (fieldErrors.nome) setFieldErrors(prev => ({ ...prev, nome: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs font-semibold border rounded-xl outline-none transition-all ${
                        fieldErrors.nome
                          ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                    {fieldErrors.nome && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.nome}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tipo de Unidade <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
                    >
                      {TIPOS_UNIDADE.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Código CNES (7 dígitos)</label>
                    <input
                      type="text"
                      placeholder="Ex: 2345678"
                      value={cnes}
                      maxLength={7}
                      onChange={(e) => {
                        setCnes(formatarCNES(e.target.value));
                        if (fieldErrors.cnes) setFieldErrors(prev => ({ ...prev, cnes: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs font-semibold border rounded-xl outline-none font-mono transition-all ${
                        fieldErrors.cnes
                          ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                    {fieldErrors.cnes && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.cnes}</p>}
                  </div>
                </div>
              </div>

              {/* Bloco 2: Contato & Responsável */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  2. Contato & Gestão
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Responsável / Gestor</label>
                    <input
                      type="text"
                      placeholder="Ex: Maria Oliveira"
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      placeholder="Ex: (81) 98888-7777"
                      value={telefone}
                      onChange={(e) => {
                        setTelefone(formatarTelefone(e.target.value));
                        if (fieldErrors.telefone) setFieldErrors(prev => ({ ...prev, telefone: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs font-semibold border rounded-xl outline-none transition-all ${
                        fieldErrors.telefone
                          ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                    {fieldErrors.telefone && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.telefone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder="Ex: ubs.saojose@saude.gov.br"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs font-semibold border rounded-xl outline-none transition-all ${
                        fieldErrors.email
                          ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                    {fieldErrors.email && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Bloco 3: Endereço Estruturado */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  3. Endereço da Unidade
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                      CEP
                      {loadingCep && <span className="text-[10px] text-blue-600 font-extrabold flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Buscando...</span>}
                    </label>
                    <input
                      type="text"
                      maxLength={9}
                      placeholder="Ex: 50000-000"
                      value={cep}
                      onChange={(e) => {
                        handleCepChange(e);
                        if (fieldErrors.cep) setFieldErrors(prev => ({ ...prev, cep: '' }));
                      }}
                      onBlur={() => buscarCep(cep)}
                      className={`w-full px-3.5 py-2.5 text-xs font-semibold border rounded-xl outline-none transition-all ${
                        fieldErrors.cep
                          ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                    {fieldErrors.cep && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.cep}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Logradouro (Rua / Av.)</label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Principal"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      placeholder="Ex: 120"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      placeholder="Ex: Centro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        placeholder="Ex: Recife"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">UF</label>
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="PE"
                        value={uf}
                        onChange={(e) => {
                          setUf(formatarUF(e.target.value));
                          if (fieldErrors.uf) setFieldErrors(prev => ({ ...prev, uf: '' }));
                        }}
                        className={`w-full px-3.5 py-2.5 text-xs font-semibold border rounded-xl outline-none text-center font-mono transition-all ${
                          fieldErrors.uf
                            ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                        }`}
                      />
                      {fieldErrors.uf && <p className="text-[11px] font-bold text-red-600 mt-1">{fieldErrors.uf}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões do Form */}
              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border-0 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer border-0 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingUnidade ? 'Salvar Alterações' : 'Cadastrar Unidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
