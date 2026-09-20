/**
 * Token hooks — 2026-08-29 rebuild (plan-derived tokens, no tiers).
 * Metrics come from the real dashboard endpoint (dashboardApi.useGetTokenMetricsQuery);
 * the former client-computed byTier metrics duplicate was removed.
 */
import {
  useGetAllTokensQuery,
  useGetTokensByMerchantQuery,
  useGetTokenQuery,
  useIssueTokenMutation,
  useBulkGenerateTokensMutation,
  useRevokeTokenMutation,
  useGetTokenActivationsQuery,
  useLazyExportTokensCsvQuery,
  useGetTokenTemplatesQuery,
  useGetTokenTemplateByIdQuery,
  useCreateTokenTemplateMutation,
  useUpdateTokenTemplateMutation,
  useDeactivateTokenTemplateMutation,
  type TokenActivation,
  type TokenTemplate,
} from './tokenApi';
import type { PlanType } from '@/lib/types/platform-enums';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

// ─── List & Detail ─────────────────────────────────────────────────────

export function useAllTokens(params?: { status?: string; from?: string; to?: string }) {
  const { status, from, to } = params ?? {};
  return useGetAllTokensQuery(status || from || to ? { status, from, to } : undefined);
}

export function useTokensByMerchant(merchantId: string | undefined, status?: string) {
  return useGetTokensByMerchantQuery(
    { merchantId: merchantId ?? '', status },
    { skip: !merchantId },
  );
}

export function useToken(id: string | undefined) {
  return useGetTokenQuery(id ?? '', { skip: !id });
}

// ─── Issue / Bulk ──────────────────────────────────────────────────────

export function useIssueToken() {
  const [trigger, result] = useIssueTokenMutation();
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

// 2026-08-30: Expiring hooks removed with the Token Validity page — expiry windows only
// exist for tokens with a recorded apply date, so "expiring" undercounted coverage and
// misdirected renewal chasing. Honest renewal outlook = future Reports module.

// ─── Activations ───────────────────────────────────────────────────────

export function useTokenActivations(params: { merchantId?: string; dateFrom?: string; dateTo?: string } = {}) {
  return useGetTokenActivationsQuery(params);
}

// ─── Export ────────────────────────────────────────────────────────────

export function useExportTokensCsv() {
  const [trigger, result] = useLazyExportTokensCsvQuery();
  return { trigger, ...result };
}

// 2026-08-31: useTokenPricing removed with GET /tokens/pricing (fabricated tier table;
// no screen ever called it). Token cost = DailySubscriptionPrice × ValidityDays.

// 2026-08-30: useSendRenewalReminders removed with the Token Validity page (it blast-
// emailed on the same flawed expiring-window basis).

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

export type { TokenActivation, TokenTemplate };
