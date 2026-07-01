import React, { useState } from 'react';
import { Form, useFormikContext } from 'formik';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { ATMButton } from '@/shared/ui';
import { ATMInputField } from '@/shared/components/form';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter/PasswordStrengthMeter';

interface ChangePasswordFormProps {
  isSubmitting: boolean;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ isSubmitting }) => {
  const { values } = useFormikContext<{ newPassword: string }>();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden selection:bg-accent-100 selection:text-accent-900 dark:bg-slate-950">
      {/* Ambient Glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-gradient-to-br from-accent-300/20 to-indigo-400/5 rounded-full blur-[140px] dark:from-accent-900/15 dark:to-indigo-900/5 pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-gradient-to-tl from-emerald-300/15 to-accent-400/10 rounded-full blur-[140px] dark:from-emerald-950/10 dark:to-accent-900/5 pointer-events-none" />

      {/* Card Wrapper */}
      <div className="relative w-full max-w-[460px] animate-slide-up z-10">
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl dark:border-surface-800/40 dark:bg-surface-900/80 shadow-accent-500/5">
          
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 shadow-lg shadow-accent-500/20">
              <span className="text-xl font-black text-white tracking-tighter">Q</span>
            </div>
          </div>

          {/* Title Header */}
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-555">
              Set a New Password
            </h1>
            <p className="text-xs text-surface-400 dark:text-surface-500 leading-relaxed px-2">
              Choose a strong password for your security. Your temporary password is single-use and will be invalidated.
            </p>
          </div>

          <Form className="space-y-5" noValidate>
            {/* Current Password Field */}
            <ATMInputField
              name="currentPassword"
              label="Current (Temporary) Password"
              type={showCurrent ? 'text' : 'password'}
              placeholder="Enter temporary password"
              autoComplete="current-password"
              required
              icon={<Lock size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              suffix={
                <button
                  type="button"
                  className="p-1 hover:text-accent-600 dark:hover:text-accent-400 transition-colors outline-none text-surface-400"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* New Password Field */}
            <div>
              <ATMInputField
                name="newPassword"
                label="New Password"
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                autoComplete="new-password"
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
              <PasswordStrengthMeter password={values.newPassword} />
            </div>

            {/* Confirm Password Field */}
            <ATMInputField
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
              icon={<Lock size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
              suffix={
                <button
                  type="button"
                  className="p-1 hover:text-accent-600 dark:hover:text-accent-400 transition-colors outline-none text-surface-400"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* Save Button */}
            <ATMButton
              type="submit"
              isLoading={isSubmitting}
              className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-accent-500/20 transition-all duration-150 active:scale-[0.98] hover:shadow-xl hover:shadow-accent-500/25"
            >
              Change Password & Continue
            </ATMButton>
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

export default ChangePasswordForm;
