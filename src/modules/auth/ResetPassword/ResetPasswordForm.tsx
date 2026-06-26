import React, { useMemo } from 'react';
import { Form, useFormikContext } from 'formik';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldAlert, Key, ArrowLeft } from 'lucide-react';
import { ATMButton } from '@/shared/ui';
import { ATMInputField } from '@/shared/components/form';

// Password Strength Meter Component
const PasswordStrengthMeter: React.FC = () => {
  const { values } = useFormikContext<{ newPassword: string }>();
  const password = values.newPassword || '';

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500 text-rose-500' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-amber-500 text-amber-500' };
    if (score === 4) return { score, label: 'Good', color: 'bg-indigo-500 text-indigo-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500 text-emerald-500' };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2 px-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength.score
                ? strength.color.split(' ')[0]
                : 'bg-surface-200 dark:bg-surface-800'
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${strength.color.split(' ')[1]}`}>
        {strength.label}
      </p>
    </div>
  );
};

interface ResetPasswordFormProps {
  email: string | null;
  token: string | null;
  showNew: boolean;
  setShowNew: (show: boolean) => void;
  showConfirm: boolean;
  setShowConfirm: (show: boolean) => void;
  isSubmitting: boolean;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  token,
  showNew,
  setShowNew,
  showConfirm,
  setShowConfirm,
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
                Reset Password
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 dark:text-surface-500">
                Setup new security keys
              </p>
            </div>
          </div>

          <Form className="flex flex-col gap-5" noValidate>
            {/* Email Input (only if not prefilled from URL query params) */}
            {!email && (
              <ATMInputField
                name="email"
                label="Registered Email"
                placeholder="name@quantix.io"
                autoComplete="email"
                required
                icon={<ShieldAlert size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              />
            )}

            {/* Token/Code Input (only if not prefilled from URL query params) */}
            {!token && (
              <ATMInputField
                name="token"
                label="Recovery Code"
                placeholder="Enter 6 or 8-digit code"
                autoComplete="off"
                required
                icon={<Key size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              />
            )}

            {/* New Password */}
            <div>
              <ATMInputField
                name="newPassword"
                label="New Password"
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                required
                icon={<Lock size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
                suffix={
                  <button
                    type="button"
                    className="p-1 hover:text-accent-600 dark:hover:text-accent-400 transition-colors outline-none text-surface-400"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <PasswordStrengthMeter />
            </div>

            {/* Confirm Password */}
            <ATMInputField
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              required
              icon={<Lock size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              suffix={
                <button
                  type="button"
                  className="p-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors outline-none text-surface-400"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Submit */}
            <div className="flex flex-col gap-4 pt-2">
              <ATMButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/20 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/25"
              >
                Reset Password
              </ATMButton>

              <div className="text-center pt-1">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-surface-400 hover:text-accent-600 transition-colors"
                >
                  <ArrowLeft size={12} />
                  Abort & Return
                </Link>
              </div>
            </div>
          </Form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-wider text-surface-400/80 dark:text-surface-500/60">
          Quantix Platform v1.0.0-alpha
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
