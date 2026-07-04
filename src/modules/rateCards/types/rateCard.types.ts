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

  servicePrices: {
    DIN: number;
    CTR: number;
    PUP: number;
    DLV: number;
    CTG: number;
    SNP: number;
    RSO: number;
    WOR: number;
    WRV: number;
  };

  // Limit prices per unit
  limitPrices: {
    MBU: number; // per Business Unit
    MLO: number; // per Location
    MTM: number; // per POS Terminal
    MPR: number; // per 100 products
    MPG: number; // per 5 product groups
    MGB: number; // per GB storage
    OTH: number; // per other limit items
  };
}
