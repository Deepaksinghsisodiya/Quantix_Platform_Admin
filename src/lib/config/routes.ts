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

  // Support — 2026-09-08: the helpdesk only. Leads moved to CONTENT; the dead entries
  // (/support/tickets, knowledge-base, announcements) named routes that never existed.
  SUPPORT: {
    QUEUE: '/support',
    TICKET_DETAIL: (id: string) => `/support/${id}`,
    METRICS: '/support/metrics',
    CANNED_RESPONSES: '/support/canned-responses',
    AUTO_CLOSE: '/support/auto-close',
    ESCALATION_RULES: '/support/escalation-rules',
  },

  // Content — the website, plus the CRM leads that arrive from it.
  CONTENT: {
    BLOG: '/content/blog',
    HELP: '/content/help',
    FAQ: '/content/faq',
    TEMPLATES: '/content/templates',
    MARKETING: '/content/marketing',
    TESTIMONIALS: '/content/testimonials',
    ANNOUNCEMENTS: '/content/announcements',
    CLIENTELE: '/content/clientele',
    GALLERIES: '/content/galleries',
    MEDIA: '/content/media',
    LEADS: '/content/leads',
    LEAD_DETAIL: (id: string) => `/content/leads/${id}`,
  },

  // Merchant self-service portal.
  MERCHANT: {
    DASHBOARD: '/merchant/dashboard',
    SUPPORT: '/merchant/support',
    TICKET_DETAIL: (id: string) => `/merchant/support/${id}`,
  },

  // Reports
  REPORTS: {
    OVERVIEW: '/reports',
    REVENUE: '/reports/revenue',
    TENANTS: '/reports/merchants',
    TOKENS: '/reports/tokens',
    USAGE: '/reports/usage',
    // 2026-09-04 (decision D): CUSTOM ('/reports/custom') removed with the page.
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
