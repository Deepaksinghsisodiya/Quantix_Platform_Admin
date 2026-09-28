export interface FAQItem {
  faqId: string;
  question: string;
  answer: string;
  category: string;
  merchantType: 'Enterprise' | 'Standalone' | 'Restaurant' | 'Retail' | string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SaveFAQPayload {
  question: string;
  answer: string;
  category?: string;
  merchantType?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface FAQFilter {
  siteVariant: 'all' | 'enterprise' | 'restaurant' | 'retail' | string;
  category: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  searchQuery: string;
}
