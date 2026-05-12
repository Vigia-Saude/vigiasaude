import React, { useState, useRef, useCallback } from 'react';
import { CloudUpload, X, File, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

export function FileUpload({ onFilesChange, maxFiles = 10, accept, className, ...props }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    
    setFiles((prev) => {
      const updated = [...prev, ...Array.from(newFiles)].slice(0, maxFiles);
      if (onFilesChange) onFilesChange(updated);
      return updated;
    });
  }, [maxFiles, onFilesChange]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      if (onFilesChange) onFilesChange(updated);
      return updated;
    });
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <CloudUpload className={cn("w-10 h-10 mb-3", isDragging ? "text-blue-500" : "text-gray-400")} />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold text-blue-600">Clique para fazer upload</span> ou arraste os arquivos
          </p>
          <p className="text-xs text-gray-500">Suporta múltiplos arquivos {accept ? `(${accept})` : ''}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((file, idx) => {
            const isImage = file.type.startsWith('image/');
            const previewUrl = isImage ? URL.createObjectURL(file) : null;

            return (
              <div key={`${file.name}-${idx}`} className="flex items-center p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center mr-3">
                  {isImage && previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : isImage ? (
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <File className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="ml-2 flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
