import {
  useGetCommissionDashboardQuery,
  useGetCommissionRatesQuery,
} from '@/modules/commission/services/commissionApi';

export function useCommissionDashboard() {
  return useGetCommissionDashboardQuery();
}

export function useCommissionRates() {
  return useGetCommissionRatesQuery();
}

// 2026-09-08: useCommissionExemptions / useCreateExemption REMOVED with the exemptions
// surface - GET/POST /commission/exemptions never existed on the API.

