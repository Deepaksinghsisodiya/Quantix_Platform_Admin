import { useState } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { toast } from 'sonner';
import { Play, RefreshCw, AlertTriangle } from 'lucide-react';
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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Revenue Collections</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Platform-pulled revenue snapshots per Enterprise merchant per period
          </p>
        </div>
        <div className="flex gap-2">
          <ATMButton variant="secondary" disabled={runCollectionPending} onClick={handleRunCollection}>
            <Play className="mr-1 h-4 w-4" /> Run Collection Cycle
          </ATMButton>
          <ATMButton variant="secondary" disabled={runChargePending} onClick={handleRunCharge}>
            <Play className="mr-1 h-4 w-4" /> Run Charge Cycle
          </ATMButton>
          <ATMButton variant="primary" onClick={() => refetch()}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </ATMButton>
        </div>
      </div>

      {/* Filter strip */}
      <ATMCard padding="sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Merchant ID</label>
            <input
              type="text"
              value={merchantIdInput}
              onChange={(e) => setMerchantIdInput(e.target.value)}
              className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="(all merchants)"
            />
          </div>
          <ATMButton
            variant="secondary"
            size="sm"
            onClick={() => setFilter((f) => ({ ...f, merchantId: merchantIdInput || undefined }))}
          >
            Apply
          </ATMButton>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={filter.unchargedOnly ?? false}
              onChange={(e) => setFilter((f) => ({ ...f, unchargedOnly: e.target.checked || undefined }))}
            />
            Uncharged only
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={filter.uninvoicedOnly ?? false}
              onChange={(e) => setFilter((f) => ({ ...f, uninvoicedOnly: e.target.checked || undefined }))}
            />
            Uninvoiced only
          </label>
          {merchantIdInput && (
            <ATMButton
              variant="secondary"
              size="sm"
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
        <div className="flex items-center gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" /> Failed to load collections.
        </div>
      )}

      {/* Table */}
      <ATMCard padding="none">
        {isLoading ? (
          <div className="p-5">
            <ATMSkeleton variant="table-row" count={8} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No collections match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-3 py-2">Merchant</th>
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2 text-right">Revenue</th>
                  <th className="px-3 py-2 text-right">Commission</th>
                  <th className="px-3 py-2 text-right">Tax</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2">Triggered By</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((r: MerchantRevenueCollection) => (
                  <tr key={r.collectionId}>
                    <td className="px-3 py-2">{r.merchantName ?? r.merchantId.slice(0, 8)}</td>
                    <td className="px-3 py-2">
                      {new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-right">{r.revenueAmount.toLocaleString()} {r.currencyCode}</td>
                    <td className="px-3 py-2 text-right">{r.commissionAmount?.toLocaleString() ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{r.taxAmount?.toLocaleString() ?? '—'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{r.chargeTotalCurrency?.toLocaleString() ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{r.triggeredBy}</td>
                    <td className="px-3 py-2">
                      <StatusBadges row={r} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
