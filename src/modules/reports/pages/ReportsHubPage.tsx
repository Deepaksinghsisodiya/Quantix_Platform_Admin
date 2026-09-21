import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { usePermission } from '@/shared/hooks/usePermission';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
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
  BarChart3,
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
  /** 2026-09-08: gradient square icon tile, matching the report page's ATMPageHeader
   *  icon (same style as Growth Report) — white glyph + soft colored glow. */
  readonly color: string;
  /** Solid top accent bar (gradient start → transparent), matched to the icon tint. */
  readonly accent: string;
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
    color: 'bg-gradient-to-br from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/25',
    accent: 'from-emerald-500 to-emerald-500/0',
    route: '/reports/growth',
  },
  {
    key: 'revenue',
    title: 'Revenue Report',
    description: 'Revenue by stream, MRR/ARR, and average revenue per merchant.',
    icon: DollarSign,
    color: 'bg-gradient-to-br from-violet-600 to-violet-400 shadow-lg shadow-violet-500/25',
    accent: 'from-violet-500 to-violet-500/0',
    route: '/reports/revenue',
  },
  {
    key: 'usage',
    title: 'Usage Report',
    description: 'Enterprise telemetry, Standalone activations, and engagement rates.',
    icon: Activity,
    color: 'bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg shadow-blue-500/25',
    accent: 'from-blue-500 to-blue-500/0',
    route: '/reports/usage',
  },
  {
    key: 'churn',
    title: 'Churn Analysis',
    description: 'Deboarding, token lapses, and merchants flagged at risk by health score.',
    icon: UserMinus,
    color: 'bg-gradient-to-br from-rose-600 to-rose-400 shadow-lg shadow-rose-500/25',
    accent: 'from-rose-500 to-rose-500/0',
    route: '/reports/churn',
  },
  {
    key: 'commission',
    title: 'Commission Report',
    description: 'Review commission earnings, settlement status, and rate analysis by merchant.',
    icon: Percent,
    color: 'bg-gradient-to-br from-amber-500 to-amber-400 shadow-lg shadow-amber-500/25',
    accent: 'from-amber-500 to-amber-500/0',
    route: '/reports/commission',
  },
  {
    key: 'tokens',
    title: 'Token Report',
    description: 'Token issuance, activation, renewal rate, and revenue by plan.',
    icon: Key,
    color: 'bg-gradient-to-br from-pink-600 to-pink-400 shadow-lg shadow-pink-500/25',
    accent: 'from-pink-500 to-pink-500/0',
    route: '/reports/tokens',
  },
  {
    key: 'compliance',
    title: 'Compliance Report',
    description: 'Data subject requests and their status against the response window.',
    icon: ShieldCheck,
    color: 'bg-gradient-to-br from-cyan-600 to-cyan-400 shadow-lg shadow-cyan-500/25',
    accent: 'from-cyan-500 to-cyan-500/0',
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
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={BarChart3}
        iconColor="theme"
        title="Reports & Analytics"
        subtitle="Pre-built reports over live platform data. Every report exports to CSV or PDF."
      />

      {/* Report cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleCards.map((report) => {
          const Icon = report.icon;
          return (
            <Link
              key={report.key}
              to={report.route}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5',
                'transition-all duration-300 hover:-translate-y-1',
                'hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5',
                'dark:border-slate-800 dark:bg-[#13151a] dark:hover:border-slate-700',
                'dark:hover:shadow-black/40',
              )}
            >
              {/* Accent bar — matched to the report's icon tint; fades in on hover */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                  report.accent,
                )}
              />

              {/* Icon tile — same gradient style as the report page's ATMPageHeader */}
              <div className="relative inline-flex">
                <div
                  className={cn(
                    'pointer-events-none absolute -inset-1.5 rounded-2xl bg-gradient-to-b opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60',
                    report.accent,
                  )}
                />
                <div
                  className={cn(
                    'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-105',
                    report.color,
                  )}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                {report.title}
              </h3>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                {report.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  View Report
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-400">
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ReportsHubPage;