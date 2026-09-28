import React, { useState } from 'react';
import { Form, FormikProps } from 'formik';
import {
  Sparkles,
  Palette,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Navigation,
  Eye,
  EyeOff,
  Layers,
  Store,
  Boxes,
  ChefHat,
  LineChart,
  Zap,
  ShoppingBag,
  Shirt,
  Smartphone,
  CheckCircle2,
  Cpu,
  ArrowRight,
  TrendingUp,
  Tag,
  Split,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  ATMButton,
  ATMTextField,
  ATMSelectField,
  ATMCheckbox,
  ATMTextArea,
} from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type {
  SavePlatformFeatureDto,
  FeatureCapability,
  FeatureWorkflowStep,
  FeatureFaq,
} from '../Model/FeatureTypes';

interface FeatureFormProps {
  formikProps: FormikProps<SavePlatformFeatureDto>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

const SITE_VARIANTS = [
  { value: 'Enterprise', label: 'Enterprise Platform' },
  { value: 'Restaurant', label: 'Restaurant Website' },
  { value: 'Retail', label: 'Retail Website' },
];

const AVAILABLE_CATEGORIES = [
  { value: 'Storefront', label: 'Storefront Checkout & Mesh POS' },
  { value: 'Inventory', label: 'Supply Chain, Warehouse & Par Levels' },
  { value: 'Kitchen', label: 'Kitchen Display System & Bump Bars' },
  { value: 'Analytics', label: 'Executive Telemetry, BI & GMV' },
  { value: 'Omnichannel', label: 'Omnichannel & Mobile Ordering' },
  { value: 'Payments', label: 'Payments & Hardware Terminals' },
  { value: 'Loyalty', label: 'Loyalty, Rewards & Retention' },
];

const PRESET_ICONS = [
  { key: 'Store', label: 'Store POS', icon: Store },
  { key: 'Boxes', label: 'Inventory', icon: Boxes },
  { key: 'ChefHat', label: 'Kitchen KDS', icon: ChefHat },
  { key: 'LineChart', label: 'Analytics BI', icon: LineChart },
  { key: 'Zap', label: 'Fast Checkout', icon: Zap },
  { key: 'ShoppingBag', label: 'Grocer / Market', icon: ShoppingBag },
  { key: 'Shirt', label: 'Fashion Retail', icon: Shirt },
  { key: 'Smartphone', label: 'Mobile / Kiosk', icon: Smartphone },
  { key: 'Navigation', label: 'Dispatch', icon: Navigation },
  { key: 'Sparkles', label: 'Smart AI', icon: Sparkles },
];

const PRESET_COLORS = [
  { label: 'Quantix Orange', class: 'text-[#FF4F00]', bg: 'bg-[#FF4F00]' },
  { label: 'Emerald Green', class: 'text-emerald-500', bg: 'bg-emerald-500' },
  { label: 'Amber Gold', class: 'text-amber-500', bg: 'bg-amber-500' },
  { label: 'Sky Blue', class: 'text-sky-500', bg: 'bg-sky-500' },
  { label: 'Indigo Purple', class: 'text-indigo-500', bg: 'bg-indigo-500' },
  { label: 'Rose Pink', class: 'text-rose-500', bg: 'bg-rose-500' },
  { label: 'Teal Cyan', class: 'text-teal-500', bg: 'bg-teal-500' },
  { label: 'Violet Deep', class: 'text-violet-500', bg: 'bg-violet-500' },
];

export const FeatureForm: React.FC<FeatureFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } =
    formikProps;

  const [activeTab, setActiveTab] = useState<'capabilities' | 'workflows' | 'faqs' | 'integrations'>('capabilities');
  const [imgError, setImgError] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Auto-slug generator on Title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    if (!isEdit && !values.slug) {
      const generatedSlug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFieldValue('slug', generatedSlug);
    }
  };

  // Bullets Handlers
  const handleAddBullet = () => {
    setFieldValue('bullets', [...(values.bullets || []), '']);
  };
  const handleRemoveBullet = (idx: number) => {
    setFieldValue(
      'bullets',
      (values.bullets || []).filter((_, i) => i !== idx)
    );
  };
  const handleBulletChange = (idx: number, val: string) => {
    const list = [...(values.bullets || [])];
    list[idx] = val;
    setFieldValue('bullets', list);
  };

  // Key Capabilities Handlers
  const handleAddCapability = () => {
    setFieldValue('keyCapabilities', [
      ...(values.keyCapabilities || []),
      { title: '', desc: '', iconKey: 'Store' },
    ]);
  };
  const handleRemoveCapability = (idx: number) => {
    setFieldValue(
      'keyCapabilities',
      (values.keyCapabilities || []).filter((_, i) => i !== idx)
    );
  };
  const handleCapabilityChange = (
    idx: number,
    field: keyof FeatureCapability,
    val: string
  ) => {
    const list: FeatureCapability[] = [...(values.keyCapabilities || [])];
    const item = { ...(list[idx] || { title: '', desc: '' }), [field]: val };
    list[idx] = item;
    setFieldValue('keyCapabilities', list);
  };

  // Workflows Handlers
  const handleAddWorkflow = () => {
    const nextStepNum = String((values.workflows || []).length + 1).padStart(2, '0');
    setFieldValue('workflows', [
      ...(values.workflows || []),
      { stepNumber: nextStepNum, title: '', desc: '' },
    ]);
  };
  const handleRemoveWorkflow = (idx: number) => {
    setFieldValue(
      'workflows',
      (values.workflows || []).filter((_, i) => i !== idx)
    );
  };
  const handleWorkflowChange = (
    idx: number,
    field: keyof FeatureWorkflowStep,
    val: string
  ) => {
    const list: FeatureWorkflowStep[] = [...(values.workflows || [])];
    const item = { ...(list[idx] || { stepNumber: '01', title: '', desc: '' }), [field]: val };
    list[idx] = item;
    setFieldValue('workflows', list);
  };

  // FAQs Handlers
  const handleAddFaq = () => {
    setFieldValue('faqs', [
      ...(values.faqs || []),
      { id: `faq-${Date.now()}`, question: '', answer: '' },
    ]);
  };
  const handleRemoveFaq = (idx: number) => {
    setFieldValue(
      'faqs',
      (values.faqs || []).filter((_, i) => i !== idx)
    );
  };
  const handleFaqChange = (
    idx: number,
    field: 'question' | 'answer',
    val: string
  ) => {
    const list: FeatureFaq[] = [...(values.faqs || [])];
    const item = { ...(list[idx] || { id: `faq-${idx}`, question: '', answer: '' }), [field]: val };
    list[idx] = item;
    setFieldValue('faqs', list);
  };

  // Related Integrations Tags Handlers
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase();
    if (clean && !(values.relatedIntegrations || []).includes(clean)) {
      setFieldValue('relatedIntegrations', [...(values.relatedIntegrations || []), clean]);
      setTagInput('');
    }
  };
  const handleRemoveTag = (tag: string) => {
    setFieldValue(
      'relatedIntegrations',
      (values.relatedIntegrations || []).filter((t) => t !== tag)
    );
  };

  // Icon Resolution
  const selectedIconObj = PRESET_ICONS.find(
    (i) => i.key.toLowerCase() === (values.iconKey || '').toLowerCase()
  ) ?? PRESET_ICONS[0];
  const CurrentIcon = selectedIconObj?.icon ?? Store;

  return (
    <Form className="w-full space-y-6">
      {/* 2-Column Responsive Full Width Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Main Form Inputs & Content Builders (8 Cols)                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6 w-full">
          {/* SECTION 1: TARGET PLATFORM & CORE IDENTITY */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Cpu className="w-4 h-4 text-[#FF4F00]" /> Target Platform & Core Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMSelectField
                name="siteVariant"
                label="Target Platform Website"
                value={values.siteVariant}
                onChange={(val) => setFieldValue('siteVariant', String(val || 'Enterprise'))}
                options={SITE_VARIANTS}
                required
              />

              <ATMSelectField
                name="category"
                label="Feature Category"
                value={values.category}
                onChange={(val) => {
                  const cat = String(val || 'Storefront');
                  setFieldValue('category', cat);
                  if (!values.subtitle) {
                    const found = AVAILABLE_CATEGORIES.find((c) => c.value === cat);
                    if (found?.label) {
                      setFieldValue('subtitle', found.label.split('&')[0]?.trim() || '');
                    }
                  }
                }}
                options={AVAILABLE_CATEGORIES}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="title"
                label="Feature Title"
                placeholder="e.g. Cloud POS & Mesh Tills"
                value={values.title}
                onChange={handleTitleChange}
                onBlur={handleBlur}
                required
              />

              <ATMTextField
                name="slug"
                label="URL Slug"
                placeholder="e.g. cloud-pos or kitchen-kds"
                value={values.slug}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
            </div>

            <div>
              <ATMTextField
                name="subtitle"
                label="Feature Subtitle / Category Pill"
                placeholder="e.g. Storefront Checkout or Enterprise Supply Chain"
                value={values.subtitle || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* SECTION 2: ICONOGRAPHY, COLOR ACCENTS & NUMBERING */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Palette className="w-4 h-4 text-[#FF4F00]" /> Visual Iconography & Color Styling
            </h4>

            {/* Visual Icon Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Select Feature Icon
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {PRESET_ICONS.map((item) => {
                  const Ico = item.icon;
                  const isSelected = (values.iconKey || '').toLowerCase() === item.key.toLowerCase();
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFieldValue('iconKey', item.key)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left',
                        isSelected
                          ? 'border-[#FF4F00] bg-orange-500/10 text-[#FF4F00] shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      <Ico className={cn('w-4 h-4 shrink-0', isSelected ? 'text-[#FF4F00]' : 'text-slate-500')} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Accent Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2">
              <div>
                <ATMTextField
                  name="iconColor"
                  label="Icon Color Accent (Tailwind Class)"
                  placeholder="e.g. text-[#FF4F00] or text-emerald-500"
                  value={values.iconColor || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.class}
                      type="button"
                      onClick={() => setFieldValue('iconColor', col.class)}
                      className={cn(
                        'w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 hover:scale-125 transition-transform cursor-pointer shadow-xs',
                        col.bg
                      )}
                      title={col.label}
                    />
                  ))}
                </div>
              </div>

              <ATMTextField
                name="numberLabel"
                label="Number Badge Label"
                placeholder="e.g. 01, 02, 03, or PRO"
                value={values.numberLabel || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* SECTION 3: SHOWCASE & BENTO GRID CARD CONTENT */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Layers className="w-4 h-4 text-[#FF4F00]" /> Bento Grid Showcase & Copy
            </h4>

            <div>
              <ATMTextArea
                name="shortDescription"
                label="Short Description (Displays on Bento Grid & Hover Cards)"
                placeholder="Sub-second multi-store register sync with 100% LAN mesh offline billing."
                value={values.shortDescription || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={2}
                maxLength={400}
              />
            </div>

            <div>
              <ATMTextArea
                name="fullDescription"
                label="Full Description (Displays on Feature Overview & Single Landing Pages)"
                placeholder="Maintain strict menu, pricing, and promotional consistency across 500+ franchise branches or retail stores with sub-second sync and offline resilience."
                value={values.fullDescription || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                maxLength={1500}
              />
            </div>

            {/* Stat Value & Label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="statValue"
                label="Stat Metric Value"
                placeholder="e.g. < 2.4s, -42%, 99.99%, or Sub-Second"
                value={values.statValue || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ATMTextField
                name="statLabel"
                label="Stat Metric Label"
                placeholder="e.g. Global Mesh Sync or Avg Ticket Latency"
                value={values.statLabel || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            {/* Image & Overlay Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="imageUrl"
                label="Hardware / Screenshot Image URL"
                placeholder="/images/ent_global_pos_bundle.png"
                value={values.imageUrl || ''}
                onChange={(e) => {
                  setImgError(false);
                  handleChange(e);
                }}
                onBlur={handleBlur}
              />

              <ATMTextField
                name="imageAlt"
                label="Image Alt Text"
                placeholder="e.g. Dual-Screen POS Till Hardware"
                value={values.imageAlt || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="topBadge"
                label="Top Overlay Badge"
                placeholder="e.g. Dual-Screen POS or Smart Prep Pacing"
                value={values.topBadge || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ATMTextField
                name="bottomBadge"
                label="Bottom Overlay Badge"
                placeholder="e.g. Auto-Sync Active or Multi-Channel Route"
                value={values.bottomBadge || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            {/* CTA Text & Href */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="ctaText"
                label="CTA Button Text"
                placeholder="e.g. Explore Feature Architecture"
                value={values.ctaText || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ATMTextField
                name="ctaHref"
                label="CTA Link URL"
                placeholder="e.g. /features/cloud-pos"
                value={values.ctaHref || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* SECTION 4: HIGHLIGHTS & KEY BULLETS BUILDER */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF4F00]" /> Feature Highlights / Bullets ({(values.bullets || []).length})
              </h4>
              <button
                type="button"
                onClick={handleAddBullet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-[#FF4F00] hover:bg-orange-500/20 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus size={14} /> Add Bullet
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Key takeaway bullet points rendered inside the Bento Grid card and detail header.
            </p>

            <div className="space-y-3 pt-2">
              {(values.bullets || []).length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                  No bullet highlights configured. Click "+ Add Bullet" to create your first item.
                </div>
              ) : (
                (values.bullets || []).map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(idx, e.target.value)}
                      placeholder="e.g. Offline-first mesh network keeps registers ringing during WAN drops."
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FF4F00]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Remove Bullet"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 5: DEEP DETAIL LANDING PAGE CONTENT (TABBED BUILDER) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-4 h-4 text-[#FF4F00]" /> Deep Landing Page Content & Architecture
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="heroHeadline"
                label="Landing Page Hero Headline"
                placeholder="e.g. Resilient Offline-First Cloud POS Architecture"
                value={values.heroHeadline || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ATMTextField
                name="heroSubheadline"
                label="Landing Page Hero Subheadline"
                placeholder="e.g. Engineered for high-volume enterprises that cannot afford downtime."
                value={values.heroSubheadline || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            {/* Inner Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('capabilities')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'capabilities'
                    ? 'bg-[#FF4F00] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Zap size={13} /> Capabilities ({(values.keyCapabilities || []).length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('workflows')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'workflows'
                    ? 'bg-[#FF4F00] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Split size={13} /> Workflows ({(values.workflows || []).length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('faqs')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'faqs'
                    ? 'bg-[#FF4F00] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <HelpCircle size={13} /> FAQs ({(values.faqs || []).length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('integrations')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  activeTab === 'integrations'
                    ? 'bg-[#FF4F00] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Tag size={13} /> Related Connectors ({(values.relatedIntegrations || []).length})
              </button>
            </div>

            {/* TAB: CAPABILITIES */}
            {activeTab === 'capabilities' && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Architectural capability pillars displayed on the feature detail page.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCapability}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4F00] hover:underline cursor-pointer"
                  >
                    <Plus size={14} /> Add Capability
                  </button>
                </div>

                {(values.keyCapabilities || []).length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No capabilities added yet.
                  </div>
                ) : (
                  (values.keyCapabilities || []).map((cap, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          placeholder="Capability Title (e.g. Peer-to-Peer LAN Mesh)"
                          value={cap.title || ''}
                          onChange={(e) => handleCapabilityChange(i, 'title', e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCapability(i)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        placeholder="Capability Description (e.g. Registers communicate directly over Wi-Fi when WAN cuts)."
                        value={cap.desc || ''}
                        onChange={(e) => handleCapabilityChange(i, 'desc', e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: WORKFLOWS */}
            {activeTab === 'workflows' && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Step-by-step operator walkthrough flow for this feature capability.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddWorkflow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4F00] hover:underline cursor-pointer"
                  >
                    <Plus size={14} /> Add Step
                  </button>
                </div>

                {(values.workflows || []).length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No workflow steps added yet.
                  </div>
                ) : (
                  (values.workflows || []).map((wf, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="01"
                          value={wf.stepNumber || ''}
                          onChange={(e) => handleWorkflowChange(i, 'stepNumber', e.target.value)}
                          className="w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-mono font-bold text-[#FF4F00] text-center"
                        />
                        <input
                          type="text"
                          placeholder="Step Title (e.g. Register Pairing)"
                          value={wf.title || ''}
                          onChange={(e) => handleWorkflowChange(i, 'title', e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkflow(i)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        placeholder="Step Description (e.g. Pair countertop tills and pinpads automatically via standard discovery)."
                        value={wf.desc || ''}
                        onChange={(e) => handleWorkflowChange(i, 'desc', e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: FAQS */}
            {activeTab === 'faqs' && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Frequently asked technical questions answered for this feature.
                  </span>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4F00] hover:underline cursor-pointer"
                  >
                    <Plus size={14} /> Add FAQ
                  </button>
                </div>

                {(values.faqs || []).length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    No FAQs added yet.
                  </div>
                ) : (
                  (values.faqs || []).map((faq, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          placeholder="Question (e.g. Does this feature work offline?)"
                          value={faq.question || ''}
                          onChange={(e) => handleFaqChange(i, 'question', e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(i)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        placeholder="Answer (e.g. Yes, all register transactions queue locally during WAN cuts and auto-sync when online)."
                        value={faq.answer || ''}
                        onChange={(e) => handleFaqChange(i, 'answer', e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: RELATED INTEGRATIONS */}
            {activeTab === 'integrations' && (
              <div className="space-y-4 pt-1">
                <span className="text-xs text-slate-500 block">
                  Add integration partner slugs related to this capability (e.g. stripe, quickbooks, door-dash).
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Enter integration slug (e.g. stripe) and press Enter"
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(values.relatedIntegrations || []).length === 0 ? (
                    <span className="text-xs text-slate-400">No related integrations mapped.</span>
                  ) : (
                    (values.relatedIntegrations || []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-500"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Live Card Preview & Publishing Controls (4 Cols)            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-6 w-full lg:sticky lg:top-4">
          {/* LIVE WEBSITE BENTO GRID PREVIEW */}
          <div className="rounded-2xl border border-orange-500/30 bg-slate-950 p-5 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                <Sparkles className="w-4 h-4 text-[#FF4F00]" /> Live Bento Card Preview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                {values.siteVariant}
              </span>
            </div>

            {/* Bento Grid Card Replica */}
            <div className="relative rounded-2xl border border-slate-800 bg-[#13151a]/95 p-5 text-white shadow-2xl overflow-hidden space-y-4">
              {/* Top Row: Number, Title, Icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#FF4F00] bg-orange-500/10 px-2 py-0.5 rounded-md">
                      {values.numberLabel || '01'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                      {values.subtitle || values.category || 'FEATURE'}
                    </span>
                  </div>
                  <h3 className="font-syne font-bold text-base text-white tracking-tight leading-snug">
                    {values.title || 'Feature Title'}
                  </h3>
                </div>

                <div className={cn('p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0', values.iconColor || 'text-[#FF4F00]')}>
                  <CurrentIcon size={20} />
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {values.shortDescription || 'Short description summary of this feature capability...'}
              </p>

              {/* Image Preview with Badges */}
              {values.imageUrl && (
                <div className="relative rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden my-2">
                  {values.topBadge && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-orange-400 border border-orange-500/30">
                      {values.topBadge}
                    </div>
                  )}

                  {!imgError ? (
                    <img
                      src={values.imageUrl}
                      alt={values.imageAlt || values.title}
                      className="w-full h-36 object-contain p-2"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
                      Image Preview Unavailable
                    </div>
                  )}

                  {values.bottomBadge && (
                    <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      {values.bottomBadge}
                    </div>
                  )}
                </div>
              )}

              {/* Stat Metric Highlight Pill */}
              {(values.statValue || values.statLabel) && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs">
                  <span className="font-bold text-[#FF4F00]">{values.statValue || 'N/A'}</span>
                  <span className="text-[11px] text-slate-300 font-medium">{values.statLabel || 'Metric'}</span>
                </div>
              )}

              {/* Bullets Preview */}
              {(values.bullets || []).filter(Boolean).length > 0 && (
                <ul className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  {(values.bullets || []).filter(Boolean).slice(0, 3).map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F00] mt-1.5 shrink-0" />
                      <span className="line-clamp-1">{b}</span>
                    </li>
                  ))}
                  {(values.bullets || []).filter(Boolean).length > 3 && (
                    <li className="text-[10px] text-slate-500">
                      +{(values.bullets || []).filter(Boolean).length - 3} more capabilities
                    </li>
                  )}
                </ul>
              )}

              {/* CTA Preview */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-[#FF4F00] font-bold">
                <span>{values.ctaText || 'Explore Architecture'}</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Quick Badges in Preview Header */}
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
              {values.showInNavbar && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  ⚡ Navbar MegaMenu
                </span>
              )}
              {values.showOnHomepage && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ★ Homepage Bento
                </span>
              )}
              {values.isFeatured && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  ◆ Featured
                </span>
              )}
            </div>
          </div>

          {/* PUBLICATION & PLACEMENT SETTINGS */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-[#FF4F00]" /> Publication & Placement
            </h4>

            <div className="space-y-3.5">
              <ATMTextField
                name="sortOrder"
                label="Sort Order Index"
                type="number"
                value={String(values.sortOrder ?? 1)}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <ATMTextField
                name="navbarBadge"
                label="Navbar Badge Pill"
                placeholder="e.g. HOT, NEW, 100% Offline"
                value={values.navbarBadge || ''}
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
                  name="showInNavbar"
                  label="Show in Navbar Features Dropdown"
                  checked={values.showInNavbar}
                  onChange={(checked) => setFieldValue('showInNavbar', checked)}
                />
              </div>

              <div>
                <ATMCheckbox
                  name="showOnHomepage"
                  label="Show on Homepage Bento Grid"
                  checked={values.showOnHomepage}
                  onChange={(checked) => setFieldValue('showOnHomepage', checked)}
                />
              </div>

              <div>
                <ATMCheckbox
                  name="isFeatured"
                  label="Feature as Hero Highlight"
                  checked={values.isFeatured}
                  onChange={(checked) => setFieldValue('isFeatured', checked)}
                />
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <ATMButton
              type="submit"
              variant="primary"
              className="w-full py-3 bg-[#FF4F00] hover:bg-[#e04500] text-white font-syne font-bold text-sm shadow-lg shadow-orange-500/20"
              isLoading={isLoading || isSubmitting}
            >
              {isEdit ? 'Save Changes' : 'Publish Feature'}
            </ATMButton>

            <ATMButton
              type="button"
              variant="secondary"
              className="w-full py-2.5 text-xs font-bold"
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
