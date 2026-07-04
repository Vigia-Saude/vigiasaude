import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router';
import { 
  UserPlus, 
  ArrowLeft, 
  Search, 
  Loader2, 
  MapPin, 
  User, 
  Info 
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCPF, formatPhone, cn } from '../../lib/utils';
import { criarPaciente, buscarPacientes } from '../../services/pacienteService';
import type { SexoPaciente, Paciente } from '../../types';

// Validador Zod
const pacienteSchema = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato inválido. Use 000.000.000-00'),
  cartaoSus: z.string().optional().or(z.literal('')),
  nomeCompleto: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'PREFIRO_NAO_INFORMAR'] as const, {
    message: 'Selecione o sexo/gênero'
  }),
  nomeMae: z.string().optional().or(z.literal('')),
  telefone: z.string().regex(/^\(\d{2}\) 9\d{4}-\d{4}$/, 'Formato inválido. Use (XX) 9XXXX-XXXX'),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'Formato inválido. Use 00000-000'),
  logradouro: z.string().min(3, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  municipio: z.string().min(2, 'Município é obrigatório'),
});

type PacienteFormValues = z.infer<typeof pacienteSchema>;

interface CadastrarPacienteProps {
  onSuccess?: (paciente: Paciente) => void;
  isModal?: boolean;
}

export function CadastrarPaciente({ onSuccess, isModal = false }: CadastrarPacienteProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingCadsus, setIsSearchingCadsus] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<PacienteFormValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      cpf: '',
      cartaoSus: '',
      nomeCompleto: '',
      dataNascimento: '',
      sexo: undefined,
      nomeMae: '',
      telefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      municipio: '',
    }
  });

  const cpfValue = watch('cpf');
  const susValue = watch('cartaoSus');
  const telefoneValue = watch('telefone');
  const cepValue = watch('cep');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('cpf', formatCPF(e.target.value), { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('telefone', formatPhone(e.target.value), { shouldValidate: true });
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);
    if (value.length > 5) {
      value = `${value.substring(0, 5)}-${value.substring(5)}`;
    }
    setValue('cep', value, { shouldValidate: true });
  };

  // Botão Puxar Dados / CADSUS Local
  const handlePuxarDados = async () => {
    const cpf = getValues('cpf');
    const sus = getValues('cartaoSus');

    if (!cpf && !sus) {
      toast.error('Informe o CPF ou o Cartão SUS para buscar.');
      return;
    }

    setIsSearchingCadsus(true);
    try {
      const busca = cpf || sus || '';
      console.log(`[CADSUS] Buscando paciente: ${busca}...`);
      const resultados = await buscarPacientes(busca);

      if (resultados && resultados.length > 0) {
        const paciente = resultados[0];
        toast.success('Paciente encontrado no cadastro local! Dados preenchidos.');
        
        setValue('cpf', paciente.cpf, { shouldValidate: true });
        if (paciente.cartaoSus) setValue('cartaoSus', paciente.cartaoSus, { shouldValidate: true });
        setValue('nomeCompleto', paciente.nomeCompleto, { shouldValidate: true });
        
        // Formatar data para YYYY-MM-DD
        const dataFormatada = new Date(paciente.dataNascimento).toISOString().split('T')[0];
        setValue('dataNascimento', dataFormatada, { shouldValidate: true });
        setValue('sexo', paciente.sexo, { shouldValidate: true });
        if (paciente.nomeMae) setValue('nomeMae', paciente.nomeMae, { shouldValidate: true });
        setValue('telefone', paciente.telefone, { shouldValidate: true });
        setValue('cep', paciente.cep, { shouldValidate: true });
        setValue('logradouro', paciente.logradouro, { shouldValidate: true });
        setValue('numero', paciente.numero, { shouldValidate: true });
        setValue('bairro', paciente.bairro, { shouldValidate: true });
        setValue('municipio', paciente.municipio, { shouldValidate: true });
      } else {
        toast.info('Documento não encontrado no banco local.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao buscar dados do paciente.');
    } finally {
      setIsSearchingCadsus(false);
    }
  };

  const onSubmit = async (values: PacienteFormValues) => {
    setIsSubmitting(true);
    try {
      const novoPaciente = await criarPaciente(values);
      toast.success(`Paciente ${novoPaciente.nomeCompleto} cadastrado com prontuário ${novoPaciente.prontuario}!`);
      
      if (onSuccess) {
        onSuccess(novoPaciente);
      } else {
        navigate('/posto/pacientes');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erro ao cadastrar paciente. Verifique se o CPF já está cadastrado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-6 pb-8 animate-in fade-in duration-300", isModal ? "pb-0" : "")}>
      {/* Header (apenas se não for modal) */}
      {!isModal && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/posto/pacientes')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para listagem
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-cyan-600" />
              Novo Cadastro de Paciente
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Preencha os dados do paciente para o Cadastro Único de Saúde do município.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card 1: DADOS PRINCIPAIS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50/50 to-transparent flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-cyan-600" />
              Dados Principais
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Info className="h-3.5 w-3.5" />
              Campos marcados com * são obrigatórios.
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-6 gap-5">
            {/* CPF */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">CPF *</label>
              <div className="flex gap-2">
                <input
                  value={cpfValue}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
                />
                <button
                  type="button"
                  onClick={handlePuxarDados}
                  disabled={isSearchingCadsus}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-350 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-cyan-700 disabled:opacity-50 transition-all shrink-0"
                  title="Puxar dados do CADSUS/Banco Local"
                >
                  {isSearchingCadsus ? (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  CADSUS
                </button>
              </div>
              {errors.cpf && (
                <span className="text-xs font-medium text-red-500">{errors.cpf.message}</span>
              )}
            </div>

            {/* Cartão SUS */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Cartão SUS</label>
              <input
                {...register('cartaoSus')}
                value={susValue}
                onChange={(e) => setValue('cartaoSus', e.target.value.replace(/\D/g, '').substring(0, 15))}
                placeholder="Número do Cartão Nacional de Saúde"
                maxLength={15}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.cartaoSus && (
                <span className="text-xs font-medium text-red-500">{errors.cartaoSus.message}</span>
              )}
            </div>

            {/* Nome Completo */}
            <div className="flex flex-col gap-1.5 md:col-span-4">
              <label className="text-sm font-medium text-gray-700">Nome Completo *</label>
              <input
                {...register('nomeCompleto')}
                placeholder="Nome completo do paciente"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.nomeCompleto && (
                <span className="text-xs font-medium text-red-500">{errors.nomeCompleto.message}</span>
              )}
            </div>

            {/* Data Nascimento */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Data de Nascimento *</label>
              <input
                type="date"
                {...register('dataNascimento')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.dataNascimento && (
                <span className="text-xs font-medium text-red-500">{errors.dataNascimento.message}</span>
              )}
            </div>

            {/* Sexo / Gênero */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Sexo / Gênero *</label>
              <select
                {...register('sexo')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              >
                <option value="">Selecione...</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
                <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
              </select>
              {errors.sexo && (
                <span className="text-xs font-medium text-red-500">{errors.sexo.message}</span>
              )}
            </div>

            {/* Telefone */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Telefone *</label>
              <input
                value={telefoneValue}
                onChange={handlePhoneChange}
                placeholder="(XX) 9XXXX-XXXX"
                maxLength={15}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.telefone && (
                <span className="text-xs font-medium text-red-500">{errors.telefone.message}</span>
              )}
            </div>

            {/* Nome da Mãe */}
            <div className="flex flex-col gap-1.5 md:col-span-4">
              <label className="text-sm font-medium text-gray-700">Nome da Mãe</label>
              <input
                {...register('nomeMae')}
                placeholder="Nome completo da genitora"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.nomeMae && (
                <span className="text-xs font-medium text-red-500">{errors.nomeMae.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: ENDEREÇO */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50/50 to-transparent">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-cyan-600" />
              Endereço do Paciente
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-6 gap-5">
            {/* CEP */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">CEP *</label>
              <input
                value={cepValue}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={9}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.cep && (
                <span className="text-xs font-medium text-red-500">{errors.cep.message}</span>
              )}
            </div>

            {/* Logradouro */}
            <div className="flex flex-col gap-1.5 md:col-span-4">
              <label className="text-sm font-medium text-gray-700">Logradouro (Rua/Avenida) *</label>
              <input
                {...register('logradouro')}
                placeholder="Ex: Rua das Flores"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.logradouro && (
                <span className="text-xs font-medium text-red-500">{errors.logradouro.message}</span>
              )}
            </div>

            {/* Número */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Número *</label>
              <input
                {...register('numero')}
                placeholder="Ex: 123 ou S/N"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.numero && (
                <span className="text-xs font-medium text-red-500">{errors.numero.message}</span>
              )}
            </div>

            {/* Bairro */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Bairro *</label>
              <input
                {...register('bairro')}
                placeholder="Ex: Centro"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.bairro && (
                <span className="text-xs font-medium text-red-500">{errors.bairro.message}</span>
              )}
            </div>

            {/* Município */}
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-sm font-medium text-gray-700">Município *</label>
              <input
                {...register('municipio')}
                placeholder="Ex: Campo Grande - MS"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 transition-all"
              />
              {errors.municipio && (
                <span className="text-xs font-medium text-red-500">{errors.municipio.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          {!isModal && (
            <button
              type="button"
              onClick={() => navigate('/posto/pacientes')}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 transition-all disabled:opacity-50 min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Cadastro'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
export default CadastrarPaciente;
