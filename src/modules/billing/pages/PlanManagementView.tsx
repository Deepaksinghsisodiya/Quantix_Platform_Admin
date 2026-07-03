import React from 'react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMDrawer } from '@/shared/ui/ATMDrawer';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { FormikProvider } from 'formik';
import {
  Check,
  Plus,
  Pencil,
  Archive,
  Users,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { Plan } from './PlanManagementWrapper';

interface PlanManagementViewProps {
  plans: Plan[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  formik: any;
  addFeature: () => void;
  removeFeature: (idx: number) => void;
  updateFeature: (idx: number, value: string) => void;
  isSubmitting: boolean;
}

export const PlanManagementView: React.FC<PlanManagementViewProps> = ({
  plans,
  isLoading,
  isError,
  refetch,
  drawerOpen,
  setDrawerOpen,
  formik,
  addFeature,
  removeFeature,
  updateFeature,
  isSubmitting,
}) => {
  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-2">
            <span>Subscription Plans</span>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
          </div>
        }
        subtitle="Manage subscription plans for Enterprise merchants"
        extraActions={<ATMBadge label="Enterprise Only" color="purple" />}
        action={{
          label: 'Create Plan',
          onClick: () => setDrawerOpen(true),
          icon: Plus,
        }}
      />

      {/* Plans grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ATMSkeleton key={i} height="450px" />
          ))}
        </div>
      ) : isError ? (
        <ATMCard>
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Failed to load plans.
            </p>
            <ATMButton
              variant="primary"
              size="sm"
              onClick={refetch}
              icon={RefreshCw}
            >
              Retry
            </ATMButton>
          </div>
        </ATMCard>
      ) : plans.length === 0 ? (
        <ATMCard>
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No plans configured yet.
          </div>
        </ATMCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-[1.5rem] border bg-zen-card',
                'dark:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:border-accent-500/20 dark:hover:border-accent-500/10',
                plan.popular
                  ? 'border-blue-400 ring-2 ring-blue-400/20 dark:border-blue-500 dark:ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-800',
              )}
            >
              {plan.popular && (
                <div className="bg-blue-500 py-1.5 text-center text-xs font-black uppercase tracking-widest text-white">
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <StatusBadge status={plan.status} />
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(plan.monthlyPrice)}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">/mo</span>
                </div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  {formatCurrency(plan.annualPrice)}/year (save {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}%)
                </p>
              </div>

              {/* Features */}
              <div className="flex-1 p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" strokeWidth={3} />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600 mt-0.5" strokeWidth={3} />
                      )}
                      <span
                        className={cn(
                          'text-sm font-medium',
                          feature.included
                            ? 'text-gray-600 dark:text-gray-300'
                            : 'text-gray-400 line-through dark:text-gray-600',
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-slate-50/40 dark:bg-gray-950/20">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <Users className="h-4 w-4" />
                  <span>{plan.merchantCount.toLocaleString()} merchants</span>
                </div>
                <div className="flex items-center gap-3">
                  <ATMButton
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    icon={Pencil}
                    onClick={() => {}}
                  >
                    Edit
                  </ATMButton>
                  <ATMButton
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    icon={Archive}
                    onClick={() => {}}
                  >
                    Deprecate
                  </ATMButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Drawer */}
      <ATMDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create New Plan"
        subtitle="Configure pricing tiers and features"
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <ATMButton
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </ATMButton>
            <ATMButton
              onClick={() => formik.handleSubmit()}
              isLoading={isSubmitting}
            >
              Create Plan
            </ATMButton>
          </div>
        }
      >
        <FormikProvider value={formik}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ATMTextField
                name="name"
                label="Plan Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. Premium"
                required
                error={formik.touched.name && formik.errors.name}
              />
              <ATMTextField
                name="tier"
                label="Tier (key)"
                value={formik.values.tier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. premium"
                required
                error={formik.touched.tier && formik.errors.tier}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ATMTextField
                name="monthlyPrice"
                label="Monthly Price ($)"
                type="number"
                value={formik.values.monthlyPrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="0.00"
                step="0.01"
                required
                error={formik.touched.monthlyPrice && formik.errors.monthlyPrice}
              />
              <ATMTextField
                name="annualPrice"
                label="Annual Price ($)"
                type="number"
                value={formik.values.annualPrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="0.00"
                step="0.01"
                required
                error={formik.touched.annualPrice && formik.errors.annualPrice}
              />
            </div>

            <ATMTextField
              name="trialPeriod"
              label="Trial Period (days)"
              type="number"
              value={formik.values.trialPeriod}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="0"
              error={formik.touched.trialPeriod && formik.errors.trialPeriod}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                  Features
                </label>
                <ATMButton
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={addFeature}
                >
                  Add Feature
                </ATMButton>
              </div>
              <div className="space-y-3">
                {formik.values.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <ATMTextField
                      name={`features[${idx}]`}
                      value={feature}
                      onChange={(e) => updateFeature(idx, e.target.value)}
                      placeholder="Feature description"
                      className="flex-1 !gap-0"
                      error={
                        formik.touched.features &&
                        Array.isArray(formik.errors.features) &&
                        formik.errors.features[idx]
                      }
                    />
                    {formik.values.features.length > 1 && (
                      <ATMButton
                        variant="ghost"
                        size="md"
                        icon={X}
                        onClick={() => removeFeature(idx)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ATMTextField
                name="maxLocations"
                label="Max Locations"
                type="number"
                value={formik.values.maxLocations}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. 5"
                min="1"
                error={formik.touched.maxLocations && formik.errors.maxLocations}
              />
              <ATMTextField
                name="maxTerminals"
                label="Max Terminals"
                type="number"
                value={formik.values.maxTerminals}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. 10"
                min="1"
                error={formik.touched.maxTerminals && formik.errors.maxTerminals}
              />
            </div>
          </div>
        </FormikProvider>
      </ATMDrawer>
    </div>
  );
};
