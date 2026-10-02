export interface SeoMetadataItem {
  seoMetadataId: string;
  siteVariant: string;
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  keywordsList: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterCard: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleSiteVerification?: string;
  structuredDataJson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSeoMetadataPayload {
  siteVariant: string;
  pageSlug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  twitterCard: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImageUrl?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleSiteVerification?: string;
  structuredDataJson?: string;
  isActive: boolean;
}
