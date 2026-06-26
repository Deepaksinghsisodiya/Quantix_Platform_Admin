import { ReactNode } from 'react';

export interface ATMTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, record: T) => ReactNode;
  sortable?: boolean;
  width?: string | number;
}

export interface ATMTableProps<T> {
  columns: ATMTableColumn<T>[];
  data: readonly T[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onSortChange?: (key: string, desc: boolean) => void;
}
