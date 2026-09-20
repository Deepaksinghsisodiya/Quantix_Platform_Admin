/**
 * 2026-08-12 (user-locked model): SIGNUP IS ONE FORM — the same minimal basic info a
 * website self-signup provides, entered manually by the admin. It creates the merchant
 * and drops them into the Signup Queue (source "admin_wizard"); ONBOARDING is the
 * separate wizard continued from the queue, where this info reappears editable as Step 1.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { useWizardCreateBasicMutation, useGetPlatformCountryQuery } from '../OnboardingWizard/wizardApi';
import { countryName } from '@/lib/utils/countryName';

export function NewSignupPage() {
  const navigate = useNavigate();
  const { data: countryRes } = useGetPlatformCountryQuery();
  const [createBasic, { isLoading: submitting }] = useWizardCreateBasicMutation();

  const platformCountry = (countryRes?.data as any)?.settingValue ?? '';
  const countryLabel = countryName(platformCountry) || '…';

  const [form, setForm] = useState({
    companyName: '', contactName: '', contactEmail: '', contactPhone: '', businessNature: '',
  });
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.companyName.trim() || !form.contactName.trim() || !form.contactEmail.trim()) {
      toast.error('Company name, contact person and contact email are required.');
      return;
    }
    try {
      // Country is server-authoritative (single-country deployment).
      await createBasic({ ...form, country: platformCountry }).unwrap();
      toast.success('Signup created — it is now in the queue. Continue onboarding whenever ready.');
      navigate('/merchants/signups');
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to create the signup.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 animate-page-enter">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Signup</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            The same minimal form a website self-signup fills — just enough to identify the
            merchant. Onboarding continues afterwards from the Signup Queue.
          </p>
        </div>
        <ATMButton variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/merchants/signups')}>
          Back to Signup Queue
        </ATMButton>
      </div>

      <ATMCard className="glass-card">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ATMTextField name="companyName" label="Merchant Company / Individual Name" required
            placeholder="e.g. Acme Foods Pvt Ltd, or a proprietor's name"
            value={form.companyName} onChange={set('companyName')} />
          <ATMTextField name="contactName" label="Contact Person" required
            value={form.contactName} onChange={set('contactName')} />
          <ATMTextField name="contactEmail" label="Contact Email" type="email" required
            value={form.contactEmail} onChange={set('contactEmail')} />
          <ATMTextField name="contactPhone" label="Contact Phone"
            value={form.contactPhone} onChange={set('contactPhone')} />
          <ATMTextField name="country" label="Country" value={countryLabel} disabled
            onChange={() => undefined} />
          <ATMTextField name="businessNature" label="Business Nature (free text)"
            placeholder="e.g. Restaurant chain, Retail shops, or both"
            value={form.businessNature} onChange={set('businessNature')} />
        </div>
        <div className="mt-6 flex justify-end">
          <ATMButton variant="primary" icon={UserPlus} isLoading={submitting} onClick={handleSubmit}>
            Create Signup
          </ATMButton>
        </div>
      </ATMCard>
    </div>
  );
}

export default NewSignupPage;
