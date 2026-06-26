/**
 * Pass 40 (2026-05-24) â€” Merchant role dashboard. Renders a high-level snapshot
 * tailored to the merchant's MerchantType:
 *   â€¢ Standalone â€” no wallet; surfaces last token + invoices + downloads.
 *   â€¢ Enterprise â€” surfaces wallet balance + subscription status + commission rollup.
 *
 * Reads scope from useAuthStore.user; all data calls flow through merchantSelf.* which
 * is server-scoped by the JWT merchant_id claim.
 */
import {
  useGetSelfProfileQuery,
  useGetSelfTokensQuery,
  useGetSelfInvoicesQuery,
  useGetSelfWalletQuery,
} from '@/modules/merchants/services/merchantSelfApi';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/authStore';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { ATMCard } from '@/shared/ui';

export default function MerchantDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const profile = useGetSelfProfileQuery();
  const tokens = useGetSelfTokensQuery(undefined);
  const invoices = useGetSelfInvoicesQuery({ page: 1, pageSize: 5 });

  const m = (profile.data?.data ?? null) as MerchantSelfProfile | null;
  const isEnterprise = m?.merchantType === 'Enterprise';

  const wallet = useGetSelfWalletQuery(undefined, {
    skip: !isEnterprise,
  });


  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {m
            ? `${m.companyName} Â· ${m.merchantType} Â· ${m.country}`
            : 'Loading your account…'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isEnterprise && (
          <ATMCard title="Wallet Balance" hint="Daily subscription deductions and commission charges">
            {wallet.isLoading ? '…' : formatWalletBalance(wallet.data?.data)}
            <CardLink to="/merchant/wallet">View wallet â†'</CardLink>
          </ATMCard>
        )}
        <ATMCard title="Active Tokens" hint="License tokens issued to your account">
          {tokens.isLoading ? '…' : formatCount(tokens.data?.data, 'tokens')}
          <CardLink to="/merchant/tokens">View all â†'</CardLink>
        </ATMCard>
        <ATMCard title="Recent Invoices" hint="Last 5 invoices">
          {invoices.isLoading ? '…' : formatCount(invoices.data?.data, 'invoices')}
          <CardLink to="/merchant/invoices">View all â†'</CardLink>
        </ATMCard>
        <ATMCard title="Downloads" hint="Local apps, manuals, release notes">
          <span className="text-sm text-surface-600">Available for your plan</span>
          <CardLink to="/merchant/downloads">Browse â†'</CardLink>
        </ATMCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActionPanel title="Quick actions">
          {m?.merchantType === 'Standalone' ? (
            <>
              <ActionLink to="/merchant/tokens" label="Buy a license token" />
              <ActionLink to="/merchant/invoices" label="View paid invoices" />
              <ActionLink to="/merchant/downloads" label="Download local apps" />
            </>
          ) : (
            <>
              <ActionLink to="/merchant/wallet" label="Recharge wallet" />
              <ActionLink to="/merchant/subscription" label="View subscription" />
              <ActionLink to="/merchant/commission" label="Commission reports" />
            </>
          )}
          <ActionLink to="/merchant/profile" label="Edit profile" />
        </ActionPanel>
        <ActionPanel title="Need help?">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Your assigned account manager is happy to help with onboarding, billing,
            and integration questions. Use the contact form on{' '}
            <a href="/" className="text-primary-600 hover:underline">
              quantix.example
            </a>
            .
          </p>
        </ActionPanel>
      </div>
    </div>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-surface-800 p-4 shadow-sm">
      <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</h3>
      <div className="mt-2 text-2xl font-semibold text-surface-900 dark:text-surface-100">
        {children}
      </div>
      <p className="mt-2 text-xs text-surface-500">{hint}</p>
    </div>
  );
}

function CardLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="mt-3 inline-block text-sm font-medium text-primary-600 hover:underline"
    >
      {children}
    </Link>
  );
}

function ActionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white dark:bg-surface-800 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-200">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function ActionLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-surface-200 dark:border-surface-700 px-3 py-2 text-sm hover:border-primary-400 hover:bg-primary-50/40 dark:hover:bg-primary-900/10"
    >
      {label} â†'
    </Link>
  );
}

function formatCount(payload: unknown, label: string): string {
  if (Array.isArray(payload)) return `${payload.length} ${label}`;
  return `0 ${label}`;
}

function formatWalletBalance(payload: unknown): string {
  if (payload && typeof payload === 'object' && 'tokenBalance' in payload) {
    const v = (payload as { tokenBalance: number }).tokenBalance;
    return `${v.toFixed(2)} tokens`;
  }
  return '—';
}
