import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Send, Settings, MessageSquare, ListChecks, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';
import { ConfirmacaoConvocacao } from '../../components/Regulacao/ConfirmacaoConvocacao';

interface Patient {
  id: string;
  name: string;
  phone: string;
  sus_card?: string;
}

interface Procedure {
  id: string;
  name: string;
}

interface QueueEntry {
  id: string;
  position: number;
  status: 'pending' | 'awaiting_response' | 'confirmed' | 'declined' | 'expired' | 'cancelled';
  scheduled_date: string | null;
  hora?: string;
  patients: Patient | null;
  procedures: Procedure | null;
  sms_count: number;
  last_dispatch_at: string | null;
}

interface QueueData {
  procedure: Procedure;
  entries: QueueEntry[];
}

function formatPhoneDisplay(phoneStr: string | null | undefined): string {
  if (!phoneStr) return '—';
  let digits = phoneStr.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phoneStr;
}

function formatCnsDisplay(cns: string | null | undefined): string {
  if (!cns) return '—';
  const digits = cns.replace(/\D/g, '');
  if (digits.length === 15) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11)}`;
  }
  return cns;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Não disparado';
  const date = new Date(dateStr);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 3600);
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
  const timeFmt = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Hoje, ${timeFmt}`;
  if (isYesterday) return `Ontem, ${timeFmt}`;
  if (diffHours < 48) return `1 dia atrás`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dias atrás`;
}

function computeTimeSlot(index: number): string {
  const startHour = 8;
  const totalMinutes = startHour * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function DetalhesFilaPage() {
  const { procedureId } = useParams<{ procedureId: string }>();
  const [data, setData] = useState<QueueData | null>(null);
  const [viewMode, setViewMode] = useState<'fila' | 'confirmacao'>('fila');
  const [activeTab, setActiveTab] = useState<'todos' | 'confirmed' | 'awaiting' | 'cancelled' | 'reserva'>('todos');
  const [loading, setLoading] = useState(true);
  const [resendingAll, setResendingAll] = useState(false);
  const [resendingEntryId, setResendingEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<QueueEntry | null>(null);
  const [editPhone, setEditPhone] = useState('');

  const loadData = useCallback(async () => {
    if (!procedureId) return;
    try {
      const res = await apiClient.get<QueueData>(`/api/regulacao/queues/${procedureId}`);
      setData(res.data);
    } catch {
      toast.error('Falha ao carregar os detalhes da fila.');
    } finally {
      setLoading(false);
    }
  }, [procedureId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResendAll = async () => {
    setResendingAll(true);
    try {
      await apiClient.post(`/api/regulacao/queues/${procedureId}/resend-all`);
      toast.success('Notificações reenviadas para toda a fila!');
      loadData();
    } catch {
      toast.error('Falha ao reenviar notificações.');
    } finally {
      setResendingAll(false);
    }
  };

  const handleResendSingle = async (entryId: string) => {
    setResendingEntryId(entryId);
    try {
      await apiClient.post(`/api/regulacao/queues/entries/${entryId}/resend`);
      toast.success('Notificação reenviada com sucesso!');
      loadData();
    } catch {
      toast.error('Falha ao reenviar notificação.');
    } finally {
      setResendingEntryId(null);
    }
  };

  const entries = data?.entries ?? [];
  const totalCount = entries.length;
  const confirmedCount = entries.filter((e) => e.status === 'confirmed').length;
  const awaitingCount = entries.filter((e) => e.status === 'awaiting_response' || e.status === 'pending').length;
  const cancelledCount = entries.filter((e) => e.status === 'declined' || e.status === 'expired' || e.status === 'cancelled').length;
  const reservaCount = Math.max(0, entries.length - 5);

  const filteredEntries = entries.filter((e) => {
    if (activeTab === 'confirmed') return e.status === 'confirmed';
    if (activeTab === 'awaiting') return e.status === 'awaiting_response' || e.status === 'pending';
    if (activeTab === 'cancelled') return e.status === 'declined' || e.status === 'expired' || e.status === 'cancelled';
    if (activeTab === 'reserva') return e.position > 5;
    return true;
  });

  const formattedDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Superior Idêntico à Imagem 4 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/regulador/filas"
            className="w-10 h-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {data?.procedure.name ?? 'Carregando Fila...'}
              </h1>
              <span className="text-xs font-bold bg-slate-200/80 text-slate-700 px-3 py-1 rounded-full">
                {totalCount}/{totalCount} vagas
              </span>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {reservaCount} reserva
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Gestão detalhada · {formattedDate}
            </p>
          </div>
        </div>

        {viewMode === 'fila' && (
          <button
            onClick={handleResendAll}
            disabled={resendingAll}
            className="flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm disabled:opacity-50 transition-all cursor-pointer shrink-0">
            <Send className="h-4 w-4 text-emerald-700" />
            <span>{resendingAll ? 'Reenviando...' : 'Reenviar para toda a fila'}</span>
          </button>
        )}
      </div>

      {/* Alternador de visão: Fila (SMS) x Confirmação & Convocação */}
      <div className="inline-flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
        <button
          onClick={() => setViewMode('fila')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'fila' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <ListChecks className="h-4 w-4" />
          Fila (SMS)
        </button>
        <button
          onClick={() => setViewMode('confirmacao')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'confirmacao' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>
          <Megaphone className="h-4 w-4" />
          Confirmação &amp; Convocação
        </button>
      </div>

      {viewMode === 'confirmacao' && <ConfirmacaoConvocacao procedureName={data?.procedure.name} />}

      {viewMode === 'fila' && (
      <>
      {/* KPI Stats Bar Idêntica à Imagem 4 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-slate-200/70 text-slate-800 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2">
          <span className="font-extrabold text-sm">{totalCount}/{totalCount}</span>
          <span className="font-semibold text-slate-600">Vagas ocupadas</span>
        </div>

        <div className="bg-emerald-50 text-emerald-800 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-emerald-200/60">
          <span className="font-extrabold text-sm text-emerald-700">{confirmedCount}</span>
          <span className="font-semibold text-emerald-700">Confirmados</span>
        </div>

        <div className="bg-amber-50 text-amber-800 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-amber-200/60">
          <span className="font-extrabold text-sm text-amber-700">{awaitingCount}</span>
          <span className="font-semibold text-amber-700">Aguardando</span>
        </div>

        <div className="bg-rose-50 text-rose-800 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-rose-200/60">
          <span className="font-extrabold text-sm text-rose-700">{cancelledCount}</span>
          <span className="font-semibold text-rose-700">Cancelados</span>
        </div>

        <div className="bg-blue-50 text-blue-800 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-blue-200/60">
          <span className="font-extrabold text-sm text-blue-700">{reservaCount}</span>
          <span className="font-semibold text-blue-700">Na reserva</span>
        </div>
      </div>

      {/* Filter Tabs Idênticas à Imagem 4 */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('todos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'todos'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}>
          <span>Todos</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${activeTab === 'todos' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('confirmed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'confirmed'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}>
          <span>Confirmados</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${activeTab === 'confirmed' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {confirmedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('awaiting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'awaiting'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}>
          <span>Aguardando</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${activeTab === 'awaiting' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {awaitingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'cancelled'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}>
          <span>Cancelados</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${activeTab === 'cancelled' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {cancelledCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reserva')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'reserva'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}>
          <span>Reserva</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${activeTab === 'reserva' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {reservaCount}
          </span>
        </button>
      </div>

      {/* Main Tabela de Dados Idêntica à Imagem 4 */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-5">Horário</th>
              <th className="py-4 px-5">Paciente / CNS</th>
              <th className="py-4 px-5">Telefone</th>
              <th className="py-4 px-5">Exame</th>
              <th className="py-4 px-5 text-center">SMS Disparados</th>
              <th className="py-4 px-5">Último Disparo</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  Carregando pacientes da fila...
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  Nenhum paciente localizado nesta categoria.
                </td>
              </tr>
            ) : (
              filteredEntries.map((e, idx) => {
                const timeLabel = e.hora || computeTimeSlot(idx);
                const isConfirmed = e.status === 'confirmed';
                const isAwaiting = e.status === 'awaiting_response' || e.status === 'pending';
                const isCancelled = e.status === 'declined' || e.status === 'expired' || e.status === 'cancelled';

                return (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Horário */}
                    <td className="py-4 px-5 font-extrabold text-xs text-emerald-700 whitespace-nowrap">
                      <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {timeLabel}
                      </span>
                    </td>

                    {/* Paciente / CNS */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-xs">
                        {e.patients?.name ?? 'Paciente Não Identificado'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {formatCnsDisplay(e.patients?.sus_card)}
                      </div>
                    </td>

                    {/* Telefone */}
                    <td className="py-4 px-5 font-semibold text-slate-700 whitespace-nowrap">
                      {formatPhoneDisplay(e.patients?.phone)}
                    </td>

                    {/* Exame */}
                    <td className="py-4 px-5 text-slate-800 font-semibold">
                      {e.procedures?.name ?? data?.procedure.name}
                    </td>

                    {/* SMS Disparados */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                        {e.sms_count}
                      </span>
                    </td>

                    {/* Último Disparo */}
                    <td className="py-4 px-5 text-slate-600 font-medium whitespace-nowrap">
                      {formatRelativeTime(e.last_dispatch_at)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Confirmado
                        </span>
                      )}

                      {isAwaiting && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Aguardando
                        </span>
                      )}

                      {isCancelled && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 px-3 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          Cancelado
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResendSingle(e.id)}
                          disabled={resendingEntryId === e.id}
                          className="inline-flex items-center gap-1 text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer">
                          <Send className="h-3.5 w-3.5 text-emerald-700" />
                          {resendingEntryId === e.id ? '...' : 'Reenviar'}
                        </button>

                        <button
                          onClick={() => {
                            setEditingEntry(e);
                            setEditPhone(formatPhoneDisplay(e.patients?.phone));
                          }}
                          className="inline-flex items-center gap-1 text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer">
                          <Settings className="h-3.5 w-3.5 text-slate-500" />
                          Alterar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      </>
      )}

      {/* Modal para Alterar Status / Telefone */}
      {editingEntry && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">Alterar Dados do Agendamento</h3>
            <p className="text-xs text-slate-500">
              Paciente: <strong className="text-slate-800">{editingEntry.patients?.name}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telefone (com DDD)
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={() => {
                  toast.success('Agendamento atualizado com sucesso');
                  setEditingEntry(null);
                }}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 cursor-pointer shadow-sm">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
