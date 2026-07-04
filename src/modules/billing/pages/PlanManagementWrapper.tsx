import React, { useState, useMemo, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../services/useBilling';
import { PlanManagementView } from './PlanManagementView';
import { useAppSelector } from '@/app/hooks';
import { calculatePlanPrice } from '@/modules/rateCards/utils/priceCalculator';

import {
  PlanType,
  PlanStatus,
  PlanModules,
  PlanPayments,
  PlanServices,
  PlanLimits,
  DEFAULT_ENT_MODULES,
  DEFAULT_ENT_PAYMENTS,
  DEFAULT_ENT_SERVICES,
  DEFAULT_ENT_LIMITS,
  DEFAULT_STD_MODULES,
  DEFAULT_STD_PAYMENTS,
  DEFAULT_STD_SERVICES,
  DEFAULT_STD_LIMITS,
} from '@/modules/plans/types/plan.types';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  planType: PlanType;
  priority: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  trialPeriod: number;
  maxLocations: number;
  maxTerminals: number;
  features: PlanFeature[];
  planFeatures?: PlanModules;
  planPayments?: PlanPayments;
  planServices?: PlanServices;
  planLimits?: PlanLimits;
  merchantCount: number;
  status: PlanStatus;
  color: string;
  popular?: boolean;
  isManualPrice?: boolean;
  manualPrice?: number;
}

const PLAN_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#6b7280'];

const INITIAL_DUMMY_PLANS: Plan[] = [
  {
    id: '1',
    name: 'Starter Cloud',
    planType: 'Enterprise cloud',
    priority: 1,
    dailyPrice: 1.5,
    weeklyPrice: 9.5,
    monthlyPrice: 39,
    yearlyPrice: 390,
    trialPeriod: 14,
    maxLocations: 1,
    maxTerminals: 2,
    features: [
      { text: 'Single Outlet Support', included: true },
      { text: 'Up to 2 POS Terminals', included: true },
      { text: 'Basic Inventory Management', included: true },
      { text: 'Standard Email Support', included: true },
    ],
    planFeatures: { ...DEFAULT_ENT_MODULES, INV: true },
    planPayments: { ...DEFAULT_ENT_PAYMENTS },
    planServices: { ...DEFAULT_ENT_SERVICES },
    planLimits: { ...DEFAULT_ENT_LIMITS, MLO: 1, MTM: 2 },
    merchantCount: 42,
    status: 'Active',
    color: '#3b82f6',
    popular: false,
    isManualPrice: false,
    manualPrice: 0,
  },
  {
    id: '2',
    name: 'Professional Enterprise',
    planType: 'Enterprise cloud',
    priority: 2,
    dailyPrice: 3.5,
    weeklyPrice: 22.0,
    monthlyPrice: 99,
    yearlyPrice: 990,
    trialPeriod: 14,
    maxLocations: 5,
    maxTerminals: 10,
    features: [
      { text: 'Up to 5 Outlets', included: true },
      { text: '10 POS Terminals Allocation', included: true },
      { text: 'Advanced Analytics & AI Forecasting', included: true },
    ],
    planFeatures: { ...DEFAULT_ENT_MODULES, INV: true, ANL: true },
    planPayments: { ...DEFAULT_ENT_PAYMENTS, GFT: true },
    planServices: { ...DEFAULT_ENT_SERVICES, DLV: true },
    planLimits: { ...DEFAULT_ENT_LIMITS, MLO: 5, MTM: 10 },
    merchantCount: 128,
    status: 'Active',
    color: '#8b5cf6',
    popular: true,
    isManualPrice: false,
    manualPrice: 0,
  },
  {
    id: '3',
    name: 'Global Enterprise Unlimited',
    planType: 'Enterprise cloud',
    priority: 3,
    dailyPrice: 8.5,
    weeklyPrice: 55.0,
    monthlyPrice: 249,
    yearlyPrice: 2490,
    trialPeriod: 30,
    maxLocations: 25,
    maxTerminals: 50,
    features: [
      { text: 'Unlimited Outlets & Terminals', included: true },
      { text: 'Dedicated Account Manager', included: true },
    ],
    planFeatures: { INV: true, FIN: true, HRM: true, MKT: true, ANL: true, WTM: true },
    planPayments: { CSH: true, CRD: true, EXT: true, GFT: true, STC: true, WLT: true, CSL: true },
    planServices: { DIN: true, CTR: true, PUP: true, DLV: true, CTG: true, SNP: true, RSO: true, WOR: true, WRV: true },
    planLimits: { MBU: 10, MLO: 25, MTM: 50, MPR: 50000, MPG: 500, MGB: 200, MDP: 10, MKD: 10, MDS: 20, MIS: 20, MPW: 10, MRS: 1000, MAC: 100, MWR: 10, MWE: 1000, MBR: 25 },
    merchantCount: 65,
    status: 'Active',
    color: '#ec4899',
    popular: false,
    isManualPrice: false,
    manualPrice: 0,
  },
  {
    id: '4',
    name: 'Standalone POS Basic',
    planType: 'Standalone POS',
    priority: 1,
    dailyPrice: 1.0,
    weeklyPrice: 7.0,
    monthlyPrice: 29,
    yearlyPrice: 290,
    trialPeriod: 7,
    maxLocations: 1,
    maxTerminals: 1,
    features: [
      { text: 'Single POS Terminal License', included: true },
      { text: 'Offline Mode Receipt Printing', included: true },
    ],
    planFeatures: { ...DEFAULT_STD_MODULES },
    planPayments: { ...DEFAULT_STD_PAYMENTS },
    planServices: { ...DEFAULT_STD_SERVICES },
    planLimits: { ...DEFAULT_STD_LIMITS, MLO: 1, MTM: 1 },
    merchantCount: 89,
    status: 'Active',
    color: '#10b981',
    popular: false,
    isManualPrice: false,
    manualPrice: 0,
  },
  {
    id: '5',
    name: 'Standalone POS Pro',
    planType: 'Standalone POS',
    priority: 2,
    dailyPrice: 2.5,
    weeklyPrice: 15.0,
    monthlyPrice: 69,
    yearlyPrice: 690,
    trialPeriod: 14,
    maxLocations: 3,
    maxTerminals: 5,
    features: [
      { text: 'Up to 3 Store Counters', included: true },
      { text: '5 POS Terminals Supported', included: true },
    ],
    planFeatures: { ...DEFAULT_STD_MODULES, INV: true },
    planPayments: { ...DEFAULT_STD_PAYMENTS, GFT: true },
    planServices: { ...DEFAULT_STD_SERVICES, PUP: true },
    planLimits: { ...DEFAULT_STD_LIMITS, MLO: 3, MTM: 5 },
    merchantCount: 112,
    status: 'Active',
    color: '#f59e0b',
    popular: true,
    isManualPrice: false,
    manualPrice: 0,
  },
];

const planValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required('Plan Name is required'),
  planType: Yup.string().oneOf(['Standalone POS', 'Standalone Cloud', 'Enterprise cloud'], 'Select valid plan type').required('Plan type is required'),
  status: Yup.string().oneOf(['Active', 'Inactive', 'Deprecated']).required('Status is required'),
  priority: Yup.number().typeError('Must be a number').integer('Must be an integer').min(1, 'Priority must be at least 1').required('Priority is required'),
  dailyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Required'),
  weeklyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Required'),
  monthlyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Required'),
  yearlyPrice: Yup.number().typeError('Must be a number').min(0, 'Price cannot be negative').required('Required'),
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

export const PlanManagementWrapper: React.FC = () => {
  const plansQuery = usePlans();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  const rateCards = useAppSelector((state) => state.rateCards.rateCards);
  const activeRateCard = rateCards.find((c) => c.isDefault) || rateCards[0];

  // Local state for interactive dummy plans management
  const [localPlans, setLocalPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem('quantix_plans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_DUMMY_PLANS;
  });

  const saveLocalPlans = (plans: Plan[]) => {
    setLocalPlans(plans);
    localStorage.setItem('quantix_plans', JSON.stringify(plans));
  };

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deprecated'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud'>('all');
  
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Convert raw API response or use local state
  const rawPlans: Plan[] = useMemo(() => {
    const rawData = plansQuery.data?.data;
    const apiPlans = Array.isArray(rawData) ? rawData : Array.isArray(plansQuery.data) ? (plansQuery.data as any[]) : [];
    
    if (apiPlans.length === 0) {
      return localPlans;
    }

    return apiPlans.map((p: any, idx: number) => {
      const pName = typeof p?.name === 'string' ? p.name : p?.name ? String(p.name) : 'Unnamed Plan';
      return {
        id: String(p?.id || idx),
        name: pName,
        planType: p?.planType || 'Enterprise cloud',
        priority: p?.priority ?? 1,
        dailyPrice: p?.dailyPrice ?? 0,
        weeklyPrice: p?.weeklyPrice ?? 0,
        monthlyPrice: p?.monthlyPrice ?? 0,
        yearlyPrice: p?.yearlyPrice ?? 0,
        trialPeriod: p?.trialPeriod ?? 14,
        maxLocations: p?.maxLocations ?? 1,
        maxTerminals: p?.maxTerminals ?? 1,
        features: Array.isArray(p?.features)
          ? p.features.map((f: any) =>
              typeof f === 'string'
                ? { text: f, included: true }
                : { text: typeof f?.text === 'string' ? f.text : String(f?.text || ''), included: f?.included !== false }
            )
          : [],
        planFeatures: p?.planFeatures || (p?.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_MODULES } : { ...DEFAULT_ENT_MODULES }),
        planPayments: p?.planPayments || (p?.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_PAYMENTS } : { ...DEFAULT_ENT_PAYMENTS }),
        planServices: p?.planServices || (p?.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_SERVICES } : { ...DEFAULT_ENT_SERVICES }),
        planLimits: p?.planLimits || (p?.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_LIMITS } : { ...DEFAULT_ENT_LIMITS }),
        merchantCount: p?.merchantCount ?? 0,
        status: p?.status ? p.status : p?.isActive === false ? 'Inactive' : 'Active',
        color: PLAN_COLORS[idx % PLAN_COLORS.length] ?? '#3b82f6',
        popular: !!p?.popular,
        isManualPrice: p?.isManualPrice ?? false,
        manualPrice: p?.manualPrice ?? 0,
      };
    });
  }, [plansQuery.data, localPlans]);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return rawPlans.filter((plan) => {
      const planName = (plan.name || '').toLowerCase();
      const matchesSearch = !q || planName.includes(q);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? plan.status === 'Active'
          : statusFilter === 'inactive'
          ? plan.status === 'Inactive'
          : plan.status === 'Deprecated';

      const matchesType =
        typeFilter === 'all' ? true : plan.planType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rawPlans, searchQuery, statusFilter, typeFilter]);

  const formik = useFormik({
    initialValues: {
      name: '',
      planType: 'Enterprise cloud' as PlanType,
      priority: 1,
      status: 'Active' as PlanStatus,
      dailyPrice: 0,
      weeklyPrice: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialPeriod: 14,
      maxLocations: 1,
      maxTerminals: 1,
      features: [{ text: '', included: true }],
      planFeatures: { ...DEFAULT_ENT_MODULES },
      planPayments: { ...DEFAULT_ENT_PAYMENTS },
      planServices: { ...DEFAULT_ENT_SERVICES },
      planLimits: { ...DEFAULT_ENT_LIMITS },
      popular: false,
      isManualPrice: false,
      manualPrice: 0,
    },
    validationSchema: planValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const cleanedFeatures = values.features
          .filter((f) => f.text.trim().length > 0)
          .map((f) => ({ text: f.text.trim(), included: f.included }));

        // If manual price override is checked, set monthlyPrice and override cycle prices accordingly
        const manualVal = Number(values.manualPrice || 0);
        const dailyVal = values.isManualPrice ? Number((manualVal / 30).toFixed(2)) : Number(values.dailyPrice);
        const weeklyVal = values.isManualPrice ? Number((manualVal / 4).toFixed(2)) : Number(values.weeklyPrice);
        const monthlyVal = values.isManualPrice ? manualVal : Number(values.monthlyPrice);
        const yearlyVal = values.isManualPrice ? Number((manualVal * 10).toFixed(2)) : Number(values.yearlyPrice);

        const newPlanItem: Plan = {
          id: editingPlan ? editingPlan.id : String(Date.now()),
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
          planFeatures: values.planFeatures,
          planPayments: values.planPayments,
          planServices: values.planServices,
          planLimits: values.planLimits,
          maxLocations: Number(values.planLimits.MLO || 1),
          maxTerminals: Number(values.planLimits.MTM || 1),
          popular: values.popular,
          isManualPrice: values.isManualPrice,
          manualPrice: manualVal,
          merchantCount: editingPlan ? editingPlan.merchantCount : 0,
          color: (editingPlan && editingPlan.color) || PLAN_COLORS[localPlans.length % PLAN_COLORS.length] || '#3b82f6',
        };

        if (editingPlan) {
          saveLocalPlans(localPlans.map((p) => (p.id === editingPlan.id ? newPlanItem : p)));
          toast.success(`Plan "${values.name.trim()}" updated successfully.`);
        } else {
          saveLocalPlans([newPlanItem, ...localPlans]);
          toast.success(`Plan "${values.name.trim()}" created successfully.`);
        }

        // Try mutation call if backend available
        try {
          if (editingPlan) {
            await updatePlanMutation.mutateAsync({ id: editingPlan.id, data: newPlanItem as any });
          } else {
            await createPlanMutation.mutateAsync(newPlanItem as any);
          }
        } catch {
          // Fallback to local state if backend API is not ready
        }

        setModalOpen(false);
        setEditingPlan(null);
        resetForm();
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || 'Failed to save plan.';
        toast.error(msg);
      }
    },
  });

  // Dynamic formula calculation hook
  useEffect(() => {
    if (autoCalculate && activeRateCard && !formik.values.isManualPrice) {
      const calc = calculatePlanPrice({
        planFeatures: formik.values.planFeatures,
        planPayments: formik.values.planPayments,
        planServices: formik.values.planServices,
        planLimits: formik.values.planLimits,
      }, activeRateCard);

      formik.setFieldValue('dailyPrice', calc.dailyPrice);
      formik.setFieldValue('weeklyPrice', calc.weeklyPrice);
      formik.setFieldValue('monthlyPrice', calc.monthlyPrice);
      formik.setFieldValue('yearlyPrice', calc.yearlyPrice);
    }
  }, [
    formik.values.planFeatures,
    formik.values.planPayments,
    formik.values.planServices,
    formik.values.planLimits,
    activeRateCard,
    autoCalculate,
    formik.values.isManualPrice,
  ]);

  // Adjust defaults when planType selection changes
  const lastPlanTypeRef = React.useRef(formik.values.planType);
  useEffect(() => {
    if (formik.values.planType !== lastPlanTypeRef.current) {
      lastPlanTypeRef.current = formik.values.planType;
      if (formik.values.planType === 'Enterprise cloud') {
        formik.setFieldValue('planFeatures', { ...DEFAULT_ENT_MODULES });
        formik.setFieldValue('planPayments', { ...DEFAULT_ENT_PAYMENTS });
        formik.setFieldValue('planServices', { ...DEFAULT_ENT_SERVICES });
        formik.setFieldValue('planLimits', { ...DEFAULT_ENT_LIMITS });
      } else {
        formik.setFieldValue('planFeatures', { ...DEFAULT_STD_MODULES });
        formik.setFieldValue('planPayments', { ...DEFAULT_STD_PAYMENTS });
        formik.setFieldValue('planServices', { ...DEFAULT_STD_SERVICES });
        formik.setFieldValue('planLimits', { ...DEFAULT_STD_LIMITS });
      }
    }
  }, [formik.values.planType]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setAutoCalculate(true);
    formik.resetForm({
      values: {
        name: '',
        planType: 'Enterprise cloud',
        priority: 1,
        status: 'Active',
        dailyPrice: 0,
        weeklyPrice: 0,
        monthlyPrice: 0,
        yearlyPrice: 0,
        trialPeriod: 14,
        maxLocations: 3,
        maxTerminals: 6,
        features: [
          { text: 'Single Outlet / Location Support', included: true },
          { text: 'Cloud POS Terminal Billing', included: true },
          { text: 'Real-time Stock Inventory', included: true },
        ],
        planFeatures: { ...DEFAULT_ENT_MODULES },
        planPayments: { ...DEFAULT_ENT_PAYMENTS },
        planServices: { ...DEFAULT_ENT_SERVICES },
        planLimits: { ...DEFAULT_ENT_LIMITS },
        popular: false,
        isManualPrice: false,
        manualPrice: 0,
      },
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setAutoCalculate(false); // don't overwrite saved price on editing
    formik.resetForm({
      values: {
        name: plan.name,
        planType: plan.planType || 'Enterprise cloud',
        priority: plan.priority || 1,
        status: plan.status || 'Active',
        dailyPrice: plan.dailyPrice || 0,
        weeklyPrice: plan.weeklyPrice || 0,
        monthlyPrice: plan.monthlyPrice || 0,
        yearlyPrice: plan.yearlyPrice || 0,
        trialPeriod: plan.trialPeriod || 14,
        maxLocations: plan.maxLocations || 1,
        maxTerminals: plan.maxTerminals || 1,
        features: plan.features.length
          ? plan.features.map((f) => ({ text: f.text, included: f.included }))
          : [{ text: '', included: true }],
        planFeatures: plan.planFeatures || (plan.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_MODULES } : { ...DEFAULT_ENT_MODULES }),
        planPayments: plan.planPayments || (plan.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_PAYMENTS } : { ...DEFAULT_ENT_PAYMENTS }),
        planServices: plan.planServices || (plan.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_SERVICES } : { ...DEFAULT_ENT_SERVICES }),
        planLimits: plan.planLimits || (plan.planType?.startsWith('Standalone') ? { ...DEFAULT_STD_LIMITS } : { ...DEFAULT_ENT_LIMITS }),
        popular: !!plan.popular,
        isManualPrice: plan.isManualPrice || false,
        manualPrice: plan.manualPrice || 0,
      },
    });
    setModalOpen(true);
  };

  const handleToggleStatus = (planId: string) => {
    const updated = localPlans.map((plan) => {
      if (plan.id === planId) {
        const nextStatus: PlanStatus = plan.status === 'Active' ? 'Inactive' : 'Active';
        toast.info(`Plan "${plan.name}" status changed to ${nextStatus}.`);
        return { ...plan, status: nextStatus };
      }
      return plan;
    });
    saveLocalPlans(updated);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    saveLocalPlans(localPlans.filter((p) => p.id !== deletingPlan.id));
    toast.success(`Plan "${deletingPlan.name}" removed.`);
    setDeletingPlan(null);
    try {
      await deletePlanMutation.mutateAsync(deletingPlan.id);
    } catch {
      // Local state fallback
    }
  };

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
      updated[index] = {
        ...updated[index],
        included: !updated[index].included,
      };
      formik.setFieldValue('features', updated);
    }
  };

  return (
    <PlanManagementView
      plans={filteredPlans}
      allPlansCount={rawPlans.length}
      isLoading={plansQuery.isLoading}
      isError={plansQuery.isError}
      refetch={plansQuery.refetch}
      viewMode={viewMode}
      setViewMode={setViewMode}
      modalOpen={modalOpen}
      setModalOpen={setModalOpen}
      editingPlan={editingPlan}
      deletingPlan={deletingPlan}
      setDeletingPlan={setDeletingPlan}
      handleOpenCreate={handleOpenCreate}
      handleOpenEdit={handleOpenEdit}
      handleToggleStatus={handleToggleStatus}
      handleConfirmDelete={handleConfirmDelete}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      typeFilter={typeFilter}
      setTypeFilter={setTypeFilter}
      formik={formik}
      addFeatureRow={addFeatureRow}
      removeFeatureRow={removeFeatureRow}
      toggleFeatureIncluded={toggleFeatureIncluded}
      isSubmitting={createPlanMutation.isPending || updatePlanMutation.isPending}
      autoCalculate={autoCalculate}
      setAutoCalculate={setAutoCalculate}
    />
  );
};

export default PlanManagementWrapper;
