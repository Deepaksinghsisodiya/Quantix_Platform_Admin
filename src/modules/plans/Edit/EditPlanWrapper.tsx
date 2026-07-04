import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMButton } from '@/shared/ui/ATMButton';
import { Pencil } from 'lucide-react';
import { PlanForm } from '../Form/PlanForm';
import { useUpdatePlanHook } from '../services/usePlans';
import type { Plan, PlanType, PlanStatus } from '../types/plan.types';
import {
  DEFAULT_ENT_MODULES,
  DEFAULT_ENT_PAYMENTS,
  DEFAULT_ENT_SERVICES,
  DEFAULT_ENT_LIMITS,
  DEFAULT_STD_MODULES,
  DEFAULT_STD_PAYMENTS,
  DEFAULT_STD_SERVICES,
  DEFAULT_STD_LIMITS,
} from '../types/plan.types';

interface EditPlanWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onSuccess?: () => void;
}

const planValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Plan Name is required'),
  planType: Yup.string().oneOf(['Standalone POS', 'Standalone Cloud', 'Enterprise cloud'], 'Select valid plan type').required('Plan type is required'),
  status: Yup.string().oneOf(['Active', 'Inactive', 'Deprecated']).required('Status is required'),
  priority: Yup.number().typeError('Must be a number').integer('Must be an integer').min(1, 'Priority must be at least 1').required('Priority is required'),
  dailyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Daily Price is required'),
  weeklyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Weekly Price is required'),
  monthlyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Monthly Price is required'),
  yearlyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Yearly Price is required'),
  trialPeriod: Yup.number().typeError('Must be a number').min(0, 'Trial period cannot be negative'),
  maxLocations: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Max locations required'),
  maxTerminals: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Max terminals required'),
  features: Yup.array().of(
    Yup.object().shape({
      text: Yup.string().trim().required('Feature text is required'),
      included: Yup.boolean().default(true),
    })
  ),
  popular: Yup.boolean().default(false),
  isManualPrice: Yup.boolean().default(false),
  manualPrice: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative'),
});

export const EditPlanWrapper: React.FC<EditPlanWrapperProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess,
}) => {
  const updatePlanMutation = useUpdatePlanHook();

  const formik = useFormik({
    initialValues: {
      name: plan?.name || '',
      planType: (plan?.planType || 'Enterprise cloud') as PlanType,
      priority: plan?.priority ?? 1,
      status: (plan?.status || 'Active') as PlanStatus,
      dailyPrice: plan?.dailyPrice ? String(plan.dailyPrice) : '',
      weeklyPrice: plan?.weeklyPrice ? String(plan.weeklyPrice) : '',
      monthlyPrice: plan?.monthlyPrice ? String(plan.monthlyPrice) : '',
      yearlyPrice: plan?.yearlyPrice ? String(plan.yearlyPrice) : '',
      trialPeriod: plan?.trialPeriod ?? 14,
      maxLocations: plan?.maxLocations ?? 1,
      maxTerminals: plan?.maxTerminals ?? 1,
      features: plan?.features?.length
        ? plan.features.map((f) => ({ text: f.text, included: f.included }))
        : [{ text: '', included: true }],
      planFeatures: plan?.planFeatures ? { ...plan.planFeatures } : (plan?.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_MODULES } : { ...DEFAULT_ENT_MODULES }),
      planPayments: plan?.planPayments ? { ...plan.planPayments } : (plan?.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_PAYMENTS } : { ...DEFAULT_ENT_PAYMENTS }),
      planServices: plan?.planServices ? { ...plan.planServices } : (plan?.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_SERVICES } : { ...DEFAULT_ENT_SERVICES }),
      planLimits: plan?.planLimits ? { ...plan.planLimits } : (plan?.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_LIMITS } : { ...DEFAULT_ENT_LIMITS }),
      popular: !!plan?.popular,
      isManualPrice: plan?.isManualPrice || false,
      manualPrice: plan?.manualPrice || '',
    },
    enableReinitialize: true,
    validationSchema: planValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!plan) return;
      try {
        const cleanedFeatures = values.features
          .filter((f) => f.text.trim().length > 0)
          .map((f) => ({ text: f.text.trim(), included: f.included }));

        const manualVal = Number(values.manualPrice || 0);
        const dailyVal = values.isManualPrice ? Number((manualVal / 30).toFixed(2)) : Number(values.dailyPrice);
        const weeklyVal = values.isManualPrice ? Number((manualVal / 4).toFixed(2)) : Number(values.weeklyPrice);
        const monthlyVal = values.isManualPrice ? manualVal : Number(values.monthlyPrice);
        const yearlyVal = values.isManualPrice ? Number((manualVal * 10).toFixed(2)) : Number(values.yearlyPrice);

        const res = await updatePlanMutation.mutateAsync({
          id: plan.id,
          name: values.name.trim(),
          planType: values.planType,
          priority: Number(values.priority),
          status: values.status,
          dailyPrice: dailyVal,
          weeklyPrice: weeklyVal,
          monthlyPrice: monthlyVal,
          yearlyPrice: yearlyVal,
          trialPeriod: Number(values.trialPeriod || 0),
          features: cleanedFeatures,
          maxLocations: Number(values.maxLocations || 1),
          maxTerminals: Number(values.maxTerminals || 1),
          planFeatures: values.planFeatures,
          planPayments: values.planPayments,
          planServices: values.planServices,
          planLimits: values.planLimits,
          popular: values.popular,
          isManualPrice: values.isManualPrice,
          manualPrice: manualVal,
        } as any);

        const updatedPlan = res?.data;

        toast.success(`Plan "${values.name.trim()}" updated successfully.`);
        resetForm();
        onClose();
        if (onSuccess) {
          if (updatedPlan) (onSuccess as any)(updatedPlan);
          else onSuccess();
        }
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || 'Failed to update plan.');
      }
    },
  });

  const addFeatureRow = () => {
    formik.setFieldValue('features', [...formik.values.features, { text: '', included: true }]);
  };

  const removeFeatureRow = (index: number) => {
    formik.setFieldValue(
      'features',
      formik.values.features.filter((_, i) => i !== index)
    );
  };

  const toggleFeatureIncluded = (index: number) => {
    const updated = [...formik.values.features];
    if (updated[index]) {
      updated[index] = { ...updated[index], included: !updated[index].included };
      formik.setFieldValue('features', updated);
    }
  };

  return (
    <ATMModal
      isOpen={isOpen}
      onClose={onClose}
      title={plan ? `Edit Subscription Plan: ${plan.name}` : 'Edit Subscription Plan'}
      subtitle="Update pricing, features, limits, and status for merchants"
      size="4xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full border-t border-gray-100 dark:border-gray-800 pt-4">
          <ATMButton
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={updatePlanMutation.isPending}
          >
            Cancel
          </ATMButton>
          <ATMButton
            type="button"
            variant="primary"
            onClick={() => formik.handleSubmit()}
            isLoading={updatePlanMutation.isPending}
            icon={Pencil}
          >
            Save Changes
          </ATMButton>
        </div>
      }
    >
      <PlanForm
        formik={formik}
        addFeatureRow={addFeatureRow}
        removeFeatureRow={removeFeatureRow}
        toggleFeatureIncluded={toggleFeatureIncluded}
      />
    </ATMModal>
  );
};
export default EditPlanWrapper;
