import React from 'react';
import { Form } from 'formik';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ATMButton } from '@/shared/ui';
import { ATMInputField } from '@/shared/components/form';
import { useBrandName } from '@/shared/hooks/useBrandName';

interface ForgotPasswordFormProps {
  isSuccess: boolean;
  isSubmitting: boolean;
}

const SUBMIT_BUTTON_CLASS =
  'w-full h-12 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/20 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/25';

const FIELD_CLASS = '[&_input]:h-11 [&_input]:rounded-xl';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  isSuccess,
  isSubmitting,
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

          {/* Form step */}
          {!isSuccess ? (
            <Form className="flex flex-col gap-5" noValidate>
              <div className="space-y-1 text-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Forgot your password?</h3>
                <p className="px-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Enter your registered email and we&apos;ll send you a recovery code to reset your password.
                </p>
              </div>

              {/* Email */}
              <ATMInputField
                name="email"
                label="Registered Email"
                placeholder="name@company.com"
                autoComplete="email"
                required
                autoFocus
                className={FIELD_CLASS}
                icon={<Mail size={18} className="text-slate-400 group-focus-within:text-accent-500 transition-colors" />}
              />

              {/* Actions */}
              <div className="flex flex-col gap-4 pt-1">
                <ATMButton type="submit" isLoading={isSubmitting} className={SUBMIT_BUTTON_CLASS}>
                  Send Recovery Code
                </ATMButton>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 outline-none transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    <ArrowLeft size={12} />
                    Back to login
                  </Link>
                </div>
              </div>
            </Form>
          ) : (
            <div className="flex flex-col items-center gap-5 text-center animate-in zoom-in-95 duration-300">
              {/* Success icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-md dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 size={32} strokeWidth={1.5} />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Email Dispatched</h3>
                <p className="px-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  A secure recovery code is on its way to your inbox. Check your spam folder if it doesn&apos;t
                  arrive shortly.
                </p>
              </div>

              <div className="mt-1 flex w-full flex-col gap-3">
                <Link to="/reset-password" className="w-full">
                  <ATMButton className={SUBMIT_BUTTON_CLASS}>
                    <span className="flex items-center justify-center gap-2">
                      Enter Recovery Code
                      <ArrowRight size={14} />
                    </span>
                  </ATMButton>
                </Link>

                <Link
                  to="/login"
                  className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 outline-none transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Back to login
                </Link>
              </div>
            </div>
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

export default ForgotPasswordForm;