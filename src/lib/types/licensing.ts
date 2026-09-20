/**
 * Human-readable labels for the Foundation.Licensing catalogs — 2026-08-29.
 * Mirrors `Quantix.Foundation.Licensing.LimitCodes` / `FeatureCodes` (V3 token schema).
 * Used to render token payloads in plain language on the Generate result and detail pages.
 */

/** The 16 canonical limit codes (LimitCodes.All order). */
export const LIMIT_LABELS: Record<string, string> = {
  MBU: 'Max Businesses',
  MLO: 'Max Locations',
  MTM: 'Max Terminals',
  MPR: 'Max Products',
  MDP: 'Max Delivery Partners',
  MKD: 'Max Kitchen Displays (KDS)',
  MDS: 'Max Dispatch Stations',
  MIS: 'Max Inventory Stations',
  MPW: 'Max Table POS Apps',
  MGB: 'Max Database Storage (GB)',
  MPG: 'Max Payment Gateways',
  MRS: 'Max Delivery Aggregators',
  MAC: 'Max Cloud Admin Portals',
  MWR: 'Max Web Restaurant Stores',
  MWE: 'Max Web Retail Stores',
  MBR: 'Billing Revenue Cap',
};

export const FEATURE_LABELS: Record<string, string> = {
  ORD: 'Order Entry',
  PAY: 'Payment Processing',
  CSD: 'Cash Drawer',
  RCP: 'Receipt Printing',
  DRC: 'Digital Receipts',
  CUS: 'Customer Management',
  PRD: 'Product Catalog',
  BRP: 'Basic Reporting',
  DIS: 'Basic Discounts',
  TAX: 'Tax Calculation',
  REF: 'Refunds & Voids',
  DCL: 'Day Close',
  OPL: 'Operator Login',
  TBL: 'Table Management',
  MNU: 'Menu Management',
  CRS: 'Course Management',
  SPL: 'Split Bill',
  TIP: 'Tip Handling',
  BCD: 'Barcode Scanning',
  QIL: 'Quick Item Lookup',
  VAR: 'Product Variants',
  UOM: 'Multi-Unit Pricing',
  RTN: 'Returns Management',
  INV: 'Advanced Inventory',
  FIN: 'Finance & Accounts',
  HRM: 'HR Management',
  MKT: 'Marketing & Promotions',
  ANL: 'Advanced Analytics',
  WTM: 'Waste Management',
  CTS: 'Catering Service',
};

/** Token flavour codes (V4): terminal type for bound tokens, BOT for cloud. */
export const FLAVOUR_LABELS: Record<string, string> = {
  RES: 'Restaurant',
  RET: 'Retail',
  INV: 'Inventory Terminal',
  BOT: 'Cloud (all features)',
};

/** Mirror of Foundation ServiceTypeCodes display names. */
export const SERVICE_LABELS: Record<string, string> = {
  DIN: 'Dine-In',
  CTR: 'Counter',
  PUP: 'Pickup',
  DLV: 'Delivery',
  CTG: 'Catering',
  SNP: 'Snap Order',
  RSO: 'Reseller Order',
  SHP: 'Shipping',
  INS: 'In-Store',
  WRV: 'Web Reservation',
};

/** Mirror of Foundation PaymentMethodCodes display names. */
export const PAYMENT_LABELS: Record<string, string> = {
  CSH: 'Cash',
  CRD: 'Card',
  GFT: 'Gift Card',
  STC: 'Store Credit',
  WLT: 'Wallet',
  EXT: 'External',
  CSL: 'Credit Sale',
};

export const serviceLabel = (code: string): string => SERVICE_LABELS[code] ?? code;
export const paymentLabel = (code: string): string => PAYMENT_LABELS[code] ?? code;

/** Grace phase keys as serialized in the token's GracePolicyDays JSON. */
export const GRACE_LABELS: Record<string, string> = {
  Warning: 'Warning phase',
  Degraded: 'Degraded phase',
  Restricted: 'Restricted phase',
  Suspended: 'Suspended after',
};

export const limitLabel = (code: string): string => LIMIT_LABELS[code] ?? code;
export const featureLabel = (code: string): string => FEATURE_LABELS[code] ?? code;

/** MBR uses 0 = unlimited; every other limit shows its raw count. */
export const limitValueText = (code: string, value: number): string =>
  code === 'MBR' && value === 0 ? 'Unlimited' : String(value);
