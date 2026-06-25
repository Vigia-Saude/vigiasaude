import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  bgColor?: string;
  fgColor?: string;
}

export default function QRCodeDisplay({
  value,
  size = 200,
  label,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
}: QRCodeDisplayProps) {
  if (!value) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">Nenhum código para exibir</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="rounded-lg bg-white p-3">
        <QRCode
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="M"
        />
      </div>
      {label && (
        <span className="text-center text-sm font-medium text-gray-600">
          {label}
        </span>
      )}
    </div>
  );
}
