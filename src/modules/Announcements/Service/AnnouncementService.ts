import { baseApi } from '@/core/services/baseApi';
import type { ApiResponse } from '@/lib/types';
import type {
  Announcement,
  SaveAnnouncementDto,
  ReorderAnnouncementsDto,
} from '../Model/AnnouncementTypes';

export const announcementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAnnouncements: builder.query<ApiResponse<readonly Announcement[]>, string | undefined>({
      query: (siteVariant) => ({
        url: siteVariant ? `/api/v1/announcements/admin?siteVariant=${siteVariant}` : '/api/v1/announcements/admin',
        method: 'GET',
      }),
      providesTags: ['Content'],
    }),

    getAnnouncementById: builder.query<ApiResponse<Announcement>, string>({
      query: (id) => ({
        url: `/api/v1/announcements/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Content', id }],
    }),

    createAnnouncement: builder.mutation<ApiResponse<Announcement>, SaveAnnouncementDto>({
      query: (data) => ({
        url: '/api/v1/announcements',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    updateAnnouncement: builder.mutation<ApiResponse<Announcement>, { id: string } & SaveAnnouncementDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/announcements/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['Content'],
    }),

    deleteAnnouncement: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/api/v1/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Content'],
    }),

    toggleActiveAnnouncement: builder.mutation<ApiResponse<Announcement>, string>({
      query: (id) => ({
        url: `/api/v1/announcements/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    togglePinnedAnnouncement: builder.mutation<ApiResponse<Announcement>, string>({
      query: (id) => ({
        url: `/api/v1/announcements/${id}/toggle-pinned`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content'],
    }),

    reorderAnnouncements: builder.mutation<ApiResponse<{ message: string }>, ReorderAnnouncementsDto>({
      query: (data) => ({
        url: '/api/v1/announcements/reorder',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useToggleActiveAnnouncementMutation,
  useTogglePinnedAnnouncementMutation,
  useReorderAnnouncementsMutation,
} = announcementsApi;
