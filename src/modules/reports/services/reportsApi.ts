import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type {
  GrowthData,
  RevenueData,
  UsageData,
  ChurnData,
  ReportDefinition,
  ReportExportFormat,
} from '@/lib/types';

export interface ReportParams {
  readonly from?: string;
  readonly to?: string;
  readonly granularity?: 'Daily' | 'Weekly' | 'Monthly';
  readonly merchantType?: string;
}

export interface CommissionReportData {
  readonly date: string;
  readonly totalCommission: number;
  readonly totalTransactions: number;
  readonly averageRate: number;
  readonly currency: string;
}

export interface TokenReportData {
  readonly date: string;
  readonly generated: number;
  readonly activated: number;
  readonly expired: number;
  readonly revoked: number;
  readonly revenue: number;
}

export interface ExportReportDto {
  readonly reportType: string;
  readonly format: ReportExportFormat;
  readonly params: ReportParams;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGrowthReport: builder.query<ApiResponse<readonly GrowthData[]>, ReportParams>({
      query: (params) => ({
        url: '/api/v1/reports/growth',
        method: 'GET',
        params,
      }),
    }),

    getRevenueReport: builder.query<ApiResponse<readonly RevenueData[]>, ReportParams>({
      query: (params) => ({
        url: '/api/v1/reports/revenue',
        method: 'GET',
        params,
      }),
    }),

    getUsageReport: builder.query<ApiResponse<readonly UsageData[]>, ReportParams>({
      query: (params) => ({
        url: '/api/v1/reports/usage',
        method: 'GET',
        params,
      }),
    }),

    getChurnReport: builder.query<ApiResponse<readonly ChurnData[]>, ReportParams>({
      query: (params) => ({
        url: '/api/v1/reports/churn',
        method: 'GET',
        params,
      }),
    }),

    getCommissionReport: builder.query<ApiResponse<readonly CommissionReportData[]>, ReportParams>({
      query: (params) => ({
        url: '/api/v1/reports/commission',
        method: 'GET',
        params,
      }),
    }),

    getTokenReport: builder.query<ApiResponse<readonly TokenReportData[]>, ReportParams>({
      query: (params) => ({
        url: '/api/v1/reports/tokens',
        method: 'GET',
        params,
      }),
    }),

    getReportDefinitions: builder.query<ApiResponse<readonly ReportDefinition[]>, void>({
      query: () => ({
        url: '/api/v1/reports/definitions',
        method: 'GET',
      }),
    }),

    exportReport: builder.mutation<ApiResponse<{ readonly downloadUrl: string }>, ExportReportDto>({
      query: (data) => ({
        url: '/api/v1/reports/export',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useGetGrowthReportQuery,
  useGetRevenueReportQuery,
  useGetUsageReportQuery,
  useGetChurnReportQuery,
  useGetCommissionReportQuery,
  useGetTokenReportQuery,
  useGetReportDefinitionsQuery,
  useExportReportMutation,
} = reportsApi;
