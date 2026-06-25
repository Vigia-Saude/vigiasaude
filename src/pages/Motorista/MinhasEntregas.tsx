import { useState, useEffect, useRef, useCallback } from 'react';
import { Truck, Loader2, PackageOpen, X, CheckCircle2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../../services/apiClient';
import BipagemTracker from '../../components/Bipagem/BipagemTracker';
import type { BipagemResult } from '../../components/Bipagem/BipagemTracker';

interface EntregaItemMedicamento {
  id: string;
  medicamentoNome: string;
  quantidade: number;
  catmatCodigo?: string;
  loteSugerido?: string;
}

interface Entrega {
  id: string;
  numero: string;
  unidadeNome: string;
  itens: EntregaItemMedicamento[];
}

export function MinhasEntregas() {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirm delivery modal
  const [confirmModal, setConfirmModal] = useState<Entrega | null>(null);
  const [confirming, setConfirming] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Bipagem state
  const [showBipagem, setShowBipagem] = useState(false);
  const [bipagemPedido, setBipagemPedido] = useState<Entrega | null>(null);
  const [bipagemResults, setBipagemResults] = useState<BipagemResult[]>([]);

  // Devolver modal
  const [devolverModal, setDevolverModal] = useState<Entrega | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [devolvendo, setDevolvendo] = useState(false);

  const fetchEntregas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/motorista/entregas');
      setEntregas(res.data.data || res.data || []);
    } catch (err) {
      console.error('Erro ao carregar entregas:', err);
      toast.error('Erro ao carregar suas entregas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntregas();
  }, [fetchEntregas]);

  // Canvas drawing handlers
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getCanvasPos(e);
    lastPosRef.current = pos;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const isCanvasBlank = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    const blankCtx = blank.getContext('2d');
    if (blankCtx) {
      blankCtx.fillStyle = '#ffffff';
      blankCtx.fillRect(0, 0, blank.width, blank.height);
    }
    return canvas.toDataURL() === blank.toDataURL();
  };

  // Initialize canvas when confirm modal opens
  useEffect(() => {
    if (confirmModal && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [confirmModal]);

  // Bipagem handlers
  const handleIniciarEntrega = (pedido: Entrega) => {
    setBipagemPedido(pedido);
    setShowBipagem(true);
  };

  const handleBipagemComplete = (bipagens: BipagemResult[]) => {
    setBipagemResults(bipagens);
    setShowBipagem(false);
    // Now open the signature modal
    setConfirmModal(bipagemPedido);
  };

  const handleConfirmarEntrega = async () => {
    if (!confirmModal) return;
    if (isCanvasBlank()) {
      toast.error('Por favor, assine no campo de assinatura antes de confirmar.');
      return;
    }
    setConfirming(true);
    try {
      const canvas = canvasRef.current;
      const assinatura = canvas?.toDataURL('image/png') || '';
      await apiClient.patch(`/api/motorista/entregas/${confirmModal.id}/confirmar`, { assinatura });
      toast.success('Entrega confirmada com sucesso!');
      setEntregas((prev) => prev.filter((e) => e.id !== confirmModal.id));
      setConfirmModal(null);
      setBipagemPedido(null);
      setBipagemResults([]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao confirmar entrega. Tente novamente.');
    } finally {
      setConfirming(false);
    }
  };

  const handleDevolver = async () => {
    if (!devolverModal) return;
    if (motivoRejeicao.trim().length < 10) {
      toast.error('O motivo da devolução deve ter pelo menos 10 caracteres.');
      return;
    }
    setDevolvendo(true);
    try {
      await apiClient.patch(`/api/motorista/entregas/${devolverModal.id}/devolver`, { motivoRejeicao: motivoRejeicao.trim() });
      toast.success('Entrega devolvida com sucesso.');
      setEntregas((prev) => prev.filter((e) => e.id !== devolverModal.id));
      setDevolverModal(null);
      setMotivoRejeicao('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao devolver entrega. Tente novamente.');
    } finally {
      setDevolvendo(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Truck className="h-6 w-6 text-amber-600" />
          Minhas Entregas
        </h1>
        <p className="mt-1 text-sm text-gray-500">Gerencie suas entregas em andamento.</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : entregas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
          <PackageOpen className="h-14 w-14 mb-4 stroke-[1.5]" />
          <p className="text-base font-medium text-gray-500">Nenhuma entrega em andamento</p>
          <p className="text-sm mt-1">Aceite coletas pendentes para iniciar novas entregas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entregas.map((entrega) => (
            <div key={entrega.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{entrega.numero}</p>
                <p className="text-base font-bold text-gray-900 mt-1">{entrega.unidadeNome}</p>
              </div>

              {/* Items List */}
              {entrega.itens && entrega.itens.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Itens</p>
                  {entrega.itens.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate">{item.medicamentoNome}</span>
                      <span className="text-gray-500 font-medium shrink-0 ml-2">x{item.quantidade}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => handleIniciarEntrega(entrega)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Entrega
                </button>
                <button
                  onClick={() => {
                    setDevolverModal(entrega);
                    setMotivoRejeicao('');
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 transition-all cursor-pointer"
                >
                  <Undo2 className="h-4 w-4" />
                  Devolver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bipagem Tracker Modal */}
      {showBipagem && bipagemPedido && (
        <BipagemTracker
          items={bipagemPedido.itens.map((item) => ({
            id: item.id,
            codigo: item.catmatCodigo || item.id,
            nome: item.medicamentoNome,
            quantidade: item.quantidade,
            lote: item.loteSugerido || undefined,
          }))}
          pedidoNumero={bipagemPedido.numero}
          tipo="ENTREGA"
          onComplete={handleBipagemComplete}
          onCancel={() => {
            setShowBipagem(false);
            setBipagemPedido(null);
          }}
        />
      )}

      {/* Confirm Delivery Modal with Signature */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Confirmar Entrega</h3>
              <button
                onClick={() => setConfirmModal(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Entrega <strong>{confirmModal.numero}</strong> para <strong>{confirmModal.unidadeNome}</strong>
            </p>

            {/* Signature Canvas */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Assinatura Digital
              </label>
              <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-crosshair touch-none"
                  style={{ height: '200px' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <button
                onClick={clearCanvas}
                type="button"
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Limpar assinatura
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                disabled={confirming}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEntrega}
                disabled={confirming}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all disabled:opacity-60"
              >
                {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devolver Modal */}
      {devolverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Devolver Entrega</h3>
              <button
                onClick={() => setDevolverModal(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Entrega <strong>{devolverModal.numero}</strong> para <strong>{devolverModal.unidadeNome}</strong>
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Motivo da Devolução (mínimo 10 caracteres)
              </label>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo da devolução..."
                className="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 sm:text-sm placeholder:text-gray-400 transition-all"
              />
              <p className="text-xs text-gray-400">{motivoRejeicao.length}/10 caracteres mínimos</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDevolverModal(null)}
                disabled={devolvendo}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDevolver}
                disabled={devolvendo || motivoRejeicao.trim().length < 10}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-all disabled:opacity-60"
              >
                {devolvendo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Devolver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
