/**
 * 2026-05-17 (Pass 35 Phase F): API client for the new revenue-collection endpoints.
 */
import { get, post } from './client';
import type { ApiResponse } from '@/lib/types/common';
import type { MerchantRevenueCollection, CycleRunResult } from '@/lib/types/revenueCollection';

export interface RevenueCollectionFilter {
  readonly merchantId?: string;
  readonly periodFrom?: string;
  readonly periodTo?: string;
  readonly unchargedOnly?: boolean;
  readonly uninvoicedOnly?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
}

export function getRevenueCollections(filter: RevenueCollectionFilter = {}): Promise<ApiResponse<readonly MerchantRevenueCollection[]>> {
  return get<ApiResponse<readonly MerchantRevenueCollection[]>>(
    '/api/v1/commission/collections',
    filter as unknown as Record<string, string | number | boolean | undefined>,
  );
}

export function triggerCollection(merchantId: string, periodStart?: string, periodEnd?: string): Promise<ApiResponse<MerchantRevenueCollection>> {
  return post<ApiResponse<MerchantRevenueCollection>>('/api/v1/commission/collections/trigger', {
    merchantId, periodStart, periodEnd,
  });
}

export function runCollectionCycle(): Promise<ApiResponse<CycleRunResult>> {
  return post<ApiResponse<CycleRunResult>>('/api/v1/commission/collections/run-cycle');
}

export function runChargeCycle(): Promise<ApiResponse<CycleRunResult>> {
  return post<ApiResponse<CycleRunResult>>('/api/v1/commission/charges/run-cycle');
}
