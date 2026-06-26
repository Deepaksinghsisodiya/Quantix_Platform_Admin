import {
  useGetBlogPostsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useGetHelpArticlesQuery,
  useGetFaqsQuery,
  useGetMarketingContentQuery,
  useUpdateMarketingContentMutation,
  useDeleteBlogPostMutation,
  useScheduleBlogPostMutation,
  useDeleteHelpArticleMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
  useSubmitForReviewMutation,
  useApproveReviewMutation,
  useRejectReviewMutation,
  useUnpublishBlogPostMutation,
  useSetAutoUnpublishMutation,
  type BlogPostParams,
  type CreateBlogPostDto,
  type UpdateBlogPostDto,
  type HelpArticleParams,
  type FaqParams,
} from '@/modules/content/services/contentApi';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useBlogPosts(params: BlogPostParams = {}) {
  return useGetBlogPostsQuery(params);
}

export function useBlogPost(id: string | undefined) {
  return useGetBlogPostQuery(id ?? '', {
    skip: !id,
  });
}

export function useCreateBlogPost() {
  const [trigger, result] = useCreateBlogPostMutation();
  return wrapMutation(trigger, result);
}

export function useUpdateBlogPost() {
  const [trigger, result] = useUpdateBlogPostMutation();
  return wrapMutation(trigger, result);
}

export function useHelpArticles(params: HelpArticleParams = {}) {
  return useGetHelpArticlesQuery(params);
}

export function useFaqs(params: FaqParams = {}) {
  return useGetFaqsQuery(params);
}

export function useMarketingContent() {
  return useGetMarketingContentQuery();
}

/** FRS-SAP-1101: Update marketing content section. */
export function useUpdateMarketingContent() {
  const [trigger, result] = useUpdateMarketingContentMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-1102: Delete a blog post. */
export function useDeleteBlogPost() {
  const [trigger, result] = useDeleteBlogPostMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-1105: Schedule a blog post for future publication. */
export function useScheduleBlogPost() {
  const [trigger, result] = useScheduleBlogPostMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-1103: Delete a help article. */
export function useDeleteHelpArticle() {
  const [trigger, result] = useDeleteHelpArticleMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-1104: Delete a FAQ entry. */
export function useDeleteFaq() {
  const [trigger, result] = useDeleteFaqMutation();
  return wrapMutation(trigger, result);
}

/** FRS-SAP-1104: Reorder FAQ entries. */
export function useReorderFaqs() {
  const [trigger, result] = useReorderFaqsMutation();
  return wrapMutation(trigger, result);
}

// ---------------------------------------------------------------------------
// PF-15: Content Publishing Pipeline — Review & Unpublish
// ---------------------------------------------------------------------------

/** PF-15 Step 3: Submit a blog post for editorial review. */
export function useSubmitForReview() {
  const [trigger, result] = useSubmitForReviewMutation();
  return wrapMutation(trigger, result);
}

/** PF-15 Step 3: Approve reviewed content (moves to Published or Scheduled). */
export function useApproveReview() {
  const [trigger, result] = useApproveReviewMutation();
  return wrapMutation(trigger, result);
}

/** PF-15 Step 3: Reject reviewed content with feedback (moves back to Draft). */
export function useRejectReview() {
  const [trigger, result] = useRejectReviewMutation();
  return wrapMutation(trigger, result);
}

/** PF-15 Step 6: Unpublish a blog post (moves to Draft). */
export function useUnpublishBlogPost() {
  const [trigger, result] = useUnpublishBlogPostMutation();
  return wrapMutation(trigger, result);
}

/** PF-15 Step 6: Set auto-unpublish date on a blog post. */
export function useSetAutoUnpublish() {
  const [trigger, result] = useSetAutoUnpublishMutation();
  return wrapMutation(trigger, result);
}

