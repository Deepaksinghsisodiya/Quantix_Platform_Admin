/**
 * Mock API client — returns seed data from mockData.ts.
 *
 * Activated when `import.meta.env.VITE_MOCK_API === 'true'`.
 * Every function mirrors the real API module signatures and returns
 * the same typed promise shapes.
 */

import type { ApiResponse } from '@/lib/types/common';
import type { ApiListResponse } from '../types';
import type { Merchant, MerchantNote } from '@/lib/types/merchant';
import type { PlatformUser } from '@/lib/types/user';
import type { Invoice, SubscriptionPlan, TokenPricing } from '@/lib/types/billing';
import type { RechargeToken, TokenTemplate } from '@/lib/types/token';
// 2026-05-17 (Pass 35): obsolete commission types removed.
import type { CommissionRate, CommissionExemption, CommissionSummary } from '@/lib/types/commission';
import type { Ticket, TicketMessage, TicketMetrics, CannedResponse, Lead } from '@/lib/types/helpdesk';
import type { PlatformDashboardDto, DashboardWidget, SystemHealthDto } from '../dashboard';
import type { TokenMetrics } from '../tokens';

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

const now = () => new Date().toISOString();

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: now() };
}

function list<T>(items: readonly T[], page = 1, pageSize = 20): ApiListResponse<T> {
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  return {
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
  };
}

async function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---------------------------------------------------------------------------
// Dashboard — names mirror the real `lib/api/dashboard.ts` after the 2026-05-06
// rewrite (PlatformDashboardDto + per-section DTOs).
// ---------------------------------------------------------------------------

export function getDashboardSummary(): Promise<ApiResponse<PlatformDashboardDto>> {
  return delay(ok(dashboardMetrics));
}

export function getDashboardWidgets(): Promise<ApiResponse<readonly DashboardWidget[]>> {
  return delay(ok<readonly DashboardWidget[]>([]));
}

export function getSystemHealth(): Promise<ApiResponse<SystemHealthDto>> {
  return delay(ok(systemHealth));
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function getUsers(): Promise<ApiListResponse<PlatformUser>> {
  return delay(list(platformUsers));
}

export function getUser(id: string): Promise<ApiResponse<PlatformUser>> {
  const u = platformUsers.find((u) => u.id === id);
  if (!u) throw new Error(`User ${id} not found`);
  return delay(ok(u));
}

export function createUser(data: Record<string, unknown>): Promise<ApiResponse<PlatformUser>> {
  const user: PlatformUser = {
    id: crypto.randomUUID(),
    name: String(data['name'] ?? ''),
    email: String(data['email'] ?? ''),
    role: (data['role'] as PlatformUser['role']) ?? 'ReadOnly',
    department: String(data['department'] ?? ''),
    status: 'Active',
    lastLogin: null,
    mfaEnabled: false,
    createdAt: now(),
    updatedAt: now(),
    permissions: [],
  };
  return delay(ok(user));
}

export function updateUser(id: string, data: Record<string, unknown>): Promise<ApiResponse<PlatformUser>> {
  const u = platformUsers.find((u) => u.id === id);
  if (!u) throw new Error(`User ${id} not found`);
  return delay(ok({ ...u, ...data, updatedAt: now() } as PlatformUser));
}

export function deleteUser(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return delay(ok({ deleted: platformUsers.some((u) => u.id === id) }));
}

export function getRoles(): Promise<ApiResponse<readonly { id: string; name: string; description: string; permissions: readonly string[] }[]>> {
  // 2026-05-06: PlatformSuperAdmin tier dropped — PlatformAdmin is the top tier with full access.
  return delay(ok([
    { id: '1', name: 'PlatformAdmin', description: 'Full access', permissions: ['*'] },
    { id: '2', name: 'SupportAgent', description: 'Support access', permissions: ['tickets', 'merchants:read'] },
  ]));
}

export function getUserActivity(_id: string): Promise<ApiResponse<readonly { id: string; userId: string; action: string; resource: string; details: string; ipAddress: string; timestamp: string }[]>> {
  return delay(ok([]));
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerEnterprise(data: Record<string, unknown>): Promise<ApiResponse<Merchant>> {
  return delay(ok({ ...merchants[0]!, id: crypto.randomUUID(), businessName: String(data['businessName'] ?? '') } as Merchant));
}

export function registerStandalone(data: Record<string, unknown>): Promise<ApiResponse<Merchant>> {
  return delay(ok({ ...merchants[4]!, id: crypto.randomUUID(), businessName: String(data['businessName'] ?? '') } as Merchant));
}

export function getSignupQueue(): Promise<ApiListResponse<{ id: string; businessName: string; email: string; merchantType: string; status: string; step: string; error: string | null; submittedAt: string; completedAt: string | null }>> {
  return delay(list([
    { id: crypto.randomUUID(), businessName: 'Pixel Phone Shop', email: 'rami@pixelphones.com', merchantType: 'Standalone', status: 'Pending', step: 'verification', error: null, submittedAt: now(), completedAt: null },
  ]));
}

export function resendVerification(_id: string): Promise<ApiResponse<{ sent: boolean }>> {
  return delay(ok({ sent: true }));
}

export function retryProvisioning(_id: string): Promise<ApiResponse<{ id: string; status: string }>> {
  return delay(ok({ id: _id, status: 'Provisioning' }));
}

// ---------------------------------------------------------------------------
// Wallet
// ---------------------------------------------------------------------------

export function getWallets(): Promise<ApiListResponse<{ merchantId: string; merchantName: string; balance: number; currency: string; lastTopUp: string | null; lastDeduction: string | null; updatedAt: string }>> {
  const wallets = merchants.filter((t) => t.merchantType === 'Standalone').map((t) => ({
    merchantId: t.id,
    merchantName: t.businessName,
    balance: t.tokenBalance ?? 0,
    currency: 'SAR',
    lastTopUp: t.signupDate,
    lastDeduction: t.lastActivityDate,
    updatedAt: now(),
  }));
  return delay(list(wallets));
}

export function getWallet(merchantId: string): Promise<ApiResponse<{ merchantId: string; merchantName: string; balance: number; currency: string; lastTopUp: string | null; lastDeduction: string | null; updatedAt: string }>> {
  const t = merchants.find((t) => t.id === merchantId);
  return delay(ok({
    merchantId,
    merchantName: t?.businessName ?? 'Unknown',
    balance: t?.tokenBalance ?? 0,
    currency: 'SAR',
    lastTopUp: t?.signupDate ?? null,
    lastDeduction: t?.lastActivityDate ?? null,
    updatedAt: now(),
  }));
}

export function adjustWallet(_data: Record<string, unknown>): Promise<ApiResponse<{ merchantId: string; merchantName: string; balance: number; currency: string; lastTopUp: string | null; lastDeduction: string | null; updatedAt: string }>> {
  return getWallet(String((_data as { merchantId?: string }).merchantId ?? ''));
}

// 2026-05-18 (Pass 37): TopUp 2-step mock dropped (single-step Offline recharge replaces it).

// ---------------------------------------------------------------------------
// Merchants
// ---------------------------------------------------------------------------

export function getMerchants(): Promise<ApiListResponse<Merchant>> {
  return delay(list(merchants));
}

export function getMerchant(id: string): Promise<ApiResponse<Merchant>> {
  const t = merchants.find((t) => t.id === id);
  if (!t) throw new Error(`Merchant ${id} not found`);
  return delay(ok(t));
}

export function updateMerchant(id: string, data: Record<string, unknown>): Promise<ApiResponse<Merchant>> {
  const t = merchants.find((t) => t.id === id);
  if (!t) throw new Error(`Merchant ${id} not found`);
  return delay(ok({ ...t, ...data } as Merchant));
}

export function activateMerchant(id: string): Promise<ApiResponse<Merchant>> {
  return updateMerchant(id, { status: 'Active' });
}

export function suspendMerchant(id: string, _reason: string): Promise<ApiResponse<Merchant>> {
  return updateMerchant(id, { status: 'Suspended' });
}

export function reactivateMerchant(id: string): Promise<ApiResponse<Merchant>> {
  return updateMerchant(id, { status: 'Active' });
}

export function cancelMerchant(id: string, _reason: string): Promise<ApiResponse<Merchant>> {
  return updateMerchant(id, { status: 'Cancelled' });
}

export function exportMerchantData(_id: string): Promise<ApiResponse<{ downloadUrl: string }>> {
  return delay(ok({ downloadUrl: 'https://quantix.io/exports/mock.zip' }));
}

export function getMerchantNotes(_id: string): Promise<ApiResponse<readonly MerchantNote[]>> {
  return delay(ok<readonly MerchantNote[]>([]));
}

export function addMerchantNote(id: string, data: Record<string, unknown>): Promise<ApiResponse<MerchantNote>> {
  return delay(ok({
    id: crypto.randomUUID(),
    merchantId: id,
    authorId: platformUsers[0]!.id,
    authorName: platformUsers[0]!.name,
    content: String(data['content'] ?? ''),
    createdAt: now(),
    updatedAt: null,
  }));
}

export function getMerchantTimeline(_id: string): Promise<ApiResponse<readonly never[]>> {
  return delay(ok<readonly never[]>([]));
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export function getBillingDashboard(): Promise<ApiResponse<{ totalRevenue: number; monthlyRevenue: number; outstandingAmount: number; overdueAmount: number; invoiceCount: number; paidCount: number; overdueCount: number; revenueByMonth: readonly { month: string; amount: number }[]; revenueByType: Record<string, number> }>> {
  return delay(ok({
    totalRevenue: 152000,
    monthlyRevenue: 12400,
    outstandingAmount: 5520,
    overdueAmount: 345,
    invoiceCount: 10,
    paidCount: 5,
    overdueCount: 1,
    revenueByMonth: [
      { month: '2026-01', amount: 11200 },
      { month: '2026-02', amount: 12400 },
      { month: '2026-03', amount: 13100 },
    ],
    revenueByType: { Subscription: 8200, TokenPurchase: 1500, Commission: 850, AddOn: 600, Usage: 340 },
  }));
}

export function getInvoices(): Promise<ApiListResponse<Invoice>> {
  return delay(list(invoices));
}

export function getInvoice(id: string): Promise<ApiResponse<Invoice>> {
  const inv = invoices.find((i) => i.id === id);
  if (!inv) throw new Error(`Invoice ${id} not found`);
  return delay(ok(inv));
}

export function generateInvoice(_data: Record<string, unknown>): Promise<ApiResponse<Invoice>> {
  return delay(ok(invoices[0]!));
}

export function sendInvoice(_id: string): Promise<ApiResponse<{ sent: boolean }>> {
  return delay(ok({ sent: true }));
}

export function getPlans(): Promise<ApiResponse<readonly SubscriptionPlan[]>> {
  const plans: readonly SubscriptionPlan[] = [
    { id: '1', name: 'Basic', tier: 'Basic', monthlyPrice: 300, annualPrice: 3000, currency: 'SAR', features: ['1 location', '2 terminals'], maxLocations: 1, maxTerminals: 2, isActive: true },
    { id: '2', name: 'Standard', tier: 'Standard', monthlyPrice: 1200, annualPrice: 12000, currency: 'SAR', features: ['5 locations', '20 terminals', 'Reporting'], maxLocations: 5, maxTerminals: 20, isActive: true },
    { id: '3', name: 'Premium', tier: 'Premium', monthlyPrice: 2500, annualPrice: 25000, currency: 'SAR', features: ['Unlimited locations', 'Unlimited terminals', 'Full suite'], maxLocations: 999, maxTerminals: 999, isActive: true },
  ];
  return delay(ok(plans));
}

export function createPlan(_data: Record<string, unknown>): Promise<ApiResponse<SubscriptionPlan>> {
  return delay(ok({ id: crypto.randomUUID(), name: 'New Plan', tier: 'Basic', monthlyPrice: 100, annualPrice: 1000, currency: 'SAR', features: [], maxLocations: 1, maxTerminals: 1, isActive: true }));
}

export function updatePlan(id: string, _data: Record<string, unknown>): Promise<ApiResponse<SubscriptionPlan>> {
  return delay(ok({ id, name: 'Updated Plan', tier: 'Basic', monthlyPrice: 100, annualPrice: 1000, currency: 'SAR', features: [], maxLocations: 1, maxTerminals: 1, isActive: true }));
}

export function getTokenPricing(): Promise<ApiResponse<readonly TokenPricing[]>> {
  return delay(ok<readonly TokenPricing[]>([
    { id: '1', tier: 'Basic', validityDays: 90, price: 250, currency: 'SAR', bulkDiscounts: [{ minQuantity: 5, discountPercent: 10 }] },
    { id: '2', tier: 'Standard', validityDays: 90, price: 500, currency: 'SAR', bulkDiscounts: [{ minQuantity: 5, discountPercent: 10 }] },
    { id: '3', tier: 'Advance', validityDays: 90, price: 750, currency: 'SAR', bulkDiscounts: [{ minQuantity: 5, discountPercent: 15 }] },
    { id: '4', tier: 'Premium', validityDays: 90, price: 1200, currency: 'SAR', bulkDiscounts: [{ minQuantity: 3, discountPercent: 15 }] },
  ]));
}

export function updateTokenPricing(_data: Record<string, unknown>): Promise<ApiResponse<readonly TokenPricing[]>> {
  return getTokenPricing();
}

export function processRefund(_invoiceId: string, _data: Record<string, unknown>): Promise<ApiResponse<{ refundId: string }>> {
  return delay(ok({ refundId: crypto.randomUUID() }));
}

// ---------------------------------------------------------------------------
// Reports (stubs returning empty data)
// ---------------------------------------------------------------------------

export function getGrowthReport(): Promise<ApiResponse<{ newMerchants: number; churnedMerchants: number; netGrowth: number; growthRate: number; timeSeries: readonly never[] }>> {
  return delay(ok({ newMerchants: 3, churnedMerchants: 0, netGrowth: 3, growthRate: 5.2, timeSeries: [] }));
}

export function getRevenueReport(): Promise<ApiResponse<{ totalRevenue: number; subscriptionRevenue: number; tokenRevenue: number; commissionRevenue: number; timeSeries: readonly never[]; byPlan: Record<string, number> }>> {
  return delay(ok({ totalRevenue: 12400, subscriptionRevenue: 8200, tokenRevenue: 1500, commissionRevenue: 850, timeSeries: [], byPlan: {} }));
}

export function getUsageReport(): Promise<ApiResponse<{ totalTransactions: number; averageTransactionsPerMerchant: number; activeTerminals: number; peakConcurrentUsers: number; timeSeries: readonly never[] }>> {
  return delay(ok({ totalTransactions: 54000, averageTransactionsPerMerchant: 6750, activeTerminals: 68, peakConcurrentUsers: 42, timeSeries: [] }));
}

export function getChurnReport(): Promise<ApiResponse<{ churnRate: number; churnedMerchants: number; retainedMerchants: number; reasonBreakdown: Record<string, number>; timeSeries: readonly never[] }>> {
  return delay(ok({ churnRate: 2.1, churnedMerchants: 0, retainedMerchants: 6, reasonBreakdown: {}, timeSeries: [] }));
}

export function getCommissionReport(): Promise<ApiResponse<{ totalCommission: number; averageRate: number; byMerchant: readonly never[]; timeSeries: readonly never[] }>> {
  return delay(ok({ totalCommission: 2433.5, averageRate: 2.5, byMerchant: [], timeSeries: [] }));
}

export function getTokenReport(): Promise<ApiResponse<{ tokensGenerated: number; tokensConsumed: number; tokensExpired: number; tokensRevoked: number; revenueFromTokens: number; byTier: Record<string, number>; timeSeries: readonly never[] }>> {
  return delay(ok({ tokensGenerated: 15, tokensConsumed: 2, tokensExpired: 2, tokensRevoked: 1, revenueFromTokens: 7500, byTier: { Basic: 4, Standard: 4, Advance: 4, Premium: 3 }, timeSeries: [] }));
}

export function getCustomReport(_definition: Record<string, unknown>): Promise<ApiResponse<{ columns: readonly string[]; rows: readonly never[]; generatedAt: string }>> {
  return delay(ok({ columns: [], rows: [], generatedAt: now() }));
}

export function getReportDefinitions(): Promise<ApiResponse<readonly never[]>> {
  return delay(ok<readonly never[]>([]));
}

export function saveReportDefinition(_data: Record<string, unknown>): Promise<ApiResponse<{ id: string }>> {
  return delay(ok({ id: crypto.randomUUID() }));
}

export function exportReport(_id: string, _format: string): Promise<ApiResponse<{ downloadUrl: string }>> {
  return delay(ok({ downloadUrl: 'https://quantix.io/reports/mock.pdf' }));
}

// ---------------------------------------------------------------------------
// Settings (stubs)
// ---------------------------------------------------------------------------

export function getGlobalSettings(): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({
    platformName: 'Quantix',
    supportEmail: 'support@quantix.io',
    defaultCurrency: 'SAR',
    defaultTimezone: 'Asia/Riyadh',
    maintenanceMode: false,
    signupEnabled: true,
    maxMerchantsPerPlan: { Basic: 100, Standard: 50, Premium: 20 },
    defaultTrialDays: 14,
  }));
}

export function updateGlobalSettings(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok(data));
}

export function getFeatureToggles(): Promise<ApiResponse<readonly never[]>> {
  return delay(ok<readonly never[]>([]));
}

export function updateFeatureToggle(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function getMaintenanceWindows(): Promise<ApiResponse<readonly never[]>> {
  return delay(ok<readonly never[]>([]));
}

export function scheduleMaintenanceWindow(_data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function getEmailTemplates(): Promise<ApiResponse<readonly never[]>> {
  return delay(ok<readonly never[]>([]));
}

export function updateEmailTemplate(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function getIntegrations(): Promise<ApiResponse<readonly never[]>> {
  return delay(ok<readonly never[]>([]));
}

export function updateIntegration(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function getTokenConfig(): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ defaultValidityDays: 90, maxValidityDays: 365, gracePeriodDays: 7, autoRenewEnabled: false, notifyDaysBeforeExpiry: [30, 14, 7, 3, 1] }));
}

export function updateTokenConfig(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok(data));
}

export function getCommissionConfig(): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ defaultRate: 2.5, minimumTransactionValue: 10, settlementFrequency: 'Monthly', autoSettle: false }));
}

export function updateCommissionConfig(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok(data));
}

export function getGracePeriodConfig(): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ defaultGraceDays: 7, readOnlyDuringGrace: true, notificationSchedule: [7, 3, 1], autoSuspendAfterGrace: true }));
}

export function updateGracePeriodConfig(data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok(data));
}

// ---------------------------------------------------------------------------
// Helpdesk
// ---------------------------------------------------------------------------

export function getTickets(): Promise<ApiListResponse<Ticket>> {
  return delay(list(tickets));
}

export function getTicket(id: string): Promise<ApiResponse<Ticket>> {
  const t = tickets.find((t) => t.id === id);
  if (!t) throw new Error(`Ticket ${id} not found`);
  return delay(ok(t));
}

export function createTicket(_data: Record<string, unknown>): Promise<ApiResponse<Ticket>> {
  return delay(ok(tickets[0]!));
}

export function updateTicket(id: string, _data: Record<string, unknown>): Promise<ApiResponse<Ticket>> {
  const t = tickets.find((t) => t.id === id);
  if (!t) throw new Error(`Ticket ${id} not found`);
  return delay(ok(t));
}

export function assignTicket(id: string, _agentId: string): Promise<ApiResponse<Ticket>> {
  return updateTicket(id, {});
}

export function addTicketMessage(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<TicketMessage>> {
  return delay(ok({
    id: crypto.randomUUID(),
    ticketId: _id,
    authorId: platformUsers[1]!.id,
    authorName: platformUsers[1]!.name,
    authorRole: 'Agent' as const,
    content: String(_data['content'] ?? ''),
    attachments: [],
    createdAt: now(),
  }));
}

export function getTicketMetrics(): Promise<ApiResponse<TicketMetrics>> {
  return delay(ok({
    totalOpen: 4,
    totalResolved: 1,
    averageResolutionTimeHours: 18,
    slaCompliancePercent: 85,
    byCategory: { Billing: 1, Technical: 2, Account: 0, Token: 1, Feature: 1, General: 0 },
    byPriority: { Low: 1, Medium: 1, High: 2, Urgent: 1 },
    byAgent: [{ agentId: platformUsers[1]!.id, agentName: 'Sara Ahmed', openTickets: 3, resolvedTickets: 1, averageResolutionTimeHours: 16 }],
  }));
}

export function getCannedResponses(): Promise<ApiResponse<readonly CannedResponse[]>> {
  return delay(ok<readonly CannedResponse[]>([]));
}

export function getLeads(): Promise<ApiListResponse<Lead>> {
  return delay(list<Lead>([]));
}

export function updateLead(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Lead>> {
  return delay(ok({
    leadId: _id,
    id: _id,
    name: '',
    email: '',
    phone: '',
    leadType: 'Contact',
    status: 'New' as const,
    createdAt: now(),
    updatedAt: now(),
  }));
}

// ---------------------------------------------------------------------------
// Compliance (stubs)
// ---------------------------------------------------------------------------

export function getComplianceDashboard(): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ totalDataRequests: 2, pendingRequests: 1, completedRequests: 1, averageResolutionDays: 3, consentCoverage: 98, retentionPoliciesActive: 4, upcomingDeadlines: [] }));
}

export function getDataRequests(): Promise<ApiListResponse<Record<string, unknown>>> {
  return delay(list<Record<string, unknown>>([]));
}

export function createDataRequest(_data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ id: crypto.randomUUID(), status: 'Pending' }));
}

export function processDataRequest(_id: string, _action: string): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ id: _id, status: 'Completed' }));
}

export function getConsentRecords(_merchantId: string): Promise<ApiResponse<readonly never[]>> {
  return delay(ok<readonly never[]>([]));
}

export function getRetentionPolicies(): Promise<ApiResponse<readonly never[]>> {
  return delay(ok<readonly never[]>([]));
}

// ---------------------------------------------------------------------------
// Content (stubs)
// ---------------------------------------------------------------------------

export function getMarketingContent(): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ sections: {}, updatedAt: now() }));
}

export function updateMarketingContent(_section: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function getBlogPosts(): Promise<ApiListResponse<Record<string, unknown>>> {
  return delay(list<Record<string, unknown>>([]));
}

export function getBlogPost(_id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function createBlogPost(_data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ id: crypto.randomUUID() }));
}

export function updateBlogPost(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function deleteBlogPost(_id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return delay(ok({ deleted: true }));
}

export function publishBlogPost(_id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function getHelpArticles(): Promise<ApiListResponse<Record<string, unknown>>> {
  return delay(list<Record<string, unknown>>([]));
}

export function getHelpArticle(_id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function createHelpArticle(_data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ id: crypto.randomUUID() }));
}

export function updateHelpArticle(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function getFaqs(): Promise<ApiListResponse<Record<string, unknown>>> {
  return delay(list<Record<string, unknown>>([]));
}

export function createFaq(_data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ id: crypto.randomUUID() }));
}

export function updateFaq(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function deleteFaq(_id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return delay(ok({ deleted: true }));
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export function getContacts(): Promise<ApiListResponse<Record<string, unknown>>> {
  return delay(list<Record<string, unknown>>([]));
}

export function getContact(_id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function createContact(_data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ id: crypto.randomUUID() }));
}

export function updateContact(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

// ---------------------------------------------------------------------------
// Signups
// ---------------------------------------------------------------------------

export function getSignupQueueFull(): Promise<ApiListResponse<Record<string, unknown>>> {
  return delay(list<Record<string, unknown>>([
    { id: merchants[7]!.id, businessName: 'Pixel Phone Shop', contactPerson: 'Rami Taha', email: 'rami@pixelphones.com', phone: '+9665551008', merchantType: 'Standalone', businessNature: 'Retail', status: 'Pending', step: 'verification', error: null, submittedAt: merchants[7]!.signupDate, completedAt: null, interventionNote: null },
  ]));
}

export function getSignup(_id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ id: _id, businessName: 'Pixel Phone Shop', status: 'Pending' }));
}

export function interveneSignup(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({ id: _id, status: 'Intervened' }));
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export function getAuditLogs(): Promise<ApiListResponse<Record<string, unknown>>> {
  return delay(list<Record<string, unknown>>([]));
}

export function getAuditLog(_id: string): Promise<ApiResponse<Record<string, unknown>>> {
  return delay(ok({}));
}

export function exportAuditLogs(): Promise<ApiResponse<{ downloadUrl: string }>> {
  return delay(ok({ downloadUrl: 'https://quantix.io/audit/mock.csv' }));
}

// ---------------------------------------------------------------------------
// Tokens (SPA-017)
// ---------------------------------------------------------------------------

export function generateToken(_data: Record<string, unknown>): Promise<ApiResponse<RechargeToken>> {
  return delay(ok(tokens[0]!));
}

export function bulkGenerateTokens(_data: Record<string, unknown>): Promise<ApiResponse<readonly RechargeToken[]>> {
  return delay(ok(tokens.slice(0, 3)));
}

export function getTokenHistory(): Promise<ApiListResponse<RechargeToken>> {
  return delay(list(tokens));
}

export function getToken(id: string): Promise<ApiResponse<RechargeToken>> {
  const t = tokens.find((t) => t.id === id);
  if (!t) throw new Error(`Token ${id} not found`);
  return delay(ok(t));
}

export function revokeToken(id: string, _reason: string): Promise<ApiResponse<RechargeToken>> {
  const t = tokens.find((t) => t.id === id);
  if (!t) throw new Error(`Token ${id} not found`);
  return delay(ok({ ...t, status: 'Revoked' as const }));
}

const GP = (days: number) => ({ gracePeriodDays: days, warningDays: 3, degradedDays: 2, restrictedDays: 2, readOnlyDuringGrace: true, notifyDaysBeforeExpiry: [30, 14, 7, 3, 1] });
export function getTokenTemplates(): Promise<ApiResponse<readonly TokenTemplate[]>> {
  const templates: readonly TokenTemplate[] = [
    { id: '1', name: 'Basic 90-day', tier: 'Basic', businessNature: 'Restaurant', validityDays: 90, limitsPayload: { maxTransactionsPerDay: 50 }, featureMap: { advancedReporting: false, multiLocation: false, apiAccess: false }, gracePolicy: GP(7), createdAt: now(), updatedAt: now() },
    { id: '2', name: 'Standard 90-day', tier: 'Standard', businessNature: 'Restaurant', validityDays: 90, limitsPayload: { maxTransactionsPerDay: 200 }, featureMap: { advancedReporting: false, multiLocation: false, apiAccess: true }, gracePolicy: GP(7), createdAt: now(), updatedAt: now() },
    { id: '3', name: 'Advance 90-day', tier: 'Advance', businessNature: 'Both', validityDays: 90, limitsPayload: { maxTransactionsPerDay: 1000 }, featureMap: { advancedReporting: true, multiLocation: false, apiAccess: true }, gracePolicy: GP(7), createdAt: now(), updatedAt: now() },
    { id: '4', name: 'Premium 90-day', tier: 'Premium', businessNature: 'Both', validityDays: 90, limitsPayload: { maxTransactionsPerDay: 10000 }, featureMap: { advancedReporting: true, multiLocation: true, apiAccess: true }, gracePolicy: GP(14), createdAt: now(), updatedAt: now() },
  ];
  return delay(ok(templates));
}

export function updateTokenTemplate(_tier: string, _data: Record<string, unknown>): Promise<ApiResponse<TokenTemplate>> {
  return delay(ok({ id: '1', name: 'Updated', tier: 'Basic' as const, businessNature: 'Restaurant' as const, validityDays: 90, limitsPayload: {}, featureMap: {}, gracePolicy: GP(7), createdAt: now(), updatedAt: now() }));
}

export function getExpiringTokens(_daysWindow: number): Promise<ApiResponse<readonly RechargeToken[]>> {
  return delay(ok(tokens.filter((t) => t.status === 'Active').slice(0, 3)));
}

export function getTokenMetrics(): Promise<ApiResponse<TokenMetrics>> {
  return delay(ok({
    totalActive: 10,
    totalExpired: 2,
    totalRevoked: 1,
    totalConsumed: 2,
    expiringWithin7Days: 1,
    expiringWithin30Days: 3,
    byTier: { Basic: 4, Standard: 4, Advance: 4, Premium: 3 },
    generatedThisMonth: 5,
    revenueThisMonth: 3750,
  }));
}

// ---------------------------------------------------------------------------
// Commission (SPA-018)
// ---------------------------------------------------------------------------

export function getCommissionDashboard(): Promise<ApiResponse<CommissionSummary>> {
  return delay(ok({
    periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
    periodEnd: now(),
    totalTransactions: 6,
    totalTransactionAmount: 105700,
    totalCommission: 2433.5,
    averageRate: 2.5,
    currency: 'SAR',
    byMerchant: [],
  }));
}

// 2026-05-17 (Pass 35): getCommissionLedger / getSettlements / approveSettlement /
// getCommissionDisputes / createDispute / resolveDispute / generateStatement removed.

export function getCommissionRates(): Promise<ApiResponse<readonly CommissionRate[]>> {
  return delay(ok<readonly CommissionRate[]>([
    { id: '1', planId: null, merchantId: null, rate: 2.5, minTransactionValue: 10, effectiveFrom: new Date(Date.now() - 365 * 86400000).toISOString(), effectiveTo: null },
  ]));
}

export function createCommissionRate(_data: Record<string, unknown>): Promise<ApiResponse<CommissionRate>> {
  return delay(ok({ id: crypto.randomUUID(), planId: null, merchantId: null, rate: 2.5, minTransactionValue: 10, effectiveFrom: now(), effectiveTo: null }));
}

export function updateCommissionRate(_id: string, _data: Record<string, unknown>): Promise<ApiResponse<CommissionRate>> {
  return delay(ok({ id: _id, planId: null, merchantId: null, rate: 2.5, minTransactionValue: 10, effectiveFrom: now(), effectiveTo: null }));
}

export function getCommissionExemptions(): Promise<ApiResponse<readonly CommissionExemption[]>> {
  return delay(ok<readonly CommissionExemption[]>([]));
}

export function createExemption(_data: Record<string, unknown>): Promise<ApiResponse<CommissionExemption>> {
  return delay(ok({ id: crypto.randomUUID(), merchantId: '', merchantName: '', reason: '', effectiveFrom: now(), effectiveTo: null, createdBy: platformUsers[0]!.id, createdAt: now() }));
}

export function removeExemption(_id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return delay(ok({ deleted: true }));
}
