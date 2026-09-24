export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail';

export interface ClientBrand {
  readonly brandId: string;
  readonly id: string;
  readonly clientLogoId: string;
  readonly name: string;
  readonly title: string;
  readonly siteVariant: string;
  readonly category: string;
  readonly industry: string | null;
  readonly logoUrl: string | null;
  readonly mediaAssetId: string | null;
  readonly websiteUrl: string | null;
  readonly linkUrl: string | null;
  readonly tier: string;
  readonly locationsCount: number | null;
  readonly isFeatured: boolean;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveClientBrandDto {
  readonly siteVariant: string;
  readonly name: string;
  readonly category: string;
  readonly industry?: string | null;
  readonly logoUrl?: string | null;
  readonly mediaAssetId?: string | null;
  readonly websiteUrl?: string | null;
  readonly tier?: string;
  readonly locationsCount?: number | null;
  readonly isFeatured?: boolean;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface ReorderClienteleDto {
  readonly orderedIds: readonly string[];
}

export interface ClienteleFormValues {
  siteVariant: string;
  name: string;
  category: string;
  industry: string;
  logoUrl: string;
  websiteUrl: string;
  tier: string;
  locationsCount: number | string;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
}
