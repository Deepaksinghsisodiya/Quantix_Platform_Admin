/**
 * Pass 40l/o (2026-05-25) â€” Merchant invoices + payment history page.
 *
 * Two stacked panels: invoices (with Download button → openInvoiceForDownload)
 * and payment history.
 */
import { FileText } from 'lucide-react';
import {
  useGetSelfInvoicesQuery,
  useGetSelfPaymentsQuery,
} from '@/modules/merchants/services/merchantSelfApi';
import { toast } from 'sonner';
import { openInvoiceForDownload } from './components/invoiceDownload';
import { useBrandName } from '@/shared/hooks/useBrandName';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';

interface InvoiceListDto {
  invoiceId: string;
  invoiceNumber: string;
  invoiceType: string;
  invoiceDate: string;
  totalCurrency: number;
  currencyCode: string;
  status: string;
  dueDate?: string | null;
  paidAt?: string | null;
}

/**
 * 2026-09-02: corrected against the wire. PaymentHistoryDto sends `amount`,
 * `transactionId` and `createdAt`; this mirror declared `amountCurrency`,
 * `paymentReference` and `processedAt`, none of which exist on the payload. The
 * amount one was not cosmetic — `p.amountCurrency.toFixed(2)` on undefined threw a
 * TypeError, so any merchant with a payment on file crashed this page on open.
 */
interface PaymentHistoryDto {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currencyCode: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
}

export default function MerchantInvoicesPage() {
  const invoices = useGetSelfInvoicesQuery();
  const payments = useGetSelfPaymentsQuery();
  // The printed invoice is issued in the deployment's trading name, not a hardcoded one.
  const brandName = useBrandName();


  const rawInvoices = invoices.data?.data;
  const invoiceRows = Array.isArray(rawInvoices) ? (rawInvoices as InvoiceListDto[]) : [];
  const rawPayments = payments.data?.data;
  const paymentRows = Array.isArray(rawPayments) ? (rawPayments as PaymentHistoryDto[]) : [];

  async function handleDownload(id: string) {
    try {
      await openInvoiceForDownload(id, brandName);
    } catch (err) {
      toast.error((err as Error).message ?? 'Download failed.');
    }
  }

  const invoiceColumns: ATMTableColumn<InvoiceListDto>[] = [
    {
      key: 'invoiceNumber',
      header: 'Number',
      renderCell: (_v, inv) => (
        <span className="font-mono text-xs text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</span>
      ),
    },
    { key: 'invoiceType', header: 'Type' },
    {
      key: 'invoiceDate',
      header: 'Issued',
      renderCell: (_v, inv) => (
        <span className="text-slate-600 dark:text-slate-300">{new Date(inv.invoiceDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due',
      renderCell: (_v, inv) => (
        <span className="text-slate-600 dark:text-slate-300">
          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, inv) => <InvoiceStatusBadge status={inv.status} />,
    },
    {
      key: 'totalCurrency',
      header: 'Amount',
      align: 'right',
      renderCell: (_v, inv) => (
        <span className="font-mono text-slate-900 dark:text-slate-100">
          {inv.totalCurrency.toFixed(2)} {inv.currencyCode}
        </span>
      ),
    },
    {
      key: 'download',
      header: '',
      align: 'right',
      renderCell: (_v, inv) => (
        <button
          type="button"
          onClick={() => handleDownload(inv.invoiceId)}
          className="text-xs font-medium text-primary-600 hover:underline"
        >
          Download
        </button>
      ),
    },
  ];

  const paymentColumns: ATMTableColumn<PaymentHistoryDto>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      renderCell: (_v, p) => (
        <span className="text-slate-600 dark:text-slate-300">{new Date(p.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      renderCell: (_v, p) => (
        <span className="font-mono text-xs text-slate-900 dark:text-slate-100">{p.invoiceNumber}</span>
      ),
    },
    { key: 'paymentMethod', header: 'Method' },
    {
      key: 'transactionId',
      header: 'Reference',
      renderCell: (_v, p) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{p.transactionId || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, p) => <InvoiceStatusBadge status={p.status} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      renderCell: (_v, p) => (
        <span className="font-mono text-slate-900 dark:text-slate-100">
          {(p.amount ?? 0).toFixed(2)} {p.currencyCode}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={FileText}
        iconColor="theme"
        title="Invoices & Payments"
        subtitle="Download your invoices as PDF and review how your account is settling."
      />

      <ATMCard title="Invoices" subtitle="Click an invoice to download as PDF" padding="none" className="overflow-hidden">
        <ATMTable columns={invoiceColumns} data={invoiceRows} isLoading={invoices.isLoading} emptyMessage="No invoices yet." />
      </ATMCard>

      <ATMCard title="Payment history" padding="none" className="overflow-hidden">
        <ATMTable columns={paymentColumns} data={paymentRows} isLoading={payments.isLoading} emptyMessage="No payments yet." />
      </ATMCard>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Paid' || status === 'Succeeded' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
    status === 'Issued' || status === 'Pending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
    status === 'Void' || status === 'Failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
    status === 'Overdue' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
    'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}