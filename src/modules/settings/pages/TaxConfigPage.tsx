import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMCheckbox } from '@/shared/ui/ATMCheckbox';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTabs } from '@/shared/ui';

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

  const handleCreate = async () => {
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

  return (
    <div className="flex flex-col gap-6 pt-2">
      <ATMCard title="New Tax" className="glass-card">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          <ATMTextField
            name="taxName"
            label="Name"
            placeholder="e.g. GST 18%"
            value={form.taxName}
            onChange={(e) => setForm({ ...form, taxName: e.target.value })}
          />
          <ATMTextField
            name="taxCode"
            label="Code"
            placeholder="e.g. GST_18"
            value={form.taxCode}
            onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
          />
          <ATMTextField
            name="taxRate"
            type="number"
            label="Rate %"
            placeholder="Rate %"
            value={form.taxRate}
            onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
          />
          <ATMTextField
            name="taxCategory"
            label="Category"
            placeholder="GST/VAT/Sales"
            value={form.taxCategory}
            onChange={(e) => setForm({ ...form, taxCategory: e.target.value })}
          />
          <ATMSelectField
            name="jurisdiction"
            label="Jurisdiction"
            value={form.jurisdiction}
            onChange={(val) => setForm({ ...form, jurisdiction: (val ? String(val) : 'Federal') as CreateTaxDefinitionInput['jurisdiction'] })}
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
            onChange={(val) => setForm({ ...form, calculationMethod: (val ? String(val) : 'Exclusive') as CreateTaxDefinitionInput['calculationMethod'] })}
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

      {isLoading ? (
        <div className="space-y-3">
          <ATMSkeleton className="h-10 w-full" />
          <ATMSkeleton className="h-10 w-full" />
          <ATMSkeleton className="h-10 w-full" />
        </div>
      ) : (
        <ATMCard padding="none" className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-250 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30 text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5 text-right">Rate</th>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-4 py-3.5">Jurisdiction</th>
                  <th className="px-4 py-3.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold">
                {rows.map((r: PlatformTaxDefinition) => (
                  <tr key={r.taxDefinitionId} className="transition-colors hover:bg-gray-55/40 dark:hover:bg-gray-800/10">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-bold">{r.taxName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{r.taxCode}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-900 dark:text-white font-bold">{r.taxRate}%</td>
                    <td className="px-4 py-3">
                      <ATMBadge color={r.calculationMethod === 'Inclusive' ? 'primary' : 'success'} size="sm" label={r.calculationMethod} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.jurisdiction}</td>
                    <td className="px-4 py-3 text-right">
                      <ATMButton variant="ghost" size="sm" onClick={() => handleDelete(r.taxDefinitionId)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </ATMButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ATMCard>
      )}
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

  const handleCreate = async () => {
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

  return (
    <div className="flex flex-col gap-6 pt-2">
      <ATMCard title="New Tax Group" className="glass-card">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-2">
          <ATMTextField
            name="groupName"
            label="Group Name"
            placeholder="Group name"
            value={form.groupName}
            onChange={(e) => setForm({ ...form, groupName: e.target.value })}
          />
          <ATMTextField
            name="groupCode"
            label="Group Code"
            placeholder="Code"
            value={form.groupCode}
            onChange={(e) => setForm({ ...form, groupCode: e.target.value })}
          />
          <div className="sm:col-span-2">
            <ATMTextField
              name="description"
              label="Description"
              placeholder="Description"
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-gray-550 dark:text-gray-400">Include Taxes</label>
            <div className="mt-1.5 max-h-32 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/20 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/10 flex flex-col gap-2 font-semibold">
              {defs.map((d: PlatformTaxDefinition) => (
                <label key={d.taxDefinitionId} className="flex items-center gap-2.5 cursor-pointer">
                  <ATMCheckbox
                    name={d.taxDefinitionId}
                    checked={form.taxDefinitionIds.includes(d.taxDefinitionId)}
                    onChange={(checked) => {
                      const next = checked
                        ? [...form.taxDefinitionIds, d.taxDefinitionId]
                        : form.taxDefinitionIds.filter((id) => id !== d.taxDefinitionId);
                      setForm({ ...form, taxDefinitionIds: next });
                    }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {d.taxName} ({d.taxRate}% {d.calculationMethod})
                  </span>
                </label>
              ))}
            </div>
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

      {isLoading ? (
        <div className="space-y-3">
          <ATMSkeleton className="h-10 w-full" />
          <ATMSkeleton className="h-10 w-full" />
        </div>
      ) : (
        <ATMCard padding="none" className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-250 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30 text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Taxes</th>
                  <th className="px-4 py-3.5">Default</th>
                  <th className="px-4 py-3.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold">
                {groups.map((g: PlatformTaxGroup) => (
                  <tr key={g.taxGroupId} className="transition-colors hover:bg-gray-55/40 dark:hover:bg-gray-800/10">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-bold">{g.groupName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{g.groupCode}</td>
                    <td className="px-4 py-3 text-xs text-gray-650 dark:text-gray-400">{g.taxes.map(t => `${t.taxName} (${t.taxRate}%)`).join(', ')}</td>
                    <td className="px-4 py-3">
                      {g.isDefault && <ATMBadge color="primary" size="sm" label="Default" />}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ATMButton variant="ghost" size="sm" onClick={() => handleDelete(g.taxGroupId)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </ATMButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ATMCard>
      )}
    </div>
  );
}

function AssociationsTab() {
  const { data: assocData, isLoading } = useGetTaxAssociationsQuery();
  const { data: groupsData } = useGetTaxGroupsQuery();
  const [createAssoc, { isLoading: isCreating }] = useCreateTaxAssociationMutation();
  const [deleteAssoc] = useDeleteTaxAssociationMutation();

  const [form, setForm] = useState<CreateTaxAssociationInput>({
    taxGroupId: '', scope: 'Both', effectiveFromDate: new Date().toISOString().slice(0, 10),
  });
  const [target, setTarget] = useState<'default' | 'plan' | 'merchant'>('default');
  const [targetId, setTargetId] = useState('');

  const handleCreate = async () => {
    try {
      await createAssoc({
        ...form,
        planId: target === 'plan' ? targetId : null,
        merchantId: target === 'merchant' ? targetId : null,
      }).unwrap();
      toast.success('Association created');
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Create failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAssoc(id).unwrap();
      toast.success('Association deleted');
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Delete failed');
    }
  };

  const groups = groupsData?.data ?? [];
  const assocs = assocData?.data ?? [];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <ATMCard title="New Association" className="glass-card">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Priority: Merchant override → Plan → Default. Leave PlanId + MerchantId blank for default.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          <ATMSelectField
            name="taxGroupId"
            label="Tax Group"
            value={form.taxGroupId}
            onChange={(val) => setForm({ ...form, taxGroupId: val ? String(val) : '' })}
            options={[{ label: '— ATMSelect group —', value: '' }, ...groups.map((g: PlatformTaxGroup) => ({ label: g.groupName, value: g.taxGroupId }))]}
          />
          <ATMSelectField
            name="scope"
            label="Scope"
            value={form.scope}
            onChange={(val) => setForm({ ...form, scope: (val ? String(val) : 'Both') as CreateTaxAssociationInput['scope'] })}
            options={[
              { label: 'Both', value: 'Both' },
              { label: 'Commission', value: 'Commission' },
              { label: 'Subscription', value: 'Subscription' },
            ]}
          />
          <ATMSelectField
            name="target"
            label="Target Scope"
            value={target}
            onChange={(val) => { setTarget((val ? String(val) : 'default') as typeof target); setTargetId(''); }}
            options={[
              { label: 'Default (all merchants)', value: 'default' },
              { label: 'Plan', value: 'plan' },
              { label: 'Merchant', value: 'merchant' },
            ]}
          />
          {target !== 'default' && (
            <ATMTextField
              name="targetId"
              label={`${target === 'plan' ? 'Plan' : 'Merchant'} ID`}
              placeholder={`${target === 'plan' ? 'Plan' : 'Merchant'} ID`}
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
          )}
          <div className="flex items-end lg:col-start-4">
            <ATMButton
              variant="primary"
              size="md"
              icon={Plus}
              className="w-full"
              disabled={isCreating || !form.taxGroupId}
              onClick={handleCreate}
            >
              Add Association
            </ATMButton>
          </div>
        </div>
      </ATMCard>

      {isLoading ? (
        <div className="space-y-3">
          <ATMSkeleton className="h-10 w-full" />
          <ATMSkeleton className="h-10 w-full" />
        </div>
      ) : (
        <ATMCard padding="none" className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-250 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30 text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3.5">Group</th>
                  <th className="px-4 py-3.5">Scope</th>
                  <th className="px-4 py-3.5">Target</th>
                  <th className="px-4 py-3.5">Effective</th>
                  <th className="px-4 py-3.5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold">
                {assocs.map((a: PlatformTaxAssociation) => (
                  <tr key={a.associationId} className="transition-colors hover:bg-gray-55/40 dark:hover:bg-gray-800/10">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-bold">{a.taxGroupName}</td>
                    <td className="px-4 py-3">
                      <ATMBadge color="primary" size="sm" label={a.scope} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-650 dark:text-gray-300">
                      {a.merchantId ? `Merchant: ${a.merchantName ?? a.merchantId.slice(0, 8)}` : a.planId ? `Plan: ${a.planName ?? a.planId.slice(0, 8)}` : 'Default'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-550 dark:text-gray-400">
                      {new Date(a.effectiveFromDate).toLocaleDateString()} – {a.effectiveToDate ? new Date(a.effectiveToDate).toLocaleDateString() : '∞'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ATMButton variant="ghost" size="sm" onClick={() => handleDelete(a.associationId)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </ATMButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ATMCard>
      )}
    </div>
  );
}

export function TaxConfigPage() {
  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Platform Tax</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Define taxes, group them, and associate them with plans / merchants. Drives invoicing of commission and subscription charges.
        </p>
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
