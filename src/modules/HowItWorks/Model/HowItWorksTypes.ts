export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail';

export interface TelemetryChip {
  label: string;
  sublabel: string;
  status: 'active' | 'ready' | 'verified';
}

export interface StatItem {
  value: string;
  label: string;
}

export interface HowItWorksStepItem {
  readonly stepId: string;
  readonly id: string;
  readonly siteVariant: string;
  readonly stepNumber: string;
  readonly number: string;
  readonly badgeLabel: string;
  readonly title: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly bullets: readonly string[];
  readonly bulletsJson?: string | null;
  readonly stat: StatItem;
  readonly statValue?: string | null;
  readonly statLabel?: string | null;
  readonly telemetryChips: readonly TelemetryChip[];
  readonly telemetryChipsJson?: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveHowItWorksStepDto {
  readonly siteVariant: string;
  readonly stepNumber: string;
  readonly badgeLabel: string;
  readonly title: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly imageAlt: string;
  readonly bullets?: readonly string[];
  readonly stat?: StatItem;
  readonly statValue?: string;
  readonly statLabel?: string;
  readonly telemetryChips?: readonly TelemetryChip[];
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface ReorderHowItWorksDto {
  readonly orderedIds: readonly string[];
}

export interface HowItWorksFormValues {
  siteVariant: string;
  stepNumber: string;
  badgeLabel: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  bulletsText: string;
  statValue: string;
  statLabel: string;
  chip1Label: string;
  chip1Sublabel: string;
  chip1Status: 'active' | 'ready' | 'verified';
  chip2Label: string;
  chip2Sublabel: string;
  chip2Status: 'active' | 'ready' | 'verified';
  sortOrder: number;
  isActive: boolean;
}
