import React, { useState, useRef, useEffect } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMModal, ATMSkeleton, ATMTextField } from '@/shared/ui';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Clock,
  AlertTriangle,
  ChevronDown,
  ArrowUpRight,
  MessageSquare,
  Lock,
  UserCheck,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/modules/auth/slices/authSlice';
import {
  useTicket,
  useEscalateTicket,
  useAddTicketComment,
  useUpdateTicket,
  useResolveTicket,
  useCloseTicket,
} from '@/lib/hooks/useHelpdesk';
import { getCannedResponses } from '@/lib/api/helpdesk';
import type { UpdateTicketDto } from '@/modules/helpdesk/services/helpdeskApi';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { PRIORITY_CONFIG, STATUS_CONFIG, STATUS_TRANSITIONS, slaTimeRemaining } from '../ticketPresentation';
import { TICKET_PRIORITIES, type TicketComment, type TicketDetail, type TicketPriority, type TicketStatus, type CannedResponse } from '@/lib/types/helpdesk';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** The full UpdateTicketDto for a ticket as it stands — the server replaces every field. */
function currentUpdateDto(ticket: TicketDetail): UpdateTicketDto {
  return {
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    handledBy: ticket.handledBy ?? null,
    handlingRemarks: ticket.handlingRemarks ?? null,
    slaDeadline: ticket.slaDeadline ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * 2026-09-04: rebuilt on the API's TicketDto. The previous page read `id` / `messages` /
 * `merchantName` / `tags` from a ticket that carries `ticketId` / `comments` (a crash on
 * load), and dressed the sidebar with invented data — three hardcoded agents, two fake
 * "related tickets", canned replies that never came from the API, a "Bridge Health:
 * Connected" badge, and Send / Assign / status / priority / Close buttons wired to nothing.
 *
 * 2026-09-04 (user directive): tickets are not assigned to platform users. "Handling"
 * records who is working the ticket by name (the person may be outside the platform) plus
 * remarks, for reference. Escalation hands the ticket to the Operations Managers; both they
 * and operators can work and resolve any ticket.
 */
function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const threadEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector(selectCurrentUser);
  const myId = currentUser?.userId ?? currentUser?.id ?? '';
  const myName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || currentUser?.email || 'Agent';

  const ticketQuery = useTicket(id);
  const escalateMutation = useEscalateTicket();
  const commentMutation = useAddTicketComment();
  const updateMutation = useUpdateTicket();
  const resolveMutation = useResolveTicket();
  const closeMutation = useCloseTicket();

  const ticket = ticketQuery.data?.data;
  const isLoading = ticketQuery.isLoading;

  const [messageText, setMessageText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showCanned, setShowCanned] = useState(false);
  const [canned, setCanned] = useState<readonly CannedResponse[]>([]);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [handledBy, setHandledBy] = useState('');
  const [handlingRemarks, setHandlingRemarks] = useState('');

  /* Canned responses come from the API (they are managed on Canned Responses). */
  useEffect(() => {
    let cancelled = false;
    getCannedResponses()
      .then((res) => { if (!cancelled) setCanned(res.data ?? []); })
      .catch((err: unknown) => { if (!cancelled) toast.error(apiErrorMessage(err, 'Canned responses could not be loaded')); });
    return () => { cancelled = true; };
  }, []);

  /* The handling form mirrors the ticket as it stands whenever it (re)loads. */
  useEffect(() => {
    setHandledBy(ticket?.handledBy ?? '');
    setHandlingRemarks(ticket?.handlingRemarks ?? '');
  }, [ticket?.ticketId, ticket?.handledBy, ticket?.handlingRemarks]);

  /* Auto-scroll thread */
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.comments?.length]);

  /* ---- Loading / error / missing ---- */
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <ATMSkeleton variant="text" width="40%" height="32px" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <ATMSkeleton variant="card" height="600px" />
          <ATMSkeleton variant="card" height="600px" />
        </div>
      </div>
    );
  }

  if (ticketQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-gray-500 dark:text-gray-400">The ticket could not be loaded.</p>
        <div className="flex gap-2">
          <ATMButton variant="secondary" onClick={() => { void ticketQuery.refetch(); }}>Retry</ATMButton>
          <ATMButton variant="ghost" onClick={() => navigate('/support')}>Back to Support Queue</ATMButton>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-gray-500 dark:text-gray-400">Ticket not found.</p>
        <ATMButton variant="secondary" onClick={() => navigate('/support')}>Back to Support Queue</ATMButton>
      </div>
    );
  }

  const priCfg = PRIORITY_CONFIG[ticket.priority];
  const stCfg = STATUS_CONFIG[ticket.status];
  const sla = slaTimeRemaining(ticket.slaDeadline);
  const nextStates = STATUS_TRANSITIONS[ticket.status];
  const isClosed = ticket.status === 'Closed';
  const isDone = ticket.status === 'Resolved' || isClosed;
  const busy = updateMutation.isPending || resolveMutation.isPending || closeMutation.isPending;
  const handlingDirty = handledBy.trim() !== (ticket.handledBy ?? '') || handlingRemarks.trim() !== (ticket.handlingRemarks ?? '');

  /* ---- Actions ---- */
  async function sendComment() {
    const content = messageText.trim();
    if (!content) return;
    if (!myId) { toast.error('Your user id is missing from this session. Sign in again.'); return; }
    try {
      await commentMutation.mutateAsync({ ticketId: ticket!.ticketId, authorId: myId, authorType: 'PlatformAgent', content, isInternal });
      setMessageText('');
      toast.success(isInternal ? 'Internal note added' : 'Reply sent');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The reply could not be sent'));
    }
  }

  async function changeStatus(next: TicketStatus) {
    try {
      if (next === 'Resolved') {
        await resolveMutation.mutateAsync({ ticketId: ticket!.ticketId, resolvedBy: myName });
      } else if (next === 'Closed') {
        await closeMutation.mutateAsync(ticket!.ticketId);
      } else {
        await updateMutation.mutateAsync({ ticketId: ticket!.ticketId, data: { ...currentUpdateDto(ticket!), status: next } });
      }
      toast.success(`Ticket marked ${STATUS_CONFIG[next].label}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The status could not be changed'));
    }
  }

  async function changePriority(priority: TicketPriority) {
    if (priority === ticket!.priority) return;
    try {
      await updateMutation.mutateAsync({ ticketId: ticket!.ticketId, data: { ...currentUpdateDto(ticket!), priority } });
      toast.success(`Priority set to ${PRIORITY_CONFIG[priority].label}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The priority could not be changed'));
    }
  }

  async function saveHandling() {
    try {
      await updateMutation.mutateAsync({
        ticketId: ticket!.ticketId,
        data: { ...currentUpdateDto(ticket!), handledBy: handledBy.trim() || null, handlingRemarks: handlingRemarks.trim() || null },
      });
      toast.success('Handling details saved');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The handling details could not be saved'));
    }
  }

  async function escalate() {
    if (!id || !escalateReason.trim()) return;
    try {
      await escalateMutation.mutateAsync({ ticketId: id, reason: escalateReason.trim() });
      toast.success('Ticket handed to the Operations Managers');
      setEscalateModalOpen(false);
      setEscalateReason('');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The ticket could not be escalated'));
    }
  }

  /* ---- Thread ---- */
  function renderComment(c: TicketComment) {
    const isAgent = c.authorType === 'PlatformAgent';
    const authorLabel = isAgent ? (c.authorId === myId ? 'You' : 'Platform agent') : ticket!.merchantName || 'Merchant';
    return (
      <div key={c.commentId} className={cn('flex gap-3', isAgent ? 'justify-end' : 'justify-start')}>
        <div className={cn('max-w-[75%] space-y-1', isAgent ? 'items-end' : 'items-start')}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{authorLabel}</span>
            {c.isInternal && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                <Lock className="h-2.5 w-2.5" /> Internal note
              </span>
            )}
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(c.createdAt, 'datetime')}</span>
          </div>
          <div
            className={cn(
              'rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
              c.isInternal
                ? 'bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100'
                : isAgent
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
            )}
          >
            {c.content}
          </div>
        </div>
      </div>
    );
  }

  const comments = [...ticket.comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate('/support')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Support Queue
        </button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{ticket.subject}</h1>
            <ATMBadge variant={priCfg.variant} size="sm" dot>{priCfg.label}</ATMBadge>
            <ATMBadge variant={stCfg.variant} size="sm">{stCfg.label}</ATMBadge>
            {ticket.isEscalated && <ATMBadge variant="danger" size="sm" dot>Escalated</ATMBadge>}
          </div>
          {!ticket.isEscalated && (
            <ATMButton
              variant="secondary"
              size="sm"
              leftIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
              onClick={() => setEscalateModalOpen(true)}
              disabled={isDone}
            >
              Escalate
            </ATMButton>
          )}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {ticket.ticketNumber} · Created {formatDate(ticket.createdAt, 'datetime')}
          {ticket.resolvedAt && <> · Resolved {formatDate(ticket.resolvedAt, 'datetime')}</>}
          {ticket.closedAt && <> · Closed {formatDate(ticket.closedAt, 'datetime')}</>}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: description + thread */}
        <div className="flex flex-col gap-4">
          <ATMCard title="Description">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {ticket.description || 'No description was given.'}
            </p>
          </ATMCard>

          <ATMCard padding="none" className="flex flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: '55vh' }}>
              {comments.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No replies yet.</p>
              )}
              {comments.map(renderComment)}
              <div ref={threadEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="relative">
                  <ATMButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCanned(!showCanned)}
                    rightIcon={<ChevronDown className="h-3 w-3" />}
                    disabled={canned.length === 0}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Canned Responses{canned.length === 0 ? ' (none)' : ''}
                  </ATMButton>
                  {showCanned && canned.length > 0 && (
                    <div className="absolute left-0 top-full z-10 mt-1 max-h-64 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {canned.map((cr) => (
                        <button
                          key={cr.id}
                          type="button"
                          onClick={() => { setMessageText(cr.content); setShowCanned(false); }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <span className="font-medium text-gray-900 dark:text-gray-100">{cr.title}</span>
                          <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">{cr.content}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />
                  Internal note (not visible to the merchant)
                </label>
              </div>

              <div className="flex gap-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={isInternal ? 'Write an internal note...' : 'Type your reply...'}
                  rows={3}
                  disabled={isClosed}
                  className={cn(
                    'flex-1 resize-none rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:text-gray-100 dark:placeholder:text-gray-500',
                    isInternal
                      ? 'border-amber-300 bg-amber-50/50 focus:border-amber-500 focus:ring-amber-500 dark:border-amber-700 dark:bg-amber-900/10'
                      : 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900',
                  )}
                />
                <div className="flex flex-col justify-end">
                  <ATMButton
                    variant="primary"
                    disabled={!messageText.trim() || isClosed}
                    loading={commentMutation.isPending}
                    leftIcon={<Send className="h-4 w-4" />}
                    onClick={() => { void sendComment(); }}
                  >
                    {isInternal ? 'Add Note' : 'Send'}
                  </ATMButton>
                </div>
              </div>
              {isClosed && (
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">This ticket is closed. Reopen it to reply.</p>
              )}
            </div>
          </ATMCard>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          <ATMCard title="Merchant">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">Merchant</span>
                <Link to={`/merchants/${ticket.merchantId}`} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  {ticket.merchantName || 'Open merchant'}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                <ATMBadge variant={ticket.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">
                  {ticket.merchantType}
                </ATMBadge>
              </div>
              {ticket.category && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
                  <ATMBadge variant="outline" size="sm">{ticket.category}</ATMBadge>
                </div>
              )}
            </div>
          </ATMCard>

          {/* Handling — a name and remarks for reference; the person may be outside the platform. */}
          <ATMCard title="Handling">
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Handled by</label>
                <input
                  type="text"
                  value={handledBy}
                  onChange={(e) => setHandledBy(e.target.value)}
                  placeholder="Name of the person working this ticket"
                  maxLength={200}
                  disabled={isClosed}
                  className="input-base w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Remarks</label>
                <textarea
                  value={handlingRemarks}
                  onChange={(e) => setHandlingRemarks(e.target.value)}
                  placeholder="Anything the next person should know"
                  rows={3}
                  disabled={isClosed}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-gray-400 dark:text-gray-500">For reference only; not a platform user.</p>
                <ATMButton
                  variant="secondary"
                  size="sm"
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                  loading={updateMutation.isPending}
                  disabled={busy || isClosed || !handlingDirty}
                  onClick={() => { void saveHandling(); }}
                >
                  Save
                </ATMButton>
              </div>
            </div>
          </ATMCard>

          {/* Escalation — handed to the Operations Managers */}
          <ATMCard title="Escalation">
            {ticket.isEscalated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
                  <UserCheck className="h-4 w-4" /> With the Operations Managers
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Escalated {ticket.escalatedAt ? formatDate(ticket.escalatedAt, 'datetime') : ''}
                  {ticket.escalatedBy ? ` by ${ticket.escalatedBy}` : ''}
                </p>
                {ticket.escalationReason && (
                  <p className="whitespace-pre-wrap rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {ticket.escalationReason}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Not escalated. Escalating hands the ticket to the Operations Managers; they can also pick up any ticket without escalation.
                </p>
                <ATMButton
                  variant="secondary"
                  size="sm"
                  leftIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                  onClick={() => setEscalateModalOpen(true)}
                  disabled={isDone}
                >
                  Escalate
                </ATMButton>
              </div>
            )}
          </ATMCard>

          <ATMCard title="Priority">
            <div className="flex gap-2">
              {TICKET_PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = ticket.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={busy || isClosed}
                    onClick={() => { void changePriority(p); }}
                    className={cn(
                      'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-60',
                      isActive
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/20 dark:text-indigo-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
                    )}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </ATMCard>

          <ATMCard title="Status">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current:</span>
                <ATMBadge variant={stCfg.variant} size="sm">{stCfg.label}</ATMBadge>
              </div>
              {nextStates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {nextStates.map((ns) => (
                    <ATMButton
                      key={ns}
                      variant={ns === 'Resolved' ? 'primary' : ns === 'Closed' ? 'danger' : 'secondary'}
                      size="sm"
                      disabled={busy}
                      onClick={() => { void changeStatus(ns); }}
                    >
                      {STATUS_CONFIG[ns].label}
                    </ATMButton>
                  ))}
                </div>
              )}
            </div>
          </ATMCard>

          <ATMCard title="SLA">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', sla.breached ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800')}>
                {sla.breached ? <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /> : <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
              </div>
              <div>
                <p className={cn('text-sm font-semibold tabular-nums', sla.breached ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200')}>
                  {sla.breached ? 'SLA breached' : sla.text === 'No SLA' ? 'No SLA deadline' : `${sla.text} remaining`}
                </p>
                {ticket.slaDeadline && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Deadline: {formatDate(ticket.slaDeadline, 'datetime')}
                  </p>
                )}
              </div>
            </div>
          </ATMCard>
        </div>
      </div>

      {/* FRS-SAP-904: Escalation modal */}
      <ATMModal
        open={escalateModalOpen}
        onClose={() => { setEscalateModalOpen(false); setEscalateReason(''); }}
        title="Escalate Ticket"
        description="Hands the ticket to the Operations Managers. The reason is recorded on the ticket and as an internal note."
        size="md"
      >
        <div className="space-y-4">
          <ATMTextField
            label="Escalation Reason"
            placeholder="e.g., SLA breach, customer urgency, needs a decision..."
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <ATMButton variant="secondary" size="sm" onClick={() => { setEscalateModalOpen(false); setEscalateReason(''); }}>
              Cancel
            </ATMButton>
            <ATMButton
              variant="primary"
              size="sm"
              loading={escalateMutation.isPending}
              disabled={!escalateReason.trim()}
              onClick={() => { void escalate(); }}
            >
              Escalate
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}

export default TicketDetailPage;
