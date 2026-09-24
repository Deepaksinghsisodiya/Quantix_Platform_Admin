import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import { toast } from 'sonner';

import { useUpdateClientBrandMutation } from '../Service/ClienteleService';
import { ClienteleForm } from '../Form/ClienteleForm';
import { clienteleValidationSchema } from '../Add/AddClienteleWrapper';
import type { ClientBrand, ClienteleFormValues, SaveClientBrandDto } from '../Model/ClienteleTypes';

interface EditClienteleWrapperProps {
  brand: ClientBrand;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditClienteleWrapper: React.FC<EditClienteleWrapperProps> = ({
  brand,
  onSuccess,
  onCancel,
}) => {
  const [updateBrand, updateState] = useUpdateClientBrandMutation();

  const initialValues: ClienteleFormValues = {
    siteVariant: brand.siteVariant || 'Enterprise',
    name: brand.name || brand.title || '',
    category: brand.category || 'Enterprise',
    industry: brand.industry || '',
    logoUrl: brand.logoUrl || '',
    websiteUrl: brand.websiteUrl || brand.linkUrl || '',
    tier: brand.tier || 'Enterprise',
    locationsCount: brand.locationsCount ?? '',
    isFeatured: brand.isFeatured || false,
    sortOrder: brand.sortOrder ?? 1,
    isActive: brand.isActive ?? true,
  };

  const handleFormSubmit = async (
    values: ClienteleFormValues,
    { setSubmitting }: FormikHelpers<ClienteleFormValues>
  ) => {
    const loc = values.locationsCount === '' || values.locationsCount === undefined || values.locationsCount === null
      ? null
      : Number(values.locationsCount);

    const payload: SaveClientBrandDto = {
      siteVariant: values.siteVariant,
      name: values.name.trim(),
      category: values.category,
      industry: values.industry.trim() || null,
      logoUrl: values.logoUrl.trim() || null,
      websiteUrl: values.websiteUrl.trim() || null,
      tier: values.tier || 'Enterprise',
      locationsCount: loc !== null && !isNaN(loc) ? loc : null,
      isFeatured: values.isFeatured,
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    };

    try {
      const res = await updateBrand({
        id: brand.brandId || brand.id,
        ...payload,
      }).unwrap();

      if (res?.success) {
        toast.success('Brand partner updated successfully');
        onSuccess();
      } else {
        toast.error(res?.message || 'Failed to update brand');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Network error updating brand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={clienteleValidationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <ClienteleForm
          formikProps={formikProps}
          isEdit={true}
          onCancel={onCancel}
          isLoading={updateState.isLoading}
        />
      )}
    </Formik>
  );
};
