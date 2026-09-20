export interface RateCard {
  id: string;
  name: string;
  isDefault: boolean;
  baseDailyPrice: number;
  baseWeeklyPrice: number;
  baseMonthlyPrice: number;
  baseYearlyPrice: number;

  // Feature Increments (Monthly rates)
  modulePrices: {
    INV: number; // Inventory Management
    FIN: number; // Finance / Accounting
    HRM: number; // HR & Staff Management
    MKT: number; // Marketing & Loyalty
    ANL: number; // Analytics & Reports
    WTM: number; // Workforce / Table-Turn
  };

  paymentPrices: {
    CSH: number;
    CRD: number;
    EXT: number;
    GFT: number;
    STC: number;
    WLT: number;
    CSL: number;
  };

  // 2026-07-25: WOR (Web Order) dropped; SHP (Shipping) + INS (In-Store) added.
  // Total 10 codes matching Quantix.Foundation.Licensing.ServiceTypeCodes.
  servicePrices: {
    DIN: number; // Dine-In (Restaurant only)
    CTR: number; // Counter (Restaurant only)
    PUP: number;
    DLV: number;
    CTG: number; // Catering (Restaurant only)
    SNP: number;
    RSO: number;
    SHP: number; // Shipping (Retail only)
    INS: number; // In-Store (Retail only)
    WRV: number; // Web Reservation (Restaurant only)
  };

  /**
   * Per-unit prices for all 16 canonical limit codes — matches Quantix.Foundation.Licensing.LimitCodes.
   * 2026-07-19: expanded from 7 → 16 codes; dropped bogus OTH; fixed MPG (Max Payment Gateways).
   */
  limitPrices: {
    MBU: number; // per Max Business
    MLO: number; // per Max Location
    MTM: number; // per Max Terminal
    MPR: number; // per 100 Max Products above baseline
    MDP: number; // per Max Delivery Partner
    MKD: number; // per Max Kitchen Display Helper
    MDS: number; // per Max Dispatch Station Helper
    MIS: number; // per Max Inventory Station Helper
    MPW: number; // per Max Table POS App
    MGB: number; // per GB Max Database Storage above baseline
    MPG: number; // per Max Payment Gateway
    MRS: number; // per Max Reseller
    MAC: number; // per Max Cloud Admin Portal instance
    MWR: number; // per Max Web Restaurant storefront
    MWE: number; // per Max Web Retail storefront
    MBR: number; // per unit of Max Billing Revenue cap (usually 0 — hard cap, not billed)
  };
}
