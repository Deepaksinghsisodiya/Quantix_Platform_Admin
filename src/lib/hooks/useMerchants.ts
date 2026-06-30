import { useCallback } from 'react';
import {
  useGetMerchantsQuery,
  useGetMerchantQuery,
  useRegisterEnterpriseMutation,
  useRegisterStandaloneMutation,
  useActivateMerchantMutation,
  useSuspendMerchantMutation,
  useReactivateMerchantWithResolutionMutation,
  useCancelMerchantMutation,
  useRetryProvisioningMutation,
  useDeleteMerchantMutation,
  useChangePlanMutation,
  useChangeTierMutation,
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

export function useCreateEnterpriseMerchant() {
  const [trigger, result] = useRegisterEnterpriseMutation();
  return wrapMutation(trigger, result);
}

export function useCreateStandaloneMerchant() {
  const [trigger, result] = useRegisterStandaloneMutation();
  return wrapMutation(trigger, result);
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

export function useCancelMerchant() {
  const [trigger, result] = useCancelMerchantMutation();
  const adaptedTrigger = useCallback(
    async ({ merchantId, reason }: { merchantId: string; reason: string }) => {
      return await trigger({ id: merchantId, reason });
    },
    [trigger]
  );
  return wrapMutation(adaptedTrigger as any, result);
}

export function useRetryProvisioning() {
  const [trigger, result] = useRetryProvisioningMutation();
  return wrapMutation(trigger, result);
}

export function useDeleteMerchant() {
  const [trigger, result] = useDeleteMerchantMutation();
  return wrapMutation(trigger, result);
}

export function useChangePlan() {
  const [trigger, result] = useChangePlanMutation();
  const adaptedTrigger = useCallback(
    async ({ merchantId, newPlan }: { merchantId: string; newPlan: string }) => {
      return await trigger({ id: merchantId, plan: newPlan });
    },
    [trigger]
  );
  return wrapMutation(adaptedTrigger as any, result);
}

export function useChangeTier() {
  const [trigger, result] = useChangeTierMutation();
  const adaptedTrigger = useCallback(
    async ({ merchantId, newTier }: { merchantId: string; newTier: string }) => {
      return await trigger({ id: merchantId, tier: newTier });
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
