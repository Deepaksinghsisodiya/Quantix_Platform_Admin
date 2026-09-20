import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useCreateUserMutation, useSetUserGrantsMutation } from '../services/userApi';
import { ROLE_ID_MAP, type PlatformRole } from '../types/user.types';
import { UserForm } from '../Form/UserForm';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Full Name is required').min(2, 'Name too short'),
  email: Yup.string().required('Email is required').email('Enter a valid email address'),
  role: Yup.string().required('Role is required'),
  password: Yup.string().required('Temporary password is required').min(12, 'Password must be at least 12 characters'),
});

export const UserAddWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [createUser] = useCreateUserMutation();
  const [setUserGrants] = useSetUserGrantsMutation();

  const initialValues = {
    name: '',
    email: '',
    role: 'Operator' as PlatformRole,
    password: '',
    extraGrants: [] as string[],
  };

  const handleFormSubmit = async (values: typeof initialValues, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
    const trimmed = values.name.trim();
    const spaceIdx = trimmed.indexOf(' ');
    const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const lastName = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1);
    const username = values.email.split('@')[0] ?? trimmed.toLowerCase().replace(/\s+/g, '.');

    const mappedRoleId = ROLE_ID_MAP[values.role];

    try {
      const created = await createUser({
        username,
        email: values.email.trim(),
        password: values.password,
        firstName,
        lastName,
        displayName: trimmed,
        roleId: mappedRoleId,
        merchantId: null,
      } as any).unwrap();

      // 2026-08-11: persist additive grants (the old matrix silently discarded them).
      const newId = (created as any)?.data?.id;
      if (newId && values.extraGrants.length > 0) {
        try {
          await setUserGrants({ id: newId, permissionCodes: values.extraGrants }).unwrap();
        } catch (grantErr: any) {
          toast.error(grantErr?.data?.message || 'User created, but saving the extra grants failed - set them again from Edit.');
        }
      }

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
