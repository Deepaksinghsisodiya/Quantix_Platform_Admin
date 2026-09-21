/**
 * Merchant invoices + payment history page (rebuilt 2026-09-21, Phase 3b).
 * UI polish (2026-09-21): theme-gradient summary cards with semantic icons,
 * icon-status badges, method-aware payment chips, and rows sorted so what the
 * merchant still owes (and what is late) surfaces first.
 *
 * Two stacked panels: invoices (with in-app PDF preview + download) and payment
 * history. An amount-due summary strip leads the page and overdue rows are
 * highlighted, so the "what do I owe and is it late" question is answered before
 * the merchant scrolls.
 */
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  Hourglass,
  Info,
  Landmark,
  Printer,
  Receipt,
  ScrollText,
  TriangleAlert,
  Undo2,
  Wallet,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  useGetSelfInvoicesQuery,
  useGetSelfPaymentsQuery,
} from '@/modules/merchants/services/merchantSelfApi';
import { toast } from 'sonner';
import { openInvoiceForDownload, getInvoicePreviewHtml } from './components/invoiceDownload';
import { useBrandName } from '@/shared/hooks/useBrandName';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton, ATMModal, ATMSkeleton, ATMStatsCard } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { cn } from '@/lib/utils/cn';

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
  amount: number;
  currencyCode: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
}

const DAY_MS = 86_400_000;

function isUnpaid(status: string): boolean {
  return !['Paid', 'Cancelled', 'Refunded', 'Void'].includes(status);
}

function money(fmtAmount: number, currency?: string | null): string {
  return `${(fmtAmount ?? 0).toFixed(2)} ${currency ?? ''}`.trim();
}

export default function MerchantInvoicesPage() {
  const invoices = useGetSelfInvoicesQuery();
  const payments = useGetSelfPaymentsQuery();
  const brandName = useBrandName();

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const rawInvoices = invoices.data?.data;
  const invoiceRows = Array.isArray(rawInvoices) ? (rawInvoices as InvoiceListDto[]) : [];
  const rawPayments = payments.data?.data;
  const paymentRows = Array.isArray(rawPayments) ? (rawPayments as PaymentHistoryDto[]) : [];

  const isOverdue = (inv: InvoiceListDto) =>
    inv.status === 'Overdue' ||
    (isUnpaid(inv.status) && !!inv.dueDate && new Date(inv.dueDate).getTime() < Date.now());

  // What the merchant still owes, and how much of it is already late.
  const amounts = useMemo(() => {
    const outstanding = invoiceRows.filter((i) => isUnpaid(i.status));
    const overdue = outstanding.filter(isOverdue);
    const paid = invoiceRows.filter((i) => i.status === 'Paid');
    const currency = invoiceRows[0]?.currencyCode ?? undefined;
    return {
      outstandingTotal: outstanding.reduce((s, i) => s + (i.totalCurrency ?? 0), 0),
      overdueTotal: overdue.reduce((s, i) => s + (i.totalCurrency ?? 0), 0),
      overdueCount: overdue.length,
      paidCount: paid.length,
      currency,
      any: outstanding.length > 0,
    };
  }, [invoiceRows]);

  // Unpaid (overdue first) rise to the top, then settled history, newest first.
  const sortedInvoices = useMemo(() => {
    return [...invoiceRows].sort((a, b) => {
      const aUnpaid = isUnpaid(a.status);
      const bUnpaid = isUnpaid(b.status);
      if (aUnpaid !== bUnpaid) return aUnpaid ? -1 : 1;
      const aOverdue = isOverdue(a);
      const bOverdue = isOverdue(b);
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    });
  }, [invoiceRows]);

  const sortedPayments = useMemo(() => {
    return [...paymentRows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [paymentRows]);

  async function handleDownload(id: string) {
    try {
      await openInvoiceForDownload(id, brandName);
    } catch (err) {
      toast.error((err as Error).message ?? 'Download failed.');
    }
  }

  async function openPreview(id: string) {
    setPreviewId(id);
    setPreviewHtml(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const html = await getInvoicePreviewHtml(id, brandName);
      setPreviewHtml(html);
    } catch (err) {
      setPreviewError((err as Error).message ?? 'Could not load this invoice.');
    } finally {
      setPreviewLoading(false);
    }
  }

  const invoiceColumns: ATMTableColumn<InvoiceListDto>[] = [
    {
      key: 'invoiceNumber',
      header: 'Number',
      renderCell: (_v, inv) => (
        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
          {inv.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'invoiceType',
      header: 'Type',
      renderCell: (_v, inv) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <FileText className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          {inv.invoiceType}
        </span>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'Issued',
      renderCell: (_v, inv) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {new Date(inv.invoiceDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due',
      renderCell: (_v, inv) => (
        <span
          className={cn(
            'text-xs text-slate-600 dark:text-slate-300',
            isOverdue(inv) && 'font-bold text-red-600 dark:text-red-400',
          )}
        >
          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, inv) => <StatusBadge status={inv.status} overdue={isOverdue(inv)} />,
    },
    {
      key: 'totalCurrency',
      header: 'Amount',
      align: 'right',
      renderCell: (_v, inv) => (
        <Money amount={inv.totalCurrency} currency={inv.currencyCode} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      renderCell: (_v, inv) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => void openPreview(inv.invoiceId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-primary-400 hover:bg-primary-50/50 hover:text-primary-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-500/60 dark:hover:bg-primary-950/20 dark:hover:text-primary-300"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => void handleDownload(inv.invoiceId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-primary-400 hover:bg-primary-50/50 hover:text-primary-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-500/60 dark:hover:bg-primary-950/20 dark:hover:text-primary-300"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      ),
    },
  ];

  const paymentColumns: ATMTableColumn<PaymentHistoryDto>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      renderCell: (_v, p) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      renderCell: (_v, p) => (
        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
          {p.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      renderCell: (_v, p) => <PaymentMethod method={p.paymentMethod} />,
    },
    {
      key: 'transactionId',
      header: 'Reference',
      renderCell: (_v, p) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {p.transactionId || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      renderCell: (_v, p) => <Money amount={p.amount} currency={p.currencyCode} />,
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={CreditCard}
        iconColor="theme"
        title="Invoices & Payments"
        subtitle="Download your invoices as PDF and review how your account is settling."
      />

      {/* Amount due at a glance — dashboard-style stat cards, three across */}
      {invoices.isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <ATMSkeleton key={i} variant="rect" height="136px" className="rounded-2xl" />
          ))}
        </div>
      ) : (
        invoiceRows.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ATMStatsCard
              label="Amount outstanding"
              value={formatCurrencyOrDash(amounts.outstandingTotal, amounts.currency)}
              icon={CreditCard}
              variant={amounts.outstandingTotal > 0 ? 'amber' : 'emerald'}
              description={amounts.any ? 'Unpaid invoices pending settlement' : 'All invoices settled'}
            />
            <ATMStatsCard
              label="Overdue"
              value={
                amounts.overdueCount > 0
                  ? formatCurrencyOrDash(amounts.overdueTotal, amounts.currency)
                  : '—'
              }
              icon={TriangleAlert}
              variant={amounts.overdueCount > 0 ? 'rose' : 'slate'}
              description={
                amounts.overdueCount > 0
                  ? `${amounts.overdueCount} invoice${amounts.overdueCount === 1 ? '' : 's'} past due`
                  : 'Nothing past due'
              }
            />
            <ATMStatsCard
              label="Paid invoices"
              value={amounts.paidCount}
              icon={CheckCircle2}
              variant="emerald"
              description="Settled on this account"
            />
          </div>
        )
      )}

      <ATMCard title="Invoices" subtitle="Preview or download as PDF" padding="none" className="overflow-hidden">
        <ATMTable
          columns={invoiceColumns}
          data={sortedInvoices}
          isLoading={invoices.isLoading}
          emptyMessage="No invoices yet."
          rowClassName={(inv) =>
            isOverdue(inv as InvoiceListDto) ? 'bg-red-50/60 dark:bg-red-950/20' : undefined
          }
        />
      </ATMCard>

      <ATMCard title="Payment history" padding="none" className="overflow-hidden">
        <ATMTable
          columns={paymentColumns}
          data={sortedPayments}
          isLoading={payments.isLoading}
          emptyMessage="No payments yet."
        />
      </ATMCard>

      {/* In-app PDF preview */}
      <ATMModal
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        title="Invoice preview"
        size="lg"
        footer={
          previewId && (
            <div className="flex items-center gap-3">
              <ATMButton
                variant="outline"
                icon={Printer}
                onClick={() => {
                  const iframe = document.getElementById('invoice-preview-frame') as HTMLIFrameElement | null;
                  iframe?.contentWindow?.print();
                }}
              >
                Print / Save as PDF
              </ATMButton>
              <ATMButton
                variant="primary"
                icon={FileText}
                onClick={() => {
                  if (previewId) void handleDownload(previewId);
                }}
              >
                Download copy
              </ATMButton>
            </div>
          )
        }
      >
        {previewLoading && <ATMSkeleton count={6} variant="text" />}
        {previewError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {previewError}
          </div>
        )}
        {previewHtml && (
          <iframe
            id="invoice-preview-frame"
            title="Invoice preview"
            srcDoc={previewHtml}
            className="h-[70vh] w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800"
          />
        )}
      </ATMModal>
    </div>
  );
}

/* ── Shared status badge with a semantic icon per state ──────────────────── */

function StatusBadge({ status, overdue = false }: { status: string; overdue?: boolean }) {
  const s = status.toLowerCase();
  const display = overdue && s !== 'overdue' ? 'Overdue' : status;

  let tone = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  let Icon: LucideIcon = Info;

  if (overdue || s === 'overdue') {
    tone = 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    Icon = TriangleAlert;
  } else if (s === 'paid' || s === 'succeeded' || s === 'completed') {
    tone = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    Icon = CheckCircle2;
  } else if (s === 'issued' || s === 'pending') {
    tone = 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    Icon = Clock;
  } else if (s === 'partial' || s === 'partiallypaid') {
    tone = 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    Icon = Hourglass;
  } else if (s === 'failed') {
    tone = 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    Icon = XCircle;
  } else if (s === 'refunded') {
    tone = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
    Icon = Undo2;
  } else if (s === 'void' || s === 'cancelled' || s === 'closed') {
    tone = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    Icon = s === 'void' ? Ban : XCircle;
  }

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', tone)}>
      <Icon className="h-3 w-3" />
      {display}
    </span>
  );
}

/* ── Payment method chip, icon-aware ──────────────────────────────────────── */

function PaymentMethod({ method }: { method: string }) {
  const key = (method ?? '').toLowerCase();
  let Icon: LucideIcon = Receipt;
  if (key.includes('card')) Icon = CreditCard;
  else if (key.includes('wallet')) Icon = Wallet;
  else if (key.includes('bank') || key.includes('transfer') || key.includes('deposit')) Icon = Landmark;
  else if (key.includes('cash')) Icon = Banknote;
  else if (key.includes('cheque') || key.includes('check')) Icon = ScrollText;
  else if (key.includes('external') || key.includes('offline')) Icon = Building2;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
      <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      {method || '—'}
    </span>
  );
}

/* ── Monospaced money cell ───────────────────────────────────────────────── */

function Money({ amount, currency }: { amount: number; currency?: string | null }) {
  return (
    <span className="font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-slate-100">
      {money(amount, currency)}
    </span>
  );
}