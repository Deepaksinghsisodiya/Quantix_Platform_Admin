/**
 * Pass 40 (2026-05-24) â€” Merchant Profile (read + contact-info edit).
 */
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  useGetSelfProfileQuery,
  useUpdateSelfProfileMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';

export default function MerchantProfilePage() {
  const profile = useGetSelfProfileQuery();
  const m = (profile.data?.data ?? null) as MerchantSelfProfile | null;

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
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl bg-white dark:bg-surface-800 p-4 shadow-sm max-w-xl"
      >
        <ReadOnly label="Company name" value={m?.companyName} />
        <ReadOnly label="Merchant code" value={m?.merchantCode} />
        <ReadOnly label="Contact email" value={m?.contactEmail} />
        <ReadOnly label="Country" value={m?.country} />
        {Object.entries(form).map(([k, v]) => (
          <label key={k} className="block">
            <span className="text-sm font-medium capitalize">
              {k.replace(/([A-Z])/g, ' $1')}
            </span>
            <input
              type="text"
              value={v}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm"
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wide text-surface-500">{label}</span>
      <div className="text-sm">{value ?? '—'}</div>
    </div>
  );
}
