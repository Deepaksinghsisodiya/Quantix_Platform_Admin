import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ATMErrorState } from '@/shared/ui';
import { UserForm } from '../Form/UserForm';
import { useGetUserByIdQuery, useUpdateUserMutation, useGetUserGrantsQuery, useSetUserGrantsMutation } from '../services/userApi';
import { ROLE_ID_MAP, type PlatformRole, type UserStatus } from '../types/user.types';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2, 'Name too short'),
  email: Yup.string().required('Email is required').email('Enter a valid email address'),
  role: Yup.string().required('Role is required'),
  status: Yup.string().required('Status is required'),
  ipAllowlist: Yup.string().nullable(),
});

export const UserEditWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userResponse, isLoading: isUserLoading, isError: isUserError } = useGetUserByIdQuery(id ?? '', { skip: !id });
  const [updateUser] = useUpdateUserMutation();
  const [setUserGrants] = useSetUserGrantsMutation();
  // 2026-08-11: the user's current ADDITIVE grants (extras above role).
  const { data: grantsResponse } = useGetUserGrantsQuery(id ?? '', { skip: !id });

  const user = userResponse?.data;

  const initialValues = useMemo(() => {
    if (!user) {
      return {
        name: '',
        email: '',
        role: 'Operator' as PlatformRole,
        status: 'Active' as UserStatus,
        ipAllowlist: '',
        extraGrants: [] as string[],
      };
    }
    return {
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Operator',
      status: user.status || 'Active',
      ipAllowlist: user.ipAllowlist || '',
      // Extras only — role permissions render locked in the form.
      extraGrants: [...(grantsResponse?.data?.extraGrants ?? [])],
    };
  }, [user, grantsResponse]);

  const handleFormSubmit = async (values: typeof initialValues, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
    if (!id) return;

    const trimmed = values.name.trim();
    const spaceIdx = trimmed.indexOf(' ');
    const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const lastName = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1);

    const mappedRoleId = ROLE_ID_MAP[values.role];
    const isActive = values.status === 'Active';

    try {
      await updateUser({
        id,
        data: {
          email: values.email.trim(),
          firstName,
          lastName,
          displayName: trimmed,
          roleId: mappedRoleId,
          isActive,
          ipAllowlist: values.ipAllowlist?.trim() || null,
        } as any,
      }).unwrap();

      // 2026-08-11: replace-semantics write of the additive grants.
      await setUserGrants({ id, permissionCodes: values.extraGrants ?? [] }).unwrap();

      toast.success('User updated successfully');
      navigate(`/users/${id}`);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Save failed.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-600" />
      </div>
    );
  }

  if (isUserError || !user) {
    return <ATMErrorState message="User not found" onRetry={() => navigate('/users')} />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <UserForm
          title={`Edit User — ${user.name}`}
          formikProps={formikProps}
          onCancel={() => navigate(`/users/${id}`)}
          isEdit
        />
      )}
    </Formik>
  );
};

export default UserEditWrapper;
