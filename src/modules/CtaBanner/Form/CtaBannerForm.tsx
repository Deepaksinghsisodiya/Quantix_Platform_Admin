import React from 'react';
import { Form, FormikProps } from 'formik';
import {
  Sparkles,
  Building2,
  Utensils,
  Store,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Zap,
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  ATMButton,
  ATMTextField,
  ATMTextArea,
  ATMCheckbox,
} from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { TelemetryChip } from '../Model/CtaBannerTypes';

export interface CtaBannerFormValues {
  siteVariant: string;
  badge: string;
  heading: string;
  headingAccent: string;
  subheading: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  telemetryChips: TelemetryChip[];
  trustBadges: string[];
  isActive: boolean;
}

interface CtaBannerFormProps {
  formikProps: FormikProps<CtaBannerFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
}

export const CtaBannerForm: React.FC<CtaBannerFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } =
    formikProps;

  const siteVariants = [
    {
      id: 'Enterprise',
      label: 'Enterprise Platform',
      icon: Building2,
      desc: 'Multi-store enterprise chains, commissary rollouts & cloud HQ',
      color: 'bg-primary/10 text-primary border-primary/30',
    },
    {
      id: 'Restaurant',
      label: 'Restaurant POS',
      icon: Utensils,
      desc: 'Dine-in tables, kitchen KDS & rush-hour weekend service',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    {
      id: 'Retail',
      label: 'Retail Storefront',
      icon: Store,
      desc: 'Barcode lanes, live inventory balance & offline cash registers',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
  ];

  const dotColorOptions = [
    { id: '#10B981', label: 'Emerald (Live)', ping: '#34D399' },
    { id: '#FF4F00', label: 'Brand Orange', ping: '#FB923C' },
    { id: '#3B82F6', label: 'Tech Blue', ping: '#60A5FA' },
    { id: '#8B5CF6', label: 'Violet', ping: '#A78BFA' },
  ];

  // Telemetry chips manipulation
  const handleAddTelemetryChip = () => {
    if (values.telemetryChips.length >= 5) return;
    const newChips = [
      ...values.telemetryChips,
      {
        id: `chip-${Date.now()}`,
        label: 'New Telemetry Metric',
        dotColor: '#10B981',
        pingColor: '#34D399',
      },
    ];
    setFieldValue('telemetryChips', newChips);
  };

  const handleUpdateTelemetryChip = (index: number, field: keyof TelemetryChip, val: string) => {
    const chip = values.telemetryChips[index];
    if (!chip) return;
    const updated = [...values.telemetryChips];
    updated[index] = {
      ...chip,
      [field]: val,
    };
    setFieldValue('telemetryChips', updated);
  };

  const handleRemoveTelemetryChip = (index: number) => {
    const updated = values.telemetryChips.filter((_, i) => i !== index);
    setFieldValue('telemetryChips', updated);
  };

  // Trust badges manipulation
  const handleAddTrustBadge = () => {
    if (values.trustBadges.length >= 6) return;
    setFieldValue('trustBadges', [...values.trustBadges, 'New Security Guarantee']);
  };

  const handleUpdateTrustBadge = (index: number, val: string) => {
    const updated = [...values.trustBadges];
    updated[index] = val;
    setFieldValue('trustBadges', updated);
  };

  const handleRemoveTrustBadge = (index: number) => {
    const updated = values.trustBadges.filter((_, i) => i !== index);
    setFieldValue('trustBadges', updated);
  };

  return (
    <Form className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: EDITABLE FIELDS (8 COLS)                                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Platform Selection */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Target Storefront Platform
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select which storefront this conversion CTA banner belongs to.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {siteVariants.map((variant) => {
                const isSelected =
                  values.siteVariant.toLowerCase() === variant.id.toLowerCase();
                const Icon = variant.icon;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={isEdit}
                    onClick={() => setFieldValue('siteVariant', variant.id)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group relative',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10 shadow-sm'
                        : 'border-border hover:border-border/80 bg-background/50 hover:bg-muted/40',
                      isEdit && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    <div>
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors',
                          variant.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">
                        {variant.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {variant.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected Platform
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {touched.siteVariant && errors.siteVariant && (
              <p className="text-xs text-destructive font-medium">{errors.siteVariant}</p>
            )}
          </div>

          {/* Card 2: Headline & Messaging */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Hero Headline & Messaging
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Draft the primary headline, gradient accent words, and explanatory subtitle.
              </p>
            </div>

            <div className="space-y-4">
              <ATMTextField
                label="Eyebrow Badge Tagline"
                placeholder="e.g. DEPLOYMENT READY or SCALED ENTERPRISE"
                name="badge"
                value={values.badge}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.badge && errors.badge ? errors.badge : undefined}
                helperText="Appears inside the small glowing pill above the headline."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ATMTextField
                  label="Main Heading"
                  placeholder="e.g. Take Control of Your Enterprise Operations"
                  name="heading"
                  value={values.heading}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={touched.heading && errors.heading ? errors.heading : undefined}
                  helperText="Primary statement rendered in clean white."
                />

                <ATMTextField
                  label="Heading Accent (Gradient)"
                  placeholder="e.g. in Days, Not Months"
                  name="headingAccent"
                  value={values.headingAccent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.headingAccent && errors.headingAccent
                      ? errors.headingAccent
                      : undefined
                  }
                  helperText="Rendered in vibrant glowing orange/amber gradient."
                />
              </div>

              <ATMTextArea
                label="Subheading Description"
                placeholder="Join 1,200+ multi-unit operators orchestrating real-time supply chain, store ops, and cloud financials from a single pane of glass."
                name="subheading"
                rows={3}
                value={values.subheading}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.subheading && errors.subheading ? errors.subheading : undefined}
                helperText="Compelling value proposition paragraph beneath the headline."
              />
            </div>
          </div>

          {/* Card 3: Dual Conversion Action Buttons */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Dual Call-To-Action Buttons
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure both primary high-intent and secondary exploration routes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary CTA */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04] space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Primary Action (Brand Solid)
                </div>
                <ATMTextField
                  label="Button Label"
                  placeholder="e.g. Request Enterprise Demo"
                  name="primaryCtaText"
                  value={values.primaryCtaText}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={
                    touched.primaryCtaText && errors.primaryCtaText
                      ? errors.primaryCtaText
                      : undefined
                  }
                />
                <ATMTextField
                  label="Destination URL / Route"
                  placeholder="e.g. /contact or /demo"
                  name="primaryCtaHref"
                  value={values.primaryCtaHref}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={
                    touched.primaryCtaHref && errors.primaryCtaHref
                      ? errors.primaryCtaHref
                      : undefined
                  }
                />
              </div>

              {/* Secondary CTA */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Secondary Action (Outline Glass)
                </div>
                <ATMTextField
                  label="Button Label"
                  placeholder="e.g. Calculate ROI or Take a Tour"
                  name="secondaryCtaText"
                  value={values.secondaryCtaText}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.secondaryCtaText && errors.secondaryCtaText
                      ? errors.secondaryCtaText
                      : undefined
                  }
                />
                <ATMTextField
                  label="Destination URL / Route"
                  placeholder="e.g. /pricing or /solutions"
                  name="secondaryCtaHref"
                  value={values.secondaryCtaHref}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.secondaryCtaHref && errors.secondaryCtaHref
                      ? errors.secondaryCtaHref
                      : undefined
                  }
                />
              </div>
            </div>
          </div>

          {/* Card 4: Real-time Telemetry Chips */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Telemetry Chips
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live status indicators shown at the top of the CTA card (e.g., SLA status, ping rate).
                </p>
              </div>
              <ATMButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTelemetryChip}
                disabled={values.telemetryChips.length >= 5}
                icon={Plus}
              >
                Add Metric
              </ATMButton>
            </div>

            <div className="space-y-3">
              {values.telemetryChips.map((chip, idx) => (
                <div
                  key={chip.id || idx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background/50 hover:bg-muted/30 transition-colors"
                >
                  {/* Dot color selector */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {dotColorOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          handleUpdateTelemetryChip(idx, 'dotColor', opt.id);
                          handleUpdateTelemetryChip(idx, 'pingColor', opt.ping);
                        }}
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                          chip.dotColor === opt.id
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                            : 'opacity-60 hover:opacity-100'
                        )}
                        title={opt.label}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: opt.id }}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Label input */}
                  <input
                    type="text"
                    value={chip.label}
                    onChange={(e) => handleUpdateTelemetryChip(idx, 'label', e.target.value)}
                    placeholder="Metric Label (e.g. 99.99% Core Uptime)"
                    className="flex-1 bg-transparent border-0 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveTelemetryChip(idx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    title="Remove chip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {values.telemetryChips.length === 0 && (
                <div className="text-center py-6 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  No telemetry chips added yet. Click &quot;Add Metric&quot; to show live status badges.
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Trust Badges / Checkmarks */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Trust Badges & Guarantees
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Micro-proof statements with checkmarks rendered at the very bottom.
                </p>
              </div>
              <ATMButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTrustBadge}
                disabled={values.trustBadges.length >= 6}
                icon={Plus}
              >
                Add Guarantee
              </ATMButton>
            </div>

            <div className="space-y-2.5">
              {values.trustBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-background/50"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => handleUpdateTrustBadge(idx, e.target.value)}
                    placeholder="e.g. SOC 2 Type II Certified, No Long-term Contracts"
                    className="flex-1 bg-transparent border-0 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTrustBadge(idx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {values.trustBadges.length === 0 && (
                <div className="text-center py-6 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  No trust guarantees added. Click &quot;Add Guarantee&quot; to bolster buyer confidence.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY REAL-TIME PREVIEW + PUBLISH (5 COLS)                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          {/* Card: Publish Controls */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>Publication Status</span>
              <span
                className={cn(
                  'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                  values.isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border-border'
                )}
              >
                {values.isActive ? 'Active on Storefront' : 'Draft / Offline'}
              </span>
            </h2>

            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <ATMCheckbox
                name="isActive"
                label={
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground text-sm">
                      Enable Live CTA Banner
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      When checked, this banner is immediately served to storefront visitors.
                    </span>
                  </div>
                }
                checked={values.isActive}
                onChange={(checked) => setFieldValue('isActive', checked)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <ATMButton
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isEdit ? 'Update CTA Banner' : 'Create CTA Banner'}
              </ATMButton>
              <ATMButton
                type="button"
                variant="outline"
                size="lg"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </ATMButton>
            </div>
          </div>

          {/* Card: Dark Ambient Live Preview */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md">
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Storefront Live Preview
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-background text-muted-foreground border border-border">
                {values.siteVariant || 'Storefront'}
              </span>
            </div>

            {/* Mock Dark Ambient View */}
            <div className="relative bg-[#080B11] text-white p-6 sm:p-8 overflow-hidden select-none">
              {/* Subtle background glow mesh */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-44 bg-[#FF4F00]/25 rounded-full blur-[70px]" />
                <div className="absolute top-0 right-1/4 w-40 h-40 bg-amber-500/15 rounded-full blur-[60px]" />
              </div>

              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />

              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                {/* Telemetry Chips Bar */}
                {values.telemetryChips.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
                    {values.telemetryChips.map((chip, idx) => (
                      <span
                        key={chip.id || idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wide bg-white/5 border border-white/10 text-white/90"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: chip.dotColor || '#10B981' }}
                        />
                        {chip.label || 'Metric'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Eyebrow Badge */}
                {values.badge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FF4F00]/15 text-[#FF4F00] border border-[#FF4F00]/30 shadow-[0_0_15px_rgba(255,79,0,0.2)]">
                    <Sparkles className="h-3 w-3" />
                    {values.badge}
                  </div>
                )}

                {/* Headline & Accent */}
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                  {values.heading || 'Take Control of Operations'}
                  {values.headingAccent && (
                    <span className="block bg-gradient-to-r from-[#FF4F00] via-orange-400 to-amber-300 bg-clip-text text-transparent mt-1">
                      {values.headingAccent}
                    </span>
                  )}
                </h3>

                {/* Subheading */}
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed line-clamp-3">
                  {values.subheading ||
                    'Join modern operators orchestrating seamless workflows with Quantix platform.'}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full max-w-sm">
                  <div className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-[#FF4F00] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(255,79,0,0.35)] cursor-default">
                    <span>{values.primaryCtaText || 'Get Started'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  {values.secondaryCtaText && (
                    <div className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white/80 text-xs font-medium flex items-center justify-center gap-1.5 cursor-default">
                      <span>{values.secondaryCtaText}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                {values.trustBadges.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-3 border-t border-white/10 w-full text-[11px] text-neutral-400">
                    {values.trustBadges.map((badge, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};
