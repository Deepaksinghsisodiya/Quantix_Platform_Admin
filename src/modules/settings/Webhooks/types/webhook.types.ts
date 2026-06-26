import { ApiResponse } from '@/lib/types/common';

export interface WebhookSubscription {
  subscriptionId: string;
  eventType: string;
  webhookUrl: string;
  isActive: boolean;
  description: string | null;
  createdBy: string;
  createdAt: string;
}

export interface WebhookSubscriptionWithSecret extends WebhookSubscription {
  secret: string;
}

export interface CreateWebhookSubscriptionPayload {
  eventType: string;
  webhookUrl: string;
  secret?: string;
  description?: string;
}

export interface UpdateWebhookSubscriptionPayload {
  eventType?: string;
  webhookUrl?: string;
  isActive?: boolean;
  description?: string;
}

export interface WebhookDeliveryLog {
  deliveryId: string;
  subscriptionId: string;
  eventType: string;
  webhookUrl: string;
  attemptCount: number;
  maxAttempts: number;
  status: string;
  httpStatusCode: number | null;
  deliveredAt: string | null;
  nextRetryAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}
