import React from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mail,
  PlayCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ActivationStatusType = 'idle' | 'activating' | 'done' | 'error';

interface ActivationPhase {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface ActivationStepProps {
  status: ActivationStatusType;
  /** For Enterprise — show plan-specific billing info. */
  planName?: string;
  billingFrequency?: string;
  /** For Standalone — show a simpler activation flow without billing. */
  variant?: 'enterprise' | 'standalone';
}

/**
 * Reusable activation step component showing the phased
 * activation process (status change → billing → welcome email).
 */
export function ActivationStep({
  status,
  planName,
  billingFrequency,
  variant = 'enterprise',
}: ActivationStepProps) {
  const phases: ActivationPhase[] =
    variant === 'enterprise'
      ? [
          { key: 'status-change', label: 'Setting merchant status to Active', icon: <PlayCircle className="h-4 w-4" /> },
          { key: 'billing-init', label: `Initialising ${billingFrequency ?? 'Monthly'} billing cycle`, icon: <CalendarClock className="h-4 w-4" /> },
          { key: 'welcome', label: 'Queueing welcome email with credentials', icon: <Mail className="h-4 w-4" /> },
        ]
      : [
          { key: 'status-change', label: 'Setting merchant status to Active', icon: <PlayCircle className="h-4 w-4" /> },
          { key: 'ready', label: 'Merchant ready for token activation', icon: <Zap className="h-4 w-4" /> },
        ];

  const activeIdx = status === 'idle' ? -1 : status === 'activating' ? (variant === 'standalone' ? 0 : 1) : phases.length;

  const description =
    variant === 'enterprise'
      ? <>Activating <span className="font-semibold">{planName ?? 'Professional'}</span> plan — billing cycle starts immediately.</>
      : <>Activating merchant — no subscription billing for Standalone merchants.</>;

  const successMessage =
    variant === 'enterprise'
      ? 'Merchant is now Active — billing cycle started'
      : 'Merchant is now Active — proceed to token generation';

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20">
          <Zap className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
          Merchant Activation
        </h3>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
          {description}
        </p>
      </div>

      <div className="space-y-3">
        {phases.map((phase, idx) => {
          const isDone = idx < activeIdx;
          const isActive = idx === activeIdx && status === 'activating';
          return (
            <div
              key={phase.key}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300',
                isDone
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/10'
                  : isActive
                    ? 'border-accent-200 bg-accent-50/50 dark:border-accent-800 dark:bg-accent-950/10'
                    : 'border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900/30',
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent-600 dark:text-accent-400" />
              ) : (
                <span className="text-surface-400 dark:text-surface-600">{phase.icon}</span>
              )}
              <span className={cn(
                'text-sm font-semibold',
                isDone ? 'text-emerald-700 dark:text-emerald-450' : isActive ? 'text-accent-700 dark:text-accent-450' : 'text-surface-500 dark:text-surface-400',
              )}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === 'done' && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-450">
          <CheckCircle2 className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          Activation failed. Please retry.
        </div>
      )}
    </div>
  );
}
