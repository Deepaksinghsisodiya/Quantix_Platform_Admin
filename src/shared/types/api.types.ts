export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PagedData<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PagedResponse<T> = ApiResponse<PagedData<T>>;

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
}
