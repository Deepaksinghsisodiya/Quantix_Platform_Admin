/**
 * Pass 40l/n (2026-05-25) â€” Merchant tokens page.
 *
 * Standalone: list + Buy button → opens TokenPurchaseDialog.
 * Enterprise: read-only list (tokens issued by Platform admin).
 */
import { useState } from 'react';
import {
  useGetSelfProfileQuery,
  useGetSelfTokensQuery,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { useBrandName } from '@/shared/hooks/useBrandName';
import TokenPurchaseDialog from './components/TokenPurchaseDialog';

interface RechargeTokenDto {
  tokenId: string;
  plan: string;
  validityDays: number;
  expiresAt?: string | null;
  status: string;
  sequence: number;
  activatedAt?: string | null;
  priceCurrency: number;
  createdAt: string;
}

export default function MerchantTokensPage() {
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  // 2026-09-04: the Enterprise subtitle named "the Quantix Operations team" regardless of DBA.
  const brandName = useBrandName();

  const profile = useGetSelfProfileQuery();
  const tokens = useGetSelfTokensQuery(undefined);
  const m = (profile.data?.data ?? null) as MerchantSelfProfile | null;
  const isStandalone = m?.merchantType === 'Standalone';

  // 2026-09-02: the permanently-skipped subscription query is gone. It existed to feed a
  // `dailyPrice` into the purchase dialog, but it was hard-skipped (Standalone merchants
  // cannot call /merchant-self/subscription), so the dialog always received null, computed
  // a charge of 0, and every purchase failed server-side with INVALID_PRICE. The dialog now
  // asks GET /merchant-self/tokens/quote for the real price itself.
  const rawRows = tokens.data?.data;
  const rows = Array.isArray(rawRows) ? (rawRows as RechargeTokenDto[]) : [];


  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">License Tokens</h1>
          <p className="mt-1 text-sm text-surface-500">
            {isStandalone
              ? 'Purchase a new license token whenever you need to extend or renew your terminal.'
              : `Tokens issued to your account by the ${brandName} operations team.`}
          </p>
        </div>
        {isStandalone && (
          <button
            type="button"
            onClick={() => setPurchaseOpen(true)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Buy a token
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white dark:bg-surface-800 shadow-sm">
        {tokens.isLoading ? (
          <div className="p-6 text-center text-sm text-surface-500">Loading tokens…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-surface-500">No tokens issued yet.</p>
            {isStandalone && (
              <button
                type="button"
                onClick={() => setPurchaseOpen(true)}
                className="mt-3 text-sm font-medium text-primary-600 hover:underline"
              >
                Buy your first token â†'
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 text-left text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-4 py-3">Seq</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Validity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Activated</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.tokenId}
                    className="border-b border-surface-100 dark:border-surface-700/50 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-surface-500">#{t.sequence}</td>
                    <td className="px-4 py-3 font-medium">{t.plan}</td>
                    <td className="px-4 py-3">{t.validityDays} days</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-surface-600">
                      {t.activatedAt
                        ? new Date(t.activatedAt).toLocaleDateString()
                        : <span className="text-surface-400">Not yet</span>}
                    </td>
                    <td className="px-4 py-3 text-surface-600">
                      {t.expiresAt ? new Date(t.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {t.priceCurrency > 0 ? t.priceCurrency.toFixed(2) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TokenPurchaseDialog
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onPurchased={() => void tokens.refetch()}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
    status === 'Consumed' ? 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300' :
    status === 'Expired' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
    status === 'Revoked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
    'bg-surface-100 text-surface-700';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}
