import { baseApi } from '../../../core/services/baseApi';
import type { ApiResponse } from '@/lib/types/common';
import type { Notification } from '@/lib/types';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiResponse<readonly Notification[]>, void>({
      query: () => ({
        url: '/api/v1/notifications',
        method: 'GET',
      }),
      providesTags: ['Notifications'],
    }),

    markNotificationRead: builder.mutation<ApiResponse<Notification>, string>({
      query: (id) => ({
        url: `/api/v1/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsRead: builder.mutation<ApiResponse<{ readonly updated: number }>, void>({
      query: () => ({
        url: '/api/v1/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
