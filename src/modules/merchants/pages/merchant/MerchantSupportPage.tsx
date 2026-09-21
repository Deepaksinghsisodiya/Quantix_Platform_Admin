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
import {
  AlertTriangle,
  Clock,
  CreditCard,
  HelpCircle,
  KeyRound,
  LifeBuoy,
  Minus,
  Plus,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton, ATMModal, ATMSkeleton, ATMStatsCard } from '@/shared/ui';
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import {
  useGetSelfTicketsQuery,
  useCreateSelfTicketMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import { PRIORITY_CONFIG, PRIORITY_ICONS, STATUS_CONFIG, STATUS_ICONS } from '@/modules/helpdesk/ticketPresentation';
import { HelpdeskBadge } from '@/modules/helpdesk/components/HelpdeskBadge';
import { OPEN_TICKET_STATUSES, type TicketCategory, type TicketListItem, type TicketPriority } from '@/lib/types/helpdesk';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatDate } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

/** The categories the portal offers; the server stores free text. */
const CATEGORIES: readonly TicketCategory[] = ['Billing', 'Technical', 'Account', 'Token', 'Feature', 'General'];

const CATEGORY_META: Record<TicketCategory, { icon: typeof CreditCard }> = {
  Billing: { icon: CreditCard },
  Technical: { icon: Wrench },
  Account: { icon: User },
  Token: { icon: KeyRound },
  Feature: { icon: Sparkles },
  General: { icon: HelpCircle },
};

/** Dashboard-style stat variants, one per category. */
const CATEGORY_VARIANT: Record<TicketCategory, 'accent' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'slate'> = {
  Billing: 'amber',
  Technical: 'indigo',
  Account: 'purple',
  Token: 'accent',
  Feature: 'rose',
  General: 'slate',
};

const RESOLVED_STATUSES = new Set(['Resolved', 'Closed']);
const ACTIVE_STATUSES = new Set(['New', 'Open', 'Assigned', 'InProgress', 'Reopened']);

/** Merchant can flag a ticket Critical if service is down — the desk triages on sight. */
const PRIORITIES: readonly TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];

interface Draft {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
}

const EMPTY: Draft = { subject: '', category: 'General', priority: 'Medium', description: '' };

/**
 * Compact status timeline for a ticket row: Opened → current stage → Resolved.
 * When an SLA deadline exists and it is missed while the ticket is unresolved,
 * a red marker is appended so the merchant can see it needs attention.
 */
function TicketTimeline({ ticket }: { ticket: TicketListItem }) {
  const resolved = RESOLVED_STATUSES.has(ticket.status);
  const active = ACTIVE_STATUSES.has(ticket.status);
  const opening = ticket.status === 'New';
  const stageLabel = opening || active ? 'Open' : ticket.status === 'WaitingOnCustomer' ? 'Waiting on you' : 'In progress';

  const steps = [
    { key: 'opened', label: 'Opened', done: true, tone: 'bg-primary-500' },
    { key: 'stage', label: stageLabel, done: resolved, tone: 'bg-amber-500' },
    { key: 'resolved', label: 'Resolved', done: resolved, tone: 'bg-emerald-500' },
  ];

  const slaMissed =
    ticket.slaDeadline &&
    !resolved &&
    +new Date(ticket.slaDeadline) < Date.now();

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-0.5">
      {steps.map((s, i) => (
        <span key={s.key} className="flex items-center gap-1">
          <span className={cn('h-1.5 w-1.5 rounded-full', s.done ? s.tone : 'bg-slate-300 dark:bg-slate-600')} />
          <span className={cn('text-[11px]', s.done ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500')}>
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="mx-0.5 h-px w-2 bg-slate-200 dark:bg-slate-700" />}
        </span>
      ))}
      {ticket.isEscalated && (
        <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
          Escalated
        </span>
      )}
      {slaMissed && (
        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
          SLA missed
        </span>
      )}
      {ticket.slaDeadline && !slaMissed && !resolved && (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          by {formatDate(ticket.slaDeadline, 'short')}
        </span>
      )}
    </div>
  );
}

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tickets) counts[t.category] = (counts[t.category] ?? 0) + 1;
    return counts;
  }, [tickets]);

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
        <div className="max-w-md">
          <Link to={`/merchant/support/${t.ticketId}`} className="font-medium text-slate-900 hover:underline dark:text-slate-100">{t.subject}</Link>
          <TicketTimeline ticket={t} />
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      renderCell: (_v, t) => {
        const meta = CATEGORY_META[t.category as TicketCategory];
        const Icon = meta?.icon ?? HelpCircle;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            {t.category || '—'}
          </span>
        );
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      renderCell: (_v, t) => {
        const priority = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.Medium;
        const Icon = PRIORITY_ICONS[t.priority] ?? Minus;
        return <HelpdeskBadge tone={priority.variant} icon={Icon} label={priority.label} />;
      },
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_v, t) => {
        const status = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.Open;
        const Icon = STATUS_ICONS[t.status] ?? Clock;
        return <HelpdeskBadge tone={status.variant} icon={Icon} label={status.label} />;
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

      {/* Category cards — identical layout to the dashboard KPI grid: three across */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const count = categoryCounts[c] ?? 0;
          return (
            <ATMStatsCard
              key={c}
              label={c}
              value={ticketsQuery.isLoading ? '…' : count}
              icon={CATEGORY_META[c].icon}
              variant={CATEGORY_VARIANT[c]}
              description={
                ticketsQuery.isLoading
                  ? 'Loading tickets…'
                  : `${count} ticket${count === 1 ? '' : 's'} — tap to open one in this category`
              }
              onClick={() => { setDraft((d) => ({ ...d, category: c })); setOpen(true); }}
            />
          );
        })}
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