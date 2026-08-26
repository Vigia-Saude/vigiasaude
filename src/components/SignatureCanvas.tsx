import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (base64: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  disabled?: boolean;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSave,
  onClear,
  width = 450,
  height = 180,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar estilo do traço da caneta
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fundo branco limpo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    if (onClear) onClear();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white shadow-inner touch-none">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-[180px] cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400">
            <PenTool className="w-8 h-8 mb-1 opacity-50 text-blue-500 animate-pulse" />
            <span className="text-xs font-medium tracking-wide">Assine com o dedo ou mouse nesta área</span>
          </div>
        )}

        {/* Linha guia de assinatura */}
        <div className="absolute bottom-6 left-8 right-8 border-b border-gray-200 pointer-events-none flex justify-between text-[10px] text-gray-400">
          <span>X</span>
          <span>Linha de Assinatura</span>
        </div>
      </div>

      <div className="flex items-center justify-between w-full mt-3 px-1">
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || !hasSignature}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Limpar Assinatura
        </button>

        {hasSignature && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Check className="w-3.5 h-3.5" />
            Assinatura capturada
          </span>
        )}
      </div>
    </div>
  );
};
export default SignatureCanvas;
