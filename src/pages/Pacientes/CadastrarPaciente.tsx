import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router';
import { 
  UserPlus, 
  ArrowLeft, 
  Search, 
  Loader2, 
  MapPin, 
  User, 
  Info,
  Phone,
  Smartphone,
  Mail,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCPF, formatPhone, cn } from '../../lib/utils';
import { criarPaciente, buscarPacientes, detalhesPaciente, atualizarPaciente } from '../../services/pacienteService';
import type { SexoPaciente, Paciente } from '../../types';

// Validador Zod completo baseado nos campos do e-SAÚDE
const pacienteSchema = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato inválido. Use 000.000.000-00'),
  cartaoSus: z.string().optional().or(z.literal('')),
  nomeCompleto: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.enum(['MASCULINO', 'FEMININO', 'OUTRO', 'PREFIRO_NAO_INFORMAR'] as const, {
    message: 'Selecione o sexo/gênero'
  }),
  orientacaoSexual: z.string().optional().or(z.literal('')),
  identidadeGenero: z.string().optional().or(z.literal('')),
  nomeSocial: z.string().optional().or(z.literal('')),
  municipioNascimento: z.string().optional().or(z.literal('')),
  nacionalidade: z.string().min(1, 'Nacionalidade é obrigatória'),
  paisNascimento: z.string().min(1, 'País de nascimento é obrigatório'),
  corRaca: z.string().min(1, 'Cor/Raça é obrigatória'),
  etnia: z.string().optional().or(z.literal('')),
  tipoSanguineo: z.string().optional().or(z.literal('')),
  prontuariosAntigos: z.string().optional().or(z.literal('')),
  alergias: z.string().optional().or(z.literal('')),
  familia: z.string().optional().or(z.literal('')),
  area: z.string().optional().or(z.literal('')),
  subarea: z.string().optional().or(z.literal('')),
  escolaridade: z.string().optional().or(z.literal('')),
  
  celular: z.string().regex(/^\(\d{2}\) 9\d{4}-\d{4}$/, 'Formato inválido. Use (XX) 9XXXX-XXXX'),
  telefone: z.string().optional().or(z.literal('')),
  email: z.string().email('E-mail em formato inválido').optional().or(z.literal('')),
  nomeMae: z.string().optional().or(z.literal('')),
  maeDesconhecida: z.boolean().default(false),
  nomePai: z.string().optional().or(z.literal('')),
  paiDesconhecido: z.boolean().default(false),
  
  rg: z.string().optional().or(z.literal('')),
  orgaoEmissor: z.string().optional().or(z.literal('')),
  ufRg: z.string().optional().or(z.literal('')),
  dataExpedicaoRg: z.string().optional().or(z.literal('')),
  nis: z.string().optional().or(z.literal('')),
  certidaoNascimento: z.string().optional().or(z.literal('')),
  dataObito: z.string().optional().or(z.literal('')),
  tituloEleitor: z.string().optional().or(z.literal('')),
  estadoCivil: z.string().optional().or(z.literal('')),
  funcionarioExterno: z.boolean().default(false),
  observacao: z.string().optional().or(z.literal('')),
  profissaoCbo: z.string().optional().or(z.literal('')),
  localTrabalho: z.string().optional().or(z.literal('')),
  
  situacaoRua: z.boolean().default(false),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'Formato inválido. Use 00000-000'),
  tipoLogradouro: z.string().min(1, 'Tipo de logradouro é obrigatório'),
  logradouro: z.string().min(3, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  complemento: z.string().optional().or(z.literal('')),
  municipio: z.string().min(2, 'Município é obrigatório'),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
});

type PacienteFormValues = z.infer<typeof pacienteSchema>;

interface CadastrarPacienteProps {
  onSuccess?: (paciente: Paciente) => void;
  isModal?: boolean;
}

export function CadastrarPaciente({ onSuccess, isModal = false }: CadastrarPacienteProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingCadsus, setIsSearchingCadsus] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [prontuario, setProntuario] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: {
      cpf: '',
      cartaoSus: '',
      nomeCompleto: '',
      dataNascimento: '',
      sexo: undefined,
      orientacaoSexual: '',
      identidadeGenero: '',
      nomeSocial: '',
      municipioNascimento: '',
      nacionalidade: 'BRASILEIRA',
      paisNascimento: 'BRASIL',
      corRaca: 'Não informada',
      etnia: '',
      tipoSanguineo: '',
      prontuariosAntigos: '',
      alergias: '',
      familia: '',
      area: '',
      subarea: '',
      escolaridade: '',
      celular: '',
      telefone: '',
      email: '',
      nomeMae: '',
      maeDesconhecida: false,
      nomePai: '',
      paiDesconhecido: false,
      rg: '',
      orgaoEmissor: '',
      ufRg: '',
      dataExpedicaoRg: '',
      nis: '',
      certidaoNascimento: '',
      dataObito: '',
      tituloEleitor: '',
      estadoCivil: '',
      funcionarioExterno: false,
      observacao: '',
      profissaoCbo: '',
      localTrabalho: '',
      situacaoRua: false,
      cep: '',
      tipoLogradouro: 'RUA',
      logradouro: '',
      numero: '',
      bairro: '',
      complemento: '',
      municipio: '',
      localizacao: 'URBANA',
    }
  });

  const cpfValue = watch('cpf');
  const susValue = watch('cartaoSus');
  const celularValue = watch('celular');
  const telefoneValue = watch('telefone');
  const cepValue = watch('cep');
  const maeDesconhecida = watch('maeDesconhecida');
  const paiDesconhecido = watch('paiDesconhecido');
  const situacaoRua = watch('situacaoRua');

  // Carregar dados para edição caso haja ID
  useEffect(() => {
    if (id) {
      const fetchPatient = async () => {
        setLoadingPatient(true);
        try {
          const paciente = await detalhesPaciente(id);
          setProntuario(paciente.prontuario || '');
          
          const dataNasc = paciente.dataNascimento 
            ? new Date(paciente.dataNascimento).toISOString().split('T')[0]
            : '';
            
          const dataExp = paciente.dataExpedicaoRg
            ? new Date(paciente.dataExpedicaoRg).toISOString().split('T')[0]
            : '';

          const dataOb = paciente.dataObito
            ? new Date(paciente.dataObito).toISOString().split('T')[0]
            : '';

          reset({
            cpf: paciente.cpf,
            cartaoSus: paciente.cartaoSus || '',
            nomeCompleto: paciente.nomeCompleto,
            dataNascimento: dataNasc,
            sexo: paciente.sexo,
            orientacaoSexual: paciente.orientacaoSexual || '',
            identidadeGenero: paciente.identidadeGenero || '',
            nomeSocial: paciente.nomeSocial || '',
            municipioNascimento: paciente.municipioNascimento || '',
            nacionalidade: paciente.nacionalidade || 'BRASILEIRA',
            paisNascimento: paciente.paisNascimento || 'BRASIL',
            corRaca: paciente.corRaca || 'Não informada',
            etnia: paciente.etnia || '',
            tipoSanguineo: paciente.tipoSanguineo || '',
            prontuariosAntigos: paciente.prontuariosAntigos || '',
            alergias: paciente.alergias || '',
            familia: paciente.familia || '',
            area: paciente.area || '',
            subarea: paciente.subarea || '',
            escolaridade: paciente.escolaridade || '',
            
            celular: paciente.celular,
            telefone: paciente.telefone || '',
            email: paciente.email || '',
            nomeMae: paciente.nomeMae || '',
            maeDesconhecida: paciente.maeDesconhecida || false,
            nomePai: paciente.nomePai || '',
            paiDesconhecido: paciente.paiDesconhecido || false,
            
            rg: paciente.rg || '',
            orgaoEmissor: paciente.orgaoEmissor || '',
            ufRg: paciente.ufRg || '',
            dataExpedicaoRg: dataExp,
            nis: paciente.nis || '',
            certidaoNascimento: paciente.certidaoNascimento || '',
            dataObito: dataOb,
            tituloEleitor: paciente.tituloEleitor || '',
            estadoCivil: paciente.estadoCivil || '',
            funcionarioExterno: paciente.funcionarioExterno || false,
            observacao: paciente.observacao || '',
            profissaoCbo: paciente.profissaoCbo || '',
            localTrabalho: paciente.localTrabalho || '',
            
            situacaoRua: paciente.situacaoRua || false,
            cep: paciente.cep,
            tipoLogradouro: paciente.tipoLogradouro || 'RUA',
            logradouro: paciente.logradouro,
            numero: paciente.numero,
            bairro: paciente.bairro,
            complemento: paciente.complemento || '',
            municipio: paciente.municipio,
            localizacao: paciente.localizacao || 'URBANA',
          });
        } catch (err) {
          console.error(err);
          toast.error('Erro ao carregar dados do paciente.');
        } finally {
          setLoadingPatient(false);
        }
      };
      fetchPatient();
    }
  }, [id, reset]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('cpf', formatCPF(e.target.value), { shouldValidate: true });
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('celular', formatPhone(e.target.value), { shouldValidate: true });
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
    }
    setValue('telefone', value, { shouldValidate: true });
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);
    if (value.length > 5) {
      value = `${value.substring(0, 5)}-${value.substring(5)}`;
    }
    setValue('cep', value, { shouldValidate: true });
  };

  // Buscar CEP via API do ViaCEP
  useEffect(() => {
    const cleanCep = (cepValue || '').replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const fetchAddress = async () => {
        setIsLoadingCep(true);
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setValue('logradouro', data.logradouro || '', { shouldValidate: true });
            setValue('bairro', data.bairro || '', { shouldValidate: true });
            setValue('municipio', `${data.localidade} - ${data.uf}`, { shouldValidate: true });
            
            if (data.logradouro) {
              const firstWord = data.logradouro.split(' ')[0].toUpperCase();
              const tiposValidos = ['RUA', 'AVENIDA', 'TRAVESSA', 'PRACA', 'RODOVIA', 'ALAMEDA', 'BECO'];
              const matched = tiposValidos.find(t => firstWord.includes(t) || t.includes(firstWord));
              if (matched) {
                setValue('tipoLogradouro', matched, { shouldValidate: true });
              }
            }
            toast.success('Endereço auto-preenchido pelo CEP!');
          } else {
            toast.warning('CEP não encontrado.');
          }
        } catch (err) {
          console.error(err);
          toast.error('Erro ao buscar o CEP.');
        } finally {
          setIsLoadingCep(false);
        }
      };
      fetchAddress();
    }
  }, [cepValue, setValue]);

  // Se Mae Desconhecida, limpa o nome e desabilita
  useEffect(() => {
    if (maeDesconhecida) {
      setValue('nomeMae', 'Desconhecida');
    } else {
      if (getValues('nomeMae') === 'Desconhecida') {
        setValue('nomeMae', '');
      }
    }
  }, [maeDesconhecida, setValue]);

  // Se Pai Desconhecido, limpa o nome e desabilita
  useEffect(() => {
    if (paiDesconhecido) {
      setValue('nomePai', 'Desconhecido');
    } else {
      if (getValues('nomePai') === 'Desconhecido') {
        setValue('nomePai', '');
      }
    }
  }, [paiDesconhecido, setValue]);

  // Se Situação de rua, auto-preenche endereço
  useEffect(() => {
    if (situacaoRua) {
      setValue('cep', '00000-000', { shouldValidate: true });
      setValue('tipoLogradouro', 'RUA', { shouldValidate: true });
      setValue('logradouro', 'SITUAÇÃO DE RUA', { shouldValidate: true });
      setValue('numero', 'S/N', { shouldValidate: true });
      setValue('bairro', 'CENTRO', { shouldValidate: true });
      setValue('municipio', 'CAMPO GRANDE - MS', { shouldValidate: true });
    }
  }, [situacaoRua, setValue]);

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
      const resultados = await buscarPacientes(busca);

      if (resultados && resultados.length > 0) {
        const paciente = resultados[0];
        toast.success('Paciente encontrado no cadastro local! Dados preenchidos.');
        
        setValue('cpf', paciente.cpf, { shouldValidate: true });
        if (paciente.cartaoSus) setValue('cartaoSus', paciente.cartaoSus, { shouldValidate: true });
        setValue('nomeCompleto', paciente.nomeCompleto, { shouldValidate: true });
        
        const dataFormatada = new Date(paciente.dataNascimento).toISOString().split('T')[0];
        setValue('dataNascimento', dataFormatada, { shouldValidate: true });
        setValue('sexo', paciente.sexo, { shouldValidate: true });
        setValue('orientacaoSexual', paciente.orientacaoSexual || '', { shouldValidate: true });
        setValue('identidadeGenero', paciente.identidadeGenero || '', { shouldValidate: true });
        setValue('nomeSocial', paciente.nomeSocial || '', { shouldValidate: true });
        setValue('municipioNascimento', paciente.municipioNascimento || '', { shouldValidate: true });
        setValue('nacionalidade', paciente.nacionalidade || 'BRASILEIRA', { shouldValidate: true });
        setValue('paisNascimento', paciente.paisNascimento || 'BRASIL', { shouldValidate: true });
        setValue('corRaca', paciente.corRaca || 'Não informada', { shouldValidate: true });
        setValue('etnia', paciente.etnia || '', { shouldValidate: true });
        setValue('tipoSanguineo', paciente.tipoSanguineo || '', { shouldValidate: true });
        setValue('prontuariosAntigos', paciente.prontuariosAntigos || '', { shouldValidate: true });
        setValue('alergias', paciente.alergias || '', { shouldValidate: true });
        setValue('familia', paciente.familia || '', { shouldValidate: true });
        setValue('area', paciente.area || '', { shouldValidate: true });
        setValue('subarea', paciente.subarea || '', { shouldValidate: true });
        setValue('escolaridade', paciente.escolaridade || '', { shouldValidate: true });
        
        setValue('celular', paciente.celular, { shouldValidate: true });
        setValue('telefone', paciente.telefone || '', { shouldValidate: true });
        setValue('email', paciente.email || '', { shouldValidate: true });
        setValue('maeDesconhecida', paciente.maeDesconhecida, { shouldValidate: true });
        setValue('nomeMae', paciente.nomeMae || '', { shouldValidate: true });
        setValue('paiDesconhecido', paciente.paiDesconhecido, { shouldValidate: true });
        setValue('nomePai', paciente.nomePai || '', { shouldValidate: true });
        
        setValue('rg', paciente.rg || '', { shouldValidate: true });
        setValue('orgaoEmissor', paciente.orgaoEmissor || '', { shouldValidate: true });
        setValue('ufRg', paciente.ufRg || '', { shouldValidate: true });
        if (paciente.dataExpedicaoRg) {
          setValue('dataExpedicaoRg', new Date(paciente.dataExpedicaoRg).toISOString().split('T')[0], { shouldValidate: true });
        }
        setValue('nis', paciente.nis || '', { shouldValidate: true });
        setValue('certidaoNascimento', paciente.certidaoNascimento || '', { shouldValidate: true });
        if (paciente.dataObito) {
          setValue('dataObito', new Date(paciente.dataObito).toISOString().split('T')[0], { shouldValidate: true });
        }
        setValue('tituloEleitor', paciente.tituloEleitor || '', { shouldValidate: true });
        setValue('estadoCivil', paciente.estadoCivil || '', { shouldValidate: true });
        setValue('funcionarioExterno', paciente.funcionarioExterno, { shouldValidate: true });
        setValue('observacao', paciente.observacao || '', { shouldValidate: true });
        setValue('profissaoCbo', paciente.profissaoCbo || '', { shouldValidate: true });
        setValue('localTrabalho', paciente.localTrabalho || '', { shouldValidate: true });
        
        setValue('situacaoRua', paciente.situacaoRua, { shouldValidate: true });
        setValue('cep', paciente.cep, { shouldValidate: true });
        setValue('tipoLogradouro', paciente.tipoLogradouro || 'RUA', { shouldValidate: true });
        setValue('logradouro', paciente.logradouro, { shouldValidate: true });
        setValue('numero', paciente.numero, { shouldValidate: true });
        setValue('bairro', paciente.bairro, { shouldValidate: true });
        setValue('complemento', paciente.complemento || '', { shouldValidate: true });
        setValue('municipio', paciente.municipio, { shouldValidate: true });
        setValue('localizacao', paciente.localizacao || 'URBANA', { shouldValidate: true });
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

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (id) {
        const pacienteAtualizado = await atualizarPaciente(id, values);
        toast.success(`Cadastro de ${pacienteAtualizado.nomeCompleto} atualizado com sucesso!`);
      } else {
        const novoPaciente = await criarPaciente(values);
        toast.success(`Paciente ${novoPaciente.nomeCompleto} cadastrado com prontuário ${novoPaciente.prontuario}!`);
        if (onSuccess) {
          onSuccess(novoPaciente);
          setIsSubmitting(false);
          return;
        }
      }
      
      if (!isModal) {
        navigate('/posto/pacientes');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erro ao salvar os dados do paciente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPatient) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 pb-8 animate-in fade-in duration-300", isModal ? "pb-0" : "")}>
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
              {id ? 'Editar Cadastro de Pessoa' : 'Cadastrar Pessoa'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Formulário completo baseado na ficha e-SAÚDE / CADSUS nacional.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* SEÇÃO: DADOS PRINCIPAIS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50/50 to-transparent flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-cyan-600" />
              DADOS PRINCIPAIS
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Info className="h-3.5 w-3.5" />
              Campos marcados com * vermelho são obrigatórios.
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
            
            {/* COLUNA ESQUERDA (Dados Demográficos e Sociais) */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Prontuário */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Prontuário</label>
                  <input
                    disabled
                    value={prontuario}
                    placeholder="(Gerado automático)"
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                
                {/* Cartão SUS */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Cartão SUS</label>
                  <input
                    {...register('cartaoSus')}
                    value={susValue}
                    onChange={(e) => setValue('cartaoSus', e.target.value.replace(/\D/g, '').substring(0, 15))}
                    placeholder="CNS"
                    maxLength={15}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                </div>

                {/* CPF */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">CPF *</label>
                  <div className="flex gap-2">
                    <input
                      value={cpfValue}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="flex h-10 w-full rounded-md border border-gray-350 bg-white px-3 py-2 text-sm placeholder:text-gray-405 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handlePuxarDados}
                      disabled={isSearchingCadsus}
                      className="flex items-center justify-center gap-1 rounded-lg bg-cyan-600 px-3 text-xs font-bold text-white hover:bg-cyan-700 active:scale-95 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                      title="Puxar dados do CADSUS/Banco Local"
                    >
                      {isSearchingCadsus ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Search className="h-3.5 w-3.5" />
                      )}
                      CADSUS
                    </button>
                  </div>
                  {errors.cpf && (
                    <span className="text-[10px] font-medium text-red-500">{(errors.cpf.message as string)}</span>
                  )}
                </div>
              </div>

              {/* Nome */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Nome *</label>
                <input
                  {...register('nomeCompleto')}
                  placeholder="Nome completo do paciente"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-505 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                />
                {errors.nomeCompleto && (
                  <span className="text-[10px] font-medium text-red-500">{(errors.nomeCompleto.message as string)}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sexo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Sexo *</label>
                  <select
                    {...register('sexo')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro</option>
                    <option value="PREFIRO_NAO_INFORMAR">Prefiro não informar</option>
                  </select>
                  {errors.sexo && (
                    <span className="text-[10px] font-medium text-red-500">{(errors.sexo.message as string)}</span>
                  )}
                </div>

                {/* Orientação Sexual */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Orientação Sexual</label>
                  <select
                    {...register('orientacaoSexual')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Heterossexual">Heterossexual</option>
                    <option value="Homossexual">Homossexual (Gay/Lésbica)</option>
                    <option value="Bissexual">Bissexual</option>
                    <option value="Outra">Outra</option>
                    <option value="Não informada">Não informada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Identidade de Gênero */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Identidade de Gênero</label>
                  <select
                    {...register('identidadeGenero')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Cisgênero">Cisgênero</option>
                    <option value="Transgênero">Transgênero</option>
                    <option value="Não-Binário">Não-Binário</option>
                    <option value="Não informada">Não informada</option>
                  </select>
                </div>

                {/* Nome Social */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nome Social</label>
                  <input
                    {...register('nomeSocial')}
                    placeholder="Nome de preferência social"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nascimento */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nascimento *</label>
                  <input
                    type="date"
                    {...register('dataNascimento')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                  {errors.dataNascimento && (
                    <span className="text-[10px] font-medium text-red-500">{(errors.dataNascimento.message as string)}</span>
                  )}
                </div>

                {/* Município de Nascimento */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Município de Nascimento</label>
                  <input
                    {...register('municipioNascimento')}
                    placeholder="Digite o nome do Município"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-550 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nacionalidade */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nacionalidade *</label>
                  <select
                    {...register('nacionalidade')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  >
                    <option value="BRASILEIRA">Brasileira</option>
                    <option value="NATURALIZADO">Naturalizado</option>
                    <option value="ESTRANGEIRO">Estrangeiro</option>
                  </select>
                </div>

                {/* País de Nascimento */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">País de Nascimento *</label>
                  <input
                    {...register('paisNascimento')}
                    placeholder="Ex: Brasil"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cor/Raça */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Cor/Raça *</label>
                  <select
                    {...register('corRaca')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  >
                    <option value="Branca">Branca</option>
                    <option value="Preta">Preta</option>
                    <option value="Amarela">Amarela</option>
                    <option value="Parda">Parda</option>
                    <option value="Indígena">Indígena</option>
                    <option value="Não informada">Não informada</option>
                  </select>
                </div>

                {/* Etnia */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Etnia</label>
                  <input
                    {...register('etnia')}
                    placeholder="Ex: Guarani"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tipo Sanguíneo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tipo Sanguíneo</label>
                  <select
                    {...register('tipoSanguineo')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Prontuários antigos */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Prontuários antigos (separar por vírgula)</label>
                  <input
                    {...register('prontuariosAntigos')}
                    placeholder="Ex: 1024, 8820"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                </div>
              </div>

              {/* Alergias */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Alergias</label>
                <input
                  {...register('alergias')}
                  placeholder="Alergias a medicamentos, alimentos, etc."
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Família */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Família</label>
                  <input
                    {...register('familia')}
                    placeholder="Nome/Código"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500"
                  />
                </div>
                {/* Área */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Área</label>
                  <input
                    {...register('area')}
                    placeholder="Área de atendimento"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500"
                  />
                </div>
                {/* Subárea */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Subárea</label>
                  <input
                    {...register('subarea')}
                    placeholder="Subárea"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Escolaridade */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Escolaridade</label>
                <select
                  {...register('escolaridade')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                >
                  <option value="">Selecione...</option>
                  <option value="Analfabeto">Analfabeto</option>
                  <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                  <option value="Fundamental Completo">Fundamental Completo</option>
                  <option value="Médio Incompleto">Médio Incompleto</option>
                  <option value="Médio Completo">Médio Completo</option>
                  <option value="Superior Incompleto">Superior Incompleto</option>
                  <option value="Superior Completo">Superior Completo</option>
                </select>
              </div>
            </div>

            {/* COLUNA DIREITA (Contatos, Responsáveis e Documentação) */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Celular (Celular) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-gray-400" />
                    Celular *
                  </label>
                  <input
                    value={celularValue}
                    onChange={handleCelularChange}
                    placeholder="(XX) 9XXXX-XXXX"
                    maxLength={15}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                  {errors.celular && (
                    <span className="text-[10px] font-medium text-red-500">{(errors.celular.message as string)}</span>
                  )}
                </div>

                {/* Telefone (Telefone Fixo) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    Telefone
                  </label>
                  <input
                    value={telefoneValue}
                    onChange={handleTelefoneChange}
                    placeholder="(XX) 0000-0000"
                    maxLength={14}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="exemplo@email.com"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                />
                {errors.email && (
                  <span className="text-[10px] font-medium text-red-500">{(errors.email.message as string)}</span>
                )}
              </div>

              {/* Seção Mãe */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Mãe</label>
                  <input
                    {...register('nomeMae')}
                    disabled={maeDesconhecida}
                    placeholder="Nome da mãe completo"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Desconhecida</label>
                  <select
                    {...register('maeDesconhecida', {
                      setValueAs: (v) => v === 'true' || v === true
                    })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none transition-all"
                  >
                    <option value="false">NÃO</option>
                    <option value="true">SIM</option>
                  </select>
                </div>
              </div>

              {/* Seção Pai */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Pai</label>
                  <input
                    {...register('nomePai')}
                    disabled={paiDesconhecido}
                    placeholder="Nome do pai completo"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Desconhecido</label>
                  <select
                    {...register('paiDesconhecido', {
                      setValueAs: (v) => v === 'true' || v === true
                    })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none transition-all"
                  >
                    <option value="false">NÃO</option>
                    <option value="true">SIM</option>
                  </select>
                </div>
              </div>

              {/* RG / Órgão / UF */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">RG</label>
                  <input
                    {...register('rg')}
                    placeholder="Registro Geral"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Órgão</label>
                  <input
                    {...register('orgaoEmissor')}
                    placeholder="SSP"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">UF</label>
                  <input
                    {...register('ufRg')}
                    placeholder="MS"
                    maxLength={2}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Data Expedição RG */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Data de Exp.</label>
                  <input
                    type="date"
                    {...register('dataExpedicaoRg')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                  />
                </div>

                {/* NIS */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">NIS</label>
                  <input
                    {...register('nis')}
                    placeholder="Número NIS/PIS"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Certidão Nascimento */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Certidão de Nascimento</label>
                  <input
                    {...register('certidaoNascimento')}
                    placeholder="Matrícula da certidão"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                {/* Data de Óbito */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Data de Óbito</label>
                  <input
                    type="date"
                    {...register('dataObito')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Título de Eleitor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Título de eleitor</label>
                  <input
                    {...register('tituloEleitor')}
                    placeholder="Inscrição eleitoral"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                {/* Estado Civil */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Estado Civil</label>
                  <select
                    {...register('estadoCivil')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Solteiro/a">Solteiro/a</option>
                    <option value="Casado/a">Casado/a</option>
                    <option value="Divorciado/a">Divorciado/a</option>
                    <option value="Viúvo/a">Viúvo/a</option>
                    <option value="União Estável">União Estável</option>
                  </select>
                </div>
              </div>

              {/* Funcionário Externo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Funcionário Externo</label>
                <select
                  {...register('funcionarioExterno', {
                    setValueAs: (v) => v === 'true' || v === true
                  })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none transition-all"
                >
                  <option value="false">NÃO</option>
                  <option value="true">SIM</option>
                </select>
              </div>

              {/* Profissão (CBO) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Profissão (CBO)</label>
                <input
                  {...register('profissaoCbo')}
                  placeholder="Profissão ou CBO"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Local de Trabalho */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Local de Trabalho</label>
                  <input
                    {...register('localTrabalho')}
                    placeholder="Empresa/Local"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campo observação no final dos dados principais */}
          <div className="p-6 pt-0 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase">Observação</label>
            <textarea
              {...register('observacao')}
              placeholder="Observações ou notas adicionais..."
              rows={2}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all min-h-[60px]"
            />
          </div>
        </div>

        {/* SEÇÃO: ENDEREÇO */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50/50 to-transparent flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-cyan-600" />
              ENDEREÇO
            </h2>
            
            {/* Situação de Rua Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="situacaoRua"
                {...register('situacaoRua')}
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="situacaoRua" className="text-xs font-semibold text-gray-700 cursor-pointer">
                Situação de rua
              </label>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-6 gap-5">
            {/* CEP */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">CEP *</label>
              <div className="relative">
                <input
                  value={cepValue}
                  onChange={handleCepChange}
                  disabled={situacaoRua}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
                />
                {isLoadingCep && (
                  <div className="absolute right-2.5 top-3">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                  </div>
                )}
              </div>
              {errors.cep && (
                <span className="text-[10px] font-medium text-red-500">{(errors.cep.message as string)}</span>
              )}
            </div>

            {/* Tipo Logradouro */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Tipo Logradouro *</label>
              <select
                {...register('tipoLogradouro')}
                disabled={situacaoRua}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              >
                <option value="RUA">Rua</option>
                <option value="AVENIDA">Avenida</option>
                <option value="TRAVESSA">Travessa</option>
                <option value="ALAMEDA">Alameda</option>
                <option value="RODOVIA">Rodovia</option>
                <option value="PRACA">Praça</option>
                <option value="BECO">Beco</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            {/* Logradouro */}
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-xs font-semibold text-gray-500 uppercase">Logradouro (Rua) *</label>
              <input
                {...register('logradouro')}
                disabled={situacaoRua}
                placeholder="Nome da rua/avenida"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-450 focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
              />
              {errors.logradouro && (
                <span className="text-[10px] font-medium text-red-500">{(errors.logradouro.message as string)}</span>
              )}
            </div>

            {/* Número */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">N° *</label>
              <input
                {...register('numero')}
                placeholder="N°"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
              />
              {errors.numero && (
                <span className="text-[10px] font-medium text-red-500">{(errors.numero.message as string)}</span>
              )}
            </div>

            {/* Bairro */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Bairro *</label>
              <input
                {...register('bairro')}
                disabled={situacaoRua}
                placeholder="Bairro"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
              />
              {errors.bairro && (
                <span className="text-[10px] font-medium text-red-500">{(errors.bairro.message as string)}</span>
              )}
            </div>

            {/* Complemento */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Complemento</label>
              <input
                {...register('complemento')}
                disabled={situacaoRua}
                placeholder="Apto, Bloco..."
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400"
              />
            </div>

            {/* Município */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Município *</label>
              <input
                {...register('municipio')}
                disabled={situacaoRua}
                placeholder="Município - UF"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-450 focus-visible:ring-2 focus-visible:ring-cyan-600 transition-all"
              />
              {errors.municipio && (
                <span className="text-[10px] font-medium text-red-500">{(errors.municipio.message as string)}</span>
              )}
            </div>

            {/* Localização */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Localização</label>
              <select
                {...register('localizacao')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none transition-all"
              >
                <option value="URBANA">Urbana</option>
                <option value="RURAL">Rural</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          {!isModal && (
            <button
              type="button"
              onClick={() => navigate('/posto/pacientes')}
              className="rounded-lg border border-gray-350 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 transition-all disabled:opacity-50 min-w-[120px] cursor-pointer"
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
