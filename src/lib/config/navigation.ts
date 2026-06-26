import type { PermissionModule } from '@/lib/utils/permissions';
import { ROUTES } from './routes';

export interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
  readonly requiredModule: PermissionModule;
  readonly badge?: string;
}

export interface NavigationGroup {
  readonly label: string;
  readonly icon: string;
  readonly items: readonly NavigationItem[];
}

export const SIDEBAR_NAVIGATION: readonly NavigationGroup[] = [
  {
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    items: [
      { label: 'Overview', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard', requiredModule: 'dashboard' },
    ],
  },
  {
    label: 'Merchants',
    icon: 'Building2',
    items: [
      { label: 'All Merchants', path: ROUTES.TENANTS.LIST, icon: 'Building2', requiredModule: 'merchants' },
      { label: 'Register Enterprise', path: ROUTES.TENANTS.REGISTER_ENTERPRISE, icon: 'BuildingIcon', requiredModule: 'merchants' },
      { label: 'Register Standalone', path: ROUTES.TENANTS.REGISTER_STANDALONE, icon: 'Store', requiredModule: 'merchants' },
    ],
  },
  {
    label: 'Tokens',
    icon: 'Coins',
    items: [
      { label: 'Token Management', path: ROUTES.TOKENS.LIST, icon: 'Coins', requiredModule: 'tokens' },
      { label: 'Generate Tokens', path: ROUTES.TOKENS.GENERATE, icon: 'CirclePlus', requiredModule: 'tokens' },
      { label: 'Batch Generate', path: ROUTES.TOKENS.BATCH_GENERATE, icon: 'Layers', requiredModule: 'tokens' },
      { label: 'Token History', path: ROUTES.TOKENS.HISTORY, icon: 'History', requiredModule: 'tokens' },
      { label: 'Pricing', path: ROUTES.TOKENS.PRICING, icon: 'Tag', requiredModule: 'tokens' },
    ],
  },
  {
    label: 'Billing',
    icon: 'CreditCard',
    items: [
      { label: 'Overview', path: ROUTES.BILLING.OVERVIEW, icon: 'CreditCard', requiredModule: 'billing' },
      { label: 'Invoices', path: ROUTES.BILLING.INVOICES, icon: 'FileText', requiredModule: 'billing' },
      { label: 'Subscriptions', path: ROUTES.BILLING.SUBSCRIPTIONS, icon: 'RefreshCw', requiredModule: 'billing' },
      { label: 'Plans', path: ROUTES.BILLING.PLANS, icon: 'Package', requiredModule: 'billing' },
      { label: 'Payments', path: ROUTES.BILLING.PAYMENTS, icon: 'Banknote', requiredModule: 'billing' },
      { label: 'Refunds', path: ROUTES.BILLING.REFUNDS, icon: 'RotateCcw', requiredModule: 'billing' },
      { label: 'Wallet', path: ROUTES.BILLING.WALLET, icon: 'Wallet', requiredModule: 'billing' },
    ],
  },
  {
    // 2026-05-17 (Pass 35 Phase F): Revenue Collections added; Settlement/Disputes/Ledger removed in Phase A.
    label: 'Commission',
    icon: 'Percent',
    items: [
      { label: 'Overview', path: ROUTES.COMMISSION.OVERVIEW, icon: 'Percent', requiredModule: 'commission' },
      { label: 'Rates', path: ROUTES.COMMISSION.RATES, icon: 'SlidersHorizontal', requiredModule: 'commission' },
      { label: 'Revenue Collections', path: ROUTES.COMMISSION.COLLECTIONS, icon: 'Receipt', requiredModule: 'commission' },
    ],
  },
  {
    label: 'Support',
    icon: 'Headphones',
    items: [
      { label: 'Tickets', path: ROUTES.SUPPORT.TICKETS, icon: 'Ticket', requiredModule: 'support' },
      { label: 'Create Ticket', path: ROUTES.SUPPORT.CREATE_TICKET, icon: 'PlusCircle', requiredModule: 'support' },
      { label: 'Knowledge Base', path: ROUTES.SUPPORT.KNOWLEDGE_BASE, icon: 'BookOpen', requiredModule: 'support' },
      { label: 'Announcements', path: ROUTES.SUPPORT.ANNOUNCEMENTS, icon: 'Megaphone', requiredModule: 'support' },
      // Round_16 Pass 15: surface previously-missing pages.
      { label: 'Leads', path: ROUTES.SUPPORT.LEADS, icon: 'UserPlus', requiredModule: 'support' },
      { label: 'Canned Responses', path: ROUTES.SUPPORT.CANNED_RESPONSES, icon: 'MessageSquare', requiredModule: 'support' },
      { label: 'Routing & Escalation', path: ROUTES.SUPPORT.ROUTING_RULES, icon: 'GitBranch', requiredModule: 'support' },
      { label: 'Auto-Close', path: ROUTES.SUPPORT.AUTO_CLOSE, icon: 'CircleSlash', requiredModule: 'support' },
    ],
  },
  {
    label: 'Content',
    icon: 'PenSquare',
    items: [
      { label: 'Pages', path: ROUTES.CONTENT.PAGES, icon: 'FileText', requiredModule: 'content' },
      { label: 'Banners', path: ROUTES.CONTENT.BANNERS, icon: 'Image', requiredModule: 'content' },
      { label: 'Templates', path: ROUTES.CONTENT.TEMPLATES, icon: 'LayoutTemplate', requiredModule: 'content' },
      { label: 'Media Library', path: ROUTES.CONTENT.MEDIA, icon: 'FolderOpen', requiredModule: 'content' },
    ],
  },
  {
    label: 'Reports',
    icon: 'BarChart3',
    items: [
      { label: 'Overview', path: ROUTES.REPORTS.OVERVIEW, icon: 'BarChart3', requiredModule: 'reports' },
      { label: 'Revenue', path: ROUTES.REPORTS.REVENUE, icon: 'TrendingUp', requiredModule: 'reports' },
      { label: 'Merchant Analytics', path: ROUTES.REPORTS.TENANTS, icon: 'Users', requiredModule: 'reports' },
      { label: 'Token Reports', path: ROUTES.REPORTS.TOKENS, icon: 'Coins', requiredModule: 'reports' },
      { label: 'Usage', path: ROUTES.REPORTS.USAGE, icon: 'Activity', requiredModule: 'reports' },
      { label: 'Custom Reports', path: ROUTES.REPORTS.CUSTOM, icon: 'Settings2', requiredModule: 'reports' },
      { label: 'Scheduled', path: ROUTES.REPORTS.SCHEDULED, icon: 'Clock', requiredModule: 'reports' },
    ],
  },
  {
    // Round_16 Pass 14: surface Users + Sessions in the sidebar (audit H-9: SessionManagementPage
    // page existed but had no entry-point in the nav, so it was undiscoverable).
    label: 'Users',
    icon: 'Users',
    items: [
      { label: 'All Users', path: ROUTES.USERS.LIST, icon: 'Users', requiredModule: 'users' },
      { label: 'Create User', path: ROUTES.USERS.CREATE, icon: 'UserPlus', requiredModule: 'users' },
      { label: 'Sessions', path: ROUTES.USERS.SESSIONS, icon: 'Activity', requiredModule: 'users' },
    ],
  },
  {
    label: 'Settings',
    icon: 'Settings',
    items: [
      { label: 'General', path: ROUTES.SETTINGS.GENERAL, icon: 'Settings', requiredModule: 'settings' },
      { label: 'Platform', path: ROUTES.SETTINGS.PLATFORM, icon: 'Server', requiredModule: 'settings' },
      { label: 'Branding', path: ROUTES.SETTINGS.BRANDING, icon: 'Palette', requiredModule: 'settings' },
      { label: 'Email', path: ROUTES.SETTINGS.EMAIL, icon: 'Mail', requiredModule: 'settings' },
      { label: 'Integrations', path: ROUTES.SETTINGS.INTEGRATIONS, icon: 'Puzzle', requiredModule: 'settings' },
      { label: 'API Keys', path: ROUTES.SETTINGS.API_KEYS, icon: 'Key', requiredModule: 'settings' },
      { label: 'Webhooks', path: ROUTES.SETTINGS.WEBHOOKS, icon: 'Webhook', requiredModule: 'settings' },
    ],
  },
  {
    label: 'Compliance',
    icon: 'ShieldCheck',
    items: [
      { label: 'Overview', path: ROUTES.COMPLIANCE.OVERVIEW, icon: 'ShieldCheck', requiredModule: 'compliance' },
      { label: 'KYC', path: ROUTES.COMPLIANCE.KYC, icon: 'UserCheck', requiredModule: 'compliance' },
      { label: 'GDPR', path: ROUTES.COMPLIANCE.GDPR, icon: 'Lock', requiredModule: 'compliance' },
      { label: 'Tax', path: ROUTES.COMPLIANCE.TAX, icon: 'Receipt', requiredModule: 'compliance' },
      { label: 'Policies', path: ROUTES.COMPLIANCE.POLICIES, icon: 'FileCheck', requiredModule: 'compliance' },
    ],
  },
  {
    label: 'Audit',
    icon: 'ScrollText',
    items: [
      { label: 'Audit Log', path: ROUTES.AUDIT.LOG, icon: 'ScrollText', requiredModule: 'audit' },
      { label: 'Export', path: ROUTES.AUDIT.EXPORT, icon: 'Download', requiredModule: 'audit' },
    ],
  },
] as const;

/**
 * Round_16 Pass 3 audit H-2: filter navigation entries whose path doesn't match a registered
 * route in <c>router.tsx</c>. Previously ~25 dead links pointed to pages that don't exist
 * (`/billing/payments`, `/support/knowledge-base`, `/content/banners`, …) and silently
 * redirected to dashboard via the catch-all. Now they're hidden entirely; broken slugs are
 * remapped to the canonical router path.
 *
 * This is a runtime allow-list maintained in this file; keep it in sync when adding routes.
 */
const REGISTERED_PATHS: ReadonlySet<string> = new Set([
  '/dashboard',
  '/merchants',
  '/merchants/register/enterprise',
  '/merchants/register/standalone',
  '/merchants/signups',
  '/tokens',
  '/tokens/generate',
  '/tokens/bulk',
  '/tokens/validity',
  '/billing',
  '/billing/invoices',
  '/billing/plans',
  '/billing/token-pricing',
  '/billing/wallets',
  '/commission',
  '/commission/rates',
  '/commission/collections',
  '/settings/tax',
  '/support',
  '/support/leads',
  '/support/canned-responses',
  '/support/auto-close',
  '/support/routing-rules',
  '/support/metrics',
  '/content/marketing',
  '/content/blog',
  '/content/help',
  '/content/faq',
  '/reports',
  '/reports/growth',
  '/reports/revenue',
  '/reports/usage',
  '/reports/churn',
  '/reports/commission',
  '/reports/tokens',
  '/reports/custom',
  '/reports/compliance',
  '/settings',
  '/settings/features',
  '/settings/token-config',
  '/settings/commission-config',
  '/settings/grace-period',
  '/settings/email-templates',
  '/settings/integrations',
  '/settings/maintenance',
  '/settings/webhooks',
  '/compliance',
  '/compliance/data-requests',
  '/compliance/consent',
  '/audit',
  '/downloads',
  '/users',
  '/users/create',
  '/users/sessions',
]);

/**
 * Returns the navigation tree with dead entries removed. Empty groups are also pruned so the
 * sidebar doesn't render section headers with no children.
 */
export function getActiveNavigation(): readonly NavigationGroup[] {
  return SIDEBAR_NAVIGATION
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => REGISTERED_PATHS.has(item.path)),
    }))
    .filter((group) => group.items.length > 0);
}
