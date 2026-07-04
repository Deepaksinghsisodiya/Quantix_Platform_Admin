import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type FormikProps } from 'formik';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Database,
  Loader2,
  Mail,
  Rocket,
  Shield,
  Store,
  User,
  AlertTriangle,
  Key,
  ShieldCheck,
  Copy,
  Download,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMInputField, ATMSelectField, ATMPhoneInputField } from '@/shared/components/form';
import { OnboardingChecklist } from '../components/OnboardingChecklist';
import { WelcomeCommunications } from '../components/WelcomeCommunications';
import { StepProgress } from '../components/StepProgress';
import { TypeCard } from '../components/TypeCard';
import { ReviewRow } from '../components/ReviewRow';
import { cn } from '@/lib/utils/cn';
import type { DbEngine, BillingFrequency, PreferredPaymentMethod } from '../types/merchant.types';
import { DUMMY_PLANS } from '@/modules/plans/types/plan.types';
import { toast } from 'sonner';

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

const DB_ENGINES: { value: DbEngine; label: string; description: string }[] = [
  { value: 'SQLite', label: 'SQLite', description: 'Lightweight, file-based. Great for single-location setups.' },
  { value: 'PostgreSQL', label: 'PostgreSQL', description: 'Enterprise-grade. Best for multi-location deployments.' },
  { value: 'MySQL', label: 'MySQL', description: 'Widely supported. Good for general-purpose workloads.' },
  { value: 'SQLServer', label: 'SQL Server', description: 'Microsoft ecosystem. Ideal for Windows-centric environments.' },
];

// ─── Codes for Configuration lists ───
const ALL_FEATURES = [
  { key: 'INV', label: 'Inventory Management' },
  { key: 'FIN', label: 'Finance / Accounting' },
  { key: 'HRM', label: 'HR & Staff Management' },
  { key: 'MKT', label: 'Marketing & Loyalty' },
  { key: 'ANL', label: 'Analytics & Reports' },
  { key: 'WTM', label: 'Workforce / Table-Turn' },
];

const ALL_PAYMENTS = [
  { key: 'CSH', label: 'Cash' },
  { key: 'CRD', label: 'Card (POS/EDC)' },
  { key: 'EXT', label: 'UPI / QR / Online' },
  { key: 'GFT', label: 'Gift Card' },
  { key: 'STC', label: 'Store Credit' },
  { key: 'WLT', label: 'In-app Wallet' },
  { key: 'CSL', label: 'Credit Sale / Udhar' },
];

const ALL_SERVICES = [
  { key: 'DIN', label: 'Dine-In' },
  { key: 'CTR', label: 'Counter / Takeaway' },
  { key: 'PUP', label: 'Pickup' },
  { key: 'DLV', label: 'Delivery' },
  { key: 'CTG', label: 'Catering / Bulk' },
  { key: 'SNP', label: 'QR / Self-Order' },
  { key: 'RSO', label: 'Reservation Order' },
  { key: 'WOR', label: 'Web Ordering' },
  { key: 'WRV', label: 'Waitlist / Reservation' },
];

const ALL_LIMITS = [
  { key: 'MBU', label: 'Business Units' },
  { key: 'MLO', label: 'Locations / Outlets' },
  { key: 'MTM', label: 'POS Terminals' },
  { key: 'MPR', label: 'Products' },
  { key: 'MPG', label: 'Product Groups' },
  { key: 'MGB', label: 'Storage (GB)' },
  { key: 'MDP', label: 'Delivery Partners' },
  { key: 'MKD', label: 'Kitchen Displays' },
  { key: 'MDS', label: 'Dine-in Sections' },
  { key: 'MIS', label: 'Integration Slots' },
  { key: 'MPW', label: 'Payment Gateways' },
  { key: 'MRS', label: 'Reservation Slots/day' },
  { key: 'MAC', label: 'Active Campaigns' },
  { key: 'MWR', label: 'Warehouses' },
  { key: 'MWE', label: 'Staff Logins' },
  { key: 'MBR', label: 'Branches' },
];

interface RegisterEnterprisePageProps {
  formik: FormikProps<any>;
  step: number;
  isLoading: boolean;
  provisionStatus: 'idle' | 'provisioning' | 'done' | 'error';
  activationStatus: 'idle' | 'activating' | 'done' | 'error';
  createdMerchantId: string | null;
  registrationCompleted: boolean;
  generatedToken: string | null;
  handleNext: (formik: FormikProps<any>) => Promise<void>;
  handleBack: () => void;
  retryActivation: () => void;
}

// ─── Simple row toggle grid ───
const ToggleGrid: React.FC<{
  label: string;
  count: string;
  items: { key: string; label: string }[];
  field: string;
  formik: any;
}> = ({ label, count, items, field, formik }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between px-1">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <span className="text-[10px] text-gray-400">{count}</span>
    </div>
    <div className="grid grid-cols-2 gap-x-4">
      {items.map(({ key, label: name }) => {
        const isOn = !!formik.values[field]?.[key];
        return (
          <div
            key={key}
            className="flex items-center justify-between py-1.5 px-1 border-b border-gray-100 dark:border-gray-800/40"
          >
            <span className={cn('text-xs', isOn ? 'text-gray-955 dark:text-white font-medium' : 'text-gray-400')}>
              {name}
            </span>
            <ATMSwitch
              name={`${field}.${key}`}
              checked={isOn}
              onChange={(c) => formik.setFieldValue(`${field}.${key}`, c)}
              size="sm"
            />
          </div>
        );
      })}
    </div>
  </div>
);

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: any;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col rounded-3xl border-2 p-6 text-left transition-all duration-300 w-full outline-none',
        selected
          ? 'border-slate-950 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 shadow-sm'
          : 'border-slate-200/60 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/10 dark:hover:border-slate-650',
      )}
    >
      {selected && (
        <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-slate-900 dark:text-white" />
      )}
      <div className={cn(
        'inline-flex items-center gap-2 rounded-xl px-2.5 py-0.8 text-[10px] font-black uppercase tracking-wider',
        'bg-purple-100/60 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
      )}>
        {plan.name}
      </div>
      
      <div className="mt-3.5 flex items-baseline">
        <span className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          ${plan.monthlyPrice}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-1">/mo</span>
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800/40 pt-3.5 w-full">
        {plan.features?.map((f: any, idx: number) => (
          <p key={idx} className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-2 font-semibold leading-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            {f.text}
          </p>
        ))}
      </div>
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

import { Clock } from 'lucide-react';
import { ActivationStep } from '../components/ActivationStep';


export const RegisterEnterprisePage: React.FC<RegisterEnterprisePageProps> = ({
  formik,
  step,
  isLoading,
  provisionStatus,
  activationStatus,
  createdMerchantId,
  registrationCompleted,
  generatedToken,
  handleNext,
  handleBack,
  retryActivation,
}) => {
  const navigate = useNavigate();
  const enterprisePlans = DUMMY_PLANS.filter((p) => p.planType === 'Enterprise cloud');
  const activePlan = DUMMY_PLANS.find((p) => p.id === formik.values.selectedPlan) || enterprisePlans[0];

  // Auto-fill configuration when selected plan changes
  useEffect(() => {
    if (activePlan) {
      formik.setFieldValue('planFeatures', activePlan.planFeatures);
      formik.setFieldValue('planPayments', activePlan.planPayments);
      formik.setFieldValue('planServices', activePlan.planServices);
      formik.setFieldValue('planLimits', activePlan.planLimits);
    }
  }, [formik.values.selectedPlan]);

  const featureOn = ALL_FEATURES.filter((f) => !!formik.values.planFeatures?.[f.key]).length;
  const payOn = ALL_PAYMENTS.filter((p) => !!formik.values.planPayments?.[p.key]).length;
  const svcOn = ALL_SERVICES.filter((s) => !!formik.values.planServices?.[s.key]).length;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    toast.success('Activation token copied!');
    setTimeout(() => setCopied(false), 2000);
  };

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

    const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const fVal = (key: string) => `${key}=${formik.values.planFeatures?.[key] ? 'ON ' : 'OFF'}`;
    const pVal = (key: string) => `${key}=${formik.values.planPayments?.[key] ? 'ON ' : 'OFF'}`;
    const sVal = (key: string) => `${key}=${formik.values.planServices?.[key] ? 'ON ' : 'OFF'}`;
    const lVal = (key: string) => `${key}=${(formik.values.planLimits?.[key] ?? 0).toString().padEnd(8)}`;

    const tokenBundlePrintout = `===============================================================================
  Quantix POS — V3.5 Test Token Bundle
===============================================================================

  Generated: ${timestampStr}
  Merchant : ${createdMerchantId}
  License  : ${generatedToken ?? 'PENDING_ACTIVATION'}

-------------------------------------------------------------------------------
  Shared payload values
-------------------------------------------------------------------------------

  Plan      : ${activePlan?.name || 'Custom'}
  Flavour   : Restaurant (RES)
  Grace     : W=3 / R=1 / S=2 / L=3 (defaults)

  Features  (6 Advance):
    ${fVal('INV')}, ${fVal('FIN')}, ${fVal('HRM')}, ${fVal('MKT')}, ${fVal('ANL')}, ${fVal('WTM')}

  Payments  (7):
    ${pVal('CSH')}, ${pVal('CRD')}, ${pVal('EXT')}   |   ${pVal('GFT')}, ${pVal('STC')}, ${pVal('WLT')}, ${pVal('CSL')}

  Services  (9):
    ${sVal('DIN')}, ${sVal('CTR')}   |   ${sVal('PUP')}, ${sVal('DLV')}, ${sVal('CTG')}, ${sVal('SNP')},
                          ${sVal('RSO')}, ${sVal('WOR')}, ${sVal('WRV')}

  Limits (16):
    MBU=${lVal('MBU')}MLO=${lVal('MLO')}MTM=${lVal('MTM')}MPR=${lVal('MPR')}MPG=${lVal('MPG')}MGB=${lVal('MGB')}
    MDP=${lVal('MDP')}MKD=${lVal('MKD')}MDS=${lVal('MDS')}MIS=${lVal('MIS')}MPW=${lVal('MPW')}MRS=${lVal('MRS')}
    MAC=${lVal('MAC')}MWR=${lVal('MWR')}MWE=${lVal('MWE')}MBR=${lVal('MBR')}  (0 = unlimited)

===============================================================================`;

    return (
      <div className="mx-auto max-w-3xl space-y-8 py-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20">
            <Rocket className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-550">
            Merchant Registered Successfully
          </h2>
          <p className="mt-2 text-surface-500 dark:text-surface-400 text-sm font-medium">
            The Enterprise merchant is now <ATMBadge color="success" size="sm" label="Active" />.
          </p>
        </div>

        {generatedToken && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-6 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise Cloud Token</span>
              <ATMButton variant="primary" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </ATMButton>
            </div>
            <input
              readOnly
              value={generatedToken}
              className="w-full font-mono text-xs p-3 bg-slate-950 text-emerald-400 rounded-xl border border-slate-800"
            />
            <pre className="w-full font-mono text-[9px] p-3 bg-slate-955 text-slate-350 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
              {tokenBundlePrintout}
            </pre>
          </div>
        )}

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
            planName={activePlan?.name ?? 'Enterprise Basic'}
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
              </p>
            </div>
            <div className="space-y-2">
              <ATMInputField
                label="Business Nature"
                name="businessNature"
                placeholder="e.g. Restaurant, Pharmacy + Cafe, Auto-parts retail..."
                maxLength={200}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 w-full">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Business Details</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Enter primary business information and billing preferences.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
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
              <ATMInputField
                label="Address Line 1"
                name="addressLine1"
                placeholder="Building, Street, Suite..."
              />
              <ATMInputField
                label="City"
                name="city"
                placeholder="City name"
              />
              <ATMInputField
                label="State / Province"
                name="state"
                placeholder="State or Province"
              />
              <ATMInputField
                label="Postal / Zip Code"
                name="postalCode"
                placeholder="Postal code"
              />
              <ATMSelectField
                name="dbEngine"
                label="Database Engine"
                options={DB_ENGINES.map((e) => ({ label: e.label, value: e.value }))}
                required
              />
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
            <div className="grid gap-4 sm:grid-cols-3 w-full font-medium">
              {enterprisePlans.map((plan) => (
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
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Configuration</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Configure feature flags, operational limits, and database engine.
              </p>
            </div>

            <div className="space-y-4">
              <ToggleGrid
                label="Modules"
                count={`${featureOn}/${ALL_FEATURES.length} ON`}
                items={ALL_FEATURES}
                field="planFeatures"
                formik={formik}
              />
              <ToggleGrid
                label="Payment Methods"
                count={`${payOn}/${ALL_PAYMENTS.length} ON`}
                items={ALL_PAYMENTS}
                field="planPayments"
                formik={formik}
              />
              <ToggleGrid
                label="Order Types"
                count={`${svcOn}/${ALL_SERVICES.length} ON`}
                items={ALL_SERVICES}
                field="planServices"
                formik={formik}
              />

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Limits</p>
                  <span className="text-[10px] text-gray-400">0 = unlimited</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ALL_LIMITS.map(({ key, label: name }) => (
                    <div key={key} className="flex items-center justify-between gap-2 py-1 px-1">
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{name}</span>
                      <input
                        type="number"
                        min={0}
                        value={formik.values.planLimits?.[key] ?? 0}
                        onChange={(e) => formik.setFieldValue(`planLimits.${key}`, Number(e.target.value) || 0)}
                        className="w-16 text-right text-xs font-mono px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
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
                <ReviewRow label="Plan" value={activePlan?.name || '--'} />
                <ReviewRow label="Billing Cycle" value={formik.values.billingFrequency || '--'} />
                <ReviewRow label="Payment Method" value={formik.values.preferredPaymentMethod || '--'} />
                <ReviewRow label="Database Engine" value={formik.values.dbEngine} />
                <ReviewRow label="Modules Enabled" value={`${featureOn} Enabled`} />
                <ReviewRow label="Payments Enabled" value={`${payOn} Enabled`} />
                <ReviewRow label="Order Types Enabled" value={`${svcOn} Enabled`} />
              </dl>
            </ATMCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/merchants')}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Merchant Directory
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full">
        {/* Left Column: Form & Steps */}
        <div className="lg:col-span-2 space-y-6">
          <StepProgress currentStep={step} steps={STEPS} />
          <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-[32px] p-6 lg:p-9 backdrop-blur-md shadow-sm">
            {renderStepContent()}
          </div>
        </div>

        {/* Right Column: Live Summary */}
        <div className="space-y-6 flex flex-col">
          <ATMCard className="bg-[#fafafa] dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850 rounded-[28px] p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">Registration Summary</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-semibold">Merchant Type</span>
                <ATMBadge color="purple" label="Enterprise" />
              </div>
              {formik.values.businessName && (
                <div className="flex justify-between items-center py-0.5 animate-fade-in">
                  <span className="text-slate-500 dark:text-slate-450 font-semibold">Business Name</span>
                  <span className="font-extrabold text-slate-955 dark:text-white truncate max-w-[170px]">
                    {formik.values.businessName}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-semibold">Plan</span>
                <span className="font-extrabold text-slate-955 dark:text-white uppercase">
                  {activePlan?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-semibold">Billing Cycle</span>
                <span className="font-extrabold text-slate-955 dark:text-white">
                  {formik.values.billingFrequency || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 dark:text-slate-450 font-semibold">Database Engine</span>
                <span className="font-extrabold text-slate-955 dark:text-white">{formik.values.dbEngine}</span>
              </div>
            </div>
          </ATMCard>

          <div className="space-y-3 pt-2">
            {step < 5 ? (
              <ATMButton
                variant="primary"
                size="md"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm border-none py-3"
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
                className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-955 dark:hover:bg-slate-100 shadow-sm border-none py-3 animate-pulse"
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
              className="w-full border-slate-200 hover:bg-slate-50 hover:border-slate-350 hover:text-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-white py-3"
              icon={ArrowLeft}
              onClick={handleBack}
              disabled={step === 0 || isLoading}
            >
              Back
            </ATMButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterEnterprisePage;
