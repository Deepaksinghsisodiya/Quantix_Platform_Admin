import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import type { PlatformDashboardDto, MerchantGrowthDto } from '@/lib/api/dashboard';
import {
  UserPlus, Users, Clock, AlertCircle, ArrowRight, LogOut, Headphones, ShieldCheck, Hourglass,
} from 'lucide-react';

interface OperationsManagerDashboardProps {
  summary: PlatformDashboardDto | undefined;
  growth: MerchantGrowthDto | undefined;
  queue: any[];
  /** Merchants currently in the deboarding queue. */
  deboardingCount: number;
  /** Open tickets the helpdesk has handed to the Operations Managers. */
  escalatedTickets: number;
  isFetching: boolean;
}

/**
 * 2026-09-04 (user directive): the Operations Manager now holds everything except user /
 * role administration, so the desk covers the whole operation — merchant lifecycle first,
 * then the helpdesk, compliance and grace-period figures from the platform summary. The
 * "Pending Terminations: Action Required" placeholder is a real count now.
 */
export const OperationsManagerDashboard: React.FC<OperationsManagerDashboardProps> = ({
  summary,
  growth,
  queue,
  deboardingCount,
  escalatedTickets,
  isFetching,
}) => {
  const navigate = useNavigate();
  const safeQueue = Array.isArray(queue) ? queue : [];
  const pendingAcceptance = safeQueue.filter(
    (e) => e?.status === 'Pending' || e?.status === 'Verified',
  ).length;
  const provisioning = safeQueue.filter((e) => e?.status === 'Provisioning').length;
  const failed = safeQueue.filter((e) => e?.status === 'Failed').length;

  return (
    <div className="space-y-6 w-full">
      <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Operations Manager</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Merchant lifecycle, tokens, billing, helpdesk, content and platform configuration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && <Clock className="h-4 w-4 animate-spin text-accent-500" />}
          <ATMBadge label="Live" color="primary" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ATMStatsCard
          label="Pending Acceptance"
          value={pendingAcceptance.toLocaleString()}
          icon={Clock}
          variant="amber"
          description="Signups awaiting review"
        />
        <ATMStatsCard
          label="Provisioning"
          value={provisioning.toLocaleString()}
          icon={UserPlus}
          variant="indigo"
          description="Provisioning cloud resources"
        />
        <ATMStatsCard
          label="Failed Signups"
          value={failed.toLocaleString()}
          icon={AlertCircle}
          variant="rose"
          description="Requires triage"
        />
        <ATMStatsCard
          label="Active Merchants"
          value={(summary?.activeMerchants ?? 0).toLocaleString()}
          icon={Users}
          variant="emerald"
          description="In good standing"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ATMStatsCard
          label="Deboarding"
          value={deboardingCount.toLocaleString()}
          icon={LogOut}
          variant="slate"
          description="Merchants in the deboarding queue"
        />
        <ATMStatsCard
          label="Grace Period"
          value={(summary?.merchantsInGracePeriod ?? 0).toLocaleString()}
          icon={Hourglass}
          variant="amber"
          description="Merchants past their paid period"
        />
        <ATMStatsCard
          label="Escalated Tickets"
          value={escalatedTickets.toLocaleString()}
          icon={Headphones}
          variant="rose"
          description={`Handed up by the helpdesk; ${(summary?.openSupportTickets ?? 0).toLocaleString()} open in total`}
          onClick={() => navigate('/support?escalated=1')}
        />
        <ATMStatsCard
          label="Compliance Requests"
          value={(summary?.pendingComplianceRequests ?? 0).toLocaleString()}
          icon={ShieldCheck}
          variant="purple"
          description="Data requests awaiting action"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard
          title="Onboarding & Signups"
          subtitle={`${(growth?.signups ?? 0).toLocaleString()} new registrations in the last 30 days`}
          extra={
            <Link to="/merchants/signups">
              <ATMButton variant="outline" size="sm" icon={ArrowRight}>
                Open Signup Queue
              </ATMButton>
            </Link>
          }
        >
          <div className="mt-2 flex items-center justify-between rounded-xl bg-gray-50/60 border border-gray-100 p-4 dark:bg-gray-950/20 dark:border-gray-800">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Signups in queue</span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white">
              {safeQueue.length.toLocaleString()}
            </span>
          </div>
        </ATMCard>

        <ATMCard
          title="Deboarding"
          subtitle="Consent, final invoice, settlement and deactivation"
          extra={
            <Link to="/merchants/deboardings">
              <ATMButton variant="outline" size="sm" icon={ArrowRight}>
                Open Deboarding Queue
              </ATMButton>
            </Link>
          }
        >
          <div className="mt-2 flex items-center justify-between rounded-xl bg-gray-50/60 border border-gray-100 p-4 dark:bg-gray-950/20 dark:border-gray-800">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Merchants in queue</span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white">
              {deboardingCount.toLocaleString()}
            </span>
          </div>
        </ATMCard>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <QuickLink to="/merchants/signups/new" label="New Merchant Signup" />
        <QuickLink to="/tokens/generate" label="Generate Activation Token" />
        <QuickLink to="/billing" label="Billing Overview" />
        <QuickLink to="/support" label="Support Queue" />
      </div>
    </div>
  );
};

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="group">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-accent-500/30 hover:shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700 group-hover:text-accent-500 dark:text-gray-200 transition-colors">{label}</span>
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

export default OperationsManagerDashboard;
