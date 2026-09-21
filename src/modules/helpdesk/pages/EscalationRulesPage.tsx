/**
 * Escalation Rules — 2026-09-04. Replaces RoutingRulesPage, which rendered two 501s.
 *
 * Tombstone: "Routing rules" (merchant type × category → agent) never existed server-side —
 * the page's table and the API's 501 route are gone. "Escalation rules" were described as an
 * Agent → Team Lead → Platform Admin path that also never existed. What the platform actually
 * has is the SLA window per priority (the seeded `sla.*_hours` settings): it sets every new
 * ticket's deadline and feeds the overdue list and the SLA compliance report. That is what
 * this page edits. Title is the sidebar label, verbatim.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Save, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { ATMCard, ATMButton, ATMErrorState } from '@/shared/ui';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { getEscalationRules, updateEscalationRules, type SlaPolicy } from '@/lib/api/helpdesk';
import { apiErrorMessage } from '@/lib/utils/apiError';

/** Mirrors HelpdeskService.SlaHoursMax. */
const MAX_HOURS = 24 * 30;

function describeWindow(hours: number): string {
  if (!Number.isFinite(hours) || hours < 1) return '—';
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} ${days === 1 ? 'day' : 'days'} after creation`;
  }
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} after creation`;
}

function EscalationRulesPage() {
  const [policy, setPolicy] = useState<SlaPolicy[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEscalationRules();
      if (res.success && res.data) setPolicy([...res.data]);
      else setError(apiErrorMessage(res, 'The SLA policy could not be loaded.'));
    } catch (e) {
      setError(apiErrorMessage(e, 'The SLA policy could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setHours = (priority: string, raw: string) => {
    const value = raw.trim() === '' ? Number.NaN : Number(raw);
    setPolicy((prev) => (prev ?? []).map((r) => (r.priority === priority ? { ...r, slaHours: value } : r)));
  };

  const invalid = (policy ?? []).filter(
    (r) => !Number.isInteger(r.slaHours) || r.slaHours < 1 || r.slaHours > MAX_HOURS,
  );

  const onSave = async () => {
    if (!policy) return;
    if (invalid.length > 0) {
      toast.error(`SLA hours must be whole numbers between 1 and ${MAX_HOURS}.`);
      return;
    }
    setSaving(true);
    try {
      const res = await updateEscalationRules(policy);
      if (res.success && res.data) {
        setPolicy([...res.data]);
        toast.success('SLA policy saved. New tickets get the new deadlines; existing deadlines are unchanged.');
      } else {
        toast.error(apiErrorMessage(res, 'The SLA policy could not be saved.'));
      }
    } catch (e) {
      toast.error(apiErrorMessage(e, 'The SLA policy could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const columns: ATMTableColumn<SlaPolicy>[] = [
    {
      key: 'priority',
      header: 'Priority',
      renderCell: (_v, row) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{row.priority}</span>
      ),
    },
    {
      key: 'slaHours',
      header: 'SLA (hours)',
      renderCell: (_v, row) => {
        const bad = invalid.includes(row);
        return (
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_HOURS}
            step={1}
            value={Number.isFinite(row.slaHours) ? row.slaHours : ''}
            onChange={(e) => setHours(row.priority, e.target.value)}
            aria-label={`${row.priority} SLA hours`}
            aria-invalid={bad}
            className={
              'w-28 rounded-lg border bg-white px-3 py-1.5 text-sm tabular-nums text-slate-900 dark:bg-slate-900/60 dark:text-slate-100 ' +
              (bad ? 'border-rose-500 focus:ring-2 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10')
            }
          />
        );
      },
    },
    {
      key: '_deadline',
      header: 'Deadline',
      renderCell: (_v, row) => (
        <span className="text-slate-600 dark:text-slate-300">{describeWindow(row.slaHours)}</span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={ShieldAlert}
        iconColor="theme"
        title="Escalation Rules"
        subtitle="The SLA window per priority. A ticket&apos;s deadline is its creation time plus this window; tickets past it appear in the overdue list and count against SLA compliance."
      />

      {loading && (
        <ATMCard title="SLA window by priority">
          {/* Table-shaped skeleton: mirrors the three columns (priority, hours, deadline). */}
          <div className="space-y-2.5" role="status" aria-label="Loading SLA policy">
            <div className="grid grid-cols-12 items-center gap-3 px-3 py-1">
              <div className="col-span-4 h-3 w-20 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
              <div className="col-span-4 h-3 w-14 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
              <div className="col-span-4 h-3 w-28 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
            </div>
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="col-span-4 h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                <div className="col-span-4 h-8 w-24 rounded-lg bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                <div className="col-span-4 h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
              </div>
            ))}
            <span className="sr-only">Loading...</span>
          </div>
        </ATMCard>
      )}

      {!loading && error && (
        <ATMErrorState
          title="The SLA policy could not be loaded."
          message={error}
          onRetry={() => void load()}
        />
      )}

      {!loading && !error && policy && (
        <ATMCard
          title="SLA window by priority"
          subtitle={`Whole hours, 1–${MAX_HOURS}. Applies to tickets created after you save.`}
          padding="none"
          className="overflow-hidden"
        >
          <ATMTable columns={columns} data={policy} emptyMessage="No SLA policy configured." />
          <div className="flex justify-end border-t border-slate-200/80 px-5 py-4 dark:border-slate-800">
            <ATMButton variant="primary" size="sm" icon={Save} isLoading={saving} onClick={() => void onSave()}>
              Save
            </ATMButton>
          </div>
        </ATMCard>
      )}

      <ATMCard title="How tickets are assigned and escalated">
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          What the platform does today — nothing here is configurable beyond the SLA window above.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <span className="font-semibold">Manual assignment</span> — any agent, from the ticket.
          </li>
          <li>
            <span className="font-semibold">Auto-assign</span> — the active agent with the fewest open tickets
            (New, Open, Assigned, In progress, Waiting, Reopened). There are no merchant-type or category routing rules.
          </li>
          <li>
            <span className="font-semibold">Escalate</span> — raises the ticket&apos;s priority when one is chosen and records
            an internal note with the reason. Nobody is re-assigned automatically.
          </li>
          <li>
            <span className="font-semibold">Overdue</span> — tickets past their SLA deadline that are not Resolved or Closed
            are listed on the Support Queue and the dashboard by the periodic sweep.
          </li>
          <li>
            <span className="font-semibold">Auto-close</span> — Resolved tickets are closed after the window set on the
            Auto-Close page, when it is enabled.
          </li>
        </ul>
      </ATMCard>
    </div>
  );
}

export default EscalationRulesPage;