export type SiteVariant = 'Enterprise' | 'Restaurant' | 'Retail';

export interface BrandingItem {
  siteVariant: SiteVariant;
  brandName: string;
  brandHighlight: string;
  tagline: string;
  iconType: string;
  logoImageUrl?: string | null;
  isActive: boolean;
  updatedAt?: string;
}

export interface SaveBrandingPayload {
  siteVariant: SiteVariant;
  brandName: string;
  brandHighlight?: string;
  tagline?: string;
  iconType?: string;
  logoImageUrl?: string | null;
  isActive: boolean;
}
