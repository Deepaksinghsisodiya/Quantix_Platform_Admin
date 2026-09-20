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
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ATMButton } from '@/shared/ui';
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Escalation Rules</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The SLA window per priority. A ticket&apos;s deadline is its creation time plus this window;
          tickets past it appear in the overdue list and count against SLA compliance.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading SLA policy…
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30"
        >
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-red-700 underline dark:text-red-300"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      )}

      {!loading && !error && policy && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">SLA window by priority</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Whole hours, 1–{MAX_HOURS}. Applies to tickets created after you save.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">SLA (hours)</th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {policy.map((row) => {
                  const bad = invalid.includes(row);
                  return (
                    <tr key={row.priority}>
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{row.priority}</td>
                      <td className="px-4 py-2.5">
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
                            'w-28 rounded-lg border bg-white px-3 py-1.5 text-sm tabular-nums dark:bg-gray-800 dark:text-gray-100 ' +
                            (bad ? 'border-red-500' : 'border-gray-300 dark:border-gray-600')
                          }
                        />
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{describeWindow(row.slaHours)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <ATMButton variant="primary" size="sm" icon={Save} isLoading={saving} onClick={() => void onSave()}>
              Save
            </ATMButton>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">How tickets are assigned and escalated</h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          What the platform does today — nothing here is configurable beyond the SLA window above.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
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
      </section>
    </div>
  );
}

export default EscalationRulesPage;
