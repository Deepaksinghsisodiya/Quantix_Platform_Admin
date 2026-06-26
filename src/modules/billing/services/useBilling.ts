/**
 * Billing and subscription plan hooks backed by RTK Query.
 */

import {
  useGetBillingDashboardQuery,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useGetPlansQuery,
  useCreatePlanMutation,
  useGetTokenPricingQuery,
  useUpdateTokenPricingMutation,
  useMarkInvoicePaidMutation,
  useRetryPaymentMutation,
  useSendPaymentReminderMutation,
  useCreditWalletAllocationMutation,
  useCreateTokenInvoiceMutation,
  useRecordManualPaymentMutation,
  useSettleCommissionMutation,
  type BillingDashboard,
  type InvoiceListParams,
  type CreatePlanDto,
  type UpdateTokenPricingDto,
} from './billingApi';
import type { Invoice, SubscriptionPlan, TokenPricing } from '@/lib/types';
import { useFilterStore } from '@/lib/store/filterStore';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useBillingDashboard() {
  return useGetBillingDashboardQuery();
}

export function useInvoices(params: InvoiceListParams = {}) {
  const { merchantTypeFilter } = useFilterStore();

  /** FRS-SAP-1601: Merge global merchant type filter into invoice queries. */
  const mergedParams: InvoiceListParams = {
    ...params,
    ...(merchantTypeFilter !== 'All' ? { merchantType: merchantTypeFilter } : {}),
  };

  return useGetInvoicesQuery(mergedParams);
}

export function useInvoice(id: string | undefined) {
  return useGetInvoiceQuery(id ?? '', {
    skip: !id,
  });
}

export function usePlans() {
  return useGetPlansQuery();
}

export function useCreatePlan() {
  const [trigger, result] = useCreatePlanMutation();
  return wrapMutation(trigger, result);
}

export function useTokenPricing() {
  return useGetTokenPricingQuery();
}

export function useUpdateTokenPricing() {
  const [trigger, result] = useUpdateTokenPricingMutation();
  return wrapMutation(trigger, result);
}

// ---------------------------------------------------------------------------
// PF-06: Enterprise Billing Cycle hooks
// ---------------------------------------------------------------------------

/** Mark an invoice as Paid. */
export function useMarkInvoicePaid() {
  const [trigger, result] = useMarkInvoicePaidMutation();
  return wrapMutation(trigger, result);
}

/** Retry payment for an overdue invoice (3 attempts, 24h apart). */
export function useRetryPayment() {
  const [trigger, result] = useRetryPaymentMutation();
  return wrapMutation(trigger, result);
}

/** Send payment reminder email for an overdue invoice. */
export function useSendPaymentReminder() {
  const [trigger, result] = useSendPaymentReminderMutation();
  return wrapMutation(trigger, result);
}

/** Credit monthly token allocation to Enterprise merchant wallet. */
export function useCreditWalletAllocation() {
  const [trigger, result] = useCreditWalletAllocationMutation();
  return wrapMutation(trigger, result);
}

/** PF-07: Create a TokenPurchase invoice after token generation. */
export function useCreateTokenInvoice() {
  const [trigger, result] = useCreateTokenInvoiceMutation();
  return wrapMutation(trigger, result);
}

/** PF-07: Record manual payment for a token invoice. */
export function useRecordManualPayment() {
  const [trigger, result] = useRecordManualPaymentMutation();
  return wrapMutation(trigger, result);
}

/** Generate and settle commission for a merchant billing period. */
export function useSettleCommission() {
  const [trigger, result] = useSettleCommissionMutation();
  return wrapMutation(trigger, result);
}

export type { BillingDashboard };
