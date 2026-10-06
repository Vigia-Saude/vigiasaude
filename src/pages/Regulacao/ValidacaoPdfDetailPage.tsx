import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, CheckCircle, Plus, Check, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { listarUnidadesResponsaveis } from '../../services/confirmacaoService';
import { PatientCard, type PdfImportRow } from '../../components/Regulacao/PatientCard';

interface ImportDetail {
  id: string;
  originalFilename: string | null;
  status: string;
  rowsImported: number | null;
  unidadeResponsavelId?: string | null;
  errorLog?: string | null;
  rows: PdfImportRow[];
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function ValidacaoPdfDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unidadeResponsavelId, setUnidadeResponsavelId] = useState('');
  const {data:unidades=[]}=useQuery({queryKey:['unidades-responsaveis'],queryFn:listarUnidadesResponsaveis});
  const [rows, setRows] = useState<PdfImportRow[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [rowsImported, setRowsImported] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [addingManual, setAddingManual] = useState(false);
  const [globalDate, setGlobalDate] = useState('');
  const [applyingDate, setApplyingDate] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    if (!id) return;
    apiClient.get<ImportDetail>(`/api/regulacao/imports/${id}`).then((res) => {
      const d = res.data;
      const loadedRows = d.rows || [];
      setRows(loadedRows);
      setFilename(d.originalFilename);
      setUnidadeResponsavelId(d.unidadeResponsavelId || '');
      if (d.errorLog) setError(d.errorLog);
      setRowsImported(d.rowsImported);
      if (loadedRows.length > 0 && loadedRows[0]?.rawData?.scheduled_date_raw) {
        setGlobalDate(loadedRows[0].rawData.scheduled_date_raw);
      }
    }).catch(() => {
      setError('Falha ao carregar os dados da importação.');
    });
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Baixa o PDF autenticado como blob para o iframe (URL direta não envia o token JWT)
  useEffect(() => {
    if (!id) return;
    let objectUrl = '';
    apiClient
      .get<Blob>(`/api/regulacao/imports/${id}/pdf`, { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setPdfUrl(objectUrl);
      })
      .catch(() => {});
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  const approvedCount = rows.filter((r) => r.approved && !r.queueEntryId).length;
  const isAlreadyImported = rows.length > 0 && rows.every(row => !!row.queueEntryId);

  const handleAddManualPatient = async () => {
    setAddingManual(true);
    try {
      const res = await apiClient.post<PdfImportRow>(`/api/regulacao/imports/${id}/rows`, {
        rawData: {
          name: 'Novo Paciente',
          cns_raw: '',
          phone_raw: '',
          birth_date_raw: '',
          procedure_name: rows[0]?.rawData.procedure_name || '',
          unidade_solicitante: '',
          scheduled_date_raw: '',
          hora_raw: ''
        }
      });
      setRows((prev) => [...prev, res.data]);
      toast.success('Paciente adicionado para validação');
    } catch {
      toast.error('Falha ao adicionar novo paciente.');
    } finally {
      setAddingManual(false);
    }
  };

  const handleApproveAll = async () => {
    try {
      const res = await apiClient.patch<PdfImportRow[]>(`/api/regulacao/imports/${id}/rows-bulk`, { approvedAll: true });
      setRows(res.data);
      toast.success('Aprovações salvas. Revise os registros com erros antes de encaminhar.');
    } catch { toast.error('Não foi possível salvar as aprovações.'); }
  };

  const handleApplyGlobalDate = async () => {
    if (!globalDate || !id) return;
    setApplyingDate(true);
    try {
      const res = await apiClient.patch<PdfImportRow[]>(`/api/regulacao/imports/${id}/rows-bulk`, {
        scheduled_date_raw: globalDate
      });
      setRows(res.data);
      toast.success(`Data ${globalDate} aplicada para todos os ${res.data.length} pacientes!`);
    } catch {
      toast.error('A data não foi salva. Tente novamente.');
    } finally {
      setApplyingDate(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.post<{
        importados: number;
        total?: number;
        results?: { rowId: string; error?: string }[];
      }>(`/api/regulacao/imports/${id}/approve`, {unidadeId:unidadeResponsavelId});
      const failed = (res.data.results || []).filter((r) => r.error);
      if (failed.length > 0) {
        const errorsByRowId = new Map(failed.map((r) => [r.rowId, r.error as string]));
        setRows((prev) => prev.map((r) => (errorsByRowId.has(r.id) ? { ...r, error: errorsByRowId.get(r.id)! } : r)));
        const total = res.data.total ?? res.data.importados + failed.length;
        setError(`${res.data.importados} de ${total} pacientes encaminhados. ${failed.length} falharam — revise os erros abaixo.`);
        setSubmitting(false);
        return;
      }
      toast.success(`${res.data.importados} paciente(s) encaminhado(s) para a fila!`);
      navigate('/regulador/filas');
    } catch (e: any) {
      const msg = e.response?.data?.erro || e.message || 'Falha ao encaminhar pacientes';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/regulador/validacao-pdf"
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base leading-tight">Validação de PDF</h1>
            <p className="text-xs text-slate-500 font-mono">{filename || id}</p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
            approvedCount === rows.length && rows.length > 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            ✓ {approvedCount} / {rows.length} aprovados
          </span>
        </div>
      </div>

      {/* Main Split Screen Area (50% / 50%) Idêntico à Imagem 2 */}
      <div className="flex flex-1 overflow-hidden">
        {/* Painel Esquerdo (PDF Original Viewer) */}
        <div className="w-1/2 border-r border-slate-200 p-4 bg-slate-200/60 flex flex-col shrink-0">
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>DOCUMENTO ORIGINAL</span>
            <span className="font-mono text-[11px] text-slate-400">{filename}</span>
          </div>

          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full flex-1 rounded-2xl bg-white border border-slate-300 shadow-md"
              title="Visualizador do PDF Original"
            />
          ) : (
            <div className="flex-1 bg-white rounded-2xl border border-slate-300 flex items-center justify-center text-slate-400 text-sm font-medium">
              Carregando visualizador do PDF...
            </div>
          )}
        </div>

        {/* Painel Direito (Dados Extraídos - Patient Cards) */}
        <div className="w-1/2 flex flex-col bg-white shrink-0 overflow-hidden">
          {isAlreadyImported && (
            <div className="bg-blue-50 border-b border-blue-200 px-5 py-3 text-xs text-blue-800 flex items-center justify-between shrink-0">
              <span>ℹ️ Este PDF já foi validado e {rowsImported} paciente(s) foram encaminhados para as filas.</span>
              <button
                onClick={() => navigate('/regulador/filas')}
                className="font-bold underline hover:text-blue-900 cursor-pointer">
                Ir para Filas →
              </button>
            </div>
          )}

          {/* Header do Painel Direito */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                DADOS EXTRAÍDOS — {rows.length} PACIENTES
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApproveAll}
                disabled={isAlreadyImported}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-semibold border border-slate-300 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                <Check className="h-3.5 w-3.5" />
                Aprovar Todos
              </button>

              <button
                onClick={handleAddManualPatient}
                disabled={addingManual || isAlreadyImported}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" />
                {addingManual ? 'Adicionando...' : '+ Adicionar Paciente'}
              </button>
            </div>
          </div>

          {/* Barra de Ação Rápida: Data Específica de Agendamento */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">Data Agendada Específica:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={isAlreadyImported || applyingDate}
                value={globalDate}
                onChange={(e) => setGlobalDate(formatDateInput(e.target.value))}
                placeholder="DD/MM/AAAA (ex: 13/07/2026)"
                className="w-44 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
              <button
                type="button"
                disabled={!globalDate || isAlreadyImported || applyingDate}
                onClick={handleApplyGlobalDate}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {applyingDate ? 'Aplicando...' : 'Aplicar a Todos'}
              </button>
            </div>
          </div>

          <label className="block p-4 text-xs font-semibold text-slate-700">Unidade responsável pela agenda
            <select value={unidadeResponsavelId} onChange={e=>setUnidadeResponsavelId(e.target.value)} className="w-full border rounded-xl p-2 mt-1 bg-white">
              <option value="">Selecione a unidade responsável</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </label>
          {/* Lista de Patient Cards */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {rows.length === 0 ? (
              <div className="text-center py-16 text-sm text-slate-400">
                Nenhum paciente encontrado. Clique no botão &quot;+ Adicionar Paciente&quot; acima para incluir manualmente.
              </div>
            ) : (
              rows.map((row, i) => (
                <PatientCard
                  key={row.id}
                  importId={id!}
                  row={row}
                  index={i + 1}
                  readOnly={!!row.queueEntryId}
                  onChange={(u) => setRows((prev) => prev.map((r) => (r.id === u.id ? u : r)))}
                />
              ))
            )}
          </div>

          {/* Barra Inferior com Botão Verde Sticky */}
          <div className="p-5 border-t border-slate-200 bg-white shrink-0 shadow-lg">
            {error && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={approvedCount === 0 || submitting || isAlreadyImported}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl py-3.5 text-sm font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Encaminhando Pacientes para a Fila...</span>
                </>
              ) : isAlreadyImported ? (
                <span>✓ Pacientes já encaminhados para a Fila</span>
              ) : (
                <span>→ Validar e Encaminhar para Fila</span>
              )}
            </button>

            {!isAlreadyImported && approvedCount < rows.length && (
              <p className="text-xs text-slate-500 text-center mt-2 font-medium">
                Aprove todos os {rows.length} pacientes antes de encaminhar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
