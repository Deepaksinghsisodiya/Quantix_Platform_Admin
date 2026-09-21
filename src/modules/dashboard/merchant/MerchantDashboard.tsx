import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Coins,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  Key,
  LayoutDashboard,
  LayoutGrid,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  TicketCheck,
  User,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMStatsCard, ATMSkeleton } from '@/shared/ui';
import { ChartEmptyState, ChartSkeleton, TOOLTIP_STYLE } from '../components/charts';
import type {
  MerchantSelfDownloadPackage,
  MerchantSelfInvoice,
  MerchantSelfSubscription,
  MerchantSelfToken,
  MerchantSelfWallet,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { OPEN_TICKET_STATUSES, type TicketListItem, type TicketStatus } from '@/lib/types/helpdesk';
import type { DateRangeKey } from './MerchantDashboardWrapper';

const DAY_MS = 86_400_000;
const STORAGE_KEY = 'quantix-merchant-dashboard-sections';

type SectionId =
  | 'kpi-cards'
  | 'licence-status'
  | 'activity-chart'
  | 'plan-detail'
  | 'invoices'
  | 'tickets'
  | 'downloads'
  | 'quick-actions';

const SECTION_DEFS: { id: SectionId; label: string }[] = [
  { id: 'kpi-cards', label: 'KPI Cards' },
  { id: 'licence-status', label: 'Licence / Wallet Status' },
  { id: 'activity-chart', label: 'Activity Trend' },
  { id: 'plan-detail', label: 'Plan / Licence Detail' },
  { id: 'invoices', label: 'Recent Invoices' },
  { id: 'tickets', label: 'Support Tickets' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'quick-actions', label: 'Quick Actions' },
];

interface MerchantDashboardProps {
  profileQuery: any;
  tokensQuery: any;
  walletQuery: any;
  walletTxnQuery: any;
  invoicesQuery: any;
  subscriptionQuery: any;
  downloadsQuery: any;
  ticketsQuery: any;
  isEnterprise: boolean;
  dateRange: DateRangeKey;
  setDateRange: (range: DateRangeKey) => void;
  paused: boolean;
  secondsUntilRefresh: number;
  toggleRefresh: () => void;
  refreshNow: () => void;
  isLoadingHeader: boolean;
  hasError: boolean;
}

/** Mirror of the wallet transaction rows — verified against the live wire. */
interface WalletTransactionDto {
  readonly walletTransactionId?: string;
  readonly transactionType: string;
  readonly openingBalance: number;
  readonly tokenAmount: number;
  readonly tokenBalanceAfter: number;
  readonly currencyAmount: number | null;
  readonly currencyCode: string | null;
  readonly reason: string | null;
  readonly description: string | null;
  readonly createdAt: string;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  profileQuery,
  tokensQuery,
  walletQuery,
  walletTxnQuery,
  invoicesQuery,
  subscriptionQuery,
  downloadsQuery,
  ticketsQuery,
  isEnterprise,
  dateRange,
  setDateRange,
  paused,
  secondsUntilRefresh,
  toggleRefresh,
  refreshNow,
  isLoadingHeader,
  hasError,
}) => {
  const merchant = (profileQuery.data?.data ?? null) as MerchantSelfProfile | null;
  const tokens = (tokensQuery.data?.data ?? ([] as readonly MerchantSelfToken[])) as readonly MerchantSelfToken[];
  const invoices = (invoicesQuery.data?.data ?? ([] as readonly MerchantSelfInvoice[])) as readonly MerchantSelfInvoice[];
  const wallet = walletQuery.data?.data ?? (null as MerchantSelfWallet | null);
  const subscription = subscriptionQuery.data?.data ?? (null as MerchantSelfSubscription | null);
  const packages = ((downloadsQuery.data?.data?.packages ?? []) as MerchantSelfDownloadPackage[]).filter(
    (p: MerchantSelfDownloadPackage) => p.isEligible,
  );
  const ticketRows = (ticketsQuery.data?.data ?? ([] as readonly TicketListItem[])) as readonly TicketListItem[];
  const openTickets = ticketRows.filter((t) => OPEN_TICKET_STATUSES.has(t.status));

  const rawTxns = walletTxnQuery.data?.data;
  const walletTxns = Array.isArray(rawTxns) ? (rawTxns as WalletTransactionDto[]) : [];

  const [hidden, setHidden] = useState<SectionId[]>(loadHidden);

  const isHidden = (id: SectionId) => hidden.includes(id);
  const toggleSection = (id: SectionId) => {
    setHidden((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveHidden(next);
      return next;
    });
  };
  const resetSections = () => {
    setHidden([]);
    saveHidden([]);
  };

  const [showCustomize, setShowCustomize] = useState(false);

  /* ── Licence / billing position (rules copied from the previous dashboard) ──
     Rule 7: a token's window starts the day the merchant APPLIES it, so bought-but-not-
     applied tokens are coverage in hand, not a running licence. */
  const licence = useMemo(() => {
    const active = tokens.filter((t) => t.status === 'Active');
    const applied = active
      .filter((t) => !!t.activatedAt)
      .sort((a, b) => new Date(b.activatedAt!).getTime() - new Date(a.activatedAt!).getTime());
    const current = applied[0] ?? null;
    const inHand = active.filter((t) => !t.activatedAt);

    let daysRemaining: number | null = null;
    if (current?.activatedAt) {
      const expiry = new Date(current.activatedAt).getTime() + current.validityDays * DAY_MS;
      daysRemaining = Math.ceil((expiry - Date.now()) / DAY_MS);
    }

    const daysInHand = inHand.reduce((sum, t) => sum + t.validityDays, 0);
    return { current, inHand, daysRemaining, daysInHand, hasAnyToken: tokens.length > 0 };
  }, [tokens]);

  const billing = useMemo(() => {
    const unpaid = invoices.filter(
      (i) => i.status !== 'Paid' && i.status !== 'Cancelled' && i.status !== 'Refunded',
    );
    const outstanding = unpaid.reduce((sum, i) => sum + (i.totalCurrency ?? 0), 0);
    const currency = invoices[0]?.currencyCode ?? undefined;
    const paid = invoices.filter((i) => !unpaid.includes(i));
    return { unpaid, outstanding, currency, recent: [...unpaid, ...paid].slice(0, 5) };
  }, [invoices]);

  const spendingTrend = useMemo(
    () => bucketSpending(walletTxns, dateRange),
    [walletTxns, dateRange],
  );
  const tokenTrend = useMemo(() => bucketTokens(tokens, dateRange), [tokens, dateRange]);

  const alert = isEnterprise
    ? walletAlert(wallet)
    : licenceAlert(licence);

  const sections: { id: SectionId; node: React.ReactNode }[] = [
    {
      id: 'kpi-cards',
      node: (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {isLoadingHeader
            ? Array.from({ length: 6 }, (_, i) => (
                <ATMSkeleton key={i} height="150px" className="rounded-2xl animate-pulse" />
              ))
            : kpiCards({
                isEnterprise,
                licence,
                wallet,
                subscription,
                billing,
                packages,
                openTickets,
                tokens,
              }).map((card, i) => (
                <FadeIn key={card.label} index={i}>
                  <Link to={card.to} className="block">
                    <ATMStatsCard
                      label={card.label}
                      value={card.value}
                      icon={card.icon}
                      variant={card.variant}
                      description={card.description}
                    />
                  </Link>
                </FadeIn>
              ))}
        </div>
      ),
    },
    {
      id: 'licence-status',
      node: alert ? <AlertBanner alert={alert} /> : null,
    },
    {
      id: 'activity-chart',
      node: isEnterprise ? (
        <ATMCard
          title="Wallet spending"
          extra={<span className="text-xs font-semibold text-slate-500">{dateRange} window</span>}
        >
          <PeriodTrendChart
            data={spendingTrend}
            loading={walletTxnQuery.isLoading}
            label="Tokens deducted"
            color="var(--color-accent-600, #7c3aed)"
            emptyMessage="No wallet deductions in this window."
          />
        </ATMCard>
      ) : (
        <ATMCard
          title="Token acquisitions"
          extra={<span className="text-xs font-semibold text-slate-500">{dateRange} window</span>}
        >
          <PeriodTrendChart
            data={tokenTrend}
            loading={tokensQuery.isLoading}
            label="Tokens bought"
            color="var(--color-accent-600, #7c3aed)"
            emptyMessage="No tokens bought in this window."
          />
        </ATMCard>
      ),
    },
    {
      id: 'plan-detail',
      node: (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel
            title={isEnterprise ? 'Your subscription' : 'Your licence'}
            action={
              <Link
                to="/merchant/tokens"
                className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                {isEnterprise ? 'View tokens' : 'View all tokens'}
              </Link>
            }
          >
            {isEnterprise ? (
              subscriptionQuery.isLoading ? (
                <ATMSkeleton count={4} variant="text" />
              ) : subscription ? (
                <dl className="space-y-2.5 text-sm">
                  <Row label="Plan" value={subscription.planDisplayName} />
                  <Row
                    label="Daily charge"
                    value={formatCurrencyOrDash(subscription.dailySubscriptionPrice, billing.currency)}
                  />
                  {subscription.commissionPercent > 0 && (
                    <Row label="Commission rate" value={`${subscription.commissionPercent}%`} />
                  )}
                  <Row label="Status" value={subscription.status} />
                  <Row label="Started" value={formatDate(subscription.startDate)} />
                </dl>
              ) : (
                <Empty text="No active subscription is attached to your account." />
              )
            ) : tokensQuery.isLoading ? (
              <ATMSkeleton count={4} variant="text" />
            ) : licence.current ? (
              <dl className="space-y-2.5 text-sm">
                <Row label="Plan" value={licence.current.planName || planLabel(licence.current.plan)} />
                <Row label="Validity" value={`${licence.current.validityDays} days`} />
                <Row label="Applied on" value={formatDate(licence.current.activatedAt)} />
                <Row
                  label="Runs until"
                  value={formatDate(
                    new Date(
                      new Date(licence.current.activatedAt!).getTime() +
                        licence.current.validityDays * DAY_MS,
                    ).toISOString(),
                  )}
                />
                <div className="!mt-4 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                  {licence.inHand.length > 0 ? (
                    <>
                      You hold {licence.inHand.length} more token
                      {licence.inHand.length === 1 ? '' : 's'} ({licence.daysInHand} days of cover).
                      Apply the next one on your POS when this licence ends — the countdown starts
                      then, so nothing is wasted by holding it.
                    </>
                  ) : (
                    <>
                      You have no further tokens in hand. Buy your next one before{' '}
                      {formatDate(
                        new Date(
                          new Date(licence.current.activatedAt!).getTime() +
                            licence.current.validityDays * DAY_MS,
                        ).toISOString(),
                      )}{' '}
                      to avoid interruption.
                    </>
                  )}
                </div>
              </dl>
            ) : licenseInHandEmpty(licence) ?? (
              <Empty
                text={
                  licence.hasAnyToken
                    ? 'No token is currently active on your account. Buy one to keep your POS licensed.'
                    : 'No licence token has been issued to your account yet.'
                }
              />
            )}
          </Panel>

          <Panel
            title="Recent invoices"
            action={
              <Link
                to="/merchant/invoices"
                className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                View all
              </Link>
            }
          >
            {invoicesQuery.isLoading ? (
              <ATMSkeleton count={4} variant="text" />
            ) : billing.recent.length === 0 ? (
              <Empty text="No invoices have been issued to your account yet." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {billing.recent.map((inv) => (
                  <li key={inv.invoiceId} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {inv.invoiceNumber}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {inv.invoiceType} · {formatDate(inv.invoiceDate)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrencyOrDash(inv.totalCurrency, inv.currencyCode)}
                      </p>
                      <InvoiceStatus status={inv.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      ),
    },
    {
      id: 'tickets',
      node: (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel
            title="Support tickets"
            action={
              <Link
                to="/merchant/support"
                className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                View all
              </Link>
            }
          >
            {ticketsQuery.isLoading ? (
              <ATMSkeleton count={4} variant="text" />
            ) : ticketRows.length === 0 ? (
              <Empty text="You have no support tickets yet." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {ticketRows.slice(0, 5).map((t) => (
                  <li key={t.ticketId}>
                    <Link
                      to={`/merchant/support/${t.ticketId}`}
                      className="group flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
                          {t.subject}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {t.ticketNumber} · {t.category} · {t.priority}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <TicketStatusPill status={t.status} />
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500 dark:text-slate-600" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Downloads"
            action={
              <Link
                to="/merchant/downloads"
                className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
              >
                All downloads
              </Link>
            }
          >
            {downloadsQuery.isLoading ? (
              <ATMSkeleton count={4} variant="text" />
            ) : packages.length === 0 ? (
              <Empty text="Nothing has been released for your plan yet." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {packages.slice(0, 5).map((p) => (
                  <li key={p.packageId} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {p.appName} {p.version}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {p.platform} · released {formatDate(p.releasedAt)}
                      </p>
                    </div>
                    <Download className="h-4 w-4 shrink-0 text-slate-400" />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      ),
    },
    {
      id: 'quick-actions',
      node: (
        <Panel title="Quick actions">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {isEnterprise ? (
              <ActionLink to="/merchant/wallet" icon={Wallet} label="Recharge your wallet" />
            ) : (
              <ActionLink to="/merchant/tokens" icon={Key} label="Buy a licence token" />
            )}
            <ActionLink to="/merchant/invoices" icon={FileText} label="Invoices and payments" />
            <ActionLink to="/merchant/support" icon={TicketCheck} label="Open a support ticket" />
            <ActionLink to="/merchant/profile" icon={User} label="Update contact details" />
          </div>
        </Panel>
      ),
    },
  ];

  const visibleSections = SECTION_DEFS.filter((def) => !isHidden(def.id))
    .map((def) => sections.find((s) => s.id === def.id))
    .filter((s): s is { id: SectionId; node: React.ReactNode } => !!s && !!s.node);

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Header — mirrors the Admin dashboard's controls */}
      <ATMPageHeader
        icon={LayoutDashboard}
        iconColor="theme"
        title="Dashboard"
        subtitle={
          profileQuery.isLoading ? (
            <ATMSkeleton width="220px" height="14px" />
          ) : merchant ? (
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {merchant.displayName || merchant.companyName}
              </span>
              <Dot />
              <span className="font-mono text-xs">{merchant.merchantCode ?? '—'}</span>
              <Dot />
              <span>{isEnterprise ? 'Enterprise Cloud' : 'Standalone'}</span>
              <Dot />
              <StatusPill status={merchant.merchantStatus} />
            </span>
          ) : null
        }
        extraActions={
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/80 dark:bg-[#13151a]/80 px-2.5 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-xs">
              <button
                type="button"
                onClick={toggleRefresh}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title={paused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={refreshNow}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Refresh now"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              {!paused && (
                <span className="tabular-nums font-mono text-slate-400 dark:text-slate-500 text-[11px]">
                  {secondsUntilRefresh}s
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCustomize((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border px-3 h-9 text-xs font-bold transition-all duration-200 shadow-xs',
                showCustomize
                  ? 'border-primary-500/40 bg-primary-500/10 text-primary-600 dark:text-primary-400 dark:border-primary-500/30'
                  : 'border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#13151a]/80 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 backdrop-blur-xl',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Customize
            </button>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-[#13151a]/80 text-slate-400 dark:text-slate-500 backdrop-blur-xl shadow-xs">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="inline-flex rounded-xl border border-slate-200/80 bg-white/80 p-0.5 dark:border-slate-800 dark:bg-[#13151a]/80 h-9 items-center backdrop-blur-xl shadow-xs">
                {DATE_RANGE_TABS.map((range) => (
                  <button
                    key={range.key}
                    type="button"
                    onClick={() => setDateRange(range.key)}
                    className={cn(
                      'rounded-lg px-2.5 h-7 flex items-center justify-center text-[11px] font-bold transition-all duration-200 uppercase tracking-wider',
                      dateRange === range.key
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {hasError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2.5">
          <AlertTriangle className="h-[18px] w-[18px]" />
          <span>One or more dashboard queries failed. Some sections may show stale data.</span>
          <button
            type="button"
            onClick={() => void refreshNow()}
            className="underline ml-auto font-black hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {showCustomize && (
        <FadeIn index={0}>
          <CustomizePanel hidden={hidden} onToggle={toggleSection} onReset={resetSections} />
        </FadeIn>
      )}

      {visibleSections.map((section, i) => (
        <FadeIn key={section.id} index={i}>
          {section.node}
        </FadeIn>
      ))}
    </div>
  );
};

const DATE_RANGE_TABS: { key: DateRangeKey; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: '12m', label: '12 months' },
];

interface KpiCard {
  label: string;
  icon: LucideIcon;
  value: string;
  description: string;
  variant: 'accent' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';
  to: string;
}

function kpiCards(args: {
  isEnterprise: boolean;
  licence: {
    daysRemaining: number | null;
    inHand: readonly MerchantSelfToken[];
    daysInHand: number;
    hasAnyToken: boolean;
  };
  wallet: MerchantSelfWallet | null;
  subscription: MerchantSelfSubscription | null;
  billing: { unpaid: readonly MerchantSelfInvoice[]; outstanding: number; currency?: string };
  packages: readonly MerchantSelfDownloadPackage[];
  openTickets: readonly TicketListItem[];
  tokens: readonly MerchantSelfToken[];
}): KpiCard[] {
  const { isEnterprise, licence, wallet, subscription, billing, packages, openTickets, tokens } = args;

  const activeTokens = tokens.filter((t) => t.status === 'Active').length;

  const cards: KpiCard[] = [
    isEnterprise
      ? {
          label: 'Wallet balance',
          icon: Wallet,
          value: wallet ? `${wallet.tokenBalance.toFixed(2)} tokens` : '—',
          variant: 'accent',
          description:
            wallet && (wallet.runwayBasis === 'Usage' || wallet.runwayBasis === 'Plan')
              ? `≈ ${Math.floor(wallet.projectedDepletionDays)} days of cover`
              : 'Enterprise wallet',
          to: '/merchant/wallet',
        }
      : {
          label: 'Licence remaining',
          icon: Key,
          value:
            licence.daysRemaining !== null
              ? `${Math.max(0, licence.daysRemaining)} days`
              : licence.inHand.length > 0
                ? 'Not applied'
                : '—',
          variant: 'accent',
          description:
            licence.daysRemaining !== null
              ? 'On the token running now'
              : licence.inHand.length > 0
                ? 'Apply a token on your POS to start it'
                : 'No active licence',
          to: '/merchant/tokens',
        },
    isEnterprise
      ? {
          label: 'Runway',
          icon: ShieldCheck,
          value:
            wallet && wallet.runwayBasis !== 'None'
              ? `${Math.max(0, Math.floor(wallet.projectedDepletionDays))} days`
              : '—',
          variant: wallet && wallet.runwayBasis !== 'None' && wallet.projectedDepletionDays <= 7 ? 'amber' : 'slate',
          description: wallet
            ? wallet.runwayBasis === 'Usage'
              ? 'At your average daily usage'
              : wallet.runwayBasis === 'Plan'
                ? "At your subscription's daily charge"
                : 'No daily charge recorded yet'
            : 'Enterprise wallet',
          to: '/merchant/wallet',
        }
      : {
          label: 'Coverage in hand',
          icon: ShieldCheck,
          value: licence.inHand.length > 0 ? `${licence.daysInHand} days` : '0 days',
          variant: 'slate',
          description:
            licence.inHand.length > 0
              ? `${licence.inHand.length} token${licence.inHand.length === 1 ? '' : 's'} bought, not applied`
              : 'Nothing held in reserve',
          to: '/merchant/tokens',
        },
    {
      label: 'Outstanding',
      icon: CreditCard,
      value:
        billing.unpaid.length > 0
          ? formatCurrencyOrDash(billing.outstanding, billing.currency)
          : formatCurrencyOrDash(0, billing.currency),
      variant: billing.unpaid.length > 0 ? 'amber' : 'accent',
      description:
        billing.unpaid.length > 0
          ? `${billing.unpaid.length} unpaid invoice${billing.unpaid.length === 1 ? '' : 's'}`
          : 'All invoices settled',
      to: '/merchant/invoices',
    },
    {
      label: 'Open tickets',
      icon: TicketCheck,
      value: openTickets.length.toLocaleString(),
      variant: 'indigo',
      description:
        openTickets.length > 0 ? 'Awaiting your action or our reply' : 'No open support tickets',
      to: '/merchant/support',
    },
    {
      label: 'Downloads',
      icon: Download,
      value: packages.length > 0 ? `${packages.length} available` : 'None yet',
      variant: 'purple',
      description:
        packages.length > 0 ? 'Installers and manuals for your plan' : 'Nothing released for your plan yet',
      to: '/merchant/downloads',
    },
  ];

  cards.push(
    isEnterprise
      ? {
          label: 'Daily charge',
          icon: Coins,
          value: formatCurrencyOrDash(subscription?.dailySubscriptionPrice ?? 0, billing.currency),
          variant: 'emerald',
          description: subscription ? `on ${subscription.planDisplayName}` : 'Your subscription plan',
          to: '/merchant/wallet',
        }
      : {
          label: 'Active tokens',
          icon: Key,
          value: activeTokens.toLocaleString(),
          variant: 'emerald',
          description:
            activeTokens > 0
              ? 'Running or held on your account'
              : 'No token active yet — buy one to licence your POS',
          to: '/merchant/tokens',
        },
  );

  return cards;
}

interface LicenceLike {
  daysRemaining: number | null;
  inHand: readonly MerchantSelfToken[];
  hasAnyToken: boolean;
}

function licenceAlert(licence: LicenceLike): AlertTone | null {
  const days = licence.daysRemaining;
  if (days !== null && days <= 0) {
    return {
      tone: 'danger',
      icon: AlertTriangle,
      text: `Your licence has run out. ${
        licence.inHand.length > 0
          ? 'Apply a new token on your POS to restore full service.'
          : 'Buy a token from the Tokens page to restore full service.'
      }`,
    };
  }
  if (days !== null && days <= 7) {
    return {
      tone: 'warn',
      icon: AlertTriangle,
      text: `Your licence expires in ${days} day${days === 1 ? '' : 's'}. ${
        licence.inHand.length > 0
          ? 'You have a token in hand — apply it before this one runs out.'
          : 'Buy your next token now to avoid interruption.'
      }`,
    };
  }
  if (days !== null) {
    return {
      tone: 'ok',
      icon: CheckCircle2,
      text: `Your POS is licensed for another ${days} day${days === 1 ? '' : 's'}.`,
    };
  }
  if (licence.inHand.length > 0) {
    return {
      tone: 'info',
      icon: Key,
      text: `You have ${licence.inHand.length} token${licence.inHand.length === 1 ? '' : 's'} ready. The countdown starts when you apply one on your POS.`,
    };
  }
  return {
    tone: 'danger',
    icon: AlertTriangle,
    text: licence.hasAnyToken
      ? 'No licence token is active on your account. Buy one to keep your POS running.'
      : 'No licence token has been issued to your account yet. Contact your operator if you were expecting one.',
  };
}

function walletAlert(wallet: MerchantSelfWallet | null): AlertTone | null {
  if (!wallet) return null;
  const inGrace = wallet.gracePeriodPhase && wallet.gracePeriodPhase !== 'None';
  if (inGrace) {
    return {
      tone: 'danger',
      icon: AlertTriangle,
      text: `Your wallet has run out and your account is in the ${wallet.gracePeriodPhase} grace phase. Recharge now to restore full service.`,
    };
  }
  if (wallet.runwayBasis !== 'None' && wallet.projectedDepletionDays <= 7) {
    return {
      tone: 'warn',
      icon: AlertTriangle,
      text: `Your wallet covers about ${Math.floor(wallet.projectedDepletionDays)} more day${
        Math.floor(wallet.projectedDepletionDays) === 1 ? '' : 's'
      } at your current daily charge.`,
    };
  }
  return null;
}

function licenseInHandEmpty(licence: {
  current: MerchantSelfToken | null;
  inHand: readonly MerchantSelfToken[];
}): React.ReactNode | null {
  if (licence.current) return null;
  if (licence.inHand.length === 0) return null;
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        You have {licence.inHand.length} token{licence.inHand.length === 1 ? '' : 's'} ready to use.
        A token&apos;s validity starts the day you apply it on your POS, so nothing is counting down yet.
      </p>
      <ul className="space-y-2">
        {licence.inHand.slice(0, 4).map((t) => (
          <li
            key={t.tokenId}
            className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs dark:border-slate-800"
          >
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {t.planName || planLabel(t.plan)} · {t.validityDays} days
            </span>
            <span className="text-slate-500 dark:text-slate-400">bought {formatDate(t.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Period bucketing for the activity charts ─────────────────────────────── */

function windowBounds(range: DateRangeKey): { from: number; to: number } {
  const to = Date.now();
  const from = new Date(to);
  switch (range) {
    case '7d': from.setDate(from.getDate() - 7); break;
    case '30d': from.setDate(from.getDate() - 30); break;
    case '90d': from.setDate(from.getDate() - 90); break;
    case '12m': from.setFullYear(from.getFullYear() - 1); break;
  }
  return { from: from.getTime(), to };
}

function periodLabel(ts: number, range: DateRangeKey): string {
  const d = new Date(ts);
  if (range === '7d') {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  if (range === '30d') {
    const monday = new Date(d);
    const day = (d.getDay() + 6) % 7; // Monday-first
    monday.setDate(d.getDate() - day);
    return monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function bucketSpending(
  txns: readonly WalletTransactionDto[],
  range: DateRangeKey,
): { period: string; value: number }[] {
  const { from, to } = windowBounds(range);
  const map = new Map<string, number>();
  for (const t of txns) {
    if (t.tokenAmount >= 0) continue;
    const ts = new Date(t.createdAt).getTime();
    if (Number.isNaN(ts) || ts < from || ts > to) continue;
    const key = periodLabel(ts, range);
    map.set(key, (map.get(key) ?? 0) + Math.abs(t.tokenAmount));
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, value]) => ({ period, value: round2(value) }));
}

function bucketTokens(
  tokens: readonly MerchantSelfToken[],
  range: DateRangeKey,
): { period: string; value: number }[] {
  const { from, to } = windowBounds(range);
  const map = new Map<string, number>();
  for (const t of tokens) {
    const ts = new Date(t.createdAt).getTime();
    if (Number.isNaN(ts) || ts < from || ts > to) continue;
    const key = periodLabel(ts, range);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, value]) => ({ period, value }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ── Small charts / alerts / panels ───────────────────────────────────────── */

function PeriodTrendChart({
  data,
  loading,
  label,
  color,
  emptyMessage,
}: {
  data: readonly { period: string; value: number }[];
  loading: boolean;
  label: string;
  color: string;
  emptyMessage: string;
}) {
  if (loading) return <ChartSkeleton height="280px" />;
  if (data.length === 0) return <ChartEmptyState message={emptyMessage} />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data as Array<{ period: string; value: number }>} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 11 }}
          className="fill-gray-500 dark:fill-gray-400"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="fill-gray-500 dark:fill-gray-400"
          tickLine={false}
          axisLine={false}
          width={56}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: 'rgba(107, 114, 128, 0.06)' }}
          formatter={((value: number) => [value.toLocaleString(), label]) as never}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} animationDuration={800} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface AlertTone {
  tone: 'ok' | 'warn' | 'danger' | 'info';
  icon: LucideIcon;
  text: string;
}

function AlertBanner({ alert }: { alert: AlertTone }) {
  const styles = {
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-300',
    warn: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-300',
    danger: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/25 dark:text-blue-300',
  }[alert.tone];
  const Icon = alert.icon;
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold', styles)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{alert.text}</span>
    </div>
  );
}

function CustomizePanel({
  hidden,
  onToggle,
  onReset,
}: {
  hidden: readonly SectionId[];
  onToggle: (id: SectionId) => void;
  onReset: () => void;
}) {
  return (
    <ATMCard title="Configure Widgets" extra={<p className="text-xs font-bold text-slate-400">Sections</p>}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Sections (top to bottom)
          </p>
          <ul className="space-y-1">
            {SECTION_DEFS.map((def) => {
              const visible = !hidden.includes(def.id);
              return (
                <li
                  key={def.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50/50 hover:bg-slate-100/50 dark:text-slate-300 dark:bg-slate-950/40 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => onToggle(def.id)}
                    className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500 dark:border-slate-800"
                    aria-label={`${visible ? 'Hide' : 'Show'} ${def.label}`}
                  />
                  {visible ? (
                    <Eye className="h-4 w-4 text-slate-400" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  )}
                  <span className="flex-1 truncate">{def.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          Reset to Default
        </button>
      </div>
    </ATMCard>
  );
}

/* ── Pieces ───────────────────────────────────────────────────────────────── */

function FadeIn({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div
      className="animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-[#13151a]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ActionLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary-400 hover:bg-primary-50/40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-500/60 dark:hover:bg-primary-950/20"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const ok = status === 'Active';
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        ok
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      )}
    >
      {status}
    </span>
  );
}

function InvoiceStatus({ status }: { status: string }) {
  const tone =
    status === 'Paid'
      ? 'text-emerald-600 dark:text-emerald-400'
      : status === 'Overdue'
        ? 'text-red-600 dark:text-red-400'
        : 'text-amber-600 dark:text-amber-400';
  return <p className={cn('text-[10px] font-bold uppercase tracking-wide', tone)}>{status}</p>;
}

function TicketStatusPill({ status }: { status: string }) {
  const isOpen = OPEN_TICKET_STATUSES.has(status as TicketStatus);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        isOpen
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      )}
    >
      {status}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-4 text-sm text-slate-500 dark:text-slate-400">{text}</p>;
}

function Dot() {
  return <span className="text-slate-300 dark:text-slate-600">·</span>;
}

/* ── Local persistence ────────────────────────────────────────────────────── */

function loadHidden(): SectionId[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((x) => SECTION_DEFS.some((d) => d.id === x));
      }
    }
  } catch {
    // Ignore — corrupt local storage shouldn't take the whole dashboard down.
  }
  return [];
}

function saveHidden(ids: SectionId[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore
  }
}

/* ── Formatting ───────────────────────────────────────────────────────────── */

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function planLabel(plan: string): string {
  return (
    {
      StandalonePos: 'Standalone POS',
      StandaloneCloud: 'Standalone Cloud',
      EnterpriseCloud: 'Enterprise Cloud',
    }[plan] ?? plan
  );
}

export default MerchantDashboard;