import React, { useEffect, useState } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton, ATMSelectField, ATMTextArea } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserRound, Mail, Phone, Building2, Calendar, MessageSquare, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { updateLead } from '@/lib/api/helpdesk';
import { get } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/types/common';
import type { Lead } from '@/lib/types/helpdesk';
import { ROUTES } from '@/lib/config/routes';

/**
 * Round_16 Pass 15: Lead detail + status / note edit. Backed by /api/v1/helpdesk/leads/{id}
 * (added Pass 8) and /api/v1/helpdesk/leads/{id}/convert.
 */

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
          setError((res as { error?: string }).error ?? 'Failed to load lead.');
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
        toast.success('Lead updated');
        setLead(res.data);
        setNote('');
      } else {
        toast.error((res as { error?: string }).error ?? 'Update failed');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-fade-in">
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
      <div className="flex w-full flex-col items-center gap-4 py-24 text-sm text-slate-500 dark:text-slate-400">
        {error ?? 'Lead not found.'}
        <ATMButton
          variant="secondary"
          size="sm"
          leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
          onClick={() => navigate(ROUTES.CONTENT.LEADS)}
        >
          Back to leads
        </ATMButton>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={UserRound}
        iconColor="theme"
        title={lead.name}
        subtitle={lead.companyName ?? 'No company'}
        extraActions={<ATMBadge color={STATUS_COLOR[lead.status] ?? 'muted'} size="md">{lead.status}</ATMBadge>}
        onBack={() => navigate(ROUTES.CONTENT.LEADS)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact details */}
        <div className="space-y-6 lg:col-span-2">
          <ATMCard title="Contact details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone ?? '—'} href={lead.phone ? `tel:${lead.phone}` : undefined} />
              <InfoRow icon={Building2} label="Company" value={lead.companyName ?? '—'} />
              <InfoRow icon={Tag} label="Source" value={lead.source ?? lead.leadType ?? '—'} />
              <InfoRow icon={Calendar} label="Created" value={formatDateTime(lead.createdAt)} />
              <InfoRow icon={Calendar} label="Updated" value={formatDateTime(lead.updatedAt)} />
            </div>
          </ATMCard>

          <ATMCard title="Notes / Message" subtitle={lead.message ? undefined : 'No message was submitted with this lead.'}>
            {lead.message ? (
              <div className="flex gap-3">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{lead.message}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">—</p>
            )}
          </ATMCard>
        </div>

        {/* Update panel */}
        <div className="space-y-6">
          <ATMCard title="Update lead">
            <div className="space-y-4">
              <ATMSelectField
                name="status"
                label="Status"
                value={status}
                onChange={(v) => setStatus(String(v ?? 'New'))}
                options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
              />

              <ATMTextArea
                name="note"
                label="Append note (optional)"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a contact note, follow-up reminder, or qualification detail…"
                helperText="Appended to the lead history on save."
              />

              <ATMButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => { void onSave(); }}
                loading={saving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save changes
              </ATMButton>
            </div>
          </ATMCard>
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
  const body = (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block rounded-xl -mx-2 px-2 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
        {body}
      </a>
    );
  }
  return <div className="-mx-2 px-2 py-1">{body}</div>;
}

export default LeadDetailPage;
