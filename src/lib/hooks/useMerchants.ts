import { useCallback } from 'react';
import {
  useGetMerchantsQuery,
  useGetMerchantQuery,
  useActivateMerchantMutation,
  useSuspendMerchantMutation,
  useReactivateMerchantWithResolutionMutation,
  useRetryProvisioningMutation,
  useChangePlanMutation,
  useGetMerchantTimelineQuery,
} from '@/modules/merchants/services/merchantApi';
import type { MerchantFilter, MerchantCreateEnterprise, MerchantCreateStandalone } from '@/lib/types';
import type { PaginationParams } from '@/lib/types/common';
import { useFilterStore } from '@/lib/store/filterStore';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useMerchants(params: Partial<MerchantFilter & PaginationParams> = {}) {
  const { merchantTypeFilter, businessTypeFilter } = useFilterStore();

  const mergedParams: MerchantFilter & Partial<PaginationParams> = {
    ...params,
    merchantType: params.merchantType ?? (merchantTypeFilter !== 'All' ? merchantTypeFilter : undefined),
    businessNature: params.businessNature ?? (businessTypeFilter !== 'All' ? businessTypeFilter : undefined),
  };

  return useGetMerchantsQuery(mergedParams);
}

export function useMerchant(id: string | undefined) {
  return useGetMerchantQuery(id ?? '', {
    skip: !id,
  });
}

export function useActivateMerchant() {
  const [trigger, result] = useActivateMerchantMutation();
  return wrapMutation(trigger, result);
}

export function useSuspendMerchant() {
  const [trigger, result] = useSuspendMerchantMutation();
  const adaptedTrigger = useCallback(
    async ({ merchantId, reason }: { merchantId: string; reason: string }) => {
      return await trigger({ id: merchantId, reason });
    },
    [trigger]
  );
  return wrapMutation(adaptedTrigger as any, result);
}

export function useReactivateMerchant() {
  const [trigger, result] = useReactivateMerchantWithResolutionMutation();
  const adaptedTrigger = useCallback(
    async ({ merchantId, resolution }: { merchantId: string; resolution: string }) => {
      return await trigger({ id: merchantId, resolution });
    },
    [trigger]
  );
  return wrapMutation(adaptedTrigger as any, result);
}

// 2026-08-30: useCancelMerchant/useDeleteMerchant/useChangeTier removed (retired exits +
// tier fiction; deboarding is the one exit path, plans the only subscription unit).
export function useRetryProvisioning() {
  const [trigger, result] = useRetryProvisioningMutation();
  return wrapMutation(trigger, result);
}

export function useChangePlan() {
  const [trigger, result] = useChangePlanMutation();
  const adaptedTrigger = useCallback(
    async ({ merchantId, newPlanId, dailyPriceOverride, reason }: { merchantId: string; newPlanId: string; dailyPriceOverride?: number; reason?: string }) => {
      return await trigger({ id: merchantId, newPlanId, dailyPriceOverride, reason });
    },
    [trigger]
  );
  return wrapMutation(adaptedTrigger as any, result);
}

export function useMerchantTimeline(id: string | undefined) {
  return useGetMerchantTimelineQuery(id ?? '', {
    skip: !id,
  });
}
