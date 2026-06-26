/**
 * Platform terminal registry + pairing-code provisioning.
 * 2026-05-16 (Pass 34): Standalone Local-Only merchants get their terminals tracked
 * here at Platform-level (no Cloud Merchant API to host them). Mirror of the Cloud
 * Admin Portal pairing flow.
 */
import { get, post, put, del } from './client';
import type { ApiResponse } from './types';

export interface MerchantTerminal {
  terminalId: string;
  merchantId: string;
  terminalCode: string;
  terminalName: string;
  terminalType: string | null;
  isRegistered: boolean;
  registeredAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface CreateMerchantTerminalDto {
  merchantId: string;
  terminalCode: string;
  terminalName: string;
  terminalType?: string;
}

export interface UpdateMerchantTerminalDto {
  terminalCode: string;
  terminalName: string;
  terminalType?: string;
}

export interface PlatformPairingCode {
  code: string;
  expiresAt: string;
  terminalId: string;
  terminalName: string;
  merchantId: string;
}

export function getTerminalsByMerchant(merchantId: string): Promise<ApiResponse<MerchantTerminal[]>> {
  return get<ApiResponse<MerchantTerminal[]>>(`/api/v1/terminals/by-merchant/${merchantId}`);
}

export function createTerminal(dto: CreateMerchantTerminalDto): Promise<ApiResponse<MerchantTerminal>> {
  return post<ApiResponse<MerchantTerminal>>('/api/v1/terminals', dto);
}

export function updateTerminal(
  terminalId: string,
  dto: UpdateMerchantTerminalDto,
): Promise<ApiResponse<MerchantTerminal>> {
  return put<ApiResponse<MerchantTerminal>>(`/api/v1/terminals/${terminalId}`, dto);
}

export function deactivateTerminal(terminalId: string): Promise<void> {
  return del<void>(`/api/v1/terminals/${terminalId}`);
}

export function issuePairingCode(
  terminalId: string,
  ttlHours: number = 24,
): Promise<ApiResponse<PlatformPairingCode>> {
  return post<ApiResponse<PlatformPairingCode>>(
    `/api/v1/terminals/${terminalId}/issue-pairing-code`,
    { ttlHours },
  );
}
