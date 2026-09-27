export interface SupportPillar {
  iconKey: string;
  title: string;
  desc: string;
}

export interface SupportSectionItem {
  supportSectionId: string;
  siteVariant: 'Enterprise' | 'Restaurant' | 'Retail' | string;
  pillBadge?: string;
  mainTitle: string;
  highlightWord?: string;
  description?: string;
  pillars: SupportPillar[];
  repName?: string;
  repRole?: string;
  repAvatarUrl?: string;
  responseTimeBadge?: string;
  directPhone?: string;
  directEmail?: string;
  liveChatStatus?: string;
  chatButtonText?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSupportSectionPayload {
  siteVariant: string;
  pillBadge?: string;
  mainTitle: string;
  highlightWord?: string;
  description?: string;
  pillars: SupportPillar[];
  repName?: string;
  repRole?: string;
  repAvatarUrl?: string;
  responseTimeBadge?: string;
  directPhone?: string;
  directEmail?: string;
  liveChatStatus?: string;
  chatButtonText?: string;
  isActive: boolean;
}

export interface CustomerSupportFilter {
  siteVariant: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  searchQuery: string;
}
