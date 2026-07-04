import React, { useState } from 'react';
import { FormikProvider } from 'formik';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMTable, ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import {
  Check,
  Plus,
  Pencil,
  Archive,
  Users,
  X,
  MapPin,
  Monitor,
  Building,
  Store,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import type { Plan } from './PlanManagementWrapper';

interface PlanManagementViewProps {
  plans: Plan[];
  allPlansCount: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;

  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  editingPlan: Plan | null;
  deletingPlan: Plan | null;
  setDeletingPlan: (plan: Plan | null) => void;

  handleOpenCreate: () => void;
  handleOpenEdit: (plan: Plan) => void;
  handleToggleStatus: (planId: string) => void;
  handleConfirmDelete: () => Promise<void>;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'active' | 'inactive' | 'deprecated';
  setStatusFilter: (filter: 'all' | 'active' | 'inactive' | 'deprecated') => void;
  typeFilter: 'all' | 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud';
  setTypeFilter: (filter: 'all' | 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud') => void;

  formik: any;
  addFeatureRow: () => void;
  removeFeatureRow: (idx: number) => void;
  toggleFeatureIncluded: (idx: number) => void;
  isSubmitting: boolean;
  autoCalculate: boolean;
  setAutoCalculate: (val: boolean) => void;
}

const ALL_FEATURES = [
  { key: 'INV', label: 'Inventory Management' },
  { key: 'FIN', label: 'Finance / Accounting' },
  { key: 'HRM', label: 'HR & Staff Management' },
  { key: 'MKT', label: 'Marketing & Loyalty' },
  { key: 'ANL', label: 'Analytics & Reports' },
  { key: 'WTM', label: 'Workforce / Table-Turn' },
];

const ALL_PAYMENTS = [
  { key: 'CSH', label: 'Cash' },
  { key: 'CRD', label: 'Card (POS/EDC)' },
  { key: 'EXT', label: 'UPI / QR / Online' },
  { key: 'GFT', label: 'Gift Card' },
  { key: 'STC', label: 'Store Credit' },
  { key: 'WLT', label: 'In-app Wallet' },
  { key: 'CSL', label: 'Credit Sale / Udhar' },
];

const ALL_SERVICES = [
  { key: 'DIN', label: 'Dine-In' },
  { key: 'CTR', label: 'Counter / Takeaway' },
  { key: 'PUP', label: 'Pickup' },
  { key: 'DLV', label: 'Delivery' },
  { key: 'CTG', label: 'Catering / Bulk' },
  { key: 'SNP', label: 'QR / Self-Order' },
  { key: 'RSO', label: 'Reservation Order' },
  { key: 'WOR', label: 'Web Ordering' },
  { key: 'WRV', label: 'Waitlist / Reservation' },
];

const ALL_LIMITS = [
  { key: 'MBU', label: 'Business Units' },
  { key: 'MLO', label: 'Locations / Outlets' },
  { key: 'MTM', label: 'POS Terminals' },
  { key: 'MPR', label: 'Products' },
  { key: 'MPG', label: 'Product Groups' },
  { key: 'MGB', label: 'Storage (GB)' },
  { key: 'MDP', label: 'Delivery Partners' },
  { key: 'MKD', label: 'Kitchen Displays' },
  { key: 'MDS', label: 'Dine-in Sections' },
  { key: 'MIS', label: 'Integration Slots' },
  { key: 'MPW', label: 'Payment Gateways' },
  { key: 'MRS', label: 'Reservation Slots/day' },
  { key: 'MAC', label: 'Active Campaigns' },
  { key: 'MWR', label: 'Warehouses' },
  { key: 'MWE', label: 'Staff Logins' },
  { key: 'MBR', label: 'Branches' },
];

// Reusable Switch Grid component
const ToggleGrid: React.FC<{
  label: string;
  count: string;
  items: { key: string; label: string }[];
  field: string;
  formik: any;
}> = ({ label, count, items, field, formik }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between px-1 border-b border-slate-100 dark:border-slate-800 pb-1">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <span className="text-[10px] text-gray-400 font-bold">{count}</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
      {items.map(({ key, label: name }) => {
        const isOn = !!formik.values[field]?.[key];
        return (
          <div
            key={key}
            className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-gray-50/50 dark:bg-gray-900 border border-gray-150/40 dark:border-gray-800"
          >
            <span className={cn('text-xs font-semibold', isOn ? 'text-gray-900 dark:text-white' : 'text-gray-400')}>
              {name}
            </span>
            <ATMSwitch
              name={`${field}.${key}`}
              checked={isOn}
              onChange={(c) => formik.setFieldValue(`${field}.${key}`, c)}
              size="sm"
            />
          </div>
        );
      })}
    </div>
  </div>
);

export const PlanManagementView: React.FC<PlanManagementViewProps> = ({
  plans,
  allPlansCount,
  isLoading,
  isError,
  refetch,
  viewMode,
  setViewMode,
  modalOpen,
  setModalOpen,
  editingPlan,
  deletingPlan,
  setDeletingPlan,
  handleOpenCreate,
  handleOpenEdit,
  handleToggleStatus,
  handleConfirmDelete,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  formik,
  addFeatureRow,
  removeFeatureRow,
  toggleFeatureIncluded,
  isSubmitting,
  autoCalculate,
  setAutoCalculate,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'details' | 'features' | 'limits' | 'marketing'>('details');

  const columns: ATMTableColumn<Plan>[] = [
    {
      key: 'name',
      header: 'Plan Name',
      renderCell: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-sm shrink-0"
            style={{ backgroundColor: row.color || '#3b82f6' }}
          >
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                {row.name}
              </span>
              {row.popular && (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-wider border border-amber-500/20">
                  Popular
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-bold">Priority: {row.priority}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'planType',
      header: 'Plan Type',
      renderCell: (_, row) => {
        let badgeColor: 'purple' | 'success' | 'blue' = 'purple';
        if (row.planType === 'Standalone POS') badgeColor = 'success';
        if (row.planType === 'Standalone Cloud') badgeColor = 'blue';

        return <ATMBadge color={badgeColor} label={row.planType} size="sm" />;
      },
      width: '160px',
    },
    {
      key: 'pricingCycles',
      header: 'Pricing Cycles (D/W/M/Y)',
      renderCell: (_, row) => (
        <div className="flex flex-col text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>
            Daily: <strong>${row.dailyPrice}</strong> | Weekly: <strong>${row.weeklyPrice}</strong>
          </span>
          <span className="text-gray-400 font-bold text-[10px]">
            Monthly: <strong>${row.monthlyPrice}</strong> | Yearly: <strong>${row.yearlyPrice}</strong>
          </span>
        </div>
      ),
      width: '260px',
    },
    {
      key: 'maxLocations',
      header: 'Limits & Capacity',
      renderCell: (_, row) => (
        <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-blue-500" /> {row.maxLocations === 0 ? 'Unlimited' : `${row.maxLocations} stores`}
          </span>
          <span className="flex items-center gap-1">
            <Monitor className="h-3.5 w-3.5 text-purple-500" /> {row.maxTerminals === 0 ? 'Unlimited' : `${row.maxTerminals} POS`}
          </span>
        </div>
      ),
    },
    {
      key: 'merchantCount',
      header: 'Subscribers',
      renderCell: (_, row) => (
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-gray-700 dark:text-gray-300">
          <Users className="h-3.5 w-3.5 text-gray-400" /> {row.merchantCount} merchants
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Switch',
      renderCell: (_, row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.status} />
          <ATMSwitch
            name={`switch-${row.id}`}
            checked={row.status === 'Active'}
            onChange={() => handleToggleStatus(row.id)}
            size="sm"
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (_, row) => (
        <div className="flex items-center gap-1.5">
          <ATMButton
            variant="outline"
            size="sm"
            icon={Pencil}
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </ATMButton>
          <ATMButton
            variant="ghost"
            size="sm"
            icon={Archive}
            onClick={() => setDeletingPlan(row)}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          />
        </div>
      ),
    },
  ];

  const formTabs = [
    { id: 'details', label: 'Basic Info & Prices' },
    { id: 'features', label: 'Features config' },
    { id: 'limits', label: 'System Limits' },
    { id: 'marketing', label: 'Marketing Labels' },
  ] as const;

  return (
    <div className="space-y-6">
      <ATMPageHeader
        title="Subscription Plans"
        subtitle="Configure pricing cycles, module features, and capacity limits for client accounts"
        action={{
          label: 'Create Plan',
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      {/* FILTER & STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ATMCard className="p-5 flex items-center justify-between border border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Tiers</p>
            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{plans.length}</p>
          </div>
          <Building className="h-7 w-7 text-blue-500 opacity-60" />
        </ATMCard>
        <ATMCard className="p-5 flex items-center justify-between border border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Signups</p>
            <p className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-500">{plans.filter((p) => p.status === 'Active').length}</p>
          </div>
          <Check className="h-7 w-7 text-emerald-500 opacity-60" />
        </ATMCard>
        <div className="md:col-span-2 flex gap-3 items-center justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Types</option>
            <option value="Standalone POS">Standalone POS</option>
            <option value="Standalone Cloud">Standalone Cloud</option>
            <option value="Enterprise cloud">Enterprise cloud</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <ATMCard className="overflow-hidden p-0 border border-gray-200 dark:border-gray-800">
        <ATMTable data={plans} columns={columns} />
      </ATMCard>

      {/* CREATE & EDIT MODAL */}
      <ATMModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? `Edit Subscription Plan: ${editingPlan.name}` : 'Create New Subscription Plan'}
        subtitle="Set up multi-cycle pricing, entitlements, and limits"
        size="3xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full border-t border-gray-100 dark:border-gray-800 pt-4">
            <ATMButton variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </ATMButton>
            <ATMButton
              type="button"
              variant="primary"
              onClick={() => formik.handleSubmit()}
              isLoading={isSubmitting}
            >
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </ATMButton>
          </div>
        }
      >
        <div className="space-y-4">
          {/* TAB BAR */}
          <div className="flex border-b border-gray-150 dark:border-gray-850 gap-1 overflow-x-auto">
            {formTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFormTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap',
                  activeFormTab === tab.id
                    ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit} className="space-y-4 pt-1 max-h-[480px] overflow-y-auto pr-1">
              
              {/* TAB 1: DETAILS & PRICING */}
              {activeFormTab === 'details' && (
                <div className="space-y-4">
                  {/* Row 1: Name & Type & Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ATMTextField
                      name="name"
                      label="Plan Display Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      placeholder="e.g. Pro Enterprise"
                      required
                    />
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Plan Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="planType"
                        value={formik.values.planType}
                        onChange={formik.handleChange}
                        className="w-full rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-950 px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="Standalone POS">Standalone POS</option>
                        <option value="Standalone Cloud">Standalone Cloud</option>
                        <option value="Enterprise cloud">Enterprise cloud</option>
                      </select>
                    </div>
                    <ATMTextField
                      name="priority"
                      label="Priority Rank"
                      type="number"
                      value={formik.values.priority}
                      onChange={formik.handleChange}
                      placeholder="1"
                      required
                    />
                  </div>

                  {/* AUTO CALCULATE SWITCH */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">Auto-calculate Prices</p>
                      <p className="text-[10px] text-gray-400 font-bold">Use active Rate Card formulas to calculate default pricing</p>
                    </div>
                    <ATMSwitch
                      name="autoCalcToggle"
                      checked={autoCalculate}
                      onChange={(val) => {
                        setAutoCalculate(val);
                        if (val) {
                          formik.setFieldValue('isManualPrice', false);
                        }
                      }}
                      size="sm"
                    />
                  </div>

                  {/* ── Manual Override Section ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-amber-250/20 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-amber-700 dark:text-amber-500">Enable Manual Price Override</p>
                        <p className="text-[10px] text-gray-400 font-bold">Manually override calculated cycle prices with a custom price</p>
                      </div>
                      <ATMSwitch
                        name="isManualPrice"
                        checked={formik.values.isManualPrice}
                        onChange={(c) => {
                          formik.setFieldValue('isManualPrice', c);
                          if (c) {
                            setAutoCalculate(false);
                          }
                        }}
                        size="sm"
                      />
                    </div>
                    {formik.values.isManualPrice && (
                      <ATMTextField
                        name="manualPrice"
                        label="Custom Manual Price ($)"
                        type="number"
                        value={formik.values.manualPrice}
                        onChange={formik.handleChange}
                        placeholder="e.g. 99"
                        required
                      />
                    )}
                  </div>

                  {/* PRICING CYCLES */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pricing Cycles ($)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <ATMTextField
                        name="dailyPrice"
                        label="Daily Price"
                        type="number"
                        value={formik.values.dailyPrice}
                        onChange={(e) => {
                          formik.handleChange(e);
                          setAutoCalculate(false);
                        }}
                        required
                      />
                      <ATMTextField
                        name="weeklyPrice"
                        label="Weekly Price"
                        type="number"
                        value={formik.values.weeklyPrice}
                        onChange={(e) => {
                          formik.handleChange(e);
                          setAutoCalculate(false);
                        }}
                        required
                      />
                      <ATMTextField
                        name="monthlyPrice"
                        label="Monthly Price"
                        type="number"
                        value={formik.values.monthlyPrice}
                        onChange={(e) => {
                          formik.handleChange(e);
                          setAutoCalculate(false);
                        }}
                        required
                      />
                      <ATMTextField
                        name="yearlyPrice"
                        label="Yearly Price"
                        type="number"
                        value={formik.values.yearlyPrice}
                        onChange={(e) => {
                          formik.handleChange(e);
                          setAutoCalculate(false);
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <ATMTextField
                      name="trialPeriod"
                      label="Trial Period (Days)"
                      type="number"
                      value={formik.values.trialPeriod}
                      onChange={formik.handleChange}
                    />
                    <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Popular badge</p>
                        <p className="text-[10px] text-gray-400 font-medium">Highlight this plan as recommended</p>
                      </div>
                      <ATMSwitch
                        name="popular"
                        checked={formik.values.popular}
                        onChange={(c) => formik.setFieldValue('popular', c)}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FEATURES CONFIG */}
              {activeFormTab === 'features' && (
                <div className="space-y-4">
                  <ToggleGrid
                    label="Module entitlements"
                    count={`${ALL_FEATURES.filter((f) => !!formik.values.planFeatures?.[f.key]).length} Enabled`}
                    items={ALL_FEATURES}
                    field="planFeatures"
                    formik={formik}
                  />
                  <ToggleGrid
                    label="Payment gateways"
                    count={`${ALL_PAYMENTS.filter((p) => !!formik.values.planPayments?.[p.key]).length} Enabled`}
                    items={ALL_PAYMENTS}
                    field="planPayments"
                    formik={formik}
                  />
                  <ToggleGrid
                    label="Order types"
                    count={`${ALL_SERVICES.filter((s) => !!formik.values.planServices?.[s.key]).length} Enabled`}
                    items={ALL_SERVICES}
                    field="planServices"
                    formik={formik}
                  />
                </div>
              )}

              {/* TAB 3: SYSTEM LIMITS */}
              {activeFormTab === 'limits' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Quota Threshold Constraints
                    </p>
                    <span className="text-[10px] text-gray-400 font-bold">0 = Unlimited capacity</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {ALL_LIMITS.map(({ key, label: name }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-gray-50/50 dark:bg-gray-900 border border-gray-150/40 dark:border-gray-800"
                      >
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                          {name}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={formik.values.planLimits?.[key] ?? 0}
                          onChange={(e) => formik.setFieldValue(`planLimits.${key}`, Number(e.target.value) || 0)}
                          className="w-14 text-right text-xs font-mono font-bold px-1.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MARKETING LABELS */}
              {activeFormTab === 'marketing' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Marketing Card Bullet Points ({formik.values.features.length})
                    </label>
                    <ATMButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Plus}
                      onClick={addFeatureRow}
                      className="text-blue-600 hover:bg-blue-50/30"
                    >
                      Add Bullet Point
                    </ATMButton>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {formik.values.features.map((feat: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFeatureIncluded(idx)}
                          className={cn(
                            'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer',
                            feat.included
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                          )}
                        >
                          {feat.included ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4 stroke-[2]" />}
                        </button>
                        <ATMTextField
                          name={`features[${idx}].text`}
                          value={feat.text}
                          onChange={formik.handleChange}
                          placeholder={`Feature line item ${idx + 1}`}
                          className="flex-1 !gap-0"
                        />
                        {formik.values.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeatureRow(idx)}
                            className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </FormikProvider>
        </div>
      </ATMModal>

      <ATMConfirmModal
        isOpen={!!deletingPlan}
        title={`Remove Subscription Plan "${deletingPlan?.name}"?`}
        description="Are you sure you want to permanently deprecate this plan? Active accounts won't be disconnected immediately but it will be hidden from new merchant setups."
        confirmLabel="Yes, Deprecate"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPlan(null)}
      />
    </div>
  );
};
export default PlanManagementView;
