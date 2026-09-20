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
import { AlertTriangle, LifeBuoy, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetSelfTicketsQuery,
  useCreateSelfTicketMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/modules/helpdesk/ticketPresentation';
import { OPEN_TICKET_STATUSES, type TicketCategory, type TicketPriority } from '@/lib/types/helpdesk';
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
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
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

  const field = 'w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm dark:border-surface-600 dark:bg-surface-900 dark:text-gray-100';

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Support</h1>
          <p className="mt-1 text-sm text-surface-500">
            Your tickets with the support team. Open one for billing, licence, technical or account questions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> Open a ticket
        </button>
      </div>

      {ticketsQuery.isError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="text-sm text-red-700 dark:text-red-300">
            Your tickets could not be loaded.{' '}
            <button type="button" className="underline" onClick={() => { void ticketsQuery.refetch(); }}>Try again</button>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-surface-800 shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-700">
          <p className="text-sm text-surface-500">
            {ticketsQuery.isLoading ? 'Loading…' : `${tickets.length} shown of ${total}`}
          </p>
          <label className="flex items-center gap-2 text-xs text-surface-500">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            Show resolved and closed
          </label>
        </div>
        {ticketsQuery.isLoading ? (
          <div className="p-6 text-center text-sm text-surface-500">Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <LifeBuoy className="mx-auto h-8 w-8 text-surface-300" />
            <p className="mt-3 text-sm text-surface-500">
              {total === 0 ? 'You have not opened any tickets yet.' : 'No open tickets. Tick "Show resolved and closed" to see the rest.'}
            </p>
            {total === 0 && (
              <button type="button" onClick={() => setOpen(true)} className="mt-3 text-sm font-medium text-primary-600 hover:underline">
                Open your first ticket
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 text-left text-xs uppercase tracking-wide text-surface-500">
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                {tickets.map((t) => {
                  const status = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.Open;
                  const priority = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.Medium;
                  return (
                    <tr key={t.ticketId} className="hover:bg-surface-50 dark:hover:bg-surface-700/40">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link to={`/merchant/support/${t.ticketId}`} className="text-primary-600 hover:underline">{t.ticketNumber}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/merchant/support/${t.ticketId}`} className="font-medium hover:underline">{t.subject}</Link>
                      </td>
                      <td className="px-4 py-3 text-surface-500">{t.category || '—'}</td>
                      <td className="px-4 py-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', BADGE[priority.variant])}>{priority.label}</span></td>
                      <td className="px-4 py-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', BADGE[status.variant])}>{status.label}</span></td>
                      <td className="px-4 py-3 text-surface-500">{formatDate(t.createdAt, 'short')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-800" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Open a ticket</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-surface-400 hover:text-surface-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-500">Subject</label>
                <input className={field} value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} placeholder="One line that says what is wrong" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-surface-500">Category</label>
                  <select className={field} value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as TicketCategory }))}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-surface-500">Priority</label>
                  <select className={field} value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as TicketPriority }))}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-500">What happened?</label>
                <textarea
                  className={cn(field, 'min-h-[140px]')}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="What you were doing, what you expected, and what you saw. Include a terminal id or invoice number if there is one."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-surface-300 px-4 py-2 text-sm font-medium dark:border-surface-600">Cancel</button>
                <button
                  type="button"
                  onClick={() => { void submit(); }}
                  disabled={createState.isLoading}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {createState.isLoading ? 'Opening…' : 'Open ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
