import {
  useGetDeboardingQueueQuery,
  useGetDeboardingByIdQuery,
  useGetDeboardingByMerchantQuery,
  useGiveDeboardingConsentMutation,
  useDeactivateDeboardingMutation,
  useGenerateFinalInvoiceMutation,
  useSettleDeboardingMutation,
  useAskRechargeMutation,
  useRetryDeboardingSettleMutation,
  useIssueRefundMutation,
  useSoftDeleteDeboardingMutation,
  useCancelDeboardingMutation,
} from '@/modules/merchants/services/merchantApi';
import type {
  DeboardingFilter,
  GiveConsentDto,
  AskMerchantToRechargeDto,
  IssueRefundDto,
  CancelDeboardingDto,
} from '@/lib/api/deboarding';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useDeboardings(filter: DeboardingFilter = { page: 1, pageSize: 25 }) {
  return useGetDeboardingQueueQuery(filter);
}

export function useDeboarding(deboardingId: string) {
  return useGetDeboardingByIdQuery(deboardingId, {
    skip: !deboardingId,
  });
}

export function useDeboardingByMerchant(merchantId: string) {
  return useGetDeboardingByMerchantQuery(merchantId, {
    skip: !merchantId,
  });
}

export function useGiveConsent() {
  const [trigger, result] = useGiveDeboardingConsentMutation();
  return wrapMutation(trigger, result);
}

export function useDeactivate() {
  const [trigger, result] = useDeactivateDeboardingMutation();
  return wrapMutation(trigger, result);
}

export function useGenerateFinalInvoice() {
  const [trigger, result] = useGenerateFinalInvoiceMutation();
  return wrapMutation(trigger, result);
}

export function useSettle() {
  const [trigger, result] = useSettleDeboardingMutation();
  return wrapMutation(trigger, result);
}

export function useAskRecharge() {
  const [trigger, result] = useAskRechargeMutation();
  return wrapMutation(trigger, result);
}

export function useRetrySettle() {
  const [trigger, result] = useRetryDeboardingSettleMutation();
  return wrapMutation(trigger, result);
}

export function useIssueRefund() {
  const [trigger, result] = useIssueRefundMutation();
  return wrapMutation(trigger, result);
}

export function useSoftDelete() {
  const [trigger, result] = useSoftDeleteDeboardingMutation();
  return wrapMutation(trigger, result);
}

export function useCancelDeboarding() {
  const [trigger, result] = useCancelDeboardingMutation();
  return wrapMutation(trigger, result);
}
