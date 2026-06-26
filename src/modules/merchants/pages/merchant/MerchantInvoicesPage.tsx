/**
 * Pass 40l/o (2026-05-25) â€” Merchant invoices + payment history page.
 *
 * Two stacked panels: invoices (with Download button → openInvoiceForDownload)
 * and payment history.
 */
import {
  useGetSelfInvoicesQuery,
  useGetSelfPaymentsQuery,
} from '@/modules/merchants/services/merchantSelfApi';
import { toast } from 'sonner';
import { openInvoiceForDownload } from './components/invoiceDownload';

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

interface PaymentHistoryDto {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  amountCurrency: number;
  currencyCode: string;
  paymentMethod: string;
  paymentReference: string;
  status: string;
  processedAt: string;
}

export default function MerchantInvoicesPage() {
  const invoices = useGetSelfInvoicesQuery();
  const payments = useGetSelfPaymentsQuery();


  const invoiceRows = (invoices.data?.data as InvoiceListDto[] | undefined) ?? [];
  const paymentRows = (payments.data?.data as PaymentHistoryDto[] | undefined) ?? [];

  async function handleDownload(id: string) {
    try {
      await openInvoiceForDownload(id);
    } catch (err) {
      toast.error((err as Error).message ?? 'Download failed.');
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Invoices &amp; Payments</h1>

      <div className="rounded-xl bg-white dark:bg-surface-800 shadow-sm">
        <div className="border-b border-surface-200 dark:border-surface-700 p-4">
          <h2 className="text-sm font-semibold">Invoices</h2>
          <p className="mt-1 text-xs text-surface-500">Click an invoice to download as PDF</p>
        </div>
        {invoices.isLoading ? (
          <div className="p-6 text-center text-sm text-surface-500">Loading invoices…</div>
        ) : invoiceRows.length === 0 ? (
          <div className="p-6 text-center text-sm text-surface-500">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 text-left text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-4 py-3">Number</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Issued</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {invoiceRows.map((inv) => (
                  <tr
                    key={inv.invoiceId}
                    className="border-b border-surface-100 dark:border-surface-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-700/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">{inv.invoiceType}</td>
                    <td className="px-4 py-3 text-surface-600">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-surface-600">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {inv.totalCurrency.toFixed(2)} {inv.currencyCode}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownload(inv.invoiceId)}
                        className="text-xs font-medium text-primary-600 hover:underline"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white dark:bg-surface-800 shadow-sm">
        <div className="border-b border-surface-200 dark:border-surface-700 p-4">
          <h2 className="text-sm font-semibold">Payment history</h2>
        </div>
        {payments.isLoading ? (
          <div className="p-6 text-center text-sm text-surface-500">Loading payments…</div>
        ) : paymentRows.length === 0 ? (
          <div className="p-6 text-center text-sm text-surface-500">No payments yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 text-left text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.map((p) => (
                  <tr
                    key={p.paymentId}
                    className="border-b border-surface-100 dark:border-surface-700/50 last:border-0"
                  >
                    <td className="px-4 py-3 text-surface-600">
                      {new Date(p.processedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.invoiceNumber}</td>
                    <td className="px-4 py-3">{p.paymentMethod}</td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-500">
                      {p.paymentReference}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {p.amountCurrency.toFixed(2)} {p.currencyCode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Paid' || status === 'Succeeded' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
    status === 'Issued' || status === 'Pending' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
    status === 'Void' || status === 'Failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
    status === 'Overdue' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
    'bg-surface-100 text-surface-700';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}
