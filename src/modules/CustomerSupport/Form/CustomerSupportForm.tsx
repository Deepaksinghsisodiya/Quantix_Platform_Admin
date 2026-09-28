import React from 'react';
import { Form, FormikProps } from 'formik';
import {
  Headphones,
  Sparkles,
  Building2,
  Utensils,
  Store,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  Zap,
  CheckCircle2,
  ImageIcon,
  type LucideIcon,
} from 'lucide-react';
import {
  ATMButton,
  ATMTextField,
  ATMTextArea,
  ATMCheckbox,
} from '@/shared/ui';
import { ATMFormHeaderActions } from '@/shared/components/ATMFormHeaderActions';
import { cn } from '@/lib/utils/cn';
import type { SupportPillar } from '../Model/CustomerSupportTypes';

export interface CustomerSupportFormValues {
  siteVariant: string;
  pillBadge: string;
  mainTitle: string;
  highlightWord: string;
  description: string;
  pillars: SupportPillar[];
  repName: string;
  repRole: string;
  repAvatarUrl: string;
  responseTimeBadge: string;
  directPhone: string;
  directEmail: string;
  liveChatStatus: string;
  chatButtonText: string;
  isActive: boolean;
}

interface CustomerSupportFormProps {
  formikProps: FormikProps<CustomerSupportFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
}

export const CustomerSupportForm: React.FC<CustomerSupportFormProps> = ({
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

  const pillarIconOptions = [
    { id: 'Headphones', label: 'Support Headset', icon: Headphones },
    { id: 'Clock', label: 'Fast Response Timer', icon: Clock },
    { id: 'ShieldCheck', label: 'Uptime / Guarantee', icon: ShieldCheck },
    { id: 'Phone', label: 'Direct Hotline', icon: Phone },
    { id: 'Zap', label: 'Instant Triage', icon: Zap },
  ];

  const handleAddPillar = () => {
    if (values.pillars.length >= 4) return;
    const newPillars = [
      ...values.pillars,
      {
        iconKey: 'Headphones',
        title: 'New Support Guarantee',
        desc: 'Describe this technical capability or SLA resolution.',
      },
    ];
    setFieldValue('pillars', newPillars);
  };

  const handleRemovePillar = (index: number) => {
    const newPillars = values.pillars.filter((_, i) => i !== index);
    setFieldValue('pillars', newPillars);
  };

  const handleUpdatePillar = (
    index: number,
    field: 'iconKey' | 'title' | 'desc',
    val: string
  ) => {
    const updated = values.pillars.map((p, i) =>
      i === index ? { ...p, [field]: val } : p
    );
    setFieldValue('pillars', updated);
  };

  const renderPillarIcon = (iconKey?: string): LucideIcon => {
    switch (iconKey?.toLowerCase()) {
      case 'clock':
        return Clock;
      case 'shieldcheck':
      case 'shield':
        return ShieldCheck;
      case 'phone':
        return Phone;
      case 'zap':
        return Zap;
      default:
        return Headphones;
    }
  };

  return (
    <Form id="customer-support-form" className="space-y-6 max-w-[1600px] mx-auto">
      <ATMFormHeaderActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isEdit={isEdit}
        submitLabel={isEdit ? 'Save Changes' : 'Publish Support Desk'}
        formId="customer-support-form"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* ── LEFT COLUMN (8 COLS): Configuration Cards ──────────────────────────── */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Storefront Platform Selector */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Headphones size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-syne">
                    1. Storefront Platform Desk
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select which storefront website this customer support section is built for.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {siteVariants.map((variant) => {
                const VIcon = variant.icon;
                const isSelected =
                  values.siteVariant.toLowerCase() === variant.id.toLowerCase();
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      setFieldValue('siteVariant', variant.id);
                      if (!isEdit) {
                        setFieldValue(
                          'mainTitle',
                          `24/7 Dedicated ${variant.id}`
                        );
                        setFieldValue('highlightWord', 'Technical Support');
                      }
                    }}
                    className={cn(
                      'flex flex-col text-left p-5 rounded-2xl border-2 transition-all cursor-pointer select-none relative shadow-xs min-h-[140px]',
                      isSelected
                        ? 'border-primary bg-primary-50/60 dark:bg-primary-950/25 ring-2 ring-primary/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={cn('p-2.5 rounded-xl border', variant.color)}>
                        <VIcon size={18} strokeWidth={2.4} />
                      </div>
                      {isSelected ? (
                        <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                          ✓ Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">
                          Select
                        </span>
                      )}
                    </div>
                    <div className="mt-auto">
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-syne">
                        {variant.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {variant.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pill Badge Input */}
            <div className="pt-2">
              <ATMTextField
                label="TOP PILL BADGE"
                name="pillBadge"
                value={values.pillBadge}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 24/7/365 HUMAN CUSTOMER SUPPORT"
                helperText="Eyebrow tag that appears directly above the main heading."
              />
            </div>
          </div>

          {/* Section 2: Headings & Support Promise */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                  <Sparkles size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-syne">
                    2. Headings &amp; Support Promise
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Craft the primary headline and promise displayed to storefront visitors.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ATMTextField
                label="MAIN HEADING PREFIX"
                name="mainTitle"
                value={values.mainTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 24/7 Dedicated Enterprise"
                required
                error={touched.mainTitle && errors.mainTitle ? errors.mainTitle : undefined}
                helperText="Primary heading text."
              />

              <ATMTextField
                label="GRADIENT HIGHLIGHT PHRASE"
                name="highlightWord"
                value={values.highlightWord}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Technical Support"
                helperText="Styled with the brand's vibrant orange-amber gradient."
              />
            </div>

            <ATMTextArea
              label="SUPPORT PROMISE DESCRIPTION"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              placeholder="e.g. Multi-location operations need immediate resolution. Get round-the-clock technical assistance, dedicated account onboarding, and direct priority support across every store."
              helperText="2-3 sentences explaining your team's response and availability commitment."
            />
          </div>

          {/* Section 3: 3 Technical Support Pillars */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-syne">
                    3. Technical Support Pillars ({values.pillars.length}/4)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The 3 foundational service pillars shown across the bottom row of the section.
                  </p>
                </div>
              </div>

              {values.pillars.length < 4 && (
                <ATMButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPillar}
                  className="text-xs font-bold"
                >
                  <Plus size={14} className="mr-1" />
                  Add Pillar
                </ATMButton>
              )}
            </div>

            <div className="space-y-4">
              {values.pillars.map((pillar, idx) => {
                const PIcon = renderPillarIcon(pillar.iconKey);
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Support Pillar #{idx + 1}
                        </span>
                      </div>

                      {values.pillars.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePillar(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Remove Pillar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Icon Selector Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Icon:
                      </span>
                      {pillarIconOptions.map((opt) => {
                        const OptIcon = opt.icon;
                        const isIconActive =
                          pillar.iconKey?.toLowerCase() === opt.id.toLowerCase();
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleUpdatePillar(idx, 'iconKey', opt.id)
                            }
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                              isIconActive
                                ? 'bg-primary text-white border-primary shadow-2xs font-bold'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            )}
                          >
                            <OptIcon size={12} />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ATMTextField
                        label="PILLAR TITLE"
                        name={`pillar_title_${idx}`}
                        value={pillar.title}
                        onChange={(e) =>
                          handleUpdatePillar(idx, 'title', e.target.value)
                        }
                        placeholder="e.g. Dedicated Account Manager"
                        required
                      />

                      <ATMTextField
                        label="SHORT DESCRIPTION"
                        name={`pillar_desc_${idx}`}
                        value={pillar.desc}
                        onChange={(e) =>
                          handleUpdatePillar(idx, 'desc', e.target.value)
                        }
                        placeholder="e.g. 1-on-1 technical onboarding and custom rollouts."
                        required
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Support Representative & Direct Hotline Channels */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Phone size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-syne">
                    4. Support Desk &amp; Direct Hotline Channels
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live representative profile, SLA response times, phone numbers, and chat links.
                  </p>
                </div>
              </div>
            </div>

            {/* Executive / Support Photo Card Image */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <ImageIcon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Support Card Photo / Representative Image
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      The main photo displayed inside the support showcase card on the live storefront.
                    </p>
                  </div>
                </div>
                {values.repAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => setFieldValue('repAvatarUrl', '')}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Clear Photo
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Photo Preview Thumbnail */}
                <div className="relative h-20 w-32 sm:h-22 sm:w-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center shadow-xs">
                  {values.repAvatarUrl ? (
                    <img
                      src={values.repAvatarUrl}
                      alt="Support Representative"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/customer_support_executive.jpg';
                      }}
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <ImageIcon className="h-6 w-6 mx-auto mb-1 stroke-1" />
                      <span className="text-[10px] block font-mono">No photo</span>
                    </div>
                  )}
                </div>

                <div className="w-full space-y-2">
                  <ATMTextField
                    label="IMAGE PATH OR REMOTE URL"
                    name="repAvatarUrl"
                    value={values.repAvatarUrl}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="/images/customer_support_executive.jpg"
                    helperText="Local public website image path (e.g. /images/...) or remote HTTPS CDN URL."
                  />
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setFieldValue('repAvatarUrl', '/images/customer_support_executive.jpg')}
                      className="text-[10.5px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary transition-colors cursor-pointer"
                    >
                      Default Executive Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFieldValue('repAvatarUrl', '/images/support_lead.jpg')}
                      className="text-[10.5px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary transition-colors cursor-pointer"
                    >
                      Support Lead
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ATMTextField
                label="SUPPORT DESK / LEAD NAME"
                name="repName"
                value={values.repName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Sarah Jenkins (or Enterprise Escalation Desk)"
                helperText="Person or team name displayed on the card."
              />

              <ATMTextField
                label="ROLE OR DESIGNATION"
                name="repRole"
                value={values.repRole}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Lead Technical Onboarding Engineer"
                helperText="Technical title shown below the name."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ATMTextField
                label="LIVE RESPONSE TIME BADGE"
                name="responseTimeBadge"
                value={values.responseTimeBadge}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. < 45s Live Response"
                helperText="Speed guarantee badge with pulsating green dot."
              />

              <ATMTextField
                label="DIRECT PHONE HOTLINE"
                name="directPhone"
                value={values.directPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. +1 (800) 555-0199"
                helperText="Direct hotline with zero IVR."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ATMTextField
                label="PRIORITY EMAIL ADDRESS"
                name="directEmail"
                value={values.directEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. enterprise@quantixpos.com"
                helperText="Direct escalation inbox."
              />

              <ATMTextField
                label="LIVE CHAT STATUS"
                name="liveChatStatus"
                value={values.liveChatStatus}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Online & Available"
                helperText="Status badge next to chat button."
              />
            </div>

            <ATMTextField
              label="CHAT CTA BUTTON TEXT"
              name="chatButtonText"
              value={values.chatButtonText}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Start Live Technical Chat"
              helperText="Label for the main action button on the support card."
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ── RIGHT COLUMN (4 COLS): Sticky Live Preview & Actions ───────────────── */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Live Preview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-syne">
                  Real-Time Live Preview
                </span>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {values.siteVariant}
              </span>
            </div>

            {/* Rendered Preview Card */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md relative overflow-hidden border border-slate-800">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />

              {/* Eyebrow */}
              {values.pillBadge && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-[#FF4F00] bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                  <Headphones size={9} />
                  {values.pillBadge}
                </span>
              )}

              {/* Title */}
              <div className="font-syne text-base font-black leading-snug">
                {values.mainTitle || '24/7 Dedicated Support'}{' '}
                {values.highlightWord && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4F00] to-amber-500">
                    {values.highlightWord}
                  </span>
                )}
              </div>

              {/* Desc */}
              <p className="text-[11px] text-slate-400 font-normal leading-relaxed line-clamp-2">
                {values.description ||
                  'Multi-location operations need immediate resolution across every location.'}
              </p>

              {/* 3 Pillars Small Mockup */}
              <div className="space-y-1.5 pt-1">
                {values.pillars.slice(0, 3).map((p, pIdx) => {
                  const Icon = renderPillarIcon(p.iconKey);
                  return (
                    <div
                      key={pIdx}
                      className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2"
                    >
                      <div className="h-5 w-5 rounded-md bg-orange-500/20 text-[#FF4F00] flex items-center justify-center shrink-0">
                        <Icon size={10} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-white truncate">
                          {p.title || `Support Pillar ${pIdx + 1}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rep Strip */}
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {values.repName ? values.repName.charAt(0) : 'S'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">
                      {values.repName || 'Sarah Jenkins'}
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      {values.repRole || 'Support Lead'}
                    </div>
                  </div>
                </div>

                {values.responseTimeBadge && (
                  <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full shrink-0">
                    {values.responseTimeBadge}
                  </span>
                )}
              </div>

              {/* Chat CTA Button */}
              <div className="pt-1">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF4F00] to-orange-500 text-white font-syne font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <MessageSquare size={12} />
                  <span>{values.chatButtonText || 'Start Live Chat'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Publication Status Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-syne">
              Publication Status
            </h4>

            <ATMCheckbox
              label="Live on Website"
              name="isActive"
              checked={values.isActive}
              onChange={(checked) => setFieldValue('isActive', checked)}
              helperText="When enabled, this customer support section appears live on the homepage."
            />
          </div>
        </div>
      </div>
    </Form>
  );
};
