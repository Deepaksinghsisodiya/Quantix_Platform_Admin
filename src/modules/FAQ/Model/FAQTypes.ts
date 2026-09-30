export interface FAQItem {
  id?: string;
  faqId: string;
  question: string;
  answer: string;
  category: string;
  siteVariant?: 'Enterprise' | 'Restaurant' | 'Retail' | string;
  merchantType: 'Enterprise' | 'Standalone' | 'Restaurant' | 'Retail' | string | null;
  sortOrder: number;
  order?: number;
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SaveFAQPayload {
  question: string;
  answer: string;
  category?: string;
  siteVariant?: string;
  merchantType?: string | null;
  sortOrder?: number;
  isPopular?: boolean;
  isActive?: boolean;
}

export interface FAQFilter {
  siteVariant: 'all' | 'enterprise' | 'restaurant' | 'retail' | string;
  category: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  searchQuery: string;
}
