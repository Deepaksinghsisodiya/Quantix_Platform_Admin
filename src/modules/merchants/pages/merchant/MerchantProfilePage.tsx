/**
 * Pass 40 (2026-05-24) â€” Merchant Profile (read + contact-info edit).
 */
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import {
  useGetSelfProfileQuery,
  useUpdateSelfProfileMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';

export default function MerchantProfilePage() {
  const profile = useGetSelfProfileQuery();
  const m = (profile.data?.data ?? null) as MerchantSelfProfile | null;

  if (profile.isLoading) {
    return (
      <div className="w-full max-w-xl space-y-6 animate-fade-in">
        <ATMPageHeader icon={User} iconColor="theme" title="Profile" subtitle="Your account and contact details." />
        <div className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <ATMSkeleton width="100px" height="12px" className="rounded" />
              <ATMSkeleton height="24px" className="rounded-lg" />
            </div>
          ))}
          <ATMSkeleton width="160px" height="14px" className="rounded" />
          <ATMSkeleton height="36px" className="rounded-lg" />
          <ATMSkeleton width="128px" height="40px" className="rounded-lg" />
        </div>
      </div>
    );
  }

  const [form, setForm] = useState({
    displayName: '',
    contactName: '',
    contactPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

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
    }
  }, [m]);

  const [updateProfile, { isLoading: isSaving }] = useUpdateSelfProfileMutation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await updateProfile(form).unwrap();
      toast.success('Profile updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update profile.');
    }
  }


  return (
    <div className="w-full max-w-xl space-y-6 animate-fade-in">
      <ATMPageHeader icon={User} iconColor="theme" title="Profile" subtitle="Your account and contact details." />
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]"
      >
        <ReadOnly label="Company name" value={m?.companyName} />
        <ReadOnly label="Merchant code" value={m?.merchantCode} />
        <ReadOnly label="Contact email" value={m?.contactEmail} />
        <ReadOnly label="Country" value={m?.country} />
        {Object.entries(form).map(([k, v]) => (
          <label key={k} className="block">
            <span className="text-sm font-medium text-slate-700 capitalize dark:text-slate-300">
              {k.replace(/([A-Z])/g, ' $1')}
            </span>
            <input
              type="text"
              value={v}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
            />
          </label>
        ))}
        <ATMButton type="submit" variant="primary" isLoading={isSaving}>
          Save changes
        </ATMButton>
      </form>
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{value ?? '—'}</div>
    </div>
  );
}