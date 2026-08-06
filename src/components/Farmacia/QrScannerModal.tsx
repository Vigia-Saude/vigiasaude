import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw, Keyboard } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    // Solicitar permissão de câmera e listar dispositivos
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(devices);
        if (devices.length > 0) {
          // Prefere a câmera traseira se houver
          const backCamera = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('traseira')
          );
          const selectedId = backCamera ? backCamera.id : devices[0].id;
          setActiveCameraId(selectedId);
          startScanner(selectedId);
        } else {
          setError('Nenhuma câmera encontrada. Use a digitação manual.');
          setShowManualInput(true);
        }
      })
      .catch((err) => {
        console.error('Erro ao acessar câmeras:', err);
        setError('Permissão de câmera negada ou indisponível. Use o modo manual.');
        setShowManualInput(true);
      });

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async (cameraId: string) => {
    try {
      setError(null);
      setIsScanning(true);
      if (scannerRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Sucesso na leitura
          stopScanner();
          onScanSuccess(decodedText);
        },
        () => {
          // Erro silencioso durante a busca por QR code
        }
      );
    } catch (err: any) {
      console.error('Erro ao iniciar o scanner:', err);
      setError('Falha ao iniciar a câmera. Tente novamente ou use o modo manual.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
    }
  };

  const switchCamera = (cameraId: string) => {
    setActiveCameraId(cameraId);
    startScanner(cameraId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-semibold">Escanear QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {error && (
            <div className="w-full mb-4 flex gap-2 items-start p-3 bg-red-950/50 border border-red-900/60 rounded-xl text-red-200 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Scanner Viewport */}
          <div className={`relative w-full aspect-square max-w-[280px] rounded-xl overflow-hidden bg-black border border-slate-800 ${showManualInput ? 'hidden' : 'block'}`}>
            <div id={scannerId} className="w-full h-full" />
            
            {/* Overlay Scanner Animation */}
            {isScanning && (
              <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-xl pointer-events-none flex flex-col justify-between p-4">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                </div>
                {/* Laser Line */}
                <div className="w-full h-0.5 bg-indigo-500/70 shadow-[0_0_8px_#6366f1] animate-bounce" />
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                </div>
              </div>
            )}
          </div>

          {/* Camera Selector */}
          {!showManualInput && cameras.length > 1 && (
            <div className="w-full mt-4 flex items-center gap-2 justify-center text-sm text-slate-400">
              <RefreshCw className="h-4 w-4" />
              <select
                value={activeCameraId || ''}
                onChange={(e) => switchCamera(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Câmera ${camera.id.substring(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Manual Input Section */}
          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="w-full py-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Digite o código da etiqueta (ex: FRAC-A1B2-C3D4)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="FRAC-XXXX-XXXX"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-xl text-white shadow-lg transition-all"
                >
                  Confirmar
                </button>
              </div>
            </form>
          )}

          {/* Switch Mode Button */}
          <button
            onClick={() => {
              if (showManualInput) {
                setShowManualInput(false);
                if (activeCameraId) startScanner(activeCameraId);
              } else {
                stopScanner();
                setShowManualInput(true);
              }
            }}
            className="mt-6 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {showManualInput ? (
              <>
                <Camera className="h-4 w-4" />
                Usar Câmera (Scanner)
              </>
            ) : (
              <>
                <Keyboard className="h-4 w-4" />
                Digitar Código Manualmente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
