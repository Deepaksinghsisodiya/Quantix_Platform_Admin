import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, Building2, Store, Users, UserCheck, CheckCircle2, Eye, Pencil } from 'lucide-react';
import { useGetMerchantsQuery } from '../services/merchantApi';
import type { Merchant } from '../types/merchant.types';
import AllMerchantsPage from './AllMerchantsPage';
import { ROUTES } from '@/lib/config/routes';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMAvatar } from '@/shared/ui/ATMAvatar';
import { usePagination } from '@/shared/hooks/usePagination';
import { useGetAll } from '@/shared/hooks/useGetAll';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { formatDate } from '@/lib/utils/formatDate';
import { formatCurrency } from '@/lib/utils/formatCurrency';

export const AllMerchantsWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [regDropdownOpen, setRegDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRegDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    country: 'all',
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
    onFilterChange('country', 'all');
    onFilterChange('plan', 'all');
    onSearchChange('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Business Name', 'Type', 'Business Type', 'Plan', 'Tier',
      'Status', 'Signup Date', 'Locations', 'Terminals', 'MRR', 'Token Balance',
    ];
    const rows = merchants.map((t) => [
      t.businessName || (t as any).companyName,
      t.merchantType,
      t.businessNature,
      t.plan,
      t.tier,
      t.status || (t as any).merchantStatus,
      t.signupDate || (t as any).createdAt,
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
                  <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border-2 border-white dark:border-gray-950 rounded-full shadow-sm" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                  {bizName}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-2 leading-none">
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
        renderCell: (_val, row) => (
          <ATMBadge
            label={row.merchantType}
            color={row.merchantType === 'Enterprise' ? 'purple' : 'muted'}
            size="sm"
          />
        ),
        width: '130px',
      },
      {
        key: 'plan',
        header: 'Plan / Tier',
        renderCell: (_val, row) => (
          <span className="text-gray-700 dark:text-gray-300 font-semibold text-xs">
            {row.plan || 'Standard'} {row.tier ? `(${row.tier})` : ''}
          </span>
        ),
        width: '160px',
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
        key: 'signupDate',
        header: 'Signup Date',
        sortable: true,
        renderCell: (_val, row) => {
          const sDate = row.signupDate || (row as any).createdAt || (row as any).createdOn;
          return (
            <span className="text-gray-500 dark:text-gray-400 font-semibold tabular-nums text-xs">
              {sDate ? formatDate(sDate, 'short') : 'Recently'}
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
      country: params.country || 'all',
      plan: params.plan || 'all',
    };
  }, [params]);

  return (
    <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
      {/* Page header and Stats Cards */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
        <ATMPageHeader
          title="Merchant Directory"
          subtitle="Manage all registered merchants on the Quantix platform."
          icon={Store}
          extraActions={
            <div ref={dropdownRef} className="relative shrink-0">
              <ATMButton
                variant="primary"
                size="md"
                onClick={() => setRegDropdownOpen(!regDropdownOpen)}
                icon={ChevronDown}
                iconPosition="right"
              >
                Register
              </ATMButton>
              {regDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2.5 w-64 origin-top-right overflow-hidden rounded-2xl border border-gray-150/80 bg-white/95 p-1.5 shadow-xl dark:border-gray-800/80 dark:bg-gray-950/95 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col gap-0.5">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 group"
                    onClick={() => { setRegDropdownOpen(false); navigate(ROUTES.TENANTS.REGISTER_ENTERPRISE); }}
                  >
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-100 text-[13px] leading-tight">Enterprise</div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5 truncate">
                        Cloud-connected SaaS model
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 group"
                    onClick={() => { setRegDropdownOpen(false); navigate(ROUTES.TENANTS.REGISTER_STANDALONE); }}
                  >
                    <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Store className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-100 text-[13px] leading-tight">Standalone</div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5 truncate">
                        Token-based offline model
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          }
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
                label="Standalone Offline"
                value={safeMerchants.filter((m) => m.merchantType === 'Standalone').length}
                icon={CheckCircle2}
                variant="amber"
              />
            </div>
          );
        })()}
      </div>

      {/* Main Table view container */}
      <div className="flex-1 overflow-hidden w-full bg-slate-50/10 dark:bg-gray-900/10">
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
            <ATMButton
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={merchants.length === 0}
            >
              Export CSV
            </ATMButton>
          }
        />
      </div>
    </div>
  );
};

export default AllMerchantsWrapper;
