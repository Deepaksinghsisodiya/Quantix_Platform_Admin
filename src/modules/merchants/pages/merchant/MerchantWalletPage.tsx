/**
 * Pass 40l/m (2026-05-25) â€” Enterprise merchant wallet page.
 *
 * Styled balance + grace-period card, transactions table, and a Recharge button
 * that opens the PSP-wired RechargeDialog. Standalone merchants are bounced.
 */
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Coins, Gauge, Hourglass, Plus, Wallet } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton, ATMSkeleton, ATMStatsCard } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import {
  useGetSelfProfileQuery,
  useGetSelfWalletQuery,
  useGetSelfWalletTransactionsQuery,
  type MerchantSelfWallet,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import RechargeDialog from './components/RechargeDialog';

// 2026-09-04: the private WalletDto mirror is gone — MerchantSelfWallet (merchantSelfApi) is
// the one typed mirror of the wire, now carrying plannedDailyCharge + runwayBasis.

interface WalletTransactionDto {
  walletTransactionId: string;
  transactionType: string;
  openingBalance: number;
  tokenAmount: number;
  tokenBalanceAfter: number;
  currencyAmount: number | null;
  currencyCode: string | null;
  reason: string | null;
  description: string | null;
  createdAt: string;
}

export default function MerchantWalletPage() {
  const user = useAuthStore((s) => s.user);
  const [rechargeOpen, setRechargeOpen] = useState(false);

  if (user?.role !== 'Merchant') return <Navigate to="/dashboard" replace />;

  const profile = useGetSelfProfileQuery();
  const m = (profile.data?.data ?? null) as MerchantSelfProfile | null;
  const isEnterprise = m?.merchantType === 'Enterprise';

  const wallet = useGetSelfWalletQuery(undefined, {
    skip: !isEnterprise,
  });
  const txns = useGetSelfWalletTransactionsQuery({}, {
    skip: !isEnterprise,
  });

  if (m && !isEnterprise) {
    return (
      <div className="w-full">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#13151a]">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Wallet not applicable</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Standalone merchants don't use a wallet. License tokens are purchased per period via{' '}
            <a href="/merchant/tokens" className="text-primary-600 hover:underline">Tokens</a>.
          </p>
        </div>
      </div>
    );
  }

  const w = wallet.data?.data as MerchantSelfWallet | undefined;
  const rawTxns = txns.data?.data;
  const transactions = Array.isArray(rawTxns) ? (rawTxns as WalletTransactionDto[]) : [];

  const spending = useMemo(() => {
    return transactions
      .filter((t) => t.tokenAmount < 0)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-12);
  }, [transactions]);

  const transactionColumns: ATMTableColumn<WalletTransactionDto>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      renderCell: (_v, t) => (
        <span className="text-slate-600 dark:text-slate-300">
          {new Date(t.createdAt).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'transactionType',
      header: 'Type',
      renderCell: (_v, t) => (
        <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          {t.transactionType}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      renderCell: (_v, t) => (
        <span className="text-slate-600 dark:text-slate-300">{t.description ?? t.reason ?? '—'}</span>
      ),
    },
    {
      key: 'tokenAmount',
      header: 'Tokens',
      align: 'right',
      renderCell: (_v, t) => {
        const isDebit = t.tokenAmount < 0;
        return (
          <span className={`font-mono ${isDebit ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isDebit ? '' : '+'}
            {t.tokenAmount.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'tokenBalanceAfter',
      header: 'Balance',
      align: 'right',
      renderCell: (_v, t) => (
        <span className="font-mono text-slate-700 dark:text-slate-300">{t.tokenBalanceAfter.toFixed(2)}</span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Wallet}
        iconColor="theme"
        title="Wallet"
        subtitle="Subscription is deducted daily; commission is charged at cycle end."
        extraActions={
          <ATMButton onClick={() => setRechargeOpen(true)} variant="primary" icon={Plus}>
            Recharge wallet
          </ATMButton>
        }
      />

      <WalletHero w={w} loading={wallet.isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ATMCard title="Spending pattern" subtitle="Wallet deductions" padding="md">
          {txns.isLoading ? (
            <ATMSkeleton count={4} variant="text" />
          ) : spending.length === 0 ? (
            <p className="py-4 text-sm text-slate-500 dark:text-slate-400">
              No deductions recorded yet.
            </p>
          ) : (
            <SpendingMiniChart rows={spending} />
          )}
        </ATMCard>

        <ATMCard title="Transaction history" subtitle="Recent wallet activity" padding="none" className="overflow-hidden lg:col-span-2">
          <ATMTable columns={transactionColumns} data={transactions} isLoading={txns.isLoading} emptyMessage="No transactions yet." />
        </ATMCard>
      </div>

      <RechargeDialog
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        suggestedTokens={w && w.plannedDailyCharge > 0 ? w.plannedDailyCharge * 30 : undefined}
      />
    </div>
  );
}

/* 2026-09-04: runway used to read "< 1 day" for a freshly funded wallet — the server put 0 in
   projectedDepletionDays whenever no deduction had happened yet. The server now falls back to
   the subscription's daily charge and says which basis it used; the page states it. */

function dailyChargeText(w?: MerchantSelfWallet): string {
  if (!w) return '—';
  const perDay = w.consumptionRatePerDay > 0 ? w.consumptionRatePerDay : w.plannedDailyCharge;
  return perDay > 0 ? `${perDay.toFixed(2)} / day` : '—';
}

function dailyChargeNote(w?: MerchantSelfWallet): string | undefined {
  if (!w) return undefined;
  if (w.consumptionRatePerDay > 0) return 'Measured over the last 30 days';
  if (w.plannedDailyCharge > 0) return 'Your subscription’s daily deduction — no deduction taken yet';
  return 'No subscription charge recorded';
}

function formatRunway(w?: MerchantSelfWallet): string {
  if (!w) return '—';
  if (w.runwayBasis === 'None') return 'No daily charge yet';
  const days = w.projectedDepletionDays;
  if (days < 1) return '< 1 day';
  if (days < 60) return `${days.toFixed(1)} days`;
  return `${(days / 30).toFixed(1)} months`;
}

function runwayNote(w?: MerchantSelfWallet): string | undefined {
  if (!w || w.runwayBasis === 'None') return undefined;
  return w.runwayBasis === 'Usage'
    ? 'At your average daily usage over the last 30 days'
    : 'At your plan’s daily charge';
}

/* ── Balance hero: donut runway gauge + the three headline figures ───────── */

function WalletHero({ w, loading }: { w?: MerchantSelfWallet; loading: boolean }) {
  const dailyRate =
    w && w.consumptionRatePerDay > 0 ? w.consumptionRatePerDay : w?.plannedDailyCharge ?? 0;
  const daysOfCover = dailyRate > 0 && w ? w.tokenBalance / dailyRate : null;

  const tone: 'danger' | 'warn' | 'ok' | 'none' =
    !w || daysOfCover === null
      ? 'none'
      : daysOfCover <= 7
        ? 'danger'
        : daysOfCover <= 14
          ? 'warn'
          : 'ok';

  const graceActive = !!(w && w.gracePeriodPhase && w.gracePeriodPhase !== 'None');

  return (
    <section
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-lg shadow-slate-200/40 dark:bg-[#13151a] sm:p-6',
        graceActive
          ? 'border-amber-200/80 dark:border-amber-900/50'
          : tone === 'danger'
            ? 'border-red-200/80 dark:border-red-900/50'
            : 'border-slate-200/80 dark:border-slate-800',
      )}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <RunwayDonut daysOfCover={daysOfCover} balance={w?.tokenBalance ?? 0} tone={tone} loading={loading} />

        <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          <ATMStatsCard
            label="Token balance"
            value={loading ? '—' : (w?.tokenBalance ?? 0).toFixed(2)}
            icon={Coins}
            variant={graceActive ? 'amber' : tone === 'danger' ? 'rose' : 'accent'}
            description={
              graceActive
                ? `Running low — in ${w?.gracePeriodPhase} grace`
                : 'Available licence tokens'
            }
          />
          <ATMStatsCard
            label="Daily charge"
            value={loading ? '—' : dailyChargeText(w)}
            icon={Gauge}
            variant="indigo"
            description={loading ? undefined : dailyChargeNote(w)}
          />
          <ATMStatsCard
            label="Projected runway"
            value={loading ? '—' : formatRunway(w)}
            icon={Hourglass}
            variant={
              tone === 'danger'
                ? 'rose'
                : tone === 'warn'
                  ? 'amber'
                  : tone === 'ok'
                    ? 'emerald'
                    : 'slate'
            }
            description={loading ? undefined : runwayNote(w)}
          />
        </div>
      </div>

      {graceActive && w?.gracePeriodStartDate && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-300">
          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
          Grace period {w.gracePeriodPhase} since {new Date(w.gracePeriodStartDate).toLocaleDateString()}.
          Recharge to restore full service.
        </div>
      )}
    </section>
  );
}

function RunwayDonut({
  daysOfCover,
  balance,
  tone,
  loading,
}: {
  daysOfCover: number | null;
  balance: number;
  tone: 'danger' | 'warn' | 'ok' | 'none';
  loading: boolean;
}) {
  const HORIZON_DAYS = 30;
  const size = 128;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = daysOfCover === null ? 100 : Math.min(100, (daysOfCover / HORIZON_DAYS) * 100);
  const dash = (pct / 100) * c;

  const strokeColor = {
    danger: 'text-red-500',
    warn: 'text-amber-500',
    ok: 'text-emerald-500',
    none: 'text-slate-400 dark:text-slate-600',
  }[tone];

  const centerValue =
    daysOfCover === null
      ? '∞'
      : daysOfCover >= 60
        ? `${(daysOfCover / 30).toFixed(1)}mo`
        : `${Math.max(0, Math.floor(daysOfCover))}d`;

  return (
    <div className="relative shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Runway gauge">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn('transition-all duration-700', strokeColor)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {loading ? (
          <ATMSkeleton width="48px" height="22px" />
        ) : (
          <>
            <span
              className={cn(
                'text-2xl font-black tabular-nums leading-none',
                tone === 'danger' ? 'text-red-600 dark:text-red-400'
                  : tone === 'warn' ? 'text-amber-600 dark:text-amber-400'
                    : tone === 'ok' ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-300',
              )}
            >
              {centerValue}
            </span>
            <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {daysOfCover === null ? 'no daily charge' : 'days of cover'}
            </span>
          </>
        )}
      </div>
      <p className="mt-1 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        {balance.toFixed(2)} tokens
      </p>
    </div>
  );
}

/* ── Spending mini bar chart, from the transaction stream ────────────────── */

function SpendingMiniChart({ rows }: { rows: readonly WalletTransactionDto[] }) {
  const values = rows.map((t) => Math.abs(t.tokenAmount));
  const max = Math.max(...values, 1);
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last {rows.length} deduct{rows.length === 1 ? '' : 's'}
        </p>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
          ≈ {total.toFixed(2)} tokens
        </p>
      </div>
      <div className="flex h-28 items-end gap-1.5">
        {rows.map((t) => {
          const v = Math.abs(t.tokenAmount);
          const h = Math.max(6, (v / max) * 100);
          return (
            <div
              key={t.walletTransactionId}
              title={`${new Date(t.createdAt).toLocaleDateString()} · −${v.toFixed(2)} tokens`}
              className="group relative flex-1"
            >
              <div
                className="w-full rounded-t-md bg-accent-500/70 transition-colors group-hover:bg-accent-600 dark:bg-accent-500/50 dark:group-hover:bg-accent-400"
                style={{ height: `${h}%` }}
              />
              <span className="mt-1 block truncate text-center text-[9px] font-semibold text-slate-400">
                {new Date(t.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}