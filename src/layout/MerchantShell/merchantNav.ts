/**
 * Merchant portal navigation — feeds the shared staff SidebarWrapper/TopbarWrapper so the
 * merchant portal renders the exact same chrome as the admin portal. Keep labels verbatim
 * to each page's own title (portal-wide page-title rule).
 */
import { Download, FileText, Key, LayoutDashboard, LifeBuoy, User, Wallet, type LucideIcon } from 'lucide-react';
import type { NavItem } from '@/layout/Sidebar/navConfig';

/** Wallet is Enterprise-only; filtered in the shell when the profile says Standalone. */
export const ENTERPRISE_ONLY_PATHS: ReadonlySet<string> = new Set(['/merchant/wallet']);

export const MERCHANT_NAV: NavItem[] = [
  { path: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard as LucideIcon, permission: null },
  { path: '/merchant/tokens', label: 'License Tokens', icon: Key as LucideIcon, permission: null },
  { path: '/merchant/wallet', label: 'Wallet', icon: Wallet as LucideIcon, permission: null },
  { path: '/merchant/invoices', label: 'Invoices & Payments', icon: FileText as LucideIcon, permission: null },
  { path: '/merchant/downloads', label: 'Downloads', icon: Download as LucideIcon, permission: null },
  { path: '/merchant/support', label: 'Support', icon: LifeBuoy as LucideIcon, permission: null },
  { path: '/merchant/profile', label: 'Profile', icon: User as LucideIcon, permission: null },
];