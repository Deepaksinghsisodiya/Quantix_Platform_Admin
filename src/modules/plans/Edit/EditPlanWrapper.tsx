import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMButton } from '@/shared/ui/ATMButton';
import { Pencil } from 'lucide-react';
import { PlanForm } from '../Form/PlanForm';
import { useUpdatePlanHook, usePlan } from '../services/usePlans';
import type { Plan, PlanType, PlanStatus, Flavour } from '../types/plan.types';
import {
  PLAN_TYPE_WIRE_TO_UI,
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
 * Server PlanDto children arrive as arrays ({ limitCode, maxValue } / { featureCode,
 * isIncluded } / …); PlanForm edits flat on-off dicts. Each dict starts from the known
 * code set so a plan missing a code still renders every toggle.
 */
function limitsToDict(rows: any[] | undefined): Record<string, number> {
  const dict: Record<string, number> = { ...DEFAULT_STD_LIMITS };
  rows?.forEach((r) => { if (r.limitCode in dict) dict[r.limitCode] = Number(r.maxValue) || 0; });
  return dict;
}

function rowsToBoolDict(
  rows: any[] | undefined,
  codeField: string,
  // PlanModules / PlanPayments / PlanServices are fixed-key interfaces without an index
  // signature, so accept any object and read its keys.
  knownCodes: object
): Record<string, boolean> {
  const dict: Record<string, boolean> = Object.fromEntries(
    Object.keys(knownCodes).map((k) => [k, false])
  );
  rows?.forEach((r) => { if (r[codeField] in dict) dict[r[codeField]] = !!r.isIncluded; });
  return dict;
}

export const EditPlanWrapper: React.FC<EditPlanWrapperProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess,
}) => {
  const updatePlanMutation = useUpdatePlanHook();
  // Summary rows carry no children — fetch the full PlanDto so limits/features/payments/
  // services prefill from the server instead of silently resetting to defaults on save.
  const detailQuery = usePlan(isOpen && plan ? plan.id : undefined);
  const detail: any = (detailQuery.data as any)?.data;

  const formik = useFormik({
    initialValues: {
      name: detail?.planName ?? plan?.name ?? '',
      displayName: detail?.displayName ?? '',
      planType: (detail?.planType
        ? PLAN_TYPE_WIRE_TO_UI[detail.planType as keyof typeof PLAN_TYPE_WIRE_TO_UI]
        : plan?.planType || 'Enterprise cloud') as PlanType,
      flavour: (detail?.flavour ?? plan?.flavour ?? 'BOT') as Flavour,
      priority: detail?.sortOrder ?? plan?.priority ?? 1,
      status: (detail
        ? (detail.isDeprecated ? 'Deprecated' : detail.isActive ? 'Active' : 'Inactive')
        : plan?.status || 'Active') as PlanStatus,
      dailyPrice: detail?.planPricePerDay != null
        ? String(detail.planPricePerDay)
        : plan?.dailyPrice != null ? String(plan.dailyPrice) : '',
      weeklyPrice: '',
      monthlyPrice: '',
      yearlyPrice: '',
      priceVariation: 0,
      features: detail?.marketingBullets?.length
        ? detail.marketingBullets.map((t: string) => ({ text: t, included: true }))
        : [{ text: '', included: true }],
      planFeatures: rowsToBoolDict(detail?.features, 'featureCode', DEFAULT_STD_MODULES),
      planPayments: rowsToBoolDict(detail?.payments, 'paymentCode', DEFAULT_STD_PAYMENTS),
      planServices: rowsToBoolDict(detail?.services, 'serviceCode', DEFAULT_STD_SERVICES),
      planLimits: limitsToDict(detail?.limits),
      popular: !!plan?.popular,
      isManualPrice: false,
      manualPrice: '',
    },
    enableReinitialize: true,
    validationSchema: planValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!plan) return;
      try {
        // Backend UpdatePlanDto — PlanType is immutable after creation, so it is not sent.
        // Fields without a form control (description, commission, marketing discount) pass
        // through from the fetched detail so a save never wipes them.
        const payload = {
          id: plan.id,
          PlanName: values.name.trim(),
          DisplayName: values.displayName.trim(),
          Flavour: values.flavour,
          Description: detail?.description ?? '',
          CommissionPercent: detail?.commissionPercent ?? 0,
          DiscountType: detail?.discountType ?? 'None',
          DiscountValue: detail?.discountValue ?? 0,
          PlanPricePerDay: Number(values.dailyPrice) || 0,
          IsActive: values.status === 'Active',
          IsPublic: values.status === 'Active',
          SortOrder: Number(values.priority) || 1,
          MarketingBullets: (values.features || [])
            .filter((f: any) => f.included && f.text?.trim())
            .map((f: any) => f.text.trim()),
          Limits: Object.entries(values.planLimits || {}).map(([LimitCode, MaxValue]) => ({
            LimitCode,
            MaxValue: Number(MaxValue) || 0,
          })),
          Features: Object.entries(values.planFeatures || {}).map(([FeatureCode, IsIncluded]) => ({
            FeatureCode,
            IsIncluded: !!IsIncluded,
            ShowOnWebsite: !!IsIncluded,
          })),
          Payments: Object.entries(values.planPayments || {}).map(([PaymentCode, IsIncluded]) => ({
            PaymentCode,
            IsIncluded: !!IsIncluded,
          })),
          Services: Object.entries(values.planServices || {}).map(([ServiceCode, IsIncluded]) => ({
            ServiceCode,
            IsIncluded: !!IsIncluded,
          })),
        };

        await updatePlanMutation.mutateAsync(payload as any);

        toast.success(`Plan "${values.name.trim()}" updated successfully.`);
        resetForm();
        onClose();
        onSuccess?.();
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
      formik.values.features.filter((_: unknown, i: number) => i !== index)
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
      subtitle="Update pricing, flavour, limits, features, payments, and service types"
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
            disabled={detailQuery.isLoading}
            icon={Pencil}
          >
            Save Changes
          </ATMButton>
        </div>
      }
    >
      {detailQuery.isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading plan details…
        </div>
      ) : detailQuery.isError ? (
        <div className="py-12 text-center text-sm text-red-500">
          Failed to load plan details. Close and retry.
        </div>
      ) : (
        <PlanForm
          formik={formik}
          addFeatureRow={addFeatureRow}
          removeFeatureRow={removeFeatureRow}
          toggleFeatureIncluded={toggleFeatureIncluded}
        />
      )}
    </ATMModal>
  );
};
export default EditPlanWrapper;
