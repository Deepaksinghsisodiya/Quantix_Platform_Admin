/**
 * Pass 40l/m (2026-05-25) â€” Enterprise merchant wallet page.
 *
 * Styled balance + grace-period card, transactions table, and a Recharge button
 * that opens the PSP-wired RechargeDialog. Standalone merchants are bounced.
 */
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/authStore';
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
        <h1 className="text-xl font-semibold">Wallet not applicable</h1>
        <p className="mt-2 text-sm text-surface-500">
          Standalone merchants don't use a wallet. License tokens are purchased per period via{' '}
          <a href="/merchant/tokens" className="text-primary-600 hover:underline">Tokens</a>.
        </p>
      </div>
    );
  }

  const w = wallet.data?.data as MerchantSelfWallet | undefined;
  const rawTxns = txns.data?.data;
  const transactions = Array.isArray(rawTxns) ? (rawTxns as WalletTransactionDto[]) : [];

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Wallet</h1>
          <p className="mt-1 text-sm text-surface-500">
            Subscription is deducted daily; commission is charged at cycle end.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRechargeOpen(true)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Recharge wallet
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Token balance" value={wallet.isLoading ? '…' : (w?.tokenBalance ?? 0).toFixed(2)} accent="primary" />
        <StatCard
          label="Daily charge"
          value={wallet.isLoading ? '…' : dailyChargeText(w)}
          note={dailyChargeNote(w)}
        />
        <StatCard
          label="Projected runway"
          value={wallet.isLoading ? '…' : formatRunway(w)}
          note={runwayNote(w)}
          accent={w && w.runwayBasis !== 'None' && w.projectedDepletionDays < 7 ? 'warning' : 'default'}
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

      <div className="rounded-xl bg-white dark:bg-surface-800 shadow-sm">
        <div className="border-b border-surface-200 dark:border-surface-700 p-4">
          <h2 className="text-sm font-semibold">Transaction history</h2>
          <p className="mt-1 text-xs text-surface-500">Recent wallet activity</p>
        </div>
        {txns.isLoading ? (
          <div className="p-6 text-center text-sm text-surface-500">Loading transactions…</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-sm text-surface-500">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 text-left text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Tokens</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const isDebit = t.tokenAmount < 0;
                  return (
                    <tr
                      key={t.walletTransactionId}
                      className="border-b border-surface-100 dark:border-surface-700/50 last:border-0"
                    >
                      <td className="px-4 py-3 text-surface-600">
                        {new Date(t.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-surface-100 dark:bg-surface-700 px-2 py-0.5 text-xs">
                          {t.transactionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-surface-600">
                        {t.description ?? t.reason ?? '—'}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono ${
                          isDebit ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {isDebit ? '' : '+'}
                        {t.tokenAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-surface-700">
                        {t.tokenBalanceAfter.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RechargeDialog
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        suggestedTokens={w && w.plannedDailyCharge > 0 ? w.plannedDailyCharge * 30 : undefined}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  accent = 'default',
}: {
  label: string;
  value: string;
  note?: string;
  accent?: 'default' | 'primary' | 'warning';
}) {
  const accentClass = {
    default: 'text-surface-900 dark:text-surface-100',
    primary: 'text-primary-600',
    warning: 'text-amber-600',
  }[accent];
  return (
    <div className="rounded-xl bg-white dark:bg-surface-800 p-4 shadow-sm">
      <p className="text-sm text-surface-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accentClass}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-surface-500">{note}</p>}
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
