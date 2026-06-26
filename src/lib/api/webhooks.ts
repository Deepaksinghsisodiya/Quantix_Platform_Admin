/**
 * Round_16 Pass 4 audit H-8: WebhooksController API client.
 *
 * Mirrors `Quantix.PlatformApi.Controllers.v1.Admin.WebhooksController` 1:1.
 */

import { get, post, put, del, type ApiResponse } from './client';

export interface WebhookSubscription {
  readonly subscriptionId: string;
  readonly eventType: string;
  readonly webhookUrl: string;
  readonly isActive: boolean;
  readonly description: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
}

export interface WebhookSubscriptionWithSecret extends WebhookSubscription {
  /** Returned only at create / rotate-secret time. */
  readonly secret: string;
}

export interface CreateWebhookSubscriptionPayload {
  readonly eventType: string;
  readonly webhookUrl: string;
  readonly secret?: string;
  readonly description?: string;
}

export interface UpdateWebhookSubscriptionPayload {
  readonly eventType?: string;
  readonly webhookUrl?: string;
  readonly isActive?: boolean;
  readonly description?: string;
}

export interface WebhookDeliveryLog {
  readonly deliveryId: string;
  readonly subscriptionId: string;
  readonly eventType: string;
  readonly webhookUrl: string;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly status: string;
  readonly httpStatusCode: number | null;
  readonly deliveredAt: string | null;
  readonly nextRetryAt: string | null;
  readonly errorMessage: string | null;
  readonly createdAt: string;
}

const BASE = '/api/v1/webhooks';

export async function getSubscriptions(activeOnly?: boolean): Promise<readonly WebhookSubscription[]> {
  const params = activeOnly === undefined ? undefined : { activeOnly };
  const res = await get<ApiResponse<readonly WebhookSubscription[]>>(`${BASE}/subscriptions`, params);
  return res.data ?? [];
}

export async function createSubscription(
  payload: CreateWebhookSubscriptionPayload,
): Promise<WebhookSubscriptionWithSecret> {
  const res = await post<ApiResponse<WebhookSubscriptionWithSecret>>(
    `${BASE}/subscriptions`,
    payload,
  );
  return res.data!;
}

export async function updateSubscription(
  id: string,
  payload: UpdateWebhookSubscriptionPayload,
): Promise<WebhookSubscription> {
  const res = await put<ApiResponse<WebhookSubscription>>(
    `${BASE}/subscriptions/${id}`,
    payload,
  );
  return res.data!;
}

export async function deleteSubscription(id: string): Promise<void> {
  await del<void>(`${BASE}/subscriptions/${id}`);
}

export async function rotateSecret(id: string): Promise<{ subscriptionId: string; secret: string }> {
  const res = await post<ApiResponse<{ subscriptionId: string; secret: string }>>(
    `${BASE}/subscriptions/${id}/rotate-secret`,
    {},
  );
  return res.data!;
}

export async function getDeliveryLogs(opts?: {
  eventType?: string;
  status?: string;
  subscriptionId?: string;
  page?: number;
  pageSize?: number;
}): Promise<readonly WebhookDeliveryLog[]> {
  const res = await get<ApiResponse<readonly WebhookDeliveryLog[]>>(
    `${BASE}/deliveries`,
    {
      eventType: opts?.eventType ?? null,
      status: opts?.status ?? null,
      subscriptionId: opts?.subscriptionId ?? null,
      page: opts?.page ?? 1,
      pageSize: opts?.pageSize ?? 50,
    },
  );
  return res.data ?? [];
}

export async function retryDelivery(id: string): Promise<void> {
  await post<ApiResponse<string>>(`${BASE}/deliveries/${id}/retry`, {});
}
