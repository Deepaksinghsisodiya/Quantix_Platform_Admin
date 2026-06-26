import React, { useMemo } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMSkeleton } from '@/shared/ui';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import {
  TrendingUp,
  DollarSign,
  Activity,
  UserMinus,
  Percent,
  Key,
  Wrench,
  Clock,
  FileText,
  Calendar,
  ArrowRight,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { useReportDefinitions } from '@/lib/hooks/useReports';

// ---------------------------------------------------------------------------
// Report card config
// ---------------------------------------------------------------------------

interface ReportCard {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ElementType;
  readonly color: string;
  readonly route: string;
}

const REPORT_CARDS: ReportCard[] = [
  {
    key: 'growth',
    title: 'Growth Report',
    description: 'Track merchant signups, churns, and net growth over time with source attribution.',
    icon: TrendingUp,
    color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40',
    route: '/reports/growth',
  },
  {
    key: 'revenue',
    title: 'Revenue Report',
    description: 'Analyze revenue streams, MRR/ARR trends, ARPU, and top contributors.',
    icon: DollarSign,
    color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/40',
    route: '/reports/revenue',
  },
  {
    key: 'usage',
    title: 'Usage Report',
    description: 'Monitor platform activity, API calls, storage, and user engagement patterns.',
    icon: Activity,
    color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40',
    route: '/reports/usage',
  },
  {
    key: 'churn',
    title: 'Churn Analysis',
    description: 'Understand churn rates, reasons, and identify at-risk merchants before they leave.',
    icon: UserMinus,
    color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40',
    route: '/reports/churn',
  },
  {
    key: 'commission',
    title: 'Commission Report',
    description: 'Review commission earnings, settlement status, and rate analysis by merchant.',
    icon: Percent,
    color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40',
    route: '/reports/commission',
  },
  {
    key: 'tokens',
    title: 'Token Report',
    description: 'Track token generation, lifecycle, renewal rates, and revenue by tier.',
    icon: Key,
    color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/40',
    route: '/reports/tokens',
  },
  {
    key: 'custom',
    title: 'Custom Report',
    description: 'Build custom reports with flexible dimensions, measures, and filters.',
    icon: Wrench,
    color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
    route: '/reports/custom',
  },
];

// ---------------------------------------------------------------------------
// View-model adapters
// ---------------------------------------------------------------------------

interface SavedReport {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  createdBy: string;
  lastRun: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  nextRun: string;
  format: string;
  recipients: number;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ReportsHubPage() {
  const definitionsQuery = useReportDefinitions();

  const allDefinitions = definitionsQuery.data?.data ?? [];

  const savedReports = useMemo<SavedReport[]>(
    () =>
      allDefinitions.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        createdAt: d.createdAt.slice(0, 10),
        createdBy: d.createdBy,
        lastRun: d.updatedAt.slice(0, 10),
      })),
    [allDefinitions],
  );

  const scheduledReports = useMemo<ScheduledReport[]>(
    () =>
      allDefinitions
        .filter((d) => d.schedule != null && d.schedule.enabled !== undefined)
        .map((d) => ({
          id: d.id,
          name: d.name,
          frequency: d.schedule!.frequency,
          nextRun: d.schedule!.timeUtc,
          format: d.schedule!.exportFormat,
          recipients: d.schedule!.recipients.length,
          enabled: d.schedule!.enabled,
        })),
    [allDefinitions],
  );

  const isLoading = definitionsQuery.isLoading;
  const isError = definitionsQuery.isError;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Reports & Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Access pre-built reports or build your own custom analysis
        </p>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load saved reports.</span>
          </div>
          <ATMButton variant="ghost" size="sm" onClick={() => { void definitionsQuery.refetch(); }}>
            Retry
          </ATMButton>
        </div>
      )}

      {/* Report cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {REPORT_CARDS.map((report) => {
          const Icon = report.icon;
          return (
            <Link
              key={report.key}
              to={report.route}
              className={cn(
                'group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200',
                'hover:shadow-md hover:border-gray-300',
                'dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:shadow-gray-800/40',
              )}
            >
              <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-lg', report.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {report.title}
              </h3>
              <p className="mt-1 flex-1 text-xs text-gray-500 dark:text-gray-400">
                {report.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                View Report
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Saved reports */}
      <ATMCard title="Saved Reports" action={
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {savedReports.length} saved
        </span>
      }>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => <ATMSkeleton key={i} variant="rect" height="44px" />)}
          </div>
        ) : savedReports.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No saved reports yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Created By</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Last Run</th>
                  <th className="pb-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {savedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="py-3 text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        {report.name}
                      </div>
                    </td>
                    <td className="py-3">
                      <ATMBadge variant="default" size="sm">{report.type}</ATMBadge>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{report.createdBy}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{report.lastRun}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Run
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>

      {/* Scheduled reports */}
      <ATMCard title="Scheduled Reports" action={
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          {scheduledReports.filter((r) => r.enabled).length} active
        </div>
      }>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => <ATMSkeleton key={i} variant="rect" height="44px" />)}
          </div>
        ) : scheduledReports.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No scheduled reports.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Report</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Frequency</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Next Run</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Format</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Recipients</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {scheduledReports.map((report) => (
                  <tr key={report.id}>
                    <td className="py-3 text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {report.name}
                      </div>
                    </td>
                    <td className="py-3">
                      <ATMBadge variant="default" size="sm">{report.frequency}</ATMBadge>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{report.nextRun}</td>
                    <td className="py-3">
                      <ATMBadge variant="outline" size="sm">
                        <FileText className="h-3 w-3" />
                        {report.format}
                      </ATMBadge>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{report.recipients} users</td>
                    <td className="py-3">
                      <ATMBadge variant={report.enabled ? 'success' : 'default'} size="sm" dot>
                        {report.enabled ? 'Active' : 'Paused'}
                      </ATMBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>
    </div>
  );
}

export default ReportsHubPage;
