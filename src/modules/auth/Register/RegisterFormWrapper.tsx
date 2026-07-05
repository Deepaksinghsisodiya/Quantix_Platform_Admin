import React, { useState } from 'react';
import { FormikProvider, useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as Yup from 'yup';

import { useRegisterMutation } from '../services/authApi';
import RegisterForm from './RegisterForm';

const registerSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .min(2, 'Must be at least 2 characters'),
  lastName: Yup.string()
    .trim()
    .required('Last name is required')
    .min(2, 'Must be at least 2 characters'),
  username: Yup.string()
    .trim()
    .required('Username is required')
    .matches(/^[a-zA-Z0-9._-]+$/, 'Username can only contain alphanumeric characters, dots, underscores, or hyphens')
    .min(3, 'Must be at least 3 characters')
    .max(50, 'Username too long'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .required('Email address is required')
    .max(254, 'Email address is too long'),
  password: Yup.string()
    .required('Password is required')
    .min(12, 'Password must be at least 12 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export const RegisterFormWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [registerMutation, { isLoading }] = useRegisterMutation();
  const [apiError, setApiError] = useState('');

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values, helpers) => {
      setApiError('');
      try {
        await registerMutation({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          username: values.username.trim().toLowerCase(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          roleId: '30000003-0000-0000-0000-000000000003', // defaults to Operator role
          displayName: `${values.firstName.trim()} ${values.lastName.trim()}`,
        }).unwrap();

        toast.success('Registration successful! Please sign in with your credentials.');
        navigate('/login', { replace: true });
      } catch (err: any) {
        const serverMessage = err?.data?.message || err?.data?.Message || err?.message || 'Registration failed. Please try again.';
        setApiError(serverMessage);
        toast.error(serverMessage);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <FormikProvider value={formik}>
      <RegisterForm
        formikProps={formik}
        isSubmitting={isLoading}
        apiError={apiError}
      />
    </FormikProvider>
  );
};

export default RegisterFormWrapper;
