import React, { useMemo, useState } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMStatsCard, ATMTextField, ATMSkeleton } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import {
  Search,
  X,
  Eye,
  Pencil,
  Users,
  AlertTriangle,
  UserPlus,
  PhoneCall,
  BadgeCheck,
  Mail,
  Phone,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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
  company: string;
  source: LeadSource;
  interest: LeadInterest;
  status: LeadStatus;
  createdDate: string;
  notes: string;
}

const STATUS_COLOR: Record<LeadStatus, 'primary' | 'warning' | 'success' | 'muted'> = {
  New: 'primary',
  Contacted: 'warning',
  Qualified: 'success',
  Lost: 'muted',
};

const SOURCE_COLOR: Record<LeadSource, 'success' | 'primary' | 'warning'> = {
  Organic: 'success',
  Paid: 'primary',
  Referral: 'warning',
};

const INTEREST_COLOR: Record<LeadInterest, 'purple' | 'primary'> = {
  Enterprise: 'purple',
  Standalone: 'primary',
};

const STATUS_FILTERS: Array<'All' | LeadStatus> = ['All', 'New', 'Contacted', 'Qualified', 'Lost'];

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

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function LeadsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LeadStatus>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const leadsQuery = useLeads({ page: 1, pageSize: 100, search: search.trim() || undefined });
  const updateMut = useUpdateLead();

  const leads = useMemo<LeadVM[]>(() => {
    const items = leadsQuery.data?.data ?? [];
    return items.map((l: any) => ({
      id: l.leadId ?? l.id,
      name: l.name || l.contactPerson || '(no name)',
      email: l.email ?? '—',
      phone: l.phone ?? '',
      company: l.companyName ?? '',
      source: mapSource(l.source),
      interest: mapInterest(l.merchantType ?? null),
      status: mapStatus(l.status),
      createdDate: formatDate(l.createdAt),
      notes: l.message ?? l.notes ?? '',
    }));
  }, [leadsQuery.data]);

  const isLoading = leadsQuery.isLoading;
  const isError = leadsQuery.isError;
  const totalCount = leadsQuery.data?.totalCount ?? leads.length;

  const counts = useMemo(() => {
    const c: Record<LeadStatus, number> = { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
    leads.forEach((l) => {
      c[l.status] += 1;
    });
    return c;
  }, [leads]);

  const filteredLeads = useMemo(
    () => (statusFilter === 'All' ? leads : leads.filter((l) => l.status === statusFilter)),
    [leads, statusFilter],
  );

  const selected = selectedId ? leads.find((l) => l.id === selectedId) ?? null : null;

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    updateMut.mutate(
      { leadId: id, data: { status } },
      {
        onSuccess: () => toast.success(`Status updated to ${status}`),
        onError: () => toast.error('Failed to update status'),
      },
    );
  };

  const columns: ATMTableColumn<LeadVM>[] = [
    {
      key: 'name',
      header: 'Lead',
      renderCell: (_v, l) => (
        <div className="min-w-0">
          <span className={cn('block truncate font-semibold text-slate-900 dark:text-slate-100', selectedId === l.id && 'text-primary-600 dark:text-primary-400')}>
            {l.name}
          </span>
          <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{l.email}</span>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      renderCell: (_v, l) => <span className="text-slate-600 dark:text-slate-300">{l.company || '—'}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      renderCell: (_v, l) => <span className="tabular-nums text-slate-600 dark:text-slate-300">{l.phone || '—'}</span>,
    },
    {
      key: 'source',
      header: 'Source',
      renderCell: (_v, l) => <ATMBadge color={SOURCE_COLOR[l.source]} size="sm">{l.source}</ATMBadge>,
    },
    {
      key: 'interest',
      header: 'Interest',
      renderCell: (_v, l) => <ATMBadge color={INTEREST_COLOR[l.interest]} size="sm">{l.interest}</ATMBadge>,
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, l) => <ATMBadge color={STATUS_COLOR[l.status]} size="sm">{l.status}</ATMBadge>,
    },
    {
      key: 'createdDate',
      header: 'Created',
      renderCell: (_v, l) => <span className="whitespace-nowrap tabular-nums text-slate-500 dark:text-slate-400">{l.createdDate}</span>,
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Users}
        iconColor="theme"
        title="Leads"
        subtitle="Track and manage sales leads from every channel."
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/40">
          <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load leads.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void leadsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Pipeline summary */}
      {leadsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <ATMSkeleton key={i} variant="card" height="118px" />)}
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ATMStatsCard label="Total Leads" value={totalCount} icon={Users} variant="accent" description="All leads captured" />
        <ATMStatsCard label="New" value={counts.New} icon={UserPlus} variant="indigo" description="Awaiting first contact" onClick={() => setStatusFilter('New')} />
        <ATMStatsCard label="Contacted" value={counts.Contacted} icon={PhoneCall} variant="amber" description="In conversation" onClick={() => setStatusFilter('Contacted')} />
        <ATMStatsCard label="Qualified" value={counts.Qualified} icon={BadgeCheck} variant="emerald" description="Ready to convert" onClick={() => setStatusFilter('Qualified')} />
      </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-900/60">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                statusFilter === s
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
              )}
            >
              {s}
              {s !== 'All' && (
                <span className="ml-1.5 tabular-nums text-slate-400 dark:text-slate-500">{counts[s]}</span>
              )}
            </button>
          ))}
        </div>

        <ATMTextField
          className="w-full sm:w-72"
          size="md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            search ? (
              <button type="button" onClick={() => setSearch('')} className="cursor-pointer" aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Table */}
        <div className="xl:col-span-2">
          <ATMCard padding="none" className="overflow-hidden">
            <ATMTable
              columns={columns}
              data={filteredLeads}
              isLoading={isLoading}
              onRowClick={(l) => setSelectedId(l.id)}
              rowActions={(l) => [
                { label: 'View', icon: Eye, onClick: () => setSelectedId(l.id) },
                { label: 'Open', icon: Pencil, onClick: () => navigate(`/content/leads/${l.id}`) },
              ]}
              emptyMessage={
                leads.length === 0
                  ? 'No leads yet. New enquiries from the website will appear here.'
                  : 'No leads match this filter.'
              }
            />
          </ATMCard>
          {!isLoading && filteredLeads.length > 0 && (
            <p className="mt-2 px-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Showing {filteredLeads.length} of {totalCount} leads
            </p>
          )}
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="sticky top-6">
              <ATMCard
                title={selected.name}
                subtitle={selected.company || 'No company'}
                action={
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Close details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                }
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <ATMBadge color={STATUS_COLOR[selected.status]}>{selected.status}</ATMBadge>
                    <ATMBadge color={SOURCE_COLOR[selected.source]}>{selected.source}</ATMBadge>
                    <ATMBadge color={INTEREST_COLOR[selected.interest]}>{selected.interest}</ATMBadge>
                  </div>

                  <div className="space-y-3">
                    <ContactRow icon={Mail} label="Email" value={selected.email} href={`mailto:${selected.email}`} />
                    <ContactRow icon={Phone} label="Phone" value={selected.phone || '—'} href={selected.phone ? `tel:${selected.phone}` : undefined} />
                    <ContactRow icon={Building2} label="Company" value={selected.company || '—'} />
                    <ContactRow icon={Calendar} label="Captured" value={selected.createdDate} />
                  </div>

                  {selected.notes && (
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Notes</p>
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">{selected.notes}</p>
                    </div>
                  )}

                  <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Update status</p>
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

                  <ATMButton
                    variant="outline"
                    size="md"
                    className="w-full"
                    rightIcon={<ExternalLink className="h-4 w-4" />}
                    onClick={() => navigate(`/content/leads/${selected.id}`)}
                  >
                    Open full record
                  </ATMButton>
                </div>
              </ATMCard>
            </div>
          ) : (
            <ATMCard>
              <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Users className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Select a lead</p>
                <p className="max-w-[200px] text-xs text-slate-400 dark:text-slate-500">
                  Choose a row to see contact details, notes and update the pipeline status.
                </p>
              </div>
            </ATMCard>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block rounded-lg -mx-1 px-1 py-0.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
        {content}
      </a>
    );
  }
  return content;
}

export default LeadsPage;
