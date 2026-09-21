import React, { useState } from 'react';
import { FormikProvider, useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as Yup from 'yup';

import { useAuth } from '@/shared/hooks/useAuth';
import { useLoginMutation, useVerifyMfaMutation } from '../services/authApi';
import LoginForm from './LoginForm';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required('Email or username is required')
    .max(254, 'Email address or username is too long')
    .test('email-or-username', 'Enter a valid email address or username', (value) => {
      if (!value) return false;
      if (value.includes('@')) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      return /^[A-Za-z0-9._-]{3,64}$/.test(value);
    }),
  password: Yup.string().required('Password is required'),
});

const mfaSchema = Yup.object().shape({
  code: Yup.string()
    .required('Verification or recovery code is required')
    .matches(/^\d+$/, 'Code must contain only digits')
    .test('len', 'Code must be 6 or 8 digits', (val) => (val ? val.length === 6 || val.length === 8 : false)),
});

const getErrorMessage = (err: any, fallback: string) => {
  const status = err?.status || err?.data?.status;
  const serverMessage = err?.data?.message || err?.data?.Message || err?.message;
  if (serverMessage) return serverMessage;
  if (status === 401) return 'Invalid credentials. Please try again.';
  if (status === 423) return 'Your account has been locked due to too many failed attempts. Contact your administrator.';
  return fallback;
};

export interface LoginFormWrapperProps {
  /** 'admin' — Platform Admin (default, /login); 'merchant' — Merchant Portal (/merchant/login). */
  variant?: 'admin' | 'merchant';
}

export const LoginFormWrapper: React.FC<LoginFormWrapperProps> = ({ variant = 'admin' }) => {
  const navigate = useNavigate();
  const { completeLogin } = useAuth();
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyMfaMutation, { isLoading: isMfaLoading }] = useVerifyMfaMutation();
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [mfaUserId, setMfaUserId] = useState('');
  const [apiError, setApiError] = useState('');

  const finishLogin = (responseData: any) => {
    const accessToken = responseData?.token ?? responseData?.accessToken ?? '';
    const refreshToken = responseData?.refreshToken ?? responseData?.refresh_token;
    const user = responseData?.user;
    if (!accessToken || !user) {
      throw new Error('Login response did not include a user session.');
    }

    completeLogin({
      user,
      accessToken,
      refreshToken,
      mfaSetupRequired: responseData?.mfaSetupRequired ?? false,
      mustChangePassword: responseData?.mustChangePassword ?? false,
    });

    const displayName = user.displayName || user.firstName || user.name || user.username || 'User';

    if (responseData?.mustChangePassword) {
      toast(`Welcome ${displayName} - set a new password to continue.`);
      navigate('/change-password', { replace: true });
      return;
    }

    if (responseData?.mfaSetupRequired) {
      toast(`Welcome ${displayName} - set up MFA to continue.`);
      navigate('/mfa-setup', { replace: true });
      return;
    }

    toast.success(`Welcome back, ${displayName}`);
    const isMerchantVariant = variant === 'merchant';
    const role = user.roleName || user.role;
    if (isMerchantVariant) {
      navigate('/merchant/dashboard', { replace: true });
      return;
    }
    navigate(role === 'Merchant' ? '/merchant/dashboard' : '/dashboard', { replace: true });
  };

  const credentialFormik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, helpers) => {
      setApiError('');
      try {
        const res = await loginMutation({
          email: values.email.trim(),
          password: values.password,
          rememberMe: false,
        }).unwrap();

        // 2026-08-30: removed a debug console.log that dumped the ENTIRE login payload —
        // JWT, refresh token and the full permission list — into the browser console on
        // every sign-in (readable by anyone with the devtools open, and captured by any
        // console-forwarding extension).

        const resAny = res as any;
        const data = res.data;
        const isMfaRequired = data?.mfaRequired || resAny?.mfaRequired || (data as any)?.MfaRequired || resAny?.MfaRequired || false;
        
        const nextMfaUserId = 
          data?.userId ?? 
          (data as any)?.UserId ?? 
          data?.id ?? 
          (data as any)?.Id ?? 
          data?.user?.id ?? 
          data?.user?.userId ?? 
          (data as any)?.user?.Id ?? 
          (data as any)?.user?.UserId ?? 
          data?.mfaChallengeToken ?? 
          (data as any)?.MfaChallengeToken ?? 
          data?.challengeToken ?? 
          (data as any)?.ChallengeToken ?? 
          resAny?.userId ?? 
          resAny?.UserId ?? 
          resAny?.id ?? 
          resAny?.Id ?? 
          resAny?.data?.userId ?? 
          resAny?.data?.UserId ?? 
          resAny?.mfaChallengeToken ?? 
          resAny?.MfaChallengeToken ?? 
          '';

        if (isMfaRequired) {
          setMfaUserId(nextMfaUserId);
          setStep('mfa');
          return;
        }

        finishLogin(data);
      } catch (err: any) {
        const message = getErrorMessage(err, 'Unable to reach the server. Please check your connection and try again.');
        setApiError(message);
        toast.error(message, { closeButton: true });
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const mfaFormik = useFormik({
    initialValues: { code: '' },
    validationSchema: mfaSchema,
    onSubmit: async (values, helpers) => {
      setApiError('');
      if (!mfaUserId) {
        const message = 'Missing MFA user id. Please retry login.';
        setApiError(message);
        toast.error(message);
        helpers.setSubmitting(false);
        return;
      }

      try {
        const res = await verifyMfaMutation({ userId: mfaUserId, totpCode: values.code }).unwrap();
        finishLogin(res.data);
      } catch (err: any) {
        const message = getErrorMessage(err, 'Unable to verify code. Please try again.');
        setApiError(message);
        toast.error(message, { closeButton: true });
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const activeFormik = step === 'credentials' ? credentialFormik : mfaFormik;

  return (
    <FormikProvider value={activeFormik}>
      <LoginForm
        formikProps={activeFormik}
        step={step}
        setStep={setStep}
        onForgotPasswordClick={() => navigate('/forgot-password')}
        isSubmitting={activeFormik.isSubmitting || isLoginLoading || isMfaLoading}
        apiError={apiError}
        resetForm={step === 'mfa' ? mfaFormik.resetForm : undefined}
        variant={variant}
      />
    </FormikProvider>
  );
};

export default LoginFormWrapper;
