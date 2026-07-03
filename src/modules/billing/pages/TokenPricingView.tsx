import React from 'react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import {
  Pencil,
  Plus,
  Save,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { TIERS, VALIDITY_PERIODS } from './TokenPricingWrapper';
import type { Tier, Validity, BulkDiscount } from './TokenPricingWrapper';

interface TokenPricingViewProps {
  prices: Record<Tier, Record<Validity, number>>;
  serverPrices: Record<Tier, Record<Validity, number>>;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  bulkDiscounts: BulkDiscount[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  handlePriceChange: (tier: Tier, validity: Validity, value: string) => void;
  handleSave: () => void;
  confirmSave: () => void;
  isSaving: boolean;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR'];

// Mock scheduled changes retained
const MOCK_SCHEDULED_CHANGES = [
  { id: 'spc-1', tier: 'Standard', validity: 90, currentPrice: 125, newPrice: 119, effectiveDate: '2026-04-15', createdBy: 'Sarah Chen' },
  { id: 'spc-2', tier: 'Premium', validity: 365, currentPrice: 1049, newPrice: 999, effectiveDate: '2026-05-01', createdBy: 'James Kim' },
];

export const TokenPricingView: React.FC<TokenPricingViewProps> = ({
  prices,
  serverPrices,
  editMode,
  setEditMode,
  currency,
  setCurrency,
  confirmOpen,
  setConfirmOpen,
  bulkDiscounts,
  isLoading,
  isError,
  refetch,
  handlePriceChange,
  handleSave,
  confirmSave,
  isSaving,
}) => {
  return (
    <div className="space-y-6 p-6 lg:p-8 pb-10 animate-fade-in w-full">
      {/* Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-2">
            <span>Token Pricing</span>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
          </div>
        }
        subtitle="Manage recharge token prices for Standalone merchants"
        extraActions={
          <div className="flex items-center gap-3">
            <ATMSelectField
              name="currency"
              value={currency}
              onChange={(val) => setCurrency(val ? String(val) : 'USD')}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              size="sm"
              className="w-[100px]"
            />
            {editMode ? (
              <div className="flex items-center gap-2">
                <ATMButton
                  variant="outline"
                  size="md"
                  icon={X}
                  onClick={() => { setEditMode(false); }}
                >
                  Cancel
                </ATMButton>
                <ATMButton
                  variant="primary"
                  size="md"
                  icon={Save}
                  onClick={handleSave}
                >
                  Save Changes
                </ATMButton>
              </div>
            ) : (
              <ATMButton
                variant="primary"
                size="md"
                icon={Pencil}
                onClick={() => setEditMode(true)}
              >
                Edit Prices
              </ATMButton>
            )}
          </div>
        }
      />

      {/* Error banner */}
      {isError && (
        <ATMCard>
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Failed to load token pricing.
            </p>
            <ATMButton
              variant="primary"
              size="sm"
              onClick={refetch}
              icon={RefreshCw}
            >
              Retry
            </ATMButton>
          </div>
        </ATMCard>
      )}

      {/* Pricing Matrix */}
      <ATMCard title="Pricing Matrix" extra={<span className="text-xs text-gray-500 dark:text-gray-400">Prices in {currency}</span>}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <ATMSkeleton key={i} height="40px" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    Tier
                  </th>
                  {VALIDITY_PERIODS.map((v) => (
                    <th key={v} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                      {v} Days
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {TIERS.map((tier) => (
                  <tr key={tier} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="whitespace-nowrap px-4 py-3">
                      <ATMBadge
                        label={tier}
                        color={tier === 'Basic' ? 'gray' : tier === 'Standard' ? 'primary' : tier === 'Advance' ? 'purple' : 'warning'}
                      />
                    </td>
                    {VALIDITY_PERIODS.map((validity) => (
                      <td key={validity} className="px-4 py-3 text-center">
                        {editMode ? (
                          <ATMTextField
                            name={`price-${tier}-${validity}`}
                            type="number"
                            value={prices[tier]?.[validity]?.toString() ?? ''}
                            onChange={(e) => handlePriceChange(tier, validity, e.target.value)}
                            step="0.01"
                            min="0"
                            className="w-24 mx-auto !gap-0 text-center"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(prices[tier]?.[validity] ?? 0, currency)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>

      {/* Bulk Discounts */}
      <ATMCard title="Bulk Discounts" extra={<span className="text-xs text-gray-500 dark:text-gray-400">Applied at checkout</span>}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <ATMSkeleton key={i} height="40px" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    Minimum Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    Example Savings (Standard 90d)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bulkDiscounts.map((discount) => {
                  const basePrice = prices.Standard?.[90] ?? 0;
                  const savings = basePrice * discount.minQuantity * (discount.discountPercent / 100);
                  return (
                    <tr key={discount.minQuantity} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {discount.minQuantity}+ tokens
                      </td>
                      <td className="px-4 py-3">
                        <ATMBadge label={`${discount.discountPercent}% off`} color="success" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        Save {formatCurrency(savings, currency)} on {discount.minQuantity} tokens
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>

      {/* Scheduled Price Changes */}
      <ATMCard
        title="Scheduled Price Changes"
        extra={
          <ATMButton
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => {}}
          >
            Schedule Change
          </ATMButton>
        }
      >
        {MOCK_SCHEDULED_CHANGES.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No scheduled price changes.</p>
        ) : (
          <div className="space-y-3">
            {MOCK_SCHEDULED_CHANGES.map((change) => (
              <div key={change.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-850 dark:bg-gray-900">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {change.tier} / {change.validity}d: {formatCurrency(change.currentPrice, currency)} → {formatCurrency(change.newPrice, currency)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Effective: {change.effectiveDate} · Created by {change.createdBy}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ATMBadge label="Scheduled" color="warning" />
                  <ATMButton
                    variant="ghost"
                    size="sm"
                    icon={X}
                    className="text-red-500"
                    onClick={() => {}}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ATMCard>

      {/* Confirm Modal */}
      <ATMModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Price Changes"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <ATMButton
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </ATMButton>
            <ATMButton
              variant="primary"
              onClick={confirmSave}
              isLoading={isSaving}
            >
              Confirm & Save
            </ATMButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Updated prices will apply to all new token purchases immediately. Existing tokens are not affected.
            </p>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-355">
            Are you sure you want to save these pricing changes?
          </p>
        </div>
      </ATMModal>
    </div>
  );
};
