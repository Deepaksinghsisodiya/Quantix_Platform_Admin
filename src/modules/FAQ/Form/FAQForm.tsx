import React from 'react';
import { Form, FormikProps } from 'formik';
import {
  HelpCircle,
  Sparkles,
  Building2,
  Utensils,
  Store,
  Globe,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  ATMButton,
  ATMTextField,
  ATMTextArea,
  ATMCheckbox,
} from '@/shared/ui';
import { cn } from '@/lib/utils/cn';

export interface FAQFormValues {
  siteVariant: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

interface FAQFormProps {
  formikProps: FormikProps<FAQFormValues>;
  isEdit?: boolean;
  onCancel: () => void;
}

const CATEGORY_SUGGESTIONS = [
  'Platform',
  'Offline',
  'Integrations',
  'Hardware',
  'Security',
  'Support',
  'Inventory',
  'Menu Management',
  'Billing',
];

export const FAQForm: React.FC<FAQFormProps> = ({
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
      desc: 'Multi-location chains, ERP integrations & franchise sync',
      color: 'bg-primary/10 text-primary border-primary/30',
    },
    {
      id: 'Restaurant',
      label: 'Restaurant Website',
      icon: Utensils,
      desc: 'Dine-in, KDS kitchen screens, online aggregators & bar tabs',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    },
    {
      id: 'Retail',
      label: 'Retail Storefront',
      icon: Store,
      desc: 'Supermarkets, apparel boutiques, barcode scanning & stock transfers',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    },
    {
      id: 'All',
      label: 'All Storefronts (Global)',
      icon: Globe,
      desc: 'Common questions applicable to all platforms across Quantix',
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    },
  ];

  return (
    <Form className="space-y-8 animate-fadeIn pb-16">
      {/* 1. Target Storefront Platform */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
              1. Target Storefront Platform
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select which storefront website this FAQ should appear on.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {siteVariants.map((v) => {
            const Icon = v.icon;
            const isSelected =
              values.siteVariant.toLowerCase() === v.id.toLowerCase() ||
              (v.id === 'All' && (!values.siteVariant || values.siteVariant.toLowerCase() === 'all'));

            return (
              <div
                key={v.id}
                onClick={() => setFieldValue('siteVariant', v.id)}
                className={cn(
                  'cursor-pointer rounded-2xl border p-4 transition-all relative flex flex-col justify-between space-y-3',
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40',
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center border', v.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 rounded-full bg-primary text-white items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {v.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {v.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Question & Categorization */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
              2. FAQ Content & Categorization
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide the question title, detailed answer, and category group.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Question */}
          <div>
            <ATMTextField
              name="question"
              label="Question Title"
              placeholder="e.g. What happens if the store loses internet connectivity?"
              value={values.question}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.question && errors.question && (
              <p className="mt-1 text-xs text-red-500">{errors.question}</p>
            )}
          </div>

          {/* Category with quick chips */}
          <div className="space-y-2">
            <ATMTextField
              name="category"
              label="Category Name"
              placeholder="e.g. Platform, Offline, Hardware, Security"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Layers className="h-3 w-3" /> Quick suggestions:
              </span>
              {CATEGORY_SUGGESTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFieldValue('category', c)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border',
                    values.category === c
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            {touched.category && errors.category && (
              <p className="mt-1 text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Answer */}
          <div>
            <ATMTextArea
              name="answer"
              label="Detailed Answer"
              placeholder="Provide a clear, detailed, and reassuring response for storefront visitors..."
              rows={5}
              value={values.answer}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched.answer && errors.answer && (
              <p className="mt-1 text-xs text-red-500">{errors.answer}</p>
            )}
          </div>

          {/* Order Weight & Active Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <ATMTextField
                name="sortOrder"
                label="Sort Order Index"
                type="number"
                placeholder="1"
                value={String(values.sortOrder)}
                onChange={(e) => setFieldValue('sortOrder', parseInt(e.target.value, 10) || 1)}
                onBlur={handleBlur}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Lower numbers appear first on the storefront accordion.
              </p>
            </div>

            <div className="flex items-center pt-6">
              <ATMCheckbox
                name="isActive"
                label="Publish Live to Storefront Website"
                checked={values.isActive}
                onChange={(checked) => setFieldValue('isActive', checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Accordion Preview */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
              3. Live Storefront Accordion Preview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This preview dynamically reflects how the FAQ card will look once published.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {values.siteVariant || 'All Storefronts'}
              </span>
              {values.category && (
                <span className="rounded-md bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {values.category}
                </span>
              )}
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                values.isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
              )}
            >
              {values.isActive ? '● Live' : 'Hidden'}
            </span>
          </div>

          <div className="pt-1">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
              {values.question || 'Your question title will appear here...'}
            </h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
              {values.answer ||
                'Your detailed explanation answer will be displayed here for visitors when they click the question...'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 shadow-lg">
        <ATMButton variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </ATMButton>
        <ATMButton variant="primary" type="submit" isLoading={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create FAQ'}
        </ATMButton>
      </div>
    </Form>
  );
};
