/**
 * MSW (Mock Service Worker) handlers for the Platform Admin API.
 *
 * These intercept fetch requests during development / testing and return
 * deterministic mock data from mockData.ts.
 */

import { http, HttpResponse } from 'msw';
import {
  merchants,
  platformUsers,
  invoices,
  tokens,
  // commissionEntries removed in Pass 35
  tickets,
  dashboardMetrics,
  systemHealth,
} from './mockData';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Mirror the runtime-config precedence used by the real API client so MSW
// intercepts match the same URLs the app fetches against. See public/config.js
// for the runtime override shape.
const BASE: string =
  (typeof window !== 'undefined' && window.__QUANTIX_CONFIG__?.apiBaseUrl) ||
  import.meta.env.VITE_API_URL ||
  '';

function url(path: string): string {
  return `${BASE}${path}`;
}

const now = () => new Date().toISOString();

function ok<T>(data: T) {
  return HttpResponse.json({ success: true, data, timestamp: now() });
}

function paginated<T>(items: readonly T[], request: Request) {
  const u = new URL(request.url);
  const page = Number(u.searchParams.get('page') ?? '1');
  const pageSize = Number(u.searchParams.get('pageSize') ?? '20');
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  return HttpResponse.json({
    success: true,
    data: slice,
    pagination: {
      page,
      pageSize,
      total: items.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    timestamp: now(),
  });
}

function notFound(entity: string, id: string) {
  return HttpResponse.json(
    { success: false, errorCode: 'NOT_FOUND', error: `${entity} ${id} not found`, timestamp: now() },
    { status: 404 },
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const dashboardHandlers = [
  http.get(url('/api/v1/dashboard'), () => ok(dashboardMetrics)),
  http.get(url('/api/v1/dashboard/widgets'), () => ok([])),
  http.get(url('/api/v1/dashboard/system-health'), () => ok(systemHealth)),
  http.get(url('/api/v1/dashboard/usage-metrics'), () => ok({ totalActiveUsers: 0, enterpriseActiveUsers: 0, standaloneActiveUsers: 0, transactionsToday: 0, transactionsThisWeek: 0, apiCallVolume: 0, peakHour: '14:00', averageSessionMinutes: 0, geographicDistribution: [] })),
];

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const userHandlers = [
  http.get(url('/api/v1/users'), ({ request }) => paginated(platformUsers, request)),
  http.get(url('/api/v1/users/roles'), () =>
    // 2026-05-06: PlatformSuperAdmin tier dropped — PlatformAdmin is the top tier with full access.
    ok([
      { id: '1', name: 'PlatformAdmin', description: 'Full access', permissions: ['*'] },
      { id: '2', name: 'SupportAgent', description: 'Support access', permissions: ['tickets', 'merchants:read'] },
    ]),
  ),
  http.get(url('/api/v1/users/:id'), ({ params }) => {
    const u = platformUsers.find((u) => u.id === params['id']);
    return u ? ok(u) : notFound('User', String(params['id']));
  }),
  http.post(url('/api/v1/users'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return ok({ id: crypto.randomUUID(), ...body, status: 'Active', createdAt: now(), updatedAt: now() });
  }),
  http.put(url('/api/v1/users/:id'), async ({ params, request }) => {
    const u = platformUsers.find((u) => u.id === params['id']);
    if (!u) return notFound('User', String(params['id']));
    const body = (await request.json()) as Record<string, unknown>;
    return ok({ ...u, ...body, updatedAt: now() });
  }),
  http.delete(url('/api/v1/users/:id'), () => ok({ deleted: true })),
  http.get(url('/api/v1/users/:id/activity'), () => ok([])),
];

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const registrationHandlers = [
  http.post(url('/api/v1/registration/enterprise'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return ok({ ...merchants[0], id: crypto.randomUUID(), ...body });
  }),
  http.post(url('/api/v1/registration/standalone'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return ok({ ...merchants[4], id: crypto.randomUUID(), ...body });
  }),
  http.get(url('/api/v1/registration/queue'), ({ request }) =>
    paginated(
      [{ id: merchants[7]!.id, businessName: 'Pixel Phone Shop', email: 'rami@pixelphones.com', merchantType: 'Standalone', status: 'Pending', step: 'verification', error: null, submittedAt: merchants[7]!.signupDate, completedAt: null }],
      request,
    ),
  ),
  http.post(url('/api/v1/registration/:id/resend-verification'), () => ok({ sent: true })),
  http.post(url('/api/v1/registration/:id/retry'), ({ params }) => ok({ id: params['id'], status: 'Provisioning' })),
];

// ---------------------------------------------------------------------------
// Wallets
// ---------------------------------------------------------------------------

const walletHandlers = [
  http.get(url('/api/v1/wallets'), ({ request }) => {
    const wallets = merchants
      .filter((t) => t.merchantType === 'Standalone')
      .map((t) => ({ merchantId: t.id, merchantName: t.businessName, balance: t.tokenBalance ?? 0, currency: 'SAR', lastTopUp: t.signupDate, lastDeduction: t.lastActivityDate, updatedAt: now() }));
    return paginated(wallets, request);
  }),
  http.get(url('/api/v1/wallets/top-up-requests'), () => ok([])),
  http.get(url('/api/v1/wallets/:merchantId'), ({ params }) => {
    const t = merchants.find((t) => t.id === params['merchantId']);
    return ok({ merchantId: params['merchantId'], merchantName: t?.businessName ?? '', balance: t?.tokenBalance ?? 0, currency: 'SAR', lastTopUp: t?.signupDate, lastDeduction: t?.lastActivityDate, updatedAt: now() });
  }),
  http.post(url('/api/v1/wallets/:merchantId/adjust'), ({ params }) => {
    const t = merchants.find((t) => t.id === params['merchantId']);
    return ok({ merchantId: params['merchantId'], merchantName: t?.businessName ?? '', balance: t?.tokenBalance ?? 0, currency: 'SAR', lastTopUp: t?.signupDate, lastDeduction: t?.lastActivityDate, updatedAt: now() });
  }),
  http.post(url('/api/v1/wallets/top-up-requests/:id/approve'), ({ params }) => ok({ id: params['id'], status: 'Approved' })),
  http.post(url('/api/v1/wallets/top-up-requests/:id/deny'), ({ params }) => ok({ id: params['id'], status: 'Denied' })),
];

// ---------------------------------------------------------------------------
// Merchants
// ---------------------------------------------------------------------------

const merchantHandlers = [
  http.get(url('/api/v1/merchants'), ({ request }) => paginated(merchants, request)),
  http.get(url('/api/v1/merchants/:id'), ({ params }) => {
    const t = merchants.find((t) => t.id === params['id']);
    return t ? ok(t) : notFound('Merchant', String(params['id']));
  }),
  http.put(url('/api/v1/merchants/:id'), async ({ params, request }) => {
    const t = merchants.find((t) => t.id === params['id']);
    if (!t) return notFound('Merchant', String(params['id']));
    const body = (await request.json()) as Record<string, unknown>;
    return ok({ ...t, ...body });
  }),
  http.post(url('/api/v1/merchants/:id/activate'), ({ params }) => {
    const t = merchants.find((t) => t.id === params['id']);
    return t ? ok({ ...t, status: 'Active' }) : notFound('Merchant', String(params['id']));
  }),
  http.post(url('/api/v1/merchants/:id/suspend'), ({ params }) => {
    const t = merchants.find((t) => t.id === params['id']);
    return t ? ok({ ...t, status: 'Suspended' }) : notFound('Merchant', String(params['id']));
  }),
  http.post(url('/api/v1/merchants/:id/reactivate'), ({ params }) => {
    const t = merchants.find((t) => t.id === params['id']);
    return t ? ok({ ...t, status: 'Active' }) : notFound('Merchant', String(params['id']));
  }),
  http.post(url('/api/v1/merchants/:id/cancel'), ({ params }) => {
    const t = merchants.find((t) => t.id === params['id']);
    return t ? ok({ ...t, status: 'Cancelled' }) : notFound('Merchant', String(params['id']));
  }),
  http.post(url('/api/v1/merchants/:id/export'), () => ok({ downloadUrl: 'https://quantix.io/exports/mock.zip' })),
  http.get(url('/api/v1/merchants/:id/notes'), () => ok([])),
  http.post(url('/api/v1/merchants/:id/notes'), async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return ok({ id: crypto.randomUUID(), merchantId: params['id'], authorId: platformUsers[0]!.id, authorName: platformUsers[0]!.name, content: body['content'], createdAt: now(), updatedAt: null });
  }),
  http.get(url('/api/v1/merchants/:id/timeline'), () => ok([])),
];

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

const billingHandlers = [
  http.get(url('/api/v1/billing/dashboard'), () =>
    ok({
      totalRevenue: 152000,
      monthlyRevenue: 12400,
      outstandingAmount: 5520,
      overdueAmount: 345,
      invoiceCount: 10,
      paidCount: 5,
      overdueCount: 1,
      revenueByMonth: [{ month: '2026-01', amount: 11200 }, { month: '2026-02', amount: 12400 }, { month: '2026-03', amount: 13100 }],
      revenueByType: { Subscription: 8200, TokenPurchase: 1500, Commission: 850, AddOn: 600, Usage: 340 },
    }),
  ),
  http.get(url('/api/v1/billing/invoices'), ({ request }) => paginated(invoices, request)),
  http.get(url('/api/v1/billing/invoices/:id'), ({ params }) => {
    const inv = invoices.find((i) => i.id === params['id']);
    return inv ? ok(inv) : notFound('Invoice', String(params['id']));
  }),
  http.post(url('/api/v1/billing/invoices'), () => ok(invoices[0])),
  http.post(url('/api/v1/billing/invoices/:id/send'), () => ok({ sent: true })),
  http.post(url('/api/v1/billing/invoices/:id/refund'), () => ok({ refundId: crypto.randomUUID() })),
  http.get(url('/api/v1/billing/plans'), () =>
    ok([
      { id: '1', name: 'Basic', tier: 'Basic', monthlyPrice: 300, annualPrice: 3000, currency: 'SAR', features: ['1 location', '2 terminals'], maxLocations: 1, maxTerminals: 2, isActive: true },
      { id: '2', name: 'Standard', tier: 'Standard', monthlyPrice: 1200, annualPrice: 12000, currency: 'SAR', features: ['5 locations', '20 terminals', 'Reporting'], maxLocations: 5, maxTerminals: 20, isActive: true },
      { id: '3', name: 'Premium', tier: 'Premium', monthlyPrice: 2500, annualPrice: 25000, currency: 'SAR', features: ['Unlimited'], maxLocations: 999, maxTerminals: 999, isActive: true },
    ]),
  ),
  http.post(url('/api/v1/billing/plans'), () => ok({ id: crypto.randomUUID(), name: 'New Plan' })),
  http.put(url('/api/v1/billing/plans/:id'), () => ok({ id: crypto.randomUUID(), name: 'Updated Plan' })),
  http.get(url('/api/v1/billing/token-pricing'), () =>
    ok([
      { id: '1', tier: 'Basic', validityDays: 90, price: 250, currency: 'SAR', bulkDiscounts: [{ minQuantity: 5, discountPercent: 10 }] },
      { id: '2', tier: 'Standard', validityDays: 90, price: 500, currency: 'SAR', bulkDiscounts: [{ minQuantity: 5, discountPercent: 10 }] },
      { id: '3', tier: 'Advance', validityDays: 90, price: 750, currency: 'SAR', bulkDiscounts: [{ minQuantity: 5, discountPercent: 15 }] },
      { id: '4', tier: 'Premium', validityDays: 90, price: 1200, currency: 'SAR', bulkDiscounts: [{ minQuantity: 3, discountPercent: 15 }] },
    ]),
  ),
  http.put(url('/api/v1/billing/token-pricing'), () => ok([])),
];

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

const reportHandlers = [
  http.get(url('/api/v1/reports/growth'), () => ok({ newMerchants: 3, churnedMerchants: 0, netGrowth: 3, growthRate: 5.2, timeSeries: [] })),
  http.get(url('/api/v1/reports/revenue'), () => ok({ totalRevenue: 12400, subscriptionRevenue: 8200, tokenRevenue: 1500, commissionRevenue: 850, timeSeries: [], byPlan: {} })),
  http.get(url('/api/v1/reports/usage'), () => ok({ totalTransactions: 54000, averageTransactionsPerMerchant: 6750, activeTerminals: 68, peakConcurrentUsers: 42, timeSeries: [] })),
  http.get(url('/api/v1/reports/churn'), () => ok({ churnRate: 2.1, churnedMerchants: 0, retainedMerchants: 6, reasonBreakdown: {}, timeSeries: [] })),
  http.get(url('/api/v1/reports/commission'), () => ok({ totalCommission: 2433.5, averageRate: 2.5, byMerchant: [], timeSeries: [] })),
  http.get(url('/api/v1/reports/tokens'), () => ok({ tokensGenerated: 15, tokensConsumed: 2, tokensExpired: 2, tokensRevoked: 1, revenueFromTokens: 7500, byTier: { Basic: 4, Standard: 4, Advance: 4, Premium: 3 }, timeSeries: [] })),
  http.post(url('/api/v1/reports/custom'), () => ok({ columns: [], rows: [], generatedAt: now() })),
  http.get(url('/api/v1/reports/definitions'), () => ok([])),
  http.post(url('/api/v1/reports/definitions'), () => ok({ id: crypto.randomUUID() })),
  http.get(url('/api/v1/reports/:id/export'), () => ok({ downloadUrl: 'https://quantix.io/reports/mock.pdf' })),
];

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const settingsHandlers = [
  http.get(url('/api/v1/settings'), () =>
    ok({ platformName: 'Quantix', supportEmail: 'support@quantix.io', defaultCurrency: 'SAR', defaultTimezone: 'Asia/Riyadh', maintenanceMode: false, signupEnabled: true, maxMerchantsPerPlan: { Basic: 100, Standard: 50, Premium: 20 }, defaultTrialDays: 14 }),
  ),
  http.put(url('/api/v1/settings'), async ({ request }) => ok(await request.json())),
  http.get(url('/api/v1/settings/feature-toggles'), () => ok([])),
  http.put(url('/api/v1/settings/feature-toggles/:id'), () => ok({})),
  http.get(url('/api/v1/settings/maintenance-windows'), () => ok([])),
  http.post(url('/api/v1/settings/maintenance-windows'), () => ok({})),
  http.get(url('/api/v1/settings/email-templates'), () => ok([])),
  http.put(url('/api/v1/settings/email-templates/:id'), () => ok({})),
  http.get(url('/api/v1/settings/integrations'), () => ok([])),
  http.put(url('/api/v1/settings/integrations/:id'), () => ok({})),
  http.get(url('/api/v1/settings/token-config'), () => ok({ defaultValidityDays: 90, maxValidityDays: 365, gracePeriodDays: 7, autoRenewEnabled: false, notifyDaysBeforeExpiry: [30, 14, 7, 3, 1] })),
  http.put(url('/api/v1/settings/token-config'), async ({ request }) => ok(await request.json())),
  http.get(url('/api/v1/settings/commission-config'), () => ok({ defaultRate: 2.5, minimumTransactionValue: 10, settlementFrequency: 'Monthly', autoSettle: false })),
  http.put(url('/api/v1/settings/commission-config'), async ({ request }) => ok(await request.json())),
  http.get(url('/api/v1/settings/grace-period-config'), () => ok({ defaultGraceDays: 7, readOnlyDuringGrace: true, notificationSchedule: [7, 3, 1], autoSuspendAfterGrace: true })),
  http.put(url('/api/v1/settings/grace-period-config'), async ({ request }) => ok(await request.json())),
];

// ---------------------------------------------------------------------------
// Helpdesk
// ---------------------------------------------------------------------------

const helpdeskHandlers = [
  http.get(url('/api/v1/helpdesk/tickets'), ({ request }) => paginated(tickets, request)),
  http.get(url('/api/v1/helpdesk/tickets/:id'), ({ params }) => {
    const t = tickets.find((t) => t.id === params['id']);
    return t ? ok(t) : notFound('Ticket', String(params['id']));
  }),
  http.post(url('/api/v1/helpdesk/tickets'), () => ok(tickets[0])),
  http.put(url('/api/v1/helpdesk/tickets/:id'), ({ params }) => {
    const t = tickets.find((t) => t.id === params['id']);
    return t ? ok(t) : notFound('Ticket', String(params['id']));
  }),
  http.post(url('/api/v1/helpdesk/tickets/assign'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const t = tickets.find((t) => t.id === body['ticketId']);
    return t ? ok(t) : notFound('Ticket', String(body['ticketId']));
  }),
  http.post(url('/api/v1/helpdesk/tickets/escalate'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const t = tickets.find((t) => t.id === body['ticketId']);
    return t ? ok(t) : notFound('Ticket', String(body['ticketId']));
  }),
  http.post(url('/api/v1/helpdesk/tickets/:id/comment'), async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return ok({ id: crypto.randomUUID(), ticketId: params['id'], authorId: platformUsers[1]!.id, authorName: platformUsers[1]!.name, authorRole: 'Agent', content: body['content'], attachments: [], createdAt: now() });
  }),
  http.get(url('/api/v1/helpdesk/metrics'), () =>
    ok({ totalOpen: 4, totalResolved: 1, averageResolutionTimeHours: 18, slaCompliancePercent: 85, byCategory: { Billing: 1, Technical: 2, Account: 0, Token: 1, Feature: 1, General: 0 }, byPriority: { Low: 1, Medium: 1, High: 2, Urgent: 1 }, byAgent: [{ agentId: platformUsers[1]!.id, agentName: 'Sara Ahmed', openTickets: 3, resolvedTickets: 1, averageResolutionTimeHours: 16 }] }),
  ),
  http.get(url('/api/v1/helpdesk/canned-responses'), () => ok([])),
  http.get(url('/api/v1/helpdesk/leads'), ({ request }) => paginated([], request)),
  http.put(url('/api/v1/helpdesk/leads/:id'), () => ok({})),
];

// ---------------------------------------------------------------------------
// Compliance
// ---------------------------------------------------------------------------

const complianceHandlers = [
  http.get(url('/api/v1/compliance/dashboard'), () => ok({ totalDataRequests: 2, pendingRequests: 1, completedRequests: 1, averageResolutionDays: 3, consentCoverage: 98, retentionPoliciesActive: 4, upcomingDeadlines: [] })),
  http.get(url('/api/v1/compliance/data-requests'), ({ request }) => paginated([], request)),
  http.post(url('/api/v1/compliance/data-requests'), () => ok({ id: crypto.randomUUID(), status: 'Pending' })),
  http.post(url('/api/v1/compliance/data-requests/:id/:action'), ({ params }) => ok({ id: params['id'], status: 'Completed' })),
  http.get(url('/api/v1/compliance/consent/:merchantId'), () => ok([])),
  http.get(url('/api/v1/compliance/retention-policies'), () => ok([])),
];

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const contentHandlers = [
  http.get(url('/api/v1/marketing/content/homepage'), () => ok({ sections: {}, updatedAt: now() })),
  http.put(url('/api/v1/marketing/content/:section'), () => ok({})),
  http.get(url('/api/v1/blog/posts'), ({ request }) => paginated([], request)),
  http.get(url('/api/v1/blog/posts/:id'), () => ok({})),
  http.post(url('/api/v1/blog/posts'), () => ok({ id: crypto.randomUUID() })),
  http.put(url('/api/v1/blog/posts/:id'), () => ok({})),
  http.delete(url('/api/v1/blog/posts/:id'), () => ok({ deleted: true })),
  http.post(url('/api/v1/blog/posts/:id/publish'), () => ok({})),
  http.post(url('/api/v1/blog/posts/:id/archive'), () => ok({})),
  http.get(url('/api/v1/help-centre/articles'), ({ request }) => paginated([], request)),
  http.get(url('/api/v1/help-centre/articles/:id'), () => ok({})),
  http.post(url('/api/v1/help-centre/articles'), () => ok({ id: crypto.randomUUID() })),
  http.put(url('/api/v1/help-centre/articles/:id'), () => ok({})),
  http.get(url('/api/v1/help-centre/faqs'), ({ request }) => paginated([], request)),
  http.post(url('/api/v1/help-centre/faqs'), () => ok({ id: crypto.randomUUID() })),
  http.put(url('/api/v1/help-centre/faqs/:id'), () => ok({})),
  http.delete(url('/api/v1/help-centre/faqs/:id'), () => ok({ deleted: true })),
];

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

const contactHandlers = [
  http.get(url('/api/v1/contacts'), ({ request }) => paginated([], request)),
  http.get(url('/api/v1/contacts/:id'), () => ok({})),
  http.post(url('/api/v1/contacts'), () => ok({ id: crypto.randomUUID() })),
  http.put(url('/api/v1/contacts/:id'), () => ok({})),
];

// ---------------------------------------------------------------------------
// Signups
// ---------------------------------------------------------------------------

const signupHandlers = [
  http.get(url('/api/v1/signups'), ({ request }) =>
    paginated(
      [{ id: merchants[7]!.id, businessName: 'Pixel Phone Shop', contactPerson: 'Rami Taha', email: 'rami@pixelphones.com', phone: '+9665551008', merchantType: 'Standalone', businessNature: 'Retail', status: 'Pending', step: 'verification', error: null, submittedAt: merchants[7]!.signupDate, completedAt: null, interventionNote: null }],
      request,
    ),
  ),
  http.get(url('/api/v1/signups/:id'), ({ params }) => ok({ id: params['id'], businessName: 'Pixel Phone Shop', status: 'Pending' })),
  http.post(url('/api/v1/signups/:id/intervene'), ({ params }) => ok({ id: params['id'], status: 'Intervened' })),
];

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

const auditHandlers = [
  http.get(url('/api/v1/audit-logs'), ({ request }) => paginated([], request)),
  http.get(url('/api/v1/audit-logs/export'), () => ok({ downloadUrl: 'https://quantix.io/audit/mock.csv' })),
  http.get(url('/api/v1/audit-logs/:id'), () => ok({})),
];

// ---------------------------------------------------------------------------
// Tokens (SPA-017)
// ---------------------------------------------------------------------------

const tokenHandlers = [
  http.get(url('/api/v1/tokens'), ({ request }) => paginated(tokens, request)),
  http.post(url('/api/v1/tokens'), () => ok(tokens[0])),
  http.post(url('/api/v1/tokens/bulk'), () => ok(tokens.slice(0, 3))),
  http.get(url('/api/v1/tokens/templates'), () =>
    ok([
      { id: '1', name: 'Basic 90-day', tier: 'Basic', validityDays: 90, limitsPayload: { maxTransactionsPerDay: 50 }, featureMap: { advancedReporting: false }, gracePolicy: { gracePeriodDays: 7, readOnlyDuringGrace: true, notifyDaysBeforeExpiry: [30, 14, 7, 3, 1] }, createdAt: now(), updatedAt: now() },
      { id: '2', name: 'Standard 90-day', tier: 'Standard', validityDays: 90, limitsPayload: { maxTransactionsPerDay: 200 }, featureMap: { advancedReporting: false, apiAccess: true }, gracePolicy: { gracePeriodDays: 7, readOnlyDuringGrace: true, notifyDaysBeforeExpiry: [30, 14, 7, 3, 1] }, createdAt: now(), updatedAt: now() },
    ]),
  ),
  http.get(url('/api/v1/tokens/expiring'), () => ok(tokens.filter((t) => t.status === 'Active').slice(0, 3))),
  http.get(url('/api/v1/tokens/metrics'), () =>
    ok({ totalActive: 10, totalExpired: 2, totalRevoked: 1, totalConsumed: 2, expiringWithin7Days: 1, expiringWithin30Days: 3, byTier: { Basic: 4, Standard: 4, Advance: 4, Premium: 3 }, generatedThisMonth: 5, revenueThisMonth: 3750 }),
  ),
  http.get(url('/api/v1/tokens/:id'), ({ params }) => {
    const t = tokens.find((t) => t.id === params['id']);
    return t ? ok(t) : notFound('Token', String(params['id']));
  }),
  http.post(url('/api/v1/tokens/:id/revoke'), ({ params }) => {
    const t = tokens.find((t) => t.id === params['id']);
    return t ? ok({ ...t, status: 'Revoked' }) : notFound('Token', String(params['id']));
  }),
  http.put(url('/api/v1/tokens/templates/:tier'), () => ok({ id: '1', name: 'Updated', tier: 'Basic', validityDays: 90, limitsPayload: {}, featureMap: {}, gracePolicy: { gracePeriodDays: 7, readOnlyDuringGrace: true, notifyDaysBeforeExpiry: [30, 14, 7, 3, 1] }, createdAt: now(), updatedAt: now() })),
];

// ---------------------------------------------------------------------------
// Commission (SPA-018)
// ---------------------------------------------------------------------------

// 2026-05-17 (Pass 35): ledger/settlement/dispute/statement handlers removed.
// Phase F adds: GET /api/v1/commission/collections, POST /api/v1/commission/collections/trigger.
const commissionHandlers = [
  http.get(url('/api/v1/commission/dashboard'), () =>
    ok({ periodStart: new Date(Date.now() - 30 * 86400000).toISOString(), periodEnd: now(), totalTransactions: 6, totalTransactionAmount: 105700, totalCommission: 2433.5, averageRate: 2.5, currency: 'SAR', byMerchant: [] }),
  ),
  http.get(url('/api/v1/commission/rates'), () =>
    ok([{ id: '1', planId: null, merchantId: null, rate: 2.5, minTransactionValue: 10, effectiveFrom: new Date(Date.now() - 365 * 86400000).toISOString(), effectiveTo: null }]),
  ),
  http.post(url('/api/v1/commission/rates'), () => ok({ id: crypto.randomUUID(), rate: 2.5 })),
  http.put(url('/api/v1/commission/rates/:id'), () => ok({ id: crypto.randomUUID(), rate: 2.5 })),
  http.get(url('/api/v1/commission/exemptions'), () => ok([])),
  http.post(url('/api/v1/commission/exemptions'), () => ok({ id: crypto.randomUUID() })),
  http.delete(url('/api/v1/commission/exemptions/:id'), () => ok({ deleted: true })),
];

// ---------------------------------------------------------------------------
// All handlers
// ---------------------------------------------------------------------------

export const handlers = [
  ...dashboardHandlers,
  ...userHandlers,
  ...registrationHandlers,
  ...walletHandlers,
  ...merchantHandlers,
  ...billingHandlers,
  ...reportHandlers,
  ...settingsHandlers,
  ...helpdeskHandlers,
  ...complianceHandlers,
  ...contentHandlers,
  ...contactHandlers,
  ...signupHandlers,
  ...auditHandlers,
  ...tokenHandlers,
  ...commissionHandlers,
];
