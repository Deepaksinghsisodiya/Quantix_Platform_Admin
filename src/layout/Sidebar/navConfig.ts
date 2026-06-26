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
  Settings, 
  BarChart3,
  Bell,
  LucideIcon
} from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  permission: string | null;
}

export interface NavGroup {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'dashboard' },
      { label: 'Downloads', icon: Download, path: '/downloads', permission: 'downloads' },
      { label: 'Notifications', icon: Bell, path: '/notifications', permission: null },
    ]
  },
  {
    label: 'MERCHANTS',
    items: [
      { label: 'All Merchants', icon: Building2, path: '/merchants', permission: 'merchants' },
      { label: 'Register Enterprise', icon: Building2, path: '/merchants/register/enterprise', permission: 'merchants' },
      { label: 'Register Standalone', icon: Building2, path: '/merchants/register/standalone', permission: 'merchants' },
      { label: 'Signup Queue', icon: Building2, path: '/merchants/signups', permission: 'merchants' },
      { label: 'Deboarding Queue', icon: Building2, path: '/merchants/deboardings', permission: 'merchants' },
    ]
  },
  {
    label: 'TOKENS',
    items: [
      { label: 'Token Management', icon: Coins, path: '/tokens', permission: 'tokens' },
      { label: 'Generate Tokens', icon: Coins, path: '/tokens/generate', permission: 'tokens' },
      { label: 'Batch Generate', icon: Coins, path: '/tokens/bulk', permission: 'tokens' },
      { label: 'Token Validity', icon: Coins, path: '/tokens/validity', permission: 'tokens' },
    ]
  },
  {
    label: 'BILLING & COMMISSION',
    items: [
      { label: 'Billing Overview', icon: CreditCard, path: '/billing', permission: 'billing' },
      { label: 'Invoices', icon: CreditCard, path: '/billing/invoices', permission: 'billing' },
      { label: 'Plans', icon: CreditCard, path: '/billing/plans', permission: 'billing' },
      { label: 'Token Pricing', icon: CreditCard, path: '/billing/token-pricing', permission: 'billing' },
      { label: 'Wallets', icon: CreditCard, path: '/billing/wallets', permission: 'billing' },
      { label: 'Commission Overview', icon: Percent, path: '/commission', permission: 'commission' },
      { label: 'Revenue Collections', icon: Percent, path: '/commission/collections', permission: 'commission' },
      { label: 'Tax Settings', icon: Settings, path: '/settings/tax', permission: 'settings' },
    ]
  },
  {
    label: 'SUPPORT & CONTENT',
    items: [
      { label: 'Support Queue', icon: Headphones, path: '/support', permission: 'support' },
      { label: 'Leads', icon: Headphones, path: '/support/leads', permission: 'support' },
      { label: 'Canned Responses', icon: Headphones, path: '/support/canned-responses', permission: 'support' },
      { label: 'Auto-Close Config', icon: Headphones, path: '/support/auto-close', permission: 'support' },
      { label: 'Routing Rules', icon: Headphones, path: '/support/routing-rules', permission: 'support' },
      { label: 'Marketing Content', icon: PenSquare, path: '/content/marketing', permission: 'content' },
      { label: 'Blog Posts', icon: PenSquare, path: '/content/blog', permission: 'content' },
      { label: 'Help Articles', icon: PenSquare, path: '/content/help', permission: 'content' },
      { label: 'FAQ', icon: PenSquare, path: '/content/faq', permission: 'content' },
    ]
  },
  {
    label: 'COMPLIANCE & AUDIT',
    items: [
      { label: 'Compliance Overview', icon: ShieldCheck, path: '/compliance', permission: 'compliance' },
      { label: 'Data Requests', icon: ShieldCheck, path: '/compliance/data-requests', permission: 'compliance' },
      { label: 'Consent Management', icon: ShieldCheck, path: '/compliance/consent', permission: 'compliance' },
      { label: 'Audit Trail', icon: ScrollText, path: '/audit', permission: 'audit' },
    ]
  },
  {
    label: 'USER MANAGEMENT',
    adminOnly: true,
    items: [
      { label: 'All Users', icon: Users, path: '/users', permission: 'users' },
      { label: 'Create User', icon: Users, path: '/users/create', permission: 'users' },
      { label: 'User Sessions', icon: Users, path: '/users/sessions', permission: 'users' },
    ]
  },
  {
    label: 'REPORTS',
    adminOnly: true,
    items: [
      { label: 'Reports Hub', icon: BarChart3, path: '/reports', permission: 'reports' },
      { label: 'Growth Reports', icon: BarChart3, path: '/reports/growth', permission: 'reports' },
      { label: 'Revenue Reports', icon: BarChart3, path: '/reports/revenue', permission: 'reports' },
      { label: 'Usage Reports', icon: BarChart3, path: '/reports/usage', permission: 'reports' },
      { label: 'Churn Reports', icon: BarChart3, path: '/reports/churn', permission: 'reports' },
      { label: 'Commission Reports', icon: BarChart3, path: '/reports/commission', permission: 'reports' },
      { label: 'Token Reports', icon: BarChart3, path: '/reports/tokens', permission: 'reports' },
      { label: 'Custom Reports', icon: BarChart3, path: '/reports/custom', permission: 'reports' },
      { label: 'Compliance Reports', icon: BarChart3, path: '/reports/compliance', permission: 'reports' },
    ]
  },
  {
    label: 'SYSTEM SETUP',
    adminOnly: true,
    items: [
      { label: 'Global Settings', icon: Settings, path: '/settings', permission: 'settings' },
      { label: 'Feature Toggles', icon: Settings, path: '/settings/features', permission: 'settings' },
      { label: 'Token Config', icon: Settings, path: '/settings/token-config', permission: 'settings' },
      { label: 'Commission Config', icon: Settings, path: '/settings/commission-config', permission: 'settings' },
      { label: 'Grace Period', icon: Settings, path: '/settings/grace-period', permission: 'settings' },
      { label: 'Email Templates', icon: Settings, path: '/settings/email-templates', permission: 'settings' },
      { label: 'Integrations', icon: Settings, path: '/settings/integrations', permission: 'settings' },
      { label: 'Maintenance Mode', icon: Settings, path: '/settings/maintenance', permission: 'settings' },
      { label: 'Webhooks Config', icon: Settings, path: '/settings/webhooks', permission: 'settings' },
    ]
  }
];
