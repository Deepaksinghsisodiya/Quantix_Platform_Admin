import type { DbEngine } from '../types/merchant.types';

// ── Shared Constants ──────────────────────────────────────────

export type TokenTier = 'Basic' | 'Standard' | 'Advance' | 'Premium';

export const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
  { label: 'India', value: 'IN' },
  { label: 'UAE', value: 'AE' },
  { label: 'Saudi Arabia', value: 'SA' },
  { label: 'Singapore', value: 'SG' },
] as const;

// ── Enterprise Constants ──────────────────────────────────────

export const ENTERPRISE_STEPS = [
  'Merchant Type',
  'Business Type',
  'Business Details',
  'Plan Selection',
  'Configuration',
  'Review & Confirm',
  'Database Provisioning',
  'Activation',
] as const;

export interface PlanDef {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

export const PLANS: PlanDef[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: '/mo',
    features: ['1 Location', '2 Terminals', 'Basic Reports', 'Email Support'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 129,
    period: '/mo',
    features: ['3 Locations', '10 Terminals', 'Advanced Reports', 'Priority Support', 'API Access'],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 299,
    period: '/mo',
    features: ['10 Locations', '50 Terminals', 'Custom Reports', 'Dedicated Support', 'Full API', 'Webhooks'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    period: 'Custom',
    features: ['Unlimited Locations', 'Unlimited Terminals', 'White Label', '24/7 Support', 'SLA', 'Custom Integrations'],
  },
];

export const BILLING_FREQUENCY_OPTIONS = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly (save 5%)', value: 'Quarterly' },
  { label: 'Annual (save 15%)', value: 'Annual' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Credit Card', value: 'CreditCard' },
  { label: 'Bank Transfer', value: 'BankTransfer' },
  { label: 'Invoice', value: 'Invoice' },
] as const;

export const DB_ENGINES: { value: DbEngine; label: string; description: string }[] = [
  { value: 'SQLite', label: 'SQLite', description: 'Lightweight, file-based. Great for single-location setups.' },
  { value: 'PostgreSQL', label: 'PostgreSQL', description: 'Enterprise-grade. Best for multi-location deployments.' },
  { value: 'MySQL', label: 'MySQL', description: 'Widely supported. Good for general-purpose workloads.' },
  { value: 'SQLServer', label: 'SQL Server', description: 'Microsoft ecosystem. Ideal for Windows-centric environments.' },
];

export const FEATURE_FLAG_LABELS: Record<string, string> = {
  multiLocation: 'Multi-Location Support',
  apiAccess: 'API Access',
  webhooks: 'Webhook Notifications',
  whiteLabel: 'White Label Branding',
  customDomain: 'Custom Domain',
};

export const LIMIT_LABELS: Record<string, string> = {
  maxLocations: 'Max Locations',
  maxTerminals: 'Max Terminals',
  maxProducts: 'Max Products',
  maxUsers: 'Max Users',
  apiRateLimit: 'API Rate Limit (req/min)',
};

// ── Standalone Constants ──────────────────────────────────────

export const STANDALONE_STEPS = [
  'Merchant Type',
  'Business Type',
  'Business Details',
  'Token Configuration',
  'Review & Generate',
  'Activation',
] as const;

export interface TierDef {
  tier: TokenTier;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  features: string[];
}

export const TIERS: TierDef[] = [
  {
    tier: 'Basic',
    label: 'Basic',
    description: 'Essential POS features for small businesses.',
    color: 'text-surface-700 dark:text-surface-300',
    bgColor: 'bg-surface-100 dark:bg-surface-850',
    features: ['Single terminal', 'Basic reports', 'Cash payments'],
  },
  {
    tier: 'Standard',
    label: 'Standard',
    description: 'Full POS with card payments and inventory.',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    features: ['Up to 3 terminals', 'Card payments', 'Inventory management', 'Customer records'],
  },
  {
    tier: 'Advance',
    label: 'Advance',
    description: 'Multi-location support with advanced analytics.',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    features: ['Up to 10 terminals', 'Multi-location', 'Advanced analytics', 'Loyalty program', 'API access'],
  },
  {
    tier: 'Premium',
    label: 'Premium',
    description: 'Everything included. White-label capable.',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    features: ['Unlimited terminals', 'White-label', 'Custom integrations', 'Priority support', 'All features'],
  },
];

export const VALIDITY_OPTIONS = [30, 60, 90, 180, 365] as const;

export const DEFAULT_TOKEN_LIMITS: Record<TokenTier, { maxTerminals: number; maxProducts: number; maxUsers: number }> = {
  Basic: { maxTerminals: 1, maxProducts: 500, maxUsers: 5 },
  Standard: { maxTerminals: 3, maxProducts: 2000, maxUsers: 15 },
  Advance: { maxTerminals: 10, maxProducts: 10000, maxUsers: 50 },
  Premium: { maxTerminals: 999, maxProducts: 99999, maxUsers: 999 },
};

export const TOKEN_PRICING: Record<TokenTier, Record<number, number>> = {
  Basic: { 30: 19, 60: 35, 90: 49, 180: 89, 365: 159 },
  Standard: { 30: 39, 60: 69, 90: 99, 180: 179, 365: 319 },
  Advance: { 30: 79, 60: 139, 90: 199, 180: 359, 365: 649 },
  Premium: { 30: 149, 60: 269, 90: 379, 180: 689, 365: 1199 },
};
