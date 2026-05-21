import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false,
  isLoading = false,
  className,
  ...props
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={isLoading ? undefined : onClose}
      />
      
      {/* Modal Card */}
      <div 
        className={cn(
          "relative bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200", 
          className
        )}
        role="dialog"
        {...props}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={cn(
            "mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-5",
            isDanger ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100"
          )}>
            <AlertTriangle className="h-7 w-7" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          
          {/* Message */}
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed",
                isDanger 
                  ? "bg-red-600 hover:bg-red-500 hover:shadow-lg focus:ring-4 focus:ring-red-100" 
                  : "bg-blue-600 hover:bg-blue-500 hover:shadow-lg focus:ring-4 focus:ring-blue-100"
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
