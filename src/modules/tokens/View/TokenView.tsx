/**
 * Token Detail — presentational side. 2026-08-29 rebuild: Tier → Plan, Valid From/To →
 * Applied/Expires (window materialises on apply), fictional binding/gracePolicy objects
 * replaced by the real payload columns, fake "Email to Merchant" removed.
 */
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Key,
  Mail,
  Printer,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMProgressBar } from '@/shared/ui/ATMProgressBar';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { PLAN_TYPE_LABEL } from '@/lib/types/platform-enums';
import type { RechargeTokenDetail } from '@/lib/types';
import { parseJsonRecord } from '../services/tokenApi';
import { TokenBreakdown } from '../components/TokenBreakdown';
import { TokenStatusBadge } from '../components/TokenStatusBadge';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  user?: string;
  type: 'info' | 'success' | 'warning' | 'error';
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
  const isEmpty = Object.keys(data).length === 0;
  const sectionId = `payload-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="border-b border-[var(--zen-border)] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={sectionId}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-bold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span>{title}</span>
        <span className="text-gray-400 text-xs font-semibold">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div id={sectionId} className="px-5 pb-4">
          {isEmpty ? (
            <p className="text-xs font-semibold text-gray-400 py-2">Nothing recorded.</p>
          ) : (
            <pre className="overflow-x-auto rounded-xl bg-gray-50/50 p-4 font-mono text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-[var(--zen-border)] shadow-inner">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function TokenTimeline({ events }: { events: TimelineEvent[] }) {
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
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-medium">{evt.description}</p>
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
  token: RechargeTokenDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  daysRemaining: number | null;
  expiryPercent: number;
  copied: boolean;
  handleCopy: () => void;
  handleSend: () => void;
  isSending: boolean;
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
  handleSend,
  isSending,
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
      <div className="flex flex-col gap-6 w-full">
        <ATMPageHeader title="Token Detail" onBack={onBack} />
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          <ATMSkeleton variant="card" className="h-40 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ATMSkeleton variant="card" className="h-64 w-full" />
              <ATMSkeleton variant="card" className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <ATMSkeleton variant="card" className="h-72 w-full" />
              <ATMSkeleton variant="card" className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !token) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <ATMPageHeader title="Token Detail" onBack={onBack} />
        <ATMCard padding="md" className="w-full max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Failed to load token</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Please try again.</p>
              </div>
            </div>
            <ATMButton type="button" variant="secondary" size="sm" onClick={refetch}>
              Retry
            </ATMButton>
          </div>
        </ATMCard>
      </div>
    );
  }

  const limits = parseJsonRecord<Record<string, number>>(token.limitsPayload);
  const features = parseJsonRecord<Record<string, boolean>>(token.featurePayload);
  const gracePolicy = parseJsonRecord<Record<string, number>>(token.gracePolicyDays);

  return (
    <div className="flex flex-col gap-6 w-full">
      <ATMPageHeader
        title="Token Detail"
        icon={Key}
        subtitle={
          <div className="flex items-center gap-2 mt-1 min-w-0">
            <code className="min-w-0 truncate font-mono text-xs text-gray-400">{token.tokenId}</code>
            <TokenStatusBadge status={token.status} />
          </div>
        }
        onBack={onBack}
        extraActions={
          (token.status === 'Active' || token.status === 'Superseded') ? (
            <ATMButton type="button" variant="danger" icon={Ban} onClick={() => setRevokeModal(true)} className="hover:scale-[1.02] active:scale-[0.98]">
              Revoke
            </ATMButton>
          ) : undefined
        }
      />

      <div className="w-full max-w-[1600px] mx-auto">
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="space-y-6 lg:col-span-2">
            <ATMCard title="Token Information" padding="md">
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Merchant</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100 break-words min-w-0">
                    {token.merchantName || token.merchantId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Plan</dt>
                  <dd className="mt-1">
                    <span title={PLAN_TYPE_LABEL[token.plan] ?? token.plan}>
                      <ATMBadge color="primary" label={token.planName || (PLAN_TYPE_LABEL[token.plan] ?? token.plan)} />
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sequence</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">#{token.sequence}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Validity</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {token.validityDays} days from activation
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Applied</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {token.activatedAt ? formatDate(token.activatedAt, 'long') : 'Not applied yet'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Expires</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {token.expiresAt ? formatDate(token.expiresAt, 'long') : '— (starts on apply)'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Price</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {token.priceCurrency > 0 ? token.priceCurrency.toFixed(2) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Generated</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatDate(token.createdAt, 'datetime')} · {token.generatedBy}
                  </dd>
                </div>
              </dl>
            </ATMCard>

            {token.status === 'Superseded' && (
              <ATMCard padding="md" className="shadow-sm border border-amber-100 dark:border-amber-900/50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Superseded — needs review
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      A higher-sequence token was recorded as applied while this one was never
                      applied, so the merchant's system will reject it forever. The merchant paid
                      for it — resolve by revoking it (and credit or reissue if warranted).
                    </p>
                  </div>
                </div>
              </ATMCard>
            )}

            {token.status === 'Revoked' && (
              <ATMCard padding="md" className="shadow-sm border border-red-100 dark:border-red-900/50">
                <div className="flex items-start gap-3">
                  <Ban className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Revoked {token.revokedAt ? formatDate(token.revokedAt, 'datetime') : ''}
                      {token.revokedBy ? ` by ${token.revokedBy}` : ''}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {token.revokedReason ?? 'No reason recorded.'}
                    </p>
                  </div>
                </div>
              </ATMCard>
            )}

            <ATMCard title="Coverage" padding="md">
              {daysRemaining == null ? (
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 py-2">
                  Not applied yet — the {token.validityDays}-day window starts when the merchant applies this token.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-sm font-bold', getExpiryTextColor(daysRemaining))}>
                      {daysRemaining} days remaining
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {token.validityDays} day validity
                    </span>
                  </div>
                  <ATMProgressBar
                    value={expiryPercent}
                    variant={
                      daysRemaining > 30 ? 'success' : daysRemaining > 7 ? 'warning' : 'danger'
                    }
                    size="md"
                    label={`${daysRemaining} of ${token.validityDays} days remaining`}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <span>{token.activatedAt ? formatDate(token.activatedAt, 'short') : ''}</span>
                    <span>{token.expiresAt ? formatDate(token.expiresAt, 'short') : ''}</span>
                  </div>
                </div>
              )}
            </ATMCard>

            <ATMCard title="Token String" padding="md">
              <div className="flex items-center gap-3">
                <code className="flex-1 break-all rounded-xl border border-[var(--zen-border)] bg-gray-50/50 px-4 py-3.5 font-mono text-sm font-bold text-gray-900 dark:bg-gray-900 dark:text-gray-100 shadow-inner">
                  {token.encodedToken}
                </code>
                <ATMButton
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleCopy}
                  icon={copied ? CheckCircle2 : Copy}
                  aria-label={copied ? 'Token string copied' : 'Copy token string'}
                  title={copied ? 'Copied' : 'Copy token string'}
                />
              </div>
            </ATMCard>

            {/* 2026-08-29 (user-locked): human-readable breakdown first; raw JSON stays
                collapsed below for debugging. */}
            <ATMCard title="What This Token Grants" padding="md">
              <TokenBreakdown
                limitsPayload={token.limitsPayload}
                featurePayload={token.featurePayload}
                gracePolicyDays={token.gracePolicyDays}
              />
            </ATMCard>

            <ATMCard title="Raw Payloads" padding="none" className="overflow-hidden">
              <PayloadSection title="Limits Configuration" data={limits} />
              <PayloadSection title="Feature Availability Map" data={features} />
              <PayloadSection title="Grace Period Policy" data={gracePolicy} />
            </ATMCard>

            <ATMCard title="Lifecycle Timeline" padding="md">
              <TokenTimeline events={timeline} />
            </ATMCard>
          </div>

          <div className="space-y-6">
            <ATMCard title="QR Activation Code" padding="md">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="rounded-2xl border border-[var(--zen-border)] bg-white p-5 dark:bg-white shadow-md">
                  <QRCodeSVG value={token.encodedToken} size={200} level="H" includeMargin />
                </div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Scan to apply on POS terminal</p>
              </div>
            </ATMCard>

            <ATMCard title="Activation" padding="md">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Terminal</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100 break-all">
                    {token.activatedTerminalId ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">App Version</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {token.activatedAppVersion ?? '—'}
                  </dd>
                </div>
              </dl>
            </ATMCard>

            <ATMCard title="Quick Actions" padding="md">
              <div className="space-y-3">
                <ATMButton type="button" variant="outline" className="w-full font-semibold hover:scale-[1.01] transition-transform duration-100" icon={Copy} onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy Token String'}
                </ATMButton>
                <ATMButton type="button" variant="outline" className="w-full font-semibold hover:scale-[1.01] transition-transform duration-100" icon={Printer} onClick={() => window.print()}>
                  Print
                </ATMButton>
                {/* Email only for Issued — a superseded token must never be delivered. */}
                {token.status === 'Active' && (
                  <ATMButton type="button" variant="secondary" className="w-full font-semibold hover:scale-[1.01] transition-transform duration-100" icon={Mail} isLoading={isSending} onClick={handleSend}>
                    Email Token to Merchant
                  </ATMButton>
                )}
                {(token.status === 'Active' || token.status === 'Superseded') && (
                  <ATMButton type="button" variant="danger" className="w-full font-semibold hover:scale-[1.01] transition-transform duration-100" icon={Ban} onClick={() => setRevokeModal(true)}>
                    Revoke Token
                  </ATMButton>
                )}
              </div>
            </ATMCard>
          </div>
        </div>
      </div>

      <ATMModal
        isOpen={revokeModal}
        onClose={() => { setRevokeModal(false); setRevokeReason(''); }}
        title="Revoke Token"
        subtitle="This will immediately invalidate the token."
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-red-50/50 p-4 border border-red-100 dark:bg-red-950/20 dark:border-red-900/50">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Revoking this token removes its coverage for <strong>{token.merchantName || 'this merchant'}</strong>.
              The plan's grace policy then governs POS access.
            </p>
          </div>
          <ATMTextField
            name="revokeReason"
            label="Reason for revocation"
            placeholder="e.g., Non-payment, Fraud, Merchant request..."
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--zen-border)]">
            <ATMButton type="button" variant="outline" size="sm" onClick={() => { setRevokeModal(false); setRevokeReason(''); }}>
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
