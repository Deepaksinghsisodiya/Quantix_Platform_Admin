import React from 'react';
import { Form, FormikProps } from 'formik';
import {
  Layers,
  Sparkles,
  BarChart3,
  Palette,
  Hash,
  CheckCircle2,
} from 'lucide-react';

import { ATMButton, ATMTextField, ATMTextArea, ATMSelectField, ATMCheckbox } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { SocialProofFormValues } from '../Model/SocialProofTypes';
import { ICON_MAP, getColorTheme } from '../List/SocialProofCard';

interface SocialProofFormProps {
  formikProps: FormikProps<SocialProofFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
  isLoading?: boolean;
}

const AVAILABLE_ICONS = [
  { key: 'Store', label: 'Store / Outlet' },
  { key: 'TrendingUp', label: 'Trending / Revenue' },
  { key: 'ShieldCheck', label: 'Shield / Security / SLA' },
  { key: 'Globe2', label: 'Globe / International' },
  { key: 'UtensilsCrossed', label: 'Dining / Food' },
  { key: 'ShoppingBag', label: 'Shopping / Retail' },
  { key: 'Zap', label: 'Fast / Performance' },
  { key: 'Users', label: 'Customers / Team' },
  { key: 'Award', label: 'Award / Excellence' },
  { key: 'Sparkles', label: 'Sparkles / AI' },
];

const AVAILABLE_COLORS = [
  { key: 'orange', label: 'Orange' },
  { key: 'emerald', label: 'Emerald' },
  { key: 'blue', label: 'Blue' },
  { key: 'purple', label: 'Purple' },
  { key: 'rose', label: 'Rose' },
  { key: 'amber', label: 'Amber' },
];

export const SocialProofForm: React.FC<SocialProofFormProps> = ({
  formikProps,
  isEdit = false,
  onCancel,
  isLoading = false,
}) => {
  const { values, errors, touched, setFieldValue, isSubmitting } = formikProps;

  const IconComponent = ICON_MAP[values.iconKey] || Sparkles;
  const colorTheme = getColorTheme(values.accentColor);

  return (
    <Form className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Metric Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Basic Metadata */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Layers className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Metric Information
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
                name="value"
                label="Display String (e.g. 50K+, $250M+, 99.99%)"
                placeholder="50K+"
                value={values.value}
                onChange={(e) => setFieldValue('value', e.target.value)}
                error={touched.value && errors.value ? errors.value : undefined}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ATMTextField
                name="label"
                label="Metric Headline / Title (e.g. ACTIVE OUTLETS)"
                placeholder="ACTIVE OUTLETS"
                value={values.label}
                onChange={(e) => setFieldValue('label', e.target.value)}
                error={touched.label && errors.label ? errors.label : undefined}
                required
              />

              <ATMTextField
                name="sortOrder"
                label="Display Sequence"
                type="number"
                value={String(values.sortOrder)}
                onChange={(e) => setFieldValue('sortOrder', parseInt(e.target.value, 10) || 1)}
                error={touched.sortOrder && errors.sortOrder ? errors.sortOrder : undefined}
                required
              />
            </div>

            <ATMTextArea
              name="description"
              label="Sub-caption / Description (e.g. Multi-unit store networks)"
              placeholder="Multi-unit store networks with central billing"
              value={values.description}
              onChange={(e) => setFieldValue('description', e.target.value)}
              rows={2}
            />
          </div>

          {/* 2. Count-Up Animation Config */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Hash className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Animated Count-Up Configuration
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <ATMTextField
                  name="prefix"
                  label="Prefix"
                  placeholder="$"
                  value={values.prefix}
                  onChange={(e) => setFieldValue('prefix', e.target.value)}
                />
              </div>

              <div className="sm:col-span-1">
                <ATMTextField
                  name="numericValue"
                  label="Numeric Target"
                  placeholder="50"
                  type="number"
                  value={String(values.numericValue ?? '')}
                  onChange={(e) => setFieldValue('numericValue', e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>

              <div className="sm:col-span-1">
                <ATMTextField
                  name="suffix"
                  label="Suffix"
                  placeholder="K+"
                  value={values.suffix}
                  onChange={(e) => setFieldValue('suffix', e.target.value)}
                />
              </div>

              <div className="sm:col-span-1">
                <ATMTextField
                  name="decimals"
                  label="Decimals"
                  placeholder="0"
                  type="number"
                  value={String(values.decimals)}
                  onChange={(e) => setFieldValue('decimals', parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Allows the marketing website to animate from 0 to the target number smoothly (e.g. 0 → 50 with "K+" suffix).
            </p>
          </div>

          {/* 3. Icon & Color Styling */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Palette className="h-4 w-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Visual Icon & Accent Color
              </h4>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Metric Icon
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {AVAILABLE_ICONS.map((icon) => {
                  const IconComp = ICON_MAP[icon.key] || Sparkles;
                  const isSelected = values.iconKey === icon.key;
                  return (
                    <button
                      key={icon.key}
                      type="button"
                      onClick={() => setFieldValue('iconKey', icon.key)}
                      className={cn(
                        'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold ring-2 ring-primary-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      <IconComp className="h-5 w-5 mb-1" />
                      <span className="text-[10px] leading-tight line-clamp-1">{icon.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Accent Theme Color
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((color) => {
                  const theme = getColorTheme(color.key);
                  const isSelected = values.accentColor === color.key;
                  return (
                    <button
                      key={color.key}
                      type="button"
                      onClick={() => setFieldValue('accentColor', color.key)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
                        isSelected
                          ? cn('border-current ring-2 ring-offset-1 font-bold', theme.text)
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      <span className={cn('h-3 w-3 rounded-full bg-gradient-to-r', theme.gradient)} />
                      {color.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live Preview & Publishing State (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card Live Ribbon Preview */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Live Ribbon Preview
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Interactive</span>
            </div>

            {/* Live Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                  Position #{values.sortOrder}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', values.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300')}>
                  {values.isActive ? 'Live' : 'Hidden'}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-md shadow-inner', colorTheme.bg, colorTheme.border)}>
                  <IconComponent className={cn('h-7 w-7', colorTheme.text)} />
                </div>
                <div>
                  <div className={cn('text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent', colorTheme.gradient)}>
                    {values.value || '50K+'}
                  </div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
                    {values.label || 'METRIC TITLE'}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
                {values.description || 'Description sub-caption will appear here...'}
              </p>
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
              helperText="When enabled, this metric is visible to visitors on the live marketing website."
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
          {isEdit ? 'Update Metric' : 'Create Metric'}
        </ATMButton>
      </div>
    </Form>
  );
};
