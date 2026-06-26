/**
 * Pass 40 (2026-05-24) â€” Merchant self-service API client.
 *
 * All endpoints under /api/v1/merchant-self/* are scoped server-side by the
 * `merchant_id` JWT claim. Path parameters carry only sub-resource ids; the
 * acting merchant is derived from the token.
 */

import { get, patch, post } from './client';
import type { ApiResponse } from '@/lib/types/common';

// ────────────────────────────────────────────────────────────────────────────
// Profile
// ────────────────────────────────────────────────────────────────────────────

export interface MerchantSelfProfile {
  readonly merchantId: string;
  readonly merchantCode: string | null;
  readonly companyName: string;
  readonly displayName: string | null;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone: string | null;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly state: string | null;
  readonly postalCode: string | null;
  readonly country: string;
  readonly merchantType: 'Standalone' | 'Enterprise';
  readonly merchantStatus: string;
  readonly businessNature: string | null;
  readonly preferredPaymentMethod: string | null;
  readonly activatedAt: string | null;
}

export interface MerchantSelfProfileUpdate {
  readonly displayName?: string | null;
  readonly contactName?: string | null;
  readonly contactPhone?: string | null;
  readonly addressLine1?: string | null;
  readonly addressLine2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly postalCode?: string | null;
}

export const merchantSelf = {
  getProfile: () =>
    get<ApiResponse<MerchantSelfProfile>>('/api/v1/merchant-self/profile'),
  updateProfile: (dto: MerchantSelfProfileUpdate) =>
    patch<ApiResponse<MerchantSelfProfile>>('/api/v1/merchant-self/profile', dto),

  // ── Wallet (Enterprise only) ──
  getWallet: () => get<ApiResponse<unknown>>('/api/v1/merchant-self/wallet'),
  getWalletTransactions: (fromDate?: string, toDate?: string, page = 1, pageSize = 50) => {
    const params = new URLSearchParams();
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return get<ApiResponse<unknown>>(`/api/v1/merchant-self/wallet/transactions?${params}`);
  },
  rechargeWallet: (dto: {
    tokenAmount: number;
    currencyAmount: number;
    currencyCode: string;
    paymentToken: string;
    description?: string;
  }) => post<ApiResponse<unknown>>('/api/v1/merchant-self/wallet/recharge', dto),

  // ── Tokens (both types) ──
  getTokens: (status?: string) => {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return get<ApiResponse<unknown>>(`/api/v1/merchant-self/tokens${params}`);
  },
  getTokenDetail: (tokenId: string) =>
    get<ApiResponse<unknown>>(`/api/v1/merchant-self/tokens/${tokenId}`),
  purchaseToken: (dto: {
    validityDays: number;
    currencyAmount: number;
    currencyCode: string;
    paymentToken: string;
  }) => post<ApiResponse<unknown>>('/api/v1/merchant-self/tokens/purchase', dto),

  // ── Invoices + Payments (both types) ──
  getInvoices: (page = 1, pageSize = 20) =>
    get<ApiResponse<unknown>>(`/api/v1/merchant-self/invoices?page=${page}&pageSize=${pageSize}`),
  getInvoice: (id: string) =>
    get<ApiResponse<unknown>>(`/api/v1/merchant-self/invoices/${id}`),
  downloadInvoice: (id: string) =>
    get<ApiResponse<unknown>>(`/api/v1/merchant-self/invoices/${id}/download`),
  getPayments: () => get<ApiResponse<unknown>>('/api/v1/merchant-self/payments'),

  // ── Subscription / Commission / Revenue (Enterprise only) ──
  getSubscription: () => get<ApiResponse<unknown>>('/api/v1/merchant-self/subscription'),
  getSubscriptionHistory: () =>
    get<ApiResponse<unknown>>('/api/v1/merchant-self/subscription/history'),
  getCommission: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    return get<ApiResponse<unknown>>(`/api/v1/merchant-self/commission?${params}`);
  },
  getRevenueReport: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    return get<ApiResponse<unknown>>(`/api/v1/merchant-self/revenue-report?${params}`);
  },

  // ── Downloads (both types) ──
  getDownloads: () => get<ApiResponse<unknown>>('/api/v1/merchant-self/downloads'),
  getDownloadUrl: (packageId: string) =>
    get<ApiResponse<{ downloadUrl: string }>>(
      `/api/v1/merchant-self/downloads/${packageId}/url`,
    ),
};

// ────────────────────────────────────────────────────────────────────────────
// Change-password (first-login forced rotation; works for any role)
// ────────────────────────────────────────────────────────────────────────────

export interface ChangePasswordDto {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export function changePassword(dto: ChangePasswordDto) {
  // Server overrides userId from the JWT sub claim, so we send just current + new.
  return post<ApiResponse<string>>('/api/v1/auth/me/password', {
    userId: '00000000-0000-0000-0000-000000000000',
    ...dto,
  });
}
