import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  UserRound,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  Tag,
  Store,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  ATMBadge,
  ATMButton,
  ATMCard,
  ATMSkeleton,
  ATMSelectField,
  ATMTextArea,
} from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { updateLead } from '@/lib/api/helpdesk';
import { get, post } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';
import type { Lead } from '@/lib/types/helpdesk';
import { ROUTES } from '@/lib/config/routes';
import { cn } from '@/lib/utils/cn';

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost', 'Spam'] as const;

const STATUS_COLOR: Record<string, 'success' | 'primary' | 'danger' | 'muted' | 'warning'> = {
  New: 'primary',
  Contacted: 'warning',
  Qualified: 'success',
  Converted: 'success',
  Lost: 'muted',
  Spam: 'danger',
};

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    get<ApiResponse<Lead>>(`/api/v1/helpdesk/leads/${id}`)
      .then((res) => {
        if (res.success) {
          setLead(res.data);
          setStatus(res.data.status);
        } else {
          setError((res as { error?: string }).error ?? 'Failed to load lead record.');
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await updateLead(id, { status, notes: note || undefined });
      if (res.success) {
        toast.success('Lead status and CRM notes updated successfully.');
        setLead(res.data);
        setNote('');
      } else {
        toast.error((res as { error?: string }).error ?? 'Update failed.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!id) return;
    setConverting(true);
    try {
      const res = await post<ApiResponse<any>>(`/api/v1/helpdesk/leads/${id}/convert`, {});
      if (res.success) {
        toast.success('Lead converted to onboarded merchant account!');
        setStatus('Converted');
        if (lead) setLead({ ...lead, status: 'Converted' });
      } else {
        toast.error((res as any)?.message || 'Conversion failed.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Conversion failed.');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
        <ATMSkeleton variant="text" width="40%" height="32px" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ATMSkeleton variant="card" height="300px" />
            <ATMSkeleton variant="card" height="180px" />
          </div>
          <ATMSkeleton variant="card" height="300px" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 py-24 text-center max-w-[1600px] mx-auto px-1">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 mb-2">
          <UserRound className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{error ?? 'Lead record not found'}</h3>
        <p className="text-xs text-slate-400 max-w-sm">The requested lead ID might have been merged or does not exist.</p>
        <ATMButton
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
          onClick={() => navigate(ROUTES.CONTENT.LEADS)}
        >
          Back to Sales Leads
        </ATMButton>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Page Header */}
      <ATMPageHeader
        icon={UserRound}
        iconColor="theme"
        title={lead.name || 'Sales Prospect Record'}
        subtitle={lead.companyName ? `Company: ${lead.companyName}` : 'Inbound website enquiry'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales Leads', href: ROUTES.CONTENT.LEADS },
          { label: lead.name || 'Lead Details' },
        ]}
        onBack={() => navigate(ROUTES.CONTENT.LEADS)}
        extraActions={
          <div className="flex items-center gap-2">
            <ATMBadge color={STATUS_COLOR[status] ?? 'muted'} size="md" dot>
              {status}
            </ATMBadge>
            {status !== 'Converted' && (
              <ATMButton
                variant="primary"
                size="md"
                leftIcon={<UserCheck className="h-4 w-4" />}
                loading={converting}
                onClick={handleConvert}
              >
                Convert to Merchant
              </ATMButton>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Details Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Prospect Profile & Contact Points
              </h4>
              <div className="flex items-center gap-2">
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 text-xs font-semibold transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Send Email</span>
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Phone</span>
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="Email Address" value={lead.email} href={`mailto:${lead.email}`} />
              <InfoRow icon={Phone} label="Phone Number" value={lead.phone ?? '—'} href={lead.phone ? `tel:${lead.phone}` : undefined} />
              <InfoRow icon={Building2} label="Company / Entity" value={lead.companyName ?? '—'} />
              <InfoRow icon={Store} label="Platform Tier Interest" value={lead.merchantType || 'Enterprise'} />
              <InfoRow icon={Tag} label="Lead Source Channel" value={lead.source ?? lead.leadType ?? 'Organic Website'} />
              <InfoRow icon={Calendar} label="First Captured At" value={formatDateTime(lead.createdAt)} />
              <InfoRow icon={Clock} label="Last Activity Timestamp" value={formatDateTime(lead.updatedAt)} />
            </div>
          </div>

          {/* Enquiry Message / Context */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Original Inbound Message / Requirements
            </h4>

            {lead.message ? (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {lead.message}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No custom notes submitted with initial form entry.</p>
            )}
          </div>
        </div>

        {/* Sidebar CRM Actions (1/3) */}
        <div className="space-y-6">
          {/* Status Progression Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Pipeline Stage Workflow
            </h4>

            <div className="space-y-4">
              <ATMSelectField
                name="status"
                label="Current Stage"
                value={status}
                onChange={(v) => setStatus(String(v ?? 'New'))}
                options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
              />

              <div className="grid grid-cols-2 gap-2">
                {LEAD_STATUSES.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center',
                      status === s
                        ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <ATMTextArea
                name="note"
                label="Append CRM Activity Note"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log call discussion, customer requirements, demo scheduling, or onboarding blockers..."
                helperText="Permanently saved into lead activity history on save."
              />

              <ATMButton
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => { void onSave(); }}
                loading={saving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save CRM Record
              </ATMButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
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
    <div className="flex items-start gap-3 p-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/60">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block group">
        {content}
      </a>
    );
  }
  return content;
}

export default LeadDetailPage;
