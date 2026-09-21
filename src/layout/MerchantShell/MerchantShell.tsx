/**
 * MerchantShell — 2026-09-04. The navigation frame for the merchant self-service portal.
 *
 * Until now the /merchant route group rendered a bare <Outlet />: once a merchant left the
 * dashboard there was no way back except the browser button, and no way to sign out at
 * all. This is the counterpart of the staff AppShell, kept deliberately small — a header
 * with the platform brand, the merchant's name and Sign out, plus one row of links.
 *
 * Link labels are the pages' own titles, verbatim (the portal-wide page-title rule).
 * "Wallet" is Enterprise-only, so it appears only once the profile says so; the profile
 * query is the same cache entry the dashboard reads — no extra request.
 */
import React, { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Download,
  FileText,
  Key,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useBrandName } from '@/shared/hooks/useBrandName';
import { useGetSelfProfileQuery } from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { cn } from '@/lib/utils/cn';

interface MerchantNavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly end?: boolean;
  readonly enterpriseOnly?: boolean;
}

const NAV: readonly MerchantNavItem[] = [
  { to: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/merchant/tokens', label: 'License Tokens', icon: Key },
  { to: '/merchant/wallet', label: 'Wallet', icon: Wallet, enterpriseOnly: true },
  { to: '/merchant/invoices', label: 'Invoices & Payments', icon: FileText },
  { to: '/merchant/downloads', label: 'Downloads', icon: Download },
  // 2026-09-08: the merchant portal had no way to reach the helpdesk.
  { to: '/merchant/support', label: 'Support', icon: LifeBuoy },
  { to: '/merchant/profile', label: 'Profile', icon: User },
];

const MerchantShell: React.FC = () => {
  const brand = useBrandName();
  const { logout, user } = useAuth();
  const location = useLocation();
  const profileQuery = useGetSelfProfileQuery();
  const merchant = (profileQuery.data?.data ?? null) as MerchantSelfProfile | null;
  const isEnterprise = merchant?.merchantType === 'Enterprise';
  const items = NAV.filter((item) => !item.enterpriseOnly || isEnterprise);

  return (
    <div className="min-h-screen bg-surface-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/merchant/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-sm font-black text-white">
              {brand.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{brand}</span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Merchant portal
              </span>
            </span>
          </NavLink>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-semibold">
                {merchant ? merchant.displayName || merchant.companyName : user?.email ?? ''}
              </p>
              {merchant && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {merchant.merchantType === 'Enterprise' ? 'Enterprise Cloud' : 'Standalone'}
                  {merchant.merchantCode ? ` · ${merchant.merchantCode}` : ''}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <nav aria-label="Merchant portal" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <ul className="-mb-px flex gap-1 overflow-x-auto">
            {items.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                        : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Suspense fallback={null}>
          <div key={location.pathname}>
            <Outlet />
          </div>
        </Suspense>
      </main>
    </div>
  );
};

export default MerchantShell;
