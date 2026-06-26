import React from 'react';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import type { Merchant } from '../types/merchant.types';

// ---------------------------------------------------------------------------
// Constants for Filter Options
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Deleted', value: 'Deleted' },
];

const COUNTRY_OPTIONS = [
  { label: 'All Countries', value: 'all' },
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Australia', value: 'AU' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
  { label: 'India', value: 'IN' },
  { label: 'UAE', value: 'AE' },
];

const PLAN_OPTIONS = [
  { label: 'All Plans', value: 'all' },
  { label: 'Starter', value: 'Starter' },
  { label: 'Professional', value: 'Professional' },
  { label: 'Business', value: 'Business' },
  { label: 'Enterprise', value: 'Enterprise' },
];

const TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Enterprise', value: 'Enterprise' },
  { label: 'Standalone', value: 'Standalone' },
];

const BIZ_OPTIONS = [
  { label: 'All Natures', value: 'all' },
  { label: 'Restaurant', value: 'Restaurant' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Both', value: 'Both' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AllMerchantsPageProps {
  data: Merchant[];
  isLoading: boolean;
  isFetching: boolean;
  columns: ATMTableColumn<Merchant>[];
  rowActions: (row: Merchant) => RowAction<Merchant>[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  searchValue: string;
  onSearchChange: (s: string) => void;
  sortBy?: string;
  sortDescending?: boolean;
  onSort: (field: string) => void;
  onRowClick?: (row: Merchant) => void;
  filterValues: {
    merchantType: string;
    businessNature: string;
    status: string;
    country: string;
    plan: string;
  };
  onFilterChange: (key: string, val: any) => void;
  onResetFilters: () => void;
  extraHeaderActions?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AllMerchantsPage: React.FC<AllMerchantsPageProps> = ({
  data,
  isLoading,
  isFetching,
  columns,
  rowActions,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  sortBy,
  sortDescending,
  onSort,
  onRowClick,
  filterValues,
  onFilterChange,
  onResetFilters,
  extraHeaderActions,
}) => {
  const hasActiveFilters = Object.values(filterValues).some(
    (val) => val && val !== 'all' && val !== ''
  );

  return (
    <ATMTable<Merchant>
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      rowActions={rowActions}
      onRowClick={onRowClick}
      density="compact"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search merchants by name, email, or nature..."
      sortBy={sortBy}
      sortDesc={sortDescending}
      onSort={onSort}
      pagination={{
        page,
        pageSize,
        totalCount,
        onPageChange,
        onPageSizeChange,
      }}
      extraHeaderActions={extraHeaderActions}
      filterConfig={{
        fields: [
          {
            key: 'merchantType',
            label: 'Merchant Type',
            type: 'select',
            options: TYPE_OPTIONS,
          },
          {
            key: 'businessNature',
            label: 'Business Nature',
            type: 'select',
            options: BIZ_OPTIONS,
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: STATUS_OPTIONS,
          },
          {
            key: 'country',
            label: 'Country',
            type: 'select',
            options: COUNTRY_OPTIONS,
          },
          {
            key: 'plan',
            label: 'Plan',
            type: 'select',
            options: PLAN_OPTIONS,
          },
        ],
        values: filterValues,
        onChange: onFilterChange,
        onReset: onResetFilters,
      }}
      emptyMessage={
        hasActiveFilters || searchValue
          ? 'No merchants match your filters. Try adjusting search or filters.'
          : 'No merchants yet. Register your first merchant.'
      }
    />
  );
};

export default AllMerchantsPage;
