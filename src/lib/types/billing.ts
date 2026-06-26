import type { MerchantType } from './common';

export type InvoiceType =
  | 'Subscription'
  | 'Usage'
  | 'TokenPurchase'
  | 'Commission'
  | 'AddOn';

export type InvoiceStatus =
  | 'Draft'
  | 'Pending'
  | 'Sent'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled'
  | 'Refunded';

/** Platform-issued invoice for a merchant. */
export interface Invoice {
  readonly id: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly merchantType: MerchantType;
  readonly type: InvoiceType;
  readonly invoiceNumber: string;
  readonly amount: number;
  readonly tax: number;
  readonly total: number;
  readonly currency: string;
  readonly status: InvoiceStatus;
  readonly issuedDate: string;
  readonly dueDate: string;
  readonly paidDate: string | null;
  readonly items: readonly InvoiceItem[];
}

/** Line item on an invoice. */
export interface InvoiceItem {
  readonly id: string;
  readonly description: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly amount: number;
  readonly taxRate: number;
  readonly taxAmount: number;
}

/** Subscription plan offered on the platform. */
export interface SubscriptionPlan {
  readonly id: string;
  readonly name: string;
  readonly tier: string;
  readonly monthlyPrice: number;
  readonly annualPrice: number;
  readonly currency: string;
  readonly features: readonly string[];
  readonly maxLocations: number;
  readonly maxTerminals: number;
  readonly isActive: boolean;
}

/** Pricing configuration for recharge tokens (Standalone model). */
export interface TokenPricing {
  readonly id: string;
  readonly tier: string;
  readonly validityDays: number;
  readonly price: number;
  readonly currency: string;
  readonly bulkDiscounts: readonly BulkDiscount[];
}

/** Volume-based discount tier for token purchases. */
export interface BulkDiscount {
  readonly minQuantity: number;
  readonly discountPercent: number;
}

/** Record of a payment transaction. */
export interface PaymentRecord {
  readonly id: string;
  readonly merchantId: string;
  readonly invoiceId: string;
  readonly amount: number;
  readonly currency: string;
  readonly method: string;
  readonly reference: string;
  readonly status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  readonly processedAt: string;
}

/** Billing cycle definition. */
export interface BillingCycle {
  readonly id: string;
  readonly merchantId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly status: 'Active' | 'Closed' | 'Pending';
  readonly invoiceId: string | null;
}

/** Request to refund a payment. */
export interface RefundRequest {
  readonly id: string;
  readonly invoiceId: string;
  readonly merchantId: string;
  readonly merchantName: string;
  readonly amount: number;
  readonly reason: string;
  readonly status: 'Pending' | 'Approved' | 'Rejected' | 'Processed';
  readonly requestedAt: string;
  readonly requestedBy: string;
  readonly processedAt: string | null;
  readonly processedBy: string | null;
}
