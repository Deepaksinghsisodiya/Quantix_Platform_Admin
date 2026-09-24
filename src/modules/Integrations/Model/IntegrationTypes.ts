export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail';

export interface IntegrationStatItem {
  value?: string;
  label?: string;
}

export interface IntegrationFeatureItem {
  title?: string;
  desc?: string;
}

export interface IntegrationSetupStepItem {
  step?: string;
  title?: string;
  desc?: string;
}

export interface IntegrationSpecItem {
  label?: string;
  value?: string;
}

export interface IntegrationFaqItem {
  id?: string;
  question?: string;
  answer?: string;
}

export interface IntegrationItem {
  readonly integrationId: string;
  readonly id: string;
  readonly siteVariant: string;
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly categoryLabel?: string | null;
  readonly description: string | null;
  readonly logoUrl: string | null;
  readonly imageUrl: string | null;
  readonly websiteUrl: string | null;
  readonly accent: string | null;
  readonly badge: string | null;
  readonly heroHeadline: string | null;
  readonly tagline: string | null;
  readonly syncSpeed: string | null;
  readonly syncSpeedIcon: string | null;
  readonly tagsJson: string | null;
  readonly statsJson: string | null;
  readonly featuresJson: string | null;
  readonly setupStepsJson: string | null;
  readonly benefitsJson: string | null;
  readonly specsJson: string | null;
  readonly faqsJson: string | null;
  readonly isPopular: boolean;
  readonly showInNavbar: boolean;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveIntegrationDto {
  readonly siteVariant: string;
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly categoryLabel?: string | null;
  readonly description?: string | null;
  readonly logoUrl?: string | null;
  readonly imageUrl?: string | null;
  readonly websiteUrl?: string | null;
  readonly accent?: string | null;
  readonly badge?: string | null;
  readonly heroHeadline?: string | null;
  readonly tagline?: string | null;
  readonly syncSpeed?: string | null;
  readonly syncSpeedIcon?: string | null;
  readonly tagsJson?: string | null;
  readonly statsJson?: string | null;
  readonly featuresJson?: string | null;
  readonly setupStepsJson?: string | null;
  readonly benefitsJson?: string | null;
  readonly specsJson?: string | null;
  readonly faqsJson?: string | null;
  readonly isPopular?: boolean;
  readonly showInNavbar?: boolean;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface ReorderIntegrationsDto {
  readonly orderedIds: readonly string[];
}

export interface IntegrationFormValues {
  siteVariant: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  logoUrl: string;
  imageUrl: string;
  websiteUrl: string;
  accent: string;
  badge: string;
  heroHeadline: string;
  tagline: string;
  syncSpeed: string;
  syncSpeedIcon: string;
  tags: string[];
  features: IntegrationFeatureItem[];
  setupSteps: IntegrationSetupStepItem[];
  benefits: string[];
  faqs: IntegrationFaqItem[];
  stats: IntegrationStatItem[];
  specs: IntegrationSpecItem[];
  isPopular: boolean;
  showInNavbar: boolean;
  sortOrder: number;
  isActive: boolean;
}
