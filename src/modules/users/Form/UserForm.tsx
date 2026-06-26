import React from 'react';
import { Form, FormikProps } from 'formik';
import {
  UserPlus,
  Briefcase,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Save,
  Fingerprint
} from 'lucide-react';
import { ATMInputField, ATMSelectField } from '@/shared/components/form';
import { ATMCheckbox, ATMButton, ATMIconButton } from '@/shared/ui';
import type { PlatformRole } from '../types/user.types';
import { ROLE_PERMISSIONS, type PermissionModule } from '@/lib/utils/permissions';

interface UserFormProps {
  title: string;
  formikProps: FormikProps<any>;
  onCancel: () => void;
  isEdit?: boolean;
}

const PLATFORM_ROLES = [
  { value: 'Admin', label: 'Admin', description: 'Full access to all modules; grants overlay activities to Operators' },
  { value: 'OperationsManager', label: 'Operations Manager', description: 'Merchant onboarding / deboarding, token generation, plan changes' },
  { value: 'FinanceManager', label: 'Finance Manager', description: 'Wallet, invoice, commission, withdrawal, tax + billing cadence' },
  { value: 'ContentManager', label: 'Content Manager', description: 'Public Website content (blog / FAQ / help) + CRM (leads / contacts)' },
  { value: 'Operator', label: 'Operator', description: 'Helpdesk tickets by default; Admin grants additional activities per user' },
];

const DEPARTMENTS = [
  'Engineering', 'Operations', 'Finance', 'Support', 'Marketing', 'Management', 'Sales',
];

const ALL_MODULES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'merchants', label: 'Merchants' },
  { value: 'billing', label: 'Billing' },
  { value: 'tokens', label: 'Tokens' },
  { value: 'commission', label: 'Commission' },
  { value: 'support', label: 'Support' },
  { value: 'content', label: 'Content' },
  { value: 'settings', label: 'Settings' },
  { value: 'reports', label: 'Reports' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'audit', label: 'Audit' },
  { value: 'users', label: 'Users' },
  { value: 'downloads', label: 'Downloads' },
];

const ALL_ACTIONS = ['view', 'create', 'edit', 'delete', 'admin'];

export const UserForm: React.FC<UserFormProps> = ({
  title,
  formikProps,
  onCancel,
  isEdit = false,
}) => {
  const { values, setFieldValue, isSubmitting, errors, touched } = formikProps;

  const selectedRoleInfo = PLATFORM_ROLES.find((r) => r.value === values.role);

  const isPermissionGranted = (mod: string, action: string) => {
    const overrides = values.overrides || {};
    if (overrides[mod]) {
      return overrides[mod].includes(action);
    }
    const roleDefault = ROLE_PERMISSIONS[values.role as PlatformRole]?.[mod as PermissionModule];
    return roleDefault ? roleDefault.includes(action as any) : false;
  };

  const togglePermission = (mod: string, action: string) => {
    const currentOverrides = { ...(values.overrides || {}) };
    let currentModuleActions = currentOverrides[mod];

    if (!currentModuleActions) {
      const roleDefault = ROLE_PERMISSIONS[values.role as PlatformRole]?.[mod as PermissionModule] || [];
      currentModuleActions = [...roleDefault];
    }

    if (currentModuleActions.includes(action)) {
      currentModuleActions = currentModuleActions.filter((a: string) => a !== action);
    } else {
      currentModuleActions.push(action);
    }

    currentOverrides[mod] = currentModuleActions;
    setFieldValue('overrides', currentOverrides);
  };

  return (
    <div className="w-full h-full bg-zen-surface animate-in fade-in duration-500 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-zen-surface z-20 shadow-sm">
        <div className="flex items-center gap-5">
          <ATMIconButton
            type="button"
            icon={ArrowLeft}
            onClick={onCancel}
            variant="default"
            size="md"
            className="hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-100 dark:border-gray-800 text-slate-400"
          />
          <div className="w-px h-10 bg-slate-100 dark:bg-gray-800" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1.5">
              {isEdit ? 'Update platform staff settings and rights' : 'Add a new staff member to the platform'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ATMButton
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="px-10 h-14 font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900"
          >
            Discard
          </ATMButton>
          <ATMButton
            type="button"
            variant="primary"
            isLoading={isSubmitting}
            icon={isEdit ? Save : UserPlus}
            onClick={() => formikProps.handleSubmit()}
            className="px-16 h-14 bg-accent-600 text-white hover:bg-accent-700 rounded-2xl shadow-2xl shadow-accent-900/20 transition-all active:scale-95 font-black uppercase tracking-[0.2em]"
          >
            {isEdit ? 'Save Changes' : 'Create User'}
          </ATMButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/10 dark:bg-gray-900/10">
        <Form id="user-form" className="px-10 py-12 space-y-16 max-w-full">
          {/* Section 1 — Personal Details */}
          <div className="space-y-10">
            <div className="border-l-4 border-accent-600 pl-5">
              <h3 className="text-xs font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-2">
                <UserPlus size={14} className="text-accent-600" />
                Personal Details
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">
                Basic identification and corporate contact credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pl-6">
              <ATMInputField name="name" label="Full Name" placeholder="e.g. Sarah Chen" required />
              <ATMInputField name="email" label="Corporate Email" type="email" placeholder="sarah.chen@quantix.io" required disabled={isEdit} />
              {!isEdit && (
                <ATMInputField
                  name="password"
                  label="Temporary Password"
                  type="password"
                  placeholder="Minimum 12 characters"
                  required
                />
              )}
            </div>
          </div>

          {/* Section 2 — Work Details */}
          <div className="space-y-10">
            <div className="border-l-4 border-emerald-500 pl-5">
              <h3 className="text-xs font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-2">
                <Briefcase size={14} className="text-emerald-500" />
                Work Details
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">
                Assigned department, platform role, and IP address restrictions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pl-6">
              <ATMSelectField
                name="role"
                label="Platform Role"
                required
                options={PLATFORM_ROLES}
                placeholder="Select Role"
                hint={selectedRoleInfo?.description}
              />

              <ATMSelectField
                name="department"
                label="Assigned Department"
                required
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                placeholder="Select Department"
              />

              {isEdit && (
                <ATMSelectField
                  name="status"
                  label="Account Status"
                  required
                  options={[
                    { value: 'Active', label: 'Active (Enabled)' },
                    { value: 'Inactive', label: 'Inactive (Disabled)' },
                    { value: 'Locked', label: 'Locked (Security Block)' },
                  ]}
                />
              )}

              {isEdit && (
                <div className="md:col-span-2">
                  <ATMInputField
                    name="ipAllowlist"
                    label="IP Allowlist (Comma-separated CIDRs)"
                    placeholder="e.g. 203.0.113.0/24, 198.51.100.42"
                    hint="Enforced by SessionValidationMiddleware on every request. Leave empty to allow any IP."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3 — Role Permissions Overrides */}
          <div className="space-y-10">
            <div className="border-l-4 border-indigo-500 pl-5">
              <h3 className="text-xs font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.2em] flex items-center gap-2">
                <Shield size={14} className="text-indigo-500" />
                Granular Permission Overrides
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-gray-500 mt-1">
                Pre-filled based on selected role. Toggle options below to define user-specific overrides.
              </p>
            </div>

            <div className="pl-6">
              <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm bg-zen-card">
                <table className="w-full min-w-[700px] text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/75 dark:border-gray-800 dark:bg-gray-900/30">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-550">
                        Module
                      </th>
                      {ALL_ACTIONS.map((a) => (
                        <th
                          key={a}
                          className="px-4 py-5 text-center text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-550"
                        >
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                    {ALL_MODULES.map((mod) => (
                      <tr key={mod.value} className="hover:bg-gray-50/30 dark:hover:bg-gray-850/10">
                        <td className="px-8 py-4 font-bold text-gray-900 dark:text-white">
                          {mod.label}
                        </td>
                        {ALL_ACTIONS.map((action) => (
                          <td key={action} className="px-4 py-4">
                            <div className="flex justify-center">
                              <ATMCheckbox
                                name={`${mod.value}-${action}`}
                                label=""
                                checked={isPermissionGranted(mod.value, action)}
                                onChange={() => togglePermission(mod.value, action)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Governance Footer */}
          <div className="bg-slate-900 dark:bg-gray-900 rounded-[2.5rem] p-10 text-white flex items-start gap-8 shadow-2xl relative overflow-hidden group border dark:border-gray-800">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform group-hover:scale-110 duration-700">
              <Shield size={180} />
            </div>
            <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-accent-400 shrink-0 border border-slate-700 shadow-inner">
              <Fingerprint size={32} />
            </div>
            <div className="space-y-4 relative z-10">
              <p className="font-black uppercase text-[11px] tracking-[0.3em] text-accent-400">Security & Compliance Notice</p>
              <p className="font-medium text-base leading-relaxed text-slate-300 max-w-2xl">
                {isEdit
                  ? 'Modifying roles or status changes will immediately affect active sessions. Permissions overrides are evaluated dynamically on request authorization.'
                  : 'A temporary password will be assigned. Users are required to undergo mandatory Multi-Factor Authentication (MFA) enrolment upon their first login.'}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Role-Based Access Governance Enforced
                </span>
              </div>
            </div>
          </div>

          {/* Error Feedback */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
                Attention Required
              </p>
              <p className="text-sm text-red-500 dark:text-red-400 font-medium italic">
                Please correct all highlighted errors before submitting the form.
              </p>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default UserForm;
