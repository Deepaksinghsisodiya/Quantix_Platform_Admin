import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { HowItWorksForm } from '../Form/HowItWorksForm';
import { useCreateHowItWorksStepMutation } from '../Service/HowItWorksService';
import type { HowItWorksFormValues, SiteVariantTab, SaveHowItWorksStepDto } from '../Model/HowItWorksTypes';

interface AddHowItWorksWrapperProps {
  siteVariant: SiteVariantTab;
  defaultSortOrder: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').trim(),
  stepNumber: Yup.string().required('Step number is required').trim(),
  badgeLabel: Yup.string().required('Badge label is required').trim(),
});

export const AddHowItWorksWrapper: React.FC<AddHowItWorksWrapperProps> = ({
  siteVariant,
  defaultSortOrder,
  onSuccess,
  onCancel,
}) => {
  const [createStep, { isLoading }] = useCreateHowItWorksStepMutation();

  const initialValues: HowItWorksFormValues = {
    siteVariant,
    stepNumber: `0${defaultSortOrder}`,
    badgeLabel: `Step 0${defaultSortOrder} — `,
    title: '',
    description: '',
    imageUrl: '',
    imageAlt: '',
    bulletsText: '',
    statValue: '',
    statLabel: '',
    chip1Label: '',
    chip1Sublabel: '',
    chip1Status: 'active',
    chip2Label: '',
    chip2Sublabel: '',
    chip2Status: 'verified',
    sortOrder: defaultSortOrder,
    isActive: true,
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

      await createStep(dto).unwrap();
      toast.success(`Step "${values.title}" created successfully.`);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create step.');
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
          isEdit={false}
          onCancel={onCancel}
          isLoading={isLoading}
        />
      )}
    </Formik>
  );
};

export default AddHowItWorksWrapper;
