import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { getBlob } from '@/lib/api/client';
import { downloadBlob } from '@/shared/utils/download';
import { apiErrorMessage } from '@/lib/utils/apiError';
import {
  useGetGrowthReportQuery,
  useGetRevenueAnalyticsQuery,
  useGetRevenueSeriesQuery,
  useGetUsageStatsQuery,
  useGetChurnReportQuery,
  useGetMerchantBehaviorQuery,
  useGetMerchantHealthQuery,
  useGetCommissionReportQuery,
  useGetTokenGenerationReportQuery,
  type ReportWindow,
  type RevenueGroupBy,
} from '@/modules/reports/services/reportsApi';

/* ---------------------------------------------------------------------------
 * 2026-08-31: rewritten alongside reportsApi. Every hook now maps 1:1 onto a
 * route the Platform API really serves and returns that route's real shape.
 *
 * Removed: useUsageReport (pointed at the non-existent /reports/usage),
 * useReportDefinitions (no /reports/definitions and no saved-report store) and
 * useExportReport (no /reports/export; file generation answers 501).
 * ------------------------------------------------------------------------- */

/**
 * Reports re-read on mount rather than serving whatever is already in the RTK cache:
 * an operator opening a report expects today's figures, not a snapshot from earlier
 * in the session.
 */
const REFETCH_ON_MOUNT = { refetchOnMountOrArgChange: true } as const;


/**
 * Default window helper — reports always take an explicit UTC range.
 *
 * The bounds are quantised to whole UTC days ON PURPOSE. RTK Query keys its cache
 * on the serialised arguments, so a millisecond-precision `new Date()` produced a
 * different cache key on every mount and a fresh request each time. Day bounds give
 * the same string all day, which is also the grain these reports aggregate at.
 */
export function reportWindow(days: number): ReportWindow {
  const now = new Date();
  const endOfToday = Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999,
  );
  const startOfWindow = endOfToday - (days - 1) * 86_400_000 - (86_400_000 - 1);
  return {
    fromDate: new Date(startOfWindow).toISOString(),
    toDate: new Date(endOfToday).toISOString(),
  };
}

export function useGrowthReport(
  window: ReportWindow,
  merchantType?: 'Enterprise' | 'Standalone',
) {
  return useGetGrowthReportQuery(merchantType ? { ...window, merchantType } : window, REFETCH_ON_MOUNT);
}

export function useRevenueAnalytics(window: ReportWindow) {
  return useGetRevenueAnalyticsQuery(window, REFETCH_ON_MOUNT);
}

export function useRevenueSeries(window: ReportWindow, groupBy: RevenueGroupBy = 'month') {
  return useGetRevenueSeriesQuery({ ...window, groupBy }, REFETCH_ON_MOUNT);
}

export function useUsageStats(window: ReportWindow) {
  return useGetUsageStatsQuery(window, REFETCH_ON_MOUNT);
}

export function useChurnReport(window: ReportWindow) {
  return useGetChurnReportQuery(window, REFETCH_ON_MOUNT);
}

export function useMerchantBehavior(window: ReportWindow) {
  return useGetMerchantBehaviorQuery(window, REFETCH_ON_MOUNT);
}

/** Real per-merchant risk/health rows — the honest source for an "at risk" list. */
export function useMerchantHealth(page = 1, pageSize = 20) {
  return useGetMerchantHealthQuery({ page, pageSize }, REFETCH_ON_MOUNT);
}

export function useCommissionReport(window: ReportWindow) {
  return useGetCommissionReportQuery(window, REFETCH_ON_MOUNT);
}

export function useTokenGenerationReport(window: ReportWindow) {
  return useGetTokenGenerationReportQuery(window, REFETCH_ON_MOUNT);
}

/* ---------------------------------------------------------------------------
 * 2026-09-04 (decision E): report file export. GET /reports/{report}/export renders the
 * same figures the page shows into CSV or PDF; the operator picks the format.
 * ------------------------------------------------------------------------- */

export type ReportExportKey =
  | 'growth'
  | 'revenue'
  | 'usage'
  | 'churn'
  | 'commission'
  | 'tokens'
  | 'compliance';

export type ReportExportFormat = 'csv' | 'pdf';

export interface ReportExportParams {
  /** The window the page is showing. Compliance has none (it reports the register as it stands). */
  readonly window?: ReportWindow;
  readonly merchantType?: 'Enterprise' | 'Standalone';
  readonly groupBy?: RevenueGroupBy;
}

const yyyymmdd = (iso: string) => iso.slice(0, 10).replace(/-/g, '');

/** The file name the API also uses — one rule, so the download matches the header. */
export function reportExportFileName(report: ReportExportKey, format: ReportExportFormat, window?: ReportWindow): string {
  const span = window ? `-${yyyymmdd(window.fromDate)}-${yyyymmdd(window.toDate)}` : '';
  return `${report}-report${span}.${format}`;
}

export function useReportExport(report: ReportExportKey, params: ReportExportParams) {
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null);
  const { window, merchantType, groupBy } = params;

  const exportReport = useCallback(
    async (format: ReportExportFormat) => {
      setExporting(format);
      try {
        const query = new URLSearchParams({ format });
        if (window) {
          query.set('fromDate', window.fromDate);
          query.set('toDate', window.toDate);
        }
        if (merchantType) query.set('merchantType', merchantType);
        if (groupBy) query.set('groupBy', groupBy);
        const blob = await getBlob(`/api/v1/reports/${report}/export?${query.toString()}`);
        downloadBlob(blob, reportExportFileName(report, format, window));
        toast.success(`${format.toUpperCase()} export ready`);
      } catch (err) {
        toast.error(apiErrorMessage(err, 'The report could not be exported'));
      } finally {
        setExporting(null);
      }
    },
    [report, window, merchantType, groupBy],
  );

  return { exportReport, exporting };
}
