import React, { useState } from 'react';
import { Form, FormikProps } from 'formik';
import {
  Cpu,
  Sparkles,
  Palette,
  FileText,
  Sliders,
  HelpCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Tag,
  Zap,
  Clock,
  Radio,
  Star,
  Layers,
  Award,
  ListOrdered,
  ListCheck,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';
import { ATMButton, ATMTextField, ATMSelectField, ATMCheckbox, ATMTextArea } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type {
  IntegrationFormValues,
  IntegrationFeatureItem,
  IntegrationSetupStepItem,
  IntegrationFaqItem,
  IntegrationStatItem,
  IntegrationSpecItem,
} from '../Model/IntegrationTypes';
import { getIntegrationCategoryIcon } from '../List/IntegrationCard';

interface IntegrationFormProps {
  formikProps: FormikProps<IntegrationFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

const AVAILABLE_CATEGORIES = [
  { value: 'payments', label: 'Payments & Gateway' },
  { value: 'delivery', label: 'Delivery & Dispatch' },
  { value: 'accounting', label: 'Accounting & ERP' },
  { value: 'pos_terminal', label: 'POS Terminal & Hardware' },
  { value: 'ecommerce', label: 'E-Commerce & Omnichannel' },
  { value: 'wallet', label: 'Digital Wallets & Tap to Pay' },
  { value: 'marketing', label: 'Marketing, Loyalty & CRM' },
];

const PRESET_ACCENTS = [
  '#635BFF', // Stripe Indigo
  '#FF3008', // DoorDash Red
  '#06C167', // Uber Eats Green
  '#2CA01C', // QuickBooks Green
  '#1E3A5F', // Authorize.Net Blue
  '#7AB55C', // Shopify Green
  '#96588A', // WooCommerce Purple
  '#1EC677', // Clover Green
  '#4285F4', // Google Blue
  '#000000', // Square Black
  '#FF4F00', // Quantix Primary Orange
];

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } = formikProps;
  const [imgError, setImgError] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'features' | 'steps' | 'benefits' | 'faqs' | 'stats' | 'specs'>('features');

  const Icon = getIntegrationCategoryIcon(values.category);
  const previewName = values.name || 'Integration Name';
  const previewCategory = values.categoryLabel || values.category.toUpperCase() || 'PAYMENTS';
  const previewAccent = values.accent || '#635BFF';

  // Auto-slug generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    if (!isEdit && !values.slug) {
      const generatedSlug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFieldValue('slug', generatedSlug);
    }
  };

  // Tag Add / Remove
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !values.tags.includes(trimmed)) {
      setFieldValue('tags', [...values.tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFieldValue('tags', values.tags.filter((_, i) => i !== index));
  };

  // Feature Add / Remove / Change
  const handleAddFeature = () => {
    setFieldValue('features', [...values.features, { title: '', desc: '' }]);
  };
  const handleUpdateFeature = (index: number, field: keyof IntegrationFeatureItem, val: string) => {
    const updated = [...values.features];
    updated[index] = { ...updated[index], [field]: val };
    setFieldValue('features', updated);
  };
  const handleRemoveFeature = (index: number) => {
    setFieldValue('features', values.features.filter((_, i) => i !== index));
  };

  // Step Add / Remove / Change
  const handleAddStep = () => {
    const nextStepNum = String(values.setupSteps.length + 1).padStart(2, '0');
    setFieldValue('setupSteps', [...values.setupSteps, { step: nextStepNum, title: '', desc: '' }]);
  };
  const handleUpdateStep = (index: number, field: keyof IntegrationSetupStepItem, val: string) => {
    const updated = [...values.setupSteps];
    updated[index] = { ...updated[index], [field]: val };
    setFieldValue('setupSteps', updated);
  };
  const handleRemoveStep = (index: number) => {
    setFieldValue('setupSteps', values.setupSteps.filter((_, i) => i !== index));
  };

  // Benefit Add / Remove / Change
  const handleAddBenefit = () => {
    setFieldValue('benefits', [...values.benefits, '']);
  };
  const handleUpdateBenefit = (index: number, val: string) => {
    const updated = [...values.benefits];
    updated[index] = val;
    setFieldValue('benefits', updated);
  };
  const handleRemoveBenefit = (index: number) => {
    setFieldValue('benefits', values.benefits.filter((_, i) => i !== index));
  };

  // FAQ Add / Remove / Change
  const handleAddFaq = () => {
    setFieldValue('faqs', [...values.faqs, { question: '', answer: '' }]);
  };
  const handleUpdateFaq = (index: number, field: keyof IntegrationFaqItem, val: string) => {
    const updated = [...values.faqs];
    updated[index] = { ...updated[index], [field]: val };
    setFieldValue('faqs', updated);
  };
  const handleRemoveFaq = (index: number) => {
    setFieldValue('faqs', values.faqs.filter((_, i) => i !== index));
  };

  // Stat Add / Remove / Change
  const handleAddStat = () => {
    setFieldValue('stats', [...values.stats, { value: '', label: '' }]);
  };
  const handleUpdateStat = (index: number, field: keyof IntegrationStatItem, val: string) => {
    const updated = [...values.stats];
    updated[index] = { ...updated[index], [field]: val };
    setFieldValue('stats', updated);
  };
  const handleRemoveStat = (index: number) => {
    setFieldValue('stats', values.stats.filter((_, i) => i !== index));
  };

  // Spec Add / Remove / Change
  const handleAddSpec = () => {
    setFieldValue('specs', [...values.specs, { label: '', value: '' }]);
  };
  const handleUpdateSpec = (index: number, field: keyof IntegrationSpecItem, val: string) => {
    const updated = [...values.specs];
    updated[index] = { ...updated[index], [field]: val };
    setFieldValue('specs', updated);
  };
  const handleRemoveSpec = (index: number) => {
    setFieldValue('specs', values.specs.filter((_, i) => i !== index));
  };

  return (
    <Form className="w-full space-y-6">
      {/* 2-Column Responsive Full Width Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Main Form Inputs & Content Builders (8 Cols)                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6 w-full">
          {/* SECTION 1: TARGET WEBSITE & CORE IDENTITY */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Cpu className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Target Website & Core Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ATMSelectField
                name="siteVariant"
                label="Target Website"
                value={values.siteVariant}
                onChange={(val) => setFieldValue('siteVariant', String(val || 'Enterprise'))}
                options={[
                  { value: 'Enterprise', label: 'Enterprise Website' },
                  { value: 'Restaurant', label: 'Restaurant Website' },
                  { value: 'Retail', label: 'Retail Website' },
                ]}
                required
              />

              <ATMSelectField
                name="category"
                label="Integration Category"
                value={values.category}
                onChange={(val) => {
                  const cat = String(val || 'payments');
                  setFieldValue('category', cat);
                  const found = AVAILABLE_CATEGORIES.find((c) => c.value === cat);
                  if (found && !values.categoryLabel) {
                    setFieldValue('categoryLabel', found.label.toUpperCase());
                  }
                }}
                options={AVAILABLE_CATEGORIES}
                required
              />

              <ATMTextField
                name="categoryLabel"
                label="Category Pill (e.g. PAYMENTS)"
                placeholder="e.g. PAYMENTS or DELIVERY"
                value={values.categoryLabel}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="name"
                label="Integration Name"
                placeholder="e.g. Stripe or DoorDash"
                value={values.name}
                onChange={handleNameChange}
                onBlur={handleBlur}
                error={touched.name && errors.name ? errors.name : undefined}
                required
              />

              <ATMTextField
                name="slug"
                label="URL Slug (/integrations/[slug])"
                placeholder="e.g. stripe or uber-eats"
                value={values.slug}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.slug && errors.slug ? errors.slug : undefined}
                required
              />
            </div>

            <ATMTextArea
              name="description"
              label="Catalog Short Description (Grid Cards)"
              placeholder="Connect Stripe to Quantix POS for seamless card reader integration, online checkout processing..."
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={2}
              maxLength={500}
            />
          </div>

          {/* SECTION 2: DEEP HERO COPY */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Deep Detail Page Hero Copy
            </h4>

            <div className="space-y-4">
              <ATMTextField
                name="heroHeadline"
                label="Single Page Hero Title / Headline"
                placeholder="e.g. Accept Card Payments Tableside, Online, and via QR"
                value={values.heroHeadline}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ATMTextArea
                name="tagline"
                label="Tagline / Sub-Headline"
                placeholder="Connect Stripe to Quantix POS for seamless card reader integration, online checkout processing, and automatic daily payouts..."
                value={values.tagline}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={2}
                maxLength={600}
              />
            </div>
          </div>

          {/* SECTION 3: VISUAL BRANDING & ASSETS */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Palette className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Visual Branding & Media
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ATMTextField
                name="logoUrl"
                label="Brand Logo URL (.svg / .png)"
                placeholder="/brands/integrations/stripe.svg"
                value={values.logoUrl}
                onChange={(e) => {
                  setImgError(false);
                  handleChange(e);
                }}
                onBlur={handleBlur}
              />

              <ATMTextField
                name="imageUrl"
                label="Hardware / Bundle Preview Image"
                placeholder="/images/ent_stripe_pos_bundle.png"
                value={values.imageUrl}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ATMTextField
                name="websiteUrl"
                label="Partner Official URL"
                placeholder="https://stripe.com"
                value={values.websiteUrl}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <ATMTextField
                  name="accent"
                  label="Accent Glow Color (Hex)"
                  placeholder="#635BFF"
                  value={values.accent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
                  {PRESET_ACCENTS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setFieldValue('accent', hex)}
                      className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 hover:scale-125 transition-transform cursor-pointer shadow-xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              <ATMTextField
                name="badge"
                label="Badge Pill Text"
                placeholder="e.g. Official Partner or Direct Connect"
                value={values.badge}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* SECTION 4: SPEED, TICKER & DYNAMIC TAGS */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Sync Speed, Ticker & Dynamic Tags
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="syncSpeed"
                label="Sync Speed Badge Text"
                placeholder="e.g. Real-Time Sync or < 200ms"
                value={values.syncSpeed}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ATMSelectField
                name="syncSpeedIcon"
                label="Sync Speed Icon Style"
                value={values.syncSpeedIcon}
                onChange={(val) => setFieldValue('syncSpeedIcon', String(val || 'live'))}
                options={[
                  { value: 'live', label: 'Live Pulsing Dot (Real-Time)' },
                  { value: 'instant', label: 'Lightning Bolt (Fast / Sub-second)' },
                  { value: 'batch', label: 'Clock Icon (Overnight / Batch)' },
                ]}
              />
            </div>

            {/* Keyword tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Card Tags & Keywords (e.g. Smart Terminal, Apple Pay, Radar Fraud Shield)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type a tag and press Add or Enter..."
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  + Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {values.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                  >
                    <Tag size={11} className="text-primary-500" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(i)}
                      className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: DEEP DETAIL CONTENT TABS (Features, Steps, Benefits, FAQs, Stats, Specs) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Deep Content Repeaters
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Powers all sections of <code className="text-primary-600 font-mono">/integrations/{values.slug || '[slug]'}</code>
              </span>
            </div>

            {/* Content Tabs Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800 custom-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('features')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                  activeTab === 'features'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <Layers size={13} /> Features ({values.features.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('steps')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                  activeTab === 'steps'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <ListOrdered size={13} /> How It Works ({values.setupSteps.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('benefits')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                  activeTab === 'benefits'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <Award size={13} /> Benefits ({values.benefits.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('faqs')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                  activeTab === 'faqs'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <HelpCircle size={13} /> FAQs ({values.faqs.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                  activeTab === 'stats'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <Star size={13} /> Key Metrics ({values.stats.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                  activeTab === 'specs'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                <Radio size={13} /> Tech Specs ({values.specs.length})
              </button>
            </div>

            {/* TAB 1: FEATURES REPEATER */}
            {activeTab === 'features' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Features display in 6-card grid on the detail page.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <Plus size={14} /> Add Feature
                  </button>
                </div>

                {values.features.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No features added yet. Click &quot;+ Add Feature&quot; above.
                  </div>
                ) : (
                  values.features.map((feature, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          #{i + 1} Feature
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(i)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove feature"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <input
                            type="text"
                            placeholder="Feature Title (e.g. Tableside Card Readers)"
                            value={feature.title || ''}
                            onChange={(e) => handleUpdateFeature(i, 'title', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Feature Description (e.g. Push order totals to Stripe Terminal card readers...)"
                            value={feature.desc || ''}
                            onChange={(e) => handleUpdateFeature(i, 'desc', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: SETUP STEPS REPEATER */}
            {activeTab === 'steps' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Steps display in the &quot;How It Works&quot; onboarding timeline (01, 02, 03, 04).
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <Plus size={14} /> Add Step
                  </button>
                </div>

                {values.setupSteps.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No setup steps added yet. Click &quot;+ Add Step&quot; above.
                  </div>
                ) : (
                  values.setupSteps.map((step, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={step.step || String(i + 1).padStart(2, '0')}
                            onChange={(e) => handleUpdateStep(i, 'step', e.target.value)}
                            className="w-12 text-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-1 py-1 font-mono text-xs font-bold text-primary-600"
                            title="Step Index"
                          />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Step #{i + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(i)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <input
                            type="text"
                            placeholder="Step Title (e.g. Connect Stripe Account)"
                            value={step.title || ''}
                            onChange={(e) => handleUpdateStep(i, 'title', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Step Details (e.g. Link in Settings -> Payment Integrations in under 2 mins...)"
                            value={step.desc || ''}
                            onChange={(e) => handleUpdateStep(i, 'desc', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: BENEFITS REPEATER */}
            {activeTab === 'benefits' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Bullet benefits with green checkmarks on the detail page.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <Plus size={14} /> Add Benefit
                  </button>
                </div>

                {values.benefits.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No benefits added yet.
                  </div>
                ) : (
                  values.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-mono font-bold text-emerald-500">
                        ✓
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Zero manual entry — totals push from POS to reader automatically"
                        value={benefit}
                        onChange={(e) => handleUpdateBenefit(i, e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(i)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: FAQS REPEATER */}
            {activeTab === 'faqs' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Questions & answers rendered in the expandable FAQ section.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <Plus size={14} /> Add FAQ
                  </button>
                </div>

                {values.faqs.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No FAQs added yet.
                  </div>
                ) : (
                  values.faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          FAQ #{i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(i)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Question: e.g. Do I need a separate Stripe account?"
                        value={faq.question || ''}
                        onChange={(e) => handleUpdateFaq(i, 'question', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold"
                      />

                      <textarea
                        rows={2}
                        placeholder="Answer: e.g. Yes, you need a Stripe account. You can create one during setup..."
                        value={faq.answer || ''}
                        onChange={(e) => handleUpdateFaq(i, 'answer', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 5: KEY STATS REPEATER */}
            {activeTab === 'stats' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Numbers & Trust badges (e.g. 99.99% Uptime, &lt; 200ms Injection Speed).
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStat}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <Plus size={14} /> Add Metric
                  </button>
                </div>

                {values.stats.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No stats added yet.
                  </div>
                ) : (
                  values.stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Value (e.g. 99.99%)"
                        value={stat.value || ''}
                        onChange={(e) => handleUpdateStat(i, 'value', e.target.value)}
                        className="w-1/3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-primary-600"
                      />
                      <input
                        type="text"
                        placeholder="Metric Label (e.g. Webhook SLA)"
                        value={stat.label || ''}
                        onChange={(e) => handleUpdateStat(i, 'label', e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStat(i)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 6: TECHNICAL SPECS REPEATER */}
            {activeTab === 'specs' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Technical Specifications (e.g. Supported Hardware, API protocol, Auth Method).
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <Plus size={14} /> Add Spec
                  </button>
                </div>

                {values.specs.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No technical specs added yet.
                  </div>
                ) : (
                  values.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Card Readers)"
                        value={spec.label || ''}
                        onChange={(e) => handleUpdateSpec(i, 'label', e.target.value)}
                        className="w-1/3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Spec Value (e.g. BBPOS WisePOS E, Verifone P400, M2)"
                        value={spec.value || ''}
                        onChange={(e) => handleUpdateSpec(i, 'value', e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(i)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Live Card Preview & Publishing Controls (4 Cols)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-6 w-full lg:sticky lg:top-4">
          {/* LIVE WEBSITE CARD PREVIEW */}
          <div className="rounded-2xl border border-primary-500/30 bg-slate-950 p-5 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary-400">
                <Sparkles className="w-4 h-4 text-[#FF4F00]" /> Live Website Card
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                {values.siteVariant}
              </span>
            </div>

            {/* Visual Card Replica */}
            <div className="relative p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-lg overflow-hidden">
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ backgroundColor: previewAccent }}
              />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 p-2 shadow-2xs"
                      style={{ borderLeftColor: previewAccent, borderLeftWidth: 3 }}
                    >
                      {!imgError && values.logoUrl ? (
                        <img
                          src={values.logoUrl}
                          alt={previewName}
                          className="w-full h-full object-contain"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <Icon className="w-5 h-5 text-slate-800" style={{ color: previewAccent }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-950 truncate">{previewName}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                        {previewCategory}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                    {values.syncSpeedIcon === 'live' ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ) : values.syncSpeedIcon === 'instant' ? (
                      <Zap size={10} className="text-amber-500" />
                    ) : (
                      <Clock size={10} className="text-blue-500" />
                    )}
                    <span className="truncate max-w-20">{values.syncSpeed || 'Real-Time'}</span>
                  </div>
                </div>

                {values.imageUrl && (
                  <div className="h-24 w-full flex items-center justify-center my-1 bg-slate-50 rounded-xl border border-slate-100 p-2">
                    <img
                      src={values.imageUrl}
                      alt={previewName}
                      className="max-h-20 w-auto object-contain"
                    />
                  </div>
                )}

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {values.description || 'Brief catalog description displayed on website cards...'}
                </p>

                {values.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                    {values.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80"
                      >
                        {tag}
                      </span>
                    ))}
                    {values.tags.length > 3 && (
                      <span className="text-[9px] text-slate-400">+{values.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick status flags display */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800 text-[10px]">
              {values.isActive ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ● Published Live
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  ○ Draft (Hidden)
                </span>
              )}
              {values.isPopular && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ★ Home Ticker
                </span>
              )}
              {values.showInNavbar && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  ⚡ Navbar Menu
                </span>
              )}
            </div>
          </div>

          {/* PUBLICATION & PLACEMENT SETTINGS */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Publication & Placement
            </h4>

            <div className="space-y-3.5">
              <ATMTextField
                name="sortOrder"
                label="Sort Order Index"
                type="number"
                value={String(values.sortOrder)}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <div className="pt-1">
                <ATMCheckbox
                  name="isActive"
                  label="Publish Live on Website"
                  checked={values.isActive}
                  onChange={(checked) => setFieldValue('isActive', checked)}
                />
              </div>

              <div>
                <ATMCheckbox
                  name="isPopular"
                  label="Highlight in Home Page Ticker"
                  checked={values.isPopular}
                  onChange={(checked) => setFieldValue('isPopular', checked)}
                />
              </div>

              <div>
                <ATMCheckbox
                  name="showInNavbar"
                  label="Show in Navbar MegaMenu"
                  checked={values.showInNavbar}
                  onChange={(checked) => setFieldValue('showInNavbar', checked)}
                />
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <ATMButton
              type="submit"
              variant="primary"
              className="w-full justify-center text-sm py-3"
              isLoading={isLoading || isSubmitting}
            >
              {isEdit ? 'Save Changes' : 'Create Integration'}
            </ATMButton>

            <ATMButton
              type="button"
              variant="secondary"
              className="w-full justify-center text-sm py-2.5"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </ATMButton>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default IntegrationForm;
