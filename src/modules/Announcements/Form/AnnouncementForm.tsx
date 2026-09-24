import React from 'react';
import { Form, FormikProps } from 'formik';
import {
  Megaphone,
  Sparkles,
  Tag,
  Pin,
  ChevronRight,
  ExternalLink,
  Monitor,
  Smartphone,
  Info,
} from 'lucide-react';
import { ATMButton, ATMTextField, ATMTextArea, ATMSelectField, ATMCheckbox } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { AnnouncementFormValues } from '../Model/AnnouncementTypes';
import { getKindTheme } from '../List/AnnouncementCard';

interface AnnouncementFormProps {
  formikProps: FormikProps<AnnouncementFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

const AVAILABLE_KINDS = [
  { value: 'Promo', label: 'Promo (Special Offers, Discounts, Free Trials)' },
  { value: 'News', label: 'News (Product Releases, Major Updates)' },
  { value: 'Notice', label: 'Notice (SLA, Compliance, Maintenance)' },
  { value: 'Alert', label: 'Alert (Urgent System / Service Notices)' },
  { value: 'Event', label: 'Event (Webinars, Expos, Summits)' },
];

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, setFieldValue, isSubmitting } = formikProps;
  const theme = getKindTheme(values.kind);

  const previewBannerText = values.body || values.title || 'Get 3 Months 100% Free POS Trial • Zero Setup Fee';
  const previewCta = values.ctaLabel || (values.linkUrl ? 'Learn More' : 'Claim Offer');

  return (
    <Form className="space-y-5">
      {/* 1. INTERACTIVE LIVE NAVBAR PREVIEW BAR (At the top of form for immediate visual feedback) */}
      <div className="rounded-xl border border-orange-500/30 bg-slate-950 p-4 shadow-md text-white space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Top Navbar Banner Preview
            </span>
          </div>
          <span className="text-[11px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            {values.siteVariant || 'Enterprise'} Website
          </span>
        </div>

        {/* Live Top Strip (1:1 with Website TopPromoBanner) */}
        <div className="relative w-full rounded-lg overflow-hidden border border-orange-500/20 bg-slate-900 px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(255,77,0,0.12),transparent_70%)]" />
          <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 text-xs font-medium text-center">
            <span className="text-slate-200 truncate max-w-full sm:max-w-md">
              {previewBannerText}
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-[#FF7332] font-bold text-xs inline-flex items-center gap-0.5 shrink-0 underline decoration-orange-500/40">
              <span>{previewCta}</span>
              <ChevronRight className="h-3 w-3 stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* Classification preview badge strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', theme.badgeBg)}>
            {values.kind || 'Promo'}
          </span>
          {values.badge ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
              {values.badge}
            </span>
          ) : null}
          {values.isPinned ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PINNED TO TOP
            </span>
          ) : null}
        </div>
      </div>

      {/* 2. CLASSIFICATION & METADATA */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <Megaphone className="h-4 w-4 text-primary-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Target Website & Category
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            error={touched.siteVariant && errors.siteVariant ? errors.siteVariant : undefined}
            required
          />

          <ATMSelectField
            name="kind"
            label="Announcement Category"
            value={values.kind}
            onChange={(val) => setFieldValue('kind', String(val || 'Promo'))}
            options={AVAILABLE_KINDS}
            error={touched.kind && errors.kind ? errors.kind : undefined}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ATMTextField
            name="badge"
            label="Badge Tag (e.g. Limited Offer, Q3 Release)"
            placeholder="Limited Offer"
            value={values.badge}
            onChange={(e) => setFieldValue('badge', e.target.value)}
            error={touched.badge && errors.badge ? errors.badge : undefined}
            required
          />

          <ATMTextField
            name="title"
            label="Headline / Internal Name"
            placeholder="3 Months Free POS Trial"
            value={values.title}
            onChange={(e) => setFieldValue('title', e.target.value)}
            error={touched.title && errors.title ? errors.title : undefined}
            required
          />
        </div>
      </div>

      {/* 3. MESSAGE & CALL TO ACTION */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <Tag className="h-4 w-4 text-primary-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Banner Message & Call to Action
          </h4>
        </div>

        <ATMTextArea
          name="body"
          label="Banner Display Message"
          placeholder="Get 3 Months 100% Free POS Trial • Zero Setup Fee"
          rows={2}
          value={values.body}
          onChange={(e) => setFieldValue('body', e.target.value)}
          error={touched.body && errors.body ? errors.body : undefined}
          helperText="Appears directly on the website top navigation bar."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ATMTextField
            name="ctaLabel"
            label="CTA Button Label"
            placeholder="Claim Offer"
            value={values.ctaLabel}
            onChange={(e) => setFieldValue('ctaLabel', e.target.value)}
            error={touched.ctaLabel && errors.ctaLabel ? errors.ctaLabel : undefined}
            helperText="Defaults to 'Claim Offer' or 'Learn More'"
          />

          <ATMTextField
            name="linkUrl"
            label="Target Link URL or Route"
            placeholder="/contact/demo or https://..."
            value={values.linkUrl}
            onChange={(e) => setFieldValue('linkUrl', e.target.value)}
            error={touched.linkUrl && errors.linkUrl ? errors.linkUrl : undefined}
            helperText="Leave empty to trigger Demo/Contact modal"
          />
        </div>
      </div>

      {/* 4. PRIORITY & PUBLICATION */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <Pin className="h-4 w-4 text-primary-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Priority & Status
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ATMTextField
            name="sortOrder"
            type="number"
            label="Display Sort Order"
            value={String(values.sortOrder)}
            onChange={(e) => setFieldValue('sortOrder', parseInt(e.target.value, 10) || 0)}
            error={touched.sortOrder && errors.sortOrder ? errors.sortOrder : undefined}
            helperText="Lower numbers display first."
          />

          <div className="space-y-3 sm:pt-2">
            <ATMCheckbox
              name="isPinned"
              label="Pin to Top"
              checked={values.isPinned}
              onChange={(checked) => setFieldValue('isPinned', checked)}
              helperText="Prioritize first in banner rotation cycle."
            />

            <ATMCheckbox
              name="isActive"
              label="Active / Live on Website"
              checked={values.isActive}
              onChange={(checked) => setFieldValue('isActive', checked)}
              helperText="Publish banner live to target website."
            />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <ATMButton variant="outline" type="button" onClick={onCancel} disabled={isSubmitting || isLoading}>
          Cancel
        </ATMButton>
        <ATMButton variant="primary" type="submit" isLoading={isSubmitting || isLoading}>
          {isEdit ? 'Save Changes' : 'Create Announcement'}
        </ATMButton>
      </div>
    </Form>
  );
};
