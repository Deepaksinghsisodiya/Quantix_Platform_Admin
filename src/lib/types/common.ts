/** Pagination request parameters. */
export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
  readonly sortBy?: string;
  readonly sortDirection?: SortDirection;
}

/** Paginated response wrapper. */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/** Standard API success response wrapper. */
export interface ApiResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly message?: string;
  readonly timestamp: string;
}

/** Standard API error response. */
export interface ErrorResponse {
  readonly success: false;
  readonly errorCode: string;
  readonly error: string;
  readonly details?: readonly string[];
  readonly timestamp: string;
  readonly traceId?: string;
}

export type SortDirection = 'Asc' | 'Desc';

/** A date range with inclusive start and exclusive end. */
export interface DateRange {
  readonly from: string;
  readonly to: string;
}

/** Generic option for select/dropdown controls. */
export interface SelectOption<T = string> {
  readonly label: string;
  readonly value: T;
  readonly disabled?: boolean;
}

export type MerchantType = 'Enterprise' | 'Standalone';

export type BusinessType = 'Restaurant' | 'Retail' | 'Both';

export type MerchantStatus =
  | 'Pending'
  | 'Active'
  | 'Suspended'
  | 'Cancelled'
  | 'Deleted'
  | 'Failed';
