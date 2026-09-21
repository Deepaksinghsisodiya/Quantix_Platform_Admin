/**
 * Pass 40l/n (2026-05-25) â€” Merchant tokens page.
 *
 * Standalone: list + Buy button → opens TokenPurchaseDialog.
 * Enterprise: read-only list (tokens issued by Platform admin).
 */
import { useState } from 'react';
import { Key, Plus } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
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

  const columns: ATMTableColumn<RechargeTokenDto>[] = [
    {
      key: 'sequence',
      header: 'Seq',
      renderCell: (_v, t) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">#{t.sequence}</span>,
    },
    {
      key: 'plan',
      header: 'Plan',
      renderCell: (_v, t) => <span className="font-medium text-slate-900 dark:text-slate-100">{t.plan}</span>,
    },
    { key: 'validityDays', header: 'Validity', renderCell: (_v, t) => <span className="text-slate-600 dark:text-slate-300">{t.validityDays} days</span> },
    { key: 'status', header: 'Status', renderCell: (_v, t) => <StatusBadge status={t.status} /> },
    {
      key: 'activatedAt',
      header: 'Activated',
      renderCell: (_v, t) => (
        <span className="text-slate-600 dark:text-slate-300">
          {t.activatedAt
            ? new Date(t.activatedAt).toLocaleDateString()
            : <span className="text-slate-400 dark:text-slate-500">Not yet</span>}
        </span>
      ),
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      renderCell: (_v, t) => (
        <span className="text-slate-600 dark:text-slate-300">
          {t.expiresAt ? new Date(t.expiresAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'priceCurrency',
      header: 'Price',
      align: 'right',
      renderCell: (_v, t) => (
        <span className="font-mono text-slate-900 dark:text-slate-100">
          {t.priceCurrency > 0 ? t.priceCurrency.toFixed(2) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Key}
        iconColor="theme"
        title="License Tokens"
        subtitle={
          isStandalone
            ? 'Purchase a new license token whenever you need to extend or renew your terminal.'
            : `Tokens issued to your account by the ${brandName} operations team.`
        }
        extraActions={
          isStandalone ? (
            <ATMButton onClick={() => setPurchaseOpen(true)} variant="primary" icon={Plus}>
              Buy a token
            </ATMButton>
          ) : undefined
        }
      />

      <ATMCard padding="none" className="overflow-hidden">
        <ATMTable
          columns={columns}
          data={rows}
          isLoading={tokens.isLoading}
          emptyMessage="No tokens issued yet."
          onEmptyAction={isStandalone ? () => setPurchaseOpen(true) : undefined}
          emptyActionLabel={isStandalone ? 'Buy your first token' : undefined}
        />
      </ATMCard>

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
    status === 'Consumed' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
    status === 'Expired' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
    status === 'Revoked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
    'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}