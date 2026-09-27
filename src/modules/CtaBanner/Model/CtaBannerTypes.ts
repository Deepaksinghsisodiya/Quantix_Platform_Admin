export interface TelemetryChip {
  id?: string;
  label: string;
  dotColor?: string;
  pingColor?: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface CtaBannerItem {
  ctaBannerId: string;
  siteVariant: string;
  badge?: string;
  heading: string;
  headingAccent?: string;
  subheading?: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  telemetryChips: TelemetryChip[];
  trustBadges: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCtaBannerPayload {
  siteVariant: string;
  badge?: string;
  heading: string;
  headingAccent?: string;
  subheading?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  telemetryChips?: TelemetryChip[];
  trustBadges?: string[];
  isActive: boolean;
}

export interface CtaBannerFilter {
  siteVariant: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  searchQuery: string;
}
