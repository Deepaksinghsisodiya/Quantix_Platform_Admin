import {
  LayoutDashboard,
  Building2,
  Coins,
  CreditCard,
  Percent,
  Headphones,
  PenSquare,
  ShieldCheck,
  Download,
  Users,
  ScrollText,
  Wrench,
  Settings,
  BarChart3,
  Bell,
  Sparkles,
  Quote,
  Megaphone,
  Handshake,
  Layers,
  LucideIcon
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  permission: string | null;
  /** Optional nested sub-items (renders as an expandable accordion under the parent). */
  children?: NavItem[];
  /**
   * 2026-09-04: optional finer gate — the entry shows only if the user holds ANY of these
   * server permission codes (Admin always). Lets one module ('support') carry entries for
   * both the helpdesk operator (tickets.*) and the content/CRM desk (crm.*).
   */
  codes?: readonly string[];
  // 2026-09-04: `adminOnly` REMOVED — it hid Reports and Maintenance from every non-Admin
  // regardless of permission, and carried a stray `hr` role check from a template.
}

/**
 * 2026-08-05: reordered per user directive.
 *   Landing / inbox   → Dashboard, Notifications
 *   Daily business    → Merchants, Tokens, Billing & Commission, Reports
 *   Reactive/audit    → Support, Content, Compliance & Audit
 *   Rare/admin        → Downloads, User Management, System Setup
 */
export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'dashboard' },
  { label: 'Notifications', icon: Bell, path: '/notifications', permission: null },
  {
    label: 'Merchants',
    icon: Building2,
    path: '/merchants',
    permission: 'merchants',
    // 2026-08-12: lifecycle order (user directive) - signups arrive before merchants exist.
    children: [
      // 2026-09-08: the Signup Queue page reads the onboarding wizard, which the Finance
      // Manager - merchants.view only - cannot reach (403 on open). It shows for roles holding
      // the onboarding codes. All Merchants and the Deboarding Queue are reads any merchants.view
      // holder can open.
      { label: 'Signup Queue', icon: Building2, path: '/merchants/signups', permission: 'merchants', codes: ['onboarding.view', 'onboarding.manage'] },
      { label: 'All Merchants', icon: Building2, path: '/merchants', permission: 'merchants' },
      { label: 'Deboarding Queue', icon: Building2, path: '/merchants/deboardings', permission: 'merchants' },
    ]
  },
  {
    label: 'Tokens',
    icon: Coins,
    path: '/tokens',
    permission: 'tokens',
    children: [
      // 2026-08-29: the list page existed at /tokens but had no sidebar entry.
      { label: 'Token History', icon: Coins, path: '/tokens', permission: 'tokens' },
      // 2026-08-30: 'Generate Tokens' dropped from the sidebar (user directive — same
      // precedent as Create User): it only duplicated the Generate Token button on
      // Token History. The /tokens/generate route stays for that button + renew links.
      { label: 'Batch Generate', icon: Coins, path: '/tokens/bulk', permission: 'tokens' },
    ]
  },
  {
    label: 'Billing & Commission',
    icon: CreditCard,
    path: '/billing',
    permission: 'billing',
    children: [
      { label: 'Billing Overview', icon: CreditCard, path: '/billing', permission: 'billing' },
      { label: 'Invoices', icon: CreditCard, path: '/billing/invoices', permission: 'billing' },
      { label: 'Wallets', icon: CreditCard, path: '/billing/wallets', permission: 'billing' },
      { label: 'Commission Overview', icon: Percent, path: '/commission', permission: 'commission' },
      { label: 'Revenue Collections', icon: Percent, path: '/commission/collections', permission: 'commission' },
    ]
  },
  {
    label: 'Reports',
    icon: BarChart3,
    path: '/reports',
    permission: 'reports',
    children: [
      { label: 'Reports Hub', icon: BarChart3, path: '/reports', permission: 'reports' },
      { label: 'Growth Reports', icon: BarChart3, path: '/reports/growth', permission: 'reports' },
      { label: 'Revenue Reports', icon: BarChart3, path: '/reports/revenue', permission: 'reports' },
      { label: 'Usage Reports', icon: BarChart3, path: '/reports/usage', permission: 'reports' },
      { label: 'Churn Reports', icon: BarChart3, path: '/reports/churn', permission: 'reports' },
      { label: 'Commission Reports', icon: BarChart3, path: '/reports/commission', permission: 'reports' },
      { label: 'Token Reports', icon: BarChart3, path: '/reports/tokens', permission: 'reports' },
      // 2026-09-04 (decision D): 'Custom Reports' removed — no query engine behind it.
      // 2026-09-08: the route is guarded by the compliance module (the Finance Manager holds
      // reports but not compliance, and landed on Access Denied); the entry gates the same way.
      { label: 'Compliance Reports', icon: BarChart3, path: '/reports/compliance', permission: 'compliance' },
    ]
  },
  {
    // 2026-09-08 (user directive): Support and Content are SEPARATE sections. They used to share
    // one "Support & Content" group, so an operator's ticket queue sat between blog posts and
    // galleries. Support is the helpdesk; Content is the website (plus the CRM leads that
    // arrive from it, which is the Content Manager's scope).
    //
    // The group itself gates nothing (permission: null); every child carries its own gate,
    // which is what decides visibility. The sidebar filter checks a parent before its
    // children, so a gated parent would hide pages a role does hold.
    label: 'Support',
    icon: Headphones,
    path: '/support',
    permission: null,
    children: [
      { label: 'Support Queue', icon: Headphones, path: '/support', permission: 'support', codes: ['tickets.view'] },
      // 2026-09-08: the page existed at /support/metrics with no way to reach it.
      { label: 'Ticket Metrics', icon: Headphones, path: '/support/metrics', permission: 'support', codes: ['tickets.view'] },
      { label: 'Canned Responses', icon: Headphones, path: '/support/canned-responses', permission: 'support', codes: ['tickets.view', 'crm.canned.manage'] },
      // 2026-09-04: labels are the pages' titles verbatim ("Auto-Close Config" ≠ "Auto-Close");
      // Routing Rules (a 501 display) replaced by the real SLA policy editor. Both are
      // platform configuration — settings.update, which the helpdesk operator does not hold.
      { label: 'Auto-Close', icon: Headphones, path: '/support/auto-close', permission: 'support', codes: ['settings.update'] },
      { label: 'Escalation Rules', icon: Headphones, path: '/support/escalation-rules', permission: 'support', codes: ['settings.update'] },
    ]
  },
  {
    label: 'Content',
    icon: PenSquare,
    path: '/content',
    permission: null,
    children: [
      { label: 'Blog Posts', icon: PenSquare, path: '/content/blog', permission: 'content', codes: ['blog.manage'] },
      { label: 'Help Articles', icon: PenSquare, path: '/content/help', permission: 'content', codes: ['helpcentre.manage'] },
      { label: 'FAQ', icon: PenSquare, path: '/content/faq', permission: 'content', codes: ['faq.manage'] },
      // 2026-09-08 (content Phase 4): the skeletons blog posts and help articles start from.
      { label: 'Article Templates', icon: PenSquare, path: '/content/templates', permission: 'content', codes: ['blog.manage', 'helpcentre.manage'] },
      { label: 'Hero Banners', icon: Sparkles, path: '/content/hero-banners', permission: 'content', codes: ['cms.view', 'cms.update'] },
      { label: 'Social Proof Metrics', icon: BarChart3, path: '/content/social-proof', permission: 'content', codes: ['cms.view', 'cms.update'] },
      { label: 'Marketing Content', icon: PenSquare, path: '/content/marketing', permission: 'content', codes: ['cms.view', 'cms.update'] },
      { label: 'Testimonials', icon: Quote, path: '/content/testimonials', permission: 'content', codes: ['cms.view', 'cms.update'] },
      { label: 'Announcements', icon: Megaphone, path: '/content/announcements', permission: 'content', codes: ['cms.view', 'cms.update'] },
      { label: 'Clientele', icon: Handshake, path: '/content/clientele', permission: 'content', codes: ['cms.view', 'cms.update'] },
      { label: 'Galleries', icon: PenSquare, path: '/content/galleries', permission: 'content', codes: ['cms.view', 'cms.update'] },
      // 2026-09-05 (content Phase 1): Media Library, gated on the cms codes rather than the
      // coarse module flag alone.
      { label: 'Media Library', icon: PenSquare, path: '/content/media', permission: 'content', codes: ['cms.view', 'cms.create'] },
      // 2026-09-08: leads moved here from Support. They come from the website's contact and
      // demo forms and belong to the CRM half of the Content Manager's job; the Operator, who
      // works tickets, never held crm.leads.view.
      { label: 'Leads', icon: PenSquare, path: '/content/leads', permission: 'content', codes: ['crm.leads.view'] },
    ]
  },
  {
    label: 'Compliance & Audit',
    icon: ShieldCheck,
    path: '/compliance',
    // 2026-09-08: was gated on `compliance`, and the filter checks a parent before its
    // children, so the Finance and Content Managers - who hold logs.view and can open the
    // Audit Trail - never saw the group at all. Each child gates itself.
    permission: null,
    children: [
      { label: 'Compliance Overview', icon: ShieldCheck, path: '/compliance', permission: 'compliance' },
      { label: 'Data Requests', icon: ShieldCheck, path: '/compliance/data-requests', permission: 'compliance' },
      { label: 'Consent Management', icon: ShieldCheck, path: '/compliance/consent', permission: 'compliance' },
      { label: 'Audit Trail', icon: ScrollText, path: '/audit', permission: 'audit' },
    ]
  },
  { label: 'Downloads', icon: Download, path: '/downloads', permission: 'downloads' },
  {
    label: 'User Management',
    icon: Users,
    path: '/users',
    permission: 'users',
    children: [
      { label: 'All Users', icon: Users, path: '/users', permission: 'users' },
      // 2026-08-11: 'Create User' dropped from the sidebar — it only duplicated the Create
      // button on All Users. The /users/create route stays for those buttons.
      { label: 'User Sessions', icon: Users, path: '/users/sessions', permission: 'users' },
    ]
  },
  // 2026-08-10: Maintenance moved OUT of System Setup — it is an operational action
  // (announce downtime + traffic switch), not configuration.
  { label: 'Maintenance', icon: Wrench, path: '/maintenance', permission: 'settings' },
  {
    label: 'System Setup',
    icon: Settings,
    path: '/settings',
    permission: 'settings',
    // 2026-08-07: ordered logically — foundation → pricing (rate cards feed plans) →
    // commercial policies → communication → technical → danger switch last.
    children: [
      { label: 'Global Settings', icon: Settings, path: '/settings', permission: 'settings' },
      { label: 'Rate Cards', icon: Settings, path: '/billing/rate-cards', permission: 'billing' },
      { label: 'Plans', icon: Settings, path: '/billing/plans', permission: 'billing' },
      { label: 'Tax Settings', icon: Settings, path: '/settings/tax', permission: 'settings' },
      // 2026-08-08: Token Config removed — token format is locked, tokens derive from plans.
      { label: 'Grace Period', icon: Settings, path: '/settings/grace-period', permission: 'settings' },
      { label: 'Billing Cycle', icon: Settings, path: '/settings/billing-cycle', permission: 'settings' },
      // 2026-08-29 (Pass 44): master enable/disable per PaymentMethodType — feeds every
      // payment-taking surface (token purchase wizard Step 2).
      { label: 'Payment Methods', icon: Settings, path: '/settings/payment-methods', permission: 'settings' },
      { label: 'Exchange Rate', icon: Settings, path: '/settings/exchange-rate', permission: 'settings' },
      { label: 'Email Templates', icon: Settings, path: '/settings/email-templates', permission: 'settings' },
      { label: 'SMS Templates', icon: Settings, path: '/settings/sms-templates', permission: 'settings' },
      // 2026-08-10: Integrations split into three screens, each with a master toggle.
      { label: 'Email Integration', icon: Settings, path: '/settings/email-integration', permission: 'settings' },
      { label: 'SMS Integration', icon: Settings, path: '/settings/sms-integration', permission: 'settings' },
      { label: 'Payment Integration', icon: Settings, path: '/settings/payment-integration', permission: 'settings' },
    ]
  }
];
