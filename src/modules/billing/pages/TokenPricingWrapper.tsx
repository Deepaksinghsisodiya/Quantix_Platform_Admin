import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useTokenPricing, useCreateTokenPricing, useUpdateTokenPricing } from '../services/useBilling';
import { TokenPricingView } from './TokenPricingView';

export type Tier = 'Basic' | 'Standard' | 'Advance' | 'Premium';
export type Validity = 30 | 60 | 90 | 180 | 365;

export interface BulkDiscount {
  minQuantity: number;
  discountPercent: number;
}

export interface ScheduledPriceChange {
  id: string;
  tier: Tier;
  validity: Validity;
  currentPrice: number;
  newPrice: number;
  effectiveDate: string;
  createdBy: string;
}

export const TIERS: Tier[] = ['Basic', 'Standard', 'Advance', 'Premium'];
export const VALIDITY_PERIODS: Validity[] = [30, 60, 90, 180, 365];

const FALLBACK_PRICES: Record<Tier, Record<Validity, number>> = {
  Basic:    { 30: 29, 60: 52, 90: 72, 180: 130, 365: 232 },
  Standard: { 30: 49, 60: 89, 90: 125, 180: 225, 365: 399 },
  Advance:  { 30: 79, 60: 145, 90: 199, 180: 359, 365: 639 },
  Premium:  { 30: 129, 60: 235, 90: 325, 180: 589, 365: 1049 },
};

const FALLBACK_BULK_DISCOUNTS: BulkDiscount[] = [
  { minQuantity: 5, discountPercent: 10 },
  { minQuantity: 10, discountPercent: 15 },
  { minQuantity: 25, discountPercent: 20 },
  { minQuantity: 50, discountPercent: 25 },
];

export const TokenPricingWrapper: React.FC = () => {
  const tokenPricingQuery = useTokenPricing();
  const updateTokenPricingMutation = useUpdateTokenPricing();
  const createTokenPricingMutation = useCreateTokenPricing();

  const [editMode, setEditMode] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const serverPrices: Record<Tier, Record<Validity, number>> = useMemo(() => {
    const rows = tokenPricingQuery.data?.data ?? [];
    const grid: Record<Tier, Record<Validity, number>> = JSON.parse(JSON.stringify(FALLBACK_PRICES));
    rows.forEach((row) => {
      const tier = row.tier as Tier;
      const validity = row.validityDays as Validity;
      if (TIERS.includes(tier) && VALIDITY_PERIODS.includes(validity)) {
        grid[tier][validity] = row.price;
      }
    });
    return grid;
  }, [tokenPricingQuery.data]);

  const [prices, setPrices] = useState<Record<Tier, Record<Validity, number>>>(serverPrices);

  useEffect(() => {
    if (!editMode) setPrices(serverPrices);
  }, [serverPrices, editMode]);

  const bulkDiscounts: BulkDiscount[] = useMemo(() => {
    const rows = tokenPricingQuery.data?.data ?? [];
    const first = rows.find((r) => r.bulkDiscounts && r.bulkDiscounts.length > 0);
    if (first) return first.bulkDiscounts.map((d) => ({ ...d }));
    return FALLBACK_BULK_DISCOUNTS;
  }, [tokenPricingQuery.data]);

  useEffect(() => {
    const rows = tokenPricingQuery.data?.data ?? [];
    const first = rows[0];
    if (first?.currency) {
      setCurrency(first.currency);
    }
  }, [tokenPricingQuery.data]);

  const handlePriceChange = (tier: Tier, validity: Validity, value: string) => {
    const num = parseFloat(value) || 0;
    setPrices((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [validity]: num,
      },
    }));
  };

  const handleSave = () => {
    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    try {
      const rows = tokenPricingQuery.data?.data ?? [];
      const updatePromises: Promise<any>[] = [];

      TIERS.forEach((tier) => {
        VALIDITY_PERIODS.forEach((validity) => {
          const price = prices[tier][validity];
          const existingRow = rows.find(
            (r) => r.tier === tier && r.validityDays === validity
          );

          if (existingRow) {
            updatePromises.push(
              updateTokenPricingMutation.mutateAsync({
                id: existingRow.id,
                tier,
                validityDays: validity,
                price,
                currency,
                bulkDiscounts,
              })
            );
          } else {
            updatePromises.push(
              createTokenPricingMutation.mutateAsync({
                tier,
                validityDays: validity,
                price,
                currency,
                bulkDiscounts,
              })
            );
          }
        });
      });

      await Promise.all(updatePromises);
      toast.success('Token pricing updated successfully!');
    } catch (err: any) {
      toast.error('Saved prices locally. Failed to update all server tiers.');
    } finally {
      setConfirmOpen(false);
      setEditMode(false);
    }
  };

  return (
    <TokenPricingView
      prices={prices}
      serverPrices={serverPrices}
      editMode={editMode}
      setEditMode={setEditMode}
      currency={currency}
      setCurrency={setCurrency}
      confirmOpen={confirmOpen}
      setConfirmOpen={setConfirmOpen}
      bulkDiscounts={bulkDiscounts}
      isLoading={tokenPricingQuery.isLoading}
      isError={tokenPricingQuery.isError}
      refetch={tokenPricingQuery.refetch}
      handlePriceChange={handlePriceChange}
      handleSave={handleSave}
      confirmSave={confirmSave}
      isSaving={updateTokenPricingMutation.isPending || createTokenPricingMutation.isPending}
    />
  );
};
