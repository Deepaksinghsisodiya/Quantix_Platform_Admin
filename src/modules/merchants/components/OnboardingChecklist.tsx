import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Server,
  LogIn,
  MapPin,
  Package,
  CreditCard,
  Receipt,
  Key,
  Mail,
  Smartphone,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { MerchantType, OnboardingChecklist as OnboardingChecklistType } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OnboardingChecklistProps {
  readonly merchantType: MerchantType;
  readonly checklist: OnboardingChecklistType;
}

interface ChecklistStep {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ElementType;
  readonly completed: boolean;
}

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

function getEnterpriseSteps(c: OnboardingChecklistType): ChecklistStep[] {
  return [
    { id: 'provisioning', label: 'Account provisioning', icon: Server, completed: c.accountVerified },
    { id: 'first-login', label: 'First login', icon: LogIn, completed: c.profileCompleted },
    { id: 'first-location', label: 'First location added', icon: MapPin, completed: c.firstLocationAdded },
    { id: 'first-product', label: 'First product created', icon: Package, completed: c.firstTerminalActivated },
    { id: 'first-txn', label: 'First transaction', icon: Receipt, completed: c.firstTransactionCompleted },
    { id: 'payment-active', label: 'Payment method configured', icon: CreditCard, completed: c.paymentMethodConfigured },
  ];
}

function getStandaloneSteps(c: OnboardingChecklistType): ChecklistStep[] {
  return [
    { id: 'token-gen', label: 'Token generated', icon: Key, completed: c.accountVerified },
    { id: 'token-delivered', label: 'Token delivered', icon: Mail, completed: c.profileCompleted },
    { id: 'app-installed', label: 'App installed', icon: Smartphone, completed: c.firstLocationAdded },
    { id: 'token-activated', label: 'Token activated', icon: Zap, completed: c.firstTerminalActivated },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OnboardingChecklist({ merchantType, checklist }: OnboardingChecklistProps) {
  const steps = useMemo(
    () =>
      merchantType === 'Enterprise'
        ? getEnterpriseSteps(checklist)
        : getStandaloneSteps(checklist),
    [merchantType, checklist],
  );

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = completedCount === totalCount;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Onboarding Progress
        </h3>
        <span
          className={cn(
            'text-xs font-semibold',
            allDone ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400',
          )}
        >
          {completedCount}/{totalCount} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            allDone ? 'bg-green-500' : 'bg-indigo-500',
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percent}% complete`}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle2
                  className="h-5 w-5 flex-shrink-0 text-green-500"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-5 w-5 flex-shrink-0 text-gray-300 dark:text-gray-600"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={cn(
                  'h-4 w-4 flex-shrink-0',
                  step.completed
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-300 dark:text-gray-600',
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-sm',
                  step.completed
                    ? 'text-gray-500 line-through dark:text-gray-400'
                    : 'font-medium text-gray-900 dark:text-gray-100',
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Completion timestamp */}
      {checklist.completedAt && (
        <p className="mt-4 text-xs text-green-600 dark:text-green-400">
          Onboarding completed on{' '}
          {new Date(checklist.completedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}
