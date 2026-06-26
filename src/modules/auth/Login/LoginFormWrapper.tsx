import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '../slices/authSlice';
import { useLoginMutation, useVerifyMfaMutation } from '../services/authApi';
import LoginForm from './LoginForm';

/* -------------------------------------------------------------------------- */
/*  Validation schemas                                                        */
/* -------------------------------------------------------------------------- */

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
    .test('len', 'Code must be 6 or 8 digits', (val) => {
      return val ? val.length === 6 || val.length === 8 : false;
    }),
});

export const LoginFormWrapper: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loginMutation] = useLoginMutation();
  const [verifyMfaMutation] = useVerifyMfaMutation();

  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [mfaToken, setMfaToken] = useState('');

  /* ---- Helpers ---- */
  function completeLogin(
    token: string,
    expiresAt: string | undefined,
    user: any,
    permissions: readonly string[] | undefined,
    mfaSetupRequired: boolean,
    mustChangePassword: boolean = false,
  ) {
    if (!user) return;

    // Cache in local storage for refresh token / initialization fallback
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    dispatch(setCredentials({
      user,
      accessToken: token,
      mfaSetupRequired,
      mustChangePassword,
    }));

    const displayName = user.displayName || user.firstName || user.name || user.username || 'User';

    if (mustChangePassword) {
      toast('🔑 Welcome ' + displayName + ' — set a new password to continue.');
      navigate('/change-password', { replace: true });
      return;
    }

    if (mfaSetupRequired) {
      toast('🔐 Welcome ' + displayName + ' — set up MFA to continue.');
      navigate('/mfa-setup', { replace: true });
      return;
    }

    toast.success(`Welcome back, ${displayName}`);
    const role = user.roleName || user.role;
    const landing = role === 'Merchant' ? '/merchant/dashboard' : '/dashboard';
    navigate(landing, { replace: true });
  }

  /* ---- Submit credentials ---- */
  async function handleLogin(values: any, { setSubmitting }: any) {
    try {
      const res = await loginMutation({
        email: values.email.trim(),
        password: values.password.trim(),
        rememberMe: false,
      }).unwrap();

      if (res.data?.mfaRequired) {
        setMfaToken(res.data.mfaChallengeToken ?? '');
        setStep('mfa');
      } else if (res.data?.token && res.data?.user) {
        completeLogin(
          res.data.token,
          res.data.expiresAt,
          res.data.user,
          res.data.permissions,
          res.data.mfaSetupRequired ?? false,
          res.data.mustChangePassword ?? false,
        );
      }
    } catch (err: any) {
      const serverMessage = err?.data?.message || err?.data?.Message;
      const status = err?.status || err?.data?.status;

      let errorMsg = serverMessage;
      if (!errorMsg) {
        if (status === 401) {
          errorMsg = 'Invalid credentials. Please try again.';
        } else if (status === 423) {
          errorMsg = 'Your account has been locked due to too many failed attempts. Contact your administrator.';
        } else {
          errorMsg = 'Unable to reach the server. Please check your connection and try again.';
        }
      }

      toast.error(errorMsg, { closeButton: true });
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- Submit MFA ---- */
  async function handleMFA(values: any, { setSubmitting }: any) {
    try {
      const res = await verifyMfaMutation({
        mfaToken,
        code: values.code,
      }).unwrap();

      if (res.data) {
        completeLogin(res.data.token, res.data.expiresAt, res.data.user, res.data.permissions, false);
      }
    } catch (err: any) {
      const serverMessage = err?.data?.message || err?.data?.Message;
      const status = err?.status || err?.data?.status;

      let errorMsg = serverMessage;
      if (!errorMsg) {
        if (status === 401) {
          errorMsg = 'Invalid verification code. Please try again.';
        } else {
          errorMsg = 'Unable to verify code. Please try again.';
        }
      }

      toast.error(errorMsg, { closeButton: true });
    } finally {
      setSubmitting(false);
    }
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  if (step === 'credentials') {
    return (
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({ isSubmitting }) => (
          <LoginForm
            step="credentials"
            setStep={setStep}
            onForgotPasswordClick={handleForgotPassword}
            isSubmitting={isSubmitting}
          />
        )}
      </Formik>
    );
  }

  return (
    <Formik
      initialValues={{ code: '' }}
      validationSchema={mfaSchema}
      onSubmit={handleMFA}
    >
      {({ isSubmitting, resetForm }) => (
        <LoginForm
          step="mfa"
          setStep={setStep}
          onForgotPasswordClick={handleForgotPassword}
          isSubmitting={isSubmitting}
          resetForm={resetForm}
        />
      )}
    </Formik>
  );
};

export default LoginFormWrapper;
