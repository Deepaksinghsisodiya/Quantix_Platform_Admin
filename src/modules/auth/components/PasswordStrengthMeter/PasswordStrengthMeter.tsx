import React, { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
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

export default PasswordStrengthMeter;
