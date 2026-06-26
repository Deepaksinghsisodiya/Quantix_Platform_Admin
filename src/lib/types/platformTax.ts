/**
 * 2026-05-17 (Pass 35 Phase F): TS shape of PlatformTaxDefinition / Group / Association.
 * Mirrors the backend Foundation enums TaxCalculationMethod, TaxJurisdiction, PlatformTaxScope.
 */

export type TaxCalculationMethod = 'Inclusive' | 'Exclusive';
export type TaxJurisdiction = 'Federal' | 'State' | 'County' | 'City';
export type PlatformTaxScope = 'Commission' | 'Subscription' | 'Both';

export interface PlatformTaxDefinition {
  readonly taxDefinitionId: string;
  readonly taxName: string;
  readonly taxCode: string;
  readonly taxRate: number;
  readonly taxCategory: string;
  readonly isCompound: boolean;
  readonly jurisdiction: TaxJurisdiction;
  readonly calculationMethod: TaxCalculationMethod;
  readonly effectiveFromDate: string;
  readonly effectiveToDate: string | null;
  readonly isActive: boolean;
}

export interface PlatformTaxGroup {
  readonly taxGroupId: string;
  readonly groupName: string;
  readonly groupCode: string;
  readonly description: string | null;
  readonly isDefault: boolean;
  readonly isActive: boolean;
  readonly taxes: readonly PlatformTaxDefinition[];
}

export interface PlatformTaxAssociation {
  readonly associationId: string;
  readonly taxGroupId: string;
  readonly taxGroupName: string | null;
  readonly scope: PlatformTaxScope;
  readonly planId: string | null;
  readonly planName: string | null;
  readonly merchantId: string | null;
  readonly merchantName: string | null;
  readonly effectiveFromDate: string;
  readonly effectiveToDate: string | null;
  readonly isActive: boolean;
}

export interface ResolvedTaxes {
  readonly merchantId: string;
  readonly scope: PlatformTaxScope;
  readonly resolutionSource: 'MerchantOverride' | 'Plan' | 'Default' | 'None';
  readonly taxGroups: readonly PlatformTaxGroup[];
}
