import { useState, useCallback, useRef } from 'react';
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Hash,
  X,
  Keyboard,
  ScanLine,
} from 'lucide-react';
import { toast } from 'sonner';
import BarcodeScanner from './BarcodeScanner';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BipagemItem {
  id: string;
  codigo: string;
  nome: string;
  quantidade: number;
  lote?: string;
}

export interface BipagemResult {
  itemId: string;
  codigo: string;
  timestamp: Date;
  success: boolean;
}

export interface BipagemTrackerProps {
  items: BipagemItem[];
  pedidoNumero: string;
  onComplete: (bipagens: BipagemResult[]) => void;
  onCancel: () => void;
  tipo: 'COLETA' | 'ENTREGA';
}

// ─── Audio helpers ───────────────────────────────────────────────────────────

const playBeep = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine'
) => {
  try {
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = 0.3;
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration / 1000
    );
    oscillator.stop(audioCtx.currentTime + duration / 1000);
  } catch {
    // Audio not available — silently ignore
  }
};

const playSuccess = () => playBeep(800, 200);
const playError = () => playBeep(300, 400, 'square');

// ─── Component ───────────────────────────────────────────────────────────────

export default function BipagemTracker({
  items,
  pedidoNumero,
  onComplete,
  onCancel,
  tipo,
}: BipagemTrackerProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [results, setResults] = useState<Map<string, BipagemResult>>(new Map());
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const scannedCount = results.size;
  const totalCount = items.length;
  const allScanned = scannedCount === totalCount;
  const progressPercent = totalCount > 0 ? (scannedCount / totalCount) * 100 : 0;

  // ── Process a scanned / typed code ──────────────────────────────────────

  const processCode = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;

      // Check if already scanned
      const alreadyScanned = Array.from(results.values()).find(
        (r) => r.codigo === trimmed
      );
      if (alreadyScanned) {
        toast.info('Item já bipado', {
          description: 'Este código já foi registrado.',
        });
        return;
      }

      // Find matching unscanned item
      const matchedItem = items.find(
        (item) =>
          item.codigo === trimmed && !results.has(item.id)
      );

      if (matchedItem) {
        // Success
        playSuccess();
        const result: BipagemResult = {
          itemId: matchedItem.id,
          codigo: trimmed,
          timestamp: new Date(),
          success: true,
        };
        setResults((prev) => {
          const next = new Map(prev);
          next.set(matchedItem.id, result);
          return next;
        });
        toast.success('Item bipado com sucesso!', {
          description: matchedItem.nome,
        });
      } else {
        // Error — not in list
        playError();
        setShakeError(true);
        setTimeout(() => setShakeError(false), 600);
        toast.error('Item não pertence a este pedido!', {
          description: `Código: ${trimmed}`,
        });
      }
    },
    [items, results]
  );

  const handleScan = useCallback(
    (decodedText: string, _format: string) => {
      // Pause scanner briefly to avoid rapid duplicate scans
      setScannerActive(false);
      processCode(decodedText);
      // Resume after a short delay
      setTimeout(() => setScannerActive(true), 1200);
    },
    [processCode]
  );

  const handleManualSubmit = () => {
    processCode(manualCode);
    setManualCode('');
    manualInputRef.current?.focus();
  };

  const handleComplete = () => {
    setScannerActive(false);
    onComplete(Array.from(results.values()));
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950/95 backdrop-blur-sm">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-amber-900/40 bg-amber-950 px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-amber-400 stroke-[1.5]" />
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Bipagem — {tipo === 'COLETA' ? 'Coleta' : 'Entrega'}
            </h2>
          </div>
          <span className="text-xs text-amber-300/80">{pedidoNumero}</span>
        </div>
        <button
          onClick={() => {
            setScannerActive(false);
            onCancel();
          }}
          className="rounded-lg p-2 text-amber-400 transition-colors hover:bg-amber-900 hover:text-white"
          title="Cancelar"
        >
          <X className="h-5 w-5 stroke-[1.5]" />
        </button>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      <div className="bg-amber-950/60 px-4 py-3 sm:px-6">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
          <span className="text-amber-200">
            Progresso: {scannedCount} de {totalCount} itens
          </span>
          <span className="text-amber-400">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-amber-900/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Content (scrollable) ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {/* Scanner area */}
        <div
          className={`mb-4 transition-transform duration-300 ${
            shakeError ? 'animate-shake' : ''
          }`}
        >
          <div
            className="cursor-pointer"
            onClick={() => !scannerActive && setScannerActive(true)}
          >
            <BarcodeScanner
              onScan={handleScan}
              onError={(err) => toast.error(err)}
              isActive={scannerActive}
              height="260px"
            />
          </div>

          {/* Scanner toggle */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setScannerActive((prev) => !prev)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                scannerActive
                  ? 'bg-red-600/90 text-white hover:bg-red-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              <Camera className="h-4 w-4 stroke-[1.5]" />
              {scannerActive ? 'Parar câmera' : 'Iniciar câmera'}
            </button>

            <button
              onClick={() => {
                setShowManualInput((prev) => !prev);
                setTimeout(() => manualInputRef.current?.focus(), 100);
              }}
              className="flex items-center gap-2 rounded-lg border border-amber-700 bg-amber-900/40 px-4 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-800"
            >
              <Keyboard className="h-4 w-4 stroke-[1.5]" />
              Digitar código manualmente
            </button>
          </div>
        </div>

        {/* Manual input */}
        {showManualInput && (
          <div className="mb-4 flex gap-2 rounded-lg border border-amber-800 bg-amber-950/60 p-3">
            <input
              ref={manualInputRef}
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Digite o código do item..."
              className="flex-1 rounded-lg border border-amber-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirmar
            </button>
          </div>
        )}

        {/* Items list */}
        <div className="space-y-2">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-200">
            <Package className="h-4 w-4 stroke-[1.5]" />
            Itens do Pedido
          </h3>
          {items.map((item) => {
            const result = results.get(item.id);
            const isScanned = !!result;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-all duration-300 ${
                  isScanned
                    ? 'border-green-700/50 bg-green-950/30'
                    : 'border-gray-700/50 bg-gray-900/50'
                }`}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {isScanned ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-gray-600">
                      {/* empty checkbox */}
                    </div>
                  )}
                </div>

                {/* Item info */}
                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <span
                    className={`truncate text-sm font-medium ${
                      isScanned ? 'text-green-200' : 'text-gray-200'
                    }`}
                  >
                    {item.nome}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {item.codigo}
                    </span>
                    <span>Qtd: {item.quantidade}</span>
                    {item.lote && <span>Lote: {item.lote}</span>}
                  </div>
                  {isScanned && result && (
                    <span className="text-[11px] text-green-400/70">
                      Bipado em{' '}
                      {result.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  {isScanned ? (
                    <span className="rounded-full bg-green-800/60 px-2 py-0.5 text-[11px] font-medium text-green-300">
                      Bipado
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                      Pendente
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer actions ─────────────────────────────────────────────── */}
      <div className="border-t border-amber-900/40 bg-amber-950 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setScannerActive(false);
              onCancel();
            }}
            className="flex-1 rounded-lg border border-amber-800 bg-transparent px-4 py-2.5 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-900/50 sm:flex-none"
          >
            Cancelar
          </button>

          {allScanned && (
            <button
              onClick={handleComplete}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-700 sm:flex-none"
            >
              <CheckCircle2 className="h-4 w-4 stroke-[1.5]" />
              Confirmar Bipagem
            </button>
          )}
        </div>
      </div>

      {/* Shake animation keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-4px); }
          30%, 70% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
