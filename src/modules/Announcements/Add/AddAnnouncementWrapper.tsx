import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useCreateAnnouncementMutation } from '../Service/AnnouncementService';
import { AnnouncementForm } from '../Form/AnnouncementForm';
import type { AnnouncementFormValues, SaveAnnouncementDto } from '../Model/AnnouncementTypes';

export const announcementValidationSchema = Yup.object().shape({
  siteVariant: Yup.string().required('Target website is required'),
  kind: Yup.string().required('Category/kind is required'),
  badge: Yup.string().trim().required('Badge label is required (e.g. Limited Offer)'),
  title: Yup.string().trim().required('Headline is required'),
  body: Yup.string().trim().nullable(),
  linkUrl: Yup.string().trim().nullable(),
  ctaLabel: Yup.string().trim().nullable(),
  sortOrder: Yup.number().typeError('Order must be a number').min(0, 'Order must be at least 0').required('Order is required'),
  isPinned: Yup.boolean().required(),
  isActive: Yup.boolean().required(),
});

interface AddAnnouncementWrapperProps {
  siteVariant?: string;
  defaultSortOrder?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddAnnouncementWrapper: React.FC<AddAnnouncementWrapperProps> = ({
  siteVariant = 'Enterprise',
  defaultSortOrder = 1,
  onSuccess,
  onCancel,
}) => {
  const [createAnnouncement, createState] = useCreateAnnouncementMutation();

  const initialValues: AnnouncementFormValues = {
    siteVariant,
    kind: 'Promo',
    badge: 'Limited Offer',
    title: '',
    body: '',
    linkUrl: '',
    ctaLabel: 'Claim Offer',
    isPinned: false,
    sortOrder: defaultSortOrder,
    isActive: true,
  };

  const handleFormSubmit = async (
    values: AnnouncementFormValues,
    { setSubmitting }: FormikHelpers<AnnouncementFormValues>
  ) => {
    const payload: SaveAnnouncementDto = {
      siteVariant: values.siteVariant,
      kind: values.kind,
      badge: values.badge.trim(),
      title: values.title.trim(),
      body: values.body.trim() || null,
      linkUrl: values.linkUrl.trim() || null,
      ctaLabel: values.ctaLabel.trim() || null,
      isPinned: values.isPinned,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      const res = await createAnnouncement(payload).unwrap();
      if (res?.success) {
        toast.success('Announcement banner created successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to create announcement');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error creating announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={announcementValidationSchema}
      onSubmit={handleFormSubmit}
    >
      {(formikProps) => (
        <AnnouncementForm
          formikProps={formikProps}
          isEdit={false}
          onCancel={onCancel}
          isLoading={createState.isLoading}
        />
      )}
    </Formik>
  );
};
