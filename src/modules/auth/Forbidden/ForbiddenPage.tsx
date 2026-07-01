import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ATMButton } from '@/shared/ui';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md text-center p-8 bg-white dark:bg-surface-900 rounded-[2rem] border border-white/60 dark:border-surface-800/40 shadow-xl backdrop-blur-xl">
        <h2 className="text-2xl font-black text-surface-900 dark:text-surface-100">Forbidden</h2>
        <p className="mt-2 text-sm text-surface-500 mb-6">You do not have the required permissions to access this page.</p>
        <ATMButton 
          className="w-full h-11 bg-accent-600 hover:bg-accent-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
          onClick={() => navigate(-1)}
        >
          Go Back
        </ATMButton>
      </div>
    </div>
  );
};

export default ForbiddenPage;
