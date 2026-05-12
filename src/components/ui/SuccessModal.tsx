import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SuccessModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  autoCloseMs?: number;
}

export function SuccessModal({ isOpen, onClose, title, message, autoCloseMs = 3000, className, ...props }: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoCloseMs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div 
        className={cn("bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all", className)}
        role="dialog"
        {...props}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
