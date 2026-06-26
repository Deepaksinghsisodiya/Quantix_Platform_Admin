import type { PlatformUser, PlatformRole, UserStatus, UserPermission, CreateUserDto, UpdateUserDto } from '@/lib/types/user';
import type { ActiveSession, SessionPolicy, UserActivity } from '@/lib/api/users';

export type {
  PlatformUser,
  PlatformRole,
  UserStatus,
  UserPermission,
  CreateUserDto,
  UpdateUserDto,
  ActiveSession,
  SessionPolicy,
  UserActivity
};

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}
