export interface FeatureCapability {
  title: string;
  desc: string;
  iconKey?: string;
}

export interface FeatureWorkflowStep {
  stepNumber: string;
  title: string;
  desc: string;
}

export interface FeatureFaq {
  id: string;
  question: string;
  answer: string;
}

export interface PlatformFeature {
  featureId: string;
  id: string;
  siteVariant: string; // "Enterprise" | "Restaurant" | "Retail"
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  iconKey: string;
  iconColor?: string;

  showInNavbar: boolean;
  showOnHomepage: boolean;
  isFeatured: boolean;
  navbarBadge?: string;
  sortOrder: number;
  isActive: boolean;

  numberLabel?: string;
  shortDescription?: string;
  fullDescription?: string;

  bullets?: string[];
  bulletsJson?: string;

  statValue?: string;
  statLabel?: string;
  imageUrl?: string;
  imageSrc?: string;
  imageAlt?: string;
  topBadge?: string;
  bottomBadge?: string;
  ctaText?: string;
  ctaHref?: string;

  heroHeadline?: string;
  heroSubheadline?: string;

  keyCapabilities?: FeatureCapability[];
  keyCapabilitiesJson?: string;

  workflows?: FeatureWorkflowStep[];
  workflowsJson?: string;

  faqs?: FeatureFaq[];
  faqsJson?: string;

  relatedIntegrations?: string[];
  relatedIntegrationsJson?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SavePlatformFeatureDto {
  siteVariant: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  iconKey: string;
  iconColor?: string;

  showInNavbar: boolean;
  showOnHomepage: boolean;
  isFeatured: boolean;
  navbarBadge?: string;
  sortOrder: number;
  isActive: boolean;

  numberLabel?: string;
  shortDescription?: string;
  fullDescription?: string;

  bullets?: string[];
  bulletsJson?: string;

  statValue?: string;
  statLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
  topBadge?: string;
  bottomBadge?: string;
  ctaText?: string;
  ctaHref?: string;

  heroHeadline?: string;
  heroSubheadline?: string;

  keyCapabilities?: FeatureCapability[];
  keyCapabilitiesJson?: string;

  workflows?: FeatureWorkflowStep[];
  workflowsJson?: string;

  faqs?: FeatureFaq[];
  faqsJson?: string;

  relatedIntegrations?: string[];
  relatedIntegrationsJson?: string;
}

export interface ReorderFeaturesDto {
  orderedIds: string[];
}
