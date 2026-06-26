/**
 * Quantix Platform Admin API — shared request/response types.
 *
 * Domain-specific types live in @/lib/types/*; this file covers
 * the generic API envelope and pagination contract.
 */

// Re-export the canonical types from the types barrel so API modules
// can import everything from one place.
export type {
  ApiResponse,
  ErrorResponse,
  PaginatedResult,
  PaginationParams,
  SortDirection,
  DateRange,
  MerchantType,
  BusinessType,
  MerchantStatus,
} from '@/lib/types/common';

/** Paginated list response returned by collection endpoints. */
export interface ApiListResponse<T> {
  readonly success: true;
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };
  readonly timestamp: string;
}

/** Shape of the error body returned by the platform API. */
export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, readonly string[]>;
}
