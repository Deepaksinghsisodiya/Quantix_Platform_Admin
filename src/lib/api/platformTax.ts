/**
 * 2026-05-17 (Pass 35 Phase F): API client for the Platform tax endpoints.
 */
import { get, post, put, del } from './client';
import type { ApiResponse } from '@/lib/types/common';
import type {
  PlatformTaxDefinition,
  PlatformTaxGroup,
  PlatformTaxAssociation,
  ResolvedTaxes,
  PlatformTaxScope,
  TaxCalculationMethod,
  TaxJurisdiction,
} from '@/lib/types/platformTax';

// ── Tax Definitions ─────────────────────────────────────────────────────────

export interface CreateTaxDefinitionInput {
  readonly taxName: string;
  readonly taxCode: string;
  readonly taxRate: number;
  readonly taxCategory: string;
  readonly isCompound: boolean;
  readonly jurisdiction: TaxJurisdiction;
  readonly calculationMethod: TaxCalculationMethod;
  readonly effectiveFromDate: string;
  readonly effectiveToDate?: string | null;
}

export interface UpdateTaxDefinitionInput {
  readonly taxName?: string;
  readonly taxRate?: number;
  readonly taxCategory?: string;
  readonly isCompound?: boolean;
  readonly jurisdiction?: TaxJurisdiction;
  readonly calculationMethod?: TaxCalculationMethod;
  readonly effectiveToDate?: string | null;
  readonly isActive?: boolean;
}

export function getTaxDefinitions(): Promise<ApiResponse<readonly PlatformTaxDefinition[]>> {
  return get<ApiResponse<readonly PlatformTaxDefinition[]>>('/api/v1/tax/definitions');
}

export function createTaxDefinition(input: CreateTaxDefinitionInput): Promise<ApiResponse<PlatformTaxDefinition>> {
  return post<ApiResponse<PlatformTaxDefinition>>('/api/v1/tax/definitions', input);
}

export function updateTaxDefinition(id: string, input: UpdateTaxDefinitionInput): Promise<ApiResponse<PlatformTaxDefinition>> {
  return put<ApiResponse<PlatformTaxDefinition>>(`/api/v1/tax/definitions/${id}`, input);
}

export function deleteTaxDefinition(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return del<ApiResponse<{ deleted: boolean }>>(`/api/v1/tax/definitions/${id}`);
}

// ── Tax Groups ──────────────────────────────────────────────────────────────

export interface CreateTaxGroupInput {
  readonly groupName: string;
  readonly groupCode: string;
  readonly description?: string | null;
  readonly isDefault: boolean;
  readonly taxDefinitionIds: readonly string[];
}

export interface UpdateTaxGroupInput {
  readonly groupName?: string;
  readonly description?: string | null;
  readonly isDefault?: boolean;
  readonly isActive?: boolean;
  readonly taxDefinitionIds?: readonly string[];
}

export function getTaxGroups(): Promise<ApiResponse<readonly PlatformTaxGroup[]>> {
  return get<ApiResponse<readonly PlatformTaxGroup[]>>('/api/v1/tax/groups');
}

export function createTaxGroup(input: CreateTaxGroupInput): Promise<ApiResponse<PlatformTaxGroup>> {
  return post<ApiResponse<PlatformTaxGroup>>('/api/v1/tax/groups', input);
}

export function updateTaxGroup(id: string, input: UpdateTaxGroupInput): Promise<ApiResponse<PlatformTaxGroup>> {
  return put<ApiResponse<PlatformTaxGroup>>(`/api/v1/tax/groups/${id}`, input);
}

export function deleteTaxGroup(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return del<ApiResponse<{ deleted: boolean }>>(`/api/v1/tax/groups/${id}`);
}

// ── Tax Associations ───────────────────────────────────────────────────────

export interface CreateTaxAssociationInput {
  readonly taxGroupId: string;
  readonly scope: PlatformTaxScope;
  readonly planId?: string | null;
  readonly merchantId?: string | null;
  readonly effectiveFromDate: string;
  readonly effectiveToDate?: string | null;
}

export interface UpdateTaxAssociationInput {
  readonly scope?: PlatformTaxScope;
  readonly effectiveToDate?: string | null;
  readonly isActive?: boolean;
}

export function getTaxAssociations(merchantId?: string, planId?: string): Promise<ApiResponse<readonly PlatformTaxAssociation[]>> {
  const params: Record<string, string> = {};
  if (merchantId) params['merchantId'] = merchantId;
  if (planId) params['planId'] = planId;
  return get<ApiResponse<readonly PlatformTaxAssociation[]>>('/api/v1/tax/associations', params);
}

export function createTaxAssociation(input: CreateTaxAssociationInput): Promise<ApiResponse<PlatformTaxAssociation>> {
  return post<ApiResponse<PlatformTaxAssociation>>('/api/v1/tax/associations', input);
}

export function updateTaxAssociation(id: string, input: UpdateTaxAssociationInput): Promise<ApiResponse<PlatformTaxAssociation>> {
  return put<ApiResponse<PlatformTaxAssociation>>(`/api/v1/tax/associations/${id}`, input);
}

export function deleteTaxAssociation(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
  return del<ApiResponse<{ deleted: boolean }>>(`/api/v1/tax/associations/${id}`);
}

// ── Resolution preview ─────────────────────────────────────────────────────

export function resolveTaxesForMerchant(merchantId: string, scope: PlatformTaxScope = 'Both'): Promise<ApiResponse<ResolvedTaxes>> {
  return get<ApiResponse<ResolvedTaxes>>(`/api/v1/tax/resolve/merchant/${merchantId}`, { scope });
}
