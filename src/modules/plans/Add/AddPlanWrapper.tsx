import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMButton } from '@/shared/ui/ATMButton';
import { Plus } from 'lucide-react';
import { PlanForm } from '../Form/PlanForm';
import { useCreatePlanHook } from '../services/usePlans';
import type { PlanType, PlanStatus, Flavour } from '../types/plan.types';
import {
  PLAN_TYPE_UI_TO_WIRE,
  DEFAULT_STD_MODULES,
  DEFAULT_STD_PAYMENTS,
  DEFAULT_STD_SERVICES,
  DEFAULT_STD_LIMITS,
} from '../types/plan.types';

interface AddPlanWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const planValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Plan Name is required'),
  displayName: Yup.string().trim().required('Display Name is required'),
  planType: Yup.string().oneOf(['Standalone POS', 'Standalone Cloud', 'Enterprise cloud'], 'Select valid plan type').required('Plan type is required'),
  flavour: Yup.string().oneOf(['RES', 'RET', 'BOT'], 'Select a valid flavour').required('Flavour is required'),
  status: Yup.string().oneOf(['Active', 'Inactive', 'Deprecated']).required('Status is required'),
  priority: Yup.number().typeError('Must be a number').integer('Must be an integer').min(1, 'Priority must be at least 1').required('Priority is required'),
  dailyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Daily Price is required'),
  features: Yup.array().of(
    Yup.object().shape({
      text: Yup.string().trim().required('Feature text is required'),
      included: Yup.boolean().default(true),
    })
  ),
  popular: Yup.boolean().default(false),
  isManualPrice: Yup.boolean().default(false),
  manualPrice: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative'),
  priceVariation: Yup.number().typeError('Must be a number'),
});

/**
 * Builds the backend CreatePlanDto payload from Formik state — flattens the on/off dicts
 * (planLimits / planFeatures / planPayments / planServices) into the arrays the API expects
 * ({ code, ...flag }) and maps UI planType strings to their C# enum names.
 */
function buildBackendPayload(values: any) {
  const limitsArray = Object.entries(values.planLimits || {}).map(([LimitCode, MaxValue]) => ({
    LimitCode,
    MaxValue: Number(MaxValue) || 0,
  }));

  // 23 Basic features are always-on server-side; we only submit the 6 Advance toggles.
  const featuresArray = Object.entries(values.planFeatures || {}).map(([FeatureCode, IsIncluded]) => ({
    FeatureCode,
    IsIncluded: !!IsIncluded,
    ShowOnWebsite: !!IsIncluded,
  }));

  const paymentsArray = Object.entries(values.planPayments || {}).map(([PaymentCode, IsIncluded]) => ({
    PaymentCode,
    IsIncluded: !!IsIncluded,
  }));

  const servicesArray = Object.entries(values.planServices || {}).map(([ServiceCode, IsIncluded]) => ({
    ServiceCode,
    IsIncluded: !!IsIncluded,
  }));

  return {
    // Backend CreatePlanDto: PlanCode, PlanName, DisplayName, PlanType, Flavour, Description,
    // CommissionPercent, DiscountType, DiscountValue, IsPublic, SortOrder, MarketingBullets[],
    // Limits[], Features[], Payments[], Services[].
    PlanCode: values.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    PlanName: values.name.trim(),
    DisplayName: values.displayName.trim(),
    PlanType: PLAN_TYPE_UI_TO_WIRE[values.planType as PlanType],
    Flavour: values.flavour as Flavour,
    Description: '',
    CommissionPercent: 0,
    DiscountType: 0, // None
    DiscountValue: 0,
    IsPublic: values.status === 'Active',
    SortOrder: Number(values.priority) || 1,
    // Marketing bullet editor rows — unchecked rows are dropped on save.
    MarketingBullets: (values.features || [])
      .filter((f: any) => f.included && f.text?.trim())
      .map((f: any) => f.text.trim()),
    Limits: limitsArray,
    Features: featuresArray,
    Payments: paymentsArray,
    Services: servicesArray,
    // The effective daily price shown in the form (manual override or rate-card
    // preview). Server rule mirrors UpdateAsync Q11(b): > 0 wins, 0 ⇒ server auto-calc.
    PlanPricePerDay: Number(values.isManualPrice ? values.manualPrice : values.dailyPrice) || 0,
    // 2026-08-30: the old extra fields `dailyPrice` + `features` are GONE — "backend
    // ignores unknown fields" was wrong: JSON binding is case-INSENSITIVE, so the junk
    // lowercase `features` (marketing rows {text, included}) clobbered the real
    // `Features` array, deserializing PlanFeature rows with EMPTY FeatureCode →
    // SQLite FK violation → every create 500'd.
  };
}

export const AddPlanWrapper: React.FC<AddPlanWrapperProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createPlanMutation = useCreatePlanHook();

  const formik = useFormik({
    initialValues: {
      name: '',
      displayName: '',
      planType: 'Standalone POS' as PlanType,
      flavour: 'RES' as Flavour,
      priority: 1,
      status: 'Active' as PlanStatus,
      dailyPrice: '',
      weeklyPrice: '',
      monthlyPrice: '',
      yearlyPrice: '',
      priceVariation: 0,
      features: [
        { text: 'On-prem Standalone POS install', included: true },
        { text: 'Multi-terminal support', included: true },
        { text: 'Real-time inventory sync', included: true },
      ],
      planFeatures: { ...DEFAULT_STD_MODULES },
      planPayments: { ...DEFAULT_STD_PAYMENTS },
      planServices: { ...DEFAULT_STD_SERVICES },
      planLimits: { ...DEFAULT_STD_LIMITS },
      popular: false,
      isManualPrice: false,
      manualPrice: '',
    },
    validationSchema: planValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = buildBackendPayload(values);
        const res = await createPlanMutation.mutateAsync(payload as any);
        const newPlan = (res as any)?.data;

        toast.success(`Plan "${values.name.trim()}" created successfully.`);
        resetForm();
        onClose();
        if (onSuccess) {
          if (newPlan) (onSuccess as any)(newPlan);
          else onSuccess();
        }
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || 'Failed to create plan.');
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
      title="Create New Subscription Plan"
      subtitle="Configure deployment mode, flavour, limits, features, payments, and service types — matches the V3 token structure."
      size="3xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <ATMButton
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={createPlanMutation.isPending}
          >
            Cancel
          </ATMButton>
          <ATMButton
            type="button"
            variant="primary"
            onClick={() => formik.handleSubmit()}
            isLoading={createPlanMutation.isPending}
            icon={Plus}
          >
            Create Plan
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
export default AddPlanWrapper;
