import React from 'react';
import { Form, FormikProps } from 'formik';
import {
  Quote,
  User,
  Star,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { ATMButton, ATMTextField, ATMTextArea, ATMSelectField, ATMCheckbox } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { TestimonialFormValues } from '../Model/TestimonialTypes';
import { getInitials } from '../List/TestimonialCard';

interface TestimonialFormProps {
  formikProps: FormikProps<TestimonialFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, setFieldValue, isSubmitting } = formikProps;
  const initials = getInitials(values.personName);
  const rating = Math.max(1, Math.min(5, values.rating || 5));

  return (
    <Form className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Testimonial Details (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Reviewer Information */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <User className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Client & Reviewer Information
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

              <ATMTextField
                name="personName"
                label="Full Name of Client"
                placeholder="e.g. Vikramaditya Singhania"
                value={values.personName}
                onChange={(e) => setFieldValue('personName', e.target.value)}
                error={touched.personName && errors.personName ? errors.personName : undefined}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="personRole"
                label="Executive Role / Title"
                placeholder="e.g. Chief Operating Officer"
                value={values.personRole}
                onChange={(e) => setFieldValue('personRole', e.target.value)}
                error={touched.personRole && errors.personRole ? errors.personRole : undefined}
              />

              <ATMTextField
                name="companyName"
                label="Company / Brand Name"
                placeholder="e.g. Nexus Retail Group"
                value={values.companyName}
                onChange={(e) => setFieldValue('companyName', e.target.value)}
                error={touched.companyName && errors.companyName ? errors.companyName : undefined}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="avatarUrl"
                label="Avatar / Photo Image URL"
                placeholder="https://images.unsplash.com/..."
                value={values.avatarUrl}
                onChange={(e) => setFieldValue('avatarUrl', e.target.value)}
                error={touched.avatarUrl && errors.avatarUrl ? errors.avatarUrl : undefined}
              />

              <ATMTextField
                name="metricText"
                label="Key Metric Tag (e.g. 350+ Outlets Synced)"
                placeholder="350+ Outlets Synced"
                value={values.metricText}
                onChange={(e) => setFieldValue('metricText', e.target.value)}
                error={touched.metricText && errors.metricText ? errors.metricText : undefined}
              />
            </div>
          </div>

          {/* 2. Rating & Review Content */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Quote className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Review Content & Rating
              </h4>
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Rating (1 - 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFieldValue('rating', star)}
                      className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-hidden"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={cn(
                          'h-6 w-6 transition-colors',
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <ATMTextField
                  name="title"
                  label="Headline / Outcome Title"
                  placeholder="e.g. Sub-4ms Checkouts During Peak Festive Traffic"
                  value={values.title}
                  onChange={(e) => setFieldValue('title', e.target.value)}
                  error={touched.title && errors.title ? errors.title : undefined}
                />
              </div>

              <div className="sm:col-span-1">
                <ATMTextField
                  name="sortOrder"
                  label="Sequence"
                  type="number"
                  value={String(values.sortOrder)}
                  onChange={(e) => setFieldValue('sortOrder', parseInt(e.target.value, 10) || 1)}
                  error={touched.sortOrder && errors.sortOrder ? errors.sortOrder : undefined}
                  required
                />
              </div>
            </div>

            <ATMTextArea
              name="body"
              label="Review Body / Quote"
              placeholder="Detailed testimonial quote detailing how Quantix resolved pain points and improved enterprise operations..."
              value={values.body}
              onChange={(e) => setFieldValue('body', e.target.value)}
              rows={4}
              error={touched.body && errors.body ? errors.body : undefined}
              required
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live Preview & Publishing State (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card Live Preview */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Live Website Preview
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Interactive</span>
            </div>

            {/* Live Card Mockup */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                  #{values.sortOrder} • {values.siteVariant}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', values.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300')}>
                  {values.isActive ? 'Live' : 'Hidden'}
                </span>
              </div>

              {/* Stars + Metric Tag */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        'h-4 w-4',
                        s <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-800 text-slate-700'
                      )}
                    />
                  ))}
                  <span className="ml-1 text-xs font-bold text-amber-300">
                    {rating}.0
                  </span>
                </div>

                {values.metricText && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <TrendingUp className="h-3 w-3" />
                    {values.metricText}
                  </span>
                )}
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                {values.title && (
                  <h4 className="text-sm font-bold text-white">
                    {values.title}
                  </h4>
                )}
                <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                  &ldquo;{values.body || 'Review body quote will appear here...'}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                {values.avatarUrl ? (
                  <img
                    src={values.avatarUrl}
                    alt={values.personName || 'Avatar'}
                    className="h-10 w-10 shrink-0 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary-600 to-amber-500 text-xs font-black text-white shadow-xs">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {values.personName || 'Reviewer Name'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {[values.personRole, values.companyName].filter(Boolean).join(' • ') || 'Role • Company'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Publishing Status */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              Publishing Status
            </h4>

            <ATMCheckbox
              name="isActive"
              label="Publish to Website"
              checked={values.isActive}
              onChange={(checked) => setFieldValue('isActive', checked)}
              helperText="When checked, this review will be displayed immediately to visitors on the live marketing website."
            />
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <ATMButton
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
        >
          Cancel
        </ATMButton>
        <ATMButton
          type="submit"
          variant="primary"
          isLoading={isLoading || isSubmitting}
        >
          {isEdit ? 'Update Review' : 'Create Review'}
        </ATMButton>
      </div>
    </Form>
  );
};
