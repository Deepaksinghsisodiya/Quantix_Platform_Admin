import React from 'react';
import { Link } from 'react-router-dom';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { TicketCheck, AlertCircle, Inbox, ArrowRight } from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Operator Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Triage, assign, and resolve helpdesk support tickets.
          </p>
        </div>
        <ATMBadge label="Live" color="primary" />
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ATMStatsCard
          label="My Queue"
          value="Inbox"
          icon={Inbox}
          variant="accent"
          description="Tickets assigned to you"
          onClick={() => {}}
        />
        <ATMStatsCard
          label="SLA Breaches"
          value="Alert"
          icon={AlertCircle}
          variant="rose"
          description="Awaiting response window"
          onClick={() => {}}
        />
        <ATMStatsCard
          label="Resolved Today"
          value="Done"
          icon={TicketCheck}
          variant="emerald"
          description="Closed ticket report"
          onClick={() => {}}
        />
      </div>

      <ATMCard title="Operator Actions">
        <ul className="space-y-3 font-semibold text-sm">
          <li>
            <Link to="/support" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
              <span>Triage Unassigned Tickets Queue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <Link to="/support/canned-responses" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
              <span>Browse Canned Reponse Library</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <Link to="/support/routing-rules" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
              <span>Review Support Routing Rules</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </li>
        </ul>
      </ATMCard>
    </div>
  );
};

export default OperatorDashboard;
