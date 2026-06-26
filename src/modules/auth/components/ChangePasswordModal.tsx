import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMButton } from '@/shared/ui';
import { useChangePasswordMutation } from '@/modules/auth/services/authApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { markPasswordChanged, selectIsAdmin } from '@/modules/auth/slices/authSlice';
import ChangePasswordUI from './ChangePasswordUI';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isForced?: boolean;
  onSuccess?: () => void;
}

const getSchema = (isForced: boolean, isAdmin: boolean) => Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().required('New password is required').min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'Uppercase letter required').matches(/[a-z]/, 'Lowercase letter required')
    .matches(/[0-9]/, 'Number required').matches(/[!@#$%^&*(),.?":{}|<>]/, 'Symbol required'),
  confirmPassword: Yup.string().required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
  ...(isForced && isAdmin ? { newEmail: Yup.string().email('Invalid email address').required('Please provide your real email address') } : {})
}).test('different', 'New password must be different', function (values) {
  if (values.currentPassword && values.newPassword && values.currentPassword === values.newPassword) {
    return this.createError({ path: 'newPassword', message: 'New password must be different from current' });
  }
  return true;
});

const rules = [
  { label: '8+ Characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Numeric', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Symbolic', test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

const strengthColors = ['bg-slate-200 dark:bg-white/10', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];
const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose, isForced = false, onSuccess }) => {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const [changePassword] = useChangePasswordMutation();

  const getStrength = (pw: string) => rules.filter(r => r.test(pw)).length;

  return (
    <Formik
      initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '', newEmail: '' }}
      validationSchema={getSchema(isForced, isAdmin)}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          await changePassword({
            userId: '00000000-0000-0000-0000-000000000000',
            currentPassword: values.currentPassword.trim(),
            newPassword: values.newPassword.trim(),
          }).unwrap();
          
          toast.success('Password updated successfully!');
          
          dispatch(markPasswordChanged());
          onSuccess?.();
          onClose();
        } catch (err: any) {
          const message = err?.data?.message || 'Update failed. Verify current credentials.';
          if (message.toLowerCase().includes('current password')) {
            setErrors({ currentPassword: message });
          } else if (message.toLowerCase().includes('match')) {
            setErrors({ confirmPassword: message });
          } else if (message.toLowerCase().includes('email')) {
            setErrors({ newEmail: message });
          } else {
            setErrors({ newPassword: message });
          }
        } finally { 
          setSubmitting(false); 
        }
      }}
    >
      {(formikProps) => (
        <ATMModal
          isOpen={isOpen}
          onClose={onClose}
          title={isForced ? 'Update Password' : 'Change Password'}
          size="lg"
          closeOnOutsideClick={false}
          showCloseButton={!isForced}
          footer={
            <div className="flex items-center gap-3 w-full">
              {!isForced && (
                <ATMButton
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl text-[11px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Cancel
                </ATMButton>
              )}
              <ATMButton
                type="button"
                onClick={() => formikProps.submitForm()}
                isLoading={formikProps.isSubmitting}
                className={`${isForced ? 'w-full' : 'flex-[2]'} h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold uppercase tracking-widest active:scale-95 transition-all text-[11px] shadow-lg shadow-slate-900/10 dark:shadow-none`}
              >
                Update Password
              </ATMButton>
            </div>
          }
        >
          <Form className="space-y-8">
            {!isForced && (
              <p className="text-[14px] font-medium text-slate-500 dark:text-gray-400 leading-relaxed px-1">
                Enter your current and new password below to update your account access.
              </p>
            )}

            <ChangePasswordUI
              {...formikProps}
              isForced={isForced}
              isAdmin={isAdmin}
              rules={rules}
              getStrength={getStrength}
              strengthColors={strengthColors}
              strengthLabels={strengthLabels}
            />
          </Form>
        </ATMModal>
      )}
    </Formik>
  );
};

export default ChangePasswordModal;
