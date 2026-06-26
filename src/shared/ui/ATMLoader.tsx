import React from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';

interface ATMLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'slate';
  fullScreen?: boolean;
  className?: string;
  title?: string;
  onBack?: () => void;
}

/**
 * A professional spinner component using Lucide icons for a clean, consistent look.
 */
export const ATMLoader: React.FC<ATMLoaderProps> = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  className = '',
  title,
  onBack,
}) => {
  const sizeMap = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 40,
    xl: 64,
  };

  const variantClasses = {
    primary: 'text-accent-600',
    white: 'text-white',
    slate: 'text-slate-400 dark:text-slate-600',
  };

  const content = (
    <Loader2
      size={sizeMap[size]}
      className={`animate-spin ${variantClasses[variant]} ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex flex-col h-full bg-zen-surface overflow-hidden w-full animate-page-enter">
        {/* 🧼 Static High-Fidelity Header */}
        {title && (
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-zen-surface z-20 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-5">
              {onBack && (
                <>
                  <button
                    type="button"
                    onClick={onBack}
                    className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-800 flex items-center justify-center"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-px h-10 bg-slate-100 dark:bg-gray-800" />
                </>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1.5">
                  Synchronizing records with backend database
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Skeleton Body Grid */}
        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/10 dark:bg-gray-900/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Large Column (Forms/Details) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zen-card p-6 rounded-3xl border border-slate-100 dark:border-gray-800/50 space-y-6">
              <div className="w-36 h-4 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse mb-4" />
              
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="w-20 h-3 bg-slate-100 dark:bg-gray-800/60 rounded-md animate-skeleton-pulse" />
                    <div className="w-full h-10 bg-slate-100/60 dark:bg-gray-800/40 rounded-xl animate-skeleton-pulse" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-zen-card p-6 rounded-3xl border border-slate-100 dark:border-gray-800/50 space-y-4">
              <div className="w-44 h-4 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse" />
              <div className="w-full h-24 bg-slate-100/60 dark:bg-gray-800/40 rounded-2xl animate-skeleton-pulse" />
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            <div className="bg-zen-card p-6 rounded-3xl border border-slate-100 dark:border-gray-800/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-gray-800/60 rounded-full animate-skeleton-pulse" />
                <div className="space-y-2">
                  <div className="w-28 h-3.5 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse" />
                  <div className="w-20 h-3 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse" />
                </div>
              </div>
              <div className="w-full h-10 bg-slate-100/60 dark:bg-gray-800/40 rounded-xl animate-skeleton-pulse" />
            </div>

            <div className="bg-zen-card p-6 rounded-3xl border border-slate-100 dark:border-gray-800/50 space-y-3">
              <div className="w-32 h-4 bg-slate-100 dark:bg-gray-800/60 rounded-lg animate-skeleton-pulse mb-2" />
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-gray-800/30">
                  <div className="w-24 h-3.5 bg-slate-100 dark:bg-gray-800/60 rounded-md animate-skeleton-pulse" />
                  <div className="w-12 h-3.5 bg-slate-100 dark:bg-gray-800/60 rounded-md animate-skeleton-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }

  return content;
};

interface ATMPageLoaderProps {
  className?: string;
  message?: string;
}

/**
 * Minimalist full-screen page loader.
 * Uses a simple clean spinner to keep the startup experience smooth and distraction-free.
 */
export const ATMPageLoader: React.FC<ATMPageLoaderProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-zen-surface transition-all duration-500">
      <div className="flex flex-col items-center gap-4">
        <ATMLoader size="lg" />
        {message && (
          <p className="text-[13px] font-medium text-slate-400 dark:text-gray-500 tracking-wide animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ATMLoader;
