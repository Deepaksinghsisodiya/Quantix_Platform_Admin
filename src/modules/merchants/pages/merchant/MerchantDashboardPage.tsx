/**
 * Merchant self-service dashboard (Pass 40 surface, rebuilt 2026-09-02).
 *
 * This is the merchant's landing page. It leads with the one thing a merchant needs
 * from us and answers it plainly: **is my POS licensed, and for how much longer?**
 * (Until 2026-09-04 the /merchant route group had no navigation at all, so this page
 * doubled as the only way around the portal; that job now belongs to MerchantShell.)
 *
 * What the previous version did wrong:
 *   • "Active Tokens" counted every token ever issued, revoked ones included;
 *     "Recent Invoices" counted a page of 5, so it always read "5 invoices".
 *   • Linked Enterprise merchants to /merchant/subscription and /merchant/commission,
 *     neither of which is a route — both were dead ends.
 *   • Offered a "Need help?" panel naming an assigned account manager the platform
 *     does not have, pointing at quantix.example, a domain that does not exist.
 *   • Reported the wallet balance with no grace-period or depletion context, which is
 *     the part that actually tells an Enterprise merchant they are about to be cut off.
 *
 * Every figure below comes from /api/v1/merchant-self/*, which is scoped server-side
 * by the merchant_id JWT claim. Enterprise-only routes (wallet, subscription) answer
 * 400 MERCHANT_TYPE_MISMATCH for Standalone merchants and are skipped, not rendered
 * as an error the merchant can do nothing about.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Key,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react';
import {
  useGetSelfProfileQuery,
  useGetSelfTokensQuery,
  useGetSelfInvoicesQuery,
  useGetSelfWalletQuery,
  useGetSelfSubscriptionQuery,
  useGetSelfDownloadsQuery,
  type MerchantSelfInvoice,
  type MerchantSelfToken,
} from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { cn } from '@/lib/utils/cn';

const DAY_MS = 86_400_000;

export default function MerchantDashboardPage() {
  const profileQuery = useGetSelfProfileQuery();
  const tokensQuery = useGetSelfTokensQuery(undefined);
  const invoicesQuery = useGetSelfInvoicesQuery({ page: 1, pageSize: 20 });
  const downloadsQuery = useGetSelfDownloadsQuery();

  const merchant = (profileQuery.data?.data ?? null) as MerchantSelfProfile | null;
  const isEnterprise = merchant?.merchantType === 'Enterprise';

  const walletQuery = useGetSelfWalletQuery(undefined, { skip: !isEnterprise });
  const subscriptionQuery = useGetSelfSubscriptionQuery(undefined, { skip: !isEnterprise });

  const tokens = tokensQuery.data?.data ?? [];
  const invoices = invoicesQuery.data?.data ?? [];
  const wallet = walletQuery.data?.data ?? null;
  const subscription = subscriptionQuery.data?.data ?? null;
  // Only what this merchant can actually download; gated packages are listed too, with a
  // reason, but counting them here would promise something the plan doesn't include.
  const packages = (downloadsQuery.data?.data?.packages ?? []).filter((p) => p.isEligible);

  /* ── Licence position ────────────────────────────────────────────────────
     Rule 7: a token's window starts when the merchant APPLIES it. So there are
     two distinct things worth reporting, and conflating them is how a merchant
     gets a nasty surprise:
       • the token currently running on the POS (applied — has an expiry), and
       • tokens bought but not yet applied (coverage in hand — no expiry yet).  */
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

  /* ── Billing position ─────────────────────────────────────────────────── */
  const billing = useMemo(() => {
    const unpaid = invoices.filter(
      (i) => i.status !== 'Paid' && i.status !== 'Cancelled' && i.status !== 'Refunded',
    );
    const outstanding = unpaid.reduce((sum, i) => sum + (i.totalCurrency ?? 0), 0);
    // 2026-09-05: no 'USD' fallback — an invoice without a currency shows none.
    const currency = invoices[0]?.currencyCode ?? undefined;
    // Unpaid first: those are the ones the merchant can act on. Listing the five
    // most recent regardless meant a merchant with $1,200 outstanding saw five
    // PAID rows and no sign of what they owed.
    const paid = invoices.filter((i) => !unpaid.includes(i));
    return { unpaid, outstanding, currency, recent: [...unpaid, ...paid].slice(0, 5) };
  }, [invoices]);

  const loadingProfile = profileQuery.isLoading;
  const profileError = profileQuery.isError;

  if (profileError) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {(profileQuery.error as any)?.data?.message || 'We could not load your account.'}
            </p>
            <button
              type="button"
              onClick={() => void profileQuery.refetch()}
              className="mt-1 text-xs font-semibold text-red-700 underline dark:text-red-300"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — the title is the nav label, verbatim; the merchant's name lives in the shell. */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          {loadingProfile && 'Loading your account…'}
          {merchant && (
            <>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {merchant.displayName || merchant.companyName}
              </span>
              <Dot />
              <span className="font-mono text-xs">{merchant.merchantCode ?? '—'}</span>
              <Dot />
              <span>{merchant.merchantType === 'Enterprise' ? 'Enterprise Cloud' : 'Standalone'}</span>
              <Dot />
              <StatusPill status={merchant.merchantStatus} />
            </>
          )}
        </p>
      </header>

      {/* The one thing that matters most, stated first */}
      {!loadingProfile && !isEnterprise && <LicenceBanner licence={licence} loading={tokensQuery.isLoading} />}
      {!loadingProfile && isEnterprise && wallet && <WalletBanner wallet={wallet} />}

      {/* Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isEnterprise ? (
          <Tile
            icon={Wallet}
            label="Wallet balance"
            value={wallet ? `${wallet.tokenBalance.toFixed(2)} tokens` : '—'}
            note={
              wallet
                ? wallet.runwayBasis === 'Usage'
                  ? `≈ ${Math.floor(wallet.projectedDepletionDays)} days at current usage`
                  : wallet.runwayBasis === 'Plan'
                    ? `≈ ${Math.floor(wallet.projectedDepletionDays)} days at your plan's daily charge`
                    : 'No daily charge recorded yet'
                : 'Enterprise wallet'
            }
            loading={walletQuery.isLoading}
            to="/merchant/wallet"
          />
        ) : (
          <Tile
            icon={Key}
            label="Licence remaining"
            value={
              licence.daysRemaining !== null
                ? `${Math.max(0, licence.daysRemaining)} days`
                : licence.inHand.length > 0
                  ? 'Not applied'
                  : '—'
            }
            note={
              licence.daysRemaining !== null
                ? 'On the token running now'
                : licence.inHand.length > 0
                  ? 'Apply a token on your POS to start it'
                  : 'No active licence'
            }
            loading={tokensQuery.isLoading}
            to="/merchant/tokens"
          />
        )}

        {isEnterprise ? (
          // 2026-09-04: "Coverage in hand" is the Standalone unapplied-token concept; an
          // Enterprise merchant saw "0 days · Nothing held in reserve" beside a funded wallet.
          // What matters to them is runway: balance ÷ the daily charge.
          <Tile
            icon={ShieldCheck}
            label="Runway"
            value={
              wallet && wallet.runwayBasis !== 'None'
                ? `${Math.max(0, Math.floor(wallet.projectedDepletionDays))} days`
                : '—'
            }
            note={
              wallet
                ? wallet.runwayBasis === 'Usage'
                  ? 'At your average daily usage'
                  : wallet.runwayBasis === 'Plan'
                    ? 'At your subscription’s daily charge'
                    : 'No daily charge recorded yet'
                : 'Enterprise wallet'
            }
            tone={wallet && wallet.runwayBasis !== 'None' && wallet.projectedDepletionDays <= 7 ? 'warn' : 'ok'}
            loading={walletQuery.isLoading}
            to="/merchant/wallet"
          />
        ) : (
          <Tile
            icon={ShieldCheck}
            label="Coverage in hand"
            value={licence.inHand.length > 0 ? `${licence.daysInHand} days` : '0 days'}
            note={
              licence.inHand.length > 0
                ? `${licence.inHand.length} token${licence.inHand.length === 1 ? '' : 's'} bought, not applied`
                : 'Nothing held in reserve'
            }
            loading={tokensQuery.isLoading}
            to="/merchant/tokens"
          />
        )}

        <Tile
          icon={CreditCard}
          label="Outstanding"
          value={
            billing.unpaid.length > 0
              ? formatCurrencyOrDash(billing.outstanding, billing.currency)
              : formatCurrencyOrDash(0, billing.currency)
          }
          note={
            billing.unpaid.length > 0
              ? `${billing.unpaid.length} unpaid invoice${billing.unpaid.length === 1 ? '' : 's'}`
              : 'All invoices settled'
          }
          tone={billing.unpaid.length > 0 ? 'warn' : 'ok'}
          loading={invoicesQuery.isLoading}
          to="/merchant/invoices"
        />

        <Tile
          icon={Download}
          label="Downloads"
          value={packages.length > 0 ? `${packages.length} available` : 'None yet'}
          note={
            packages.length > 0
              ? 'Installers and manuals for your plan'
              : 'Nothing released for your plan yet'
          }
          loading={downloadsQuery.isLoading}
          to="/merchant/downloads"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Licence / subscription detail */}
        <Panel
          title={isEnterprise ? 'Your subscription' : 'Your licence'}
          action={
            <Link to="/merchant/tokens" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
              {isEnterprise ? 'View tokens' : 'View all tokens'}
            </Link>
          }
        >
          {isEnterprise ? (
            subscriptionQuery.isLoading ? (
              <Skeleton lines={4} />
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
            <Skeleton lines={4} />
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
              {/* What happens when it runs out — the merchant's real next step. */}
              <div className="!mt-4 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5 text-xs leading-relaxed text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400">
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
          ) : licence.inHand.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You have {licence.inHand.length} token{licence.inHand.length === 1 ? '' : 's'} ready to
                use. A token&apos;s validity starts the day you apply it on your POS, so nothing is
                counting down yet.
              </p>
              <ul className="space-y-2">
                {licence.inHand.slice(0, 4).map((t) => (
                  <li
                    key={t.tokenId}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-xs dark:border-gray-800"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {t.planName || planLabel(t.plan)} · {t.validityDays} days
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      bought {formatDate(t.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Empty
              text={
                licence.hasAnyToken
                  ? 'No token is currently active on your account. Buy one to keep your POS licensed.'
                  : 'No licence token has been issued to your account yet.'
              }
            />
          )}
        </Panel>

        {/* Billing */}
        <Panel
          title="Recent invoices"
          action={
            <Link to="/merchant/invoices" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
              View all
            </Link>
          }
        >
          {invoicesQuery.isLoading ? (
            <Skeleton lines={4} />
          ) : billing.recent.length === 0 ? (
            <Empty text="No invoices have been issued to your account yet." />
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {billing.recent.map((inv: MerchantSelfInvoice) => (
                <li key={inv.invoiceId} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {inv.invoiceNumber}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                      {inv.invoiceType} · {formatDate(inv.invoiceDate)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
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

      {/* Quick actions — every destination below is a route that exists. */}
      <Panel title="Quick actions">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {isEnterprise ? (
            <ActionLink to="/merchant/wallet" icon={Wallet} label="Recharge your wallet" />
          ) : (
            <ActionLink to="/merchant/tokens" icon={Key} label="Buy a licence token" />
          )}
          <ActionLink to="/merchant/invoices" icon={FileText} label="Invoices and payments" />
          <ActionLink to="/merchant/downloads" icon={Download} label="Downloads" />
          <ActionLink to="/merchant/profile" icon={User} label="Update contact details" />
        </div>
        {/* 2026-09-02: the old "Need help?" panel promised an assigned account manager
            and pointed at quantix.example. Neither exists — the platform records no
            account-manager assignment and that domain is not ours. Support contact
            details belong here once they are configuration, not invention. */}
      </Panel>
    </div>
  );
}

/* 2026-09-04: the private Shell page-frame is gone — MerchantShell frames every
   merchant page now, so the dashboard no longer carries its own container. */

/* ── Banners: the "are we about to be cut off" line ──────────────────────── */

function LicenceBanner({
  licence,
  loading,
}: {
  licence: { daysRemaining: number | null; inHand: readonly MerchantSelfToken[]; hasAnyToken: boolean };
  loading: boolean;
}) {
  if (loading) return null;

  const days = licence.daysRemaining;

  if (days !== null && days <= 0) {
    return (
      <Banner tone="danger" icon={AlertTriangle}>
        Your licence has run out. Apply a new token on your POS to restore full service
        {licence.inHand.length > 0
          ? ' — you already have one ready to use.'
          : '; buy one from the Tokens page.'}
      </Banner>
    );
  }
  if (days !== null && days <= 7) {
    return (
      <Banner tone="warn" icon={AlertTriangle}>
        Your licence expires in {days} day{days === 1 ? '' : 's'}.
        {licence.inHand.length > 0
          ? ' You have a token in hand — apply it before this one runs out.'
          : ' Buy your next token now to avoid interruption.'}
      </Banner>
    );
  }
  if (days !== null) {
    return (
      <Banner tone="ok" icon={CheckCircle2}>
        Your POS is licensed for another {days} day{days === 1 ? '' : 's'}.
      </Banner>
    );
  }
  if (licence.inHand.length > 0) {
    return (
      <Banner tone="info" icon={Key}>
        You have {licence.inHand.length} token{licence.inHand.length === 1 ? '' : 's'} ready. The
        countdown starts when you apply one on your POS.
      </Banner>
    );
  }
  return (
    <Banner tone="danger" icon={AlertTriangle}>
      {licence.hasAnyToken
        ? 'No licence token is active on your account. Buy one to keep your POS running.'
        : 'No licence token has been issued to your account yet. Contact your operator if you were expecting one.'}
    </Banner>
  );
}

function WalletBanner({
  wallet,
}: {
  wallet: {
    tokenBalance: number;
    gracePeriodPhase: string;
    projectedDepletionDays: number;
    consumptionRatePerDay: number;
    runwayBasis: 'Usage' | 'Plan' | 'None';
  };
}) {
  const inGrace = wallet.gracePeriodPhase && wallet.gracePeriodPhase !== 'None';
  if (inGrace) {
    return (
      <Banner tone="danger" icon={AlertTriangle}>
        Your wallet has run out and your account is in the {wallet.gracePeriodPhase} grace phase.
        Recharge now to restore full service.
      </Banner>
    );
  }
  if (wallet.runwayBasis !== 'None' && wallet.projectedDepletionDays <= 7) {
    return (
      <Banner tone="warn" icon={AlertTriangle}>
        Your wallet covers about {Math.floor(wallet.projectedDepletionDays)} more day
        {Math.floor(wallet.projectedDepletionDays) === 1 ? '' : 's'} at your current daily charge.
      </Banner>
    );
  }
  return null;
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: 'ok' | 'warn' | 'danger' | 'info';
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const styles = {
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-300',
    warn: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-300',
    danger: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/25 dark:text-blue-300',
  }[tone];
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold', styles)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────────── */

function Tile({
  icon: Icon,
  label,
  value,
  note,
  to,
  tone = 'ok',
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  to: string;
  tone?: 'ok' | 'warn';
  loading?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p
        className={cn(
          'mt-1 text-2xl font-bold',
          tone === 'warn' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-50',
        )}
      >
        {loading ? '…' : value}
      </p>
      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{note}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:gap-1.5 dark:text-blue-400">
        Open
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
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
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h2>
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
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/60 dark:hover:bg-blue-950/20"
    >
      <Icon className="h-4 w-4 text-gray-400" />
      {label}
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="font-semibold text-gray-900 dark:text-gray-100">{value}</dd>
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

function Empty({ text }: { text: string }) {
  return <p className="py-4 text-sm text-gray-500 dark:text-gray-400">{text}</p>;
}

function Skeleton({ lines }: { lines: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      ))}
    </div>
  );
}

function Dot() {
  return <span className="text-gray-300 dark:text-gray-600">·</span>;
}

/* ── Formatting ──────────────────────────────────────────────────────────── */

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
