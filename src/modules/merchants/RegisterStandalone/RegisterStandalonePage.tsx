import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormikProps } from 'formik';
import { cn } from '@/lib/utils/cn';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { StepProgress } from '../components/StepProgress';
import { TypeCard } from '../components/TypeCard';
import {
  Store,
  Building2,
  User,
  Mail,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  AlertTriangle,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { ActivationStep } from '../components/ActivationStep';
import { DUMMY_PLANS } from '@/modules/plans/types/plan.types';

const STEPS = [
  'Operating Model',
  'Business Nature',
  'Business Details',
  'Plan Selection',
  'Configuration',
  'Review & Register',
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

const VALIDITY_OPTIONS = [30, 60, 90, 180, 365] as const;

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
            <span className={cn('text-xs', isOn ? 'text-gray-950 dark:text-white font-medium' : 'text-gray-400')}>
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
          ? 'border-slate-955 bg-slate-50 dark:border-slate-100 dark:bg-slate-900/60 shadow-sm'
          : 'border-slate-200/60 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/10 dark:hover:border-slate-650',
      )}
    >
      {selected && (
        <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-slate-950 dark:text-white" />
      )}
      <div className={cn(
        'inline-flex items-center gap-2 rounded-xl px-2.5 py-0.8 text-[10px] font-black uppercase tracking-wider',
        'bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-xs font-semibold">
      <dt className="text-surface-500 dark:text-surface-400">{label}</dt>
      <dd className="font-extrabold text-surface-900 dark:text-surface-100">{value}</dd>
    </div>
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
  const standalonePlans = DUMMY_PLANS.filter((p) => p.planType.startsWith('Standalone'));
  const activePlan = DUMMY_PLANS.find((p) => p.id === formik.values.selectedPlan) || standalonePlans[0];

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

  // Render Success / Activation Step
  if (registrationCompleted && generatedToken) {
    const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const fVal = (key: string) => `${key}=${formik.values.planFeatures?.[key] ? 'ON ' : 'OFF'}`;
    const pVal = (key: string) => `${key}=${formik.values.planPayments?.[key] ? 'ON ' : 'OFF'}`;
    const sVal = (key: string) => `${key}=${formik.values.planServices?.[key] ? 'ON ' : 'OFF'}`;
    const lVal = (key: string) => `${key}=${(formik.values.planLimits?.[key] ?? 0).toString().padEnd(8)}`;

    const tokenBundlePrintout = `===============================================================================
  Quantix POS — V3.5 Test Token Bundle
===============================================================================

  Generated: ${timestampStr}
  Merchant : ${generatedToken.merchantId}
  License  : ${generatedToken.tokenString}

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
      <div className="w-full space-y-6 animate-fade-in">
        <div className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Standalone Token Generated</h2>
                <p className="text-xs text-slate-400 font-mono">Merchant ID: {generatedToken.merchantId}</p>
              </div>
            </div>
            <ATMBadge color="success" label="Active" size="sm" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              License Key
            </label>
            <input
              readOnly
              value={generatedToken.tokenString}
              className="w-full font-mono text-sm p-4 bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none select-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Payload Bundle Printout
            </label>
            <pre className="w-full font-mono text-[10px] p-4 bg-slate-955 text-slate-350 rounded-2xl border border-slate-800 overflow-x-auto leading-relaxed">
              {tokenBundlePrintout}
            </pre>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <ATMButton variant="primary" icon={copied ? Check : Copy} onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy Key'}
              </ATMButton>
              <ATMButton variant="outline" icon={Download} onClick={handleDownload} className="text-white border-slate-700 hover:bg-slate-800">
                Download .txt
              </ATMButton>
              <ATMButton variant="outline" icon={Mail} onClick={() => handleEmail(formik.values.email)} className="text-white border-slate-700 hover:bg-slate-800">
                Email Key
              </ATMButton>
            </div>
            <ATMButton variant="ghost" className="text-slate-400 hover:text-white" onClick={() => navigate('/merchants')}>
              Back to Directory
            </ATMButton>
          </div>
        </div>

        <ActivationStep
          status={activationStatus}
          variant="standalone"
          planName={activePlan?.name || 'Standalone Basic'}
          billingFrequency={`${formik.values.initialTokenValidityDays} Days`}
        />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-550">Select Merchant Type</h2>
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
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-500">Business Nature</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Free-text descriptor — no taxonomy. Sales / reporting metadata only.
              </p>
            </div>
            <div className="space-y-2">
              <ATMTextField
                label="Business Nature"
                name="businessNature"
                placeholder="e.g. Restaurant, Pharmacy, Convenience store + cafe..."
                value={formik.values.businessNature}
                onChange={formik.handleChange}
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
                Enter primary business contact details.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
              <ATMTextField
                label="Business Name"
                name="businessName"
                placeholder="e.g., Corner POS Outlet"
                value={formik.values.businessName}
                onChange={formik.handleChange}
                error={formik.touched.businessName ? (formik.errors.businessName as string) : undefined}
                required
              />
              <ATMTextField
                label="Contact Person"
                name="contactPerson"
                placeholder="Full name"
                leftIcon={<User className="h-4 w-4 text-slate-400" />}
                value={formik.values.contactPerson}
                onChange={formik.handleChange}
                error={formik.touched.contactPerson ? (formik.errors.contactPerson as string) : undefined}
                required
              />
              <ATMTextField
                label="Email Address"
                name="email"
                type="email"
                placeholder="owner@business.com"
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email ? (formik.errors.email as string) : undefined}
                required
              />
              <ATMTextField
                label="Phone Number"
                name="phone"
                placeholder="+1 555-0199"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone ? (formik.errors.phone as string) : undefined}
                required
              />
              <ATMSelectField
                name="country"
                label="Country"
                options={COUNTRY_OPTIONS}
                value={formik.values.country}
                onChange={(val) => formik.setFieldValue('country', val)}
                required
              />
              <ATMTextField
                label="Address Line 1"
                name="addressLine1"
                placeholder="Building, Street, Suite..."
                value={formik.values.addressLine1}
                onChange={formik.handleChange}
              />
              <ATMTextField
                label="City"
                name="city"
                placeholder="City name"
                value={formik.values.city}
                onChange={formik.handleChange}
              />
              <ATMTextField
                label="State / Province"
                name="state"
                placeholder="State or Province"
                value={formik.values.state}
                onChange={formik.handleChange}
              />
              <ATMTextField
                label="Postal / Zip Code"
                name="postalCode"
                placeholder="Postal code"
                value={formik.values.postalCode}
                onChange={formik.handleChange}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-500">Plan Selection</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Select initial subscription plan and validity period.
              </p>
            </div>

            {/* Token Plan Selection */}
            <div className="grid gap-4 sm:grid-cols-3 w-full font-medium">
              {standalonePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={formik.values.selectedPlan === plan.id}
                  onSelect={() => formik.setFieldValue('selectedPlan', plan.id)}
                />
              ))}
            </div>

            <div className="mx-auto max-w-xs pt-4">
              <ATMSelectField
                name="initialTokenValidityDays"
                label="Validity Period"
                options={VALIDITY_OPTIONS.map((days) => ({
                  label: `${days} Days`,
                  value: days,
                }))}
                value={formik.values.initialTokenValidityDays}
                onChange={(val) => formik.setFieldValue('initialTokenValidityDays', val)}
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Token Access Configuration</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 font-medium">
                Tweak modules, payments, services, and limits for this standalone merchant.
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
                Verify standalone merchant configuration before generating token.
              </p>
            </div>
            <ATMCard padding="md" className="glass-card">
              <dl className="divide-y divide-surface-100 dark:divide-surface-800">
                <ReviewRow label="Merchant Type" value="Standalone POS" />
                <ReviewRow label="Business Nature" value={formik.values.businessNature || '—'} />
                <ReviewRow label="Business Name" value={formik.values.businessName} />
                <ReviewRow label="Contact Person" value={formik.values.contactPerson} />
                <ReviewRow label="Email" value={formik.values.email} />
                <ReviewRow label="Country" value={formik.values.country} />
                <ReviewRow label="Token Plan" value={activePlan?.name || 'Custom'} />
                <ReviewRow label="Validity Period" value={`${formik.values.initialTokenValidityDays} days`} />
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
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Merchant Directory
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full">
        <div className="lg:col-span-2 space-y-6">
          <StepProgress currentStep={step} steps={STEPS} />
          <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-[32px] p-6 lg:p-9 backdrop-blur-md shadow-sm">
            {renderStepContent()}

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
              <ATMButton
                variant="outline"
                type="button"
                onClick={handleBack}
                disabled={step === 0 || isLoading}
                icon={ArrowLeft}
                className="border-slate-200 hover:bg-slate-50 hover:border-slate-350 hover:text-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-white py-3 px-5"
              >
                Back
              </ATMButton>

              {step < 5 ? (
                <ATMButton
                  type="button"
                  variant="primary"
                  onClick={() => handleNext(formik)}
                  icon={ArrowRight}
                  iconPosition="right"
                  className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm border-none py-3 px-5"
                >
                  Continue
                </ATMButton>
              ) : (
                <ATMButton
                  type="button"
                  variant="primary"
                  onClick={() => formik.handleSubmit()}
                  isLoading={isLoading}
                  icon={Key}
                  iconPosition="right"
                  className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm border-none py-3 px-5"
                >
                  Register & Issue Token
                </ATMButton>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Summary */}
        <div className="space-y-6 flex flex-col">
          <ATMCard className="bg-[#fafafa] dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850 rounded-[28px] p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">Registration Summary</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 dark:text-slate-455 font-semibold">Merchant Type</span>
                <ATMBadge color="success" label="Standalone POS" />
              </div>
              {formik.values.businessName && (
                <div className="flex justify-between items-center py-0.5 animate-fade-in">
                  <span className="text-slate-500 dark:text-slate-455 font-semibold">Business Name</span>
                  <span className="font-extrabold text-slate-955 dark:text-white truncate max-w-[170px]">
                    {formik.values.businessName}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 dark:text-slate-455 font-semibold">Token Plan</span>
                <span className="font-extrabold text-slate-955 dark:text-white">{activePlan?.name || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 dark:text-slate-455 font-semibold">Validity Period</span>
                <span className="font-extrabold text-slate-955 dark:text-white">
                  {formik.values.initialTokenValidityDays} Days
                </span>
              </div>
            </div>
          </ATMCard>
        </div>
      </div>
    </div>
  );
};
