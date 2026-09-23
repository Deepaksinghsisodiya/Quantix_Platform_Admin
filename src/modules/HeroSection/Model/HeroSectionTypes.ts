export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail';

export interface HeroSlide {
  readonly heroSlideId: string;
  readonly siteVariant: string;
  readonly badge: string;
  readonly heading: string;
  readonly subheading: string | null;
  readonly primaryCtaLabel: string | null;
  readonly primaryCtaUrl: string | null;
  readonly secondaryCtaLabel: string | null;
  readonly secondaryCtaUrl: string | null;
  readonly featureHighlights: readonly string[];
  readonly mediaAssetId: string | null;
  readonly imageUrl: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveHeroSlideDto {
  readonly siteVariant: string;
  readonly badge: string;
  readonly heading: string;
  readonly subheading?: string | null;
  readonly primaryCtaLabel?: string | null;
  readonly primaryCtaUrl?: string | null;
  readonly secondaryCtaLabel?: string | null;
  readonly secondaryCtaUrl?: string | null;
  readonly featureHighlights?: readonly string[];
  readonly mediaAssetId?: string | null;
  readonly imageUrl?: string | null;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface ReorderHeroSlidesDto {
  readonly orderedIds: readonly string[];
}

export interface HeroSlideFormValues {
  siteVariant: string;
  badge: string;
  heading: string;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  highlight1: string;
  highlight2: string;
  highlight3: string;
  mediaAssetId: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}
