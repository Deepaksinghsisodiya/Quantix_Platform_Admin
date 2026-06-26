import {
  useGetTokenHistoryQuery,
  useGetTokenQuery,
  useGenerateTokenMutation,
  useBulkGenerateTokensMutation,
  useRevokeTokenMutation,
  useGetExpiringTokensQuery,
  useGetTokenTemplatesQuery,
  useGetTokenMetricsQuery,
  useRenewTokenMutation,
  type TokenMetrics,
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

export function useGenerateToken() {
  const [trigger, result] = useGenerateTokenMutation();
  return wrapMutation(trigger, result);
}

export function useBulkGenerateTokens() {
  const [trigger, result] = useBulkGenerateTokensMutation();
  return wrapMutation(trigger, result);
}

export function useRevokeToken() {
  const [trigger, result] = useRevokeTokenMutation();
  return wrapMutation(trigger, result);
}

export function useExpiringTokens(daysWindow: number) {
  return useGetExpiringTokensQuery(
    { daysWindow },
    { skip: daysWindow <= 0 }
  );
}

export function useTokenTemplates() {
  return useGetTokenTemplatesQuery();
}

export function useTokenMetrics() {
  return useGetTokenMetricsQuery();
}

/** FRS-SAP-1407: Renew an expiring token with a new validity period. */
export function useRenewToken() {
  const [trigger, result] = useRenewTokenMutation();
  return wrapMutation(trigger, result);
}
export type { TokenMetrics };

