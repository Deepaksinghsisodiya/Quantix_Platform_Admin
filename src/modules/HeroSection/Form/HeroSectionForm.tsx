import React, { useState } from 'react';
import { Form, FormikProps } from 'formik';
import {
  Layers,
  Sparkles,
  ImageOff,
  Plus,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

import { ATMButton, ATMTextField, ATMTextArea, ATMSelectField, ATMCheckbox } from '@/shared/ui';
import { MediaPicker } from '@/modules/content/components/MediaPicker';
import { absoluteMediaUrl } from '@/modules/content/services/mediaApi';
import type { HeroSlideFormValues } from '../Model/HeroSectionTypes';

interface HeroSectionFormProps {
  formikProps: FormikProps<HeroSlideFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

export const HeroSectionForm: React.FC<HeroSectionFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, setFieldValue, isSubmitting } = formikProps;
  const [pickerOpen, setPickerOpen] = useState(false);

  const highlights = [values.highlight1, values.highlight2, values.highlight3].filter(Boolean);

  return (
    <Form className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Content & Real-Time Card Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Basic Metadata & Heading */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Layers className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Slide Information & Hierarchy
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
                helperText="Which website platform renders this slide."
              />

              <ATMTextField
                name="sortOrder"
                label="Slide Order Index"
                type="number"
                value={String(values.sortOrder)}
                onChange={(e) => setFieldValue('sortOrder', parseInt(e.target.value, 10) || 0)}
                error={touched.sortOrder && errors.sortOrder ? errors.sortOrder : undefined}
                helperText="Lower numbers appear first (#1 is hero front)."
              />
            </div>

            <ATMTextField
              name="badge"
              label="Top Pill Badge"
              placeholder="e.g. OPERATING PLATFORM FOR MULTI-LOCATION BRANDS"
              value={values.badge}
              onChange={(e) => setFieldValue('badge', e.target.value)}
              error={touched.badge && errors.badge ? errors.badge : undefined}
              helperText="Small uppercase badge pill displayed above the heading."
            />

            <ATMTextField
              name="heading"
              label="Main Heading / Title *"
              placeholder="e.g. Run Every Location From One Platform"
              value={values.heading}
              onChange={(e) => setFieldValue('heading', e.target.value)}
              error={touched.heading && errors.heading ? errors.heading : undefined}
              helperText="Primary H1 headline for the slide."
            />

            <ATMTextArea
              name="subheading"
              label="Subheading / Paragraph Description"
              placeholder="Detailed paragraph explaining features, benefits, and values..."
              rows={4}
              value={values.subheading}
              onChange={(e) => setFieldValue('subheading', e.target.value)}
              error={touched.subheading && errors.subheading ? errors.subheading : undefined}
              helperText="2-3 concise sentences recommended."
            />
          </div>

          {/* 2. Interactive Real-Time Preview */}
          <div className="rounded-xl border border-primary-200/80 bg-gradient-to-br from-primary-50/40 via-white to-slate-50/50 p-5 dark:border-primary-950/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-primary-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Live Slide Card Preview
                </span>
              </div>
              <span className="rounded-md bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                {values.siteVariant} #{values.sortOrder}
              </span>
            </div>

            <div className="space-y-2">
              {values.badge && (
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                  {values.badge}
                </span>
              )}
              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {values.heading || 'Your Headline Will Appear Here'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                {values.subheading || 'Subheading and descriptive overview text will be displayed here in full fidelity.'}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {values.primaryCtaLabel && (
                  <div className="rounded-lg bg-[#FF4F00] px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                    {values.primaryCtaLabel}
                  </div>
                )}
                {values.secondaryCtaLabel && (
                  <div className="rounded-lg border border-slate-300 px-3 py-1 text-[11px] font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                    {values.secondaryCtaLabel}
                  </div>
                )}
              </div>

              {highlights.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  {highlights.map((chip, i) => (
                    <span key={i} className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                      ✓ {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visuals, CTAs & Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Visual Showcase */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <ImageOff className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Showcase Device Visual
              </h4>
            </div>

            {values.mediaAssetId ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
                  <img
                    src={absoluteMediaUrl(`/api/v1/media/${values.mediaAssetId}/file`)}
                    alt="Showcase Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ Media Library Asset linked
                  </span>
                  <div className="flex gap-2">
                    <ATMButton variant="ghost" size="sm" type="button" onClick={() => setPickerOpen(true)}>
                      Change
                    </ATMButton>
                    <ATMButton variant="danger" size="sm" type="button" onClick={() => setFieldValue('mediaAssetId', '')}>
                      Remove
                    </ATMButton>
                  </div>
                </div>
              </div>
            ) : values.imageUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
                  <img
                    src={values.imageUrl}
                    alt="Showcase Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs truncate text-slate-500 max-w-[180px]">
                    {values.imageUrl}
                  </span>
                  <div className="flex gap-2">
                    <ATMButton variant="ghost" size="sm" type="button" onClick={() => setPickerOpen(true)}>
                      Pick Media
                    </ATMButton>
                    <ATMButton variant="danger" size="sm" type="button" onClick={() => setFieldValue('imageUrl', '')}>
                      Clear
                    </ATMButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:border-primary-500 hover:bg-primary-50/10 dark:border-slate-700 dark:bg-slate-900/40 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary dark:bg-primary-950">
                    <Plus size={20} />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Select from Media Library
                  </span>
                  <span className="text-[10px] text-slate-500">
                    PNG, JPG, WebP terminal or hardware mockups
                  </span>
                </button>

                <ATMTextField
                  name="imageUrl"
                  label="Or Direct Image Path / URL"
                  placeholder="/images/foodhub_pos_terminal.jpg"
                  value={values.imageUrl}
                  onChange={(e) => setFieldValue('imageUrl', e.target.value)}
                  error={touched.imageUrl && errors.imageUrl ? errors.imageUrl : undefined}
                  helperText="Local public image path or remote CDN URL."
                />
              </div>
            )}
          </div>

          {/* 2. Action Buttons (CTAs) */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <ExternalLink className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Dual Action Buttons (CTAs)
              </h4>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/30 space-y-3">
                <span className="text-[11px] font-bold text-[#FF4F00] uppercase tracking-wide">
                  Primary CTA Button (Solid Orange)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ATMTextField
                    name="primaryCtaLabel"
                    label="Button Label"
                    placeholder="e.g. Start Free Trial"
                    value={values.primaryCtaLabel}
                    onChange={(e) => setFieldValue('primaryCtaLabel', e.target.value)}
                    error={touched.primaryCtaLabel && errors.primaryCtaLabel ? errors.primaryCtaLabel : undefined}
                  />
                  <ATMTextField
                    name="primaryCtaUrl"
                    label="Destination URL"
                    placeholder="e.g. /contact or /sign-up"
                    value={values.primaryCtaUrl}
                    onChange={(e) => setFieldValue('primaryCtaUrl', e.target.value)}
                    error={touched.primaryCtaUrl && errors.primaryCtaUrl ? errors.primaryCtaUrl : undefined}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/30 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Secondary CTA Button (Outline)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ATMTextField
                    name="secondaryCtaLabel"
                    label="Button Label"
                    placeholder="e.g. Book Demo"
                    value={values.secondaryCtaLabel}
                    onChange={(e) => setFieldValue('secondaryCtaLabel', e.target.value)}
                    error={touched.secondaryCtaLabel && errors.secondaryCtaLabel ? errors.secondaryCtaLabel : undefined}
                  />
                  <ATMTextField
                    name="secondaryCtaUrl"
                    label="Destination URL"
                    placeholder="e.g. /contact/demo"
                    value={values.secondaryCtaUrl}
                    onChange={(e) => setFieldValue('secondaryCtaUrl', e.target.value)}
                    error={touched.secondaryCtaUrl && errors.secondaryCtaUrl ? errors.secondaryCtaUrl : undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Feature Highlight Chips */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <CheckCircle2 className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Feature Highlight Chips (3 Bullets)
              </h4>
            </div>

            <div className="space-y-2">
              <ATMTextField
                name="highlight1"
                label="Feature Chip 1"
                placeholder="e.g. Manage Every Location"
                value={values.highlight1}
                onChange={(e) => setFieldValue('highlight1', e.target.value)}
              />
              <ATMTextField
                name="highlight2"
                label="Feature Chip 2"
                placeholder="e.g. One POS for Every Branch"
                value={values.highlight2}
                onChange={(e) => setFieldValue('highlight2', e.target.value)}
              />
              <ATMTextField
                name="highlight3"
                label="Feature Chip 3"
                placeholder="e.g. Connected Real-Time Data"
                value={values.highlight3}
                onChange={(e) => setFieldValue('highlight3', e.target.value)}
              />
            </div>
          </div>

          {/* 4. Visibility Control */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
            <ATMCheckbox
              name="isActive"
              label="Publish to website (Slide active and visible)"
              checked={values.isActive}
              onChange={(checked) => setFieldValue('isActive', checked)}
            />
            <p className="text-[11px] text-slate-500 mt-1 pl-6">
              When unchecked, this slide is kept as a draft and hidden from website visitors.
            </p>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => setFieldValue('mediaAssetId', asset.assetId)}
        defaultFolder="marketing"
        imagesOnly
        title="Choose a Hero Showcase Image"
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isEdit ? 'Updating existing slide' : 'Creating new hero slide'}
        </span>
        <div className="flex gap-2">
          <ATMButton variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </ATMButton>
          <ATMButton
            variant="primary"
            type="submit"
            isLoading={isSubmitting || isLoading}
          >
            {isEdit ? 'Update Slide' : 'Publish Slide'}
          </ATMButton>
        </div>
      </div>
    </Form>
  );
};
