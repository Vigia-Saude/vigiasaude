import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { ConfirmacaoConvocacao } from '../../components/Regulacao/ConfirmacaoConvocacao';
import { excluirFila } from '../../services/confirmacaoService';

interface QueueData {
  procedure: { id: string; name: string };
}

export function DetalhesFilaPage() {
  const { procedureId } = useParams<{ procedureId: string }>();
  const [procedureName, setProcedureName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const loadData = useCallback(async () => {
    if (!procedureId) return;
    try {
      const res = await apiClient.get<QueueData>(`/api/regulacao/queues/${procedureId}`);
      setProcedureName(res.data.procedure?.name ?? '');
    } catch {
      toast.error('Falha ao carregar a fila.');
    } finally {
      setLoading(false);
    }
  }, [procedureId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const excluirMut = useMutation({
    mutationFn: () => excluirFila(procedureId!),
    onSuccess: (data) => {
      toast.success(data?.mensagem || 'Fila excluída com sucesso!');
      setShowDeleteModal(false);
      qc.invalidateQueries({ queryKey: ['queues-summary'] });
      qc.invalidateQueries({ queryKey: ['confirmacao-detalhes'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      navigate('/regulador/filas');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.erro || err?.message || 'Falha ao excluir a fila.');
    },
  });

  const formattedDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/regulador/filas"
            className="w-10 h-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {procedureName || (loading ? 'Carregando fila...' : 'Fila de Regulação')}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Confirmação &amp; Convocação · {formattedDate}</p>
          </div>
        </div>

        {!loading && (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-sm cursor-pointer ml-auto">
            <Trash2 className="h-4 w-4" />
            <span>Excluir Fila</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center gap-3 text-slate-400 shadow-sm animate-pulse">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-600">Carregando dados da fila...</span>
        </div>
      ) : (
        /* Fila única com chave isolada por procedureId para evitar flicker de fila anterior */
        <ConfirmacaoConvocacao key={procedureId} procedureName={procedureName || undefined} />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Excluir Fila de Regulação</h3>
                <p className="text-xs text-slate-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-900 space-y-1">
              <p>
                Você está prestes a excluir permanentemente a fila <strong>{procedureName || 'desta especialidade'}</strong>.
              </p>
              <p className="text-rose-700">
                Todos os agendamentos, pacientes na fila, histórico de mensagens WhatsApp e vagas configuradas serão apagados.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={excluirMut.isPending}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => excluirMut.mutate()}
                disabled={excluirMut.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer">
                {excluirMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {excluirMut.isPending ? 'Excluindo...' : 'Sim, excluir fila'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
