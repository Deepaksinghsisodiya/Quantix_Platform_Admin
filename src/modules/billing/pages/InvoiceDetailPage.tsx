import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDate } from '@/lib/utils/formatDate';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import type { InvoiceStatus } from '@/lib/types/billing';
import { useInvoice } from '../services/useBilling';
import {
  ArrowLeft,
  Download,
  Send,
  RotateCcw,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Display types (page-internal — adapted from server Invoice in main component)
// ---------------------------------------------------------------------------

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TimelineEvent {
  id: string;
  event: string;
  date: string;
  by: string;
  icon: React.ReactNode;
  color: string;
}

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

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceQuery = useInvoice(id);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const loading = invoiceQuery.isLoading;
  const isError = invoiceQuery.isError;
  const apiInvoice = invoiceQuery.data?.data;

  // Adapter: API Invoice → page's display shape (renames items→lineItems,
  // derives subtotal/grandTotal/taxRate, fabricates timeline from issued/paid
  // dates, and synthesises a payment block from paidDate when Paid).
  const invoice = useMemo(() => {
    if (!apiInvoice) return null;

    const lineItems: LineItem[] = apiInvoice.items.map((it) => ({
      id: it.id,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.amount,
    }));

    const subtotal = apiInvoice.amount;
    const tax = apiInvoice.tax;
    const grandTotal = apiInvoice.total;
    const taxRate = subtotal > 0 ? Math.round((tax / subtotal) * 1000) / 10 : 0;

    const timeline: TimelineEvent[] = [
      {
        id: 'ev-1',
        event: 'Invoice created',
        date: apiInvoice.issuedDate,
        by: 'System',
        icon: <FileText className="h-4 w-4" />,
        color: 'text-gray-500',
      },
      {
        id: 'ev-2',
        event: 'Invoice sent to merchant',
        date: apiInvoice.issuedDate,
        by: 'System',
        icon: <Send className="h-4 w-4" />,
        color: 'text-blue-500',
      },
      ...(apiInvoice.paidDate
        ? [
            {
              id: 'ev-3',
              event: 'Payment received',
              date: apiInvoice.paidDate,
              by: 'Auto-charge',
              icon: <CheckCircle2 className="h-4 w-4" />,
              color: 'text-emerald-500',
            } as TimelineEvent,
          ]
        : []),
    ];

    return {
      id: apiInvoice.id,
      invoiceNumber: apiInvoice.invoiceNumber,
      merchantName: apiInvoice.merchantName,
      merchantId: apiInvoice.merchantId,
      status: apiInvoice.status,
      issuedDate: apiInvoice.issuedDate,
      dueDate: apiInvoice.dueDate,
      paidDate: apiInvoice.paidDate,
      currency: apiInvoice.currency,
      lineItems,
      subtotal,
      taxRate,
      tax,
      grandTotal,
      // TODO Pass-26: hook missing — payment-detail block (method/transactionId)
      // is not part of GET /api/v1/billing/invoices/{id}; using paidDate as stand-in.
      payment: apiInvoice.paidDate
        ? {
            method: 'On file',
            transactionId: '—',
            date: apiInvoice.paidDate,
            status: 'Completed',
          }
        : null,
      timeline,
    };
  }, [apiInvoice]);

  if (loading) {
    return (
      <div className="space-y-6">
        <ATMSkeleton width="300px" height="32px" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ATMSkeleton height="400px" />
          </div>
          <ATMSkeleton height="400px" />
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="space-y-6">
        <ATMPageHeader title="Invoice" onBack={() => navigate('/billing/invoices')} />
        <ATMCard>
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {isError ? 'Failed to load invoice.' : 'Invoice not found.'}
            </p>
            <ATMButton
              variant="primary"
              size="sm"
              onClick={() => invoiceQuery.refetch()}
              icon={RefreshCw}
            >
              Retry
            </ATMButton>
          </div>
        </ATMCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.status} size="md" />
            {invoiceQuery.isFetching && !invoiceQuery.isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            )}
          </div>
        }
        subtitle={invoice.merchantName}
        onBack={() => navigate('/billing/invoices')}
        extraActions={
          <div className="flex items-center gap-2">
            <ATMButton
              variant="outline"
              size="md"
              icon={Send}
              onClick={() => {}}
            >
              Resend
            </ATMButton>
            <ATMButton
              variant="outline"
              size="md"
              icon={Download}
              onClick={() => {}}
            >
              Download PDF
            </ATMButton>
            <ATMButton
              variant="danger"
              size="md"
              icon={RotateCcw}
              onClick={() => setRefundOpen(true)}
            >
              Process Refund
            </ATMButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Line items */}
          <ATMCard title="Line Items">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500 dark:text-gray-400">
                      Subtotal
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500 dark:text-gray-400">
                      Tax ({invoice.taxRate}%)
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.tax)}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                      Grand Total
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </ATMCard>

          {/* Timeline */}
          <ATMCard title="Timeline">
            <div className="space-y-4">
              {invoice.timeline.map((event, idx) => (
                <div key={event.id} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800', event.color)}>
                      {event.icon}
                    </div>
                    {idx < invoice.timeline.length - 1 && (
                      <div className="mt-1 h-full w-px bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {event.event}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(event.date, 'datetime')} by {event.by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ATMCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice info */}
          <ATMCard title="Invoice Details">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Invoice #</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Issued</span>
                <span className="text-gray-700 dark:text-gray-300">{formatDate(invoice.issuedDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                <span className="text-gray-700 dark:text-gray-300">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.paidDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Paid</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatDate(invoice.paidDate)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Merchant</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{invoice.merchantName}</span>
              </div>
            </div>
          </ATMCard>

          {/* Payment info */}
          <ATMCard title="Payment Information">
            {invoice.payment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {invoice.payment.method}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {invoice.payment.transactionId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-gray-700 dark:text-gray-300">{formatDate(invoice.payment.date, 'datetime')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <StatusBadge status={invoice.payment.status} />
                </div>
              </div>
            ) : (
              <p className="py-3 text-sm text-gray-500 dark:text-gray-400">
                No payment recorded yet.
              </p>
            )}
          </ATMCard>
        </div>
      </div>

      {/* Refund Modal */}
      <ATMModal
        isOpen={refundOpen}
        onClose={() => setRefundOpen(false)}
        title="Process Refund"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <ATMButton
              variant="outline"
              onClick={() => setRefundOpen(false)}
            >
              Cancel
            </ATMButton>
            <ATMButton
              variant="danger"
              onClick={() => setRefundOpen(false)}
            >
              Process Refund
            </ATMButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                This action cannot be undone. The refund will be processed to the original payment method.
              </p>
            </div>
          </div>
          <ATMTextField
            label="Refund Amount"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder={invoice.grandTotal.toFixed(2)}
            max={invoice.grandTotal}
            step="0.01"
            prefix={<span className="text-sm font-semibold text-gray-400">$</span>}
            error={parseFloat(refundAmount) > invoice.grandTotal ? "Cannot exceed grand total" : undefined}
          />
          <ATMTextArea
            name="reason"
            label="Reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason for the refund..."
          />
        </div>
      </ATMModal>
    </div>
  );
}

export default InvoiceDetailPage;
