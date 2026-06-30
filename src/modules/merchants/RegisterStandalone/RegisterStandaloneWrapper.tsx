import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { useRegisterStandaloneMutation, useActivateMerchantMutation } from '../services/merchantApi';
import { useGenerateTokenMutation } from '@/modules/tokens/services/tokenApi';
import RegisterStandalonePage from './RegisterStandalonePage';

type TokenTier = 'Basic' | 'Standard' | 'Advance' | 'Premium';

const VALIDITY_OPTIONS = [30, 60, 90, 180, 365] as const;

// Validation
const validationSchemas = [
  Yup.object(), // step 0: Merchant Type
  Yup.object(), // step 1: Business Nature
  Yup.object().shape({
    businessName: Yup.string().required('Business name must be at least 2 characters').min(2).max(200),
    contactPerson: Yup.string().required('Contact name is required').min(2).max(100),
    email: Yup.string().required('Email is required').email('Invalid email address'),
    phone: Yup.string().required('Phone number is required').min(6).max(20),
    country: Yup.string().required('Country is required'),
  }), // step 2: Business Details
  Yup.object().shape({
    initialTokenTier: Yup.string().required('Tier is required').oneOf(['Basic', 'Standard', 'Advance', 'Premium']),
    initialTokenValidityDays: Yup.number().required('Validity is required').oneOf([...VALIDITY_OPTIONS]),
  }), // step 3: Token Configuration
  Yup.object(), // step 4: Review & Generate
  Yup.object(), // step 5: Activation
];

export const RegisterStandaloneWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [registerStandalone, { isLoading }] = useRegisterStandaloneMutation();
  const [activateMerchant] = useActivateMerchantMutation();
  const [generateToken] = useGenerateTokenMutation();

  const [activationStatus, setActivationStatus] = useState<'idle' | 'activating' | 'done' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<{
    tokenString: string;
    merchantId: string;
  } | null>(null);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  const initialValues = {
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'US',
    businessNature: '',
    initialTokenTier: 'Standard' as TokenTier,
    initialTokenValidityDays: 90,
  };

  const handleNext = async (formik: FormikProps<typeof initialValues>) => {
    const fieldsToValidate: Record<number, string[]> = {
      2: ['businessName', 'contactPerson', 'email', 'phone', 'country'],
      3: ['initialTokenTier', 'initialTokenValidityDays'],
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

    if (step < 4) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0 && step <= 4) setStep((s) => s - 1);
  };

  // Real activation trigger
  const startRealActivation = useCallback(async () => {
    if (!generatedToken?.merchantId) return;
    setActivationStatus('activating');
    try {
      await activateMerchant(generatedToken.merchantId).unwrap();
      setActivationStatus('done');
      toast.success('Merchant activation complete');
    } catch (err: any) {
      setActivationStatus('error');
      const msg = err?.data?.message || err?.message || 'Activation failed';
      toast.error(msg);
    }
  }, [generatedToken, activateMerchant]);

  useEffect(() => {
    if (step === 5 && activationStatus === 'idle' && generatedToken?.merchantId) {
      startRealActivation();
    }
  }, [step, activationStatus, generatedToken, startRealActivation]);

  // Transition to completed success view
  useEffect(() => {
    if (step === 5 && activationStatus === 'done') {
      const timer = setTimeout(() => {
        setRegistrationCompleted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, activationStatus]);

  const handleFormSubmit = async (values: typeof initialValues) => {
    try {
      const res = await registerStandalone({
        businessName: values.businessName.trim(),
        businessNature: values.businessNature.trim(),
        contactPerson: values.contactPerson.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        country: values.country,
        initialTokenTier: values.initialTokenTier,
        initialTokenValidityDays: values.initialTokenValidityDays,
      }).unwrap();

      const merchantId = res.data.id;
      const tokenRes = await generateToken({
        merchantId,
        tier: values.initialTokenTier,
        businessNature: 'Retail',
        validityDays: values.initialTokenValidityDays,
        binding: {
          merchantId,
          businessId: merchantId,
          locationId: null,
          terminalId: null,
        },
      }).unwrap();

      setGeneratedToken({
        tokenString: tokenRes.data.tokenString,
        merchantId,
      });

      toast.success('Standalone merchant registered and token generated');
      setStep(5); // Advance to activation step
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to register merchant. Please try again.';
      toast.error(msg);
    }
  };

  const handleCopy = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken.tokenString);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = (email: string) => {
    toast.success(`Sending token email to ${email}...`);
  };

  const handleDownload = () => {
    toast.success('Preparing token download...');
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchemas[step]}
      onSubmit={handleFormSubmit}
    >
      {(formik) => (
        <RegisterStandalonePage
          formik={formik}
          step={step}
          isLoading={isLoading}
          activationStatus={activationStatus}
          generatedToken={generatedToken}
          copied={copied}
          registrationCompleted={registrationCompleted}
          handleNext={handleNext}
          handleBack={handleBack}
          handleCopy={handleCopy}
          handleEmail={handleEmail}
          handleDownload={handleDownload}
          retryActivation={startRealActivation}
        />
      )}
    </Formik>
  );
};

export default RegisterStandaloneWrapper;

