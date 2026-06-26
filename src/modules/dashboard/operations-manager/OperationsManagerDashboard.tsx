import React from 'react';
import { Link } from 'react-router-dom';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { UserPlus, Users, Clock, AlertCircle, ArrowRight, Compass } from 'lucide-react';

interface OperationsManagerDashboardProps {
  summary: any;
  growth: any;
  queue: any[];
  isFetching: boolean;
  refetch: () => void;
}

export const OperationsManagerDashboard: React.FC<OperationsManagerDashboardProps> = ({
  summary,
  growth,
  queue,
  isFetching,
  refetch,
}) => {
  const pendingAcceptance = queue?.filter(
    (e) => e.status === 'Pending' || e.status === 'Verified',
  ).length ?? 0;
  const provisioning = queue?.filter((e) => e.status === 'Provisioning').length ?? 0;
  const failed = queue?.filter((e) => e.status === 'Failed').length ?? 0;

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Operations Manager</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Merchant lifecycle — onboarding, acceptance, and deboarding status.
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
          description="Awaiting manual review"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard
          title="Onboarding & Signups"
          subtitle={`${growth?.signupsLast30Days ?? 0} new registrations in last 30 days`}
          extra={
            <Link to="/merchants/signups">
              <ATMButton variant="outline" size="sm" icon={ArrowRight}>
                Open Signup Queue
              </ATMButton>
            </Link>
          }
        >
          <div className="flex flex-col gap-4 py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Verify legal documents, corporate tax registries, and settle banking clearance pipelines for verified self-service requests.
            </p>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-gray-50/60 border border-gray-100 p-4 dark:bg-gray-950/20 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-accent-500" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Registration Queue Status</span>
              </div>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                {queue?.length ?? 0} Total Actions
              </span>
            </div>
          </div>
        </ATMCard>

        <ATMCard
          title="Deboarding & Offboarding"
          subtitle="Manage active merchant exits, account closures, and disputes"
          extra={
            <Link to="/merchants/deboardings">
              <ATMButton variant="outline" size="sm" icon={ArrowRight}>
                Open Deboarding Queue
              </ATMButton>
            </Link>
          }
        >
          <div className="flex flex-col gap-4 py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Coordinate grace period terminations, export database backups, deactivate standalone local payment APIs, and audit compliance trails.
            </p>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-gray-50/60 border border-gray-100 p-4 dark:bg-gray-950/20 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Pending Terminations</span>
              </div>
              <span className="text-sm font-extrabold text-rose-600 dark:text-red-400">
                Action Required
              </span>
            </div>
          </div>
        </ATMCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Link to="/merchants/register/enterprise" className="group">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-accent-500/30 hover:shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 group-hover:text-accent-500 dark:text-gray-200 transition-colors">Register Enterprise Merchant</span>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link to="/merchants/register/standalone" className="group">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-accent-500/30 hover:shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 group-hover:text-accent-500 dark:text-gray-200 transition-colors">Register Standalone Merchant</span>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link to="/tokens/generate" className="group">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-accent-500/30 hover:shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 group-hover:text-accent-500 dark:text-gray-200 transition-colors">Generate Activation Token</span>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default OperationsManagerDashboard;
