import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';
import { ConfirmacaoConvocacao } from '../../components/Regulacao/ConfirmacaoConvocacao';

interface QueueData {
  procedure: { id: string; name: string };
}

export function DetalhesFilaPage() {
  const { procedureId } = useParams<{ procedureId: string }>();
  const [procedureName, setProcedureName] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  const formattedDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho */}
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

      {/* Fila única: confirmação & convocação (WhatsApp via ChatBot) */}
      <ConfirmacaoConvocacao procedureName={procedureName || undefined} />
    </div>
  );
}
