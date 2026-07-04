import { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { criarFichaRegulacao } from '../../services/regulacaoService';
import { FileUpload } from '../../components/ui/FileUpload';
import { formatCPF, formatPhone } from '../../lib/utils';

const phoneRegex = /^\(\d{2}\) 9\d{4}-\d{4}$/;

const fichaSchema = z.object({
  responsavelEncaminhamento: z.string().min(3, 'Nome do responsável é obrigatório (mín. 3 caracteres)'),
  acsResponsavel: z.string().min(3, 'Nome do ACS responsável é obrigatório (mín. 3 caracteres)'),
  pacienteNome: z.string().min(3, 'Nome do paciente é obrigatório (mín. 3 caracteres)'),
  pacienteCpf: z.string().min(14, 'CPF inválido. Use o formato 000.000.000-00'),
  pacienteDataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  pacienteTelefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(phoneRegex, 'Formato inválido. Use (XX) 9XXXX-XXXX'),
  pacienteCartaoSus: z.string().optional(),
  pacienteEndereco: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FichaFormData>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      tipoAtendimento: 'SUS',
    },
  });

  const cpfValue = watch('pacienteCpf');
  const telefoneValue = watch('pacienteTelefone');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue('pacienteCpf', formatted, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('pacienteTelefone', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: FichaFormData) => {
    try {
      setSubmitting(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      if (files.length > 0) {
        formData.append('anexo', files[0]);
      }

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
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FilePlus2 className="h-6 w-6 text-teal-600" />
            Nova Ficha de Regulação
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Preencha os dados para encaminhar o paciente à fila de regulação
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
        {/* Section: Responsáveis */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              Responsáveis
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Profissionais responsáveis pelo encaminhamento</p>
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
                <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  {errors.responsavelEncaminhamento.message}
                </span>
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
                <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  {errors.acsResponsavel.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section: Dados do Paciente */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Dados do Paciente
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Informações pessoais e de contato do paciente</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Nome Completo *</label>
              <input
                {...register('pacienteNome')}
                placeholder="Nome completo do paciente"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.pacienteNome && (
                <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  {errors.pacienteNome.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">CPF *</label>
              <input
                value={cpfValue || ''}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.pacienteCpf && (
                <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  {errors.pacienteCpf.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Data de Nascimento *</label>
              <input
                type="date"
                {...register('pacienteDataNascimento')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.pacienteDataNascimento && (
                <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  {errors.pacienteDataNascimento.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Telefone *</label>
              <input
                value={telefoneValue || ''}
                onChange={handlePhoneChange}
                placeholder="(XX) 9XXXX-XXXX"
                maxLength={15}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.pacienteTelefone && (
                <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  {errors.pacienteTelefone.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Cartão SUS</label>
              <input
                {...register('pacienteCartaoSus')}
                placeholder="Número do Cartão SUS (opcional)"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Tipo de Atendimento *</label>
              <select
                {...register('tipoAtendimento')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all"
              >
                <option value="SUS">SUS</option>
                <option value="PARCERIA">Parceria</option>
              </select>
              {errors.tipoAtendimento && (
                <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  {errors.tipoAtendimento.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Endereço</label>
              <textarea
                {...register('pacienteEndereco')}
                placeholder="Endereço completo do paciente (opcional)"
                rows={2}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all min-h-[60px]"
              />
            </div>
          </div>
        </div>

        {/* Section: Dados Clínicos */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-600" />
              Dados Clínicos
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Informações sobre o procedimento e observações clínicas</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Procedimento Solicitado *</label>
              <input
                {...register('procedimentoSolicitado')}
                placeholder="Ex: Consulta com Cardiologista, Ressonância Magnética..."
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.procedimentoSolicitado && (
                <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                  {errors.procedimentoSolicitado.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Observação Clínica</label>
              <textarea
                {...register('observacaoClinica')}
                placeholder="Informações clínicas relevantes para a regulação (opcional)"
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 transition-all min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Section: Anexo */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-amber-600" />
              Anexo
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Documento digitalizado do encaminhamento médico</p>
          </div>
          <div className="p-6 space-y-4">
            <FileUpload
              onFilesChange={setFiles}
              maxFiles={1}
              accept=".pdf,.jpg,.jpeg,.png"
            />

            <div className="flex items-start gap-3 p-4 bg-amber-50/70 border border-amber-200/50 rounded-xl">
              <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                <span className="font-bold">Dica:</span> Utilize aplicativos como ClearScanner, CamScanner ou o app do Google Drive
                no celular para fotografar o Encaminhamento Médico + CPF + CNH + Cartão SUS de uma só vez e gerar um único arquivo PDF.
              </p>
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
    </div>
  );
}
