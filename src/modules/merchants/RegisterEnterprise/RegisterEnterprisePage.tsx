import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type FormikProps } from 'formik';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Database,
  Loader2,
  Mail,
  Phone,
  Rocket,
  Shield,
  Store,
  User,
  Zap,
  AlertTriangle,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMInputField, ATMSelectField, ATMSwitchField, ATMPhoneInputField } from '@/shared/components/form';
import { OnboardingChecklist } from '../components/OnboardingChecklist';
import { WelcomeCommunications } from '../components/WelcomeCommunications';
import { StepProgress } from '../components/StepProgress';
import { TypeCard } from '../components/TypeCard';
import { ReviewRow } from '../components/ReviewRow';
import { ActivationStep } from '../components/ActivationStep';
import { cn } from '@/lib/utils/cn';
import type { DbEngine, BillingFrequency, PreferredPaymentMethod } from '../types/merchant.types';

export const STEPS = [
  'Merchant Type',
  'Business Type',
  'Business Details',
  'Plan Selection',
  'Configuration',
  'Review & Confirm',
  'Database Provisioning',
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

const BILLING_FREQUENCY_OPTIONS = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly (save 5%)', value: 'Quarterly' },
  { label: 'Annual (save 15%)', value: 'Annual' },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: 'Credit Card', value: 'CreditCard' },
  { label: 'Bank Transfer', value: 'BankTransfer' },
  { label: 'Invoice', value: 'Invoice' },
];

interface PlanDef {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: '/mo',
    features: ['1 Location', '2 Terminals', 'Basic Reports', 'Email Support'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 129,
    period: '/mo',
    features: ['3 Locations', '10 Terminals', 'Advanced Reports', 'Priority Support', 'API Access'],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 299,
    period: '/mo',
    features: ['10 Locations', '50 Terminals', 'Custom Reports', 'Dedicated Support', 'Full API', 'Webhooks'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    period: 'Custom',
    features: ['Unlimited Locations', 'Unlimited Terminals', 'White Label', '24/7 Support', 'SLA', 'Custom Integrations'],
  },
];

const DB_ENGINES: { value: DbEngine; label: string; description: string }[] = [
  { value: 'SQLite', label: 'SQLite', description: 'Lightweight, file-based. Great for single-location setups.' },
  { value: 'PostgreSQL', label: 'PostgreSQL', description: 'Enterprise-grade. Best for multi-location deployments.' },
  { value: 'MySQL', label: 'MySQL', description: 'Widely supported. Good for general-purpose workloads.' },
  { value: 'SQLServer', label: 'SQL Server', description: 'Microsoft ecosystem. Ideal for Windows-centric environments.' },
];

const FEATURE_FLAG_LABELS: Record<string, string> = {
  multiLocation: 'Multi-Location Support',
  apiAccess: 'API Access',
  webhooks: 'Webhook Notifications',
  whiteLabel: 'White Label Branding',
  customDomain: 'Custom Domain',
};

const LIMIT_LABELS: Record<string, string> = {
  maxLocations: 'Max Locations',
  maxTerminals: 'Max Terminals',
  maxProducts: 'Max Products',
  maxUsers: 'Max Users',
  apiRateLimit: 'API Rate Limit (req/min)',
};

interface RegisterEnterprisePageProps {
  formik: FormikProps<any>;
  step: number;
  isLoading: boolean;
  provisionStatus: 'idle' | 'provisioning' | 'done' | 'error';
  activationStatus: 'idle' | 'activating' | 'done' | 'error';
  createdMerchantId: string | null;
  registrationCompleted: boolean;
  handleNext: (formik: FormikProps<any>) => Promise<void>;
  handleBack: () => void;
  retryActivation: () => void;
}

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PlanDef;
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
      {plan.popular && (
        <span className="absolute -top-2.5 left-4">
          <ATMBadge color="primary" size="sm" label="Most Popular" />
        </span>
      )}
      {selected && (
        <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-accent-600 dark:text-accent-400" />
      )}
      <h3 className="text-lg font-extrabold text-surface-900 dark:text-surface-100">{plan.name}</h3>
      <div className="mt-2">
        {plan.price > 0 ? (
          <span className="text-3xl font-extrabold tabular-nums text-surface-900 dark:text-surface-100">
            ${plan.price}
            <span className="text-sm font-normal text-surface-500 dark:text-surface-400">{plan.period}</span>
          </span>
        ) : (
          <span className="text-xl font-extrabold text-surface-900 dark:text-surface-100">{plan.period}</span>
        )}
      </div>
      <ul className="mt-4 space-y-2 w-full">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs font-semibold text-surface-600 dark:text-surface-400">
            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

function ProvisioningStep({
  dbEngine,
  status,
}: {
  dbEngine: DbEngine;
  status: 'idle' | 'provisioning' | 'done' | 'error';
}) {
  const provisionPhases = [
    { key: 'requested', label: 'Requested — Queued for provisioning', icon: <Clock className="h-4 w-4" /> },
    { key: 'provisioning', label: 'Provisioning — Creating blank database', icon: <Database className="h-4 w-4" /> },
    { key: 'ready', label: 'Ready — Connection string generated + encrypted', icon: <Shield className="h-4 w-4" /> },
  ];

  const activeIdx = status === 'idle' ? -1 : status === 'provisioning' ? 1 : provisionPhases.length;

  const connectionString = status === 'done'
    ? `Host=db-${dbEngine.toLowerCase()}-merchant-xxx.quantix.cloud;Port=5432;Database=quantix_merchant_xxx;Username=svc_merchant;Password=••••••••;SslMode=Require`
    : null;

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 dark:bg-accent-950/20">
          <Database className="h-8 w-8 text-accent-600 dark:text-accent-450" />
        </div>
        <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">
          Database Provisioning
        </h3>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Engine: <span className="font-semibold">{dbEngine}</span>
        </p>
      </div>

      <div className="space-y-3">
        {provisionPhases.map((phase, idx) => {
          const isDone = idx < activeIdx;
          const isActive = idx === activeIdx && status === 'provisioning';
          return (
            <div
              key={phase.key}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300',
                isDone
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/10'
                  : isActive
                    ? 'border-accent-200 bg-accent-50/50 dark:border-accent-900/30 dark:bg-accent-950/10'
                    : 'border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900/30',
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent-600 dark:text-accent-400" />
              ) : (
                <span className="text-surface-400 dark:text-surface-600">{phase.icon}</span>
              )}
              <span className={cn(
                'text-sm font-semibold',
                isDone ? 'text-emerald-700 dark:text-emerald-450' : isActive ? 'text-accent-700 dark:text-accent-450' : 'text-surface-500 dark:text-surface-400',
              )}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === 'done' && (
        <>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-450">
            <CheckCircle2 className="h-5 w-5" />
            Provisioning complete — Database ready
          </div>

          {connectionString && (
            <div className="rounded-xl border border-surface-200 bg-surface-50 p-3.5 dark:border-surface-800 dark:bg-surface-900">
              <p className="mb-1.5 text-xs font-bold text-surface-400 dark:text-surface-500">
                Connection String (stored encrypted)
              </p>
              <code className="block break-all rounded-lg bg-surface-200/70 px-2.5 py-1.5 font-mono text-[10px] text-surface-700 dark:bg-surface-800 dark:text-surface-400">
                {connectionString}
              </code>
            </div>
          )}
        </>
      )}

      {status === 'error' && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          Provisioning failed. Retry from review step.
        </div>
      )}
    </div>
  );
}

export const RegisterEnterprisePage: React.FC<RegisterEnterprisePageProps> = ({
  formik,
  step,
  isLoading,
  provisionStatus,
  activationStatus,
  createdMerchantId,
  registrationCompleted,
  handleNext,
  handleBack,
  retryActivation,
}) => {
  const navigate = useNavigate();

  // Render Success / Provisioning states (Full screen)
  if (registrationCompleted && createdMerchantId) {
    const initialChecklist = {
      accountVerified: true,
      profileCompleted: false,
      firstLocationAdded: false,
      firstTerminalActivated: false,
      firstTransactionCompleted: false,
      paymentMethodConfigured: false,
      completedAt: null,
    };

    return (
      <div className="mx-auto max-w-2xl space-y-8 py-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20">
            <Rocket className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-550">
            Merchant Registered Successfully
          </h2>
          <p className="mt-2 text-surface-500 dark:text-surface-400 text-sm font-medium">
            The Enterprise merchant is now <ATMBadge color="success" size="sm" label="Active" />. Complete the onboarding checklist to unlock all features.
          </p>
        </div>

        <OnboardingChecklist merchantType="Enterprise" checklist={initialChecklist} />

        <WelcomeCommunications
          merchantType="Enterprise"
          merchantId={createdMerchantId}
          email={formik.values.email}
          contactPerson={formik.values.contactPerson}
        />

        <div className="flex justify-center gap-3">
          <ATMButton variant="outline" onClick={() => navigate('/merchants')}>
            Back to Directory
          </ATMButton>
          <ATMButton variant="primary" onClick={() => navigate(`/merchants/${createdMerchantId}`)}>
            View Merchant
          </ATMButton>
        </div>
      </div>
    );
  }

  if (step >= 6) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-12 animate-fade-in">
        {step === 6 ? (
          <ProvisioningStep dbEngine={formik.values.dbEngine} status={provisionStatus} />
        ) : (
          <ActivationStep
            status={activationStatus}
            variant="enterprise"
            planName={PLANS.find((p) => p.id === formik.values.selectedPlan)?.name ?? 'Professional'}
            billingFrequency={formik.values.billingFrequency || 'Monthly'}
          />
        )}
      </div>
    );
  }

  const canNext = () => {
    switch (step) {
      case 0: return true;
      case 1: return true;
      case 2: return true;
      case 3: return formik.values.selectedPlan !== null;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Select Merchant Type</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Choose the operating model for this merchant.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 w-full">
              <TypeCard
                selected
                onSelect={() => {}}
                icon={<Building2 className="h-7 w-7" />}
                title="Enterprise"
                description="Cloud-connected SaaS model with subscription billing and real-time sync."
              />
              <TypeCard
                selected={false}
                onSelect={() => navigate('/merchants/register/standalone')}
                icon={<Store className="h-7 w-7" />}
                title="Standalone"
                description="Token-based offline model with periodic activation."
              />
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 px-4 py-3 text-xs font-semibold text-amber-800 dark:text-amber-300">
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
                A short free-text descriptor of what this merchant does.
                No taxonomy — write whatever fits ("Restaurant", "Pharmacy", etc.).
              </p>
            </div>
            <div className="space-y-2">
              <ATMInputField
                label="Business Nature"
                name="businessNature"
                placeholder="e.g. Restaurant, Pharmacy + Cafe, Auto-parts retail..."
                maxLength={200}
              />
              <p className="text-xs text-surface-400 font-medium px-1">Optional — leave blank to record nothing.</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Business Details</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Enter primary business information and billing preferences.
              </p>
            </div>
            <div className="space-y-4">
              <ATMInputField
                label="Business Name"
                name="businessName"
                placeholder="e.g., Acme Restaurants LLC"
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
                placeholder="admin@business.com"
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

            <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
              <h3 className="mb-3 text-sm font-bold text-surface-900 dark:text-surface-100">
                Billing Preferences
              </h3>
              <div className="space-y-4">
                <ATMSelectField
                  name="billingFrequency"
                  label="Billing Cycle"
                  options={BILLING_FREQUENCY_OPTIONS}
                  required
                />
                <ATMSelectField
                  name="preferredPaymentMethod"
                  label="Preferred Payment Method"
                  options={PAYMENT_METHOD_OPTIONS}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Select a Plan</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Choose the subscription plan that best fits the merchant's needs.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 w-full">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={formik.values.selectedPlan === plan.id}
                  onSelect={() => formik.setFieldValue('selectedPlan', plan.id)}
                />
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Configuration</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Configure feature flags, operational limits, and database engine.
              </p>
            </div>
            <ATMCard title="Feature Flags" padding="md" className="glass-card">
              <div className="space-y-3 font-medium">
                {Object.entries(formik.values.featureFlags).map(([key]) => (
                  <ATMSwitchField
                    key={key}
                    name={`featureFlags.${key}`}
                    label={FEATURE_FLAG_LABELS[key] ?? key}
                  />
                ))}
              </div>
            </ATMCard>

            <ATMCard title="Operational Limits" padding="md" className="glass-card">
              <p className="mb-4 text-xs font-semibold text-surface-500 dark:text-surface-400">
                Set limits for this merchant. These are fetched by Cloud API on first connect.
              </p>
              <div className="space-y-4">
                {Object.entries(formik.values.limits).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">{LIMIT_LABELS[key] ?? key}</label>
                    <input
                      type="number"
                      name={`limits.${key}`}
                      value={value as number}
                      onChange={formik.handleChange}
                      min={0}
                      className="w-28 rounded-xl border border-surface-200 bg-zen-surface px-4 py-2.5 text-sm text-right font-bold tabular-nums dark:border-surface-800 dark:text-surface-100 focus:outline-none focus:ring-4 focus:ring-accent-600/5 focus:border-accent-600 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </ATMCard>

            <ATMCard title="Database Engine" padding="md" className="glass-card">
              <div className="grid gap-3 sm:grid-cols-2 w-full mt-2">
                {DB_ENGINES.map((eng) => (
                  <button
                    key={eng.value}
                    type="button"
                    onClick={() => formik.setFieldValue('dbEngine', eng.value)}
                    className={cn(
                      'flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all duration-350 w-full',
                      'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/10',
                      formik.values.dbEngine === eng.value
                        ? 'border-accent-600 bg-accent-50/50 dark:border-accent-500 dark:bg-accent-950/20'
                        : 'border-surface-200 hover:border-accent-200 dark:border-surface-800 dark:hover:border-accent-800 bg-zen-surface',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-surface-600 dark:text-surface-400" />
                      <span className="font-bold text-surface-900 dark:text-surface-100">{eng.label}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-surface-500 dark:text-surface-400">{eng.description}</p>
                  </button>
                ))}
              </div>
            </ATMCard>
          </div>
        );

      case 5: {
        const plan = PLANS.find((p) => p.id === formik.values.selectedPlan);
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Review Details</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Please review the merchant details before submission.
              </p>
            </div>
            <ATMCard padding="md" className="glass-card">
              <dl className="divide-y divide-surface-100 dark:divide-surface-800">
                <ReviewRow label="Merchant Type" value="Enterprise" />
                <ReviewRow label="Business Nature" value={formik.values.businessNature || '--'} />
                <ReviewRow label="Business Name" value={formik.values.businessName} />
                <ReviewRow label="Contact Person" value={formik.values.contactPerson} />
                <ReviewRow label="Email" value={formik.values.email} />
                <ReviewRow label="Phone" value={formik.values.phone} />
                <ReviewRow label="Country" value={formik.values.country} />
                <ReviewRow label="Plan" value={plan?.name ?? formik.values.selectedPlan ?? '--'} />
                <ReviewRow label="Billing Cycle" value={formik.values.billingFrequency || '--'} />
                <ReviewRow label="Payment Method" value={formik.values.preferredPaymentMethod || '--'} />
                <ReviewRow label="Database Engine" value={formik.values.dbEngine} />
                <ReviewRow
                  label="Features"
                  value={
                    Object.entries(formik.values.featureFlags)
                      .filter(([, v]) => v)
                      .map(([k]) => k)
                      .join(', ') || 'None'
                  }
                />
              </dl>
            </ATMCard>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const planSelected = PLANS.find((p) => p.id === formik.values.selectedPlan);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full bg-zen-surface animate-fade-in p-6 lg:p-8">
      {/* Left Column: Form & Steps */}
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
              <ATMBadge color="purple" label="Enterprise" />
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
              <span className="text-gray-500 dark:text-gray-400 font-medium">Plan</span>
              <span className="font-extrabold text-accent-600 dark:text-accent-400 uppercase">
                {planSelected?.name || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Billing Cycle</span>
              <span className="font-extrabold text-gray-900 dark:text-white">
                {formik.values.billingFrequency || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Database Engine</span>
              <span className="font-extrabold text-accent-600 dark:text-accent-400">{formik.values.dbEngine}</span>
            </div>
          </div>
        </ATMCard>

        <ATMCard className="glass-card">
          <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-4">Database Limits</h3>
          <div className="space-y-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <div className="flex justify-between items-center">
              <span>Max Locations</span>
              <span className="text-gray-900 dark:text-white font-extrabold">{formik.values.limits.maxLocations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Max Terminals</span>
              <span className="text-gray-900 dark:text-white font-extrabold">{formik.values.limits.maxTerminals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Max Products</span>
              <span className="text-gray-900 dark:text-white font-extrabold">{formik.values.limits.maxProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Max Users</span>
              <span className="text-gray-900 dark:text-white font-extrabold">{formik.values.limits.maxUsers}</span>
            </div>
          </div>
        </ATMCard>

        <div className="space-y-3 pt-2">
          {step < 5 ? (
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
          ) : step === 5 ? (
            <ATMButton
              variant="primary"
              size="md"
              className="w-full animate-pulse"
              icon={Rocket}
              isLoading={isLoading}
              onClick={() => formik.submitForm()}
            >
              Register Merchant
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

export default RegisterEnterprisePage;
