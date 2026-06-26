import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  CheckCircle2,
  Loader2,
  Mail,
  AlertTriangle,
  Ban,
  Key,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMModal } from '@/shared/ui/ATMModal';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import type { TokenTier, RechargeToken } from '@/lib/types';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  user?: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const TIER_BADGE_VARIANT: Record<TokenTier, 'gray' | 'primary' | 'purple' | 'warning'> = {
  Basic: 'gray',
  Standard: 'primary',
  Advance: 'purple',
  Premium: 'warning',
};

function getExpiryColor(days: number): string {
  if (days > 30) return 'bg-emerald-500';
  if (days > 14) return 'bg-yellow-500';
  if (days > 7) return 'bg-orange-500';
  return 'bg-red-500';
}

function getExpiryTextColor(days: number): string {
  if (days > 30) return 'text-emerald-600 dark:text-emerald-400';
  if (days > 14) return 'text-yellow-600 dark:text-yellow-400';
  if (days > 7) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function PayloadSection({
  title,
  data,
  defaultOpen = false,
}: {
  title: string;
  data: Record<string, unknown>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-bold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span>{title}</span>
        <span className="text-gray-400 text-xs font-semibold">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <pre className="overflow-x-auto rounded-xl bg-gray-50/50 p-4 font-mono text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-800 shadow-inner">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function TokenTimeline({
  events,
}: {
  events: TimelineEvent[];
}) {
  const dotColor: Record<string, string> = {
    info: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />
      <ul className="space-y-6">
        {events.map((evt) => (
          <li key={evt.id} className="relative flex gap-4">
            <span className={cn(
              'absolute -left-3.5 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-gray-900',
              dotColor[evt.type ?? 'info'],
            )}>
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{evt.title}</p>
              {evt.description && (
                <p className="mt-1 text-xs text-gray-650 dark:text-gray-400 font-medium">{evt.description}</p>
              )}
              <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                {formatDate(evt.timestamp, 'datetime')}
                {evt.user && <> &middot; {evt.user}</>}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface TokenViewProps {
  token: RechargeToken | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  daysRemaining: number;
  expiryPercent: number;
  copied: boolean;
  handleCopy: () => void;
  handleEmail: () => void;
  revokeModal: boolean;
  setRevokeModal: (open: boolean) => void;
  revokeReason: string;
  setRevokeReason: (val: string) => void;
  handleRevoke: () => void;
  isRevoking: boolean;
  timeline: TimelineEvent[];
  onBack: () => void;
}

export const TokenView: React.FC<TokenViewProps> = ({
  token,
  isLoading,
  isError,
  refetch,
  daysRemaining,
  expiryPercent,
  copied,
  handleCopy,
  handleEmail,
  revokeModal,
  setRevokeModal,
  revokeReason,
  setRevokeReason,
  handleRevoke,
  isRevoking,
  timeline,
  onBack,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
          <ATMPageHeader title="Token Detail" onBack={onBack} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/10 dark:bg-gray-900/10">
          <ATMCard padding="lg" className="max-w-7xl mx-auto shadow-sm border border-gray-150">
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
              <p className="text-sm font-semibold">Loading token details...</p>
            </div>
          </ATMCard>
        </div>
      </div>
    );
  }

  if (isError || !token) {
    return (
      <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
          <ATMPageHeader title="Token Detail" onBack={onBack} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/10 dark:bg-gray-900/10">
          <ATMCard padding="md" className="max-w-7xl mx-auto shadow-sm border border-gray-150">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Failed to load token
                  </p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                    Please try again.
                  </p>
                </div>
              </div>
              <ATMButton type="button" variant="secondary" size="sm" onClick={refetch}>
                Retry
              </ATMButton>
            </div>
          </ATMCard>
        </div>
      </div>
    );
  }

  const headerActions = (
    <div className="flex gap-2">
      <ATMButton type="button" variant="secondary" icon={Mail} onClick={handleEmail} className="hover:scale-[1.02] active:scale-[0.98]">
        Email to Merchant
      </ATMButton>
      {token.status === 'Active' && (
        <ATMButton type="button" variant="danger" icon={Ban} onClick={() => setRevokeModal(true)} className="hover:scale-[1.02] active:scale-[0.98]">
          Revoke
        </ATMButton>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
      {/* Fixed Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
        <ATMPageHeader
          title="Token Detail"
          icon={Key}
          subtitle={
            <div className="flex items-center gap-2 mt-1">
              <code className="font-mono text-xs text-gray-400">{token.id}</code>
              <StatusBadge status={token.status} />
            </div>
          }
          onBack={onBack}
          extraActions={headerActions}
        />
      </div>

      {/* Scrollable Layout Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/10 dark:bg-gray-900/10">
        <div className="grid gap-6 lg:grid-cols-3 items-start max-w-7xl mx-auto w-full">
          {/* Left panel core information */}
          <div className="space-y-6 lg:col-span-2">
            <ATMCard title="Token Information" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Merchant</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span>{token.merchantName}</span>
                    <ATMBadge label="Standalone" color="primary" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tier</dt>
                  <dd className="mt-1">
                    <ATMBadge color={TIER_BADGE_VARIANT[token.tier] ?? 'gray'} label={token.tier} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Valid From</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatDate(token.validFrom, 'long')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Valid To</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatDate(token.validTo, 'long')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Generated By</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">{token.generatedBy}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Generated At</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatDate(token.generatedAt, 'datetime')}
                  </dd>
                </div>
              </dl>
            </ATMCard>

            <ATMCard title="Token Expiry Status" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-bold', getExpiryTextColor(daysRemaining))}>
                    {daysRemaining} days remaining
                  </span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {token.validityDays} day validity
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200/20 shadow-inner">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', getExpiryColor(daysRemaining))}
                    style={{ width: `${expiryPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <span>{formatDate(token.validFrom, 'short')}</span>
                  <span>{formatDate(token.validTo, 'short')}</span>
                </div>
              </div>
            </ATMCard>

            <ATMCard title="Token String" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <code className="flex-1 break-all rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3.5 font-mono text-sm font-bold text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 shadow-inner">
                  {token.tokenString}
                </code>
                <ATMButton
                  type="button"
                  variant="outline"
                  className="shrink-0 h-12 w-12 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-100"
                  onClick={handleCopy}
                  icon={copied ? CheckCircle2 : Copy}
                />
              </div>
            </ATMCard>

            <ATMCard title="Token Payload Details" padding="none" className="shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <PayloadSection title="Binding Constraints" data={token.binding as unknown as Record<string, unknown>} defaultOpen />
              <PayloadSection title="Limits Configuration" data={token.limitsPayload as Record<string, unknown>} />
              <PayloadSection title="Feature Availability Map" data={token.featureMap as Record<string, unknown>} />
              <PayloadSection title="Grace Period Policies" data={token.gracePolicy as unknown as Record<string, unknown>} />
            </ATMCard>

            <ATMCard title="Lifecycle Timeline" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <TokenTimeline events={timeline} />
            </ATMCard>
          </div>

          {/* Right sidebar - QR Code & Actions */}
          <div className="space-y-6">
            <ATMCard title="QR Activation Code" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-md">
                  <QRCodeSVG
                    value={token.tokenString}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Scan to activate on POS terminal</p>
              </div>
            </ATMCard>

            <ATMCard title="Quick Actions" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="space-y-3">
                <ATMButton type="button" variant="secondary" className="w-full font-semibold hover:scale-[1.01] transition-transform duration-100" icon={Mail} onClick={handleEmail}>
                  Email to Merchant
                </ATMButton>
                <ATMButton type="button" variant="outline" className="w-full font-semibold hover:scale-[1.01] transition-transform duration-100" icon={Copy} onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy Token String'}
                </ATMButton>
                {token.status === 'Active' && (
                  <ATMButton type="button" variant="danger" className="w-full font-semibold hover:scale-[1.01] transition-transform duration-100" icon={Ban} onClick={() => setRevokeModal(true)}>
                    Revoke Token
                  </ATMButton>
                )}
              </div>
            </ATMCard>
          </div>
        </div>
      </div>

      {/* Revoke Modal */}
      <ATMModal
        isOpen={revokeModal}
        onClose={() => { setRevokeModal(false); setRevokeReason(''); }}
        title="Revoke Token"
        subtitle="This will immediately invalidate the token. The merchant will lose access after grace period expires."
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-red-50/50 p-4 border border-red-100 dark:bg-red-950/20 dark:border-red-900/50">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400 animate-pulse" />
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Revoking this token will disable access for <strong>{token.merchantName}</strong>. A {token.gracePolicy.gracePeriodDays}-day grace period will apply with read-only access.
            </p>
          </div>
          <ATMTextField
            name="revokeReason"
            label="Reason for revocation"
            placeholder="e.g., Non-payment, Fraud, Merchant request..."
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <ATMButton type="button" variant="secondary" size="sm" onClick={() => { setRevokeModal(false); setRevokeReason(''); }}>
              Cancel
            </ATMButton>
            <ATMButton
              type="button"
              variant="danger"
              size="sm"
              isLoading={isRevoking}
              disabled={!revokeReason.trim()}
              onClick={handleRevoke}
            >
              Revoke Token
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
};
export default TokenView;
