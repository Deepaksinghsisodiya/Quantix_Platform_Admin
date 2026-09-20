import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { TicketCheck, AlertCircle, Inbox, ArrowUpRight, ArrowRight, Clock } from 'lucide-react';

export interface OperatorQueueStats {
  /** Tickets not yet resolved or closed. */
  readonly open: number;
  /** Open tickets handed to the Operations Managers. */
  readonly escalated: number;
  /** Open tickets whose SLA deadline has passed. */
  readonly pastSla: number;
  /** Resolved or closed tickets in the counted set. */
  readonly resolved: number;
  /** How many tickets the counts cover. */
  readonly sampled: number;
  /** How many tickets exist in total (from the API's paged envelope). */
  readonly total: number;
}

interface OperatorDashboardProps {
  stats: OperatorQueueStats;
  isFetching: boolean;
}

/**
 * 2026-09-04: real counts (the three tiles used to read "Inbox" / "Alert" / "Done"). The
 * Escalation Rules link is gone — that page is platform configuration (settings.update),
 * which the helpdesk operator does not hold.
 */
export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ stats, isFetching }) => {
  const navigate = useNavigate();
  const partial = stats.total > stats.sampled;

  return (
    <div className="space-y-6 w-full">
      <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Operator Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Triage, work and resolve helpdesk support tickets.
          </p>
          {partial && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Counts cover the latest {stats.sampled.toLocaleString()} of {stats.total.toLocaleString()} tickets.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isFetching && <Clock className="h-4 w-4 animate-spin text-accent-500" />}
          <ATMBadge label="Live" color="primary" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ATMStatsCard
          label="Open Tickets"
          value={stats.open.toLocaleString()}
          icon={Inbox}
          variant="accent"
          description="Not yet resolved or closed"
          onClick={() => navigate('/support')}
        />
        <ATMStatsCard
          label="Escalated"
          value={stats.escalated.toLocaleString()}
          icon={ArrowUpRight}
          variant="amber"
          description="With the Operations Managers"
          onClick={() => navigate('/support?escalated=1')}
        />
        <ATMStatsCard
          label="Past SLA"
          value={stats.pastSla.toLocaleString()}
          icon={AlertCircle}
          variant="rose"
          description="Open tickets over their response window"
          onClick={() => navigate('/support')}
        />
        <ATMStatsCard
          label="Resolved"
          value={stats.resolved.toLocaleString()}
          icon={TicketCheck}
          variant="emerald"
          description={partial ? `In the latest ${stats.sampled.toLocaleString()} tickets` : 'Resolved or closed'}
          onClick={() => navigate('/support')}
        />
      </div>

      <ATMCard title="Operator Actions">
        <ul className="space-y-3 font-semibold text-sm">
          <li>
            <Link to="/support" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
              <span>Open the Support Queue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <Link to="/support/canned-responses" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
              <span>Browse Canned Responses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
        </ul>
      </ATMCard>
    </div>
  );
};

export default OperatorDashboard;
