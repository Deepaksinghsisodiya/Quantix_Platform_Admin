/** Centralised route path constants for the Platform Admin Portal. */
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Dashboard
  DASHBOARD: '/',

  // Merchants
  TENANTS: {
    LIST: '/merchants',
    DETAIL: (id: string) => `/merchants/${id}`,
    REGISTER_ENTERPRISE: '/merchants/register/enterprise',
    REGISTER_STANDALONE: '/merchants/register/standalone',
    EDIT: (id: string) => `/merchants/${id}/edit`,
    ONBOARDING: (id: string) => `/merchants/${id}/onboarding`,
    LOCATIONS: (id: string) => `/merchants/${id}/locations`,
    TERMINALS: (id: string) => `/merchants/${id}/terminals`,
    BILLING: (id: string) => `/merchants/${id}/billing`,
    NOTES: (id: string) => `/merchants/${id}/notes`,
    ACTIVITY: (id: string) => `/merchants/${id}/activity`,
    GRACE_STATUS: (id: string) => `/merchants/${id}/grace-status`,
  },

  // Tokens
  TOKENS: {
    LIST: '/tokens',
    GENERATE: '/tokens/generate',
    BATCH_GENERATE: '/tokens/bulk',
    VALIDITY: '/tokens/validity',
    DETAIL: (id: string) => `/tokens/${id}`,
  },

  // Billing
  BILLING: {
    OVERVIEW: '/billing',
    INVOICES: '/billing/invoices',
    INVOICE_DETAIL: (id: string) => `/billing/invoices/${id}`,
    SUBSCRIPTIONS: '/billing/subscriptions',
    PLANS: '/billing/plans',
    PLAN_DETAIL: (id: string) => `/billing/plans/${id}`,
    PAYMENTS: '/billing/payments',
    REFUNDS: '/billing/refunds',
    WALLET: '/billing/wallet',
  },

  // Commission (2026-05-17 Pass 35 Phase F: REVENUE_COLLECTIONS added.)
  COMMISSION: {
    OVERVIEW: '/commission',
    RATES: '/commission/rates',
    COLLECTIONS: '/commission/collections',
  },

  // Support
  SUPPORT: {
    TICKETS: '/support/tickets',
    TICKET_DETAIL: (id: string) => `/support/tickets/${id}`,
    CREATE_TICKET: '/support/tickets/create',
    KNOWLEDGE_BASE: '/support/knowledge-base',
    ANNOUNCEMENTS: '/support/announcements',
    // Round_16 Pass 15: missing pages (audit H-1 PlatformAdmin coverage gap).
    LEADS: '/support/leads',
    LEAD_DETAIL: (id: string) => `/support/leads/${id}`,
    CANNED_RESPONSES: '/support/canned-responses',
    AUTO_CLOSE: '/support/auto-close',
    ROUTING_RULES: '/support/routing-rules',
  },

  // Content
  CONTENT: {
    PAGES: '/content/pages',
    PAGE_DETAIL: (id: string) => `/content/pages/${id}`,
    BANNERS: '/content/banners',
    TEMPLATES: '/content/templates',
    MEDIA: '/content/media',
  },

  // Reports
  REPORTS: {
    OVERVIEW: '/reports',
    REVENUE: '/reports/revenue',
    TENANTS: '/reports/merchants',
    TOKENS: '/reports/tokens',
    USAGE: '/reports/usage',
    CUSTOM: '/reports/custom',
    COMPLIANCE: '/reports/compliance',
    SCHEDULED: '/reports/scheduled',
  },

  // Settings
  SETTINGS: {
    GENERAL: '/settings',
    PLATFORM: '/settings/platform',
    BRANDING: '/settings/branding',
    EMAIL: '/settings/email',
    INTEGRATIONS: '/settings/integrations',
    API_KEYS: '/settings/api-keys',
    WEBHOOKS: '/settings/webhooks',
  },

  // Compliance
  COMPLIANCE: {
    OVERVIEW: '/compliance',
    KYC: '/compliance/kyc',
    GDPR: '/compliance/gdpr',
    TAX: '/compliance/tax',
    POLICIES: '/compliance/policies',
    DATA_REQUESTS: '/compliance/data-requests',
    CONSENT: '/compliance/consent',
  },

  // Audit
  AUDIT: {
    LOG: '/audit',
    DETAIL: (id: string) => `/audit/${id}`,
    EXPORT: '/audit/export',
  },

  // Users (platform admin users)
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users/create',
    ROLES: '/users/roles',
    SESSIONS: '/users/sessions',
  },

  // Downloads
  DOWNLOADS: {
    LIST: '/downloads',
    POS_BUILDS: '/downloads/pos-builds',
    SDK: '/downloads/sdk',
  },

  // Profile
  PROFILE: '/profile',
  PROFILE_SECURITY: '/profile/security',
} as const;
