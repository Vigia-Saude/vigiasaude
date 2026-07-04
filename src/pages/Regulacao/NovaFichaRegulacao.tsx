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
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { criarFichaRegulacao } from '../../services/regulacaoService';
import { buscarPacientes } from '../../services/pacienteService';
import { FileUpload } from '../../components/ui/FileUpload';
import { CadastrarPaciente } from '../Pacientes/CadastrarPaciente';
import type { Paciente } from '../../types';

const fichaSchema = z.object({
  responsavelEncaminhamento: z.string().min(3, 'Nome do responsável é obrigatório (mín. 3 caracteres)'),
  acsResponsavel: z.string().min(3, 'Nome do ACS responsável é obrigatório (mín. 3 caracteres)'),
  pacienteId: z.string().min(1, 'Selecione um paciente'),
  tipoAtendimento: z.enum(['SUS', 'PARCERIA'], { message: 'Selecione o tipo de atendimento' }),
  procedimentoSolicitado: z.string().min(3, 'Procedimento solicitado é obrigatório (mín. 3 caracteres)'),
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

  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FichaFormData>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      tipoAtendimento: 'SUS',
      pacienteId: '',
    },
  });

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
  };

  const handleRemovePaciente = () => {
    setSelectedPaciente(null);
    setValue('pacienteId', '', { shouldValidate: true });
  };

  const handleCreateSuccess = (novoPaciente: Paciente) => {
    handleSelectPaciente(novoPaciente);
    setModalOpen(false);
  };

  const onSubmit = async (data: FichaFormData) => {
    if (files.length === 0) {
      toast.error('O arquivo do encaminhamento (Anexo) é obrigatório!');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      formData.append('anexo', files[0]);

      await criarFichaRegulacao(formData);
      toast.success('Ficha de regulação criada com sucesso!');
      navigate('/posto/regulacao/acoes');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.erro || 'Erro ao criar ficha de regulação.');
    } finally {
      setSubmitting(false);
    }
  };

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
        
        {/* Section 1: Seleção de Paciente */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-blue-600" />
              Seleção do Paciente
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Busque o paciente cadastrado ou crie um novo cadastro instantaneamente</p>
          </div>
          
          <div className="p-6">
            {!selectedPaciente ? (
              <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
                <label className="text-sm font-medium text-gray-700">Buscar Paciente (CPF ou Nome) *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400 stroke-[1.8]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite o CPF ou nome do paciente..."
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

                {/* Dropdown Autocomplete */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-[70px] left-0 right-0 z-50 max-h-60 overflow-y-auto rounded-lg border border-gray-250 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
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
              /* Card do Paciente Selecionado (Read-Only) */
              <div className="bg-blue-50/40 rounded-xl border border-blue-150 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full p-2.5 shrink-0 mt-0.5">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 leading-none">{selectedPaciente.nomeCompleto}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 pt-1 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> CPF: {selectedPaciente.cpf}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Nasc: {new Date(selectedPaciente.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> Tel: {selectedPaciente.telefone}
                      </span>
                      {selectedPaciente.cartaoSus && (
                        <span className="flex items-center gap-1 sm:col-span-3 mt-0.5">
                          SUS: {selectedPaciente.cartaoSus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleRemovePaciente}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-650 bg-white hover:bg-red-50 hover:text-red-700 active:scale-95 transition-all shadow-xs cursor-pointer self-end md:self-center shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                  Trocar Paciente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Dados Clínicos & Anexo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Dados Clínicos */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50/50 to-transparent">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-rose-600" />
                Dados Clínicos & Pedido
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Informações sobre o atendimento e o procedimento solicitado</p>
            </div>
            
            <div className="p-6 space-y-4 flex-1">
              {/* Tipo Atendimento */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Tipo de Atendimento *</label>
                <select
                  {...register('tipoAtendimento')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 transition-all"
                >
                  <option value="SUS">SUS</option>
                  <option value="PARCERIA">Parceria</option>
                </select>
                {errors.tipoAtendimento && (
                  <span className="text-xs font-medium text-red-500">{errors.tipoAtendimento.message}</span>
                )}
              </div>

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
                <label className="text-sm font-medium text-gray-700">Observação Clínica</label>
                <textarea
                  {...register('observacaoClinica')}
                  placeholder="Observações clínicas relevantes para o regulador médico (opcional)..."
                  rows={4}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 transition-all min-h-[100px] resize-y"
                />
              </div>
            </div>
          </div>

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

        {/* Section 3: Responsáveis */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-teal-600" />
              Responsáveis pelo Encaminhamento
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Profissionais da ESF vinculados a esta solicitação</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Responsável pelo Encaminhamento *</label>
              <input
                {...register('responsavelEncaminhamento')}
                placeholder="Nome do profissional que encaminha"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.responsavelEncaminhamento && (
                <span className="text-xs font-medium text-red-500">{errors.responsavelEncaminhamento.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">ACS Responsável *</label>
              <input
                {...register('acsResponsavel')}
                placeholder="Nome do Agente Comunitário de Saúde"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.acsResponsavel && (
                <span className="text-xs font-medium text-red-500">{errors.acsResponsavel.message}</span>
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
            {submitting ? 'Enviando...' : 'Criar Ficha de Regulação'}
          </button>
        </div>
      </form>

      {/* Modal / Popup de Cadastro de Paciente Inline */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 flex flex-col animate-in zoom-in-95 duration-200">
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
    </div>
  );
}
export default NovaFichaRegulacao;
