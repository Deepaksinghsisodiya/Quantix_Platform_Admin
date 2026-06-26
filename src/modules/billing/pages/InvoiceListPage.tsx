import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import type { Invoice, InvoiceType, InvoiceStatus } from '@/lib/types/billing';
import { useInvoices } from '../services/useBilling';
import {
  Plus,
  Download,
  Eye,
  Send,
  Filter,
  Search,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  merchantName: string;
  type: InvoiceType;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  merchantType: 'Enterprise' | 'Standalone';
}

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

const TYPE_VARIANT: Record<InvoiceType, 'enterprise' | 'standalone' | 'warning' | 'info' | 'default'> = {
  Subscription: 'enterprise',
  TokenPurchase: 'standalone',
  Commission: 'warning',
  Usage: 'info',
  AddOn: 'default',
};

const STATUS_VARIANT: Record<InvoiceStatus, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
  Draft: 'default',
  Pending: 'warning',
  Sent: 'info',
  Paid: 'success',
  Overdue: 'danger',
  Cancelled: 'default',
  Refunded: 'warning',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [merchantTypeFilter, setMerchantTypeFilter] = useState<'All' | 'Enterprise' | 'Standalone'>('All');
  const [showFilters, setShowFilters] = useState(false);

  // Pull from server with filters; the merchant-type filter is also forwarded
  // through the global filter store, but we explicitly pass it for clarity.
  const invoicesQuery = useInvoices({
    page,
    pageSize,
    ...(typeFilter !== 'All' ? { type: typeFilter } : {}),
    ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
    ...(merchantTypeFilter !== 'All' ? { merchantType: merchantTypeFilter } : {}),
  });

  const loading = invoicesQuery.isLoading;
  const isError = invoicesQuery.isError;
  const serverItems = invoicesQuery.data?.data?.items ?? [];
  const totalCount = invoicesQuery.data?.data?.totalCount ?? 0;

  // Adapter: server Invoice → InvoiceRow (also apply client-side text search,
  // since hook params don't expose a search field for invoice list).
  const allRows: InvoiceRow[] = useMemo(() => {
    return serverItems.map((inv: Invoice) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      merchantName: inv.merchantName,
      type: inv.type,
      amount: inv.amount,
      tax: inv.tax,
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate,
      merchantType: inv.merchantType,
    }));
  }, [serverItems]);

  const paginated = useMemo(() => {
    if (!search) return allRows;
    const lower = search.toLowerCase();
    return allRows.filter(
      (inv) =>
        inv.merchantName.toLowerCase().includes(lower) ||
        inv.invoiceNumber.toLowerCase().includes(lower),
    );
  }, [allRows, search]);

  const columns: ATMTableColumn<InvoiceRow>[] = useMemo(
    () => [
      {
        key: 'invoiceNumber',
        header: 'Invoice #',
        renderCell: (val, row) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {row.invoiceNumber}
          </span>
        ),
      },
      {
        key: 'merchantName',
        header: 'Merchant',
      },
      {
        key: 'type',
        header: 'Type',
        renderCell: (val, row) => (
          <ATMBadge
            label={row.type}
            color={row.type === 'Subscription' ? 'purple' : row.type === 'TokenPurchase' ? 'success' : 'warning'}
          />
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        align: 'right',
        renderCell: (val, row) => formatCurrency(row.amount),
      },
      {
        key: 'tax',
        header: 'Tax',
        align: 'right',
        renderCell: (val, row) => formatCurrency(row.tax),
      },
      {
        key: 'total',
        header: 'Total',
        align: 'right',
        renderCell: (val, row) => (
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(row.total)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        renderCell: (val, row) => (
          <StatusBadge status={row.status} />
        ),
      },
      {
        key: 'dueDate',
        header: 'Due Date',
        renderCell: (val, row) => formatDate(row.dueDate),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-2">
            <span>Invoices</span>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
          </div>
        }
        subtitle="Manage and track all platform invoices"
        action={{
          label: 'Generate Invoice',
          onClick: () => {},
          icon: Plus,
        }}
      />

      {/* Search + Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <ATMTextField
          name="search"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          prefix={<Search size={16} className="text-gray-400" />}
          className="flex-1 max-w-md !gap-0"
        />
        <ATMButton
          variant={showFilters ? 'primary' : 'outline'}
          size="md"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </ATMButton>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <ATMCard padding="md">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ATMSelectField
              name="typeFilter"
              label="Type"
              value={typeFilter}
              onChange={(val) => { setTypeFilter((val as InvoiceType) || 'All'); setPage(1); }}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Subscription', label: 'Subscription' },
                { value: 'TokenPurchase', label: 'Token Purchase' },
                { value: 'Commission', label: 'Commission' },
                { value: 'Usage', label: 'Usage' },
                { value: 'AddOn', label: 'Add-On' },
              ]}
              size="sm"
            />
            <ATMSelectField
              name="statusFilter"
              label="Status"
              value={statusFilter}
              onChange={(val) => { setStatusFilter((val as InvoiceStatus) || 'All'); setPage(1); }}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Sent', label: 'Sent' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Overdue', label: 'Overdue' },
                { value: 'Cancelled', label: 'Cancelled' },
              ]}
              size="sm"
            />
            <ATMSelectField
              name="merchantTypeFilter"
              label="Merchant Type"
              value={merchantTypeFilter}
              onChange={(val) => { setMerchantTypeFilter((val as 'All' | 'Enterprise' | 'Standalone') || 'All'); setPage(1); }}
              options={[
                { value: 'All', label: 'All' },
                { value: 'Enterprise', label: 'Enterprise' },
                { value: 'Standalone', label: 'Standalone' },
              ]}
              size="sm"
            />
          </div>
        </ATMCard>
      )}

      {/* Table */}
      <ATMCard padding="none" className="overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Failed to load invoices.
            </p>
            <ATMButton variant="primary" size="sm" onClick={() => invoicesQuery.refetch()} icon={RefreshCw}>
              Retry
            </ATMButton>
          </div>
        ) : (
          <ATMTable
            columns={columns}
            data={paginated}
            isLoading={loading}
            isFetching={invoicesQuery.isFetching}
            pagination={{
              page,
              pageSize,
              totalCount,
              onPageChange: setPage,
              onPageSizeChange: (size) => { setPageSize(size); setPage(1); },
            }}
            rowActions={(row) => [
              {
                label: 'View',
                icon: Eye,
                onClick: (row) => navigate(`/billing/invoices/${row.id}`),
              },
              {
                label: 'Download',
                icon: Download,
                onClick: () => {},
              },
              {
                label: 'Resend',
                icon: Send,
                onClick: () => {},
              },
            ]}
          />
        )}
      </ATMCard>
    </div>
  );
}

export default InvoiceListPage;
