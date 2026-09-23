export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail';

export interface TestimonialItem {
  readonly testimonialId: string;
  readonly personName: string;
  readonly personRole: string | null;
  readonly companyName: string | null;
  readonly avatarUrl: string | null;
  readonly metricText: string | null;
  readonly rating: number;
  readonly merchantType: string | null;
  readonly title: string | null;
  readonly body: string;
  readonly pageSlug: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveTestimonialDto {
  readonly personName: string;
  readonly personRole?: string | null;
  readonly companyName?: string | null;
  readonly avatarUrl?: string | null;
  readonly metricText?: string | null;
  readonly rating?: number;
  readonly merchantType?: string | null;
  readonly title?: string | null;
  readonly body: string;
  readonly pageSlug?: string | null;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface ReorderTestimonialsDto {
  readonly orderedIds: readonly string[];
}

export interface TestimonialFormValues {
  siteVariant: string; // Enterprise | Restaurant | Retail
  personName: string;
  personRole: string;
  companyName: string;
  avatarUrl: string;
  metricText: string;
  rating: number;
  title: string;
  body: string;
  sortOrder: number;
  isActive: boolean;
}
