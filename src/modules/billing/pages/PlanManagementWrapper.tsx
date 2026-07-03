import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { usePlans, useCreatePlan } from '../services/useBilling';
import { PlanManagementView } from './PlanManagementView';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature[];
  merchantCount: number;
  status: 'Active' | 'Deprecated' | 'Draft';
  color: string;
  popular?: boolean;
}

const PLAN_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

const planValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Plan Name is required'),
  tier: Yup.string().trim().required('Tier is required'),
  monthlyPrice: Yup.number().min(0, 'Price cannot be negative').required('Monthly Price is required'),
  annualPrice: Yup.number().min(0, 'Price cannot be negative').required('Annual Price is required'),
  trialPeriod: Yup.number().min(0, 'Trial period cannot be negative'),
  maxLocations: Yup.number().min(1, 'At least 1 location is required').required('Max locations required'),
  maxTerminals: Yup.number().min(1, 'At least 1 terminal is required').required('Max terminals required'),
  features: Yup.array().of(Yup.string().trim().required('Feature description is required')),
});

export const PlanManagementWrapper: React.FC = () => {
  const plansQuery = usePlans();
  const createPlanMutation = useCreatePlan();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Adapter: SubscriptionPlan from server -> Plan DTO for View
  const plans: Plan[] = React.useMemo(() => {
    const rawData = plansQuery.data?.data;
    const apiPlans = Array.isArray(rawData) ? rawData : Array.isArray(plansQuery.data) ? (plansQuery.data as any[]) : [];
    return apiPlans.map((p: any, idx: number) => ({
      id: p.id,
      name: p.name,
      monthlyPrice: p.monthlyPrice ?? 0,
      annualPrice: p.annualPrice ?? 0,
      features: (Array.isArray(p.features) ? p.features : []).map((text: string) => ({ text, included: true })),
      merchantCount: 0,
      status: p.isActive ? 'Active' : 'Deprecated',
      color: PLAN_COLORS[idx % PLAN_COLORS.length] ?? '#6b7280',
      popular: false,
    }));
  }, [plansQuery.data]);

  const formik = useFormik({
    initialValues: {
      name: '',
      tier: '',
      monthlyPrice: '',
      annualPrice: '',
      trialPeriod: 14,
      maxLocations: '',
      maxTerminals: '',
      features: [''],
    },
    validationSchema: planValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const filteredFeatures = values.features.filter((f) => f.trim().length > 0);
        await createPlanMutation.mutateAsync({
          name: values.name.trim(),
          tier: values.tier.trim(),
          monthlyPrice: parseFloat(values.monthlyPrice),
          annualPrice: parseFloat(values.annualPrice),
          currency: 'USD',
          features: filteredFeatures,
          maxLocations: parseInt(values.maxLocations || '1', 10),
          maxTerminals: parseInt(values.maxTerminals || '1', 10),
        });

        toast.success(`Plan ${values.name.trim()} created.`);
        setDrawerOpen(false);
        resetForm();
      } catch (err: any) {
        const serverError = err?.data?.message || err?.message || 'Failed to create plan.';
        toast.error(serverError);
      }
    },
  });

  const addFeature = () => {
    formik.setFieldValue('features', [...formik.values.features, '']);
  };

  const removeFeature = (idx: number) => {
    formik.setFieldValue(
      'features',
      formik.values.features.filter((_, i) => i !== idx)
    );
  };

  const updateFeature = (idx: number, value: string) => {
    const updated = [...formik.values.features];
    updated[idx] = value;
    formik.setFieldValue('features', updated);
  };

  return (
    <PlanManagementView
      plans={plans}
      isLoading={plansQuery.isLoading}
      isError={plansQuery.isError}
      refetch={plansQuery.refetch}
      drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen}
      formik={formik}
      addFeature={addFeature}
      removeFeature={removeFeature}
      updateFeature={updateFeature}
      isSubmitting={createPlanMutation.isPending}
    />
  );
};
