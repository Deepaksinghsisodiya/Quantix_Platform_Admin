import React, { useState } from 'react';
import { Form, FormikProps } from 'formik';
import {
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  Radio,
  ListOrdered,
  Layers,
  Activity,
  Info,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  ArrowLeft,
  Save,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ATMButton, ATMCard } from '@/shared/ui';
import { ATMFormHeaderActions } from '@/shared/components/ATMFormHeaderActions';
import { cn } from '@/lib/utils/cn';
import type { HowItWorksFormValues, SiteVariantTab } from '../Model/HowItWorksTypes';

interface HowItWorksFormProps {
  formikProps: FormikProps<HowItWorksFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

const AVAILABLE_SITES: Array<{
  value: SiteVariantTab;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'Enterprise',
    label: 'Enterprise Website',
    desc: 'B2B high-volume payment processing & enterprise workflows',
    icon: Building2,
  },
  {
    value: 'Restaurant',
    label: 'Restaurant Website',
    desc: 'Table service, online ordering, POS & kitchen display system',
    icon: UtensilsCrossed,
  },
  {
    value: 'Retail',
    label: 'Retail Website',
    desc: 'Omnichannel inventory, barcode checkout & multi-store sync',
    icon: ShoppingBag,
  },
];

const CHIP_STATUS_OPTIONS = [
  { value: 'active', label: 'Active (Pulsing Orange)', color: 'text-orange-500' },
  { value: 'verified', label: 'Verified (Green)', color: 'text-emerald-500' },
  { value: 'ready', label: 'Ready (Amber)', color: 'text-amber-500' },
];

const inputBase =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 dark:border-gray-800 dark:bg-[#13151a] dark:text-white dark:placeholder:text-slate-500 transition-all';

const labelBase = 'block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5';

export const HowItWorksForm: React.FC<HowItWorksFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } = formikProps;
  const [imgError, setImgError] = useState(false);

  const previewTitle = values.title || 'Interactive Workflow Step Title';
  const previewDesc =
    values.description ||
    'Provide a comprehensive description explaining how Quantix operates during this specific milestone.';
  const previewBadge = values.badgeLabel || `Step ${values.stepNumber || '01'} — Operational Stage`;

  const bulletsArray = values.bulletsText
    ? values.bulletsText.split('\n').map((b) => b.trim()).filter(Boolean)
    : [];

  return (
    <Form id="how-it-works-form" className="w-full space-y-6">
      <ATMFormHeaderActions
        onCancel={onCancel}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save Changes' : 'Create Step'}
        formId="how-it-works-form"
      />

      {/* Main Form Grid: 12 Columns (7 cols left for inputs, 5 cols right for Live Preview & Publishing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN: Input Form Cards (7 Cols on LG)                      */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Step Identity & Placement */}
          <ATMCard
            title="1. Identity & Target Website"
            subtitle="Select the destination website and step sequence identifier"
            className="p-5"
          >
            <div className="space-y-4">
              {/* Site Variant Selector */}
              <div>
                <label className={labelBase}>Target Website Variant *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {AVAILABLE_SITES.map((site) => {
                    const Icon = site.icon;
                    const isSelected = values.siteVariant === site.value;
                    return (
                      <button
                        key={site.value}
                        type="button"
                        onClick={() => setFieldValue('siteVariant', site.value)}
                        className={cn(
                          'p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all',
                          isSelected
                            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-900 dark:text-primary-100 shadow-2xs'
                            : 'border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={cn('w-4 h-4', isSelected ? 'text-primary-600' : 'text-slate-400')} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary-600 font-bold" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs">{site.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {site.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Number, Badge Label, Sort Order in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelBase} htmlFor="stepNumber">
                    Step Number *
                  </label>
                  <input
                    id="stepNumber"
                    name="stepNumber"
                    type="text"
                    placeholder="e.g. 01"
                    value={values.stepNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(inputBase, touched.stepNumber && errors.stepNumber && 'border-rose-500')}
                  />
                  {touched.stepNumber && errors.stepNumber && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.stepNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelBase} htmlFor="badgeLabel">
                    Badge Label *
                  </label>
                  <input
                    id="badgeLabel"
                    name="badgeLabel"
                    type="text"
                    placeholder="e.g. Step 01 — Architecture"
                    value={values.badgeLabel}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(inputBase, touched.badgeLabel && errors.badgeLabel && 'border-rose-500')}
                  />
                  {touched.badgeLabel && errors.badgeLabel && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.badgeLabel}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelBase} htmlFor="sortOrder">
                    Display Order
                  </label>
                  <input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    min="1"
                    value={values.sortOrder}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>
          </ATMCard>

          {/* Card 2: Step Content & Capabilities */}
          <ATMCard
            title="2. Copy & Feature Capabilities"
            subtitle="Write the step headline, deep description, and bullet capabilities"
            className="p-5"
          >
            <div className="space-y-4">
              <div>
                <label className={labelBase} htmlFor="title">
                  Step Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Cloud Architecture & Tenant Onboarding"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(inputBase, touched.title && errors.title && 'border-rose-500')}
                />
                {touched.title && errors.title && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className={labelBase} htmlFor="description">
                  Workflow Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Detailed breakdown explaining what happens at this milestone..."
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputBase}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelBase} htmlFor="bulletsText">
                    Workflow Capabilities / Bullets (One per line)
                  </label>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {bulletsArray.length} items
                  </span>
                </div>
                <textarea
                  id="bulletsText"
                  name="bulletsText"
                  rows={4}
                  placeholder="Instant multi-location merchant provision&#10;Sub-second token exchange verification&#10;Unified clearing across online & offline terminals"
                  value={values.bulletsText}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(inputBase, 'font-mono text-xs')}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Each line becomes an interactive checklist capability item with a verified green checkmark.
                </p>
              </div>
            </div>
          </ATMCard>

          {/* Card 3: Visual & Media Asset */}
          <ATMCard
            title="3. Visual Media & Imagery"
            subtitle="Configure hero workflow screenshot or vector terminal preview"
            className="p-5"
          >
            <div className="space-y-4">
              <div>
                <label className={labelBase} htmlFor="imageUrl">
                  Image / Illustration URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="text"
                  placeholder="https://images.unsplash.com/... or /images/how-it-works/step-1.webp"
                  value={values.imageUrl}
                  onChange={(e) => {
                    handleChange(e);
                    setImgError(false);
                  }}
                  onBlur={handleBlur}
                  className={inputBase}
                />
              </div>

              <div>
                <label className={labelBase} htmlFor="imageAlt">
                  Image Alt Text (Accessibility & SEO)
                </label>
                <input
                  id="imageAlt"
                  name="imageAlt"
                  type="text"
                  placeholder="e.g. Quantix terminal architecture interface screenshot"
                  value={values.imageAlt}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputBase}
                />
              </div>

              {/* Sample Quick Asset Pickers */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-200/80 dark:border-gray-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Sample Unsplash Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Data Center', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80' },
                    { label: 'POS Terminal', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&q=80' },
                    { label: 'Retail Store', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80' },
                    { label: 'Restaurant KDS', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFieldValue('imageUrl', preset.url);
                        setFieldValue('imageAlt', `${preset.label} Workflow Milestone`);
                        setImgError(false);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#13151a] hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ATMCard>

          {/* Card 4: Metrics & Telemetry Chips */}
          <ATMCard
            title="4. Metrics Pill & Real-Time Telemetry Chips"
            subtitle="Display SLA benchmarks and simulated live hardware status indicators"
            className="p-5"
          >
            <div className="space-y-5">
              {/* Stat Metric Pill */}
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 dark:bg-orange-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Highlighted Benchmark Pill
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelBase} htmlFor="statValue">
                      Metric Value
                    </label>
                    <input
                      id="statValue"
                      name="statValue"
                      type="text"
                      placeholder="e.g. 99.999% or < 250ms"
                      value={values.statValue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase} htmlFor="statLabel">
                      Metric Label
                    </label>
                    <input
                      id="statLabel"
                      name="statLabel"
                      type="text"
                      placeholder="e.g. Network Uptime SLA"
                      value={values.statLabel}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>

              {/* Telemetry Chip 1 */}
              <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-orange-500" />
                    Telemetry Chip 1
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelBase} htmlFor="chip1Label">
                      Chip Label
                    </label>
                    <input
                      id="chip1Label"
                      name="chip1Label"
                      type="text"
                      placeholder="e.g. Sync Engine"
                      value={values.chip1Label}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase} htmlFor="chip1Sublabel">
                      Sublabel / Frequency
                    </label>
                    <input
                      id="chip1Sublabel"
                      name="chip1Sublabel"
                      type="text"
                      placeholder="e.g. Continuous 5s"
                      value={values.chip1Sublabel}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase} htmlFor="chip1Status">
                      Status State
                    </label>
                    <select
                      id="chip1Status"
                      name="chip1Status"
                      value={values.chip1Status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    >
                      {CHIP_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Telemetry Chip 2 */}
              <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" />
                    Telemetry Chip 2
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelBase} htmlFor="chip2Label">
                      Chip Label
                    </label>
                    <input
                      id="chip2Label"
                      name="chip2Label"
                      type="text"
                      placeholder="e.g. Encryption"
                      value={values.chip2Label}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase} htmlFor="chip2Sublabel">
                      Sublabel / Protocol
                    </label>
                    <input
                      id="chip2Sublabel"
                      name="chip2Sublabel"
                      type="text"
                      placeholder="e.g. AES-256 GCM"
                      value={values.chip2Sublabel}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelBase} htmlFor="chip2Status">
                      Status State
                    </label>
                    <select
                      id="chip2Status"
                      name="chip2Status"
                      value={values.chip2Status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    >
                      {CHIP_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </ATMCard>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: Live Interactive Showcase Card (5 Cols on LG)       */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* Card: Live Website Simulation Card */}
          <ATMCard
            title="Real-Time Step Showcase"
            subtitle="Live representation of this workflow card on the public website"
            className="p-5"
          >
            {/* The Actual Simulated Card */}
            <div className="relative rounded-2xl border border-slate-200/90 dark:border-gray-800 bg-white dark:bg-[#13151a] shadow-lg overflow-hidden flex flex-col justify-between">
              {/* Top Accent Gradient Bar */}
              <div
                className={cn(
                  'h-1 w-full',
                  values.isActive
                    ? 'bg-gradient-to-r from-primary-500 via-orange-500 to-amber-400'
                    : 'bg-slate-300 dark:bg-slate-700'
                )}
              />

              <div className="p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-7 px-2 rounded-md font-mono font-bold text-xs bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                      Step {values.stepNumber || '01'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {previewBadge}
                    </span>
                  </div>

                  {values.isActive ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>

                {/* Big Image Container (Height h-56) */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 h-56 flex items-center justify-center shadow-inner">
                  {values.imageUrl && !imgError ? (
                    <>
                      <img
                        src={values.imageUrl}
                        alt={values.imageAlt || previewTitle}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500 p-4 text-center">
                      <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-xs font-medium">Image Preview Container</span>
                      <span className="text-[10px] text-slate-500">256px showcase height</span>
                    </div>
                  )}

                  {/* Overlaid Benchmark Pill */}
                  {values.statValue && (
                    <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/90 backdrop-blur-md px-3 py-1.5 border border-white/15 shadow-lg flex items-center gap-2 z-10">
                      <Activity className="w-4 h-4 text-orange-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-orange-400 font-mono leading-none">
                          {values.statValue}
                        </div>
                        {values.statLabel && (
                          <div className="text-[9px] text-slate-300 font-medium leading-none mt-0.5">
                            {values.statLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 border border-white/10 text-[10px] font-mono text-slate-300 z-10">
                    {values.siteVariant}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {previewTitle}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {previewDesc}
                  </p>
                </div>

                {/* Bullets List */}
                {bulletsArray.length > 0 && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Capabilities
                    </span>
                    <ul className="space-y-1">
                      {bulletsArray.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Telemetry Chips */}
                {(values.chip1Label || values.chip2Label) && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {values.chip1Label && (
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-2 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-orange-500 animate-pulse shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {values.chip1Label}
                          </span>
                        </div>
                        {values.chip1Sublabel && (
                          <div className="text-[9px] text-slate-500 truncate pl-3.5">
                            {values.chip1Sublabel}
                          </div>
                        )}
                      </div>
                    )}
                    {values.chip2Label && (
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-2 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {values.chip2Label}
                          </span>
                        </div>
                        {values.chip2Sublabel && (
                          <div className="text-[9px] text-slate-500 truncate pl-3.5">
                            {values.chip2Sublabel}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ATMCard>

          {/* Card: Publishing Status & Quick Controls */}
          <ATMCard title="Publishing & Status" subtitle="Control visibility on the public website" className="p-5">
            <div className="space-y-4">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-gray-800">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Publish Status: {values.isActive ? 'Active & Live' : 'Hidden Draft'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {values.isActive
                      ? 'Step is displayed to visitors on the website.'
                      : 'Step is hidden and saved as a draft.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFieldValue('isActive', !values.isActive)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    values.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                      values.isActive ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Step...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isEdit ? 'Save Changes' : 'Create Step Now'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#13151a] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel & Return to List
                </button>
              </div>
            </div>
          </ATMCard>
        </div>
      </div>
    </Form>
  );
};

export default HowItWorksForm;
