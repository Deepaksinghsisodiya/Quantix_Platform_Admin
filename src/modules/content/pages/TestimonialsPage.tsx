import React from 'react';
import { toast } from 'sonner';

import { WebsiteContentCollection, type CollectionDescriptor } from '../components/WebsiteContentCollection';
import {
  useGetTestimonialsQuery,
  useSaveTestimonialMutation,
  useDeleteTestimonialMutation,
  type Testimonial,
} from '../services/websiteContentApi';

/**
 * Testimonials — 2026-09-05 (content Phase 3).
 *
 * Before this, a testimonial was a row in the shared CmsContent table with a title, a body, an
 * image and a link. There was no field for the person's name, their role, their company or a
 * rating, so the convention would have been to hide the name in the title and the quote in the
 * body, and nothing said so. Those are real columns now.
 *
 * Page title matches the sidebar label verbatim.
 */

const descriptor: CollectionDescriptor<Testimonial> = {
  title: 'Testimonials',
  subtitle: 'Customer quotes and ratings shown on the website.',
  noun: 'testimonial',
  idOf: (t) => t.testimonialId,
  subtitleOf: (t) =>
    [t.personName, t.personRole, t.companyName].filter(Boolean).join(' · ') || 'No attribution',
  badgesOf: (t) => {
    const badges: string[] = [];
    if (t.rating) badges.push(`${t.rating}/5`);
    if (t.merchantType) badges.push(t.merchantType);
    return badges;
  },
  mediaFolder: 'testimonials',
  fields: [
    { key: 'personName', label: 'Person', type: 'text', required: true, helperText: 'Who gave the testimonial.' },
    { key: 'personRole', label: 'Their role', type: 'text' },
    { key: 'companyName', label: 'Company', type: 'text' },
    { key: 'body', label: 'Quote', type: 'textarea' },
    { key: 'rating', label: 'Rating (1-5)', type: 'number', helperText: 'Leave 0 for a quote with no rating.' },
    {
      key: 'merchantType',
      label: 'Speaks to',
      type: 'select',
      options: [
        { value: 'Enterprise', label: 'Enterprise merchants' },
        { value: 'Standalone', label: 'Standalone merchants' },
      ],
      helperText: 'Leave unset to show on every page.',
    },
  ],
  emptyExtra: { personName: '', personRole: '', companyName: '', rating: 0, merchantType: '' },
  extraOf: (t) => ({
    personName: t.personName ?? '',
    personRole: t.personRole ?? '',
    companyName: t.companyName ?? '',
    rating: t.rating ?? 0,
    merchantType: t.merchantType ?? '',
  }),
};

function TestimonialsPage() {
  const query = useGetTestimonialsQuery();
  const [save, saveState] = useSaveTestimonialMutation();
  const [remove] = useDeleteTestimonialMutation();

  return (
    <WebsiteContentCollection<Testimonial>
      descriptor={descriptor}
      rows={query.data?.data ?? []}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => { void query.refetch(); }}
      isSaving={saveState.isLoading}
      onSave={async (payload, id) => {
        // 0 means "no rating", which the API models as null.
        const body = { ...payload, rating: payload.rating ? Number(payload.rating) : null };
        await save({ id, ...body }).unwrap();
        toast.success(id ? 'Testimonial saved.' : 'Testimonial added.');
      }}
      onDelete={async (id) => {
        await remove(id).unwrap();
        toast.success('Testimonial deleted.');
      }}
    />
  );
}

export default TestimonialsPage;
