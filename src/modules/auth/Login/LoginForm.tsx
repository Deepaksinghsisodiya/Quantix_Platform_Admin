import React from 'react';
import { Form, type FormikProps } from 'formik';
import { Link } from 'react-router-dom';
import { AtSign, Lock, ShieldCheck } from 'lucide-react';
import { ATMButton } from '@/shared/ui';
import { ATMInputField } from '@/shared/components/form';
import { useBrandName } from '@/shared/hooks/useBrandName';

interface LoginFormProps {
  formikProps: FormikProps<any>;
  step: 'credentials' | 'mfa';
  setStep: (step: 'credentials' | 'mfa') => void;
  onForgotPasswordClick: () => void;
  isSubmitting: boolean;
  resetForm?: () => void;
  apiError?: string;
}

const SUBMIT_BUTTON_CLASS =
  'w-full h-12 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/20 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/25';

const FIELD_CLASS = '[&_input]:h-11 [&_input]:rounded-xl';

export const LoginForm: React.FC<LoginFormProps> = ({
  step,
  setStep,
  onForgotPasswordClick,
  isSubmitting,
  resetForm,
  apiError,
}) => {
  const brandName = useBrandName();
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 selection:bg-accent-100 selection:text-accent-900 dark:bg-slate-950">
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.9) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Premium ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-accent-300/40 to-indigo-400/10 blur-[120px] dark:from-accent-900/25 dark:to-indigo-900/10" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tl from-emerald-300/25 to-accent-400/15 blur-[120px] dark:from-emerald-950/20 dark:to-accent-900/15" />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-[420px] animate-slide-up">
        {/* Card */}
        <div className="relative overflow-hidden rounded-4xl border border-white/70 bg-white/85 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl sm:p-10 dark:border-slate-800/70 dark:bg-[#0f172a]/85 dark:shadow-black/40">
          {/* Top accent hairline */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-accent-500 to-transparent" />

          {/* Logo / header */}
          <div className="mb-9 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-600 to-accent-400 text-white shadow-lg shadow-accent-500/25 transition-transform duration-300 hover:scale-105">
              <span className="text-2xl font-black tracking-tighter">{brandName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{brandName}</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                Platform Admin
              </p>
            </div>
          </div>

          {/* Step content */}
          {apiError && (
            <div
              className="mb-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
              role="alert"
            >
              {apiError}
            </div>
          )}

          {step === 'credentials' ? (
            <Form className="flex flex-col gap-5" noValidate>
              {/* Identifier */}
              <ATMInputField
                name="email"
                label="Email or Username"
                placeholder="admin@quantix.io or admin"
                autoComplete="username"
                required
                autoFocus
                className={FIELD_CLASS}
                icon={<AtSign size={18} className="text-slate-400 group-focus-within:text-accent-500 transition-colors" />}
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
                  className={FIELD_CLASS}
                  icon={<Lock size={18} className="text-slate-400 group-focus-within:text-accent-500 transition-colors" />}
                />
                <div className="flex items-center justify-end px-1 pt-1">
                  <button
                    type="button"
                    className="text-[10px] font-bold uppercase tracking-wider text-accent-600 outline-none transition-colors hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
                    onClick={onForgotPasswordClick}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Submit */}
              <ATMButton type="submit" isLoading={isSubmitting} className={SUBMIT_BUTTON_CLASS}>
                Sign In
              </ATMButton>

              {/* Registration link */}
              <div className="mt-1 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-accent-600 outline-none transition-colors hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
                  >
                    Sign Up
                  </Link>
                </span>
              </div>
            </Form>
          ) : (
            <Form className="flex flex-col gap-5" noValidate>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 shadow-sm transition-transform duration-300 hover:scale-105 dark:bg-accent-950/40 dark:text-accent-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h3>
                  <p className="px-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Enter the 6-digit authenticator code or an 8-digit backup recovery code.
                  </p>
                </div>
              </div>

              {/* Code input */}
              <ATMInputField
                name="code"
                label="Verification Code"
                placeholder="••••••"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={8}
                required
                className="[&_input]:h-11 [&_input]:rounded-xl [&_input]:text-center [&_input]:font-mono [&_input]:text-base [&_input]:tracking-[0.35em]"
                icon={<ShieldCheck size={18} className="text-slate-400 group-focus-within:text-accent-500 transition-colors" />}
              />

              <ATMButton type="submit" isLoading={isSubmitting} className={SUBMIT_BUTTON_CLASS}>
                Verify
              </ATMButton>

              {/* Back link */}
              <button
                type="button"
                className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
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

        {/* Footer */}
        <p className="mt-7 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400/80 dark:text-slate-500/60">
          Secured by two-factor authentication
        </p>
      </div>
    </div>
  );
};

export default LoginForm;