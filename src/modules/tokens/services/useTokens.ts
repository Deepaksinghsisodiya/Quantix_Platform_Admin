import {
  useGetTokenHistoryQuery,
  useGetTokenQuery,
  useGenerateTokenMutation,
  useBulkGenerateTokensMutation,
  useRevokeTokenMutation,
  useGetExpiringTokensQuery,
  useGetExpiringByMerchantQuery,
  useGetTokenActivationsQuery,
  useLazyExportTokensCsvQuery,
  useGetTokenPricingQuery,
  useSendRenewalRemindersMutation,
  useGetTokenTemplatesQuery,
  useGetTokenTemplateByIdQuery,
  useCreateTokenTemplateMutation,
  useUpdateTokenTemplateMutation,
  useDeactivateTokenTemplateMutation,
  useGetTokenMetricsQuery,
  type TokenMetrics,
  type TokenActivation,
  type TokenPricingResult,
} from './tokenApi';
import type {
  RechargeToken,
  TokenFilter,
  TokenGenerateRequest,
  BulkTokenRequest,
  TokenTemplate,
} from '@/lib/types';
import type { PaginationParams } from '@/lib/types/common';
import { useFilterStore } from '@/lib/store/filterStore';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

// ─── Token List & Detail ───────────────────────────────────────────────

export function useTokenHistory(params: Partial<TokenFilter & PaginationParams> = {}) {
  const { businessTypeFilter } = useFilterStore();

  /** FRS-SAP-1604: Merge global business type filter into token queries. */
  const mergedParams: Partial<TokenFilter & PaginationParams> = {
    ...params,
    businessNature: businessTypeFilter !== 'All' ? businessTypeFilter : params.businessNature,
  };

  return useGetTokenHistoryQuery(mergedParams);
}

export function useToken(id: string | undefined) {
  return useGetTokenQuery(id ?? '', {
    skip: !id,
  });
}

// ─── Generate ──────────────────────────────────────────────────────────

export function useGenerateToken() {
  const [trigger, result] = useGenerateTokenMutation();
  return wrapMutation(trigger, result);
}

export function useBulkGenerateTokens() {
  const [trigger, result] = useBulkGenerateTokensMutation();
  return wrapMutation(trigger, result);
}

// ─── Revoke ────────────────────────────────────────────────────────────

export function useRevokeToken() {
  const [trigger, result] = useRevokeTokenMutation();
  return wrapMutation(trigger, result);
}

// ─── Expiring Tokens ───────────────────────────────────────────────────

export function useExpiringTokens(daysWindow: number) {
  return useGetExpiringTokensQuery(
    { daysWindow },
    { skip: daysWindow <= 0 }
  );
}

/** Swagger: GET /api/v1/tokens/expiring/by-merchant */
export function useExpiringByMerchant(daysWindow: number) {
  return useGetExpiringByMerchantQuery(
    { daysWindow },
    { skip: daysWindow <= 0 }
  );
}

// ─── Token Activations ─────────────────────────────────────────────────

export function useTokenActivations(params: { merchantId?: string; dateFrom?: string; dateTo?: string } = {}) {
  return useGetTokenActivationsQuery(params);
}

// ─── Export ────────────────────────────────────────────────────────────

/** Returns a lazy trigger for server-side CSV export. */
export function useExportTokensCsv() {
  const [trigger, result] = useLazyExportTokensCsvQuery();
  return { trigger, ...result };
}

// ─── Pricing ───────────────────────────────────────────────────────────

export function useTokenPricing(params: { plan?: string; validityDays?: number; quantity?: number }) {
  return useGetTokenPricingQuery(params);
}

// ─── Renewal Reminders ─────────────────────────────────────────────────

export function useSendRenewalReminders() {
  const [trigger, result] = useSendRenewalRemindersMutation();
  return wrapMutation(trigger, result);
}

// ─── Templates ─────────────────────────────────────────────────────────

export function useTokenTemplates() {
  return useGetTokenTemplatesQuery();
}

export function useTokenTemplateById(id: string | undefined) {
  return useGetTokenTemplateByIdQuery(id ?? '', { skip: !id });
}

export function useCreateTokenTemplate() {
  const [trigger, result] = useCreateTokenTemplateMutation();
  return wrapMutation(trigger, result);
}

export function useUpdateTokenTemplate() {
  const [trigger, result] = useUpdateTokenTemplateMutation();
  return wrapMutation(trigger, result);
}

export function useDeactivateTokenTemplate() {
  const [trigger, result] = useDeactivateTokenTemplateMutation();
  return wrapMutation(trigger, result);
}

// ─── Metrics ───────────────────────────────────────────────────────────

export function useTokenMetrics() {
  return useGetTokenMetricsQuery();
}

export type { TokenMetrics, TokenActivation, TokenPricingResult };
