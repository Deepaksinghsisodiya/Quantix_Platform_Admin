/**
 * TypeScript Interfaces & Types for the Plans Module
 * Based on Quantix POS V3.5 Token Spec
 */

export interface PlanFeature {
  text: string;
  included: boolean;
}

export type PlanType = 'Standalone POS' | 'Standalone Cloud' | 'Enterprise cloud';
export type PlanStatus = 'Active' | 'Inactive' | 'Deprecated';

/** 6 Advance Feature flags (ON/OFF) */
export interface PlanModules {
  INV: boolean; // Inventory Management
  FIN: boolean; // Finance / Accounting
  HRM: boolean; // HR & Staff Management
  MKT: boolean; // Marketing & Loyalty Campaigns
  ANL: boolean; // Advanced Analytics & Reports
  WTM: boolean; // Workforce / Table-Turn Management
}

/** 7 Payment channel flags */
export interface PlanPayments {
  CSH: boolean; // Cash
  CRD: boolean; // Card (POS/EDC)
  EXT: boolean; // External gateway (UPI etc.)
  GFT: boolean; // Gift Card
  STC: boolean; // Store Credit
  WLT: boolean; // In-app Wallet
  CSL: boolean; // Credit Sale / Ledger (pay-later)
}

/** 9 Service channel flags */
export interface PlanServices {
  DIN: boolean; // Dine-in
  CTR: boolean; // Counter / Takeaway
  PUP: boolean; // Pickup
  DLV: boolean; // Delivery
  CTG: boolean; // Catering / Bulk Orders
  SNP: boolean; // Snap Order (QR / quick self-order)
  RSO: boolean; // Reservation / Scheduled Order
  WOR: boolean; // Web Ordering (online storefront)
  WRV: boolean; // Waitlist / Reservation management
}

/** 16 Limit codes (0 = unlimited) */
export interface PlanLimits {
  MBU: number; // Max Business Units
  MLO: number; // Max Locations / Outlets
  MTM: number; // Max Terminals
  MPR: number; // Max Products (catalog size)
  MPG: number; // Max Product Groups / Categories
  MGB: number; // Max Storage (GB)
  MDP: number; // Max Delivery Partners
  MKD: number; // Max KDS (Kitchen Display Screens)
  MDS: number; // Max Dine-in Sections / Floors
  MIS: number; // Max Integration Slots
  MPW: number; // Max Payment Gateways
  MRS: number; // Max Reservation Slots/day
  MAC: number; // Max Active Campaigns
  MWR: number; // Max Warehouses
  MWE: number; // Max Web/Employee logins
  MBR: number; // Max Branches
}

export interface Plan {
  id: string;
  name: string;
  planType: PlanType;
  priority: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  trialPeriod: number;
  maxLocations: number;
  maxTerminals: number;
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
  priority: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  trialPeriod: number;
  maxLocations: number;
  maxTerminals: number;
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
//  DEFAULTS — per V3.5 Token Spec
// ═══════════════════════════════════════════════

// ─── Enterprise Defaults (Basic tier) ───
export const DEFAULT_ENT_MODULES: PlanModules = {
  INV: true, FIN: false, HRM: false, MKT: false, ANL: false, WTM: false,
};
export const DEFAULT_ENT_PAYMENTS: PlanPayments = {
  CSH: true, CRD: true, EXT: true, GFT: false, STC: false, WLT: false, CSL: false,
};
export const DEFAULT_ENT_SERVICES: PlanServices = {
  DIN: true, CTR: true, PUP: true, DLV: false, CTG: false, SNP: false, RSO: false, WOR: false, WRV: false,
};
export const DEFAULT_ENT_LIMITS: PlanLimits = {
  MBU: 1, MLO: 3, MTM: 6, MPR: 5000, MPG: 50, MGB: 10,
  MDP: 1, MKD: 2, MDS: 4, MIS: 3, MPW: 2, MRS: 100,
  MAC: 5, MWR: 1, MWE: 30, MBR: 3,
};

// ─── Standalone Defaults (Basic tier) ───
export const DEFAULT_STD_MODULES: PlanModules = {
  INV: false, FIN: false, HRM: false, MKT: false, ANL: false, WTM: false,
};
export const DEFAULT_STD_PAYMENTS: PlanPayments = {
  CSH: true, CRD: true, EXT: true, GFT: false, STC: false, WLT: false, CSL: false,
};
export const DEFAULT_STD_SERVICES: PlanServices = {
  DIN: true, CTR: true, PUP: true, DLV: false, CTG: false, SNP: false, RSO: false, WOR: false, WRV: false,
};
export const DEFAULT_STD_LIMITS: PlanLimits = {
  MBU: 1, MLO: 1, MTM: 2, MPR: 500, MPG: 15, MGB: 2,
  MDP: 0, MKD: 1, MDS: 2, MIS: 1, MPW: 1, MRS: 0,
  MAC: 0, MWR: 0, MWE: 8, MBR: 1,
};

export const DUMMY_PLANS: Plan[] = [
  // ─── ENTERPRISE CLOUD: Basic ───
  {
    id: '1',
    name: 'Enterprise Basic',
    planType: 'Enterprise cloud',
    priority: 1,
    dailyPrice: 2,
    weeklyPrice: 12,
    monthlyPrice: 49,
    yearlyPrice: 490,
    trialPeriod: 14,
    maxLocations: 3,
    maxTerminals: 6,
    features: [
      { text: 'Up to 3 Outlets', included: true },
      { text: '6 POS Terminals', included: true },
      { text: 'Inventory Management', included: true },
      { text: 'Multi-Store Sync', included: false },
      { text: 'Advanced Analytics', included: false },
    ],
    planFeatures: { INV: true, FIN: false, HRM: false, MKT: false, ANL: false, WTM: false },
    planPayments: { CSH: true, CRD: true, EXT: true, GFT: false, STC: false, WLT: false, CSL: false },
    planServices: { DIN: true, CTR: true, PUP: true, DLV: false, CTG: false, SNP: false, RSO: false, WOR: false, WRV: false },
    planLimits: { MBU: 1, MLO: 3, MTM: 6, MPR: 5000, MPG: 50, MGB: 10, MDP: 1, MKD: 2, MDS: 4, MIS: 3, MPW: 2, MRS: 100, MAC: 5, MWR: 1, MWE: 30, MBR: 3 },
    merchantCount: 42,
    status: 'Active',
    color: '#3b82f6',
    popular: false,
  },
  // ─── ENTERPRISE CLOUD: Pro ───
  {
    id: '2',
    name: 'Enterprise Pro',
    planType: 'Enterprise cloud',
    priority: 2,
    dailyPrice: 5,
    weeklyPrice: 30,
    monthlyPrice: 129,
    yearlyPrice: 1290,
    trialPeriod: 14,
    maxLocations: 10,
    maxTerminals: 25,
    features: [
      { text: 'Up to 10 Outlets', included: true },
      { text: '25 POS Terminals', included: true },
      { text: 'Finance & HR Module', included: true },
      { text: 'Advanced Analytics & AI', included: true },
      { text: '24/7 Priority Support', included: true },
    ],
    planFeatures: { INV: true, FIN: true, HRM: true, MKT: true, ANL: true, WTM: false },
    planPayments: { CSH: true, CRD: true, EXT: true, GFT: true, STC: true, WLT: true, CSL: false },
    planServices: { DIN: true, CTR: true, PUP: true, DLV: true, CTG: true, SNP: true, RSO: false, WOR: true, WRV: false },
    planLimits: { MBU: 3, MLO: 10, MTM: 25, MPR: 20000, MPG: 150, MGB: 50, MDP: 3, MKD: 5, MDS: 10, MIS: 10, MPW: 4, MRS: 500, MAC: 20, MWR: 3, MWE: 150, MBR: 10 },
    merchantCount: 128,
    status: 'Active',
    color: '#8b5cf6',
    popular: true,
  },
  // ─── ENTERPRISE CLOUD: Enterprise (Unlimited) ───
  {
    id: '3',
    name: 'Enterprise Unlimited',
    planType: 'Enterprise cloud',
    priority: 3,
    dailyPrice: 12,
    weeklyPrice: 70,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    trialPeriod: 30,
    maxLocations: 0,
    maxTerminals: 0,
    features: [
      { text: 'Unlimited Outlets & Terminals', included: true },
      { text: 'All Modules Included', included: true },
      { text: 'Dedicated Account Manager', included: true },
      { text: 'White-label Branding', included: true },
      { text: 'Custom SLA & Direct DB Access', included: true },
    ],
    planFeatures: { INV: true, FIN: true, HRM: true, MKT: true, ANL: true, WTM: true },
    planPayments: { CSH: true, CRD: true, EXT: true, GFT: true, STC: true, WLT: true, CSL: true },
    planServices: { DIN: true, CTR: true, PUP: true, DLV: true, CTG: true, SNP: true, RSO: true, WOR: true, WRV: true },
    planLimits: { MBU: 0, MLO: 0, MTM: 0, MPR: 0, MPG: 0, MGB: 0, MDP: 0, MKD: 0, MDS: 0, MIS: 0, MPW: 0, MRS: 0, MAC: 0, MWR: 0, MWE: 0, MBR: 0 },
    merchantCount: 65,
    status: 'Active',
    color: '#ec4899',
    popular: false,
  },
  // ─── STANDALONE POS: Trial ───
  {
    id: '4',
    name: 'Standalone Trial',
    planType: 'Standalone POS',
    priority: 1,
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    trialPeriod: 14,
    maxLocations: 1,
    maxTerminals: 1,
    features: [
      { text: 'Single Outlet, 1 Terminal', included: true },
      { text: 'Cash & Card Payments', included: true },
      { text: '14-day Free Trial', included: true },
      { text: 'Inventory Module', included: false },
    ],
    planFeatures: { INV: false, FIN: false, HRM: false, MKT: false, ANL: false, WTM: false },
    planPayments: { CSH: true, CRD: true, EXT: false, GFT: false, STC: false, WLT: false, CSL: false },
    planServices: { DIN: true, CTR: true, PUP: false, DLV: false, CTG: false, SNP: false, RSO: false, WOR: false, WRV: false },
    planLimits: { MBU: 1, MLO: 1, MTM: 1, MPR: 100, MPG: 5, MGB: 1, MDP: 0, MKD: 0, MDS: 1, MIS: 0, MPW: 1, MRS: 0, MAC: 0, MWR: 0, MWE: 3, MBR: 1 },
    merchantCount: 210,
    status: 'Active',
    color: '#14b8a6',
    popular: false,
  },
  // ─── STANDALONE POS: Basic ───
  {
    id: '5',
    name: 'Standalone Basic',
    planType: 'Standalone POS',
    priority: 2,
    dailyPrice: 1,
    weeklyPrice: 7,
    monthlyPrice: 29,
    yearlyPrice: 290,
    trialPeriod: 7,
    maxLocations: 1,
    maxTerminals: 2,
    features: [
      { text: 'Single Outlet, 2 Terminals', included: true },
      { text: 'UPI / QR Payments', included: true },
      { text: 'Barcode & QR Scanner', included: true },
      { text: 'Pickup Orders', included: true },
    ],
    planFeatures: { INV: false, FIN: false, HRM: false, MKT: false, ANL: false, WTM: false },
    planPayments: { CSH: true, CRD: true, EXT: true, GFT: false, STC: false, WLT: false, CSL: false },
    planServices: { DIN: true, CTR: true, PUP: true, DLV: false, CTG: false, SNP: false, RSO: false, WOR: false, WRV: false },
    planLimits: { MBU: 1, MLO: 1, MTM: 2, MPR: 500, MPG: 15, MGB: 2, MDP: 0, MKD: 1, MDS: 2, MIS: 1, MPW: 1, MRS: 0, MAC: 0, MWR: 0, MWE: 8, MBR: 1 },
    merchantCount: 89,
    status: 'Active',
    color: '#10b981',
    popular: false,
  },
  // ─── STANDALONE POS: Pro ───
  {
    id: '6',
    name: 'Standalone Pro',
    planType: 'Standalone POS',
    priority: 3,
    dailyPrice: 3,
    weeklyPrice: 18,
    monthlyPrice: 69,
    yearlyPrice: 690,
    trialPeriod: 14,
    maxLocations: 1,
    maxTerminals: 3,
    features: [
      { text: 'Single Outlet, 3 Terminals', included: true },
      { text: 'Inventory, HR & Marketing', included: true },
      { text: 'Gift Card & Store Credit', included: true },
      { text: 'QR Self-Order & Delivery', included: true },
      { text: 'Kitchen Display Support', included: true },
    ],
    planFeatures: { INV: true, FIN: false, HRM: true, MKT: true, ANL: false, WTM: false },
    planPayments: { CSH: true, CRD: true, EXT: true, GFT: true, STC: true, WLT: false, CSL: false },
    planServices: { DIN: true, CTR: true, PUP: true, DLV: true, CTG: false, SNP: true, RSO: false, WOR: false, WRV: false },
    planLimits: { MBU: 1, MLO: 1, MTM: 3, MPR: 2000, MPG: 30, MGB: 5, MDP: 0, MKD: 2, MDS: 4, MIS: 3, MPW: 2, MRS: 50, MAC: 3, MWR: 0, MWE: 20, MBR: 1 },
    merchantCount: 112,
    status: 'Active',
    color: '#f59e0b',
    popular: true,
  },
  // ─── CUSTOM: Custom Plan ───
  {
    id: '7',
    name: 'Custom Plan',
    planType: 'Enterprise cloud',
    priority: 4,
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    trialPeriod: 30,
    maxLocations: 1,
    maxTerminals: 1,
    features: [
      { text: 'Custom Setup & Licensing', included: true },
      { text: 'Bespoke Feature Selection', included: true },
      { text: 'Dedicated Operations SLA', included: true },
    ],
    planFeatures: { INV: false, FIN: false, HRM: false, MKT: false, ANL: false, WTM: false },
    planPayments: { CSH: true, CRD: true, EXT: true, GFT: false, STC: false, WLT: false, CSL: false },
    planServices: { DIN: true, CTR: true, PUP: false, DLV: false, CTG: false, SNP: false, RSO: false, WOR: false, WRV: false },
    planLimits: { MBU: 1, MLO: 1, MTM: 1, MPR: 1000, MPG: 1, MGB: 1, MDP: 0, MKD: 0, MDS: 0, MIS: 0, MPW: 0, MRS: 0, MAC: 0, MWR: 0, MWE: 0, MBR: 0 },
    merchantCount: 0,
    status: 'Active',
    color: '#6366f1',
    popular: false,
  },
];

