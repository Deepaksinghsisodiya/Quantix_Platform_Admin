import React, { useEffect, useState } from 'react';
import { ATMBadge, ATMButton } from '@/shared/ui';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
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

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'danger' | 'default' | 'warning'> = {
  New: 'info',
  Contacted: 'warning',
  Qualified: 'success',
  Converted: 'success',
  Lost: 'default',
  Spam: 'danger',
};

function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
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
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading lead…
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-sm text-red-600">
        {error ?? 'Lead not found.'}
        <Link to={ROUTES.SUPPORT.LEADS}>
          <ATMButton variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>Back to leads</ATMButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link to={ROUTES.SUPPORT.LEADS}>
          <ATMButton variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>Back</ATMButton>
        </Link>
        <ATMBadge variant={STATUS_VARIANT[lead.status] ?? 'default'}>{lead.status}</ATMBadge>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">{lead.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.companyName ?? '—'}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:grid-cols-2">
        <Field label="Email" value={lead.email} />
        <Field label="Phone" value={lead.phone ?? '—'} />
        <Field label="Source" value={lead.source ?? lead.leadType ?? '—'} />
        <Field label="Type" value={lead.leadType ?? '—'} />
        <Field label="Created" value={new Date(lead.createdAt).toLocaleString()} />
        <Field label="Updated" value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : '—'} />
      </div>

      {lead.message ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Notes / Message</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{lead.message}</pre>
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Update lead</h2>
        <div className="grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Append note (optional)</span>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Add a contact note, follow-up reminder, or qualification detail…"
            />
          </label>
          <div className="flex justify-end">
            <ATMButton onClick={onSave} loading={saving} leftIcon={<Save className="h-3.5 w-3.5" />}>
              Save changes
            </ATMButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export default LeadDetailPage;
