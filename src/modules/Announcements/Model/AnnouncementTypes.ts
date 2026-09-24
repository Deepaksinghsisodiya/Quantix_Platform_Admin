export type SiteVariantTab = 'Enterprise' | 'Restaurant' | 'Retail';

export type AnnouncementKind = 'Promo' | 'News' | 'Notice' | 'Alert' | 'Event';

export interface Announcement {
  readonly id: string;
  readonly siteVariant: string;
  readonly kind: string;
  readonly badge: string;
  readonly title: string;
  readonly body: string | null;
  readonly linkUrl: string | null;
  readonly ctaLabel: string | null;
  readonly eventStartsAt: string | null;
  readonly eventEndsAt: string | null;
  readonly location: string | null;
  readonly isPinned: boolean;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly publishFrom: string | null;
  readonly publishUntil: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SaveAnnouncementDto {
  readonly siteVariant: string;
  readonly kind: string;
  readonly badge: string;
  readonly title: string;
  readonly body?: string | null;
  readonly linkUrl?: string | null;
  readonly ctaLabel?: string | null;
  readonly eventStartsAt?: string | null;
  readonly eventEndsAt?: string | null;
  readonly location?: string | null;
  readonly isPinned?: boolean;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
  readonly publishFrom?: string | null;
  readonly publishUntil?: string | null;
}

export interface ReorderAnnouncementsDto {
  readonly orderedIds: readonly string[];
}

export interface AnnouncementFormValues {
  siteVariant: string;
  kind: string;
  badge: string;
  title: string;
  body: string;
  linkUrl: string;
  ctaLabel: string;
  isPinned: boolean;
  sortOrder: number;
  isActive: boolean;
}
