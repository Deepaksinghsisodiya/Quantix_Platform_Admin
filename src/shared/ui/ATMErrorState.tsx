import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ATMErrorState: React.FC<Props> = ({
  title = 'Something went wrong',
  description,
  message,
  onRetry,
  className = '',
}) => {
  const finalDescription = message || description || 'We encountered an error while loading the data. Please try again.';
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
        <AlertCircle size={40} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed mb-8">{finalDescription}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-accent-600 text-white font-bold rounded-xl hover:bg-accent-700 transition-all shadow-lg shadow-accent-600/20 active:scale-95"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ATMErrorState;
