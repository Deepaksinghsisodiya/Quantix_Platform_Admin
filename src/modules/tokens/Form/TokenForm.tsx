import React, { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { cn } from '@/lib/utils/cn';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { TokenTemplateSelector, TIER_TEMPLATES } from './TokenTemplateSelector';
import type { TierTemplate } from './TokenTemplateSelector';
import { GRACE_PHASES } from '@/lib/utils/constants';
import { useMerchants } from '@/lib/hooks/useMerchants';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { TokenTier, TokenGenerateRequest } from '@/lib/types';
import { CreditCard, Landmark, Wallet, Utensils, ShoppingBag, Store } from 'lucide-react';

export type PaymentMethod = 'online' | 'manual' | 'prepaid';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string; icon: React.ComponentType<any> }[] = [
  { id: 'online', label: 'Online Payment', description: 'Merchant pays via portal or emailed payment link', icon: CreditCard },
  { id: 'manual', label: 'Manual Payment', description: 'Bank transfer or cash — recorded by admin', icon: Landmark },
  { id: 'prepaid', label: 'Pre-paid', description: 'Token included in existing Enterprise deal', icon: Wallet },
];

const BUSINESS_TYPES = [
  { id: 'Restaurant', label: 'Restaurant', description: 'POS features for dining, tables, and kitchen management', icon: Utensils },
  { id: 'Retail', label: 'Retail', description: 'POS features for inventory, barcoding, and retail sales', icon: ShoppingBag },
  { id: 'Both', label: 'Restaurant + Retail', description: 'All-in-one features for hybrid retail-dining businesses', icon: Store },
];

const tokenFormSchema = yup.object().shape({
  merchantId: yup.string().required('Merchant is required'),
  businessNature: yup.mixed().oneOf(['Restaurant', 'Retail', 'Both'] as const).required('Please select a business type'),
  tier: yup.mixed().oneOf(['Basic', 'Standard', 'Advance', 'Premium'] as const).required('Please select a tier'),
  validityDays: yup.number().integer().required('Validity is required').min(1).max(365),
  maxLocations: yup.number().integer().required().min(1).max(999),
  maxTerminals: yup.number().integer().required().min(1).max(999),
  maxUsers: yup.number().integer().required().min(1).max(999),
  maxProducts: yup.number().integer().required().min(1).max(999999),
  graceWarningDays: yup.number().integer().required().min(0).max(90),
  graceDegradedDays: yup.number().integer().required().min(0).max(90),
  graceRestrictedDays: yup.number().integer().required().min(0).max(90),
  graceSuspendedDays: yup.number().integer().required().min(0).max(90),
  businessId: yup.string().required('Business ID is required'),
  locationId: yup.string().optional(),
  terminalId: yup.string().optional(),
  wildcardBinding: yup.boolean().required(),
  billingMode: yup.mixed().oneOf(['invoice_now', 'next_bill'] as const).required(),
});

export type TokenFormValues = yup.InferType<typeof tokenFormSchema>;

export interface TokenFormProps {
  onSubmit: (request: TokenGenerateRequest) => void;
  loading?: boolean;
  className?: string;
  prefillMerchantId?: string;
  prefillTier?: string;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

const TIER_BASE_PRICE: Record<TokenTier, number> = {
  Basic: 29,
  Standard: 79,
  Advance: 149,
  Premium: 299,
};

const VALIDITY_MULTIPLIER: Record<number, number> = {
  30: 1,
  60: 1.8,
  90: 2.5,
  180: 4.5,
  365: 8,
};

const VALIDITY_DAYS_OPTIONS = [30, 60, 90, 180, 365] as const;

export function TokenForm({
  onSubmit,
  loading = false,
  className,
  prefillMerchantId,
  prefillTier,
  paymentMethod,
  setPaymentMethod,
}: TokenFormProps) {
  const [selectedTier, setSelectedTier] = useState<TokenTier | null>(null);

  const handleFormSubmit = (values: TokenFormValues) => {
    const request: TokenGenerateRequest = {
      merchantId: values.merchantId,
      tier: values.tier as TokenTier,
      businessNature: values.businessNature as 'Restaurant' | 'Retail' | 'Both',
      validityDays: values.validityDays,
      binding: {
        merchantId: values.merchantId,
        businessId: values.businessId,
        locationId: values.wildcardBinding ? null : values.locationId || null,
        terminalId: values.wildcardBinding ? null : values.terminalId || null,
      },
      limitsPayload: {
        MaxLocations: values.maxLocations,
        MaxTerminals: values.maxTerminals,
        MaxUsers: values.maxUsers,
        MaxProducts: values.maxProducts,
      },
      gracePolicy: {
        gracePeriodDays: values.graceWarningDays + values.graceDegradedDays + values.graceRestrictedDays + values.graceSuspendedDays,
        warningDays: values.graceWarningDays,
        degradedDays: values.graceDegradedDays,
        restrictedDays: values.graceRestrictedDays,
        readOnlyDuringGrace: true,
        notifyDaysBeforeExpiry: [values.graceWarningDays, values.graceDegradedDays, values.graceRestrictedDays],
      },
      invoiceOption: values.billingMode === 'invoice_now' ? 'immediate' : 'next-billing',
    };
    onSubmit(request);
  };

  const formik = useFormik<TokenFormValues>({
    initialValues: {
      merchantId: '',
      businessNature: 'Restaurant',
      tier: undefined as unknown as TokenTier,
      validityDays: 90,
      maxLocations: 1,
      maxTerminals: 2,
      maxUsers: 5,
      maxProducts: 500,
      graceWarningDays: 7,
      graceDegradedDays: 14,
      graceRestrictedDays: 21,
      graceSuspendedDays: 30,
      businessId: '',
      locationId: '',
      terminalId: '',
      wildcardBinding: false,
      billingMode: 'invoice_now',
    },
    validationSchema: tokenFormSchema,
    onSubmit: handleFormSubmit,
  });

  const tier = formik.values.tier;
  const validityDays = formik.values.validityDays;
  const wildcardBinding = formik.values.wildcardBinding;

  const { data: merchantsResponse, isLoading: merchantsLoading } = useMerchants({
    pageSize: 200,
  });

  const merchantOptions = useMemo(() => {
    const merchants = merchantsResponse?.data ?? [];
    return merchants.map((t: any) => ({
      label: `${t.businessName || t.companyName || 'Unnamed Merchant'} (${t.merchantType || 'Merchant'})`,
      value: t.id || t.merchantId,
    }));
  }, [merchantsResponse]);

  const unitPrice = useMemo(() => {
    if (!tier) return 0;
    const base = TIER_BASE_PRICE[tier as TokenTier] ?? 0;
    const multiplier = VALIDITY_MULTIPLIER[validityDays] ?? 1;
    return Math.round(base * multiplier * 100) / 100;
  }, [tier, validityDays]);

  const handleTierSelect = (t: TokenTier, template: TierTemplate) => {
    setSelectedTier(t);
    formik.setFieldValue('tier', t);
    formik.setFieldValue('maxLocations', template.limits.maxLocations);
    formik.setFieldValue('maxTerminals', template.limits.maxTerminals);
    formik.setFieldValue('maxUsers', template.limits.maxUsers);
    formik.setFieldValue('maxProducts', template.limits.maxProducts);
  };

  useEffect(() => {
    if (prefillMerchantId) {
      formik.setFieldValue('merchantId', prefillMerchantId);
      formik.setFieldValue('businessId', prefillMerchantId);
    }
    if (prefillTier) {
      const tier = prefillTier as TokenTier;
      const template = TIER_TEMPLATES.find((t) => t.tier === tier);
      if (template) {
        handleTierSelect(tier, template);
      }
    }
  }, [prefillMerchantId, prefillTier]);

  const merchantId = formik.values.merchantId;
  useEffect(() => {
    if (merchantId) {
      formik.setFieldValue('businessId', merchantId);
    }
  }, [merchantId]);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={cn('space-y-6', className)}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.75fr_0.9fr] items-start">
        {/* Left Column - Core Configurations */}
        <div className="space-y-6 lg:col-span-1">
          {/* Merchant Selector */}
          <ATMCard title="Merchant" padding="md" className="overflow-visible shadow-sm border border-gray-100 dark:border-gray-800">
            <ATMSelectField
              name="merchantId"
              label="Select Standalone Merchant"
              placeholder={merchantsLoading ? 'Loading merchants...' : 'Choose a merchant'}
              options={merchantOptions}
              error={formik.errors.merchantId as string}
              disabled={merchantsLoading}
              value={formik.values.merchantId || null}
              onChange={(val) => {
                formik.setFieldValue('merchantId', val);
              }}
              searchable
              clearable
              size="lg"
            />
          </ATMCard>

          {/* Payment Method Selector */}
          <ATMCard title="Payment Method" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="mb-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Select how the merchant will pay for this token. No recurring billing — each token is a one-time purchase.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((pm) => {
                const selected = paymentMethod === pm.id;
                const IconComponent = pm.icon;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-4 rounded-2xl border-2 p-6 text-center transition-all duration-300 w-full hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]',
                      'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/10',
                      selected
                        ? 'border-accent-600 bg-accent-50/30 shadow-md dark:border-accent-500 dark:bg-accent-950/20'
                        : 'border-surface-200 bg-zen-surface hover:border-accent-300 dark:border-surface-800 dark:hover:border-accent-800',
                    )}
                  >
                    {selected && (
                      <div className="absolute -top-3 right-4 flex items-center gap-1 bg-white dark:bg-gray-900 border border-accent-600 dark:border-accent-500 rounded-full px-2.5 py-0.5 shadow-sm animate-in zoom-in duration-300">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                          Selected
                        </span>
                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-accent-600 text-white dark:bg-accent-500">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" className="h-1.5 w-1.5">
                            <path d="M20 6L9 17L4 12" />
                          </svg>
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300',
                      selected
                        ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400'
                        : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
                    )}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-extrabold text-surface-900 dark:text-surface-100">{pm.label}</p>
                      <p className="mt-1 text-xs font-semibold text-surface-500 dark:text-surface-400 leading-normal">{pm.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ATMCard>

          {/* Tier Selection */}
          <ATMCard title="Tier Selection" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
            <TokenTemplateSelector
              selectedTier={selectedTier}
              onSelect={handleTierSelect}
            />
            {formik.errors.tier && (
              <p className="mt-2 text-xs font-bold text-red-600 dark:text-red-400" role="alert">
                {formik.errors.tier as string}
              </p>
            )}
          </ATMCard>

          {/* Validity Period */}
          <ATMCard title="Validity Period" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap gap-3">
              {VALIDITY_DAYS_OPTIONS.map((days) => (
                <ATMButton
                  key={days}
                  type="button"
                  variant={validityDays === days ? 'primary' : 'outline'}
                  onClick={() => formik.setFieldValue('validityDays', days)}
                  className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 font-bold"
                >
                  {days} days
                </ATMButton>
              ))}
            </div>
          </ATMCard>

          {/* Limits */}
          <ATMCard title="Tier Limits" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ATMTextField
                label="Max Locations"
                type="number"
                min={1}
                max={999}
                name="maxLocations"
                value={formik.values.maxLocations}
                onChange={(e) => formik.setFieldValue('maxLocations', parseInt(e.target.value) || 0)}
                error={formik.errors.maxLocations}
              />
              <ATMTextField
                label="Max Terminals"
                type="number"
                min={1}
                max={999}
                name="maxTerminals"
                value={formik.values.maxTerminals}
                onChange={(e) => formik.setFieldValue('maxTerminals', parseInt(e.target.value) || 0)}
                error={formik.errors.maxTerminals}
              />
              <ATMTextField
                label="Max Users"
                type="number"
                min={1}
                max={999}
                name="maxUsers"
                value={formik.values.maxUsers}
                onChange={(e) => formik.setFieldValue('maxUsers', parseInt(e.target.value) || 0)}
                error={formik.errors.maxUsers}
              />
              <ATMTextField
                label="Max Products"
                type="number"
                min={1}
                max={999999}
                name="maxProducts"
                value={formik.values.maxProducts}
                onChange={(e) => formik.setFieldValue('maxProducts', parseInt(e.target.value) || 0)}
                error={formik.errors.maxProducts}
              />
            </div>
          </ATMCard>

          {/* Grace Policy */}
          <ATMCard title="Grace Policy durations" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {GRACE_PHASES.map((phase, idx) => {
                const fieldName = (
                  idx === 0
                    ? 'graceWarningDays'
                    : idx === 1
                      ? 'graceDegradedDays'
                      : idx === 2
                        ? 'graceRestrictedDays'
                        : 'graceSuspendedDays'
                ) as keyof TokenFormValues;

                return (
                  <ATMTextField
                    key={phase.phase}
                    label={`${phase.label} (days)`}
                    type="number"
                    min={0}
                    max={90}
                    name={fieldName}
                    value={formik.values[fieldName] as number}
                    onChange={(e) => formik.setFieldValue(fieldName, parseInt(e.target.value) || 0)}
                    error={formik.errors[fieldName] as string}
                  />
                );
              })}
            </div>
          </ATMCard>
        </div>

        {/* Right Column - Actions, Pricing, Binding */}
        <div className="space-y-6 lg:col-span-1">
          {/* Pricing & Billing */}
          <ATMCard title="Pricing & Billing" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-accent-600 dark:text-accent-400">
                    {formatCurrency(unitPrice)}
                  </span>
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    / token
                  </span>
                </div>
                {tier ? (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {String(tier)} tier, {validityDays} days validity
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-gray-400">Select a tier to calculate price</p>
                )}
              </div>

              <div className="flex w-full rounded-xl border border-gray-250 bg-zen-surface overflow-hidden dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('billingMode', 'invoice_now')}
                  className={cn(
                    'flex-1 py-2 text-xs font-bold transition-all duration-300',
                    formik.values.billingMode === 'invoice_now'
                      ? 'bg-accent-600 text-white dark:bg-accent-600 shadow-sm'
                      : 'text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
                  )}
                >
                  Invoice Now
                </button>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('billingMode', 'next_bill')}
                  className={cn(
                    'flex-1 py-2 text-xs font-bold transition-all duration-300',
                    formik.values.billingMode === 'next_bill'
                      ? 'bg-accent-600 text-white dark:bg-accent-600 shadow-sm'
                      : 'text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
                  )}
                >
                  Next Bill
                </button>
              </div>

              <ATMButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md hover:shadow-lg transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                isLoading={loading}
                disabled={loading}
              >
                Generate Token
              </ATMButton>
            </div>
          </ATMCard>

          {/* Business Type */}
          <ATMCard title="Business Type" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="mb-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Determines POS features included in token.
            </p>
            <div className="flex flex-col gap-4">
              {BUSINESS_TYPES.map((bt) => {
                const selected = formik.values.businessNature === bt.id;
                const IconComponent = bt.icon;
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => formik.setFieldValue('businessNature', bt.id)}
                    className={cn(
                      'relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-300 w-full hover:scale-[1.01] active:scale-[0.99]',
                      'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/10',
                      selected
                        ? 'border-accent-600 bg-accent-50/30 shadow-md dark:border-accent-500 dark:bg-accent-950/20'
                        : 'border-surface-200 bg-zen-surface hover:border-accent-300 dark:border-surface-800 dark:hover:border-accent-800',
                    )}
                  >
                    {selected && (
                      <div className="absolute -top-3 right-4 flex items-center gap-1 bg-white dark:bg-gray-900 border border-accent-600 dark:border-accent-500 rounded-full px-2.5 py-0.5 shadow-sm animate-in zoom-in duration-300">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                          Selected
                        </span>
                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-accent-600 text-white dark:bg-accent-500">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" className="h-1.5 w-1.5">
                            <path d="M20 6L9 17L4 12" />
                          </svg>
                        </span>
                      </div>
                    )}
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                      selected
                        ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400'
                        : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-xs text-surface-900 dark:text-surface-100">{bt.label}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-surface-500 dark:text-surface-400 leading-normal">{bt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ATMCard>

          {/* Binding */}
          <ATMCard title="Binding Settings" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="space-y-4">
              <ATMTextField
                name="merchantIdReadOnly"
                label="Merchant ID"
                value={merchantId || '(auto-filled)'}
                disabled
                readOnly
              />
              <ATMTextField
                label="Business ID"
                name="businessId"
                value={formik.values.businessId}
                onChange={formik.handleChange}
                error={formik.errors.businessId}
              />

              <div className="flex items-center gap-3 py-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4.5 w-4.5 rounded-lg border-gray-200 text-accent-600 focus:ring-accent-500/10 dark:border-gray-800 dark:bg-gray-905"
                    name="wildcardBinding"
                    checked={formik.values.wildcardBinding}
                    onChange={formik.handleChange}
                  />
                  <span>Wildcard binding (any location/terminal)</span>
                </label>
              </div>

              {!wildcardBinding && (
                <div className="space-y-4">
                  <ATMTextField
                    label="Location ID"
                    placeholder="Leave blank for wildcard"
                    name="locationId"
                    value={formik.values.locationId || ''}
                    onChange={formik.handleChange}
                    error={formik.errors.locationId}
                  />
                  <ATMTextField
                    label="Terminal ID"
                    placeholder="Leave blank for wildcard"
                    name="terminalId"
                    value={formik.values.terminalId || ''}
                    onChange={formik.handleChange}
                    error={formik.errors.terminalId}
                  />
                </div>
              )}
            </div>
          </ATMCard>
        </div>
      </div>
    </form>
  );
}
