import React, { useRef, useState } from 'react';
import { Upload, File as FileIcon, X } from 'lucide-react';
import clsx from 'clsx';

interface ATMFilePickerProps {
  label?: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  isError?: boolean;
}

export const ATMFilePicker: React.FC<ATMFilePickerProps> = ({
  label,
  onFileSelect,
  selectedFile,
  accept,
  maxSizeMB = 200,
  className,
  isError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    validateAndSelect(file);
  };

  const validateAndSelect = (file: File | null) => {
    if (!file) return;
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Max size is ${maxSizeMB}MB`);
      return;
    }
    
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    validateAndSelect(file);
  };

  return (
    <div className={clsx("space-y-2", className)}>
      {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          "relative border-2 border-dashed rounded-[32px] p-10 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4",
          isDragging ? "border-accent-500 bg-accent-50/50 dark:bg-accent-950/20" : "border-slate-200 dark:border-gray-800 bg-slate-50/30 dark:bg-gray-900/30 hover:border-accent-400/50",
          selectedFile && "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10",
          isError && "border-rose-500/50 bg-rose-50/10"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-300 w-full">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-2">
              <FileIcon size={28} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[80%]">{selectedFile.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="mt-4 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-rose-500 shadow-md border border-slate-100 dark:border-gray-700 hover:scale-110 transition-all"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-gray-700 group-hover:scale-110 transition-all duration-500">
              <Upload size={24} />
            </div>
            <div className="text-center">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">ATMSelect Corporate Asset</h4>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Drag and drop or click to browse</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
