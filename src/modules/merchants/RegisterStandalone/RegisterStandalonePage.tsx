import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type FormikProps } from 'formik';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Mail,
  Rocket,
  Receipt,
  Store,
  User,
  AlertTriangle,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMInputField, ATMSelectField, ATMPhoneInputField } from '@/shared/components/form';
import { OnboardingChecklist } from '../components/OnboardingChecklist';
import { WelcomeCommunications } from '../components/WelcomeCommunications';
import { StepProgress } from '../components/StepProgress';
import { TypeCard } from '../components/TypeCard';
import { ReviewRow } from '../components/ReviewRow';
import { ActivationStep } from '../components/ActivationStep';
import { cn } from '@/lib/utils/cn';
import type { OnboardingChecklist as OnboardingChecklistType } from '../types/merchant.types';

type TokenTier = 'Basic' | 'Standard' | 'Advance' | 'Premium';

export const STEPS = [
  'Merchant Type',
  'Business Type',
  'Business Details',
  'Token Configuration',
  'Review & Generate',
  'Activation',
] as const;

const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
  { label: 'India', value: 'IN' },
  { label: 'UAE', value: 'AE' },
  { label: 'Saudi Arabia', value: 'SA' },
  { label: 'Singapore', value: 'SG' },
];

interface TierDef {
  tier: TokenTier;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  features: string[];
}

const TIERS: TierDef[] = [
  {
    tier: 'Basic',
    label: 'Basic',
    description: 'Essential POS features for small businesses.',
    color: 'text-surface-700 dark:text-surface-300',
    bgColor: 'bg-surface-100 dark:bg-surface-850',
    features: ['Single terminal', 'Basic reports', 'Cash payments'],
  },
  {
    tier: 'Standard',
    label: 'Standard',
    description: 'Full POS with card payments and inventory.',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    features: ['Up to 3 terminals', 'Card payments', 'Inventory management', 'Customer records'],
  },
  {
    tier: 'Advance',
    label: 'Advance',
    description: 'Multi-location support with advanced analytics.',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    features: ['Up to 10 terminals', 'Multi-location', 'Advanced analytics', 'Loyalty program', 'API access'],
  },
  {
    tier: 'Premium',
    label: 'Premium',
    description: 'Everything included. White-label capable.',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    features: ['Unlimited terminals', 'White-label', 'Custom integrations', 'Priority support', 'All features'],
  },
];

const VALIDITY_OPTIONS = [30, 60, 90, 180, 365] as const;

const DEFAULT_TOKEN_LIMITS: Record<TokenTier, { maxTerminals: number; maxProducts: number; maxUsers: number }> = {
  Basic: { maxTerminals: 1, maxProducts: 500, maxUsers: 5 },
  Standard: { maxTerminals: 3, maxProducts: 2000, maxUsers: 15 },
  Advance: { maxTerminals: 10, maxProducts: 10000, maxUsers: 50 },
  Premium: { maxTerminals: 999, maxProducts: 99999, maxUsers: 999 },
};

const TOKEN_PRICING: Record<TokenTier, Record<number, number>> = {
  Basic: { 30: 19, 60: 35, 90: 49, 180: 89, 365: 159 },
  Standard: { 30: 39, 60: 69, 90: 99, 180: 179, 365: 319 },
  Advance: { 30: 79, 60: 139, 90: 199, 180: 359, 365: 649 },
  Premium: { 30: 149, 60: 269, 90: 379, 180: 689, 365: 1199 },
};

interface RegisterStandalonePageProps {
  formik: FormikProps<any>;
  step: number;
  isLoading: boolean;
  activationStatus: 'idle' | 'activating' | 'done' | 'error';
  generatedToken: {
    tokenString: string;
    merchantId: string;
  } | null;
  copied: boolean;
  registrationCompleted: boolean;
  handleNext: (formik: FormikProps<any>) => Promise<void>;
  handleBack: () => void;
  handleCopy: () => void;
  handleEmail: (email: string) => void;
  handleDownload: () => void;
  retryActivation: () => void;
}

function TierCard({
  tier,
  selected,
  onSelect,
}: {
  tier: TierDef;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-300 w-full',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/10',
        selected
          ? 'border-accent-600 bg-accent-50/50 shadow-md dark:border-accent-500 dark:bg-accent-950/20'
          : 'border-surface-200 bg-zen-surface hover:border-accent-300 dark:border-surface-800 dark:hover:border-accent-800',
      )}
    >
      {selected && (
        <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-accent-600 dark:text-accent-400" />
      )}
      <div className={cn('inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs font-bold uppercase tracking-wider', tier.bgColor, tier.color)}>
        {tier.label}
      </div>
      <p className="mt-2 text-xs font-semibold text-surface-500 dark:text-surface-400">{tier.description}</p>
      <ul className="mt-3 space-y-1.5 w-full">
        {tier.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs font-semibold text-surface-600 dark:text-surface-400">
            <Check className="h-3 w-3 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

export const RegisterStandalonePage: React.FC<RegisterStandalonePageProps> = ({
  formik,
  step,
  isLoading,
  activationStatus,
  generatedToken,
  copied,
  registrationCompleted,
  handleNext,
  handleBack,
  handleCopy,
  handleEmail,
  handleDownload,
  retryActivation,
}) => {
  const navigate = useNavigate();

  // Full screen success / activation views
  if (registrationCompleted && generatedToken) {
    const activeTier = formik.values.initialTokenTier as TokenTier;
    const activeDays = formik.values.initialTokenValidityDays;
    const activeTierDef = TIERS.find((t) => t.tier === activeTier);
    const price = TOKEN_PRICING[activeTier]?.[activeDays] ?? 0;
    const limits = DEFAULT_TOKEN_LIMITS[activeTier];

    const initialChecklist: OnboardingChecklistType = {
      accountVerified: true,
      profileCompleted: true,
      firstLocationAdded: false,
      firstTerminalActivated: false,
      firstTransactionCompleted: false,
      paymentMethodConfigured: false,
      completedAt: null,
    };

    return (
      <div className="mx-auto max-w-2xl space-y-8 py-8 animate-fade-in w-full">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20">
            <Rocket className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-555">
            Merchant Registered Successfully
          </h2>
          <p className="mt-2 text-surface-500 dark:text-surface-400 text-sm font-medium">
            The Standalone merchant is now <ATMBadge color="success" size="sm" label="Active" /> with token generated.
          </p>
        </div>

        <ATMCard title="Activation Token" padding="md" className="glass-card">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 font-mono text-sm text-surface-900 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-100">
                {generatedToken.tokenString}
              </code>
              <ATMButton
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                icon={copied ? CheckCircle2 : Copy}
                className={copied ? 'text-emerald-500' : ''}
              />
            </div>

            <div className="flex justify-center">
              <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-surface-800 dark:bg-surface-900">
                <QRCodeSVG
                  value={generatedToken.tokenString}
                  size={180}
                  level="H"
                  includeMargin
                />
                <p className="mt-2 text-center text-xs font-semibold text-surface-400 dark:text-surface-500">Scan to activate</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl bg-surface-50 p-2.5 dark:bg-surface-900/50 border border-surface-200/50 dark:border-surface-800">
                <p className="text-surface-400 dark:text-surface-500 font-semibold">Tier</p>
                <p className={cn('font-bold', activeTierDef?.color)}>{activeTierDef?.label}</p>
              </div>
              <div className="rounded-xl bg-surface-50 p-2.5 dark:bg-surface-900/50 border border-surface-200/50 dark:border-surface-800">
                <p className="text-surface-400 dark:text-surface-500 font-semibold">Validity</p>
                <p className="font-bold text-surface-900 dark:text-surface-100">{activeDays} days</p>
              </div>
              <div className="rounded-xl bg-surface-50 p-2.5 dark:bg-surface-900/50 border border-surface-200/50 dark:border-surface-800">
                <p className="text-surface-400 dark:text-surface-500 font-semibold">Type</p>
                <p className="font-bold text-surface-900 dark:text-surface-100">Standalone</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <ATMButton variant="primary" size="sm" icon={Mail} onClick={() => handleEmail(formik.values.email)}>
                Email to Merchant
              </ATMButton>
              <ATMButton variant="outline" size="sm" icon={Download} onClick={handleDownload}>
                Download
              </ATMButton>
              <ATMButton variant="outline" size="sm" icon={copied ? CheckCircle2 : Copy} onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </ATMButton>
            </div>
          </div>
        </ATMCard>

        <ATMCard title="Token Invoice" padding="md" className="glass-card">
          <div className="space-y-3 font-medium">
            <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 font-semibold">
              <Receipt className="h-3.5 w-3.5" />
              <span>Invoice auto-generated for token purchase</span>
            </div>
            <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-900">
              <dl className="divide-y divide-surface-200 dark:divide-surface-800">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Item</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-100 uppercase tracking-tight">
                    {activeTierDef?.label} Token — {activeDays} days
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Business Nature</span>
                  <span className="font-semibold text-surface-900 dark:text-white font-bold">
                    {formik.values.businessNature || 'General Retail'}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Limits</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-100">
                    {limits.maxTerminals} terminals, {limits.maxProducts} products, {limits.maxUsers} users
                  </span>
                </div>
                <div className="flex justify-between py-2.5 text-sm font-bold border-t border-surface-200/50">
                  <span className="text-surface-900 dark:text-surface-100">Total</span>
                  <span className="text-surface-950 dark:text-white">${price.toFixed(2)}</span>
                </div>
              </dl>
            </div>
            <div className="flex items-center justify-between">
              <ATMBadge color="warning" size="sm" label="Pending Payment" />
              <ATMButton variant="ghost" size="sm" icon={FileText}>
                Download Invoice PDF
              </ATMButton>
            </div>
          </div>
        </ATMCard>

        <WelcomeCommunications
          merchantType="Standalone"
          merchantId={generatedToken.merchantId}
          email={formik.values.email}
          contactPerson={formik.values.contactPerson}
        />

        <OnboardingChecklist merchantType="Standalone" checklist={initialChecklist} />

        <div className="flex justify-center gap-3">
          <ATMButton variant="outline" onClick={() => navigate('/merchants')}>
            Back to Directory
          </ATMButton>
          <ATMButton variant="primary" onClick={() => navigate(`/merchants/${generatedToken.merchantId}`)}>
            View Merchant
          </ATMButton>
        </div>
      </div>
    );
  }

  if (step === 5) {
    const activeTier = formik.values.initialTokenTier as TokenTier;
    const activeTierDef = TIERS.find((t) => t.tier === activeTier);
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-12 animate-fade-in w-full">
        <ActivationStep
          status={activationStatus}
          variant="standalone"
          planName={activeTierDef?.label ?? activeTier}
          billingFrequency={`${formik.values.initialTokenValidityDays} Days`}
        />
      </div>
    );
  }

  const canNext = () => {
    switch (step) {
      case 0: return true;
      case 1: return true;
      case 2: return true;
      case 3: return formik.values.initialTokenTier !== null;
      case 4: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-555">Select Merchant Type</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Choose the operating model for this merchant.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 w-full">
              <TypeCard
                selected={false}
                onSelect={() => navigate('/merchants/register/enterprise')}
                icon={<Building2 className="h-7 w-7" />}
                title="Enterprise"
                description="Cloud-connected SaaS model with subscription billing and real-time sync."
              />
              <TypeCard
                selected
                onSelect={() => {}}
                icon={<Store className="h-7 w-7" />}
                title="Standalone"
                description="Token-based offline model with periodic activation."
              />
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 px-4 py-3 text-xs font-semibold text-amber-800 dark:text-amber-350">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              Merchant type cannot be changed after registration.
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Business Nature</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Free-text descriptor — no taxonomy. Sales / reporting metadata only.
              </p>
            </div>
            <div className="space-y-2">
              <ATMInputField
                label="Business Nature"
                name="businessNature"
                placeholder="e.g. Restaurant, Pharmacy, Convenience store + cafe..."
                maxLength={200}
              />
              <p className="text-xs text-surface-400 font-semibold px-1">Optional — leave blank to record nothing.</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Business Details</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Enter primary business contact details.
              </p>
            </div>
            <div className="space-y-4">
              <ATMInputField
                label="Business Name"
                name="businessName"
                placeholder="e.g., Corner Cafe"
                required
              />
              <ATMInputField
                label="Contact Person"
                name="contactPerson"
                placeholder="Full name"
                icon={<User className="h-4 w-4 text-surface-400" />}
                required
              />
              <ATMInputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="owner@business.com"
                icon={<Mail className="h-4 w-4 text-surface-400" />}
                required
              />
              <ATMPhoneInputField
                label="Phone Number"
                name="phone"
                required
              />
              <ATMSelectField
                name="country"
                label="Country"
                options={COUNTRY_OPTIONS}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Token Configuration</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Select the initial token tier and validity period.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 w-full font-medium">
              {TIERS.map((tier) => (
                <TierCard
                  key={tier.tier}
                  tier={tier}
                  selected={formik.values.initialTokenTier === tier.tier}
                  onSelect={() => formik.setFieldValue('initialTokenTier', tier.tier)}
                />
              ))}
            </div>

            <div className="mx-auto max-w-xs border-t border-surface-200 dark:border-surface-800 pt-6 mt-6">
              <ATMSelectField
                name="initialTokenValidityDays"
                label="Validity Period"
                options={VALIDITY_OPTIONS.map((days) => ({
                  label: `${days} Days`,
                  value: days,
                }))}
                required
              />
            </div>
          </div>
        );

      case 4: {
        const activeTier = formik.values.initialTokenTier as TokenTier;
        const activeDays = formik.values.initialTokenValidityDays;
        const activeTierDef = TIERS.find((t) => t.tier === activeTier);
        const price = TOKEN_PRICING[activeTier]?.[activeDays] ?? 0;
        const limits = DEFAULT_TOKEN_LIMITS[activeTier];

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Review Details</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Verify standalone configuration before generating activation token.
              </p>
            </div>
            <ATMCard padding="md" className="glass-card">
              <dl className="divide-y divide-surface-100 dark:divide-surface-800">
                <ReviewRow label="Merchant Type" value="Standalone" />
                <ReviewRow label="Business Nature" value={formik.values.businessNature || '--'} />
                <ReviewRow label="Business Name" value={formik.values.businessName} />
                <ReviewRow label="Contact Person" value={formik.values.contactPerson} />
                <ReviewRow label="Email" value={formik.values.email} />
                <ReviewRow label="Phone" value={formik.values.phone} />
                <ReviewRow label="Country" value={formik.values.country} />
                <ReviewRow label="Token Tier" value={activeTierDef?.label ?? activeTier} />
                <ReviewRow label="Validity Period" value={`${activeDays} days`} />
                <ReviewRow label="Max Terminals" value={String(limits.maxTerminals)} />
                <ReviewRow label="Max Products" value={String(limits.maxProducts)} />
                <ReviewRow label="Max Users" value={String(limits.maxUsers)} />
                <ReviewRow label="Purchase Total" value={`$${price.toFixed(2)}`} />
              </dl>
            </ATMCard>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const activeTier = formik.values.initialTokenTier as TokenTier;
  const activeDays = formik.values.initialTokenValidityDays;
  const activeTierDef = TIERS.find((t) => t.tier === activeTier);
  const price = TOKEN_PRICING[activeTier]?.[activeDays] ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full bg-zen-surface animate-fade-in p-6 lg:p-8">
      {/* Left Column: Form Steps */}
      <div className="lg:col-span-2 space-y-6">
        <StepProgress currentStep={step} steps={STEPS} />
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 lg:p-8 shadow-sm">
          {renderStepContent()}
        </div>
      </div>

      {/* Right Column: Live Summary (TimeForge Style) */}
      <div className="space-y-6 flex flex-col">
        <ATMCard className="glass-card">
          <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-4">Registration Summary</h3>
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Merchant Type</span>
              <ATMBadge color="primary" label="Standalone" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Business Name</span>
              <span className="font-extrabold text-gray-900 dark:text-white truncate max-w-[180px]">
                {formik.values.businessName || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Contact Person</span>
              <span className="font-extrabold text-gray-900 dark:text-white truncate max-w-[180px]">
                {formik.values.contactPerson || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Email</span>
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                {formik.values.email || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Country</span>
              <span className="font-extrabold text-gray-900 dark:text-white">
                {formik.values.country || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Token Tier</span>
              <span className="font-extrabold text-accent-600 dark:text-accent-400 uppercase">
                {activeTierDef?.label || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Validity Period</span>
              <span className="font-extrabold text-gray-900 dark:text-white">
                {activeDays ? `${activeDays} Days` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-3 text-sm font-black">
              <span className="text-gray-900 dark:text-white">Purchase Cost</span>
              <span className="text-accent-600 dark:text-accent-400">${price.toFixed(2)}</span>
            </div>
          </div>
        </ATMCard>

        <div className="space-y-3 pt-2">
          {step < 4 ? (
            <ATMButton
              variant="primary"
              size="md"
              className="w-full"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => handleNext(formik)}
              disabled={!canNext()}
            >
              Next Step
            </ATMButton>
          ) : step === 4 ? (
            <ATMButton
              variant="primary"
              size="md"
              className="w-full animate-pulse"
              icon={Rocket}
              isLoading={isLoading}
              onClick={() => formik.submitForm()}
            >
              Generate Token
            </ATMButton>
          ) : null}

          <ATMButton
            variant="outline"
            size="md"
            className="w-full"
            icon={ArrowLeft}
            onClick={handleBack}
            disabled={step === 0 || isLoading}
          >
            Back
          </ATMButton>
        </div>
      </div>
    </div>
  );
};

export default RegisterStandalonePage;
