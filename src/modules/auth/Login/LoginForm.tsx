import React from 'react';
import { Form, type FormikProps } from 'formik';
import { AtSign, Lock, ShieldCheck } from 'lucide-react';
import { ATMButton } from '@/shared/ui';
import { ATMInputField } from '@/shared/components/form';

interface LoginFormProps {
  formikProps: FormikProps<any>;
  step: 'credentials' | 'mfa';
  setStep: (step: 'credentials' | 'mfa') => void;
  onForgotPasswordClick: () => void;
  isSubmitting: boolean;
  resetForm?: () => void;
  apiError?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  step,
  setStep,
  onForgotPasswordClick,
  isSubmitting,
  resetForm,
  apiError,
}) => {
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
          {/* Logo / header */}
          <div className="mb-10 flex flex-col items-center gap-3.5">
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

          {/* Step content */}
          <div className="transition-all duration-200">
            {apiError && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300" role="alert">
                {apiError}
              </div>
            )}
            {step === 'credentials' ? (
              <Form className="flex flex-col gap-6" noValidate>
                {/* Identifier */}
                <ATMInputField
                  name="email"
                  label="Email or Username"
                  placeholder="admin@quantix.io or admin"
                  autoComplete="username"
                  required
                  autoFocus
                  icon={<AtSign size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
                />

                {/* Password */}
                <div className="space-y-2">
                  <ATMInputField
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    icon={<Lock size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
                  />
                  <div className="flex items-center justify-end px-1 pt-1">
                    <button
                      type="button"
                      className="text-[10px] font-bold uppercase tracking-wider text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors outline-none"
                      onClick={onForgotPasswordClick}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <ATMButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/20 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/25"
                >
                  Sign In
                </ATMButton>
              </Form>
            ) : (
              <Form className="flex flex-col gap-6" noValidate>
                <div className="flex flex-col items-center gap-3.5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 dark:bg-accent-950/40 transition-all duration-300 hover:scale-105 shadow-sm">
                    <ShieldCheck className="h-7 w-7 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-surface-900 dark:text-surface-555">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-xs text-surface-400 dark:text-surface-500 leading-relaxed px-2">
                      Enter the 6-digit authenticator code or an 8-digit backup recovery code.
                    </p>
                  </div>
                </div>

                {/* Reusable Code input */}
                <ATMInputField
                  name="code"
                  label="Verification Code"
                  placeholder="Enter 6 or 8-digit code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={8}
                  required
                  icon={<ShieldCheck size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
                />

                <ATMButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/20 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/25"
                >
                  Verify
                </ATMButton>

                {/* Back link */}
                <button
                  type="button"
                  className="text-xs font-bold uppercase tracking-wider text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 transition-colors text-center"
                  onClick={() => {
                    setStep('credentials');
                    if (resetForm) resetForm();
                  }}
                >
                  Back to sign in
                </button>
              </Form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-wider text-surface-400/80 dark:text-surface-500/60">
          Quantix Platform v1.0.0-alpha
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
