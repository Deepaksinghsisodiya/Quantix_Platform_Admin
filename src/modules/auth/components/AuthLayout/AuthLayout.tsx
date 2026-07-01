import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden selection:bg-accent-100 selection:text-accent-900 dark:bg-slate-950">
      {/* Premium Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-accent-300/30 to-indigo-400/10 rounded-full blur-[140px] dark:from-accent-900/20 dark:to-indigo-900/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-emerald-300/20 to-accent-400/10 rounded-full blur-[140px] dark:from-emerald-950/15 dark:to-accent-900/10 pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[30%] h-[30%] bg-purple-300/15 rounded-full blur-[120px] dark:bg-purple-900/5 pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-[440px] animate-slide-up z-10">
        {/* Card */}
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-10 shadow-2xl backdrop-blur-xl dark:border-surface-800/40 dark:bg-surface-900/80 shadow-accent-500/5">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-wider text-surface-400/80 dark:text-surface-500/60">
          Quantix Platform v1.0.0-alpha
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
