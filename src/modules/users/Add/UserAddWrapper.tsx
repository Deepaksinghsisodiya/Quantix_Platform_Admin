import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useCreateUserMutation } from '../services/userApi';
import type { PlatformRole } from '../types/user.types';
import { UserForm } from '../Form/UserForm';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Full Name is required').min(2, 'Name too short'),
  email: Yup.string().required('Email is required').email('Enter a valid email address'),
  department: Yup.string().required('Department is required'),
  role: Yup.string().required('Role is required'),
  password: Yup.string().required('Temporary password is required').min(12, 'Password must be at least 12 characters'),
});

export const UserAddWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [createUser] = useCreateUserMutation();

  const initialValues = {
    name: '',
    email: '',
    department: 'Support',
    role: 'Operator' as PlatformRole,
    password: '',
    overrides: {} as Record<string, string[]>,
  };

  const handleFormSubmit = async (values: typeof initialValues, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
    const trimmed = values.name.trim();
    const spaceIdx = trimmed.indexOf(' ');
    const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const lastName = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1);
    const username = values.email.split('@')[0] ?? trimmed.toLowerCase().replace(/\s+/g, '.');

    const roleIdMap: Record<PlatformRole, string> = {
      Admin: '30000003-0000-0000-0000-000000000002',
      Operator: '30000003-0000-0000-0000-000000000003',
      FinanceManager: '30000003-0000-0000-0000-000000000004',
      ContentManager: '30000003-0000-0000-0000-000000000007',
      OperationsManager: '30000003-0000-0000-0000-000000000008',
      Merchant: '30000003-0000-0000-0000-000000000009',
    };
    const mappedRoleId = roleIdMap[values.role];

    try {
      await createUser({
        username,
        email: values.email.trim(),
        password: values.password,
        firstName,
        lastName,
        displayName: trimmed,
        roleId: mappedRoleId,
        department: values.department,
        merchantId: null,
      }).unwrap();

      toast.success(`User "${trimmed}" created successfully.`);
      navigate('/users');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Create user failed.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
    >
      {(formikProps) => (
        <UserForm
          title="Create Platform User"
          formikProps={formikProps}
          onCancel={() => navigate('/users')}
        />
      )}
    </Formik>
  );
};

export default UserAddWrapper;
