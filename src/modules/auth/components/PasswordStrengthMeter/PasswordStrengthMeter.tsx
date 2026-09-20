import React, { useMemo } from 'react';
import { Check, Circle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password?: string;
  minLength?: number;
}

interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const buildRules = (minLength: number): Rule[] => [
  { label: `At least ${minLength} characters`, test: (pw) => pw.length >= minLength },
  { label: 'One uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One digit (0–9)', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character (!@#$…)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '', minLength = 8 }) => {
  const rules = useMemo(() => buildRules(minLength), [minLength]);
  const { score, label, barColor, textColor } = useMemo(() => {
    const s = rules.reduce((acc, r) => acc + (r.test(password) ? 1 : 0), 0);
    if (!password) return { score: 0, label: '', barColor: '', textColor: '' };
    if (s <= 2) return { score: s, label: 'Weak', barColor: 'bg-rose-500', textColor: 'text-rose-500' };
    if (s === 3) return { score: s, label: 'Fair', barColor: 'bg-amber-500', textColor: 'text-amber-500' };
    if (s === 4) return { score: s, label: 'Good', barColor: 'bg-indigo-500', textColor: 'text-indigo-500' };
    return { score: s, label: 'Strong', barColor: 'bg-emerald-500', textColor: 'text-emerald-500' };
  }, [password]);

  return (
    <div className="space-y-2 mt-2 px-1">
      {password && (
        <>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= score ? barColor : 'bg-surface-200 dark:bg-surface-800'
                }`}
              />
            ))}
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${textColor}`}>{label}</p>
        </>
      )}

      <ul className="space-y-1 pt-1" aria-label="Password requirements">
        {rules.map((r) => {
          const ok = r.test(password);
          return (
            <li
              key={r.label}
              className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                ok
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-surface-500 dark:text-surface-400'
              }`}
            >
              {ok ? (
                <Check size={12} className="shrink-0" />
              ) : (
                <Circle size={10} className="shrink-0" />
              )}
              <span>{r.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
