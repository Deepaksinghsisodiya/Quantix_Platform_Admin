/**
 * Quantix Platform Admin API — barrel export.
 */

export { ApiError } from './client';
export type { QueryParams } from './client';
export { get, post, put, patch, del } from './client';

export type { ApiListResponse, ApiErrorBody } from './types';

export * as dashboardApi from './dashboard';
export * as usersApi from './users';
export * as registrationApi from './registration';
export * as walletApi from './wallet';
// 2026-08-30: merchantsApi removed — every function in the axios layer was unconsumed
// (incl. the 410-Gone change-tier call); merchant calls live in
// modules/merchants/services/merchantApi (RTK).
export * as billingApi from './billing';
// 2026-09-04: `./reports` REMOVED — it mirrored routes this API never served (/reports/usage,
// /reports/tokens, /reports/definitions, /reports/{id}/export) and the custom-report query.
// The real report slice is modules/reports/services/reportsApi; export is useReportExport().
export * as settingsApi from './settings';
export * as helpdeskApi from './helpdesk';
export * as contentApi from './content';
export * as contactsApi from './contacts';
export * as signupsApi from './signups';
export * as auditApi from './audit';
// 2026-08-29: tokensApi removed — the legacy REST layer carried the fictional tier→plan
// mapping; token calls live in modules/tokens/services/tokenApi (RTK).
export * as commissionApi from './commission';
