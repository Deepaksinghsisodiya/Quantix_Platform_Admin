import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useResetPasswordMutation } from '../services/authApi';
import { toast } from 'sonner';
import ResetPasswordForm from './ResetPasswordForm';

const ResetPasswordWrapper = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resetPassword] = useResetPasswordMutation();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await resetPassword({
        token: (token || values.token).trim(),
        email: (email || values.email).trim(),
        newPassword: values.newPassword.trim(),
        confirmPassword: values.confirmPassword.trim(),
      }).unwrap();

      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to reset password. The link or recovery code may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    email: email || '',
    token: token || '',
    newPassword: '',
    confirmPassword: '',
  };

  const dynamicValidationSchema = Yup.object().shape({
    email: email
      ? Yup.string()
      : Yup.string().trim().email('Enter a valid corporate email').required('Email is required'),
    token: token
      ? Yup.string()
      : Yup.string()
          .trim()
          .required('Recovery code is required')
          .test('len', 'Recovery code must be 6 or 8 digits', (val) => {
            return val ? val.length === 6 || val.length === 8 : false;
          }),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Must contain at least one digit')
      .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm your password'),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={dynamicValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <ResetPasswordForm
          email={email}
          token={token}
          showNew={showNew}
          setShowNew={setShowNew}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          isSubmitting={isSubmitting}
        />
      )}
    </Formik>
  );
};

export default ResetPasswordWrapper;
