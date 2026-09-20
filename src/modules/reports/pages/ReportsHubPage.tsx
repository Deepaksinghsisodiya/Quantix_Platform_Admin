import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { usePermission } from '@/shared/hooks/usePermission';
import type { PermissionModule } from '@/lib/utils/permissions';
import {
  TrendingUp,
  DollarSign,
  Activity,
  UserMinus,
  Percent,
  Key,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * 2026-08-31: the "Saved Reports" and "Scheduled Reports" sections were REMOVED,
 * along with the useReportDefinitions hook that fed them. They read
 * GET /api/v1/reports/definitions — a route that has never existed on this API —
 * so both tables 404'd on every visit and the page showed "Failed to load saved
 * reports" under two headings for features the platform does not have: there is
 * no saved-report store and no report scheduler. The card grid below is real
 * navigation to reports that serve real data.
 * ------------------------------------------------------------------------- */

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
  /** 2026-09-08: the module the report's ROUTE is guarded by, when it is not `reports`. */
  readonly module?: PermissionModule;
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
    description: 'Revenue by stream, MRR/ARR, and average revenue per merchant.',
    icon: DollarSign,
    color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/40',
    route: '/reports/revenue',
  },
  {
    key: 'usage',
    title: 'Usage Report',
    description: 'Enterprise telemetry, Standalone activations, and engagement rates.',
    icon: Activity,
    color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40',
    route: '/reports/usage',
  },
  {
    key: 'churn',
    title: 'Churn Analysis',
    description: 'Deboarding, token lapses, and merchants flagged at risk by health score.',
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
    description: 'Token issuance, activation, renewal rate, and revenue by plan.',
    icon: Key,
    color: 'text-pink-600 bg-pink-100 dark:text-pink-400 dark:bg-pink-900/40',
    route: '/reports/tokens',
  },
  {
    key: 'compliance',
    title: 'Compliance Report',
    description: 'Data subject requests, their status, and coverage by regulation and region.',
    icon: ShieldCheck,
    color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/40',
    route: '/reports/compliance',
    // The route is guarded by the compliance module; a Finance Manager (reports, no
    // compliance) used to click this card and land on Access Denied.
    module: 'compliance',
  },
  // 2026-09-04 (decision D): the "Custom Report" card is gone with its page — there is no
  // query engine, and a card leading to "not available yet" is not a report.
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ReportsHubPage() {
  const { hasPermission } = usePermission();
  const visibleCards = REPORT_CARDS.filter((c) => !c.module || hasPermission(c.module, 'view'));

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Reports &amp; Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Pre-built reports over live platform data. Every report exports to CSV or PDF.
        </p>
      </div>

      {/* Report cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleCards.map((report) => {
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

    </div>
  );
}

export default ReportsHubPage;
