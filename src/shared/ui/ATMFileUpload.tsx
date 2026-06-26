import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  name: string;
  label?: string;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  preview?: boolean;
  value?: File | string | null;
  className?: string;
  children?: React.ReactNode;
}

export const ATMFileUpload: React.FC<Props> = ({
  label,
  onChange,
  accept,
  maxSizeMB = 5,
  error,
  helperText,
  disabled,
  preview = true,
  value,
  className = '',
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB`);
      return;
    }
    
    if (preview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setLocalPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    
    onChange(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={clsx(
          'relative flex flex-col items-center justify-center transition-all duration-200 cursor-pointer',
          !children && 'border-2 border-dashed rounded-2xl p-8',
          !children && (isDragging ? 'border-accent-600 bg-accent-50/50 dark:bg-accent-950/20' : 'border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'),
          error && !children && 'border-red-500 dark:border-red-900 bg-red-50/30 dark:bg-red-950/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {children ? (
            children
        ) : localPreview || (typeof value === 'string' && value) ? (
          <div className="relative group animate-in zoom-in duration-300">
            <img
              src={localPreview || (value as string)}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-xl shadow-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLocalPreview(null);
                onChange(null);
              }}
              className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-zen-card rounded-full shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-4 text-accent-600 dark:text-accent-400">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {accept?.replace('*', '') || 'Any file'} up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};
