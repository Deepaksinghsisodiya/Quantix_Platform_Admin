/**
 * Pass 40 (2026-05-24) — Merchant Profile (read + contact-info edit).
 * 2026-09-21: two-column layout — read-only business summary beside an
 * editable contact/address form with inline validation.
 */
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Building2, CalendarDays, Hash, Mail, MapPin, ShieldCheck, Store, User } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import {
  useGetSelfProfileQuery,
  useUpdateSelfProfileMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';

import { object, string, ValidationError } from 'yup';

const INITIAL_FORM = {
  displayName: '',
  contactName: '',
  contactPhone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
};
type FormKey = keyof typeof INITIAL_FORM;

type Errors = Partial<Record<FormKey, string>>;

const profileSchema = object({
  displayName: string().trim().required('Give the account a display name.'),
  contactName: string().trim().required('Who should support ask for?'),
  contactPhone: string()
    .trim()
    .required('A contact number is required for recovery.')
    .matches(/^[+()0-9\s-]{7,20}$/, 'Use 7–20 digits (+, -, spaces allowed).'),
  addressLine1: string(),
  addressLine2: string(),
  city: string(),
  state: string(),
  postalCode: string().test(
    'postal-or-empty',
    'A postal code is 3–12 letters, digits or dashes.',
    (v) => !v || /^[A-Za-z0-9\s-]{3,12}$/.test(v),
  ),
});

function fieldError(key: FormKey, value: string): string | undefined {
  try {
    profileSchema.validateSyncAt(key, { [key]: value });
    return undefined;
  } catch (err) {
    if (err instanceof ValidationError) return err.message;
    return undefined;
  }
}

export default function MerchantProfilePage() {
  const profile = useGetSelfProfileQuery();
  const m = (profile.data?.data ?? null) as MerchantSelfProfile | null;

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});

  useEffect(() => {
    if (m) {
      setForm({
        displayName: m.displayName ?? '',
        contactName: m.contactName ?? '',
        contactPhone: m.contactPhone ?? '',
        addressLine1: m.addressLine1 ?? '',
        addressLine2: m.addressLine2 ?? '',
        city: m.city ?? '',
        state: m.state ?? '',
        postalCode: m.postalCode ?? '',
      });
      setErrors({});
      setTouched({});
    }
  }, [m]);

  const [updateProfile, { isLoading: isSaving }] = useUpdateSelfProfileMutation();

  const hasErrors = useMemo(() => {
    try {
      profileSchema.validateSync(form, { abortEarly: false });
      return false;
    } catch {
      return true;
    }
  }, [form]);

  function setField(key: FormKey, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    const err = fieldError(key, value);
    setErrors((e) => {
      if (err) return { ...e, [key]: err };
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    let next: Errors = {};
    try {
      await profileSchema.validate(form, { abortEarly: false });
    } catch (err) {
      if (err instanceof ValidationError) {
        next = {};
        err.inner.forEach((ve) => {
          if (ve.path && !next[ve.path as FormKey]) next[ve.path as FormKey] = ve.message;
        });
        setErrors(next);
        return;
      }
    }
    try {
      await updateProfile(form).unwrap();
      toast.success('Profile updated.');
      setTouched({});
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update profile.');
    }
  }

  if (profile.isLoading) {
    return (
      <div className="w-full space-y-6 animate-fade-in">
        <ATMPageHeader icon={User} iconColor="theme" title="Profile" subtitle="Your account and contact details." />
        <div className="grid gap-5 lg:grid-cols-3">
          <aside className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
            <div className="flex items-center gap-3">
              <ATMSkeleton width="48px" height="48px" className="rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <ATMSkeleton width="130px" height="14px" className="rounded" />
                <ATMSkeleton width="90px" height="12px" className="rounded" />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <ATMSkeleton width="32px" height="32px" className="rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <ATMSkeleton width="90px" height="10px" className="rounded" />
                    <ATMSkeleton width="140px" height="14px" className="rounded" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-[#13151a]">
            <div className="border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <ATMSkeleton width="36px" height="36px" className="rounded-lg" />
                <div className="space-y-1.5">
                  <ATMSkeleton width="110px" height="14px" className="rounded" />
                  <ATMSkeleton width="160px" height="12px" className="rounded" />
                </div>
              </div>
            </div>
            <div className="space-y-4 p-5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ATMSkeleton key={i} height="44px" className="rounded-xl" />
              ))}
              <ATMSkeleton width="128px" height="40px" className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const readonly: Array<{ icon: typeof Store; label: string; value?: string | null; mono?: boolean }> = [
    { icon: Store, label: 'Business nature', value: m?.businessNature, mono: true },
    { icon: Hash, label: 'Merchant code', value: m?.merchantCode, mono: true },
    { icon: Mail, label: 'Contact email', value: m?.contactEmail, mono: true },
    { icon: CalendarDays, label: 'Member since', value: m?.activatedAt ? formatDate(m.activatedAt, 'short') : null },
    { icon: MapPin, label: 'Country', value: m?.country },
  ];

  const groups: Array<{ title: string; fields: FormKey[] }> = [
    { title: 'Contact', fields: ['displayName', 'contactName', 'contactPhone'] },
    { title: 'Address', fields: ['addressLine1', 'addressLine2', 'city', 'state', 'postalCode'] },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader icon={User} iconColor="theme" title="Profile" subtitle="Your account and contact details." />
      <div className="grid gap-5 lg:grid-cols-3">
        <aside className="relative self-start overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#13151a]/80">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-500/10 blur-3xl dark:bg-primary-500/10"
          />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md">
                <Building2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {m?.companyName ?? '—'}
                </p>
                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {m?.displayName || 'Merchant account'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold',
                  m?.merchantStatus === 'Active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                )}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {m?.merchantStatus ?? '—'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {m?.merchantType ?? '—'}
              </span>
            </div>

            <dl className="space-y-1">
              {readonly.map(({ icon: Icon, label, value, mono }) => (
                <div key={label} className="flex items-center gap-3 py-1.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {label}
                    </dt>
                    <dd
                      className={cn(
                        'truncate text-sm text-slate-900 dark:text-slate-100',
                        mono ? 'font-mono font-medium' : 'font-semibold',
                      )}
                    >
                      {value ?? '—'}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          noValidate
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-[#13151a]"
        >
          <div className="flex items-center gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md">
              <User className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Edit profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep your contact and address details current.
              </p>
            </div>
          </div>

          <div className="p-5">
            {groups.map((g) => (
              <fieldset key={g.title}>
                <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                    {g.title === 'Contact' ? <Mail className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  </span>
                  {g.title}
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {g.fields.map((k) => {
                    const err = errors[k];
                    const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
                    return (
                      <label key={k} className={cn('block', k === 'addressLine1' || k === 'addressLine2' ? 'sm:col-span-2' : '')}>
                        <span className="text-sm font-medium text-slate-700 capitalize dark:text-slate-300">{label}</span>
                        <input
                          type="text"
                          value={form[k]}
                          onBlur={() => {
                            const nextErr = fieldError(k, form[k]);
                            setTouched((t) => ({ ...t, [k]: true }));
                            if (nextErr) setErrors((e) => ({ ...e, [k]: nextErr }));
                          }}
                          onChange={(e) => setField(k, e.target.value)}
                          aria-invalid={!!err}
                          className={cn(
                            'mt-1 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-4 dark:bg-slate-900/60 dark:text-slate-100',
                            err
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500'
                              : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/10 dark:border-slate-700',
                          )}
                        />
                        {err && <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">{err}</span>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-800">
              {hasErrors && Object.keys(errors).length > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Fix the highlighted fields to save.
                </span>
              )}
              <ATMButton type="submit" variant="primary" isLoading={isSaving}>
                Save changes
              </ATMButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}