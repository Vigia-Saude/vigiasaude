import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Stethoscope, 
  Search, 
  User, 
  CheckCircle2, 
  Send,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { listarFilaRegulacao, atualizarFichaRegulacao } from '../../services/regulacaoService';
import { formatCPF } from '../../lib/utils';
import type { FilaRegulacao } from '../../types';

export function AtendimentosPosto() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFicha, setSelectedFicha] = useState<FilaRegulacao | null>(null);
  const [dadosClinicos, setDadosClinicos] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ['atendimentos-medico'],
    queryFn: () => listarFilaRegulacao(),
  });

  const fichas: FilaRegulacao[] = Array.isArray(responseData) ? responseData : responseData?.dados || responseData?.fichas || [];

  const atendimentos = fichas.filter((f: FilaRegulacao) => {
    const term = searchTerm.toLowerCase();
    const nome = f.paciente?.nomeCompleto?.toLowerCase() || '';
    const cpf = f.paciente?.cpf || '';
    const proc = f.procedimentoSolicitado?.toLowerCase() || '';
    return nome.includes(term) || cpf.includes(term) || proc.includes(term);
  });

  const handleOpenAtendimento = (ficha: FilaRegulacao) => {
    setSelectedFicha(ficha);
    setDadosClinicos(ficha.observacaoClinica || '');
  };

  const handleConcluirAtendimento = async () => {
    if (!selectedFicha) return;
    if (!dadosClinicos.trim()) {
      toast.error('Por favor, preencha os Dados Clínicos antes de concluir o atendimento.');
      return;
    }

    try {
      setSubmitting(true);
      await atualizarFichaRegulacao(selectedFicha.id, {
        observacaoClinica: dadosClinicos,
        statusAgendamento: 'CONFIRMADO',
      });
      toast.success('Atendimento concluído com sucesso na própria UBS!');
      setSelectedFicha(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao encerrar atendimento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEncaminharRegulacao = async () => {
    if (!selectedFicha) return;
    if (!dadosClinicos.trim()) {
      toast.error('Por favor, preencha os Dados Clínicos antes de encaminhar para a regulação.');
      return;
    }

    try {
      setSubmitting(true);
      await atualizarFichaRegulacao(selectedFicha.id, {
        observacaoClinica: dadosClinicos,
        statusAgendamento: 'AGUARDANDO_REGULACAO',
      });
      toast.success('Ficha encaminhada com sucesso para a Regulação Municipal!');
      setSelectedFicha(null);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao encaminhar ficha para a regulação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="h-7 w-7 text-blue-600" />
            Agenda de Atendimentos do Médico
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os dados clínicos e escolha se o atendimento é concluído na UBS ou se exige encaminhamento para a Regulação.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar Lista
        </button>
      </div>

      {/* Search */}
      <div className="relative bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
        <Search className="absolute left-7 top-6.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar paciente por nome, CPF ou procedimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Grid of Patients */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-150">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-500">Carregando lista de atendimentos...</span>
        </div>
      ) : atendimentos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-150">
          <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Nenhum paciente aguardando</h3>
          <p className="text-xs text-gray-500 mt-1">Nenhuma solicitação encontrada para atendimento médico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {atendimentos.map((item: FilaRegulacao) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{item.paciente?.nomeCompleto || 'Paciente'}</h3>
                      <span className="text-xs font-mono text-gray-500 block">
                        CPF: {item.paciente?.cpf ? formatCPF(item.paciente.cpf) : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Procedimento Solicitado</span>
                  <p className="text-xs font-semibold text-gray-800">{item.procedimentoSolicitado}</p>
                </div>

                {item.observacaoClinica && (
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-gray-700">
                    <span className="font-bold text-blue-900 block mb-0.5">Dados Clínicos Preenchidos:</span>
                    <p className="line-clamp-2">{item.observacaoClinica}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleOpenAtendimento(item)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Stethoscope className="h-4 w-4" />
                Iniciar / Atender Consulta
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Atendimento Clínico */}
      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-150 bg-gradient-to-r from-blue-50 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Atendimento Clínico — {selectedFicha.paciente?.nomeCompleto}</h3>
                  <p className="text-xs text-gray-500 font-mono">CPF: {selectedFicha.paciente?.cpf ? formatCPF(selectedFicha.paciente.cpf) : '-'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFicha(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div><span className="font-bold text-gray-500">Procedimento:</span> {selectedFicha.procedimentoSolicitado}</div>
                <div><span className="font-bold text-gray-500">Encaminhado por:</span> {selectedFicha.responsavelEncaminhamento}</div>
                <div><span className="font-bold text-gray-500">ACS Responsável:</span> {selectedFicha.acsResponsavel}</div>
                <div><span className="font-bold text-gray-500">Status Atual:</span> {selectedFicha.statusAgendamento || 'NOVO'}</div>
              </div>

              {/* Textarea Dados Clínicos */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Dados Clínicos do Paciente *
                </label>
                <textarea
                  value={dadosClinicos}
                  onChange={(e) => setDadosClinicos(e.target.value)}
                  placeholder="Preencha o diagnóstico, histórico do paciente, justificativa clínica e observações..."
                  rows={5}
                  className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedFicha(null)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
              >
                Cancelar
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleConcluirAtendimento}
                  disabled={submitting}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Concluir Atendimento na UBS
                </button>

                <button
                  type="button"
                  onClick={handleEncaminharRegulacao}
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Encaminhar para Regulação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
