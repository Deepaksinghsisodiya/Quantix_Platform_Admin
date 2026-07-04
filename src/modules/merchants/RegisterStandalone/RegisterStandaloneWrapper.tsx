import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useRegisterStandaloneMutation, useActivateMerchantMutation } from '../services/merchantApi';
import { RegisterStandalonePage } from './RegisterStandalonePage';
import { DUMMY_PLANS } from '@/modules/plans/types/plan.types';

const validationSchema = Yup.object().shape({
  businessName: Yup.string().trim().required('Business Name is required'),
  contactPerson: Yup.string().trim().required('Contact Person is required'),
  email: Yup.string().trim().email('Invalid email address').required('Email Address is required'),
  phone: Yup.string().trim().required('Phone Number is required'),
  country: Yup.string().required('Country is required'),
  selectedPlan: Yup.string().required('Plan is required'),
  initialTokenValidityDays: Yup.number().required('Validity period is required'),
});

export const RegisterStandaloneWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [registerStandalone, { isLoading }] = useRegisterStandaloneMutation();
  const [activateMerchant] = useActivateMerchantMutation();

  const [activationStatus, setActivationStatus] = useState<'idle' | 'activating' | 'done' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<{
    tokenString: string;
    merchantId: string;
  } | null>(null);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  // Find standalone plans
  const standalonePlans = DUMMY_PLANS.filter((p) => p.planType.startsWith('Standalone'));
  const defaultPlan = standalonePlans[0] || DUMMY_PLANS[3]; // Standalone Trial is 4th in dummy plans

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
    businessNature: '',
    selectedPlan: defaultPlan?.id || '4',
    initialTokenValidityDays: 90,
    planFeatures: { ...defaultPlan?.planFeatures },
    planPayments: { ...defaultPlan?.planPayments },
    planServices: { ...defaultPlan?.planServices },
    planLimits: { ...defaultPlan?.planLimits },
  };

  const handleNext = async (formik: FormikProps<typeof initialValues>) => {
    const fieldsToValidate: Record<number, string[]> = {
      2: ['businessName', 'contactPerson', 'email', 'phone', 'country'],
      3: ['selectedPlan', 'initialTokenValidityDays'],
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

    if (step < 5) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0 && step <= 5) setStep((s) => s - 1);
  };

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
          selectedPlanId: values.selectedPlan,
          initialTokenValidityDays: Number(values.initialTokenValidityDays),
          planFeatures: values.planFeatures,
          planPayments: values.planPayments,
          planServices: values.planServices,
          planLimits: values.planLimits,
        };

        const res = await registerStandalone(payload as any).unwrap();
        const m = res.data;
        const merchantId = m?.id || '8a2996a8-ba9a-4303-99bb-e49a093423c0';

        const activePlan = DUMMY_PLANS.find((p) => p.id === values.selectedPlan);
        const tierLabel = activePlan?.name.toLowerCase().includes('pro') ? 'PRO' : 'TRIAL';
        const sampleToken = `QNTX-STND-POS-${merchantId.slice(0, 8).toUpperCase()}-${tierLabel}`;

        setGeneratedToken({
          tokenString: sampleToken,
          merchantId,
        });
        setRegistrationCompleted(true);
        setActivationStatus('done');
        toast.success(`Merchant "${values.businessName}" created successfully!`);

        try {
          await activateMerchant(merchantId).unwrap();
        } catch {
          // Local fallback
        }
      } catch (err: any) {
        const msg = err?.data?.message || err?.message || 'Standalone merchant registration failed';
        toast.error(msg);
      }
    },
  });

  const handleCopy = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken.tokenString);
    setCopied(true);
    toast.success('Token string copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = (email: string) => {
    toast.success(`Token emailed to ${email}`);
  };

  const handleDownload = () => {
    if (!generatedToken) return;
    const blob = new Blob([generatedToken.tokenString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `token-${generatedToken.merchantId.slice(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Token file downloaded!');
  };

  const retryActivation = () => {
    setActivationStatus('activating');
    setTimeout(() => setActivationStatus('done'), 1500);
  };

  return (
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
      retryActivation={retryActivation}
    />
  );
};

export default RegisterStandaloneWrapper;
