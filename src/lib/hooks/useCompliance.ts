import {
  useGetComplianceDashboardQuery,
  useGetComplianceRequestsQuery,
  type ComplianceListParams,
} from '@/modules/compliance/services/complianceApi';

/**
 * 2026-09-08: thin re-exports over the RTK endpoints. The mutation wrappers that used to live
 * here (process / generate-export / execute-anonymization / fulfill) targeted routes the API
 * never had; the pages now call the real mutations from complianceApi directly.
 */
export function useComplianceDashboard() {
  return useGetComplianceDashboardQuery();
}

export function useComplianceRequests(params: ComplianceListParams = {}) {
  return useGetComplianceRequestsQuery(params);
}
