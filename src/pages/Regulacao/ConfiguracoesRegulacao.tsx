import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Loader2, Save, MessageSquareText, Clock, RefreshCw, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import {
  getConfirmacaoConfig,
  salvarConfirmacaoConfig,
  type ConfirmacaoConfig,
} from '../../services/confirmacaoService';

type FormState = Omit<ConfirmacaoConfig, 'diasAntesConfirmacao' | '_padrao' | 'unidadeId'> & {
  diasAntesConfirmacao: string; // editado como texto "7, 1"
};

const inputCls =
  'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600';
const labelCls = 'block text-xs font-bold text-gray-700 mb-1';

export function ConfiguracoesRegulacao() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['confirmacao-config'], queryFn: getConfirmacaoConfig });
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (data && !form) {
      setForm({
        qtdConfirmacoes: data.qtdConfirmacoes,
        diasAntesConfirmacao: data.diasAntesConfirmacao.join(', '),
        qtdReenvios: data.qtdReenvios,
        intervaloReenvioHoras: data.intervaloReenvioHoras,
        timeoutRespostaHoras: data.timeoutRespostaHoras,
        horarioInicio: data.horarioInicio,
        horarioFim: data.horarioFim,
        timezone: data.timezone,
        templateConfirmacao: data.templateConfirmacao,
        templateReconfirmacao: data.templateReconfirmacao,
        templateColetaMotivo: data.templateColetaMotivo,
        templateConvocacao: data.templateConvocacao,
      });
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (payload: Partial<ConfirmacaoConfig>) => salvarConfirmacaoConfig(payload),
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!');
      qc.invalidateQueries({ queryKey: ['confirmacao-config'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.erro || 'Falha ao salvar configurações.'),
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form) return;
    const dias = form.diasAntesConfirmacao
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 0);
    if (dias.length === 0) {
      toast.error('Informe ao menos um valor em "Dias antes da confirmação".');
      return;
    }
    mutation.mutate({ ...form, diasAntesConfirmacao: dias });
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-500" />
          Configurações da Confirmação
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Parâmetros do ciclo de confirmação automatizada por WhatsApp deste município.
          {data?._padrao && ' (mostrando os valores padrão — ainda não salvos)'}
        </p>
      </div>

      {isLoading || !form ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400">
          Carregando configurações...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ciclo de confirmação */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
              <CalendarClock className="h-4 w-4 text-indigo-600" /> Ciclo de confirmação
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Quantidade de confirmações (etapas)</label>
                <input type="number" min={1} max={5} className={inputCls}
                  value={form.qtdConfirmacoes}
                  onChange={(e) => set('qtdConfirmacoes', Number(e.target.value))} />
                <p className="text-[11px] text-gray-400 mt-1">1 = só confirma · 2 = confirma + reconfirma</p>
              </div>
              <div>
                <label className={labelCls}>Dias antes de cada confirmação</label>
                <input type="text" className={inputCls} placeholder="7, 1"
                  value={form.diasAntesConfirmacao}
                  onChange={(e) => set('diasAntesConfirmacao', e.target.value)} />
                <p className="text-[11px] text-gray-400 mt-1">Separe por vírgula. Ex.: 7, 1 (7 e 1 dia antes)</p>
              </div>
            </div>
          </section>

          {/* Reenvios e timeout */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
              <RefreshCw className="h-4 w-4 text-indigo-600" /> Reenvios e expiração
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Quantidade de reenvios</label>
                <input type="number" min={0} max={10} className={inputCls}
                  value={form.qtdReenvios} onChange={(e) => set('qtdReenvios', Number(e.target.value))} />
              </div>
              <div>
                <label className={labelCls}>Intervalo entre reenvios (h)</label>
                <input type="number" min={1} max={168} className={inputCls}
                  value={form.intervaloReenvioHoras} onChange={(e) => set('intervaloReenvioHoras', Number(e.target.value))} />
              </div>
              <div>
                <label className={labelCls}>Timeout de resposta (h)</label>
                <input type="number" min={1} max={168} className={inputCls}
                  value={form.timeoutRespostaHoras} onChange={(e) => set('timeoutRespostaHoras', Number(e.target.value))} />
              </div>
            </div>
          </section>

          {/* Horário de operação */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
              <Clock className="h-4 w-4 text-indigo-600" /> Horário de operação
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Início dos disparos</label>
                <input type="time" className={inputCls}
                  value={form.horarioInicio} onChange={(e) => set('horarioInicio', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Fim dos disparos</label>
                <input type="time" className={inputCls}
                  value={form.horarioFim} onChange={(e) => set('horarioFim', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Timezone</label>
                <input type="text" className={inputCls}
                  value={form.timezone} onChange={(e) => set('timezone', e.target.value)} />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              O sistema nunca dispara mensagens fora desse horário (ex.: madrugada).
            </p>
          </section>

          {/* Templates */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-4">
              <MessageSquareText className="h-4 w-4 text-indigo-600" /> Nomes dos templates (ChatBot)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Confirmação inicial</label>
                <input type="text" className={inputCls}
                  value={form.templateConfirmacao} onChange={(e) => set('templateConfirmacao', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Reconfirmação</label>
                <input type="text" className={inputCls}
                  value={form.templateReconfirmacao} onChange={(e) => set('templateReconfirmacao', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Coleta de motivo</label>
                <input type="text" className={inputCls}
                  value={form.templateColetaMotivo} onChange={(e) => set('templateColetaMotivo', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Convocação</label>
                <input type="text" className={inputCls}
                  value={form.templateConvocacao} onChange={(e) => set('templateConvocacao', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Preview do fluxo */}
          <section className="bg-indigo-50 rounded-xl border border-indigo-200 p-6">
            <h2 className="text-sm font-bold text-indigo-800 mb-2">Prévia do fluxo configurado</h2>
            <ul className="text-xs text-indigo-700 space-y-1 list-disc list-inside">
              <li>
                Dispara a confirmação <strong>{form.diasAntesConfirmacao || '—'}</strong> dia(s) antes da consulta, entre{' '}
                <strong>{form.horarioInicio}</strong> e <strong>{form.horarioFim}</strong> ({form.timezone}).
              </li>
              <li>
                São <strong>{form.qtdConfirmacoes}</strong> etapa(s) de confirmação
                {form.qtdConfirmacoes >= 2 ? ' (confirma + reconfirma).' : '.'}
              </li>
              <li>
                Sem resposta em <strong>{form.timeoutRespostaHoras}h</strong>, reenvia até{' '}
                <strong>{form.qtdReenvios}</strong> vez(es) a cada <strong>{form.intervaloReenvioHoras}h</strong>; depois
                marca "não respondeu" e convoca o próximo da fila.
              </li>
            </ul>
          </section>

          <div className="flex justify-end">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar configurações
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
