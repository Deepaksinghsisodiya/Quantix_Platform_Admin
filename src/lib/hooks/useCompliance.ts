import {
  useGetComplianceDashboardQuery,
  useGetDataRequestsQuery,
  useProcessDataRequestMutation,
  useGenerateExportPackageMutation,
  useExecuteAnonymizationMutation,
  useFulfillDataRequestMutation,
  type DataRequestParams,
  type ProcessDataRequestDto,
} from '@/modules/compliance/services/complianceApi';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useComplianceDashboard() {
  return useGetComplianceDashboardQuery();
}

export function useDataRequests(params: DataRequestParams = {}) {
  return useGetDataRequestsQuery(params);
}

export function useProcessDataRequest() {
  const [trigger, result] = useProcessDataRequestMutation();
  return wrapMutation(trigger, result);
}

/** PF-12 Step 4: Generate data export package for an approved Export request. */
export function useGenerateExportPackage() {
  const [trigger, result] = useGenerateExportPackageMutation();
  return wrapMutation(trigger, result);
}

/** PF-12 Step 4: Execute anonymization for an approved Deletion request. */
export function useExecuteAnonymization() {
  const [trigger, result] = useExecuteAnonymizationMutation();
  return wrapMutation(trigger, result);
}

/** PF-12 Step 5: Mark a data request as fulfilled (completed). */
export function useFulfillDataRequest() {
  const [trigger, result] = useFulfillDataRequestMutation();
  return wrapMutation(trigger, result);
}

