/**
 * Content Management API module.
 */

import { get, post, put, del } from './client';
import type { ApiResponse, PaginationParams } from '@/lib/types/common';
import type { ApiListResponse } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MarketingContent {
  readonly sections: Record<string, MarketingSection>;
  readonly updatedAt: string;
}

export interface MarketingSection {
  readonly title: string;
  readonly subtitle: string;
  readonly bodyHtml: string;
  readonly imageUrl: string | null;
  readonly ctaText: string | null;
  readonly ctaUrl: string | null;
  readonly enabled: boolean;
}

export interface MarketingSectionUpdate {
  readonly title?: string;
  readonly subtitle?: string;
  readonly bodyHtml?: string;
  readonly imageUrl?: string | null;
  readonly ctaText?: string | null;
  readonly ctaUrl?: string | null;
  readonly enabled?: boolean;
}

export interface BlogPost {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly bodyHtml: string;
  readonly coverImageUrl: string | null;
  readonly author: string;
  readonly tags: readonly string[];
  readonly status: 'Draft' | 'Review' | 'Published' | 'Scheduled' | 'Archived';
  readonly publishedAt: string | null;
  /** PF-15 Step 6: Auto-unpublish date (null = no expiry). */
  readonly unpublishAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BlogPostListParams extends PaginationParams {
  readonly search?: string;
  readonly status?: string;
  readonly tag?: string;
}

export interface BlogPostCreate {
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly bodyHtml: string;
  readonly coverImageUrl?: string | null;
  readonly tags?: readonly string[];
}

export interface BlogPostUpdate {
  readonly title?: string;
  readonly slug?: string;
  readonly excerpt?: string;
  readonly bodyHtml?: string;
  readonly coverImageUrl?: string | null;
  readonly tags?: readonly string[];
  readonly status?: 'Draft' | 'Review' | 'Published' | 'Scheduled' | 'Archived';
  /** PF-15 Step 6: Set auto-unpublish date (null to clear). */
  readonly unpublishAt?: string | null;
}

export interface HelpArticle {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly category: string;
  readonly bodyHtml: string;
  readonly tags: readonly string[];
  readonly order: number;
  readonly isPublished: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface HelpArticleListParams extends PaginationParams {
  readonly search?: string;
  readonly category?: string;
  readonly isPublished?: boolean;
}

export interface HelpArticleCreate {
  readonly title: string;
  readonly slug: string;
  readonly category: string;
  readonly bodyHtml: string;
  readonly tags?: readonly string[];
  readonly order?: number;
}

export interface HelpArticleUpdate {
  readonly title?: string;
  readonly slug?: string;
  readonly category?: string;
  readonly bodyHtml?: string;
  readonly tags?: readonly string[];
  readonly order?: number;
  readonly isPublished?: boolean;
}

export interface Faq {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: string;
  readonly order: number;
  readonly isPublished: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FaqListParams extends PaginationParams {
  readonly search?: string;
  readonly category?: string;
}

export interface FaqCreate {
  readonly question: string;
  readonly answer: string;
  readonly category: string;
  readonly order?: number;
}

export interface FaqUpdate {
  readonly question?: string;
  readonly answer?: string;
  readonly category?: string;
  readonly order?: number;
  readonly isPublished?: boolean;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getMarketingContent(): Promise<ApiResponse<MarketingContent>> {
  return get<ApiResponse<MarketingContent>>('/api/v1/marketing/content/homepage');
}

export function updateMarketingContent(section: string, data: MarketingSectionUpdate): Promise<ApiResponse<MarketingSection>> {
  return put<ApiResponse<MarketingSection>>(`/api/v1/marketing/content/${section}`, data);
}

export function getBlogPosts(params: BlogPostListParams): Promise<ApiListResponse<BlogPost>> {
  return get<ApiListResponse<BlogPost>>('/api/v1/blog/posts', params as unknown as Record<string, string | number>);
}

export function getBlogPost(id: string): Promise<ApiResponse<BlogPost>> {
  return get<ApiResponse<BlogPost>>(`/api/v1/blog/posts/${id}`);
}

export function createBlogPost(data: BlogPostCreate): Promise<ApiResponse<BlogPost>> {
  return post<ApiResponse<BlogPost>>('/api/v1/blog/posts', data);
}

export function updateBlogPost(id: string, data: BlogPostUpdate): Promise<ApiResponse<BlogPost>> {
  return put<ApiResponse<BlogPost>>(`/api/v1/blog/posts/${id}`, data);
}

export function deleteBlogPost(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return del<ApiResponse<{ deleted: boolean }>>(`/api/v1/blog/posts/${id}`);
}

export function publishBlogPost(id: string): Promise<ApiResponse<BlogPost>> {
  return post<ApiResponse<BlogPost>>(`/api/v1/blog/posts/${id}/publish`);
}

export function getHelpArticles(params: HelpArticleListParams): Promise<ApiListResponse<HelpArticle>> {
  return get<ApiListResponse<HelpArticle>>('/api/v1/help-centre/articles', params as unknown as Record<string, string | number | boolean>);
}

export function getHelpArticle(id: string): Promise<ApiResponse<HelpArticle>> {
  return get<ApiResponse<HelpArticle>>(`/api/v1/help-centre/articles/${id}`);
}

export function createHelpArticle(data: HelpArticleCreate): Promise<ApiResponse<HelpArticle>> {
  return post<ApiResponse<HelpArticle>>('/api/v1/help-centre/articles', data);
}

export function updateHelpArticle(id: string, data: HelpArticleUpdate): Promise<ApiResponse<HelpArticle>> {
  return put<ApiResponse<HelpArticle>>(`/api/v1/help-centre/articles/${id}`, data);
}

export function getFaqs(params: FaqListParams): Promise<ApiListResponse<Faq>> {
  return get<ApiListResponse<Faq>>('/api/v1/help-centre/faqs', params as unknown as Record<string, string | number>);
}

export function createFaq(data: FaqCreate): Promise<ApiResponse<Faq>> {
  return post<ApiResponse<Faq>>('/api/v1/help-centre/faqs', data);
}

export function updateFaq(id: string, data: FaqUpdate): Promise<ApiResponse<Faq>> {
  return put<ApiResponse<Faq>>(`/api/v1/help-centre/faqs/${id}`, data);
}

export function deleteFaq(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return del<ApiResponse<{ deleted: boolean }>>(`/api/v1/help-centre/faqs/${id}`);
}

// ---------------------------------------------------------------------------
// PF-15: Content Publishing Pipeline — Review & Unpublish
// ---------------------------------------------------------------------------

/** PF-15 Step 3: Submit content for editorial review. */
export function submitForReview(id: string): Promise<ApiResponse<BlogPost>> {
  return post<ApiResponse<BlogPost>>(`/api/v1/blog/posts/${id}/publish`, { status: 'pending_review' });
}

/** PF-15 Step 3: Approve reviewed content (moves to Published or Scheduled). */
export function approveReview(id: string): Promise<ApiResponse<BlogPost>> {
  return post<ApiResponse<BlogPost>>(`/api/v1/blog/posts/${id}/publish`);
}

/** PF-15 Step 3: Reject reviewed content (moves back to Draft with feedback). */
export function rejectReview(id: string, feedback: string): Promise<ApiResponse<BlogPost>> {
  return post<ApiResponse<BlogPost>>(`/api/v1/blog/posts/${id}/archive`, { feedback });
}

/** PF-15 Step 6: Unpublish a blog post (moves to Draft). */
export function unpublishBlogPost(id: string): Promise<ApiResponse<BlogPost>> {
  return post<ApiResponse<BlogPost>>(`/api/v1/blog/posts/${id}/archive`);
}

/** PF-15 Step 6: Set auto-unpublish date on a blog post. */
export function setAutoUnpublish(id: string, unpublishAt: string): Promise<ApiResponse<BlogPost>> {
  return put<ApiResponse<BlogPost>>(`/api/v1/blog/posts/${id}`, { autoArchiveAt: unpublishAt });
}
