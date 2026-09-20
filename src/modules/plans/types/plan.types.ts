/**
 * TypeScript Interfaces & Types for the Plans Module — aligned to V3 token structure.
 * 2026-07-19: fixed 7 limit labels that were mislabelled; added Flavour; drop grace-period
 * client concepts (grace lives on the token generator default, not per-Plan).
 */

export interface PlanFeature {
  text: string;
  included: boolean;
}

/** UI-level deployment mode string (matches backend PlanType enum names). */
export type PlanType = 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud';

/**
 * Wire enum names sent to the API. UI displays the human strings above; the wire uses
 * the C# enum member names (PascalCase without spaces).
 */
export type PlanTypeWire = 'StandalonePos' | 'StandaloneCloud' | 'EnterpriseCloud';

export const PLAN_TYPE_UI_TO_WIRE: Record<PlanType, PlanTypeWire> = {
  'Standalone POS': 'StandalonePos',
  'Standalone Cloud': 'StandaloneCloud',
  'Enterprise cloud': 'EnterpriseCloud',
};

export const PLAN_TYPE_WIRE_TO_UI: Record<PlanTypeWire, PlanType> = {
  StandalonePos: 'Standalone POS',
  StandaloneCloud: 'Standalone Cloud',
  EnterpriseCloud: 'Enterprise cloud',
};

export type PlanStatus = 'Active' | 'Inactive' | 'Deprecated';

/** Merchant flavour — restaurant or retail. Only Standalone POS plans carry RES / RET; Cloud plans carry BOT (Both). */
export type Flavour = 'RES' | 'RET' | 'BOT';

export const FLAVOUR_DISPLAY: Record<Flavour, string> = {
  RES: 'Restaurant',
  RET: 'Retail',
  BOT: 'Both (Restaurant + Retail)',
};

/** 6 Advance Feature flags (ON/OFF) — matches Quantix.Foundation.Licensing.FeatureCodes.Advance. */
export interface PlanModules {
  INV: boolean; // Advance Inventory
  FIN: boolean; // Finance & Accounts
  HRM: boolean; // Human Resource Management
  MKT: boolean; // Marketing & Promotions
  ANL: boolean; // Advance Analytics & Reports
  WTM: boolean; // Waste Management (Restaurant-only)
}

/** 7 Payment channel flags — matches Quantix.Foundation.Licensing.PaymentMethodCodes. */
export interface PlanPayments {
  CSH: boolean; // Cash
  CRD: boolean; // Card
  GFT: boolean; // Gift Card
  STC: boolean; // Store Credit
  WLT: boolean; // Mobile Wallet
  EXT: boolean; // External / Manual
  CSL: boolean; // Credit Sale
}

/** 10 Service channel flags — matches Quantix.Foundation.Licensing.ServiceTypeCodes.
 *  2026-07-25: WOR (Web Order) dropped; SHP (Shipping) + INS (In-Store) added.
 *  Flavour: Restaurant-only (DIN/CTR/CTG/WRV); Retail-only (SHP/INS); others apply to both. */
export interface PlanServices {
  DIN: boolean; // Dine-In (Restaurant only)
  CTR: boolean; // Counter (Restaurant only)
  PUP: boolean; // Pickup
  DLV: boolean; // Delivery (in-house drivers)
  CTG: boolean; // Catering (Restaurant only)
  SNP: boolean; // Snap Order
  RSO: boolean; // Reseller Order (Uber Eats / DoorDash / etc.)
  SHP: boolean; // Shipping (Retail courier fulfilment)
  INS: boolean; // In-Store (Retail walk-in sale)
  WRV: boolean; // Web Reservation (Restaurant only)
}

/**
 * 16 Limit codes (0 = unlimited when the backend treats them that way).
 * Labels/codes match Quantix.Foundation.Licensing.LimitCodes exactly.
 */
export interface PlanLimits {
  MBU: number; // Max Businesses
  MLO: number; // Max Locations
  MTM: number; // Max Terminals
  MPR: number; // Max Products
  MDP: number; // Max Delivery Partners
  MKD: number; // Max Kitchen Display Helpers
  MDS: number; // Max Dispatch Station Helpers
  MIS: number; // Max Inventory Station Helpers
  MPW: number; // Max Table POS Apps (BDS / PaymentWalker companions)
  MGB: number; // Max Database Storage (GB)
  MPG: number; // Max Payment Gateways
  MRS: number; // Max Resellers (delivery-aggregator partners)
  MAC: number; // Max Cloud Admin Portal instances
  MWR: number; // Max Web Restaurant Storefronts
  MWE: number; // Max Web Retail Storefronts
  MBR: number; // Max Billing Revenue (cap)
}

export interface Plan {
  id: string;
  name: string;
  planType: PlanType;
  flavour: Flavour;
  priority: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  /** Deprecated 2026-07-19 — read MLO from planLimits instead. Kept for legacy read-side pages. */
  maxLocations?: number;
  /** Deprecated 2026-07-19 — read MTM from planLimits instead. Kept for legacy read-side pages. */
  maxTerminals?: number;
  /** Deprecated 2026-07-19 — trial period lives on token issuance now, not on Plan. Kept for legacy read-side pages. */
  trialPeriod?: number;
  features: PlanFeature[];
  planFeatures?: PlanModules;
  planPayments?: PlanPayments;
  planServices?: PlanServices;
  planLimits?: PlanLimits;
  merchantCount: number;
  status: PlanStatus;
  color: string;
  popular?: boolean;
  isManualPrice?: boolean;
  manualPrice?: number;
}

export interface CreatePlanDto {
  name: string;
  planType: PlanType;
  flavour: Flavour;
  priority: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[] | PlanFeature[];
  planFeatures?: PlanModules;
  planPayments?: PlanPayments;
  planServices?: PlanServices;
  planLimits?: PlanLimits;
  popular?: boolean;
  status?: PlanStatus;
  isManualPrice?: boolean;
  manualPrice?: number;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {
  id: string;
}

export interface PlanListParams {
  search?: string;
  status?: PlanStatus | 'all';
  planType?: PlanType | 'all';
}

// ═══════════════════════════════════════════════
//  DEFAULTS — per V3 Token Spec
// ═══════════════════════════════════════════════

// ─── Standalone POS defaults ───
export const DEFAULT_STD_MODULES: PlanModules = {
  INV: false, FIN: false, HRM: false, MKT: false, ANL: false, WTM: false,
};
export const DEFAULT_STD_PAYMENTS: PlanPayments = {
  CSH: true, CRD: true, EXT: false, GFT: false, STC: false, WLT: false, CSL: false,
};
export const DEFAULT_STD_SERVICES: PlanServices = {
  DIN: true, CTR: true, PUP: false, DLV: false, CTG: false, SNP: false, RSO: false, SHP: false, INS: false, WRV: false,
};
export const DEFAULT_STD_LIMITS: PlanLimits = {
  MBU: 1, MLO: 1, MTM: 3, MPR: 500, MDP: 1, MKD: 1, MDS: 0, MIS: 1,
  MPW: 2, MGB: 5, MPG: 2, MRS: 0, MAC: 0, MWR: 0, MWE: 0, MBR: 0,
};

// ─── Standalone Cloud defaults ───
export const DEFAULT_STDC_MODULES: PlanModules = {
  INV: true, FIN: false, HRM: true, MKT: true, ANL: false, WTM: false,
};
export const DEFAULT_STDC_PAYMENTS: PlanPayments = {
  CSH: true, CRD: true, EXT: true, GFT: false, STC: false, WLT: true, CSL: false,
};
export const DEFAULT_STDC_SERVICES: PlanServices = {
  DIN: true, CTR: true, PUP: true, DLV: false, CTG: false, SNP: false, RSO: false, SHP: true, INS: true, WRV: false,
};
export const DEFAULT_STDC_LIMITS: PlanLimits = {
  MBU: 1, MLO: 5, MTM: 10, MPR: 5000, MDP: 5, MKD: 3, MDS: 2, MIS: 3,
  MPW: 5, MGB: 20, MPG: 4, MRS: 3, MAC: 1, MWR: 1, MWE: 1, MBR: 0,
};

// ─── Enterprise Cloud defaults ───
export const DEFAULT_ENT_MODULES: PlanModules = {
  INV: true, FIN: true, HRM: true, MKT: true, ANL: true, WTM: true,
};
export const DEFAULT_ENT_PAYMENTS: PlanPayments = {
  CSH: true, CRD: true, EXT: true, GFT: true, STC: true, WLT: true, CSL: true,
};
export const DEFAULT_ENT_SERVICES: PlanServices = {
  DIN: true, CTR: true, PUP: true, DLV: true, CTG: true, SNP: true, RSO: true, SHP: true, INS: true, WRV: true,
};
export const DEFAULT_ENT_LIMITS: PlanLimits = {
  MBU: 10, MLO: 50, MTM: 100, MPR: 50000, MDP: 50, MKD: 20, MDS: 10, MIS: 20,
  MPW: 50, MGB: 200, MPG: 20, MRS: 20, MAC: 1, MWR: 5, MWE: 5, MBR: 0,
};

export const DUMMY_PLANS: Plan[] = [];
