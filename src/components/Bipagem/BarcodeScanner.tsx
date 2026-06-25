import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string, format: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
  width?: string;
  height?: string;
  facingMode?: 'environment' | 'user';
}

let scannerIdCounter = 0;

export default function BarcodeScanner({
  onScan,
  onError,
  isActive,
  width = '100%',
  height = '300px',
  facingMode = 'environment',
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scannerId] = useState(() => `barcode-scanner-${++scannerIdCounter}-${Date.now()}`);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scanFlash, setScanFlash] = useState(false);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);

  const handleScanSuccess = useCallback(
    (decodedText: string, result: any) => {
      setScanFlash(true);
      setTimeout(() => setScanFlash(false), 400);
      onScan(decodedText, result?.result?.format?.formatName || 'UNKNOWN');
    },
    [onScan]
  );

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // State 2 = SCANNING, 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
      } catch {
        // Scanner may already be stopped
      }
      try {
        scannerRef.current.clear();
      } catch {
        // Element may already be cleared
      }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      if (isStartingRef.current) return;
      isStartingRef.current = true;

      // Ensure any previous instance is cleaned up
      await stopScanner();

      // Wait for the DOM element to be available
      await new Promise((r) => setTimeout(r, 100));

      if (!isMountedRef.current || !isActive) {
        isStartingRef.current = false;
        return;
      }

      const el = document.getElementById(scannerId);
      if (!el) {
        isStartingRef.current = false;
        return;
      }

      try {
        const html5Qrcode = new Html5Qrcode(scannerId);
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScanSuccess,
          () => {
            // ignore scan failures (no code found in frame)
          }
        );

        if (isMountedRef.current) {
          setHasError(false);
          setErrorMessage('');
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          const msg =
            err?.message || err?.toString() || 'Erro ao acessar a câmera';
          const friendlyMsg = msg.includes('Permission')
            ? 'Permissão da câmera negada. Habilite nas configurações do navegador.'
            : msg.includes('NotFoundError') || msg.includes('Requested device not found')
            ? 'Nenhuma câmera encontrada neste dispositivo.'
            : `Erro ao iniciar scanner: ${msg}`;

          setHasError(true);
          setErrorMessage(friendlyMsg);
          onError?.(friendlyMsg);
        }
      } finally {
        isStartingRef.current = false;
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, facingMode]);

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{ width, height }}
    >
      {/* Scanner render target */}
      <div
        id={scannerId}
        className={`absolute inset-0 ${isActive ? '' : 'hidden'}`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Success flash overlay */}
      {scanFlash && (
        <div className="pointer-events-none absolute inset-0 z-20 rounded-xl ring-4 ring-green-400 bg-green-400/10 transition-all duration-300" />
      )}

      {/* Scanning line animation overlay */}
      {isActive && !hasError && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Corner markers */}
          <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2">
            {/* Top-left */}
            <div className="absolute -left-0.5 -top-0.5 h-6 w-6 border-l-2 border-t-2 border-amber-400 rounded-tl" />
            {/* Top-right */}
            <div className="absolute -right-0.5 -top-0.5 h-6 w-6 border-r-2 border-t-2 border-amber-400 rounded-tr" />
            {/* Bottom-left */}
            <div className="absolute -bottom-0.5 -left-0.5 h-6 w-6 border-b-2 border-l-2 border-amber-400 rounded-bl" />
            {/* Bottom-right */}
            <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 border-b-2 border-r-2 border-amber-400 rounded-br" />

            {/* Animated scanning line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scanner-line" />
          </div>
        </div>
      )}

      {/* Inactive placeholder */}
      {!isActive && !hasError && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gray-900 text-gray-400">
          <Camera className="h-12 w-12 text-gray-500 stroke-[1.5]" />
          <span className="text-sm font-medium">Toque para escanear</span>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gray-900 px-6 text-center">
          <CameraOff className="h-12 w-12 text-red-400 stroke-[1.5]" />
          <p className="text-sm text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* Inline keyframe style for scanner line animation */}
      <style>{`
        @keyframes scanner-line-move {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 2px); }
        }
        .animate-scanner-line {
          animation: scanner-line-move 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
