import {
  useGetGrowthReportQuery,
  useGetRevenueReportQuery,
  useGetUsageReportQuery,
  useGetChurnReportQuery,
  useGetCommissionReportQuery,
  useGetTokenReportQuery,
  useGetReportDefinitionsQuery,
  useExportReportMutation,
  type ReportParams,
  type ExportReportDto,
} from '@/modules/reports/services/reportsApi';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useGrowthReport(params: ReportParams = {}) {
  return useGetGrowthReportQuery(params);
}

export function useRevenueReport(params: ReportParams = {}) {
  return useGetRevenueReportQuery(params);
}

export function useUsageReport(params: ReportParams = {}) {
  return useGetUsageReportQuery(params);
}

export function useChurnReport(params: ReportParams = {}) {
  return useGetChurnReportQuery(params);
}

export function useCommissionReport(params: ReportParams = {}) {
  return useGetCommissionReportQuery(params);
}

export function useTokenReport(params: ReportParams = {}) {
  return useGetTokenReportQuery(params);
}

export function useReportDefinitions() {
  return useGetReportDefinitionsQuery();
}

export function useExportReport() {
  const [trigger, result] = useExportReportMutation();
  return wrapMutation(trigger, result);
}

