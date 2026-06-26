import {
  useGetCommissionDashboardQuery,
  useGetCommissionRatesQuery,
  useGetCommissionExemptionsQuery,
  useCreateCommissionExemptionMutation,
} from '@/modules/commission/services/commissionApi';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useCommissionDashboard() {
  return useGetCommissionDashboardQuery();
}

export function useCommissionRates() {
  return useGetCommissionRatesQuery();
}

/** FRS-SAP-1508: Get commission exemptions. */
export function useCommissionExemptions() {
  return useGetCommissionExemptionsQuery();
}

/** FRS-SAP-1508: Create commission exemption. */
export function useCreateExemption() {
  const [trigger, result] = useCreateCommissionExemptionMutation();
  return wrapMutation(trigger, result);
}

