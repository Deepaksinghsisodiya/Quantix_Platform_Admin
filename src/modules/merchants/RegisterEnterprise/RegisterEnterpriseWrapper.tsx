import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, FormikProps, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useRegisterEnterpriseMutation, useActivateMerchantMutation } from '../services/merchantApi';
import type { DbEngine, BillingFrequency, PreferredPaymentMethod } from '../types/merchant.types';
import RegisterEnterprisePage from './RegisterEnterprisePage';
import { DUMMY_PLANS } from '@/modules/plans/types/plan.types';

// Yup step-based validation schemas
const validationSchema = Yup.object().shape({
  businessName: Yup.string().required('Business name is required').min(2).max(200),
  contactPerson: Yup.string().required('Contact name is required').min(2).max(100),
  email: Yup.string().required('Email is required').email('Invalid email address'),
  phone: Yup.string().required('Phone number is required').min(6).max(20),
  country: Yup.string().required('Country is required'),
  selectedPlan: Yup.string().required('Plan selection is required').nullable(),
});

export const RegisterEnterpriseWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [registerEnterprise, { isLoading }] = useRegisterEnterpriseMutation();
  const [activateMerchant] = useActivateMerchantMutation();

  const [provisionStatus, setProvisionStatus] = useState<'idle' | 'provisioning' | 'done' | 'error'>('idle');
  const [activationStatus, setActivationStatus] = useState<'idle' | 'activating' | 'done' | 'error'>('idle');
  const [createdMerchantId, setCreatedMerchantId] = useState<string | null>(null);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const enterprisePlans = DUMMY_PLANS.filter((p) => p.planType === 'Enterprise cloud');
  const defaultPlan = enterprisePlans[0] || DUMMY_PLANS[0];

  const initialValues = {
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'US',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    billingFrequency: 'Monthly' as BillingFrequency,
    preferredPaymentMethod: 'CreditCard' as PreferredPaymentMethod,
    businessNature: '',
    selectedPlan: defaultPlan?.id || '1',
    dbEngine: 'PostgreSQL' as DbEngine,
    planFeatures: { ...defaultPlan?.planFeatures },
    planPayments: { ...defaultPlan?.planPayments },
    planServices: { ...defaultPlan?.planServices },
    planLimits: { ...defaultPlan?.planLimits },
  };

  const handleNext = async (formik: FormikProps<typeof initialValues>) => {
    const fieldsToValidate: Record<number, string[]> = {
      2: ['businessName', 'contactPerson', 'email', 'phone', 'country', 'billingFrequency', 'preferredPaymentMethod'],
      3: ['selectedPlan'],
    };

    const stepFields = fieldsToValidate[step];
    if (stepFields) {
      stepFields.forEach((f) => formik.setFieldTouched(f, true));
      const errors = await formik.validateForm();
      const hasErrors = stepFields.some((f) => !!errors[f as keyof typeof errors]);
      if (hasErrors) {
        toast.error('Please fix the errors before continuing.');
        return;
      }
    }

    if (step < 7) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0 && step <= 5) setStep((s) => s - 1);
  };

  // Simulate database provisioning
  const startProvisioning = useCallback(() => {
    setProvisionStatus('provisioning');
    const timer = setTimeout(() => {
      setProvisionStatus('done');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === 6 && provisionStatus === 'idle') {
      const clean = startProvisioning();
      return clean;
    }
  }, [step, provisionStatus, startProvisioning]);

  // Once provisioning is complete, advance to step 7
  useEffect(() => {
    if (step === 6 && provisionStatus === 'done') {
      const timer = setTimeout(() => {
        setStep(7);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, provisionStatus]);

  // Real activation trigger
  const startRealActivation = useCallback(async (formValues: typeof initialValues) => {
    if (!createdMerchantId) return;
    setActivationStatus('activating');
    try {
      await activateMerchant(createdMerchantId).unwrap();
      
      const activePlan = DUMMY_PLANS.find((p) => p.id === formValues.selectedPlan);
      const tierLabel = activePlan?.name.toLowerCase().includes('pro') ? 'PRO' : 'BASIC';
      const sampleToken = `QNTX-ENT-CLOUD-${createdMerchantId.slice(0, 8).toUpperCase()}-${tierLabel}`;
      setGeneratedToken(sampleToken);
      
      setActivationStatus('done');
      toast.success('Merchant activation complete');
    } catch (err: any) {
      setActivationStatus('error');
      const msg = err?.data?.message || err?.message || 'Activation failed';
      toast.error(msg);
    }
  }, [createdMerchantId, activateMerchant]);

  // Once activation completes successfully, mark registration as completed
  useEffect(() => {
    if (step === 7 && activationStatus === 'done') {
      const timer = setTimeout(() => {
        setRegistrationCompleted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, activationStatus]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          businessName: values.businessName.trim(),
          businessNature: values.businessNature.trim() || undefined,
          contactPerson: values.contactPerson.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          country: values.country,
          addressLine1: values.addressLine1.trim() || undefined,
          city: values.city.trim() || undefined,
          state: values.state.trim() || undefined,
          postalCode: values.postalCode.trim() || undefined,
          billingFrequency: values.billingFrequency,
          preferredPaymentMethod: values.preferredPaymentMethod,
          selectedPlanId: values.selectedPlan,
          dbEngine: values.dbEngine,
          planFeatures: values.planFeatures,
          planPayments: values.planPayments,
          planServices: values.planServices,
          planLimits: values.planLimits,
        };

        const res = await registerEnterprise(payload as any).unwrap();
        const m = res.data;
        const merchantId = m?.id || '8a2996a8-ba9a-4303-99bb-e49a093423c0';

        setCreatedMerchantId(merchantId);
        setStep(6); // Move to provisioning step
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || 'Enterprise merchant registration failed';
        toast.error(msg);
      }
    },
  });

  // Call startRealActivation when step 7 is reached
  useEffect(() => {
    if (step === 7 && activationStatus === 'idle' && createdMerchantId) {
      startRealActivation(formik.values);
    }
  }, [step, activationStatus, createdMerchantId, startRealActivation]);

  return (
    <FormikProvider value={formik}>
      <RegisterEnterprisePage
        formik={formik}
        step={step}
        isLoading={isLoading}
        provisionStatus={provisionStatus}
        activationStatus={activationStatus}
        createdMerchantId={createdMerchantId}
        registrationCompleted={registrationCompleted}
        generatedToken={generatedToken}
        handleNext={handleNext}
        handleBack={handleBack}
        retryActivation={() => startRealActivation(formik.values)}
      />
    </FormikProvider>
  );
};

export default RegisterEnterpriseWrapper;

