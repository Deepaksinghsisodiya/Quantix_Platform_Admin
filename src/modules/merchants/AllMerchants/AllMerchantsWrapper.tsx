import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Store, Users, UserCheck, CheckCircle2, Eye, Pencil } from 'lucide-react';
import { useGetMerchantsQuery } from '../services/merchantApi';
import type { Merchant } from '../types/merchant.types';
import AllMerchantsPage from './AllMerchantsPage';
import { ROUTES } from '@/lib/config/routes';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMAvatar } from '@/shared/ui/ATMAvatar';
import { usePagination } from '@/shared/hooks/usePagination';
import { useGetAll } from '@/shared/hooks/useGetAll';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { formatDate } from '@/lib/utils/formatDate';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { useBrandName } from '@/shared/hooks/useBrandName';

export const AllMerchantsWrapper: React.FC = () => {
  const navigate = useNavigate();
  // 2026-09-04: the subtitle named "the Quantix platform" regardless of the operator's DBA.
  const brandName = useBrandName();


  // 1. Manage State & URL using TimeForge's usePagination hook
  const {
    params,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSort,
    onFilterChange,
  } = usePagination({
    page: 1,
    pageSize: 10,
    sortBy: 'businessName',
    sortDescending: false,
    merchantType: 'all',
    businessNature: 'all',
    status: 'all',
    plan: 'all',
  });

  // Intercept and translate query parameters for the backend API
  const useGetMerchantsTranslatedQuery = (queryParams: any) => {
    const translatedParams = useMemo(() => {
      const { sortDescending, ...rest } = queryParams;

      // Clean 'all' filter values as required by backend
      const cleaned: Record<string, any> = { ...rest };
      Object.keys(cleaned).forEach((key) => {
        if (cleaned[key] === 'all') {
          delete cleaned[key];
        }
      });

      return {
        ...cleaned,
        sortDirection: rest.sortBy ? (sortDescending ? 'Desc' : 'Asc') : undefined,
      };
    }, [queryParams]);

    return useGetMerchantsQuery(translatedParams);
  };

  // 2. Fetch Data using TimeForge's useGetAll hook
  const {
    items: merchants,
    totalCount,
    isLoading,
    isFetching,
  } = useGetAll<Merchant>(useGetMerchantsTranslatedQuery, params);

  const onResetFilters = () => {
    onFilterChange('merchantType', 'all');
    onFilterChange('businessNature', 'all');
    onFilterChange('status', 'all');
    onFilterChange('plan', 'all');
    onSearchChange('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Business Name', 'Type', 'Business Type', 'Plan',
      'Status', 'Onboarded', 'Locations', 'Terminals', 'MRR', 'Token Balance',
    ];
    const rows = merchants.map((t) => [
      t.businessName || (t as any).companyName,
      (t as any).planType || t.merchantType,
      t.businessNature,
      (t as any).planName || t.plan || '',
      t.status || (t as any).merchantStatus,
      (t as any).activatedAt || t.signupDate || (t as any).createdAt,
      t.locationCount,
      t.terminalCount,
      t.mrr ?? '',
      t.tokenBalance ?? '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merchants-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ATMTableColumn<Merchant>[] = useMemo(
    () => [
      {
        key: 'businessName',
        header: 'Merchant',
        sortable: true,
        renderCell: (_val, row) => {
          const bizName = row.businessName || (row as any).companyName || 'Merchant';
          const email = row.email || (row as any).contactEmail || (row as any).adminEmail || `${bizName.toLowerCase().replace(/[^a-z0-9]/g, '')}@quantix.io`;
          const isActive = (row.status || (row as any).merchantStatus) === 'Active';
          return (
            <div className="flex items-center gap-4 py-2">
              <div className="relative group shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center border border-accent-100 dark:border-accent-900/30 overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm transition-transform group-hover:scale-105 duration-300">
                  <ATMAvatar
                    name={bizName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isActive && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white dark:border-gray-950 rounded-full shadow-sm" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate max-w-[220px] text-[13px] font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors" title={bizName}>
                  {bizName}
                </p>
                <p className="truncate max-w-[220px] text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-2 leading-none" title={email}>
                  {email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: 'merchantType',
        header: 'Type',
        // 2026-08-13: MerchantType alone cannot distinguish Standalone POS from Standalone
        // Cloud — the active plan's type can; fall back to MerchantType when plan-less.
        renderCell: (_val, row) => {
          const pt = (row as any).planType as string | undefined;
          const label = pt === 'StandalonePos' ? 'Standalone POS'
            : pt === 'StandaloneCloud' ? 'Standalone Cloud'
              : pt === 'EnterpriseCloud' ? 'Enterprise'
                : row.merchantType;
          return (
            <ATMBadge
              label={label}
              color={pt === 'EnterpriseCloud' || row.merchantType === 'Enterprise' ? 'purple'
                : pt === 'StandaloneCloud' ? 'info' : 'muted'}
              size="sm"
            />
          );
        },
        width: '150px',
      },
      {
        key: 'plan',
        header: 'Plan',
        // 2026-08-13: real plan display name — the old "Standard" fallback was a plan that
        // never existed.
        renderCell: (_val, row) => (
          <span className="text-gray-700 dark:text-gray-300 font-semibold text-xs">
            {(row as any).planName || row.plan || '—'}
          </span>
        ),
        width: '120px',
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        renderCell: (_val, row) => {
          const statusVal = row.status || (row as any).merchantStatus;
          return <StatusBadge status={statusVal} />;
        },
        width: '130px',
      },
      {
        // 2026-08-13 (user-locked): the directory shows when they BECAME a merchant
        // (onboarding completed), not when the enquiry arrived — that's queue business.
        key: 'activatedAt',
        header: 'Onboarded',
        sortable: true,
        renderCell: (_val, row) => {
          const d = (row as any).activatedAt || row.signupDate || (row as any).createdAt;
          return (
            <span className="text-gray-500 dark:text-gray-400 font-semibold tabular-nums text-xs">
              {d ? formatDate(d, 'short') : '—'}
            </span>
          );
        },
        width: '140px',
      },
    ],
    []
  );

  const rowActions = useMemo(
    () =>
      (row: Merchant): RowAction<Merchant>[] => {
        const mId = row.id || (row as any).merchantId;
        return [
          {
            label: 'View Profile',
            icon: Eye,
            onClick: (r) => navigate(ROUTES.TENANTS.DETAIL(mId)),
          },
          {
            label: 'Edit Details',
            icon: Pencil,
            onClick: (r) => navigate(ROUTES.TENANTS.EDIT(mId)),
          },
        ];
      },
    [navigate]
  );

  const filterValues = useMemo(() => {
    return {
      merchantType: params.merchantType || 'all',
      businessNature: params.businessNature || 'all',
      status: params.status || 'all',
      plan: params.plan || 'all',
    };
  }, [params]);

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter">
      {/* Page header and Stats Cards */}
      <div className="flex-shrink-0">
        <ATMPageHeader
          title="All Merchants"
          subtitle={`Manage all registered merchants on the ${brandName} platform.`}
          icon={Store}
        />

        {/* Stats Grid */}
        {(() => {
          const safeMerchants = Array.isArray(merchants) ? merchants : [];
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
              <ATMStatsCard
                label="Total Merchants"
                value={totalCount}
                icon={Store}
                variant="accent"
              />
              <ATMStatsCard
                label="Active Merchants"
                value={safeMerchants.filter((m) => m.status === 'Active').length}
                icon={UserCheck}
                variant="emerald"
              />
              <ATMStatsCard
                label="Enterprise SaaS"
                value={safeMerchants.filter((m) => m.merchantType === 'Enterprise').length}
                icon={Building2}
                variant="purple"
              />
              <ATMStatsCard
                label="Standalone"
                value={safeMerchants.filter((m) => m.merchantType === 'Standalone').length}
                icon={CheckCircle2}
                variant="amber"
              />
            </div>
          );
        })()}
      </div>

      {/* Main Table view container */}
      <ATMCard padding="none" className="overflow-hidden rounded-2xl">
        <AllMerchantsPage
          data={merchants as Merchant[]}
          isLoading={isLoading}
          isFetching={isFetching}
          columns={columns}
          rowActions={rowActions}
          totalCount={totalCount}
          page={params.page}
          pageSize={params.pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          searchValue={params.search}
          onSearchChange={onSearchChange}
          sortBy={params.sortBy}
          sortDescending={params.sortDescending}
          onSort={onSort}
          onRowClick={(row) => navigate(ROUTES.TENANTS.DETAIL(row.id || (row as any).merchantId))}
          filterValues={filterValues}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
          extraHeaderActions={
            <>
              <ATMButton
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={merchants.length === 0}
              >
                Export CSV
              </ATMButton>
              {/* New Signup removed 2026-08-13 — the directory lists activated merchants;
                  creation belongs to the Signup Queue. */}
            </>
          }
        />      </ATMCard>
    </div>
  );
};

export default AllMerchantsWrapper;
