import React, { useState } from 'react';
import { Form, FormikProps } from 'formik';
import {
  Sparkles,
  Palette,
  FileText,
  HelpCircle,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Globe,
  Utensils,
  Store,
  Cloud,
  Coffee,
  ShoppingBag,
  ListOrdered,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ATMButton,
  ATMTextField,
  ATMSelectField,
  ATMCheckbox,
  ATMTextArea,
} from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { SolutionFormValues, KeyPoint, Workflow, SolutionFaq } from '../Model/SolutionTypes';

interface SolutionFormProps {
  formikProps: FormikProps<SolutionFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRESET_ICONS = [
  { value: 'Utensils', label: 'Utensils (Dining & Restaurant)' },
  { value: 'Store', label: 'Store (Retail, Mart & Grocery)' },
  { value: 'Cloud', label: 'Cloud (Multi-Store & Sync)' },
  { value: 'Coffee', label: 'Coffee (Café & Bakery)' },
  { value: 'ShoppingBag', label: 'ShoppingBag (Boutique & Fashion)' },
  { value: 'Layers', label: 'Layers (Enterprise & Platform)' },
];

const PRESET_CATEGORIES = [
  'RESTAURANT & FOODSERVICE SOFTWARE',
  'RETAIL & STORE SOFTWARE',
  'MULTI-STORE CLOUD CONTROL',
  'ENTERPRISE COMMERCE SYSTEMS',
];

export const SolutionForm: React.FC<SolutionFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } = formikProps;
  const [imgError, setImgError] = useState(false);
  const [previewTab, setPreviewTab] = useState<'megamenu' | 'landingPage'>('megamenu');

  const isPromo = values.itemType === 'PromoCard';

  // Helper to add/remove points
  const handleAddPoint = () => {
    setFieldValue('points', [...values.points, { title: '', desc: '' }]);
  };
  const handleRemovePoint = (index: number) => {
    setFieldValue('points', values.points.filter((_, i) => i !== index));
  };
  const handlePointChange = (index: number, field: 'title' | 'desc', val: string) => {
    const updated: KeyPoint[] = [...values.points];
    const prev = updated[index] || { title: '', desc: '' };
    updated[index] = {
      title: field === 'title' ? val : (prev.title || ''),
      desc: field === 'desc' ? val : (prev.desc || ''),
    };
    setFieldValue('points', updated);
  };

  // Helper to add/remove workflows
  const handleAddWorkflow = () => {
    setFieldValue('workflows', [...values.workflows, { title: '', desc: '' }]);
  };
  const handleRemoveWorkflow = (index: number) => {
    setFieldValue('workflows', values.workflows.filter((_, i) => i !== index));
  };
  const handleWorkflowChange = (index: number, field: 'title' | 'desc', val: string) => {
    const updated: Workflow[] = [...values.workflows];
    const prev = updated[index] || { title: '', desc: '' };
    updated[index] = {
      title: field === 'title' ? val : (prev.title || ''),
      desc: field === 'desc' ? val : (prev.desc || ''),
    };
    setFieldValue('workflows', updated);
  };

  // Helper to add/remove FAQs
  const handleAddFaq = () => {
    setFieldValue('faqs', [...values.faqs, { question: '', answer: '' }]);
  };
  const handleRemoveFaq = (index: number) => {
    setFieldValue('faqs', values.faqs.filter((_, i) => i !== index));
  };
  const handleFaqChange = (index: number, field: 'question' | 'answer', val: string) => {
    const updated: SolutionFaq[] = [...values.faqs];
    const prev = updated[index] || { question: '', answer: '' };
    updated[index] = {
      id: prev.id,
      question: field === 'question' ? val : (prev.question || ''),
      answer: field === 'answer' ? val : (prev.answer || ''),
    };
    setFieldValue('faqs', updated);
  };

  return (
    <Form className="w-full space-y-6">
      {/* 2-Column Responsive Full Width Layout (Matching IntegrationForm exactly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Main Form Inputs & Content Builders (8 Cols)                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6 w-full">
          {/* SECTION 1: ITEM TYPE & PURPOSE */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              1. MegaMenu Item Type & Architecture
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Option 1: PromoCard */}
              <button
                type="button"
                onClick={() => {
                  setFieldValue('itemType', 'PromoCard');
                  setFieldValue('isSubdomain', true);
                  if (!values.badge) setFieldValue('badge', 'RESTAURANT SOFTWARE');
                }}
                className={cn(
                  'flex flex-col text-left p-6 rounded-2xl border-2 transition-all cursor-pointer select-none relative shadow-xs hover:shadow-md min-h-[170px]',
                  isPromo
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/25 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30'
                )}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shadow-2xs">
                    <ExternalLink size={20} strokeWidth={2.5} />
                  </div>
                  {isPromo ? (
                    <span className="text-[11px] font-black uppercase text-amber-800 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/80 px-3 py-1 rounded-full shadow-2xs border border-amber-300/60 dark:border-amber-700">
                      ✓ Selected
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      Click to select
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 mt-auto">
                  <div className="text-base font-bold text-slate-900 dark:text-white font-syne">
                    Subdomain Promo Card (Left)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Navigates users out to standalone subdomain websites (<code className="font-mono font-bold text-amber-700 dark:text-amber-400">localhost:3002</code> / <code className="font-mono font-bold text-amber-700 dark:text-amber-400">localhost:3001</code>).
                  </p>
                </div>
              </button>

              {/* Option 2: SectorItem */}
              <button
                type="button"
                onClick={() => {
                  setFieldValue('itemType', 'SectorItem');
                  setFieldValue('isSubdomain', false);
                  if (!values.categoryTitle) setFieldValue('categoryTitle', 'RESTAURANT & FOODSERVICE SOFTWARE');
                  if (!values.slug) setFieldValue('slug', 'restaurants');
                }}
                className={cn(
                  'flex flex-col text-left p-6 rounded-2xl border-2 transition-all cursor-pointer select-none relative shadow-xs hover:shadow-md min-h-[170px]',
                  !isPromo
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/25 ring-2 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30'
                )}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 shadow-2xs">
                    <Layers size={20} strokeWidth={2.5} />
                  </div>
                  {!isPromo ? (
                    <span className="text-[11px] font-black uppercase text-primary-800 dark:text-primary-200 bg-primary-200/80 dark:bg-primary-900/80 px-3 py-1 rounded-full shadow-2xs border border-primary-300/60 dark:border-primary-700">
                      ✓ Selected
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      Click to select
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 mt-auto">
                  <div className="text-base font-bold text-slate-900 dark:text-white font-syne">
                    Sector Solution & Page (Right)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    Category item in dropdown that opens deep landing page (<code className="font-mono font-bold text-primary-700 dark:text-primary-400">/solutions/[slug]</code>) with 3 Points, 6 Workflows & FAQs.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: MEGAMENU CORE DISPLAY */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              2. MegaMenu Display Details
            </h4>

            <div className="space-y-4">
              <ATMTextField
                name="title"
                label="Item Title"
                placeholder={isPromo ? "e.g. Restaurant POS & Kitchen Screens" : "e.g. Restaurant POS System"}
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && errors.title ? errors.title : undefined}
                required
              />

              <ATMTextArea
                name="description"
                label="Dropdown Subtitle / Description"
                placeholder="Short description displayed inside the mega menu dropdown..."
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={2}
                maxLength={400}
                showCount
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ATMTextField
                  name="badge"
                  label="Badge Pill (e.g. RESTAURANT SOFTWARE)"
                  placeholder="e.g. RESTAURANT SOFTWARE or RETAIL SOFTWARE"
                  value={values.badge}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <ATMTextField
                  name="imageUrl"
                  label="Hardware / Bundle Image URL"
                  placeholder="/images/nav_restaurant_bundle.png"
                  value={values.imageUrl}
                  onChange={(e) => {
                    handleChange(e);
                    setImgError(false);
                  }}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: NAVIGATION & DESTINATION */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              {isPromo ? <Globe className="w-4 h-4 text-amber-500" /> : <Layers className="w-4 h-4 text-primary-600" />}
              3. {isPromo ? 'Subdomain External Link Settings' : 'Sector Category & Target Route'}
            </h4>

            {isPromo ? (
              <div className="space-y-4">
                <ATMTextField
                  name="externalUrl"
                  label="External Subdomain Target URL"
                  placeholder="http://localhost:3002 or https://restaurant.quantix.com"
                  value={values.externalUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  helperText="When clicked in navbar, visitor navigates out to this standalone subdomain website."
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <ATMTextField
                    name="ctaText"
                    label="Card CTA Label"
                    placeholder="Visit Restaurant Site"
                    value={values.ctaText}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <div className="pt-5">
                    <ATMCheckbox
                      name="isSubdomain"
                      label="Show [↗ Subdomain] Badge in Dropdown"
                      checked={values.isSubdomain}
                      onChange={(checked) => setFieldValue('isSubdomain', checked)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <ATMTextField
                    name="categoryTitle"
                    label="Right-Side Category Header"
                    placeholder="e.g. RESTAURANT & FOODSERVICE SOFTWARE"
                    value={values.categoryTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {PRESET_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFieldValue('categoryTitle', cat)}
                        className="text-[10px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                      >
                        + {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ATMTextField
                    name="slug"
                    label="Landing Page Slug (/solutions/[slug])"
                    placeholder="e.g. restaurants or grocery"
                    value={values.slug}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={`Route: /solutions/${values.slug || 'restaurants'}`}
                    required
                  />

                  <ATMSelectField
                    name="iconKey"
                    label="Sector Lucide Icon"
                    value={values.iconKey}
                    onChange={(val) => setFieldValue('iconKey', String(val || 'Utensils'))}
                    options={PRESET_ICONS}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: LANDING PAGE DEEP DATA (Only for Sector Items) */}
          {!isPromo && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-6">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  4. Landing Page Deep Content (/solutions/{values.slug || '...'})
                </h4>
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-0.5 rounded-full border border-primary-200/60">
                  Full Page Data
                </span>
              </div>

              {/* Landing Page Hero Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ATMTextField
                    name="eyebrow"
                    label="Page Eyebrow Text"
                    placeholder="e.g. Full-Service & Dine-In Hospitality"
                    value={values.eyebrow}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <ATMTextField
                    name="heroTitle"
                    label="Page Hero Headline (H1)"
                    placeholder="e.g. Enterprise Restaurant POS & Table Management"
                    value={values.heroTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                <ATMTextArea
                  name="heroDescription"
                  label="Landing Page Detailed Overview"
                  placeholder="Empower dining operations with multi-room visual floor plans, course-paced kitchen firing..."
                  value={values.heroDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  maxLength={800}
                  showCount
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ATMTextField
                    name="topBadge"
                    label="Top Badge"
                    placeholder="e.g. Dine-In POS"
                    value={values.topBadge}
                    onChange={handleChange}
                  />
                  <ATMTextField
                    name="bottomBadge"
                    label="Bottom Badge"
                    placeholder="e.g. Multi-Table Flow"
                    value={values.bottomBadge}
                    onChange={handleChange}
                  />
                  <ATMTextField
                    name="ctaLabel"
                    label="Page CTA Button"
                    placeholder="Book Walkthrough"
                    value={values.ctaLabel}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* 3 Key Value Points Repeater */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ListOrdered size={14} className="text-primary-500" />
                      Key Value Propositions ({values.points.length})
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Highlight the 3 core features shown under the hero.</p>
                  </div>
                  <ATMButton
                    type="button"
                    variant="secondary"
                    onClick={handleAddPoint}
                    className="text-xs py-1.5 px-3 gap-1.5 font-bold"
                  >
                    <Plus size={13} /> Add Point
                  </ATMButton>
                </div>

                <div className="space-y-3">
                  {values.points.map((pt, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded">
                          Point #{pIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(pIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                          title="Remove point"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <ATMTextField
                        name={`point-title-${pIdx}`}
                        label="Point Title"
                        placeholder="e.g. Course-Paced Ticket Routing"
                        value={pt.title}
                        onChange={(e) => handlePointChange(pIdx, 'title', e.target.value)}
                      />

                      <ATMTextArea
                        name={`point-desc-${pIdx}`}
                        label="Point Description"
                        placeholder="Fire starters, mains, and desserts in synchronized sequences..."
                        value={pt.desc}
                        onChange={(e) => handlePointChange(pIdx, 'desc', e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 6 Bento Operational Workflows Repeater */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-primary-500" />
                      Bento Operational Workflows ({values.workflows.length})
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">6 interactive operational workflows displayed in the bento grid.</p>
                  </div>
                  <ATMButton
                    type="button"
                    variant="secondary"
                    onClick={handleAddWorkflow}
                    className="text-xs py-1.5 px-3 gap-1.5 font-bold"
                  >
                    <Plus size={13} /> Add Workflow
                  </ATMButton>
                </div>

                <div className="space-y-3">
                  {values.workflows.map((wf, wIdx) => (
                    <div
                      key={wIdx}
                      className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded">
                          Workflow #{wIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkflow(wIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                          title="Remove workflow"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <ATMTextField
                        name={`wf-title-${wIdx}`}
                        label="Workflow Title"
                        placeholder="e.g. Visual Floor Plan Management"
                        value={wf.title}
                        onChange={(e) => handleWorkflowChange(wIdx, 'title', e.target.value)}
                      />

                      <ATMTextArea
                        name={`wf-desc-${wIdx}`}
                        label="Workflow Explanation"
                        placeholder="Manage multi-room dining layouts, seat occupancy timers..."
                        value={wf.desc}
                        onChange={(e) => handleWorkflowChange(wIdx, 'desc', e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector FAQs Repeater */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-primary-500" />
                      Sector FAQs ({values.faqs.length})
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Frequently asked questions specific to this sector.</p>
                  </div>
                  <ATMButton
                    type="button"
                    variant="secondary"
                    onClick={handleAddFaq}
                    className="text-xs py-1.5 px-3 gap-1.5 font-bold"
                  >
                    <Plus size={13} /> Add FAQ
                  </ATMButton>
                </div>

                <div className="space-y-3">
                  {values.faqs.map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded">
                          Question #{fIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(fIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                          title="Remove FAQ"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <ATMTextField
                        name={`faq-q-${fIdx}`}
                        label="Question"
                        placeholder="e.g. Can tickets be routed to separate kitchen display screens?"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(fIdx, 'question', e.target.value)}
                      />

                      <ATMTextArea
                        name={`faq-a-${fIdx}`}
                        label="Detailed Answer"
                        placeholder="Yes, orders automatically split items between cold prep, fryer..."
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(fIdx, 'answer', e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Sticky Live Preview, Status & Form Actions (4 Cols)          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* LIVE PREVIEW CONTAINER */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-900 p-5 shadow-lg text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Live Preview
              </span>
              {!isPromo && (
                <div className="inline-flex p-0.5 rounded-lg bg-slate-800 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('megamenu')}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                      previewTab === 'megamenu' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    MegaMenu
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('landingPage')}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                      previewTab === 'landingPage' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Landing Page
                  </button>
                </div>
              )}
            </div>

            {/* Preview Body */}
            {(isPromo || previewTab === 'megamenu') ? (
              // MegaMenu Preview Card
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Navbar Solutions Dropdown
                </div>

                {isPromo ? (
                  <div className="relative flex items-center gap-3.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    {values.isSubdomain && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          <ExternalLink size={9} /> Subdomain
                        </span>
                      </div>
                    )}

                    <div className="relative w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center p-1 shrink-0">
                      {values.imageUrl && !imgError ? (
                        <img src={values.imageUrl} alt={values.title} onError={() => setImgError(true)} className="max-h-full object-contain" />
                      ) : (
                        <ImageIcon size={20} className="text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1 min-w-0 pr-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/30">
                        {values.badge || 'SOFTWARE BUNDLE'}
                      </span>
                      <div className="text-xs font-bold text-white truncate">
                        {values.title || 'Restaurant POS & Kitchen Screens'}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {values.description || 'Table floor mapping, tableside ordering, kitchen display screens.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-primary-400 tracking-wider border-b border-slate-800 pb-1">
                      • {values.categoryTitle || 'RESTAURANT & FOODSERVICE SOFTWARE'}
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-primary-500/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
                          <Utensils size={14} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{values.title || 'Restaurant POS System'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{values.description || 'Table floor plans & kitchen orders'}</div>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-primary-400 shrink-0" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Landing Page Preview
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest">
                  // {values.eyebrow || 'Full-Service Hospitality'}
                </span>
                <div className="text-sm font-black text-white leading-snug">
                  {values.heroTitle || values.title || 'Enterprise Restaurant POS & Table Management'}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                  {values.heroDescription || values.description || 'Empower dining operations with floor plans and KDS.'}
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{values.points.length} Points</span>
                  <span>{values.workflows.length} Workflows</span>
                  <span>{values.faqs.length} FAQs</span>
                </div>
              </div>
            )}
          </div>

          {/* PUBLICATION & PLACEMENT SETTINGS */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Publication & Placement
            </h4>

            <div className="space-y-4">
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
            </div>
          </div>

          {/* FORM ACTION BUTTONS */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <ATMButton
              type="submit"
              variant="primary"
              className="w-full justify-center text-sm py-3 font-bold"
              isLoading={isLoading || isSubmitting}
            >
              {isEdit ? 'Save Changes' : 'Create Solution'}
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

export default SolutionForm;
