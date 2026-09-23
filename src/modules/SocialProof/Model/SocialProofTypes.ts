export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail';

export interface SocialProofMetric {
  readonly metricId: string;
  readonly siteVariant: string;
  readonly value: string;
  readonly numericValue: number | null;
  readonly prefix: string | null;
  readonly suffix: string | null;
  readonly decimals: number;
  readonly label: string;
  readonly description: string | null;
  readonly iconKey: string;
  readonly accentColor: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveSocialProofMetricDto {
  readonly siteVariant: string;
  readonly value: string;
  readonly numericValue?: number | null;
  readonly prefix?: string | null;
  readonly suffix?: string | null;
  readonly decimals?: number;
  readonly label: string;
  readonly description?: string | null;
  readonly iconKey: string;
  readonly accentColor: string;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface ReorderSocialProofMetricsDto {
  readonly orderedIds: readonly string[];
}

export interface SocialProofFormValues {
  siteVariant: string;
  value: string;
  numericValue: number | string;
  prefix: string;
  suffix: string;
  decimals: number;
  label: string;
  description: string;
  iconKey: string;
  accentColor: string;
  sortOrder: number;
  isActive: boolean;
}
