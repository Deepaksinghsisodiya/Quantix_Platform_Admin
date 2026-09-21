import React, { useState } from 'react';
import { Plus, Trash2, Percent, Tag, Layers, KeyRound, Wallet, CalendarDays, Link2, Check } from 'lucide-react';
import { toast } from 'sonner';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMCheckbox } from '@/shared/ui/ATMCheckbox';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTabs } from '@/shared/ui';
import { ATMTable, ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';

import {
  useGetTaxDefinitionsQuery,
  useCreateTaxDefinitionMutation,
  useDeleteTaxDefinitionMutation,
  useGetTaxGroupsQuery,
  useCreateTaxGroupMutation,
  useDeleteTaxGroupMutation,
  useGetTaxAssociationsQuery,
  useCreateTaxAssociationMutation,
  useDeleteTaxAssociationMutation,
} from '@/modules/settings/services/settingsApi';

import type {
  CreateTaxDefinitionInput,
  CreateTaxGroupInput,
  CreateTaxAssociationInput,
} from '@/lib/api/platformTax';

import type {
  PlatformTaxDefinition,
  PlatformTaxGroup,
  PlatformTaxAssociation,
} from '@/lib/types/platformTax';

function DefinitionsTab() {
  const { data, isLoading } = useGetTaxDefinitionsQuery();
  const [createTax, { isLoading: isCreating }] = useCreateTaxDefinitionMutation();
  const [deleteTax] = useDeleteTaxDefinitionMutation();

  const [form, setForm] = useState<CreateTaxDefinitionInput>({
    taxName: '', taxCode: '', taxRate: 0, taxCategory: 'GST',
    isCompound: false, jurisdiction: 'Federal', calculationMethod: 'Exclusive',
    effectiveFromDate: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (key: keyof CreateTaxDefinitionInput, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }) as CreateTaxDefinitionInput);
    setErrors((p) => {
      if (!(key in p)) return p;
      const next = { ...p };
      delete next[key];
      return next;
    });
  };

  const validateDef = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.taxName.trim()) next.taxName = 'Tax name is required';
    else if (form.taxName.trim().length < 2) next.taxName = 'Tax name must be at least 2 characters';
    if (!form.taxCode.trim()) next.taxCode = 'Tax code is required';
    else if (!/^[A-Za-z0-9_]+$/.test(form.taxCode.trim())) next.taxCode = 'Use letters, numbers or underscore only';
    if (!form.taxRate || form.taxRate <= 0) next.taxRate = 'Rate must be greater than 0';
    if (!form.taxCategory.trim()) next.taxCategory = 'Category is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async () => {
    if (!validateDef()) return;
    try {
      await createTax(form).unwrap();
      toast.success('Tax created');
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Create failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTax(id).unwrap();
      toast.success('Tax deleted');
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Delete failed');
    }
  };

  const rows = data?.data ?? [];

  const defColumns: ATMTableColumn<PlatformTaxDefinition>[] = [
    {
      key: 'taxName',
      header: 'Name',
      renderCell: (_, r) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-sm shrink-0">
            <Percent size={14} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{r.taxName}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
              {r.taxCategory}
              {r.isCompound && (
                <span className="ml-1.5 inline-flex rounded bg-amber-100 dark:bg-amber-950/40 px-1 py-px text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Compound
                </span>
              )}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'taxCode',
      header: 'Code',
      renderCell: (_, r) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1">
          <Tag size={11} className="text-slate-400" />
          {r.taxCode}
        </span>
      ),
    },
    {
      key: 'taxRate',
      header: 'Rate',
      align: 'right',
      renderCell: (_, r) => (
        <span className="inline-flex items-baseline text-sm font-black text-slate-900 dark:text-white tabular-nums">
          {r.taxRate}
          <span className="ml-0.5 text-xs font-bold text-accent-500 dark:text-accent-400">%</span>
        </span>
      ),
    },
    {
      key: 'calculationMethod',
      header: 'Method',
      renderCell: (_, r) => (
        <ATMBadge color={r.calculationMethod === 'Inclusive' ? 'primary' : 'success'} size="sm" label={r.calculationMethod} />
      ),
    },
    {
      key: 'jurisdiction',
      header: 'Jurisdiction',
      renderCell: (_, r) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{r.jurisdiction}</span>
      ),
    },
    {
      key: 'effectiveFromDate',
      header: 'Effective',
      renderCell: (_, r) => (
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{r.effectiveFromDate}</span>
      ),
    },
  ];

  const defActions = (r: PlatformTaxDefinition): RowAction<PlatformTaxDefinition>[] => [
    { label: 'Remove Tax', icon: Trash2, variant: 'danger', onClick: () => handleDelete(r.taxDefinitionId) },
  ];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <ATMCard
        className="glass-card"
        header={
          <div className="relative flex items-center gap-3">
            <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
              <Percent size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">New Tax Definition</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold">Add a tax slab — name, rate, jurisdiction &amp; calculation method</p>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          <div className="lg:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ATMTextField
              name="taxName"
              label="Name"
              placeholder="e.g. GST 18%"
              value={form.taxName}
              error={errors.taxName}
              onChange={(e) => setField('taxName', e.target.value)}
            />
            <ATMTextField
              name="taxCode"
              label="Code"
              placeholder="e.g. GST_18"
              value={form.taxCode}
              error={errors.taxCode}
              onChange={(e) => setField('taxCode', e.target.value)}
            />
            <ATMTextField
              name="taxRate"
              type="number"
              label="Rate %"
              placeholder="Rate %"
              value={form.taxRate}
              error={errors.taxRate}
              onChange={(e) => setField('taxRate', Number(e.target.value))}
            />
            <ATMTextField
              name="taxCategory"
              label="Category"
              placeholder="GST/VAT/Sales"
              value={form.taxCategory}
              error={errors.taxCategory}
              onChange={(e) => setField('taxCategory', e.target.value)}
            />
          </div>
          <ATMSelectField
            name="jurisdiction"
            label="Jurisdiction"
            value={form.jurisdiction}
            onChange={(val) => setField('jurisdiction', (val ? String(val) : 'Federal') as CreateTaxDefinitionInput['jurisdiction'])}
            options={[
              { label: 'Federal', value: 'Federal' },
              { label: 'State', value: 'State' },
              { label: 'County', value: 'County' },
              { label: 'City', value: 'City' },
            ]}
          />
          <ATMSelectField
            name="calculationMethod"
            label="Calculation Method"
            value={form.calculationMethod}
            onChange={(val) => setField('calculationMethod', (val ? String(val) : 'Exclusive') as CreateTaxDefinitionInput['calculationMethod'])}
            options={[
              { label: 'Exclusive', value: 'Exclusive' },
              { label: 'Inclusive', value: 'Inclusive' },
            ]}
          />
          <div className="flex items-end pb-3">
            <ATMCheckbox
              name="isCompound"
              label="Compound Tax"
              checked={form.isCompound}
              onChange={(checked) => setForm({ ...form, isCompound: checked })}
            />
          </div>
          <div className="flex items-end">
            <ATMButton variant="primary" size="md" icon={Plus} className="w-full" disabled={isCreating} onClick={handleCreate}>
              Add
            </ATMButton>
          </div>
        </div>
      </ATMCard>

      <div className="rounded-2xl border border-[var(--zen-border)] bg-white/80 dark:bg-[#13151a]/90 backdrop-blur-2xl overflow-hidden shadow-sm h-[440px]">
        {isLoading ? (
          <div className="space-y-3 p-6">
            <ATMSkeleton className="h-12 w-full" />
            <ATMSkeleton className="h-12 w-full" />
            <ATMSkeleton className="h-12 w-full" />
          </div>
        ) : (
          <ATMTable
            data={rows}
            columns={defColumns}
            rowActions={defActions}
            emptyMessage="No tax definitions yet."
          />
        )}
      </div>
    </div>
  );
}

function GroupsTab() {
  const { data: groupsData, isLoading } = useGetTaxGroupsQuery();
  const { data: defsData } = useGetTaxDefinitionsQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateTaxGroupMutation();
  const [deleteGroup] = useDeleteTaxGroupMutation();

  const [form, setForm] = useState<CreateTaxGroupInput>({
    groupName: '', groupCode: '', description: '', isDefault: false, taxDefinitionIds: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (key: keyof CreateTaxGroupInput, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }) as CreateTaxGroupInput);
    setErrors((p) => {
      if (!(key in p)) return p;
      const next = { ...p };
      delete next[key];
      return next;
    });
  };

  const validateGroup = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.groupName.trim()) next.groupName = 'Group name is required';
    else if (form.groupName.trim().length < 2) next.groupName = 'Group name must be at least 2 characters';
    if (!form.groupCode.trim()) next.groupCode = 'Group code is required';
    else if (!/^[A-Za-z0-9_]+$/.test(form.groupCode.trim())) next.groupCode = 'Use letters, numbers or underscore only';
    if (form.taxDefinitionIds.length === 0) next.taxDefinitionIds = 'Select at least one tax to include';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async () => {
    if (!validateGroup()) return;
    try {
      await createGroup(form).unwrap();
      toast.success('Group created');
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Create failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGroup(id).unwrap();
      toast.success('Group deleted');
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Delete failed');
    }
  };

  const groups = groupsData?.data ?? [];
  const defs = defsData?.data ?? [];

  const groupColumns: ATMTableColumn<PlatformTaxGroup>[] = [
    {
      key: 'groupName',
      header: 'Name',
      renderCell: (_, g) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-sm shrink-0">
            <Layers size={14} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{g.groupName}</span>
            {g.description && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{g.description}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'groupCode',
      header: 'Code',
      renderCell: (_, g) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1">
          <Tag size={11} className="text-slate-400" />
          {g.groupCode}
        </span>
      ),
    },
    {
      key: 'taxes',
      header: 'Taxes',
      renderCell: (_, g) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {g.taxes.map((t: PlatformTaxDefinition) => (
            <span
              key={t.taxDefinitionId}
              className="inline-flex items-center gap-1 rounded-md bg-accent-50 dark:bg-accent-900/20 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-accent-100/60 dark:border-accent-900/40"
            >
              {t.taxName}
              <span className="text-accent-500 dark:text-accent-400">{t.taxRate}%</span>
            </span>
          ))}
          {g.taxes.length === 0 && (
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'isDefault',
      header: 'Default',
      renderCell: (_, g) =>
        g.isDefault ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Check size={11} strokeWidth={3} /> Default
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-300 dark:text-slate-600">—</span>
        ),
    },
  ];

  const groupActions = (g: PlatformTaxGroup): RowAction<PlatformTaxGroup>[] => [
    { label: 'Remove Group', icon: Trash2, variant: 'danger', onClick: () => handleDelete(g.taxGroupId) },
  ];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <ATMCard
        className="glass-card"
        header={
          <div className="relative flex items-center gap-3">
            <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">New Tax Group</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold">Bundle one or more taxes into a reusable group</p>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">
          <ATMTextField
            name="groupName"
            label="Group Name"
            placeholder="Group name"
            value={form.groupName}
            error={errors.groupName}
            onChange={(e) => setField('groupName', e.target.value)}
          />
          <ATMTextField
            name="groupCode"
            label="Group Code"
            placeholder="Code"
            value={form.groupCode}
            error={errors.groupCode}
            onChange={(e) => setField('groupCode', e.target.value)}
          />
          <div className="sm:col-span-2">
            <ATMTextField
              name="description"
              label="Description"
              placeholder="Description"
              value={form.description ?? ''}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-gray-550 dark:text-gray-400">Include Taxes</label>
            <div className={`mt-1.5 max-h-32 overflow-y-auto rounded-xl border p-2 text-sm flex flex-col gap-0.5 font-semibold ${errors.taxDefinitionIds ? 'border-red-300 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/10' : 'border-[var(--zen-border)] bg-slate-50/40 dark:bg-slate-950/20'}`}>
              {defs.length === 0 && (
                <p className="px-2.5 py-2 text-xs text-slate-400 dark:text-slate-500">No tax definitions yet — add one in the Definitions tab first.</p>
              )}
              {defs.map((d: PlatformTaxDefinition) => (
                <label key={d.taxDefinitionId} className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 hover:bg-white dark:hover:bg-slate-800/60 transition-colors">
                  <ATMCheckbox
                    name={d.taxDefinitionId}
                    checked={form.taxDefinitionIds.includes(d.taxDefinitionId)}
                    onChange={(checked) => {
                      const next = checked
                        ? [...form.taxDefinitionIds, d.taxDefinitionId]
                        : form.taxDefinitionIds.filter((id) => id !== d.taxDefinitionId);
                      setForm({ ...form, taxDefinitionIds: next });
                      setErrors((p) => { const n = { ...p }; delete n.taxDefinitionIds; return n; });
                    }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{d.taxName}</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-accent-50 dark:bg-accent-900/20 px-1.5 py-0.5 text-[10px] font-bold text-accent-500 dark:text-accent-400 tabular-nums">
                    <Percent size={10} strokeWidth={2.5} /> {d.taxRate}% · {d.calculationMethod}
                  </span>
                </label>
              ))}
            </div>
            {errors.taxDefinitionIds && (
              <p className="mt-1 text-[10px] font-black uppercase tracking-tight text-red-500 dark:text-red-400">{errors.taxDefinitionIds}</p>
            )}
          </div>
          <div className="flex items-end pb-3">
            <ATMCheckbox
              name="isDefault"
              label="Default Group"
              checked={form.isDefault}
              onChange={(checked) => setForm({ ...form, isDefault: checked })}
            />
          </div>
          <div className="flex items-end">
            <ATMButton variant="primary" size="md" icon={Plus} className="w-full" disabled={isCreating} onClick={handleCreate}>
              Add Group
            </ATMButton>
          </div>
        </div>
      </ATMCard>

      <div className="rounded-2xl border border-[var(--zen-border)] bg-white/80 dark:bg-[#13151a]/90 backdrop-blur-2xl overflow-hidden shadow-sm h-[440px]">
        {isLoading ? (
          <div className="space-y-3 p-6">
            <ATMSkeleton className="h-12 w-full" />
            <ATMSkeleton className="h-12 w-full" />
          </div>
        ) : (
          <ATMTable
            data={groups}
            columns={groupColumns}
            rowActions={groupActions}
            emptyMessage="No tax groups yet."
          />
        )}
      </div>
    </div>
  );
}

/**
 * 2026-08-08 (user-locked tax model): the Platform sells exactly THREE taxable natures —
 * Daily Subscription, Commission, Token Purchase. This tab maps each nature to a tax group.
 * Every nature inherits the seeded All-sales default (Standard Tax Group) until a specific
 * group is chosen; picking the default group again reverts the nature to inherited.
 * Merchant-specific tax (exemption certificates) is a FUTURE concept — the backend keeps
 * merchant/plan targeting for it, but this screen deliberately does not expose it.
 */
const SALE_NATURES: ReadonlyArray<{
  scope: 'Subscription' | 'Commission' | 'LicenseTokenSale' | 'ServiceTokenRecharge';
  label: string;
  hint: string;
  icon: typeof CalendarDays;
  gradient: string;
  shadow: string;
}> = [
  { scope: 'Subscription', label: 'Daily Subscription', hint: 'Daily plan charge billed to Enterprise merchants (taxed on the periodic invoice under the Settlement tax point)', icon: CalendarDays, gradient: 'from-primary-600 to-primary-400', shadow: 'shadow-primary-500/20' },
  { scope: 'Commission', label: 'Commission', hint: 'Commission on Enterprise merchant billing revenue (taxed on the periodic invoice under the Settlement tax point)', icon: Percent, gradient: 'from-primary-600 to-primary-400', shadow: 'shadow-primary-500/20' },
  { scope: 'LicenseTokenSale', label: 'License Token Sale', hint: 'Outright license token sales to Standalone merchants — always taxed at purchase', icon: KeyRound, gradient: 'from-primary-600 to-primary-400', shadow: 'shadow-primary-500/20' },
  { scope: 'ServiceTokenRecharge', label: 'Service Token Recharge', hint: 'Enterprise wallet recharges — taxed only when the Enterprise tax point (Billing Cycle screen) is set to Recharge', icon: Wallet, gradient: 'from-primary-600 to-primary-400', shadow: 'shadow-primary-500/20' },
];

function AssociationsTab() {
  const { data: assocData, isLoading } = useGetTaxAssociationsQuery();
  const { data: groupsData } = useGetTaxGroupsQuery();
  const [createAssoc] = useCreateTaxAssociationMutation();
  const [deleteAssoc] = useDeleteTaxAssociationMutation();

  const groups = groupsData?.data ?? [];
  // Deployment-level rows only — merchant/plan targeting is reserved for the future
  // tax-exemption concept and never shown here.
  const defaults = (assocData?.data ?? []).filter((a: PlatformTaxAssociation) => !a.planId && !a.merchantId);
  const allAssoc = defaults.find((a: PlatformTaxAssociation) => a.scope === 'All');
  const exactFor = (scope: string) => defaults.find((a: PlatformTaxAssociation) => a.scope === scope);
  const effectiveGroupId = (scope: string) => exactFor(scope)?.taxGroupId ?? allAssoc?.taxGroupId ?? '';

  const [pending, setPending] = useState<Record<string, string>>({});
  const [savingScope, setSavingScope] = useState<string | null>(null);

  const groupName = (id: string) => groups.find((g: PlatformTaxGroup) => g.taxGroupId === id)?.groupName ?? '—';

  const handleSave = async (scope: 'Subscription' | 'Commission' | 'LicenseTokenSale' | 'ServiceTokenRecharge', label: string) => {
    const selected = pending[scope];
    if (!selected || selected === effectiveGroupId(scope)) return;
    setSavingScope(scope);
    try {
      const exact = exactFor(scope);
      if (exact) await deleteAssoc(exact.associationId).unwrap();
      if (selected !== allAssoc?.taxGroupId) {
        await createAssoc({
          taxGroupId: selected,
          scope,
          planId: null,
          merchantId: null,
          effectiveFromDate: new Date().toISOString().slice(0, 10),
        }).unwrap();
        toast.success(`${label} now uses "${groupName(selected)}".`);
      } else {
        toast.success(`${label} reverted to the all-sales default ("${groupName(selected)}").`);
      }
      setPending((p) => { const { [scope]: _drop, ...rest } = p; return rest; });
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || `Failed to update tax for ${label}.`);
    } finally {
      setSavingScope(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        <ATMSkeleton className="h-16 w-full" />
        <ATMSkeleton className="h-16 w-full" />
        <ATMSkeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* Inherited default */}
      <div className="relative overflow-hidden flex items-start gap-3.5 rounded-2xl border border-[var(--zen-border)] bg-primary-50/60 p-4 dark:bg-primary-900/20">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary-500/10 blur-2xl" />
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0 relative">
          <Link2 size={18} strokeWidth={2.2} />
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold min-w-0 relative">
          <p className="font-black">
            All-sales default: {allAssoc ? groupName(allAssoc.taxGroupId) : 'not configured'}
          </p>
          <p className="mt-0.5 font-medium">
            Every sale nature below inherits this group unless you point it at a specific one.
            Selecting the default group again reverts a nature to inherited.
          </p>
        </div>
      </div>

      <ATMCard
        className="glass-card"
        header={
          <div className="relative flex items-center gap-3">
            <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 shrink-0">
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Tax group per sale nature</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold">Map each revenue type to the tax group that applies to it</p>
            </div>
          </div>
        }
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {SALE_NATURES.map(({ scope, label, hint, icon: Icon, gradient, shadow }) => {
            const exact = exactFor(scope);
            const effective = effectiveGroupId(scope);
            const selected = pending[scope] ?? effective;
            const dirty = selected !== effective;
            return (
              <div key={scope} className="flex flex-col lg:flex-row lg:items-center gap-3.5 py-4 first:pt-2 last:pb-2">
                <div className="flex-1 min-w-0 flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md ${shadow} shrink-0`}>
                    <Icon size={17} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-gray-900 dark:text-white">{label}</span>
                      <ATMBadge
                        size="sm"
                        color={exact ? 'primary' : 'default'}
                        label={exact ? 'Specific' : 'Inherits default'}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{hint}</p>
                  </div>
                </div>
                <div className="w-full lg:w-64 shrink-0">
                  <ATMSelectField
                    name={`assoc-${scope}`}
                    label=""
                    value={selected}
                    onChange={(val) => setPending((p) => ({ ...p, [scope]: val ? String(val) : '' }))}
                    options={groups.map((g: PlatformTaxGroup) => ({ label: g.groupName, value: g.taxGroupId }))}
                  />
                </div>
                <ATMButton
                  variant="primary"
                  size="sm"
                  className="shrink-0"
                  disabled={!dirty || savingScope === scope}
                  isLoading={savingScope === scope}
                  onClick={() => handleSave(scope, label)}
                >
                  Apply
                </ATMButton>
              </div>
            );
          })}
        </div>
      </ATMCard>

      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold px-1">
        Merchant-specific tax exemptions (with certificate upload) are planned for a future release.
      </p>
    </div>
  );
}

export function TaxConfigPage() {
  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-md shadow-primary-500/20 shrink-0">
          <Percent size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          {/* 2026-08-08: page titles match the sidebar label (user rule — applies everywhere). */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Tax Settings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            Define taxes, group them, and map each sale nature — daily subscription, commission, token purchase — to a tax group.
          </p>
        </div>
      </div>

      <ATMTabs
        tabs={[
          { label: 'Definitions', content: <DefinitionsTab /> },
          { label: 'Groups', content: <GroupsTab /> },
          { label: 'Associations', content: <AssociationsTab /> },
        ]}
      />
    </div>
  );
}

export default TaxConfigPage;
