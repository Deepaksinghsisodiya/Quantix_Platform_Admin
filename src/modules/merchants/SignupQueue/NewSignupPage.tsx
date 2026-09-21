/**
 * 2026-08-12 (user-locked model): SIGNUP IS ONE FORM — the same minimal basic info a
 * website self-signup provides, entered manually by the admin. It creates the merchant
 * and drops them into the Signup Queue (source "admin_wizard"); ONBOARDING is the
 * separate wizard continued from the queue, where this info reappears editable as Step 1.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Building2, User, Mail, Phone, Globe, Briefcase, ArrowLeft,
  ArrowRight, Inbox, Wand2, BadgeCheck, Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMFieldCell, ATMFormGrid } from '@/shared/components/form';
import { useWizardCreateBasicMutation, useGetPlatformCountryQuery } from '../OnboardingWizard/wizardApi';
import { countryName } from '@/lib/utils/countryName';
import { cn } from '@/lib/utils/cn';

const FLOW_STEPS = [
  { key: 'signup', label: 'New Signup', desc: 'Capture enquiry', icon: UserPlus, state: 'done' as const },
  { key: 'queue', label: 'Signup Queue', desc: 'Review enquiry', icon: Inbox, state: 'current' as const },
  { key: 'onboard', label: 'Onboarding', desc: '8-step wizard', icon: Wand2, state: 'next' as const },
  { key: 'active', label: 'Activated', desc: 'Merchant live', icon: BadgeCheck, state: 'next' as const },
];

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

  const natureSuggestions = ['Restaurant', 'Retail', 'Restaurant & Retail', 'Enterprise SaaS', 'Quick Service'];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Page Header */}
      <ATMPageHeader
        title="New Merchant Signup"
        subtitle="Initial merchant enquiry form. Onboarding continues through the multi-step wizard from the Signup Queue."
        icon={UserPlus}
        iconColor="theme"
        onBack={() => navigate('/merchants/signups')}
      />

      {/* Journey strip */}
      <ATMCard className="glass-card" padding="md">
        <div className="flex items-center gap-2">
          {FLOW_STEPS.map((s, idx) => (
            <React.Fragment key={s.key}>
              {idx > 0 && (
                <div className="h-px flex-1 min-w-4 bg-slate-200 dark:bg-slate-700" />
              )}
              <div
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all',
                  s.state === 'current'
                    ? 'bg-primary-50 dark:bg-primary-950/30 border border-primary-200/70 dark:border-primary-800/60 shadow-sm'
                    : s.state === 'done'
                      ? 'text-slate-400'
                      : 'text-slate-300 dark:text-slate-600',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg shrink-0',
                    s.state === 'current'
                      ? 'bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md shadow-primary-500/30'
                      : s.state === 'done'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-600',
                  )}
                >
                  {s.state === 'done' ? <Check size={13} strokeWidth={3} /> : <s.icon size={14} />}
                </span>
                <div className="hidden sm:block">
                  <p
                    className={cn(
                      'text-[11px] font-black uppercase tracking-wider',
                      s.state === 'current' ? 'text-primary-700 dark:text-primary-300' : '',
                    )}
                  >
                    {s.label}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{s.desc}</p>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </ATMCard>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <ATMCard
          className="glass-card"
          padding="lg"
          title="Merchant Enquiry Form"
          subtitle="Fields marked * are required to create the signup."
        >
          <div className="space-y-8">
            {/* Section 1: Business Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--zen-border)]">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 ring-1 ring-primary-100 dark:ring-primary-900/50">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Business Identity</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Legal entity name and operating sector</p>
                </div>
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800/70 px-2 py-1 rounded-md">
                  Step 1 of 2
                </span>
              </div>

              <ATMFormGrid>
                <ATMFieldCell
                  className="md:col-span-2"
                  label="Merchant Company / Individual Name"
                  required
                >
                  <ATMTextField
                    name="companyName"
                    leftIcon={<Building2 size={16} />}
                    placeholder="e.g. Acme Foods Pvt Ltd, or a proprietor's name"
                    value={form.companyName}
                    onChange={set('companyName')}
                  />
                </ATMFieldCell>

                <ATMFieldCell label="Business Nature">
                  <ATMTextField
                    name="businessNature"
                    leftIcon={<Briefcase size={16} />}
                    placeholder="e.g. Restaurant chain, Retail store, or both"
                    value={form.businessNature}
                    onChange={set('businessNature')}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {natureSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, businessNature: item }))}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-all ${
                          form.businessNature === item
                            ? 'bg-primary-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </ATMFieldCell>

                <ATMFieldCell label="Operating Country" hint="Single-country deployment — set once in Global Settings.">
                  <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Globe size={16} className="text-slate-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{countryLabel}</span>
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-1 rounded-md ring-1 ring-primary-100 dark:ring-primary-900/50">
                      Platform Default
                    </span>
                  </div>
                </ATMFieldCell>
              </ATMFormGrid>
            </div>

            {/* Section 2: Point of Contact */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--zen-border)]">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-900/50">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Authorized Representative</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Primary point of contact for onboarding & account delivery</p>
                </div>
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800/70 px-2 py-1 rounded-md">
                  Step 2 of 2
                </span>
              </div>

              <ATMFormGrid cols={3}>
                <ATMFieldCell label="Contact Person Name" required>
                  <ATMTextField
                    name="contactName"
                    leftIcon={<User size={16} />}
                    placeholder="e.g. Jane Doe"
                    value={form.contactName}
                    onChange={set('contactName')}
                  />
                </ATMFieldCell>

                <ATMFieldCell label="Contact Email Address" required>
                  <ATMTextField
                    name="contactEmail"
                    type="email"
                    leftIcon={<Mail size={16} />}
                    placeholder="e.g. contact@business.com"
                    value={form.contactEmail}
                    onChange={set('contactEmail')}
                  />
                </ATMFieldCell>

                <ATMFieldCell label="Contact Phone Number">
                  <ATMTextField
                    name="contactPhone"
                    type="tel"
                    leftIcon={<Phone size={16} />}
                    placeholder="e.g. +1 555-0199"
                    value={form.contactPhone}
                    onChange={set('contactPhone')}
                  />
                </ATMFieldCell>
              </ATMFormGrid>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-[var(--zen-border)] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <ATMButton
                variant="outline"
                size="md"
                icon={ArrowLeft}
                onClick={() => navigate('/merchants/signups')}
              >
                Cancel & Return
              </ATMButton>
              <ATMButton
                variant="primary"
                size="lg"
                iconPosition="right"
                icon={ArrowRight}
                isLoading={submitting}
                onClick={handleSubmit}
              >
                Create Merchant Signup
              </ATMButton>
            </div>
          </div>
        </ATMCard>

        {/* Info rail */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-400 text-white p-5 shadow-lg shadow-primary-500/25">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-100 mb-3">
              <Wand2 size={13} /> After signup
            </div>
            <ul className="space-y-3">
              {[
                'Signup lands in the Signup Queue for review',
                'Onboarding runs through the 8-step wizard',
                'Type, plan, KYC, payment and funding are set there',
                'Activate to provision the portal login & welcome pack',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[12px] font-semibold leading-snug">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 mt-0.5 shrink-0">
                    <Check size={10} strokeWidth={3.5} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <ATMCard className="glass-card" padding="md">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tip</p>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
              This is the same minimal form a website self-signup provides. The wizard later
              reuses and extends this info, so anything omitted here can be added during onboarding.
            </p>
          </ATMCard>
        </div>
      </div>
    </div>
  );
}

export default NewSignupPage;