import React, { useCallback } from 'react';
import { Mail, Send, User, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { cn } from '@/lib/utils/cn';
import {
  useGetMerchantCommunicationsQuery,
  useResendWelcomeEmailMutation,
} from '../services/merchantApi';
import type { MerchantCommunication, MerchantCommunicationStatus } from '../types/merchant.types';

/* -------------------------------------------------------------------------- */
/*  FRS-SAP-307: Welcome Communications                                       */
/*                                                                            */
/*  2026-08-31 (de-fictioned): this panel used to be entirely invented. It     */
/*  rendered a hardcoded log — two rows stamped "Sent" at 2026-03-28T10:00:00Z */
/*  for EVERY merchant regardless of what happened, plus rows for a            */
/*  getting-started guide, an installation-guide link, an offline-setup PDF    */
/*  and a "Support Contact Assignment" that the platform never sends as        */
/*  separate messages — and named a support contact ("Li Wei") that does not   */
/*  exist. The Send and "Resend All" buttons never contacted the server: they  */
/*  slept 800/1200 ms and flipped local state to Sent, so an operator could    */
/*  "deliver" a welcome email to a merchant who received nothing.              */
/*                                                                            */
/*  It now reads GET /merchants/{id}/communications, which derives each row    */
/*  from the ActivityLog entries the send paths actually write, and Resend     */
/*  really re-sends and reports the server's outcome.                          */
/* -------------------------------------------------------------------------- */

export interface WelcomeCommunicationsProps {
  merchantId: string;
}

const STATUS_META: Record<
  MerchantCommunicationStatus,
  { icon: typeof CheckCircle2; className: string; label: string; badge: 'success' | 'warning' | 'danger' }
> = {
  Sent: { icon: CheckCircle2, className: 'text-emerald-500', label: 'Sent', badge: 'success' },
  NotSent: { icon: Clock, className: 'text-amber-500', label: 'Not sent', badge: 'warning' },
  Failed: { icon: AlertTriangle, className: 'text-red-500', label: 'Failed', badge: 'danger' },
};

function formatTime(ts: string | null | undefined): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WelcomeCommunications({ merchantId }: WelcomeCommunicationsProps) {
  const { data, isLoading, isError, error, refetch } = useGetMerchantCommunicationsQuery(merchantId, {
    skip: !merchantId,
  });
  const [resendWelcomeEmail, resendState] = useResendWelcomeEmailMutation();

  const payload = data?.data;

  const handleResend = useCallback(
    async (comm: MerchantCommunication) => {
      try {
        await resendWelcomeEmail(merchantId).unwrap();
        toast.success(`${comm.title} re-sent to ${comm.recipient}`);
        refetch();
      } catch (err: any) {
        // No silent failure: the server's reason is what the operator sees.
        toast.error(err?.data?.message || err?.message || `Could not re-send the ${comm.title.toLowerCase()}`);
      }
    },
    [merchantId, resendWelcomeEmail, refetch],
  );

  if (isLoading) {
    return (
      <ATMCard title="Welcome Communications" padding="md">
        <div className="space-y-2.5 pt-1">
          <ATMSkeleton className="h-11 w-full rounded-xl" />
          <ATMSkeleton className="h-16 w-full rounded-xl" />
          <ATMSkeleton className="h-16 w-full rounded-xl" />
        </div>
      </ATMCard>
    );
  }

  if (isError || !payload) {
    const message =
      (error as any)?.data?.message ||
      (error as any)?.message ||
      'The communications record could not be loaded.';
    return (
      <ATMCard title="Welcome Communications" padding="md">
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-3 dark:border-red-900/50 dark:bg-red-950/20">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-red-700 dark:text-red-300">{message}</p>
            <ATMButton variant="ghost" size="sm" onClick={() => refetch()} className="mt-1.5 px-0">
              Retry
            </ATMButton>
          </div>
        </div>
      </ATMCard>
    );
  }

  const { contactName, contactEmail, communications } = payload;

  return (
    <ATMCard title="Welcome Communications" padding="md">
      <div className="space-y-4 pt-1">
        {/* Recipient */}
        <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 px-3.5 py-2.5">
          <User className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <div className="text-xs flex items-center gap-2 flex-wrap font-semibold text-gray-600 dark:text-gray-300">
            <span className="font-bold text-gray-900 dark:text-white">{contactName || '—'}</span>
            <span className="text-gray-400 dark:text-gray-600">&middot;</span>
            <span className="font-mono text-gray-500 dark:text-gray-400">
              {contactEmail || 'no contact email on file'}
            </span>
          </div>
        </div>

        {communications.length === 0 ? (
          <p className="px-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            No merchant-facing messages apply to this merchant yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {communications.map((comm) => {
              const meta = STATUS_META[comm.status];
              const StatusIcon = meta.icon;
              const when = formatTime(comm.occurredAt);
              return (
                <div
                  key={comm.kind}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-zen-surface px-4 py-3 dark:border-gray-800/80 shadow-sm transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <StatusIcon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.className)} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{comm.title}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                        {when ? `${meta.label} · ${when}` : meta.label}
                      </p>
                      {comm.detail && (
                        <p className="mt-1 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 break-words">
                          {comm.detail}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {comm.canResend ? (
                      <ATMButton
                        variant="ghost"
                        size="sm"
                        icon={comm.status === 'Sent' ? Mail : Send}
                        isLoading={resendState.isLoading}
                        onClick={() => handleResend(comm)}
                        className="whitespace-nowrap"
                      >
                        {comm.status === 'Sent' ? 'Resend' : 'Send'}
                      </ATMButton>
                    ) : (
                      <ATMBadge label={meta.label} color={meta.badge} size="sm" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ATMCard>
  );
}
