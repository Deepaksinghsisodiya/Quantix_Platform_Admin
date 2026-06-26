import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ATMBadge } from '@/shared/ui';
import { getRoutingRules, getEscalationRules, type RoutingRule, type EscalationLevel } from '@/lib/api/helpdesk';

/**
 * Round_16 Pass 15: Routing & Escalation rules page. The backend currently returns 501 for
 * /routing-rules and /escalation-rules pending the TicketRoutingRule + TicketEscalationRule
 * entities (Pass 9 deferred). The page reflects that state without falsely showing an empty
 * "no rules configured" success state.
 */

interface EscalationRow {
  readonly priority: string;
  readonly slaHours: number;
  readonly escalationPath: readonly EscalationLevel[];
}

function RoutingRulesPage() {
  const [routing, setRouting] = useState<readonly RoutingRule[] | null>(null);
  const [escalation, setEscalation] = useState<readonly EscalationRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const [escError, setEscError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getRoutingRules()
        .then((res) => {
          if (res.success) setRouting(res.data);
          else setRoutingError((res as { error?: string }).error ?? 'Failed to load routing rules.');
        })
        .catch((e: Error) => setRoutingError(e.message)),
      getEscalationRules()
        .then((res) => {
          if (res.success) setEscalation(res.data);
          else setEscError((res as { error?: string }).error ?? 'Failed to load escalation rules.');
        })
        .catch((e: Error) => setEscError(e.message)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Routing & Escalation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Type-aware ticket routing and SLA-driven escalation paths.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading rules…
        </div>
      )}

      {!loading && (
        <>
          <Section title="Routing rules" hint="Type-aware auto-assignment by merchant type + ticket category.">
            {routingError && <NotImplemented msg={routingError} />}
            {!routingError && routing && routing.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
                No routing rules configured.
              </div>
            )}
            {!routingError && routing && routing.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Merchant Type</th>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Assigned Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routing.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-4 py-2"><ATMBadge variant="info">{r.merchantType}</ATMBadge></td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{r.category}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{r.assignToAgentName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Escalation rules" hint="SLA-driven escalation through Agent → Team Lead → Platform Admin.">
            {escError && <NotImplemented msg={escError} />}
            {!escError && escalation && escalation.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
                No escalation rules configured.
              </div>
            )}
            {!escError && escalation && escalation.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</th>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">SLA (hours)</th>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Escalation Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escalation.map((row) => (
                      <tr key={row.priority} className="border-t">
                        <td className="px-4 py-2"><ATMBadge variant={row.priority === 'Critical' ? 'danger' : row.priority === 'High' ? 'warning' : 'default'}>{row.priority}</ATMBadge></td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{row.slaHours}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{row.escalationPath.join(' → ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function NotImplemented({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

export default RoutingRulesPage;
