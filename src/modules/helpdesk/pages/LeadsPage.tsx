import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  ATMBadge,
  ATMButton,
  ATMCard,
  ATMStatsCard,
  ATMTextField,
  ATMSkeleton,
  ATMModal,
  ATMSelectField,
  ATMTextArea,
} from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMViewModeToggle } from '@/shared/ui/ATMViewModeToggle';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';

import { cn } from '@/lib/utils/cn';
import { useLeads, useUpdateLead } from '@/lib/hooks/useHelpdesk';
import { post } from '@/lib/api/client';

/* -------------------------------------------------------------------------- */
/*  Local view-model types                                                     */
/* -------------------------------------------------------------------------- */

type LeadSource = 'Organic' | 'Paid' | 'Referral';
type LeadInterest = 'Enterprise' | 'Standalone' | 'Restaurant' | 'Retail';
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

const INTEREST_COLOR: Record<LeadInterest, 'purple' | 'primary' | 'warning' | 'emerald'> = {
  Enterprise: 'purple',
  Standalone: 'primary',
  Restaurant: 'warning',
  Retail: 'emerald',
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
  const i = (interest || '').toLowerCase();
  if (i.includes('restaurant')) return 'Restaurant';
  if (i.includes('retail')) return 'Retail';
  if (i.includes('standalone')) return 'Standalone';
  return 'Enterprise';
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LeadStatus>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Manual Lead Creation Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    merchantType: 'Enterprise',
    message: '',
  });

  const leadsQuery = useLeads({ page: 1, pageSize: 100, search: search.trim() || undefined });
  const updateMut = useUpdateLead();

  const handleCreateLead = async () => {
    if (!newLead.name.trim() || !newLead.email.trim()) {
      toast.error('Lead name and contact email are required.');
      return;
    }
    setCreating(true);
    try {
      await post('/api/v1/contact/sales', {
        name: newLead.name.trim(),
        companyName: newLead.company.trim(),
        email: newLead.email.trim(),
        phone: newLead.phone.trim(),
        merchantType: newLead.merchantType,
        message: newLead.message.trim(),
        source: 'Direct Admin CRM Entry',
      });
      toast.success(`New prospect "${newLead.name}" added to sales pipeline!`);
      setCreateModalOpen(false);
      setNewLead({
        name: '',
        company: '',
        email: '',
        phone: '',
        merchantType: 'Enterprise',
        message: '',
      });
      void leadsQuery.refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to capture lead.');
    } finally {
      setCreating(false);
    }
  };

  const leads = useMemo<LeadVM[]>(() => {
    const items = leadsQuery.data?.data ?? [];
    return items.map((l: any) => ({
      id: l.leadId ?? l.id,
      name: l.name || l.contactPerson || '(No name provided)',
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
        onSuccess: () => toast.success(`Lead moved to "${status}"`),
        onError: () => toast.error('Failed to update lead status'),
      },
    );
  };

  const columns: ATMTableColumn<LeadVM>[] = [
    {
      key: 'name',
      header: 'Lead Name & Email',
      renderCell: (_v, l) => (
        <div className="flex items-center gap-3 min-w-0 max-w-xs">
          <div className="h-9 w-9 shrink-0 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800/60 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
            {l.name ? l.name.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="min-w-0">
            <span className={cn('block truncate font-semibold text-slate-900 dark:text-slate-100 text-sm', selectedId === l.id && 'text-primary-600 dark:text-primary-400')}>
              {l.name}
            </span>
            <span className="block truncate text-xs text-slate-500 dark:text-slate-400 font-mono">{l.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company / Business',
      renderCell: (_v, l) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{l.company || '—'}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      renderCell: (_v, l) => (
        l.phone ? (
          <a
            href={`tel:${l.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-mono"
          >
            <Phone className="h-3 w-3" />
            <span>{l.phone}</span>
          </a>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
      ),
    },
    {
      key: 'source',
      header: 'Acquisition',
      renderCell: (_v, l) => <ATMBadge color={SOURCE_COLOR[l.source]} size="sm">{l.source}</ATMBadge>,
    },
    {
      key: 'interest',
      header: 'Platform Tier',
      renderCell: (_v, l) => <ATMBadge color={INTEREST_COLOR[l.interest] || 'primary'} size="sm">{l.interest}</ATMBadge>,
    },
    {
      key: 'status',
      header: 'Pipeline Status',
      renderCell: (_v, l) => <ATMBadge color={STATUS_COLOR[l.status]} size="sm" dot>{l.status}</ATMBadge>,
    },
    {
      key: 'createdDate',
      header: 'Received',
      renderCell: (_v, l) => (
        <span className="whitespace-nowrap tabular-nums text-xs text-slate-500 dark:text-slate-400 font-mono">
          {l.createdDate}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (_v, l) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <ATMButton
            variant="secondary"
            size="sm"
            leftIcon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => navigate(`/content/leads/${l.id}`)}
          >
            View
          </ATMButton>
          <ATMButton
            variant="ghost"
            size="sm"
            onClick={() => setSelectedId(l.id)}
            title="Side Preview"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 hover:text-primary-600" />
          </ATMButton>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Header */}
      <ATMPageHeader
        icon={Users}
        iconColor="theme"
        title="Sales Leads & Pipeline CRM"
        subtitle="Manage customer enquiries, demo requests, and inbound sales leads across all platform websites."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Helpdesk & CRM', href: '/content/leads' },
          { label: 'Sales Leads' },
        ]}
        action={{
          label: 'Add New Lead',
          onClick: () => setCreateModalOpen(true),
          icon: Plus,
        }}
      />

      {/* Error state */}
      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/40">
          <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Failed to load sales leads. Check your backend API connection.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void leadsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* KPI Telemetry Pipeline Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <ATMStatsCard
          label="Total Leads"
          value={totalCount}
          icon={Users}
          variant="accent"
          description="All captured prospects"
          onClick={() => setStatusFilter('All')}
        />
        <ATMStatsCard
          label="New Leads"
          value={counts.New}
          icon={UserPlus}
          variant="indigo"
          description="Awaiting initial contact"
          onClick={() => setStatusFilter('New')}
        />
        <ATMStatsCard
          label="In Contact"
          value={counts.Contacted}
          icon={PhoneCall}
          variant="amber"
          description="Active discussion"
          onClick={() => setStatusFilter('Contacted')}
        />
        <ATMStatsCard
          label="Qualified / Won"
          value={counts.Qualified}
          icon={BadgeCheck}
          variant="emerald"
          description="Ready for onboarding"
          onClick={() => setStatusFilter('Qualified')}
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        {/* Pipeline Status Filter Pills */}
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5',
                statusFilter === s
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              <span>{s}</span>
              {s !== 'All' && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-bold',
                    statusFilter === s
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                  )}
                >
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & View Mode Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-full sm:w-72">
            <ATMTextField
              placeholder="Search by name, email, company..."
              size="sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              rightIcon={
                search ? (
                  <button type="button" onClick={() => setSearch('')} className="cursor-pointer text-slate-400 hover:text-slate-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          <ATMViewModeToggle
            value={viewMode === 'table' ? 'list' : 'grid'}
            onChange={(m) => setViewMode(m === 'list' ? 'table' : 'cards')}
            className="shrink-0"
          />
        </div>
      </div>

      {/* Main Grid: Data & Details Inspector */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Table or Cards */}
        <div className={cn('space-y-3', selected ? 'xl:col-span-2' : 'xl:col-span-3')}>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <ATMSkeleton variant="text" width="30%" />
                  <ATMSkeleton variant="text" width="70%" />
                </div>
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/40">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 mb-3 border border-primary-100 dark:border-primary-900/50">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No leads match filter</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {search || statusFilter !== 'All'
                  ? 'Try clearing the search or status filter to see other prospect records.'
                  : 'New lead inquiries from contact modals and website forms will appear here automatically.'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <ATMCard padding="none" className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <ATMTable
                columns={columns}
                data={filteredLeads}
                isLoading={isLoading}
                onRowClick={(l) => navigate(`/content/leads/${l.id}`)}
                emptyMessage="No leads found."
                density="comfortable"
              />
            </ATMCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => navigate(`/content/leads/${lead.id}`)}
                  className={cn(
                    'group cursor-pointer flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/90',
                    selectedId === lead.id
                      ? 'border-primary-500 ring-2 ring-primary-500/20'
                      : 'border-slate-200/80 dark:border-slate-800/80 hover:border-primary-500/40'
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <ATMBadge color={STATUS_COLOR[lead.status]} size="sm" dot>
                        {lead.status}
                      </ATMBadge>
                      <ATMBadge color={INTEREST_COLOR[lead.interest] || 'primary'} size="sm">
                        {lead.interest}
                      </ATMBadge>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {lead.name}
                      </h4>
                      {lead.company && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{lead.company}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{lead.phone}</span>
                        </div>
                      )}
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {lead.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-3 text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">{lead.createdDate}</span>
                    <div className="flex items-center gap-1.5">
                      <ATMButton
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/content/leads/${lead.id}`);
                        }}
                      >
                        View Profile
                      </ATMButton>
                      <ATMButton
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(lead.id);
                        }}
                        title="Side Preview"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 hover:text-primary-600" />
                      </ATMButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredLeads.length > 0 && (
            <p className="px-1 text-xs font-medium text-slate-400 dark:text-slate-500">
              Showing {filteredLeads.length} of {totalCount} prospect records
            </p>
          )}
        </div>

        {/* Selected Lead Inspector Panel */}
        {selected && (
          <div className="xl:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 space-y-5">
              {/* Lead Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ATMBadge color={STATUS_COLOR[selected.status]} size="sm" dot>
                      {selected.status}
                    </ATMBadge>
                    <ATMBadge color={SOURCE_COLOR[selected.source]} size="sm">
                      {selected.source}
                    </ATMBadge>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    {selected.name}
                  </h3>
                  {selected.company && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{selected.company}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Communication Actions */}
              <div className="grid grid-cols-2 gap-2">
                {selected.email && selected.email !== '—' && (
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Send Email</span>
                  </a>
                )}
                {selected.phone ? (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Phone</span>
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-400 dark:bg-slate-800/40">
                    <Phone className="h-3.5 w-3.5" />
                    <span>No Phone</span>
                  </div>
                )}
              </div>

              {/* Status Pipeline Advancement */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Pipeline Stage
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateLeadStatus(selected.id, st)}
                      disabled={updateMut.isPending}
                      className={cn(
                        'rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 border',
                        selected.status === st
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enquiry Notes / Message */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Enquiry Message
                </span>
                <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-100 dark:border-slate-800 leading-relaxed max-h-40 overflow-y-auto">
                  {selected.notes || 'No message attached to this enquiry.'}
                </div>
              </div>

              {/* Full Details Navigation */}
              <div className="pt-2">
                <ATMButton
                  variant="secondary"
                  size="md"
                  className="w-full justify-center"
                  rightIcon={<ExternalLink className="h-4 w-4" />}
                  onClick={() => navigate(`/content/leads/${selected.id}`)}
                >
                  Open Full Lead Profile
                </ATMButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Lead Capture Modal */}
      <ATMModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Capture New Sales Lead"
        size="md"
      >
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ATMTextField
              name="name"
              label="Contact / Person Name"
              required
              value={newLead.name}
              onChange={(e) => setNewLead((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Rahul Sharma"
            />
            <ATMTextField
              name="company"
              label="Business / Company"
              value={newLead.company}
              onChange={(e) => setNewLead((prev) => ({ ...prev, company: e.target.value }))}
              placeholder="e.g. Royal Spice Hospitality"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ATMTextField
              name="email"
              label="Email Address"
              required
              type="email"
              value={newLead.email}
              onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="rahul@royalspice.com"
            />
            <ATMTextField
              name="phone"
              label="Phone Number"
              type="tel"
              value={newLead.phone}
              onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </div>

          <ATMSelectField
            name="merchantType"
            label="Interested Platform Tier"
            value={newLead.merchantType}
            onChange={(v) => setNewLead((prev) => ({ ...prev, merchantType: String(v ?? 'Enterprise') }))}
            options={[
              { value: 'Enterprise', label: 'Quantix Enterprise Platform' },
              { value: 'Restaurant', label: 'Quantix Restaurant & Dining POS' },
              { value: 'Retail', label: 'Quantix Retail & Checkout POS' },
              { value: 'Standalone', label: 'Quantix Standalone POS' },
            ]}
          />

          <ATMTextArea
            name="message"
            label="Inquiry Message / Discussion Notes"
            rows={3}
            value={newLead.message}
            onChange={(e) => setNewLead((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Details about customer outlets, current software, demo requests, or requirements..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <ATMButton variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </ATMButton>
            <ATMButton
              variant="primary"
              onClick={() => { void handleCreateLead(); }}
              loading={creating}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add to Pipeline
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}

export default LeadsPage;
