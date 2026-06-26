import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, Building2, Store, Users, UserCheck, CheckCircle2, Eye } from 'lucide-react';
import { useGetMerchantsQuery } from '../services/merchantApi';
import type { Merchant } from '../types/merchant.types';
import AllMerchantsPage from './AllMerchantsPage';
import { ROUTES } from '@/lib/config/routes';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
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
    pageSize: 25,
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
        header: 'Business Name',
        sortable: true,
        renderCell: (_val, row) => {
          const bizName = row.businessName || (row as any).companyName;
          return (
            <span className="font-bold text-gray-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
              {bizName}
            </span>
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
        width: '120px',
      },
      {
        key: 'businessNature',
        header: 'Business',
        renderCell: (_val, row) =>
          row.businessNature ? (
            <span className="inline-flex items-center rounded-lg bg-gray-50 dark:bg-gray-900 px-2.5 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
              {row.businessNature}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-semibold">—</span>
          ),
        width: '120px',
      },
      {
        key: 'plan',
        header: 'Plan / Tier',
        renderCell: (_val, row) => (
          <span className="text-gray-600 dark:text-gray-400 font-semibold">
            {row.plan} / {row.tier}
          </span>
        ),
        width: '140px',
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        renderCell: (_val, row) => {
          const statusVal = row.status || (row as any).merchantStatus;
          return <StatusBadge status={statusVal} />;
        },
        width: '110px',
      },
      {
        key: 'signupDate',
        header: 'Signup Date',
        sortable: true,
        renderCell: (_val, row) => {
          const sDate = row.signupDate || (row as any).createdAt;
          return (
            <span className="text-gray-500 dark:text-gray-400 font-bold tabular-nums">
              {formatDate(sDate, 'short')}
            </span>
          );
        },
        width: '120px',
      },
      {
        key: 'lastActivityDate',
        header: 'Last Activity',
        sortable: true,
        renderCell: (_val, row) =>
          row.lastActivityDate ? (
            <span className="text-gray-500 dark:text-gray-400 font-bold">
              {formatDate(row.lastActivityDate, 'relative')}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600 text-xs font-semibold">Never</span>
          ),
        width: '130px',
      },
      {
        key: 'locationCount',
        header: 'Locations',
        align: 'center',
        renderCell: (_val, row) => (
          <span className="text-gray-600 dark:text-gray-400 font-bold tabular-nums">
            {row.locationCount}
          </span>
        ),
        width: '100px',
      },
      {
        key: 'terminalCount',
        header: 'Terminals',
        align: 'center',
        renderCell: (_val, row) => (
          <span className="text-gray-600 dark:text-gray-400 font-bold tabular-nums">
            {row.terminalCount}
          </span>
        ),
        width: '100px',
      },
      {
        key: 'mrr',
        header: 'MRR / Balance',
        align: 'right',
        renderCell: (_val, row) => {
          if (row.merchantType === 'Enterprise' && row.mrr != null) {
            return (
              <span className="font-black tabular-nums text-gray-900 dark:text-white">
                {formatCurrency(row.mrr)}
              </span>
            );
          }
          if (row.merchantType === 'Standalone' && row.tokenBalance != null) {
            return (
              <span className="font-black tabular-nums text-gray-900 dark:text-white">
                {row.tokenBalance} tokens
              </span>
            );
          }
          return <span className="text-gray-400 dark:text-gray-600 font-semibold">--</span>;
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <ATMStatsCard
            label="Total Merchants"
            value={totalCount}
            icon={Store}
            variant="accent"
          />
          <ATMStatsCard
            label="Active Merchants"
            value={merchants.filter((m) => m.status === 'Active').length}
            icon={UserCheck}
            variant="emerald"
          />
          <ATMStatsCard
            label="Enterprise SaaS"
            value={merchants.filter((m) => m.merchantType === 'Enterprise').length}
            icon={Building2}
            variant="purple"
          />
          <ATMStatsCard
            label="Standalone Offline"
            value={merchants.filter((m) => m.merchantType === 'Standalone').length}
            icon={CheckCircle2}
            variant="amber"
          />
        </div>
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
