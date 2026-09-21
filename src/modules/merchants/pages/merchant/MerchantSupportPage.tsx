/**
 * Support — 2026-09-08. The merchant's own helpdesk.
 *
 * Until now a merchant had no way to reach support from the portal: tickets were raised for them
 * by staff, or by the refund fallback on their behalf, and they could see neither. This lists the
 * merchant's tickets and opens new ones. Every row comes from /merchant-self/support/*, which the
 * API scopes to the merchant_id claim; internal notes are stripped before anything leaves the
 * server. The title matches the portal's navigation label.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, LifeBuoy, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton, ATMModal, ATMSkeleton } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import {
  useGetSelfTicketsQuery,
  useCreateSelfTicketMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/modules/helpdesk/ticketPresentation';
import { OPEN_TICKET_STATUSES, type TicketCategory, type TicketListItem, type TicketPriority } from '@/lib/types/helpdesk';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatDate } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

/** The categories the portal offers; the server stores free text. */
const CATEGORIES: readonly TicketCategory[] = ['Billing', 'Technical', 'Account', 'Token', 'Feature', 'General'];
/** Critical is the desk's call once they have seen the ticket, so it is not offered here. */
const PRIORITIES: readonly TicketPriority[] = ['Low', 'Medium', 'High'];

const BADGE: Record<string, string> = {
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

interface Draft {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
}

const EMPTY: Draft = { subject: '', category: 'General', priority: 'Medium', description: '' };

export default function MerchantSupportPage() {
  const [showClosed, setShowClosed] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const ticketsQuery = useGetSelfTicketsQuery({ page: 1, pageSize: 100 });
  const [createTicket, createState] = useCreateSelfTicketMutation();

  const tickets = useMemo(() => {
    const rows = ticketsQuery.data?.data ?? [];
    return showClosed ? rows : rows.filter((t) => OPEN_TICKET_STATUSES.has(t.status));
  }, [ticketsQuery.data, showClosed]);
  const total = ticketsQuery.data?.totalCount ?? 0;

  const submit = async () => {
    if (!draft.subject.trim()) { toast.error('Give the ticket a subject.'); return; }
    if (!draft.description.trim()) { toast.error('Describe the problem so the team can help.'); return; }
    try {
      const res = await createTicket({
        subject: draft.subject.trim(),
        description: draft.description.trim(),
        category: draft.category,
        priority: draft.priority,
      }).unwrap();
      toast.success(`Ticket ${res.data.ticketNumber} opened. The support team has been notified.`);
      setOpen(false);
      setDraft(EMPTY);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The ticket could not be opened'));
    }
  };

  const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10';

  const columns: ATMTableColumn<TicketListItem>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket',
      renderCell: (_v, t) => (
        <Link to={`/merchant/support/${t.ticketId}`} className="font-mono text-xs text-primary-600 hover:underline">{t.ticketNumber}</Link>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      renderCell: (_v, t) => (
        <Link to={`/merchant/support/${t.ticketId}`} className="font-medium text-slate-900 hover:underline dark:text-slate-100">{t.subject}</Link>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      renderCell: (_v, t) => <span className="text-slate-500 dark:text-slate-400">{t.category || '—'}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      renderCell: (_v, t) => {
        const priority = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.Medium;
        return <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', BADGE[priority.variant])}>{priority.label}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, t) => {
        const status = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.Open;
        return <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', BADGE[status.variant])}>{status.label}</span>;
      },
    },
    {
      key: 'createdAt',
      header: 'Opened',
      renderCell: (_v, t) => <span className="text-slate-500 dark:text-slate-400">{formatDate(t.createdAt, 'short')}</span>,
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={LifeBuoy}
        iconColor="theme"
        title="Support"
        subtitle="Your tickets with the support team. Open one for billing, licence, technical or account questions."
        extraActions={
          <ATMButton onClick={() => setOpen(true)} variant="primary" icon={Plus}>
            Open a ticket
          </ATMButton>
        }
      />

      {ticketsQuery.isError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="text-sm text-red-700 dark:text-red-300">
            Your tickets could not be loaded.{' '}
            <button type="button" className="underline" onClick={() => { void ticketsQuery.refetch(); }}>Try again</button>
          </div>
        </div>
      )}

      <ATMCard padding="none" className="overflow-hidden">
        <ATMTable
          columns={columns}
          data={tickets}
          isLoading={ticketsQuery.isLoading}
          emptyMessage={
            total === 0
              ? 'You have not opened any tickets yet.'
              : 'No open tickets. Tick "Show resolved and closed" to see the rest.'
          }
          onEmptyAction={total === 0 ? () => setOpen(true) : undefined}
          emptyActionLabel="Open your first ticket"
          extraHeaderActions={
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {ticketsQuery.isLoading ? (
                  <ATMSkeleton className="h-3.5 w-24 !bg-slate-200 dark:!bg-slate-700" />
                ) : `${tickets.length} shown of ${total}`}
              </span>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={showClosed}
                  onChange={(e) => setShowClosed(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                Show resolved and closed
              </label>
            </div>
          }
        />
      </ATMCard>

      <ATMModal open={open} onClose={() => setOpen(false)} title="Open a ticket" size="lg">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
            <input className={field} value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} placeholder="One line that says what is wrong" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
              <select className={field} value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as TicketCategory }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Priority</label>
              <select className={field} value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as TicketPriority }))}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">What happened?</label>
            <textarea
              className={cn(field, 'min-h-[140px]')}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="What you were doing, what you expected, and what you saw. Include a terminal id or invoice number if there is one."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <ATMButton
              type="button"
              onClick={() => { void submit(); }}
              variant="primary"
              isLoading={createState.isLoading}
            >
              {createState.isLoading ? 'Opening…' : 'Open ticket'}
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}