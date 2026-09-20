export type ContentStatus = 'Draft' | 'Review' | 'Published' | 'Scheduled';

/** SEO metadata attached to content items. */
export interface SeoMetadata {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly keywords: readonly string[];
  readonly ogImage: string | null;
  readonly canonicalUrl: string | null;
}

/** A blog post managed by the platform. */
export interface BlogPost {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly excerpt: string;
  readonly status: ContentStatus;
  readonly author: string;
  readonly publishDate: string | null;
  /** PF-15 Step 6: Scheduled end date for auto-unpublish (null = no expiry). */
  readonly unpublishDate: string | null;
  /** PF-15 Step 3: ID of the reviewer (null if not in review). */
  readonly reviewedBy: string | null;
  readonly seoMetadata: SeoMetadata;
  readonly featuredImage: string | null;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** A knowledge-base help article. */
export interface HelpArticle {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly category: string;
  readonly order: number;
  readonly status: ContentStatus;
  readonly author: string;
  readonly lastReviewedAt: string | null;
  readonly helpfulCount: number;
  readonly notHelpfulCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Frequently asked question entry. */
/**
 * 2026-09-05 (content Phase 2): re-shaped to mirror the API's FaqDto.
 *
 * The old declaration used `id` / `order` / `isPublished`, none of which the API has ever sent
 * (it sends `faqId` / `sortOrder` / `isActive`). Nothing noticed, because the FAQ page rendered
 * twelve hardcoded objects and made no network call at all.
 */
export interface FAQ {
  readonly faqId: string;
  readonly question: string;
  readonly answer: string;
  readonly category: string;
  /** Enterprise / Standalone, or null when it applies to every merchant type. */
  readonly merchantType: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: string;
}

/** Marketing or landing page content block. */
export interface MarketingContent {
  readonly id: string;
  readonly section: string;
  readonly content: string;
  readonly status: ContentStatus;
  readonly locale: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Scheduled content publication. */
export interface ContentSchedule {
  readonly id: string;
  readonly contentId: string;
  readonly contentType: 'BlogPost' | 'HelpArticle' | 'FAQ' | 'MarketingContent';
  readonly scheduledAt: string;
  readonly publishedAt: string | null;
  readonly status: 'Scheduled' | 'Published' | 'Failed' | 'Cancelled';
}
