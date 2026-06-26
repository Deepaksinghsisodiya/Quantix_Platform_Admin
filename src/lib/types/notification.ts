import type { MerchantType } from './common';

export type NotificationType =
  | 'Info'
  | 'Warning'
  | 'Error'
  | 'Success'
  | 'System'
  | 'Ticket'
  | 'Billing'
  | 'Token'
  | 'Compliance';

/** Platform notification for admin users. */
export interface Notification {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly read: boolean;
  readonly createdAt: string;
  readonly link: string | null;
  readonly merchantType: MerchantType | null;
  readonly merchantId: string | null;
}

/** User-level notification delivery preferences. */
export interface NotificationPreferences {
  readonly email: boolean;
  readonly inApp: boolean;
  readonly ticketUpdates: boolean;
  readonly billingAlerts: boolean;
  readonly tokenExpiry: boolean;
  readonly systemAlerts: boolean;
  readonly complianceAlerts: boolean;
  readonly digestFrequency: 'Realtime' | 'Hourly' | 'Daily' | 'Weekly';
}
