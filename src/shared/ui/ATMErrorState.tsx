import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ATMButton } from './ATMButton';

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
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-550 dark:text-red-400 rounded-2xl flex items-center justify-center mb-6 animate-in zoom-in duration-300">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-150 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-8">{finalDescription}</p>
      
      {onRetry && (
        <ATMButton
          onClick={onRetry}
          icon={RefreshCw}
          variant="primary"
        >
          Try Again
        </ATMButton>
      )}
    </div>
  );
};

export default ATMErrorState;
