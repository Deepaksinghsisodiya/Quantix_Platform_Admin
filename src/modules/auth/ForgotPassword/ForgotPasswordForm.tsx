import React from 'react';
import { Form } from 'formik';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ATMButton } from '@/shared/ui';
import { ATMInputField } from '@/shared/components/form';

interface ForgotPasswordFormProps {
  isSuccess: boolean;
  isSubmitting: boolean;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  isSuccess,
  isSubmitting,
}) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden selection:bg-accent-100 selection:text-accent-900 dark:bg-slate-950">
      {/* Premium Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-accent-300/30 to-indigo-400/10 rounded-full blur-[140px] dark:from-accent-900/20 dark:to-indigo-900/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-emerald-300/20 to-accent-400/10 rounded-full blur-[140px] dark:from-emerald-950/15 dark:to-accent-900/10 pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-[440px] animate-slide-up z-10">
        {/* Card */}
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-10 shadow-2xl backdrop-blur-xl dark:border-surface-800/40 dark:bg-surface-900/80 shadow-accent-500/5">
          {/* Logo / header */}
          <div className="mb-8 flex flex-col items-center gap-3.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-600 to-accent-400 shadow-xl shadow-accent-500/25 transition-all duration-300 hover:scale-105">
              <span className="text-3xl font-black text-white tracking-tighter">Q</span>
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-surface-900 dark:text-surface-555">
                Quantix
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 dark:text-surface-500">
                Platform Admin
              </p>
            </div>
          </div>

          {/* Form Step */}
          {!isSuccess ? (
            <Form className="flex flex-col gap-6" noValidate>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-surface-900 dark:text-surface-555">
                  Trouble signing in?
                </h3>
                <p className="text-xs text-surface-400 dark:text-surface-500 px-2 leading-relaxed">
                  Enter your email address and we'll send you a recovery code to reset your password.
                </p>
              </div>

              {/* Email Input */}
              <ATMInputField
                name="email"
                label="Registered Email"
                placeholder="name@quantix.io"
                autoComplete="email"
                required
                autoFocus
                icon={<Mail size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              />

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <ATMButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/20 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/25"
                >
                  Send Recovery Code
                </ATMButton>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-surface-400 hover:text-accent-600 transition-colors"
                  >
                    <ArrowLeft size={12} />
                    Back to login
                  </Link>
                </div>
              </div>
            </Form>
          ) : (
            <div className="flex flex-col gap-6 text-center animate-in zoom-in-95 duration-300">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 shadow-md">
                  <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
                  Email Dispatched
                </h3>
                <p className="text-xs text-surface-450 dark:text-surface-555 leading-relaxed px-1">
                  We have sent a high-security recovery token code to your inbox.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link to="/reset-password">
                  <ATMButton className="w-full h-12 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/20 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/25">
                    Enter Recovery Code
                  </ATMButton>
                </Link>

                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-wider text-surface-400 hover:text-accent-600 transition-colors text-center"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-wider text-surface-400/80 dark:text-surface-500/60">
          Quantix Platform v1.0.0-alpha
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
