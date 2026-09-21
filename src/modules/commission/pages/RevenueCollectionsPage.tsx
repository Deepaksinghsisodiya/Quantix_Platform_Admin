import { useState } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { toast } from 'sonner';
import { Play, RefreshCw, AlertTriangle, ReceiptText } from 'lucide-react';
import {
  useGetRevenueCollectionsQuery,
  useTriggerCollectionMutation,
  useRunCollectionCycleMutation,
  useRunChargeCycleMutation,
} from '@/modules/commission/services/commissionApi';
import type { RevenueCollectionFilter } from '@/lib/api/revenueCollection';
import type { MerchantRevenueCollection } from '@/lib/types/revenueCollection';

/**
 * 2026-05-17 (Pass 35 Phase F): Operator view of every merchant-period revenue snapshot,
 * with status indicators for each lifecycle stage (collected → charged → invoiced).
 * Provides operator-fired triggers for the full cycle and per-merchant collection.
 */
export function RevenueCollectionsPage() {
  const [filter, setFilter] = useState<RevenueCollectionFilter>({ pageSize: 50 });
  const [merchantIdInput, setMerchantIdInput] = useState('');

  const { data, isLoading, isError, refetch } = useGetRevenueCollectionsQuery(filter);

  const [runCollectionCycle, { isLoading: runCollectionPending }] = useRunCollectionCycleMutation();
  const [runChargeCycle, { isLoading: runChargePending }] = useRunChargeCycleMutation();
  const [triggerCollection, { isLoading: triggerOnePending }] = useTriggerCollectionMutation();

  const handleRunCollection = async () => {
    try {
      const res = await runCollectionCycle().unwrap();
      toast.success(`Collection cycle: ${res.data?.successCount} ok / ${res.data?.failureCount} failed / ${res.data?.skippedCount} skipped`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Collection cycle failed');
    }
  };

  const handleRunCharge = async () => {
    try {
      const res = await runChargeCycle().unwrap();
      toast.success(`Charge cycle: ${res.data?.successCount} ok / ${res.data?.failureCount} failed / ${res.data?.skippedCount} skipped`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Charge cycle failed');
    }
  };

  const handleTriggerOne = async (merchantId: string) => {
    try {
      await triggerCollection({ merchantId }).unwrap();
      toast.success('Collection triggered');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Trigger failed');
    }
  };

  const rows = data?.data ?? [];

  const columns: ATMTableColumn<MerchantRevenueCollection>[] = [
    {
      key: 'merchantName',
      header: 'Merchant',
      renderCell: (_v, r) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {r.merchantName ?? r.merchantId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'periodStart',
      header: 'Period',
      renderCell: (_v, r) => (
        <span className="text-slate-600 dark:text-slate-300">
          {new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'revenueAmount',
      header: 'Revenue',
      align: 'right',
      renderCell: (_v, r) => (
        <span className="text-slate-700 dark:text-slate-300">
          {r.revenueAmount.toLocaleString()} {r.currencyCode}
        </span>
      ),
    },
    {
      key: 'commissionAmount',
      header: 'Commission',
      align: 'right',
      renderCell: (_v, r) => (
        <span className="text-slate-700 dark:text-slate-300">{r.commissionAmount?.toLocaleString() ?? '—'}</span>
      ),
    },
    {
      key: 'taxAmount',
      header: 'Tax',
      align: 'right',
      renderCell: (_v, r) => (
        <span className="text-slate-700 dark:text-slate-300">{r.taxAmount?.toLocaleString() ?? '—'}</span>
      ),
    },
    {
      key: 'chargeTotalCurrency',
      header: 'Total',
      align: 'right',
      renderCell: (_v, r) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {r.chargeTotalCurrency?.toLocaleString() ?? '—'}
        </span>
      ),
    },
    {
      key: 'triggeredBy',
      header: 'Triggered By',
      renderCell: (_v, r) => <span className="text-xs text-slate-500 dark:text-slate-400">{r.triggeredBy}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, r) => <StatusBadges row={r} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={ReceiptText}
        iconColor="theme"
        title="Revenue Collections"
        subtitle="Platform-pulled revenue snapshots per Enterprise merchant per period"
        action={{ label: 'Run Collection Cycle', onClick: handleRunCollection, icon: Play }}
        secondaryAction={{ label: 'Run Charge Cycle', onClick: handleRunCharge, icon: Play }}
        extraActions={
          <>
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white/70 px-3 text-[13px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
              <ReceiptText className="h-3.5 w-3.5 text-primary-500" /> {rows.length} snapshots
            </span>
            <ATMButton variant="secondary" icon={RefreshCw} onClick={() => refetch()}>
              Refresh
            </ATMButton>
          </>
        }
      />

      {/* Filter strip */}
      <ATMCard padding="sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Merchant ID
            </label>
            <input
              type="text"
              value={merchantIdInput}
              onChange={(e) => setMerchantIdInput(e.target.value)}
              className="h-9 w-52 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600"
              placeholder="(all merchants)"
            />
          </div>
          <ATMButton
            variant="secondary"
            onClick={() => setFilter((f) => ({ ...f, merchantId: merchantIdInput || undefined }))}
          >
            Apply
          </ATMButton>
          <label className="flex h-9 cursor-pointer items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={filter.unchargedOnly ?? false}
              onChange={(e) => setFilter((f) => ({ ...f, unchargedOnly: e.target.checked || undefined }))}
              className="h-4 w-4 rounded border-slate-300 accent-primary-600"
            />
            Uncharged only
          </label>
          <label className="flex h-9 cursor-pointer items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={filter.uninvoicedOnly ?? false}
              onChange={(e) => setFilter((f) => ({ ...f, uninvoicedOnly: e.target.checked || undefined }))}
              className="h-4 w-4 rounded border-slate-300 accent-primary-600"
            />
            Uninvoiced only
          </label>
          {merchantIdInput && (
            <ATMButton
              variant="secondary"
              disabled={triggerOnePending}
              onClick={() => handleTriggerOne(merchantIdInput)}
            >
              Trigger collection for this merchant
            </ATMButton>
          )}
        </div>
      </ATMCard>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" /> Failed to load collections.
        </div>
      )}

      {/* Table */}
      <ATMCard padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <ATMSkeleton variant="table-row" count={8} />
          </div>
        ) : (
          <ATMTable
            columns={columns}
            data={rows}
            emptyMessage="No collections match the current filter."
          />
        )}
      </ATMCard>
    </div>
  );
}

function StatusBadges({ row }: { row: MerchantRevenueCollection }) {
  return (
    <div className="flex flex-wrap gap-1">
      <ATMBadge variant="success" size="sm">Collected</ATMBadge>
      {row.acknowledgedByCloud && <ATMBadge variant="info" size="sm">Acked</ATMBadge>}
      {row.chargedAt ? <ATMBadge variant="success" size="sm">Charged</ATMBadge> : <ATMBadge variant="warning" size="sm">Awaiting Charge</ATMBadge>}
      {row.invoicedAt ? <ATMBadge variant="success" size="sm">Invoiced</ATMBadge> : (row.chargedAt && <ATMBadge variant="warning" size="sm">Awaiting Invoice</ATMBadge>)}
    </div>
  );
}

export default RevenueCollectionsPage;