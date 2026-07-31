import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Upload, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';

interface PdfImport {
  id: string;
  originalFilename: string | null;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  rowsFound: number | null;
  rowsImported: number | null;
  criadoEm: string;
}

export function ValidacaoPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imports, setImports] = useState<PdfImport[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiClient.get<PdfImport[]>('/api/regulacao/imports');
      setImports(res.data);
    } catch {
      // Ignora falhas de histórico inicial
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleUpload = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Tipo de arquivo inválido. Por favor, envie um arquivo PDF.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('O arquivo excede o limite máximo de 10 MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await apiClient.post('/api/regulacao/imports/upload', formData);
      toast.success('PDF processado! Redirecionando para conferência...');
      fetchHistory();
      navigate(`/regulador/validacao-pdf/${res.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.erro || err.response?.data?.error || 'Falha ao processar PDF';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Validação PDF</h1>
        <p className="text-sm text-slate-500 mt-1">
          Anexe o PDF da agenda gerado pelo sistema de Regulação (SES-MS) para extração automática e conferência dos pacientes.
        </p>
      </div>

      {/* Card Dropzone Idêntico à Imagem 1 */}
      <div className="max-w-xl mx-auto">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (uploading) return;
            const f = e.dataTransfer.files[0];
            if (f) {
              setFile(f);
              handleUpload(f);
            }
          }}
          className={`bg-white border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all shadow-sm ${
            uploading ? 'opacity-60 pointer-events-none border-slate-300' : 'hover:border-emerald-600 border-slate-200'
          }`}>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 text-2xl shadow-sm">
            <Upload className="h-8 w-8 stroke-[1.75]" />
          </div>
          <div className="text-base font-bold text-slate-800">Anexar PDF de Agendamentos</div>
          <div className="text-sm text-slate-500 mt-1">Arraste e solte aqui, ou clique para selecionar</div>
          <div className="text-xs text-slate-400 mt-2">Formato: <strong className="text-slate-600">.pdf</strong> · Tamanho máximo: <strong className="text-slate-600">10 MB</strong></div>
          
          <div className="my-5 flex items-center justify-center gap-3 text-xs text-slate-300 font-semibold uppercase tracking-wider">
            <span className="w-12 h-px bg-slate-200" />
            <span>ou</span>
            <span className="w-12 h-px bg-slate-200" />
          </div>

          <span
            className="inline-flex items-center gap-2 bg-emerald-700 text-white rounded-xl px-5 py-3 text-sm font-bold hover:bg-emerald-800 shadow-md transition-all cursor-pointer select-none">
            <FileText className="h-4 w-4" />
            {uploading ? 'Processando envio...' : file ? file.name : 'Selecionar arquivo PDF'}
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                handleUpload(f);
              }
            }}
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Os dados dos pacientes serão extraídos automaticamente após o upload.
        </p>
      </div>

      {/* Histórico de Importações */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-base font-bold text-slate-800">Histórico de Importações</h2>

        {loadingHistory ? (
          <div className="text-center py-8 text-sm text-slate-400">Carregando histórico...</div>
        ) : imports.length === 0 ? (
          <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl text-sm text-slate-400">
            Nenhum PDF importado ainda. Envie um arquivo PDF acima para iniciar.
          </div>
        ) : (
          <div className="space-y-3">
            {imports.map((imp) => {
              const isCompleted = imp.status === 'PROCESSED' && typeof imp.rowsImported === 'number' && imp.rowsImported > 0;
              const isReadyToValidate = imp.status === 'PROCESSED' && (!imp.rowsImported || imp.rowsImported === 0);
              const isProcessing = imp.status === 'PENDING' || imp.status === 'PROCESSING';

              return (
                <Link
                  key={imp.id}
                  to={`/regulador/validacao-pdf/${imp.id}`}
                  className={`flex items-center justify-between bg-white border rounded-2xl p-4 transition-all hover:shadow-md ${
                    isReadyToValidate
                      ? 'border-emerald-400 ring-2 ring-emerald-500/10 bg-emerald-50/20'
                      : isCompleted
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-slate-200'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      📄
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {imp.originalFilename || imp.id}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(imp.criadoEm).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isProcessing && (
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 font-bold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 animate-spin" />
                        Processando...
                      </span>
                    )}

                    {isReadyToValidate && (
                      <span className="text-xs text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl px-3.5 py-2 font-bold shadow-sm flex items-center gap-1.5 transition-colors">
                        ✓ Pronto para validar ({imp.rowsFound || 0} pacientes)
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}

                    {isCompleted && (
                      <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Validação concluída ({imp.rowsImported} encaminhados)
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
