import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useRegisterEnterpriseMutation, useActivateMerchantMutation } from '../services/merchantApi';
import type { DbEngine, BillingFrequency, PreferredPaymentMethod } from '../types/merchant.types';
import RegisterEnterprisePage from './RegisterEnterprisePage';

// PLANS definition for local lookup
const PLANS = [
  { id: 'starter', name: 'Starter' },
  { id: 'professional', name: 'Professional' },
  { id: 'business', name: 'Business' },
  { id: 'enterprise', name: 'Enterprise' },
];

// Yup step-based validation schemas
const validationSchemas = [
  Yup.object(), // step 0: Merchant Type
  Yup.object(), // step 1: Business Nature
  Yup.object().shape({
    businessName: Yup.string().required('Business name must be at least 2 characters').min(2).max(200),
    contactPerson: Yup.string().required('Contact name is required').min(2).max(100),
    email: Yup.string().required('Email is required').email('Invalid email address'),
    phone: Yup.string().required('Phone number is required').min(6).max(20),
    country: Yup.string().required('Country is required'),
    billingFrequency: Yup.string().required('Billing cycle is required').oneOf(['Monthly', 'Quarterly', 'Annual']),
    preferredPaymentMethod: Yup.string().required('Payment method is required').oneOf(['CreditCard', 'BankTransfer', 'Invoice']),
  }), // step 2: Business Details
  Yup.object().shape({
    selectedPlan: Yup.string().required('Plan selection is required').nullable(),
  }), // step 3: Plan Selection
  Yup.object(), // step 4: Configuration
  Yup.object(), // step 5: Review & Confirm
  Yup.object(), // step 6: DB Provisioning
  Yup.object(), // step 7: Activation
];

export const RegisterEnterpriseWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [registerEnterprise, { isLoading }] = useRegisterEnterpriseMutation();
  const [activateMerchant] = useActivateMerchantMutation();

  const [provisionStatus, setProvisionStatus] = useState<'idle' | 'provisioning' | 'done' | 'error'>('idle');
  const [activationStatus, setActivationStatus] = useState<'idle' | 'activating' | 'done' | 'error'>('idle');
  const [createdMerchantId, setCreatedMerchantId] = useState<string | null>(null);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  const initialValues = {
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'US',
    billingFrequency: 'Monthly' as BillingFrequency,
    preferredPaymentMethod: 'CreditCard' as PreferredPaymentMethod,
    businessNature: '',
    selectedPlan: 'professional' as string | null,
    dbEngine: 'PostgreSQL' as DbEngine,
    featureFlags: {
      multiLocation: true,
      apiAccess: true,
      webhooks: false,
      whiteLabel: false,
      customDomain: false,
    },
    limits: {
      maxLocations: 5,
      maxTerminals: 20,
      maxProducts: 10000,
      maxUsers: 50,
      apiRateLimit: 1000,
    },
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

  // Simulate database provisioning (since it's an async background task)
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
  const startRealActivation = useCallback(async () => {
    if (!createdMerchantId) return;
    setActivationStatus('activating');
    try {
      await activateMerchant(createdMerchantId).unwrap();
      setActivationStatus('done');
      toast.success('Merchant activation complete');
    } catch (err: any) {
      setActivationStatus('error');
      const msg = err?.data?.message || err?.message || 'Activation failed';
      toast.error(msg);
    }
  }, [createdMerchantId, activateMerchant]);

  useEffect(() => {
    if (step === 7 && activationStatus === 'idle' && createdMerchantId) {
      startRealActivation();
    }
  }, [step, activationStatus, createdMerchantId, startRealActivation]);

  // Once activation completes successfully, mark registration as completed
  useEffect(() => {
    if (step === 7 && activationStatus === 'done') {
      const timer = setTimeout(() => {
        setRegistrationCompleted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, activationStatus]);

  const handleFormSubmit = async (values: typeof initialValues) => {
    const plan = PLANS.find((p) => p.id === values.selectedPlan);
    try {
      const res = await registerEnterprise({
        businessName: values.businessName.trim(),
        businessNature: values.businessNature.trim(),
        contactPerson: values.contactPerson.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        country: values.country,
        plan: plan?.name ?? values.selectedPlan ?? 'Professional',
        tier: plan?.name ?? values.selectedPlan ?? 'Professional',
        billingFrequency: values.billingFrequency,
        preferredPaymentMethod: values.preferredPaymentMethod,
        dbEngine: values.dbEngine,
        featureFlags: values.featureFlags,
        limits: values.limits,
      }).unwrap();

      setCreatedMerchantId(res.data.id);
      toast.success('Enterprise merchant registered successfully');
      setStep(6); // Advance to DB provisioning
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to register merchant. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchemas[step]}
      onSubmit={handleFormSubmit}
    >
      {(formik) => (
        <RegisterEnterprisePage
          formik={formik}
          step={step}
          isLoading={isLoading}
          provisionStatus={provisionStatus}
          activationStatus={activationStatus}
          createdMerchantId={createdMerchantId}
          registrationCompleted={registrationCompleted}
          handleNext={handleNext}
          handleBack={handleBack}
          retryActivation={startRealActivation}
        />
      )}
    </Formik>
  );
};

export default RegisterEnterpriseWrapper;
