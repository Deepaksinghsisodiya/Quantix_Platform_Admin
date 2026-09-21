/**
 * Pass 40l/m (2026-05-25) â€” Enterprise merchant wallet page.
 *
 * Styled balance + grace-period card, transactions table, and a Recharge button
 * that opens the PSP-wired RechargeDialog. Standalone merchants are bounced.
 */
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Coins, Gauge, Hourglass, Plus, Wallet } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ATMStatsCard
          label="Token balance"
          value={wallet.isLoading ? <ATMSkeleton width="84px" height="26px" /> : (w?.tokenBalance ?? 0).toFixed(2)}
          icon={Coins}
          variant="accent"
        />
        <ATMStatsCard
          label="Daily charge"
          value={wallet.isLoading ? <ATMSkeleton width="84px" height="26px" /> : dailyChargeText(w)}
          icon={Gauge}
          variant="slate"
          description={dailyChargeNote(w)}
        />
        <ATMStatsCard
          label="Projected runway"
          value={wallet.isLoading ? <ATMSkeleton width="84px" height="26px" /> : formatRunway(w)}
          icon={Hourglass}
          variant={w && w.runwayBasis !== 'None' && w.projectedDepletionDays < 7 ? 'amber' : 'slate'}
          description={runwayNote(w)}
        />
      </div>

      {w?.gracePeriodPhase && w.gracePeriodPhase !== 'None' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 p-4 text-sm">
          <strong className="text-amber-900 dark:text-amber-200">Grace period: {w.gracePeriodPhase}</strong>
          {w.gracePeriodStartDate && (
            <span className="ml-2 text-amber-700 dark:text-amber-300">
              since {new Date(w.gracePeriodStartDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      <ATMCard title="Transaction history" subtitle="Recent wallet activity" padding="none" className="overflow-hidden">
        <ATMTable columns={transactionColumns} data={transactions} isLoading={txns.isLoading} emptyMessage="No transactions yet." />
      </ATMCard>

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