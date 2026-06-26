import { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useForgotPasswordMutation } from '../services/authApi';
import ForgotPasswordForm from './ForgotPasswordForm';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
});

const ForgotPasswordWrapper = () => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await forgotPassword({ email: values.email.trim() }).unwrap();
    } catch {
      // Security: do not reveal if email exists or not
    } finally {
      setIsSuccess(true);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: '' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <ForgotPasswordForm
          isSuccess={isSuccess}
          isSubmitting={isSubmitting}
        />
      )}
    </Formik>
  );
};

export default ForgotPasswordWrapper;
