/**
 * Reports API module.
 */

import { get, post } from './client';
import type { ApiResponse } from '@/lib/types/common';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReportParams {
  readonly from: string;
  readonly to: string;
  readonly merchantType?: string;
  readonly businessNature?: string;
  readonly granularity?: 'Daily' | 'Weekly' | 'Monthly';
}

export interface GrowthReport {
  readonly newMerchants: number;
  readonly churnedMerchants: number;
  readonly netGrowth: number;
  readonly growthRate: number;
  readonly timeSeries: readonly { readonly date: string; readonly count: number }[];
}

export interface RevenueReport {
  readonly totalRevenue: number;
  readonly subscriptionRevenue: number;
  readonly tokenRevenue: number;
  readonly commissionRevenue: number;
  readonly timeSeries: readonly { readonly date: string; readonly amount: number }[];
  readonly byPlan: Record<string, number>;
}

export interface UsageReport {
  readonly totalTransactions: number;
  readonly averageTransactionsPerMerchant: number;
  readonly activeTerminals: number;
  readonly peakConcurrentUsers: number;
  readonly timeSeries: readonly { readonly date: string; readonly transactions: number }[];
}

export interface ChurnReport {
  readonly churnRate: number;
  readonly churnedMerchants: number;
  readonly retainedMerchants: number;
  readonly reasonBreakdown: Record<string, number>;
  readonly timeSeries: readonly { readonly date: string; readonly churned: number }[];
}

export interface CommissionReport {
  readonly totalCommission: number;
  readonly averageRate: number;
  readonly byMerchant: readonly { readonly merchantId: string; readonly merchantName: string; readonly amount: number }[];
  readonly timeSeries: readonly { readonly date: string; readonly amount: number }[];
}

export interface TokenReport {
  readonly tokensGenerated: number;
  readonly tokensConsumed: number;
  readonly tokensExpired: number;
  readonly tokensRevoked: number;
  readonly revenueFromTokens: number;
  readonly byTier: Record<string, number>;
  readonly timeSeries: readonly { readonly date: string; readonly generated: number; readonly consumed: number }[];
}

export interface CustomReportDefinition {
  readonly name: string;
  readonly metrics: readonly string[];
  readonly dimensions: readonly string[];
  readonly filters: Record<string, string>;
  readonly from: string;
  readonly to: string;
}

export interface ReportDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly metrics: readonly string[];
  readonly dimensions: readonly string[];
  readonly filters: Record<string, string>;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CustomReportResult {
  readonly columns: readonly string[];
  readonly rows: readonly Record<string, unknown>[];
  readonly generatedAt: string;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getGrowthReport(params: ReportParams): Promise<ApiResponse<GrowthReport>> {
  return get<ApiResponse<GrowthReport>>('/api/v1/reports/growth', params as unknown as Record<string, string>);
}

export function getRevenueReport(params: ReportParams): Promise<ApiResponse<RevenueReport>> {
  return get<ApiResponse<RevenueReport>>('/api/v1/reports/revenue', params as unknown as Record<string, string>);
}

export function getUsageReport(params: ReportParams): Promise<ApiResponse<UsageReport>> {
  return get<ApiResponse<UsageReport>>('/api/v1/reports/usage', params as unknown as Record<string, string>);
}

export function getChurnReport(params: ReportParams): Promise<ApiResponse<ChurnReport>> {
  return get<ApiResponse<ChurnReport>>('/api/v1/reports/churn', params as unknown as Record<string, string>);
}

export function getCommissionReport(params: ReportParams): Promise<ApiResponse<CommissionReport>> {
  return get<ApiResponse<CommissionReport>>('/api/v1/reports/commission', params as unknown as Record<string, string>);
}

export function getTokenReport(params: ReportParams): Promise<ApiResponse<TokenReport>> {
  return get<ApiResponse<TokenReport>>('/api/v1/reports/tokens', params as unknown as Record<string, string>);
}

export function getCustomReport(definition: CustomReportDefinition): Promise<ApiResponse<CustomReportResult>> {
  return post<ApiResponse<CustomReportResult>>('/api/v1/reports/custom', definition);
}

export function getReportDefinitions(): Promise<ApiResponse<readonly ReportDefinition[]>> {
  return get<ApiResponse<readonly ReportDefinition[]>>('/api/v1/reports/definitions');
}

export function saveReportDefinition(data: Omit<ReportDefinition, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ReportDefinition>> {
  return post<ApiResponse<ReportDefinition>>('/api/v1/reports/definitions', data);
}

export function exportReport(id: string, format: 'pdf' | 'csv' | 'excel' | 'json'): Promise<ApiResponse<{ downloadUrl: string }>> {
  return get<ApiResponse<{ downloadUrl: string }>>(`/api/v1/reports/${id}/export`, { format });
}
