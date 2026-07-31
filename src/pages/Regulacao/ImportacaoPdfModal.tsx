import { useState } from 'react';
import { FileUp, CheckCircle, AlertCircle, Loader2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';

interface ImportacaoPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PdfRow {
  id: string;
  rawData: {
    ficha?: string;
    name?: string;
    cns_raw?: string;
    phone_raw?: string;
    birth_date_raw?: string;
    procedure_name?: string;
    cid10?: string;
    scheduled_date_raw?: string;
  };
  approved: boolean;
  error?: string | null;
}

export function ImportacaoPdfModal({ isOpen, onClose, onSuccess }: ImportacaoPdfModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [importId, setImportId] = useState<string | null>(null);
  const [rows, setRows] = useState<PdfRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; phone_raw: string; cns_raw: string }>({
    name: '',
    phone_raw: '',
    cns_raw: ''
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione um arquivo PDF de regulação da SES-MS');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/api/regulacao/imports/upload', formData);
      const data = res.data;

      setImportId(data.id);
      setRows(data.rows || []);
      toast.success(`${data.rowsFound || data.rows?.length || 0} pacientes extraídos do PDF com sucesso!`);
    } catch (err: any) {
      const erroMsg = err.response?.data?.erro || err.response?.data?.error || err.message || 'Falha no upload do PDF';
      toast.error(erroMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApprove = async (rowId: string, currentApproved: boolean) => {
    const nextApproved = !currentApproved;
    // Atualização otimista na UI
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, approved: nextApproved } : r));

    try {
      await apiClient.patch(`/api/regulacao/imports/${importId}/rows/${rowId}`, {
        approved: nextApproved
      });
    } catch (err) {
      toast.error('Erro ao atualizar aprovação');
    }
  };

  const handleStartEdit = (row: PdfRow) => {
    setEditingRowId(row.id);
    setEditForm({
      name: row.rawData.name || '',
      phone_raw: row.rawData.phone_raw || '',
      cns_raw: row.rawData.cns_raw || ''
    });
  };

  const handleSaveEdit = async (rowId: string) => {
    try {
      const res = await apiClient.patch(`/api/regulacao/imports/${importId}/rows/${rowId}`, {
        rawData: editForm
      });
      const updated = res.data;

      setRows(prev => prev.map(r => r.id === rowId ? { ...r, rawData: updated.rawData } : r));
      setEditingRowId(null);
      toast.success('Registro atualizado');
    } catch (err) {
      toast.error('Erro ao salvar edições');
    }
  };

  const handleApproveAll = async () => {
    if (!importId) return;
    setApproving(true);

    try {
      const res = await apiClient.post(`/api/regulacao/imports/${importId}/approve`);
      const data = res.data;

      toast.success(`${data.importados} pacientes encaminhados para a Fila da Regulação!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const erroMsg = err.response?.data?.erro || err.response?.data?.error || err.message || 'Falha ao encaminhar pacientes';
      toast.error(erroMsg);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-lg">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Importar PDF da Regulação (SES-MS)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extração automática de relatórios de agendamento e validação de contatos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {!importId ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
              <FileUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Selecione o relatório de agendamento PDF da Regulação SES-MS
              </p>
              <p className="text-xs text-slate-500 mb-4">
                (Salvo via Ctrl+P &gt; Salvar como PDF na tela de impressão do sistema)
              </p>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="pdf-input" />
              <label
                htmlFor="pdf-input"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg text-sm font-medium transition"
              >
                {file ? file.name : 'Escolher Arquivo PDF'}
              </label>

              {file && (
                <div className="mt-4">
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                    Processar e Extrair Linhas
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 text-sm font-medium">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>{rows.length} Pacientes identificados. Marque as linhas desejadas para aprovar.</span>
                </div>
                <button
                  onClick={() => setRows(prev => prev.map(r => ({ ...r, approved: true })))}
                  className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline"
                >
                  Marcar Todos
                </button>
              </div>

              {/* Tabela de Validação de Staging */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
                    <tr>
                      <th className="p-3 w-10 text-center">Aprovar</th>
                      <th className="p-3">Paciente / Telefone</th>
                      <th className="p-3">Cartão SUS / CPF</th>
                      <th className="p-3">Procedimento</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {rows.map(row => {
                      const isEditing = editingRowId === row.id;
                      return (
                        <tr key={row.id} className={row.approved ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}>
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={row.approved}
                              onChange={() => handleToggleApprove(row.id, row.approved)}
                              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                            />
                          </td>

                          <td className="p-3">
                            {isEditing ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                  placeholder="Nome Paciente"
                                />
                                <input
                                  type="text"
                                  value={editForm.phone_raw}
                                  onChange={e => setEditForm({ ...editForm, phone_raw: e.target.value })}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                  placeholder="Telefone"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {row.rawData.name || '—'}
                                </div>
                                <div className="text-slate-500 font-mono text-[11px]">
                                  📱 {row.rawData.phone_raw || 'Sem Telefone'}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.cns_raw}
                                onChange={e => setEditForm({ ...editForm, cns_raw: e.target.value })}
                                className="w-full px-2 py-1 border rounded text-xs"
                                placeholder="Cartão SUS"
                              />
                            ) : (
                              row.rawData.cns_raw || '—'
                            )}
                          </td>

                          <td className="p-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {row.rawData.procedure_name || 'Procedimento Saúde'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Agenda: {row.rawData.scheduled_date_raw || '—'}
                            </div>
                          </td>

                          <td className="p-3 text-right">
                            {isEditing ? (
                              <button
                                onClick={() => handleSaveEdit(row.id)}
                                className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(row)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {importId && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {rows.filter(r => r.approved).length} de {rows.length} pacientes selecionados
            </span>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">
                Cancelar
              </button>
              <button
                onClick={handleApproveAll}
                disabled={approving || rows.filter(r => r.approved).length === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirmar e Encaminhar para Fila WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
