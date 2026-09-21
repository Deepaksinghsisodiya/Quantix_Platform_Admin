import React, { useState } from 'react';
import { Form, FormikProps } from 'formik';
import {
  UserPlus,
  Briefcase,
  Shield,
  CheckCircle2,
  Save,
  Fingerprint,
  Lock,
  UserCog,
  ChevronDown
} from 'lucide-react';
import { ATMInputField, ATMSelectField } from '@/shared/components/form';
import { ATMCheckbox, ATMButton, ATMSkeleton } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ROLE_ID_MAP, type PermissionCatalogItem } from '../types/user.types';
import { useGetPermissionCatalogQuery, useGetRolePermissionsQuery } from '../services/userApi';

/**
 * 2026-08-11 rework:
 *  - "Assigned Department" REMOVED — nothing in the platform ever routed, filtered or
 *    reported by it (the field was required for a concept that did not exist).
 *  - The old module×action "Granular Permission Overrides" matrix was fiction: toggles were
 *    never submitted and the backend had no per-user storage. Replaced with ADDITIVE
 *    per-user grants over the REAL permission catalog: role permissions show locked;
 *    extras are toggleable and persist via PUT /users/{id}/grants (Admin-only).
 */

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

interface FormSectionProps {
  icon: React.ElementType;
  iconClassName?: string;
  title: string;
  description: React.ReactNode;
  defaultOpen?: boolean;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
  icon: Icon,
  iconClassName = 'text-primary-600',
  title,
  description,
  defaultOpen = true,
  extra,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-gray-800/80">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/30"
      >
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 dark:border-gray-800/80 dark:bg-slate-900">
            <Icon size={18} className={iconClassName} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {extra}
          <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-slate-200/80 px-5 py-5 dark:border-gray-800/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserForm: React.FC<UserFormProps> = ({
  title,
  formikProps,
  onCancel,
  isEdit = false,
}) => {
  const { values, setFieldValue, isSubmitting, errors, touched } = formikProps;

  const selectedRoleInfo = PLATFORM_ROLES.find((r) => r.value === values.role);
  const isAdminRole = values.role === 'Admin';
  const roleId = ROLE_ID_MAP[values.role as string] ?? '';

  const { data: catalogRes, isLoading: catalogLoading } = useGetPermissionCatalogQuery(undefined, { skip: isAdminRole });
  const { data: rolePermsRes, isLoading: rolePermsLoading } = useGetRolePermissionsQuery(roleId, { skip: isAdminRole || !roleId });

  const catalog = (catalogRes?.data ?? []) as readonly PermissionCatalogItem[];
  const roleCodes = new Set((rolePermsRes?.data ?? []).map((p: PermissionCatalogItem) => p.permissionCode));
  const extraGrants: string[] = values.extraGrants ?? [];

  const grouped = catalog.reduce<Record<string, PermissionCatalogItem[]>>((acc, p) => {
    (acc[p.category || 'Other'] ??= []).push(p);
    return acc;
  }, {});

  const toggleGrant = (code: string) => {
    if (roleCodes.has(code)) return; // role permissions are locked — additive only
    setFieldValue(
      'extraGrants',
      extraGrants.includes(code) ? extraGrants.filter((c) => c !== code) : [...extraGrants, code],
    );
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={isEdit ? UserCog : UserPlus}
        iconColor="theme"
        title={title}
        subtitle={isEdit ? 'Update platform staff settings and rights' : 'Add a new staff member to the platform'}
        onBack={onCancel}
        extraActions={
          <div className="flex items-center gap-3">
            <ATMButton type="button" variant="ghost" onClick={onCancel}>
              Discard
            </ATMButton>
            <ATMButton
              type="button"
              variant="primary"
              isLoading={isSubmitting}
              icon={isEdit ? Save : UserPlus}
              onClick={() => formikProps.handleSubmit()}
            >
              {isEdit ? 'Save Changes' : 'Create User'}
            </ATMButton>
          </div>
        }
      />

      <Form id="user-form" className="w-full space-y-5">
          {/* Section 1 — Personal Details */}
          <FormSection
            icon={UserPlus}
            iconClassName="text-primary-600"
            title="Personal Details"
            description="Basic identification and corporate contact credentials."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
          </FormSection>

          {/* Section 2 — Work Details */}
          <FormSection
            icon={Briefcase}
            iconClassName="text-emerald-500"
            title="Work Details"
            description={`Platform role${isEdit ? ', account status and IP address restrictions' : ''}.`}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <ATMSelectField
                name="role"
                label="Platform Role"
                required
                options={PLATFORM_ROLES}
                placeholder="Select Role"
                hint={selectedRoleInfo?.description}
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
                <div className="md:col-span-2 lg:col-span-3">
                  <ATMInputField
                    name="ipAllowlist"
                    label="IP Allowlist (Comma-separated CIDRs)"
                    placeholder="e.g. 203.0.113.0/24, 198.51.100.42"
                    hint="Enforced by SessionValidationMiddleware on every request. Leave empty to allow any IP."
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Section 3 — Additional Permissions (additive per-user grants) */}
          <FormSection
            icon={Shield}
            iconClassName="text-primary-500"
            title="Additional Permissions"
            description={
              <>
                Role permissions are locked (additive model — never subtracted). Extras granted
                here apply on the user's next login.
              </>
            }
            extra={
              extraGrants.length > 0 && (
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  {extraGrants.length} extra
                </span>
              )
            }
          >
            {isAdminRole ? (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 p-5 dark:border-gray-800/80">
                <Lock size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Admin has every permission unconditionally — there is nothing extra to grant.
                </p>
              </div>
            ) : catalogLoading || rolePermsLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((g) => (
                  <div key={g} className="rounded-xl border border-slate-200/80 p-5 dark:border-gray-800/80">
                    <ATMSkeleton width="150px" height="12px" className="rounded" />
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
                      {[0, 1, 2, 3, 4, 5].map((r) => (
                        <div key={r} className="flex items-center gap-2.5">
                          <div className="h-4 w-4 rounded border border-slate-200 bg-surface-100 dark:bg-surface-850" />
                          <ATMSkeleton width="60%" height="14px" className="rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="rounded-xl border border-slate-200/80 p-5 dark:border-gray-800/80">
                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                      {category}
                    </p>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((p) => {
                        const fromRole = roleCodes.has(p.permissionCode);
                        const checked = fromRole || extraGrants.includes(p.permissionCode);
                        return (
                          <label
                            key={p.permissionCode}
                            className={`flex items-center gap-2.5 ${fromRole ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            title={fromRole ? 'Included in the selected role — locked' : p.permissionCode}
                          >
                            <ATMCheckbox
                              name={p.permissionCode}
                              label=""
                              checked={checked}
                              disabled={fromRole}
                              onChange={() => toggleGrant(p.permissionCode)}
                            />
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {p.permissionName}
                              {fromRole && <Lock size={11} className="text-slate-400" />}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {catalog.length === 0 && (
                  <p className="text-sm font-semibold text-red-500">
                    Permission catalog is empty — check the API connection.
                  </p>
                )}
              </div>
            )}
          </FormSection>

          {/* Governance Footer */}
          <div className="relative flex items-start gap-6 overflow-hidden rounded-2xl border bg-slate-900 p-8 text-white shadow-xl dark:border-slate-800">
            <div className="pointer-events-none absolute right-0 top-0 p-8 opacity-5">
              <Shield size={140} />
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-primary-400 shadow-inner">
              <Fingerprint size={28} />
            </div>
            <div className="relative z-10 space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary-400">Security & Compliance Notice</p>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-300">
                {isEdit
                  ? 'Role and status changes, and additional grants, apply on the user’s next login or token refresh — permissions travel in the JWT.'
                  : 'A temporary password will be assigned; the user must change it on first login. Additional grants apply from their first login.'}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Role-Based Access Governance Enforced
                </span>
              </div>
            </div>
          </div>

          {/* Error Feedback */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 animate-in fade-in dark:border-red-900/30 dark:bg-red-950/20">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                Attention Required
              </p>
              <p className="text-sm font-medium italic text-red-500 dark:text-red-400">
                Please correct all highlighted errors before submitting the form.
              </p>
            </div>
          )}
        </Form>
    </div>
  );
};

export default UserForm;