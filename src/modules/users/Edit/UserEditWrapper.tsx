import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ATMErrorState } from '@/shared/ui';
import { UserForm } from '../Form/UserForm';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../services/userApi';
import type { PlatformRole, UserStatus } from '../types/user.types';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2, 'Name too short'),
  email: Yup.string().required('Email is required').email('Enter a valid email address'),
  department: Yup.string().required('Department is required'),
  role: Yup.string().required('Role is required'),
  status: Yup.string().required('Status is required'),
  ipAllowlist: Yup.string().nullable(),
});

export const UserEditWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userResponse, isLoading: isUserLoading, isError: isUserError } = useGetUserByIdQuery(id ?? '', { skip: !id });
  const [updateUser] = useUpdateUserMutation();

  const user = userResponse?.data;

  const initialValues = useMemo(() => {
    if (!user) {
      return {
        name: '',
        email: '',
        role: 'Operator' as PlatformRole,
        department: '',
        status: 'Active' as UserStatus,
        ipAllowlist: '',
        overrides: {} as Record<string, string[]>,
      };
    }

    const overrides: Record<string, string[]> = {};
    if (user.permissions) {
      user.permissions.forEach((perm: any) => {
        if (perm && typeof perm === 'object') {
          const mod = perm.resource?.toLowerCase();
          let act = perm.action?.toLowerCase();
          if (act === 'read') act = 'view';
          if (act === 'write') act = 'edit';
          if (mod && act && perm.granted) {
            if (!overrides[mod]) overrides[mod] = [];
            overrides[mod].push(act);
          }
        } else if (typeof perm === 'string') {
          const parts = perm.split('.');
          if (parts.length === 2) {
            const mod = parts[0];
            const act = parts[1];
            if (mod && act) {
              if (!overrides[mod]) overrides[mod] = [];
              overrides[mod].push(act);
            }
          }
        }
      });
    }

    return {
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Operator',
      department: user.department || '',
      status: user.status || 'Active',
      ipAllowlist: user.ipAllowlist || '',
      overrides,
    };
  }, [user]);

  const handleFormSubmit = async (values: typeof initialValues, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
    if (!id) return;

    const trimmed = values.name.trim();
    const spaceIdx = trimmed.indexOf(' ');
    const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const lastName = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1);

    const roleIdMap: Record<PlatformRole, string> = {
      Admin: '30000003-0000-0000-0000-000000000002',
      Operator: '30000003-0000-0000-0000-000000000003',
      FinanceManager: '30000003-0000-0000-0000-000000000004',
      ContentManager: '30000003-0000-0000-0000-000000000007',
      OperationsManager: '30000003-0000-0000-0000-000000000008',
      Merchant: '30000003-0000-0000-0000-000000000009',
    };
    const mappedRoleId = roleIdMap[values.role];
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
          department: values.department,
          ipAllowlist: values.ipAllowlist?.trim() || null,
        },
      }).unwrap();

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
