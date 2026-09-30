export type SolutionTab = 'PromoCard' | 'SectorItem';
export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail' | 'Subdomains' | 'All';

export interface KeyPoint {
  title: string;
  desc: string;
}

export interface Workflow {
  title: string;
  desc: string;
}

export interface SolutionFaq {
  id?: string;
  question: string;
  answer: string;
}

export interface SubSector {
  label: string;
  href: string;
}

export interface OverviewFeature {
  title: string;
  desc: string;
  icon?: string;
  badge?: string;
}

export interface SolutionItem {
  solutionId: string;
  id?: string;
  siteVariant: string;
  itemType: 'PromoCard' | 'SectorItem';
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  imageUrl?: string;
  imageSrc?: string;
  imageAlt?: string;
  slug?: string;
  href?: string;
  isSubdomain: boolean;

  // Promo Card (Left Subdomain Bridge)
  ctaText?: string;
  externalUrl?: string;

  // Sector Item (Right Dropdown Item)
  categoryTitle?: string;
  iconKey?: string;
  iconColor?: string;

  // Landing Page Detailed Data (when right-side item clicked)
  eyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  topBadge?: string;
  bottomBadge?: string;
  ctaLabel?: string;
  detailImageUrl?: string;
  detailImageAlt?: string;

  points?: KeyPoint[];
  pointsJson?: string;

  workflows?: Workflow[];
  workflowsJson?: string;

  faqs?: SolutionFaq[];
  faqsJson?: string;

  // Overview / Card specific
  tagline?: string;
  liveMetric?: string;
  tags?: string[];
  tagsJson?: string;
  subSectors?: SubSector[];
  subSectorsJson?: string;
  overviewFeatures?: OverviewFeature[];
  overviewFeaturesJson?: string;
  accentColor?: string;
  glowColor?: string;
  category?: string;

  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveSolutionItemDto {
  siteVariant: string;
  itemType: 'PromoCard' | 'SectorItem';
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  slug?: string;
  href?: string;
  isSubdomain: boolean;

  ctaText?: string;
  externalUrl?: string;

  categoryTitle?: string;
  iconKey?: string;
  iconColor?: string;

  eyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  topBadge?: string;
  bottomBadge?: string;
  ctaLabel?: string;
  detailImageUrl?: string;
  detailImageAlt?: string;

  points?: KeyPoint[];
  pointsJson?: string;

  workflows?: Workflow[];
  workflowsJson?: string;

  faqs?: SolutionFaq[];
  faqsJson?: string;

  // Overview / Card specific
  tagline?: string;
  liveMetric?: string;
  tags?: string[];
  tagsJson?: string;
  subSectors?: SubSector[];
  subSectorsJson?: string;
  overviewFeatures?: OverviewFeature[];
  overviewFeaturesJson?: string;
  accentColor?: string;
  glowColor?: string;
  category?: string;

  sortOrder: number;
  isActive: boolean;
}

export interface ReorderSolutionsDto {
  orderedIds: string[];
}

export interface SolutionFormValues {
  siteVariant: string;
  itemType: 'PromoCard' | 'SectorItem';
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  imageUrl: string;
  imageAlt: string;
  slug: string;
  href: string;
  isSubdomain: boolean;

  // Promo Card
  ctaText: string;
  externalUrl: string;

  // Sector Item
  categoryTitle: string;
  iconKey: string;
  iconColor: string;

  // Landing Page
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  topBadge: string;
  bottomBadge: string;
  ctaLabel: string;
  detailImageUrl: string;
  detailImageAlt: string;

  points: KeyPoint[];
  workflows: Workflow[];
  faqs: SolutionFaq[];

  // Overview / Card specific
  tagline?: string;
  liveMetric?: string;
  tags?: string[];
  tagsInput?: string; // Comma-separated helper in form
  accentColor?: string;
  glowColor?: string;
  category?: string;

  sortOrder: number;
  isActive: boolean;
}
