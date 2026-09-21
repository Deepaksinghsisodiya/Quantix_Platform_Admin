/**
 * StandalonePanels — Standalone-merchant detail cards.
 *
 * FRS-SAP-402 (2026-08-05): de-mocked. Active Token and Token History render the real
 * GET /merchants/{id}/detail payload. Applies to BOTH Standalone sub-types (Local POS
 * and Cloud) — both are token-billed. (Renewal Status card removed 2026-08-30 with the
 * Token Validity page.)
 */

import React from 'react';
import { ATMBadge, ATMProgressBar, ATMButton, ATMSkeleton } from '@/shared/ui';
import { Link } from 'react-router-dom';
import {
  Key,
  KeyRound,
  Monitor,
  Plus,
  History,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { useGetTerminalsByMerchantQuery } from '@/modules/merchants/services/merchantApi';
import type {
  DetailActiveToken,
  DetailTokenHistoryEntry,
  PlanTypeWire,
} from '../types/merchantDetail.types';

// ---------------------------------------------------------------------------
// Plan badge
// ---------------------------------------------------------------------------

const PLAN_LABEL: Record<PlanTypeWire, string> = {
  StandalonePos: 'Standalone POS',
  StandaloneCloud: 'Standalone Cloud',
  EnterpriseCloud: 'Enterprise Cloud',
};

const PLAN_BADGE_VARIANT: Record<PlanTypeWire, 'default' | 'info' | 'enterprise'> = {
  StandalonePos: 'default',
  StandaloneCloud: 'info',
  EnterpriseCloud: 'enterprise',
};

function PlanBadge({ plan }: { plan: PlanTypeWire }) {
  return (
    <ATMBadge variant={PLAN_BADGE_VARIANT[plan] ?? 'default'} size="sm">
      {PLAN_LABEL[plan] ?? plan}
    </ATMBadge>
  );
}

function TokenStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'default' | 'success' | 'danger' | 'warning'> = {
    Consumed: 'default',
    Active: 'success',
    Generated: 'warning',
    Expired: 'danger',
    Revoked: 'danger',
    Suspended: 'warning',
  };
  return <ATMBadge variant={map[status] ?? 'default'} size="sm">{status}</ATMBadge>;
}

// ---------------------------------------------------------------------------
// Terminals card (already real — unchanged behavior)
// ---------------------------------------------------------------------------

function TerminalsCard({ merchantId }: { merchantId: string }) {
  const { data: res, isLoading } = useGetTerminalsByMerchantQuery(merchantId);
  const terminals = res?.data ?? [];
  const registeredCount = terminals.filter((t) => t.isRegistered).length;

  return (
    <ATMCard title="Terminals" padding="md">
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <ATMSkeleton height="20px" />
            <ATMSkeleton height="20px" />
            <ATMSkeleton width="60%" height="20px" />
          </div>
        ) : terminals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-3">No terminals registered yet.</p>
            <Link to={`/merchants/${merchantId}/terminals`}>
              <ATMButton variant="secondary" size="sm" icon={Plus}>
                Register Terminal
              </ATMButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
              <span>Status</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{registeredCount} / {terminals.length} Registered</span>
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
              {terminals.slice(0, 3).map((t) => (
                <div key={t.terminalId} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 px-3 py-2 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{t.terminalName}</span>
                  <ATMBadge
                    color={t.isRegistered ? 'success' : 'warning'}
                    label={t.isRegistered ? 'Registered' : 'Awaiting Pairing'}
                    size="sm"
                  />
                </div>
              ))}
            </div>

            <div className="pt-1">
              <Link to={`/merchants/${merchantId}/terminals`}>
                <ATMButton variant="secondary" size="sm" fullWidth icon={Monitor}>
                  Manage Terminals
                </ATMButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </ATMCard>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StandalonePanelsProps {
  merchantId?: string;
  activeToken?: DetailActiveToken | null;
  tokenHistory?: DetailTokenHistoryEntry[] | null;
  isLoading?: boolean;
}

function StandalonePanels({
  merchantId,
  activeToken,
  tokenHistory,
  isLoading,
}: StandalonePanelsProps) {
  // Validity progress for the active token. 2026-08-31: only an APPLIED token has a
  // window (Rule 7) — before that there is no start, no expiry and no countdown, so the
  // card states the purchased duration instead of inventing one. It used to compute the
  // bar from CreatedAt → DateTime.MaxValue and show a ~3.6-million-day countdown.
  const validity = React.useMemo(() => {
    if (!activeToken?.validFromDate || !activeToken?.validToDate) return null;
    const from = new Date(activeToken.validFromDate).getTime();
    const to = new Date(activeToken.validToDate).getTime();
    if (Number.isNaN(from) || Number.isNaN(to)) return null;
    const totalDays = Math.max(1, Math.round((to - from) / 86_400_000));
    const daysRemaining = Math.max(0, Math.ceil((to - Date.now()) / 86_400_000));
    const percent = Math.max(0, Math.min(100, Math.round((daysRemaining / totalDays) * 100)));
    return { totalDays, daysRemaining, percent };
  }, [activeToken]);

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 dark:border-gray-800/80 dark:bg-[#13151a]/95">
            <ATMSkeleton width="45%" height="14px" className="rounded-lg" />
            <div className="mt-4 space-y-3">
              <ATMSkeleton height="16px" width="70%" className="rounded" />
              <ATMSkeleton height="16px" width="50%" className="rounded" />
              <ATMSkeleton height="40px" className="mt-2 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Active Token */}
      <ATMCard title="Active Token" padding="md">
        {activeToken ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Key className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-mono text-xs text-slate-600 dark:text-slate-400">
                    {activeToken.tokenId}
                  </span>
                  <PlanBadge plan={activeToken.plan} />
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {validity && activeToken.validFromDate && activeToken.validToDate
                    ? `${formatDate(activeToken.validFromDate, 'short')} — ${formatDate(activeToken.validToDate, 'short')}`
                    : `${activeToken.validityDays}-day validity · not applied yet`}
                </p>
              </div>
            </div>
            {validity ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    'font-semibold',
                    validity.daysRemaining > 30 ? 'text-emerald-600 dark:text-emerald-400'
                      : validity.daysRemaining > 14 ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400',
                  )}>
                    {validity.daysRemaining} days remaining
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">{validity.totalDays}d total</span>
                </div>
                <ATMProgressBar
                  value={validity.percent}
                  size="sm"
                  variant={validity.percent > 50 ? 'success' : validity.percent > 20 ? 'warning' : 'danger'}
                />
              </div>
            ) : (
              // No countdown before apply — the clock has not started. Stating that beats
              // a progress bar computed from a window that does not exist.
              <p className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400">
                The {activeToken.validityDays}-day window starts when the merchant applies this
                token on their POS. No expiry until then.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <KeyRound className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">No active token.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Issue a recharge token to activate this merchant.</p>
          </div>
        )}
      </ATMCard>

      {/* 2026-08-30: "Renewal Status" card removed with the Token Validity page — its
          isRenewalDue (applied-token expiry <= 30d) ignored unapplied tokens in hand, so
          it flagged well-stocked merchants as due. Coverage truth = Token History below. */}

      {/* Token History */}
      <ATMCard title="Token History" padding="md">
        {tokenHistory && tokenHistory.length > 0 ? (
          <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin pr-1">
            {tokenHistory.map((t) => (
              <div
                key={t.tokenId}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <PlanBadge plan={t.plan} />
                    <TokenStatusBadge status={t.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t.validFromDate && t.validToDate
                      ? `${formatDate(t.validFromDate, 'short')} — ${formatDate(t.validToDate, 'short')} · applied ${formatDate(t.activatedAt!, 'short')}`
                      : `${t.validityDays}-day validity · issued ${formatDate(t.createdAt, 'short')} · not applied`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <History className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">No tokens issued yet.</p>
          </div>
        )}
      </ATMCard>

      {/* Terminals Summary */}
      <div className="sm:col-span-2">
        {merchantId && <TerminalsCard merchantId={merchantId} />}
      </div>
    </div>
  );
}

export default StandalonePanels;
