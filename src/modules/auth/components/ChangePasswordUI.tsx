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
}) => {


  const isMatching = values.newPassword && values.confirmPassword && values.newPassword === values.confirmPassword;

  return (
    <div className="space-y-8">
      {isForced && (
        <div className="bg-rose-50 dark:bg-rose-500/10 p-5 rounded-[1.5rem] border border-rose-100 dark:border-rose-500/20 flex gap-4 items-center">
          <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-rose-100 dark:border-rose-500/20">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-rose-900 dark:text-rose-100 uppercase tracking-widest">Action Required</h4>
            <p className="text-[12px] text-rose-600/80 dark:text-rose-400 leading-tight">
              Please update your password to maintain account security.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-8 px-1">
        <ATMInputField
          name="currentPassword"
          label="Current Password"
          type="password"
          placeholder="Enter existing password"
          required
          icon={<Lock size={18} className="text-slate-400" />}
        />

        {isForced && isAdmin && (
          <ATMInputField
            name="newEmail"
            label="Real Email Address"
            type="email"
            placeholder="Enter your actual email address"
            required
            icon={<Mail size={18} className="text-slate-400" />}
          />
        )}

        <div className="space-y-6">
          <ATMInputField
            name="newPassword"
            label="New Password"
            type="password"
            placeholder="Choose a new password"
            required
            icon={<ShieldCheck size={18} className="text-slate-400" />}
          />

          {values.newPassword && (
            <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-[1.5rem] border border-slate-100 dark:border-white/5">
              <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                {rules.map(r => {
                  const passed = r.test(values.newPassword);
                  return (
                    <div key={r.label} className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center transition-all border shadow-sm",
                        passed ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-white dark:bg-black/20 border-slate-200 dark:border-white/5 text-slate-300"
                      )}>
                        {passed ? <Zap size={11} className="fill-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold tracking-tight",
                        passed ? "text-slate-700 dark:text-slate-200" : "text-slate-400"
                      )}>
                        {r.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ATMInputField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Verify new password"
            required
            icon={<ShieldEllipsis size={18} className="text-slate-400" />}
          />
          {values.confirmPassword && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-white/5 rounded-full w-fit border border-slate-100 dark:border-white/5 shadow-sm">
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
