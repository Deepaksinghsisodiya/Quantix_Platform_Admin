import { baseApi } from '../../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type {
  WebhookSubscription,
  WebhookSubscriptionWithSecret,
  CreateWebhookSubscriptionPayload,
  UpdateWebhookSubscriptionPayload,
  WebhookDeliveryLog,
} from '../types/webhook.types';

export const webhookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWebhookSubscriptions: builder.query<ApiResponse<readonly WebhookSubscription[]>, boolean | undefined>({
      query: (activeOnly) => ({
        url: '/api/v1/webhooks/subscriptions',
        method: 'GET',
        params: activeOnly !== undefined ? { activeOnly } : undefined,
      }),
      providesTags: ['Webhooks'],
    }),

    createWebhookSubscription: builder.mutation<ApiResponse<WebhookSubscriptionWithSecret>, CreateWebhookSubscriptionPayload>({
      query: (data) => ({
        url: '/api/v1/webhooks/subscriptions',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Webhooks'],
    }),

    updateWebhookSubscription: builder.mutation<
      ApiResponse<WebhookSubscription>,
      { id: string; data: UpdateWebhookSubscriptionPayload }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/webhooks/subscriptions/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Webhooks'],
    }),

    deleteWebhookSubscription: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/api/v1/webhooks/subscriptions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Webhooks'],
    }),

    rotateWebhookSecret: builder.mutation<ApiResponse<{ subscriptionId: string; secret: string }>, string>({
      query: (id) => ({
        url: `/api/v1/webhooks/subscriptions/${id}/rotate-secret`,
        method: 'POST',
      }),
      invalidatesTags: ['Webhooks'],
    }),

    getWebhookDeliveryLogs: builder.query<
      ApiResponse<readonly WebhookDeliveryLog[]>,
      { eventType?: string; status?: string; subscriptionId?: string; page?: number; pageSize?: number } | undefined
    >({
      query: (params) => ({
        url: '/api/v1/webhooks/deliveries',
        method: 'GET',
        params: {
          eventType: params?.eventType ?? null,
          status: params?.status ?? null,
          subscriptionId: params?.subscriptionId ?? null,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 50,
        },
      }),
      providesTags: ['Webhooks'],
    }),

    retryWebhookDelivery: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/api/v1/webhooks/deliveries/${id}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['Webhooks'],
    }),
  }),
});

export const {
  useGetWebhookSubscriptionsQuery,
  useCreateWebhookSubscriptionMutation,
  useUpdateWebhookSubscriptionMutation,
  useDeleteWebhookSubscriptionMutation,
  useRotateWebhookSecretMutation,
  useGetWebhookDeliveryLogsQuery,
  useRetryWebhookDeliveryMutation,
} = webhookApi;
