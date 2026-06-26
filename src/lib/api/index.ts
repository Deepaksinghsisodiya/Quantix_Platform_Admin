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
export * as merchantsApi from './merchants';
export * as billingApi from './billing';
export * as reportsApi from './reports';
export * as settingsApi from './settings';
export * as helpdeskApi from './helpdesk';
export * as complianceApi from './compliance';
export * as contentApi from './content';
export * as contactsApi from './contacts';
export * as signupsApi from './signups';
export * as auditApi from './audit';
export * as tokensApi from './tokens';
export * as commissionApi from './commission';
