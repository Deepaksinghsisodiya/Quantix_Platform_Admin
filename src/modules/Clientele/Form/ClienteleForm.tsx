import React, { useState } from 'react';
import { Form, FormikProps } from 'formik';
import {
  Building2,
  Sparkles,
  Link as LinkIcon,
  Tag,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Star,
  Info,
} from 'lucide-react';
import { ATMButton, ATMTextField, ATMSelectField, ATMCheckbox } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { ClienteleFormValues } from '../Model/ClienteleTypes';
import { getCategoryIcon } from '../List/ClienteleCard';

interface ClienteleFormProps {
  formikProps: FormikProps<ClienteleFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

const AVAILABLE_CATEGORIES = [
  { value: 'Enterprise', label: 'Enterprise Chain / Multi-Location' },
  { value: 'Restaurant', label: 'Restaurant & Dining' },
  { value: 'Retail', label: 'Retail & Supermarket' },
  { value: 'Franchise', label: 'Franchise Network' },
  { value: 'Hospitality', label: 'Hospitality & Bars' },
];

const AVAILABLE_TIERS = [
  { value: 'Enterprise', label: 'Enterprise Tier' },
  { value: 'Global', label: 'Global Tier' },
  { value: 'Standard', label: 'Standard Tier' },
];

export const ClienteleForm: React.FC<ClienteleFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, setFieldValue, isSubmitting } = formikProps;
  const [imgError, setImgError] = useState(false);

  const Icon = getCategoryIcon(values.industry, values.category);
  const previewName = values.name || 'Brand Partner';
  const previewCategory = values.category || 'Enterprise';
  const previewIndustry = values.industry || 'Multi-Unit Operations';
  const previewLocations = values.locationsCount ? Number(values.locationsCount) : null;
  const previewLogoUrl = !imgError && values.logoUrl ? values.logoUrl : null;

  return (
    <Form className="space-y-5">
      {/* 1. INTERACTIVE LIVE BRAND CARD PREVIEW (At top for instant feedback) */}
      <div className="rounded-xl border border-orange-500/30 bg-slate-950 p-4 shadow-md text-white space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Website Marquee Card Preview
            </span>
          </div>
          <span className="text-[11px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            {values.siteVariant || 'Enterprise'} Website
          </span>
        </div>

        {/* Live Brand Card Simulation (1:1 with ClienteleMarquee BrandCard) */}
        <div className="flex justify-center py-2 px-1">
          <div className="w-64 sm:w-72 max-w-full h-40 sm:h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-3.5 sm:p-4 shrink-0 flex flex-col justify-between shadow-lg relative select-none overflow-hidden">
            {/* Ambient hover glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#FF4F0012,transparent_70%)]" />

            {/* Top Bar: Category Pill & Status Badge */}
            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <Icon className="w-3 h-3 text-[#FF4F00]" />
                <span>{previewCategory}</span>
              </div>

              {values.isFeatured ? (
                <div className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  <span>Featured</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            {/* Center: Brand Logo Viewport */}
            <div className="h-16 w-full flex items-center justify-center bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-2 border border-slate-100 dark:border-slate-800/70 relative z-10">
              {previewLogoUrl ? (
                <img
                  src={previewLogoUrl}
                  alt={`${previewName} logo`}
                  onError={() => setImgError(true)}
                  className="max-h-full max-w-full object-contain filter dark:brightness-110"
                />
              ) : (
                <div className="flex items-center gap-2 text-[#FF4F00] font-bold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-slate-900 dark:text-white font-bold truncate max-w-[140px]">
                    {previewName}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Bar: Full Brand Name & Units Scale */}
            <div className="flex items-center justify-between gap-2 relative z-10 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <h4 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white truncate max-w-[140px]">
                {previewName}
              </h4>

              <div className="flex items-center gap-1 shrink-0">
                {previewLocations ? (
                  <span className="text-[9.5px] font-mono font-bold text-slate-400 dark:text-slate-500">
                    {previewLocations}+ Units
                  </span>
                ) : (
                  <span className="text-[9.5px] font-mono font-medium text-slate-400 dark:text-slate-500">
                    {values.tier || 'Enterprise'}
                  </span>
                )}
                {values.websiteUrl && (
                  <ExternalLink className="w-3 h-3 text-[#FF4F00] ml-1" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TARGET WEBSITE & CATEGORY */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <Building2 className="h-4 w-4 text-primary-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Target Website & Industry Category
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
            name="category"
            label="Industry Category"
            value={values.category}
            onChange={(val) => setFieldValue('category', String(val || 'Enterprise'))}
            options={AVAILABLE_CATEGORIES}
            error={touched.category && errors.category ? errors.category : undefined}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ATMTextField
            name="name"
            label="Brand / Company Name"
            placeholder="FoodFlow Enterprise"
            value={values.name}
            onChange={(e) => setFieldValue('name', e.target.value)}
            error={touched.name && errors.name ? errors.name : undefined}
            required
          />

          <ATMTextField
            name="industry"
            label="Industry / Sub-sector"
            placeholder="Dining & Hospitality or Luxury Fashion"
            value={values.industry}
            onChange={(e) => setFieldValue('industry', e.target.value)}
            error={touched.industry && errors.industry ? errors.industry : undefined}
          />
        </div>
      </div>

      {/* 3. LOGO & LINKS */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <Tag className="h-4 w-4 text-primary-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Brand Logo & Website URL
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ATMTextField
            name="logoUrl"
            label="Brand Logo Image URL"
            placeholder="https://... or /logos/brand.svg"
            value={values.logoUrl}
            onChange={(e) => {
              setImgError(false);
              setFieldValue('logoUrl', e.target.value);
            }}
            error={touched.logoUrl && errors.logoUrl ? errors.logoUrl : undefined}
            helperText="Leave empty to use branded initial/icon badge."
          />

          <ATMTextField
            name="websiteUrl"
            label="Client Website URL"
            placeholder="https://client-brand.com"
            value={values.websiteUrl}
            onChange={(e) => setFieldValue('websiteUrl', e.target.value)}
            error={touched.websiteUrl && errors.websiteUrl ? errors.websiteUrl : undefined}
            helperText="Clicking the card on website will open this link."
          />
        </div>
      </div>

      {/* 4. SCALE & STATUS */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <MapPin className="h-4 w-4 text-primary-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Scale, Tier & Publication
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ATMTextField
            name="locationsCount"
            type="number"
            label="Locations / Outlets Count"
            placeholder="120 (displays as 120+ Units)"
            value={String(values.locationsCount || '')}
            onChange={(e) => setFieldValue('locationsCount', e.target.value)}
            error={touched.locationsCount && errors.locationsCount ? errors.locationsCount : undefined}
            helperText="Number of locations powered by Quantix."
          />

          <ATMSelectField
            name="tier"
            label="Client Tier"
            value={values.tier}
            onChange={(val) => setFieldValue('tier', String(val || 'Enterprise'))}
            options={AVAILABLE_TIERS}
            error={touched.tier && errors.tier ? errors.tier : undefined}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <ATMTextField
            name="sortOrder"
            type="number"
            label="Display Sort Order"
            value={String(values.sortOrder)}
            onChange={(e) => setFieldValue('sortOrder', parseInt(e.target.value, 10) || 0)}
            error={touched.sortOrder && errors.sortOrder ? errors.sortOrder : undefined}
            helperText="Lower numbers appear first in the sliding marquee."
          />

          <div className="space-y-3 sm:pt-2">
            <ATMCheckbox
              name="isFeatured"
              label="Featured Brand Partner"
              checked={values.isFeatured}
              onChange={(checked) => setFieldValue('isFeatured', checked)}
              helperText="Displays with golden featured badge in marquee."
            />

            <ATMCheckbox
              name="isActive"
              label="Active / Live in Marquee"
              checked={values.isActive}
              onChange={(checked) => setFieldValue('isActive', checked)}
              helperText="Publish brand logo live to the website marquee."
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
          {isEdit ? 'Save Changes' : 'Add Brand Partner'}
        </ATMButton>
      </div>
    </Form>
  );
};
