import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import { toast } from 'sonner';

import { useUpdateAnnouncementMutation } from '../Service/AnnouncementService';
import { AnnouncementForm } from '../Form/AnnouncementForm';
import { announcementValidationSchema } from '../Add/AddAnnouncementWrapper';
import type { Announcement, AnnouncementFormValues, SaveAnnouncementDto } from '../Model/AnnouncementTypes';

interface EditAnnouncementWrapperProps {
  announcement: Announcement;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditAnnouncementWrapper: React.FC<EditAnnouncementWrapperProps> = ({
  announcement,
  onSuccess,
  onCancel,
}) => {
  const [updateAnnouncement, updateState] = useUpdateAnnouncementMutation();

  const initialValues: AnnouncementFormValues = {
    siteVariant: announcement.siteVariant || 'Enterprise',
    kind: announcement.kind || 'Promo',
    badge: announcement.badge || '',
    title: announcement.title || '',
    body: announcement.body || '',
    linkUrl: announcement.linkUrl || '',
    ctaLabel: announcement.ctaLabel || '',
    isPinned: announcement.isPinned || false,
    sortOrder: announcement.sortOrder ?? 1,
    isActive: announcement.isActive ?? true,
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
      const res = await updateAnnouncement({
        id: announcement.id,
        ...payload,
      }).unwrap();

      if (res?.success) {
        toast.success('Announcement updated successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to update announcement');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error updating announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={announcementValidationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <AnnouncementForm
          formikProps={formikProps}
          isEdit={true}
          onCancel={onCancel}
          isLoading={updateState.isLoading}
        />
      )}
    </Formik>
  );
};
