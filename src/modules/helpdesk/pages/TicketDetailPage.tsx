import React, { useState, useRef, useEffect } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMModal, ATMSkeleton, ATMTextField } from '@/shared/ui';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  AlertTriangle,
  ChevronDown,
  Tag,
  Users,
  ArrowUpRight,
  Merge,
  X,
  MessageSquare,
  StickyNote,
  Link2,
} from 'lucide-react';
import { useTicket, useAssignTicket, useEscalateTicket, useAutoAssignTicket } from '@/lib/hooks/useHelpdesk';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatDate';
import type { TicketStatus, TicketPriority, TicketMessage } from '@/lib/types/helpdesk';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PRIORITY_CONFIG: Record<TicketPriority, { variant: 'danger' | 'warning' | 'info' | 'default'; label: string }> = {
  Urgent: { variant: 'danger', label: 'Critical' },
  High: { variant: 'warning', label: 'High' },
  Medium: { variant: 'info', label: 'Medium' },
  Low: { variant: 'default', label: 'Low' },
};

const STATUS_CONFIG: Record<TicketStatus, { variant: 'info' | 'warning' | 'success' | 'default'; label: string }> = {
  New: { variant: 'info', label: 'New' },
  Open: { variant: 'info', label: 'Open' },
  InProgress: { variant: 'warning', label: 'In Progress' },
  WaitingOnCustomer: { variant: 'default', label: 'Waiting on Customer' },
  Resolved: { variant: 'success', label: 'Resolved' },
  Closed: { variant: 'default', label: 'Closed' },
};

const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  New: ['Open', 'InProgress'],
  Open: ['InProgress', 'WaitingOnCustomer', 'Resolved'],
  InProgress: ['WaitingOnCustomer', 'Resolved'],
  WaitingOnCustomer: ['InProgress', 'Resolved'],
  Resolved: ['Closed', 'Open'],
  Closed: [],
};

const CANNED_RESPONSES = [
  { id: '1', title: 'Acknowledge', content: 'Thank you for reaching out. We have received your request and a support agent will be with you shortly.' },
  { id: '2', title: 'Requesting Info', content: 'Could you please provide more details about the issue you are experiencing? Screenshots or error messages would be helpful.' },
  { id: '3', title: 'Resolved', content: 'The issue has been resolved. Please let us know if you encounter any further problems.' },
  { id: '4', title: 'Escalated', content: 'Your ticket has been escalated to our senior support team. They will follow up with you shortly.' },
];

function slaTimeRemaining(deadline: string | null): { text: string; breached: boolean; color: string } {
  if (!deadline) return { text: 'No SLA', breached: false, color: 'text-gray-400' };
  const now = Date.now();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  if (diff <= 0) return { text: 'SLA Breached', breached: true, color: 'text-red-600 dark:text-red-400' };
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 24) return { text: `${Math.floor(hours / 24)}d ${hours % 24}h remaining`, breached: false, color: 'text-emerald-600 dark:text-emerald-400' };
  if (hours > 4) return { text: `${hours}h ${mins}m remaining`, breached: false, color: 'text-amber-600 dark:text-amber-400' };
  return { text: `${hours}h ${mins}m remaining`, breached: false, color: 'text-red-600 dark:text-red-400' };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const threadEndRef = useRef<HTMLDivElement>(null);

  const ticketQuery = useTicket(id);
  const assignMutation = useAssignTicket();
  const escalateMutation = useEscalateTicket();
  const autoAssignMutation = useAutoAssignTicket();

  const ticket = ticketQuery.data?.data;
  const isLoading = ticketQuery.isLoading;

  const [messageText, setMessageText] = useState('');
  const [showCanned, setShowCanned] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  /* Auto-scroll thread */
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages?.length]);

  /* ---- Loading state ---- */
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <ATMSkeleton variant="text" width="40%" height="32px" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <ATMSkeleton variant="card" height="600px" />
          <ATMSkeleton variant="card" height="600px" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-gray-500 dark:text-gray-400">Ticket not found.</p>
        <ATMButton variant="secondary" onClick={() => navigate('/support')}>Back to Tickets</ATMButton>
      </div>
    );
  }

  const priCfg = PRIORITY_CONFIG[ticket.priority];
  const stCfg = STATUS_CONFIG[ticket.status];
  const sla = slaTimeRemaining(ticket.slaDeadline);
  const nextStates = STATUS_TRANSITIONS[ticket.status] ?? [];

  /* ---- Message thread ---- */
  function renderMessage(msg: TicketMessage) {
    const isAgent = msg.authorRole === 'Agent';
    const isSystem = msg.authorRole === 'System';

    if (isSystem) {
      return (
        <div key={msg.id} className="flex justify-center py-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {msg.content}
          </span>
        </div>
      );
    }

    return (
      <div key={msg.id} className={cn('flex gap-3', isAgent ? 'justify-end' : 'justify-start')}>
        {!isAgent && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {msg.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={cn('max-w-[75%] space-y-1', isAgent ? 'items-end' : 'items-start')}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{msg.authorName}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(msg.createdAt, 'datetime')}</span>
          </div>
          <div
            className={cn(
              'rounded-xl px-4 py-2.5 text-sm leading-relaxed',
              isAgent
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
            )}
          >
            {msg.content}
          </div>
          {msg.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {msg.attachments.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <Paperclip className="h-2.5 w-2.5" />{a}
                </span>
              ))}
            </div>
          )}
        </div>
        {isAgent && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {msg.authorName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate('/support')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tickets
        </button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{ticket.subject}</h1>
            <ATMBadge variant={priCfg.variant} size="sm" dot>{priCfg.label}</ATMBadge>
            <ATMBadge variant={stCfg.variant} size="sm">{stCfg.label}</ATMBadge>
          </div>
          <div className="flex items-center gap-2">
            <ATMButton variant="secondary" size="sm" leftIcon={<ArrowUpRight className="h-3.5 w-3.5" />} onClick={() => setEscalateModalOpen(true)}>Escalate</ATMButton>
            <ATMButton variant="secondary" size="sm" leftIcon={<Merge className="h-3.5 w-3.5" />}>Merge</ATMButton>
            <ATMButton variant="danger" size="sm">Close</ATMButton>
          </div>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Ticket #{ticket.id.slice(0, 8)} -- Created {formatDate(ticket.createdAt, 'datetime')}
        </span>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: Conversation thread */}
        <div className="flex flex-col">
          <ATMCard padding="none" className="flex flex-1 flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: '60vh' }}>
              {ticket.messages.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No messages yet.</p>
              )}
              {ticket.messages.map(renderMessage)}
              <div ref={threadEndRef} />
            </div>

            {/* Message input */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              {/* Canned response dropdown */}
              <div className="mb-3 flex items-center gap-2">
                <div className="relative">
                  <ATMButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCanned(!showCanned)}
                    rightIcon={<ChevronDown className="h-3 w-3" />}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Canned Responses
                  </ATMButton>
                  {showCanned && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {CANNED_RESPONSES.map((cr) => (
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
                <ATMButton variant="ghost" size="sm" leftIcon={<Paperclip className="h-3.5 w-3.5" />}>
                  Attach
                </ATMButton>
              </div>

              <div className="flex gap-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
                <div className="flex flex-col justify-end">
                  <ATMButton
                    variant="primary"
                    disabled={!messageText.trim()}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Send
                  </ATMButton>
                </div>
              </div>
            </div>
          </ATMCard>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Merchant context card */}
          <ATMCard title="Merchant Context">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Merchant</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{ticket.merchantName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                <ATMBadge variant={ticket.merchantType === 'Enterprise' ? 'enterprise' : 'standalone'} size="sm">
                  {ticket.merchantType}
                </ATMBadge>
              </div>
              {ticket.merchantType === 'Enterprise' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Bridge Health</span>
                  <ATMBadge variant="success" size="sm" dot>Connected</ATMBadge>
                </div>
              )}
              {ticket.merchantType === 'Standalone' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Token Status</span>
                  <ATMBadge variant="success" size="sm" dot>Active</ATMBadge>
                </div>
              )}
            </div>
          </ATMCard>

          {/* Assignment */}
          <ATMCard title="Assignment">
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Assigned Agent</label>
                <select className="input-select text-sm">
                  <option value="">Unassigned</option>
                  <option value="agent-1">Sarah Johnson</option>
                  <option value="agent-2">Michael Chen</option>
                  <option value="agent-3">Emily Rodriguez</option>
                </select>
              </div>
              <ATMButton variant="secondary" size="sm" className="w-full" leftIcon={<Users className="h-3.5 w-3.5" />}>
                Assign to Me
              </ATMButton>
            </div>
          </ATMCard>

          {/* Priority */}
          <ATMCard title="Priority">
            <div className="flex gap-2">
              {(['Urgent', 'High', 'Medium', 'Low'] as TicketPriority[]).map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = ticket.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    className={cn(
                      'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
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

          {/* Status workflow */}
          <ATMCard title="Status">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current:</span>
                <ATMBadge variant={stCfg.variant} size="sm">{stCfg.label}</ATMBadge>
              </div>
              {nextStates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {nextStates.map((ns) => {
                    const nsCfg = STATUS_CONFIG[ns];
                    return (
                      <ATMButton key={ns} variant="secondary" size="sm">
                        {nsCfg.label}
                      </ATMButton>
                    );
                  })}
                </div>
              )}
            </div>
          </ATMCard>

          {/* SLA timer */}
          <ATMCard title="SLA">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', sla.breached ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800')}>
                {sla.breached ? <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /> : <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
              </div>
              <div>
                <p className={cn('text-sm font-semibold tabular-nums', sla.color)}>{sla.text}</p>
                {ticket.slaDeadline && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Deadline: {formatDate(ticket.slaDeadline, 'datetime')}
                  </p>
                )}
              </div>
            </div>
          </ATMCard>

          {/* FRS-SAP-902: Related tickets */}
          <ATMCard title="Related Tickets">
            <div className="space-y-2">
              {[
                { id: 'TK-1089', subject: 'Token activation failed', status: 'Resolved', days: 12 },
                { id: 'TK-1045', subject: 'Payment gateway timeout', status: 'Closed', days: 28 },
              ].map((rt) => (
                <div key={rt.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                  <div>
                    <span className="text-xs font-mono text-gray-500">{rt.id}</span>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{rt.subject}</p>
                  </div>
                  <span className="text-[10px] text-gray-400">{rt.status} · {rt.days}d ago</span>
                </div>
              ))}
            </div>
          </ATMCard>

          {/* FRS-SAP-906: Canned Responses */}
          <ATMCard title="Quick Responses">
            <div className="space-y-1.5">
              {(ticket.merchantType === 'Standalone' ? [
                'How to enter recharge token on POS terminal',
                'Token expired — renewal instructions',
                'Offline setup troubleshooting',
                'Tier upgrade process explanation',
              ] : [
                'How to connect to cloud sync',
                'Platform Bridge connection troubleshooting',
                'API rate limit exceeded — next steps',
                'Commission statement query resolution',
              ]).map((response) => (
                <button
                  key={response}
                  type="button"
                  className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  {response}
                </button>
              ))}
            </div>
          </ATMCard>

          {/* Internal notes */}
          <ATMCard
            title="Internal Notes"
            action={
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                {showNotes ? 'Collapse' : 'Expand'}
              </button>
            }
          >
            {showNotes && (
              <div className="space-y-3 animate-fade-in">
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add an internal note (not visible to customer)..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-amber-50/50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-gray-600 dark:bg-amber-900/10 dark:text-gray-100"
                />
                <ATMButton variant="secondary" size="sm" leftIcon={<StickyNote className="h-3.5 w-3.5" />}>
                  Save Note
                </ATMButton>
              </div>
            )}
            {!showNotes && (
              <p className="text-xs text-gray-400 dark:text-gray-500">Click expand to view and add notes.</p>
            )}
          </ATMCard>

          {/* Tags */}
          <ATMCard title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {ticket.tags.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">No tags.</p>
              )}
              {ticket.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <Tag className="h-2.5 w-2.5" />{tag}
                  <button type="button" className="ml-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="rounded-full border border-dashed border-gray-300 px-2.5 py-0.5 text-xs text-gray-500 hover:border-indigo-500 hover:text-indigo-600 dark:border-gray-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
              >
                + Add Tag
              </button>
            </div>
          </ATMCard>
        </div>
      </div>
      {/* FRS-SAP-904: Escalation modal */}
      <ATMModal
        open={escalateModalOpen}
        onClose={() => { setEscalateModalOpen(false); setEscalateReason(''); }}
        title="Escalate Ticket"
        description="Escalate this ticket to the next level in the escalation path (Agent → Team Lead → Platform Admin)."
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>SLA escalation thresholds:</strong> Critical = 4h, High = 24h, Medium = 48h
            </p>
          </div>
          <ATMTextField
            label="Escalation Reason"
            placeholder="e.g., SLA breach, customer urgency, technical complexity..."
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
              onClick={async () => {
                if (!id || !escalateReason.trim()) return;
                try {
                  await escalateMutation.mutateAsync({ ticketId: id, reason: escalateReason.trim() });
                  toast.success('Ticket escalated to next level');
                  setEscalateModalOpen(false);
                  setEscalateReason('');
                } catch {
                  toast.error('Failed to escalate ticket');
                }
              }}
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
