import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FilePlus2,
  User,
  Heart,
  Paperclip,
  Loader2,
  ArrowLeft,
  Lightbulb,
  Users,
  Search,
  Plus,
  X,
  Calendar,
  Phone,
  Smartphone,
  MapPin,
  Edit3,
  Check,
  FileText,
  Home,
  Info,
  Mail,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { criarFichaRegulacao, listarMedicos } from '../../services/regulacaoService';
import { buscarPacientes, atualizarPaciente } from '../../services/pacienteService';
import { FileUpload } from '../../components/ui/FileUpload';
import { CadastrarPaciente } from '../Pacientes/CadastrarPaciente';
import type { Paciente } from '../../types';
import { formatPhone, cn } from '../../lib/utils';

const fichaSchema = z.object({
  responsavelEncaminhamento: z.string().min(3, 'Selecione ou informe o médico responsável'),
  acsResponsavel: z.string().optional(),
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  procedimentoSolicitado: z.string().optional(),
  observacaoClinica: z.string().optional(),
});

type FichaFormData = z.infer<typeof fichaSchema>;

export function NovaFichaRegulacao() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  // States para autocomplete de paciente
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paciente[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // State para o modal de cadastro inline
  const [modalOpen, setModalOpen] = useState(false);

  // State para o modal de atualização de contato
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactCelular, setContactCelular] = useState('');
  const [contactTelefone, setContactTelefone] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  // States para edição do paciente selecionado
  const [isEditingPaciente, setIsEditingPaciente] = useState(false);
  const [editCelular, setEditCelular] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editCep, setEditCep] = useState('');
  const [editTipoLogradouro, setEditTipoLogradouro] = useState('RUA');
  const [editLogradouro, setEditLogradouro] = useState('');
  const [editNumero, setEditNumero] = useState('');
  const [editBairro, setEditBairro] = useState('');
  const [editComplemento, setEditComplemento] = useState('');
  const [editMunicipio, setEditMunicipio] = useState('');
  const [editLocalizacao, setEditLocalizacao] = useState('URBANA');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // States para médicos cadastrados
  const [medicos, setMedicos] = useState<Array<{ id: string; nome: string }>>([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FichaFormData>({
    resolver: zodResolver(fichaSchema),
    mode: 'onBlur',
    defaultValues: {
      pacienteId: '',
      acsResponsavel: 'N/A',
    },
  });

  // Carregar médicos da UBS
  useEffect(() => {
    const fetchMedicos = async () => {
      setLoadingMedicos(true);
      try {
        const list = await listarMedicos();
        setMedicos(list || []);
      } catch (err) {
        console.error('Erro ao carregar médicos:', err);
      } finally {
        setLoadingMedicos(false);
      }
    };
    fetchMedicos();
  }, []);

  // Debounce search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await buscarPacientes(searchQuery);
        setSearchResults(res || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setValue('pacienteId', paciente.id, { shouldValidate: true });
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    
    // Inicializar os campos de edição
    setEditCelular(paciente.celular || '');
    setEditTelefone(paciente.telefone || '');
    setEditCep(paciente.cep || '');
    setEditTipoLogradouro(paciente.tipoLogradouro || 'RUA');
    setEditLogradouro(paciente.logradouro || '');
    setEditNumero(paciente.numero || '');
    setEditBairro(paciente.bairro || '');
    setEditComplemento(paciente.complemento || '');
    setEditMunicipio(paciente.municipio || '');
    setEditLocalizacao(paciente.localizacao || 'URBANA');
    setIsEditingPaciente(false);

    // Abrir modal de atualização de contato
    setContactCelular(paciente.celular || '');
    setContactTelefone(paciente.telefone || '');
    setContactEmail(paciente.email || '');
    setContactModalOpen(true);
  };

  const handleRemovePaciente = () => {
    setSelectedPaciente(null);
    setValue('pacienteId', '', { shouldValidate: true });
    setIsEditingPaciente(false);
  };

  const handleCreateSuccess = (novoPaciente: Paciente) => {
    handleSelectPaciente(novoPaciente);
    setModalOpen(false);
  };

  const handleSaveContact = async () => {
    if (!selectedPaciente) return;

    const phoneRegex = /^\(\d{2}\) 9\d{4}-\d{4}$/;
    if (contactCelular && !phoneRegex.test(contactCelular)) {
      toast.error('Celular em formato inválido. Formato: (XX) 9XXXX-XXXX');
      return;
    }

    setSavingContact(true);
    try {
      await atualizarPaciente(selectedPaciente.id, {
        celular: contactCelular || selectedPaciente.celular,
        telefone: contactTelefone || undefined,
        email: contactEmail || undefined,
      });

      // Atualizar o paciente selecionado localmente
      setSelectedPaciente(prev => prev ? {
        ...prev,
        celular: contactCelular || prev.celular,
        telefone: contactTelefone || prev.telefone,
        email: contactEmail || prev.email,
      } : null);
      setEditCelular(contactCelular);
      setEditTelefone(contactTelefone);

      toast.success('Dados de contato do paciente atualizados!');
      setContactModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.erro || 'Erro ao atualizar dados de contato.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleContactCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactCelular(formatPhone(e.target.value));
  };

  const handleContactTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
    }
    setContactTelefone(value);
  };

  const handleEditCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditCelular(formatPhone(e.target.value));
  };

  const handleEditTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
    }
    setEditTelefone(value);
  };

  // CEP Lookup inside editing mode
  const handleEditCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);
    
    let formattedCep = value;
    if (value.length > 5) {
      formattedCep = `${value.substring(0, 5)}-${value.substring(5)}`;
    }
    setEditCep(formattedCep);

    if (value.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEditLogradouro(data.logradouro || '');
          setEditBairro(data.bairro || '');
          setEditMunicipio(`${data.localidade} - ${data.uf}`);
          
          if (data.logradouro) {
            const firstWord = data.logradouro.split(' ')[0].toUpperCase();
            const tiposValidos = ['RUA', 'AVENIDA', 'TRAVESSA', 'PRACA', 'RODOVIA', 'ALAMEDA', 'BECO'];
            const matched = tiposValidos.find(t => firstWord.includes(t) || t.includes(firstWord));
            if (matched) {
              setEditTipoLogradouro(matched);
            }
          }
          toast.success('Endereço auto-preenchido pelo CEP!');
        } else {
          toast.warning('CEP não encontrado.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Erro ao buscar CEP.');
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const onSubmit = async (data: FichaFormData) => {
    // Procedimento é obrigatório apenas para perfis que NÃO são recepcionista
    const isRecepcionista = user?.perfil === 'RECEPCIONISTA_UBS';
    if (!isRecepcionista && (!data.procedimentoSolicitado || data.procedimentoSolicitado.length < 3)) {
      toast.error('Procedimento solicitado é obrigatório (mín. 3 caracteres).');
      return;
    }

    if (files.length === 0) {
      toast.error('O arquivo do encaminhamento (Anexo) é obrigatório!');
      return;
    }

    try {
      setSubmitting(true);

      // Se editou os dados do paciente, atualizar primeiro
      if (isEditingPaciente && selectedPaciente) {
        // Validações básicas
        if (!editCelular || !editCep || !editLogradouro || !editNumero || !editBairro || !editMunicipio) {
          toast.error('Preencha todos os campos obrigatórios do paciente (*).');
          setSubmitting(false);
          return;
        }

        const phoneRegex = /^\(\d{2}\) 9\d{4}-\d{4}$/;
        if (!phoneRegex.test(editCelular)) {
          toast.error('Celular em formato inválido. Formato: (XX) 9XXXX-XXXX');
          setSubmitting(false);
          return;
        }

        const cepRegex = /^\d{5}-\d{3}$/;
        if (!cepRegex.test(editCep)) {
          toast.error('CEP em formato inválido. Formato: 00000-000');
          setSubmitting(false);
          return;
        }

        await atualizarPaciente(selectedPaciente.id, {
          celular: editCelular,
          telefone: editTelefone,
          cep: editCep,
          tipoLogradouro: editTipoLogradouro,
          logradouro: editLogradouro,
          numero: editNumero,
          bairro: editBairro,
          complemento: editComplemento,
          municipio: editMunicipio,
          localizacao: editLocalizacao
        });
        toast.success('Dados cadastrais do paciente atualizados!');
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      if (!formData.has('acsResponsavel')) {
        formData.append('acsResponsavel', 'N/A');
      }

      formData.append('anexo', files[0]);

      await criarFichaRegulacao(formData);
      toast.success(
        isRecepcionista
          ? 'Pré-ficha enviada com sucesso ao médico responsável!'
          : 'Ficha de regulação criada com sucesso!'
      );
      navigate(isRecepcionista ? '/posto/agendamentos' : '/posto/regulacao/consulta');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.erro || 'Erro ao criar ficha de regulação.');
    } finally {
      setSubmitting(false);
    }
  };

  const addressPreview = selectedPaciente 
    ? `${editTipoLogradouro} ${editLogradouro}, ${editNumero} ${editComplemento ? `(${editComplemento})` : ''} - ${editBairro}, ${editMunicipio} - CEP ${editCep}`
    : '';

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FilePlus2 className="h-6 w-6 text-teal-600" />
            Nova Ficha de Regulação
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Preencha os dados para encaminhar o paciente à fila de regulação do município.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Section 1: Seleção de Paciente (Sem overflow-hidden para não esconder o dropdown) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent rounded-t-2xl">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-blue-600" />
              Seleção do Paciente
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Busque o paciente cadastrado ou crie um novo cadastro instantaneamente</p>
          </div>
          
          <div className="p-6">
            {!selectedPaciente ? (
              <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
                <label className="text-sm font-medium text-gray-700">Buscar Paciente (CPF ou CadÚnico) *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400 stroke-[1.8]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite o CPF ou número do CadÚnico..."
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-450" />
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all shrink-0 cursor-pointer"
                    title="Adicionar Novo Paciente"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Paciente
                  </button>
                </div>

                {errors.pacienteId && (
                  <span className="text-xs font-medium text-red-500 mt-1">{errors.pacienteId.message}</span>
                )}

                {/* Dropdown Autocomplete (posicionado de forma absoluta) */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-[70px] left-0 right-0 z-50 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    {searchResults.map((paciente) => (
                      <div
                        key={paciente.id}
                        onClick={() => handleSelectPaciente(paciente)}
                        className="flex flex-col px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 text-sm">{paciente.nomeCompleto}</span>
                        <div className="flex gap-4 text-xs text-gray-500 mt-0.5">
                          <span>CPF: {paciente.cpf}</span>
                          <span>SUS: {paciente.cartaoSus || '—'}</span>
                          <span>DN: {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                  <div className="absolute top-[70px] left-0 right-0 z-50 rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-md">
                    Nenhum paciente encontrado. Clique em <span className="font-semibold text-blue-600">"Novo Paciente"</span> para cadastrar.
                  </div>
                )}
              </div>
            ) : (
              /* Card do Paciente Selecionado com Opção de Visualizar/Editar Dados */
              <div className="bg-blue-50/40 rounded-xl border border-blue-150 p-5 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white rounded-full p-2.5 shrink-0 mt-0.5">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 leading-none">{selectedPaciente.nomeCompleto}</h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" /> CPF: {selectedPaciente.cpf}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Nasc: {new Date(selectedPaciente.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                        {selectedPaciente.cartaoSus && (
                          <span>SUS: {selectedPaciente.cartaoSus}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEditingPaciente(!isEditingPaciente)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-xs cursor-pointer",
                        isEditingPaciente 
                          ? "bg-teal-600 border-teal-600 text-white hover:bg-teal-700"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {isEditingPaciente ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Confirmar Edição
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-3.5 w-3.5" />
                          Editar Dados
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePaciente}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-650 bg-white hover:bg-red-50 hover:text-red-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      Trocar
                    </button>
                  </div>
                </div>

                {/* Pré-Visualização / Formulário de Edição */}
                <div className="border-t border-blue-100/60 pt-4">
                  {!isEditingPaciente ? (
                    // Read-only info layout with address preview
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>Celular: <span className="font-bold text-gray-950">{editCelular || '—'}</span></span>
                        </div>
                        {editTelefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                            <span>Telefone Fixo: <span className="font-bold text-gray-950">{editTelefone}</span></span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-2 bg-blue-100/30 p-3 rounded-lg border border-blue-100/40">
                        <MapPin className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Endereço (Pré-visualização)</span>
                          <p className="text-gray-800 font-medium leading-snug">{addressPreview}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Inline Edit Form Panel
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center gap-2 text-yellow-800 text-xs font-semibold mb-2">
                        <Info className="h-4 w-4 text-yellow-600 shrink-0" />
                        <span>Preencha as informações atualizadas. As correções serão salvas no cadastro ao enviar.</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Celular */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Celular *</label>
                          <input
                            type="text"
                            value={editCelular}
                            onChange={handleEditCelularChange}
                            placeholder="(XX) 9XXXX-XXXX"
                            maxLength={15}
                            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                          />
                        </div>

                        {/* Telefone */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Telefone Fixo</label>
                          <input
                            type="text"
                            value={editTelefone}
                            onChange={handleEditTelefoneChange}
                            placeholder="(XX) 0000-0000"
                            maxLength={14}
                            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
                          />
                        </div>
                      </div>

                      <div className="border-t border-dashed border-blue-100/60 pt-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Endereço do Paciente</span>
                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                          {/* CEP */}
                          <div className="flex flex-col gap-1 sm:col-span-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">CEP *</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={editCep}
                                onChange={handleEditCepChange}
                                placeholder="00000-000"
                                maxLength={9}
                                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs placeholder:text-gray-400"
                              />
                              {isLoadingCep && (
                                <div className="absolute right-2 top-2.5">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tipo Logradouro */}
                          <div className="flex flex-col gap-1 sm:col-span-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tipo *</label>
                            <select
                              value={editTipoLogradouro}
                              onChange={(e) => setEditTipoLogradouro(e.target.value)}
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
                            >
                              <option value="RUA">Rua</option>
                              <option value="AVENIDA">Avenida</option>
                              <option value="TRAVESSA">Travessa</option>
                              <option value="ALAMEDA">Alameda</option>
                              <option value="RODOVIA">Rodovia</option>
                              <option value="PRACA">Praça</option>
                              <option value="BECO">Beco</option>
                            </select>
                          </div>

                          {/* Logradouro */}
                          <div className="flex flex-col gap-1 sm:col-span-3">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Logradouro *</label>
                            <input
                              type="text"
                              value={editLogradouro}
                              onChange={(e) => setEditLogradouro(e.target.value)}
                              placeholder="Nome da rua/avenida"
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs"
                            />
                          </div>

                          {/* Número */}
                          <div className="flex flex-col gap-1 sm:col-span-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">N° *</label>
                            <input
                              type="text"
                              value={editNumero}
                              onChange={(e) => setEditNumero(e.target.value)}
                              placeholder="N°"
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs"
                            />
                          </div>

                          {/* Bairro */}
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Bairro *</label>
                            <input
                              type="text"
                              value={editBairro}
                              onChange={(e) => setEditBairro(e.target.value)}
                              placeholder="Bairro"
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs"
                            />
                          </div>

                          {/* Complemento */}
                          <div className="flex flex-col gap-1 sm:col-span-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Complemento</label>
                            <input
                              type="text"
                              value={editComplemento}
                              onChange={(e) => setEditComplemento(e.target.value)}
                              placeholder="Apto, Bloco..."
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs"
                            />
                          </div>

                          {/* Município */}
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Município *</label>
                            <input
                              type="text"
                              value={editMunicipio}
                              onChange={(e) => setEditMunicipio(e.target.value)}
                              placeholder="Município - UF"
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs"
                            />
                          </div>

                          {/* Localização */}
                          <div className="flex flex-col gap-1 sm:col-span-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Localização</label>
                            <select
                              value={editLocalizacao}
                              onChange={(e) => setEditLocalizacao(e.target.value)}
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
                            >
                              <option value="URBANA">Urbana</option>
                              <option value="RURAL">Rural</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Dados Clínicos & Anexo */}
        <div className={`grid grid-cols-1 ${user?.perfil !== 'RECEPCIONISTA_UBS' ? 'lg:grid-cols-2' : ''} gap-6`}>
          
          {/* Procedimento & Encaminhamento - oculto para recepcionista */}
          {user?.perfil !== 'RECEPCIONISTA_UBS' && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50/50 to-transparent">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-4.5 w-4.5 text-rose-600" />
                  Procedimento & Dados Clínicos
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Informações sobre a solicitação e observações de atendimento</p>
              </div>
              
              <div className="p-6 space-y-4 flex-1">
                {/* Procedimento Solicitado */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Procedimento Solicitado *</label>
                  <input
                    {...register('procedimentoSolicitado')}
                    placeholder="Ex: Consulta com Cardiologista, Ressonância Magnética..."
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 transition-all"
                  />
                  {errors.procedimentoSolicitado && (
                    <span className="text-xs font-medium text-red-500">{errors.procedimentoSolicitado.message}</span>
                  )}
                </div>

                {/* Observação Clínica */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Observação Clínica</label>
                    <span className="text-[11px] font-medium text-gray-400">Preenchido pelo médico no atendimento</span>
                  </div>
                  <textarea
                    {...register('observacaoClinica')}
                    placeholder="Observações clínicas relevantes para a regulação médica..."
                    rows={4}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 transition-all min-h-[100px] resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Anexo */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-transparent">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Paperclip className="h-4.5 w-4.5 text-amber-600" />
                  Anexo Obrigatório
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Faça o upload do documento físico digitalizado (Max. 1 arquivo)</p>
              </div>
              
              <div className="p-6 space-y-4">
                <FileUpload
                  onFilesChange={setFiles}
                  maxFiles={1}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="flex items-start gap-3 p-4 bg-amber-50/70 border border-amber-200/50 rounded-xl">
                <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  <span className="font-bold">Dica:</span> Utilize aplicativos como ClearScanner, CamScanner ou o app do Google Drive
                  no celular para fotografar o Encaminhamento Médico + CPF + CNH + Cartão SUS de uma só vez e gerar um único arquivo PDF.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Responsável pelo Encaminhamento */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-teal-600" />
              Responsável pelo Encaminhamento
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Selecione o médico cadastrado responsável pelo encaminhamento do paciente</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-1.5 max-w-xl">
              <label className="text-sm font-medium text-gray-700">Médico Responsável *</label>
              {medicos.length > 0 ? (
                <select
                  {...register('responsavelEncaminhamento')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 transition-all font-medium text-gray-800"
                >
                  <option value="">Selecione o Médico Cadastrado...</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.nome}>
                      Dr(a). {m.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...register('responsavelEncaminhamento')}
                  placeholder={loadingMedicos ? "Carregando médicos cadastrados..." : "Nome do Médico Responsável"}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 transition-all"
                />
              )}
              {errors.responsavelEncaminhamento && (
                <span className="text-xs font-medium text-red-500">{errors.responsavelEncaminhamento.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-sm font-bold text-white shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Enviando...' : user?.perfil === 'RECEPCIONISTA_UBS' ? 'Enviar Ficha ao Médico' : 'Criar Ficha de Regulação'}
          </button>
        </div>
      </form>

      {/* Modal / Popup de Cadastro de Paciente Inline */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 flex flex-col">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gray-50 rounded-t-2xl shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Cadastrar Novo Paciente (Cadastro Único)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Após salvar, o paciente será automaticamente selecionado na ficha.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Corpo do Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              <CadastrarPaciente isModal={true} onSuccess={handleCreateSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atualização de Contato do Paciente */}
      {contactModalOpen && selectedPaciente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent rounded-t-2xl">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Atualizar Contato do Paciente
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verifique e atualize os dados de contato de <span className="font-semibold text-gray-700">{selectedPaciente.nomeCompleto}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-lg flex items-center gap-2 text-blue-800 text-xs font-semibold">
                <Info className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Confirme os dados de contato atuais do paciente. Eles serão salvos no cadastro.</span>
              </div>

              {/* Celular */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  Celular *
                </label>
                <input
                  type="text"
                  value={contactCelular}
                  onChange={handleContactCelularChange}
                  placeholder="(XX) 9XXXX-XXXX"
                  maxLength={15}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
                />
              </div>

              {/* Telefone Fixo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-gray-400" />
                  Telefone Fixo
                </label>
                <input
                  type="text"
                  value={contactTelefone}
                  onChange={handleContactTelefoneChange}
                  placeholder="(XX) 0000-0000"
                  maxLength={14}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-gray-400" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                Pular
              </button>
              <button
                type="button"
                onClick={handleSaveContact}
                disabled={savingContact}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-75"
              >
                {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingContact ? 'Salvando...' : 'Salvar Contato'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default NovaFichaRegulacao;
