import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { HowItWorksForm } from '../Form/HowItWorksForm';
import { useUpdateHowItWorksStepMutation } from '../Service/HowItWorksService';
import type { HowItWorksFormValues, HowItWorksStepItem, SaveHowItWorksStepDto } from '../Model/HowItWorksTypes';

interface EditHowItWorksWrapperProps {
  step: HowItWorksStepItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').trim(),
  stepNumber: Yup.string().required('Step number is required').trim(),
  badgeLabel: Yup.string().required('Badge label is required').trim(),
});

export const EditHowItWorksWrapper: React.FC<EditHowItWorksWrapperProps> = ({
  step,
  onSuccess,
  onCancel,
}) => {
  const [updateStep, { isLoading }] = useUpdateHowItWorksStepMutation();

  const chip1 = step.telemetryChips?.[0];
  const chip2 = step.telemetryChips?.[1];

  const initialValues: HowItWorksFormValues = {
    siteVariant: step.siteVariant || 'Enterprise',
    stepNumber: step.stepNumber || step.number || '01',
    badgeLabel: step.badgeLabel || '',
    title: step.title || '',
    description: step.description || '',
    imageUrl: step.imageUrl || step.imageSrc || '',
    imageAlt: step.imageAlt || '',
    bulletsText: Array.isArray(step.bullets) ? step.bullets.join('\n') : '',
    statValue: step.stat?.value || step.statValue || '',
    statLabel: step.stat?.label || step.statLabel || '',
    chip1Label: chip1?.label || '',
    chip1Sublabel: chip1?.sublabel || '',
    chip1Status: chip1?.status || 'active',
    chip2Label: chip2?.label || '',
    chip2Sublabel: chip2?.sublabel || '',
    chip2Status: chip2?.status || 'verified',
    sortOrder: step.sortOrder || 0,
    isActive: step.isActive ?? true,
  };

  const handleSubmit = async (values: HowItWorksFormValues) => {
    try {
      const bullets = values.bulletsText
        ? values.bulletsText
            .split('\n')
            .map((b) => b.trim())
            .filter(Boolean)
        : [];

      const telemetryChips = [];
      if (values.chip1Label) {
        telemetryChips.push({
          label: values.chip1Label.trim(),
          sublabel: values.chip1Sublabel.trim(),
          status: values.chip1Status,
        });
      }
      if (values.chip2Label) {
        telemetryChips.push({
          label: values.chip2Label.trim(),
          sublabel: values.chip2Sublabel.trim(),
          status: values.chip2Status,
        });
      }

      const dto: SaveHowItWorksStepDto = {
        siteVariant: values.siteVariant,
        stepNumber: values.stepNumber,
        badgeLabel: values.badgeLabel,
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl,
        imageAlt: values.imageAlt,
        bullets,
        stat: {
          value: values.statValue,
          label: values.statLabel,
        },
        statValue: values.statValue,
        statLabel: values.statLabel,
        telemetryChips,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };

      const stepId = step.stepId || step.id;
      await updateStep({ id: stepId, ...dto }).unwrap();
      toast.success(`Step "${values.title}" updated successfully.`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update step.');
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <HowItWorksForm
          formikProps={formikProps}
          isEdit={true}
          onCancel={onCancel}
          isLoading={isLoading}
        />
      )}
    </Formik>
  );
};

export default EditHowItWorksWrapper;
