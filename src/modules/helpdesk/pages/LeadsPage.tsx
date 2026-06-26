import React, { useMemo, useState } from 'react';
import { ATMBadge, ATMButton } from '@/shared/ui';
import { Search, X, Eye, Pencil, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { useLeads, useUpdateLead } from '@/lib/hooks/useHelpdesk';

/* -------------------------------------------------------------------------- */
/*  Local view-model types                                                     */
/* -------------------------------------------------------------------------- */

type LeadSource = 'Organic' | 'Paid' | 'Referral';
type LeadInterest = 'Enterprise' | 'Standalone';
type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';

interface LeadVM {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  interest: LeadInterest;
  status: LeadStatus;
  createdDate: string;
  notes: string;
  followUpDate: string;
}

const SOURCE_VARIANT: Record<LeadSource, 'success' | 'info' | 'warning'> = {
  Organic: 'success',
  Paid: 'info',
  Referral: 'warning',
};

const INTEREST_VARIANT: Record<LeadInterest, 'enterprise' | 'standalone'> = {
  Enterprise: 'enterprise',
  Standalone: 'standalone',
};

const STATUS_VARIANT: Record<LeadStatus, 'info' | 'warning' | 'success' | 'default'> = {
  New: 'info',
  Contacted: 'warning',
  Qualified: 'success',
  Lost: 'default',
};

function mapSource(source?: string | null): LeadSource {
  if (source === 'Paid' || source === 'Paid Ads' || source === 'Ads') return 'Paid';
  if (source === 'Referral') return 'Referral';
  return 'Organic';
}

function mapStatus(status: string): LeadStatus {
  if (status === 'Contacted') return 'Contacted';
  if (status === 'Qualified' || status === 'Converted') return 'Qualified';
  if (status === 'Lost' || status === 'Spam') return 'Lost';
  return 'New';
}

function mapInterest(interest?: string | null): LeadInterest {
  return interest === 'Standalone' ? 'Standalone' : 'Enterprise';
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function LeadsPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const leadsQuery = useLeads({ page: 1, pageSize: 100, search: search.trim() || undefined });
  const updateMut = useUpdateLead();

  const leads = useMemo<LeadVM[]>(() => {
    const items = leadsQuery.data?.data?.items ?? [];
    return items.map((l) => ({
      id: l.leadId,
      name: l.name || l.contactPerson || '(no name)',
      email: l.email,
      phone: l.phone ?? '',
      source: mapSource(l.source),
      interest: mapInterest(l.merchantType ?? null),
      status: mapStatus(l.status),
      createdDate: l.createdAt.slice(0, 10),
      notes: l.message ?? l.notes ?? '',
      followUpDate: '',
    }));
  }, [leadsQuery.data]);

  const isLoading = leadsQuery.isLoading;
  const isError = leadsQuery.isError;

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  // Derive a simple funnel from the loaded leads
  const funnelStages = useMemo(() => {
    const counts: Record<LeadStatus, number> = { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
    leads.forEach((l) => {
      counts[l.status] += 1;
    });
    const max = Math.max(counts.New, counts.Contacted, counts.Qualified, counts.Lost, 1);
    return [
      { name: 'New', count: counts.New, color: 'bg-blue-500', width: `${(counts.New / max) * 100}%` },
      { name: 'Contacted', count: counts.Contacted, color: 'bg-amber-500', width: `${(counts.Contacted / max) * 100}%` },
      { name: 'Qualified', count: counts.Qualified, color: 'bg-emerald-500', width: `${(counts.Qualified / max) * 100}%` },
      { name: 'Lost', count: counts.Lost, color: 'bg-gray-400', width: `${(counts.Lost / max) * 100}%` },
    ];
  }, [leads]);

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    updateMut.mutate(
      { leadId: id, data: { status } },
      {
        onSuccess: () => toast.success(`Status updated to ${status}`),
        onError: () => toast.error('Failed to update status'),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Contacts & Leads
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track and manage sales leads from all channels.
        </p>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load leads.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void leadsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Lead funnel */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Lead Funnel</h3>
        <div className="flex flex-col items-center gap-2">
          {funnelStages.map((stage) => (
            <div key={stage.name} className="flex w-full items-center gap-3">
              <span className="w-24 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{stage.name}</span>
              <div className="flex-1">
                <div className={cn('h-8 rounded-lg flex items-center justify-center transition-all', stage.color)} style={{ width: stage.width }}>
                  <span className="text-xs font-bold text-white">{stage.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Table */}
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Phone</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Source</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Interest</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Created</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                      </td>
                    </tr>
                  )}
                  {!isLoading && leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={cn(
                        'cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                        selectedId === lead.id && 'bg-indigo-50 dark:bg-indigo-900/10',
                      )}
                      onClick={() => setSelectedId(lead.id)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.email}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.phone}</td>
                      <td className="px-4 py-3"><ATMBadge variant={SOURCE_VARIANT[lead.source]} size="sm">{lead.source}</ATMBadge></td>
                      <td className="px-4 py-3"><ATMBadge variant={INTEREST_VARIANT[lead.interest]} size="sm">{lead.interest}</ATMBadge></td>
                      <td className="px-4 py-3"><ATMBadge variant={STATUS_VARIANT[lead.status]} size="sm">{lead.status}</ATMBadge></td>
                      <td className="px-4 py-3 tabular-nums text-gray-500 dark:text-gray-400">{lead.createdDate}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <ATMButton variant="ghost" size="sm" onClick={() => setSelectedId(lead.id)}><Eye className="h-3.5 w-3.5" /></ATMButton>
                          <ATMButton variant="ghost" size="sm" onClick={() => toast('Edit modal coming soon')}><Pencil className="h-3.5 w-3.5" /></ATMButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isLoading && leads.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">No leads match your search.</div>
            )}
          </div>
        </div>

        {/* Detail drawer */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selected.name}</h3>
                <button type="button" onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-gray-100">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-gray-100">{selected.phone}</p>
                </div>
                <div className="flex gap-2">
                  <ATMBadge variant={SOURCE_VARIANT[selected.source]} size="sm">{selected.source}</ATMBadge>
                  <ATMBadge variant={INTEREST_VARIANT[selected.interest]} size="sm">{selected.interest}</ATMBadge>
                  <ATMBadge variant={STATUS_VARIANT[selected.status]} size="sm">{selected.status}</ATMBadge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-700 dark:text-gray-300">{selected.notes || '(none)'}</p>
                </div>

                {/* Status update */}
                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map((status) => (
                      <ATMButton
                        key={status}
                        variant={selected.status === status ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => updateLeadStatus(selected.id, status)}
                        disabled={updateMut.isPending}
                      >
                        {status}
                      </ATMButton>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="text-center">
                <Users className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">ATMSelect a lead to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeadsPage;
