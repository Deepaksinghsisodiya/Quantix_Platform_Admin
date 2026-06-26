import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/config/routes';
import { sendRenewalReminder, sendBulkRenewalReminders } from '@/lib/api/tokens';
import { useExpiringTokens } from '../services/useTokens';
import type { TokenTier, RechargeToken } from '@/lib/types';
import { TokenValidityPage, MerchantValidity } from './TokenValidityPage';

const TIER_RENEWAL_PRICE: Record<TokenTier, number> = {
  Basic: 79,
  Standard: 149,
  Advance: 299,
  Premium: 499,
};

function adaptToValidity(tokens: readonly RechargeToken[]): MerchantValidity[] {
  const now = Date.now();
  const byMerchant = new Map<string, MerchantValidity>();

  for (const t of tokens) {
    const validToMs = new Date(t.validTo).getTime();
    const daysRemaining = Math.max(0, Math.ceil((validToMs - now) / 86_400_000));

    let status: MerchantValidity['status'];
    if (daysRemaining <= 0) status = 'Expired';
    else if (daysRemaining <= 7) status = 'Critical';
    else if (daysRemaining <= 30) status = 'Warning';
    else status = 'Healthy';

    const renewalPrice = t.priceAtGeneration ?? TIER_RENEWAL_PRICE[t.tier] ?? 0;

    const existing = byMerchant.get(t.merchantId);
    if (!existing) {
      byMerchant.set(t.merchantId, {
        id: t.merchantId,
        merchantName: t.merchantName,
        activeTokens: 1,
        earliestExpiry: t.validTo,
        tier: t.tier,
        daysRemaining,
        status,
        renewalPrice,
      });
    } else {
      existing.activeTokens += 1;
      if (validToMs < new Date(existing.earliestExpiry).getTime()) {
        existing.earliestExpiry = t.validTo;
        existing.tier = t.tier;
        existing.daysRemaining = daysRemaining;
        existing.status = status;
        existing.renewalPrice = renewalPrice;
      }
    }
  }

  return Array.from(byMerchant.values()).sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export const TokenValidityWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [sendingReminders, setSendingReminders] = useState(false);

  const { data, isLoading, isError, refetch } = useExpiringTokens(90);
  const tokens = data?.data ?? [];
  const merchants = useMemo(() => adaptToValidity(tokens), [tokens]);

  const expiring7 = useMemo(() => merchants.filter((t) => t.daysRemaining > 0 && t.daysRemaining <= 7).length, [merchants]);
  const expiring14 = useMemo(() => merchants.filter((t) => t.daysRemaining > 7 && t.daysRemaining <= 14).length, [merchants]);
  const expiring30 = useMemo(() => merchants.filter((t) => t.daysRemaining > 14 && t.daysRemaining <= 30).length, [merchants]);

  const projectedRevenue = useMemo(() => {
    return merchants
      .filter((t) => t.daysRemaining <= 30)
      .reduce((sum, t) => sum + t.renewalPrice, 0);
  }, [merchants]);

  const handleRenew = useCallback((merchant: MerchantValidity) => {
    const params = new URLSearchParams({
      merchantId: merchant.id,
      tier: merchant.tier,
    });
    navigate(`${ROUTES.TOKENS.GENERATE}?${params.toString()}`);
  }, [navigate]);

  const handleSendReminder = useCallback(async (merchant: MerchantValidity) => {
    try {
      await sendRenewalReminder(merchant.id);
      toast.success(`Renewal reminder sent to ${merchant.merchantName}`);
    } catch {
      toast.error(`Failed to send reminder to ${merchant.merchantName}`);
    }
  }, []);

  const handleBulkReminders = useCallback(async () => {
    setSendingReminders(true);
    try {
      const res = await sendBulkRenewalReminders(30);
      toast.success(`Renewal reminders sent to ${res.data.sentCount} merchants expiring within 30 days`);
    } catch {
      toast.error('Failed to send bulk renewal reminders');
    } finally {
      setSendingReminders(false);
    }
  }, []);

  const dueMerchantsCount = useMemo(() => {
    return merchants.filter((t) => t.daysRemaining <= 30 && t.daysRemaining > 0).length;
  }, [merchants]);

  return (
    <TokenValidityPage
      merchants={merchants}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      expiring7={expiring7}
      expiring14={expiring14}
      expiring30={expiring30}
      projectedRevenue={projectedRevenue}
      dueMerchantsCount={dueMerchantsCount}
      onRenew={handleRenew}
      onSendReminder={handleSendReminder}
      onBulkReminders={handleBulkReminders}
      sendingReminders={sendingReminders}
    />
  );
};

export default TokenValidityWrapper;
