import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser, logout } from '../slices/authSlice';
import { useChangePasswordMutation } from '../services/authApi';
import ChangePasswordForm from './ChangePasswordForm';

const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one digit')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm your new password'),
});

export const ChangePasswordWrapper: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [changePasswordMutation, { isLoading: isSubmitting }] = useChangePasswordMutation();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const userId = user?.userId || user?.id;
    if (!userId) {
      toast.error('Session error: User identity not found.');
      setSubmitting(false);
      return;
    }

    try {
      await changePasswordMutation({
        userId,
        currentPassword: values.currentPassword.trim(),
        newPassword: values.newPassword.trim(),
      }).unwrap();

      // Log out locally because changing the password invalidates the session tokens on the backend
      dispatch(logout());
      toast.success('Password changed successfully. Please log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
      validationSchema={changePasswordSchema}
      onSubmit={handleSubmit}
    >
      <ChangePasswordForm isSubmitting={isSubmitting} />
    </Formik>
  );
};

export default ChangePasswordWrapper;
