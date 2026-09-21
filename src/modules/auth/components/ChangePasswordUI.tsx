import React from 'react';
import {
  ShieldAlert,
  Lock,
  ShieldCheck,
  ShieldEllipsis,
  Zap,
  Mail
} from 'lucide-react';
import { ATMInputField } from '@/shared/components/form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FormikProps } from 'formik';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props extends FormikProps<any> {
  isForced?: boolean;
  isAdmin?: boolean;
  rules: Array<{ label: string; test: (v: string) => boolean }>;
  getStrength: (pw: string) => number;
  strengthColors: string[];
  strengthLabels: string[];
}

const ChangePasswordUI: React.FC<Props> = ({
  isForced,
  isAdmin,
  values,
  rules,
  getStrength,
  strengthColors,
  strengthLabels,
}) => {
  const isMatching = values.newPassword && values.confirmPassword && values.newPassword === values.confirmPassword;
  const strength = getStrength(values.newPassword ?? '');

  return (
    <div className="space-y-6">
      {isForced && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex gap-4 items-center">
          <div className="w-11 h-11 bg-[var(--zen-surface)] dark:bg-[#13151a] rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-rose-500/20">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-black text-rose-700 dark:text-rose-300 uppercase tracking-widest">Action Required</h4>
            <p className="text-[12px] text-rose-600/80 dark:text-rose-400/90 leading-tight">
              Please update your password to maintain account security.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <ATMInputField
          name="currentPassword"
          label="Current Password"
          type="password"
          placeholder="Enter existing password"
          required
          icon={<Lock size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
        />

        {isForced && isAdmin && (
          <ATMInputField
            name="newEmail"
            label="Real Email Address"
            type="email"
            placeholder="Enter your actual email address"
            required
            icon={<Mail size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
          />
        )}

        <div className="space-y-4">
          <ATMInputField
            name="newPassword"
            label="New Password"
            type="password"
            placeholder="Choose a new password"
            required
            icon={<ShieldCheck size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
          />

          {values.newPassword && (
            <div className="bg-[var(--zen-surface)] dark:bg-[#13151a]/20 border border-[var(--zen-border)] rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-3">
                Password requirements
              </p>

              <div className="grid gap-2.5">
                {rules.map(r => {
                  const passed = r.test(values.newPassword);
                  return (
                    <div key={r.label} className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center transition-all border shadow-sm",
                        passed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-[var(--zen-surface)] dark:bg-black/20 border-slate-200 dark:border-slate-800 text-slate-300"
                      )}>
                        {passed ? <Zap size={11} className="fill-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />}
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold tracking-tight",
                        passed ? "text-surface-700 dark:text-slate-200" : "text-surface-400 dark:text-surface-500"
                      )}>
                        {r.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-300",
                        i <= strength ? strengthColors[strength] : "bg-surface-200 dark:bg-surface-800"
                      )}
                    />
                  ))}
                </div>
                {strength > 0 && (
                  <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-surface-500 dark:text-surface-400">
                    {strengthLabels[strength]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <ATMInputField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Verify new password"
            required
            icon={<ShieldEllipsis size={18} className="text-surface-400 group-focus-within:text-accent-500 transition-colors" />}
          />
          {values.confirmPassword && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[var(--zen-surface)] dark:bg-[#13151a]/20 rounded-full w-fit border border-[var(--zen-border)] shadow-sm">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isMatching ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              )} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isMatching ? "text-emerald-600" : "text-amber-600"
              )}>
                {isMatching ? "Passwords match" : "Mismatch"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordUI;