export type ReportExportFormat = 'PDF' | 'Excel' | 'CSV';

export type ReportType =
  | 'Growth'
  | 'Revenue'
  | 'Usage'
  | 'Churn'
  | 'Commission'
  | 'Token'
  | 'Custom';

/** Saved report definition with optional schedule. */
export interface ReportDefinition {
  readonly id: string;
  readonly name: string;
  readonly type: ReportType;
  readonly description: string;
  readonly dimensions: readonly string[];
  readonly measures: readonly string[];
  readonly filters: Record<string, string | number | boolean>;
  readonly schedule: ReportSchedule | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Recurring schedule for automated report generation. */
export interface ReportSchedule {
  readonly frequency: 'Daily' | 'Weekly' | 'Monthly';
  readonly dayOfWeek?: number;
  readonly dayOfMonth?: number;
  readonly timeUtc: string;
  readonly exportFormat: ReportExportFormat;
  readonly recipients: readonly string[];
  readonly enabled: boolean;
}

/** Merchant growth data point for trend charts. */
export interface GrowthData {
  readonly date: string;
  readonly newMerchants: number;
  readonly activeMerchants: number;
  readonly churnedMerchants: number;
  readonly netGrowth: number;
  readonly cumulativeTotal: number;
}

/** Revenue data point for financial reporting. */
export interface RevenueData {
  readonly date: string;
  readonly subscriptionRevenue: number;
  readonly tokenRevenue: number;
  readonly commissionRevenue: number;
  readonly addOnRevenue: number;
  readonly totalRevenue: number;
  readonly currency: string;
}

/** Platform usage data point. */
export interface UsageData {
  readonly date: string;
  readonly activeLocations: number;
  readonly activeTerminals: number;
  readonly totalTransactions: number;
  readonly totalTransactionValue: number;
  readonly apiCalls: number;
  readonly syncEvents: number;
}

/** Churn analysis data point. */
export interface ChurnData {
  readonly date: string;
  readonly churnedMerchants: number;
  readonly churnRate: number;
  readonly retentionRate: number;
  readonly mrrLost: number;
  readonly reasons: Record<string, number>;
}
