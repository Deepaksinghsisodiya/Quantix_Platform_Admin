/**
 * One of the merchant's tickets — 2026-09-08. The conversation with the support team and a
 * reply box. The API strips internal notes and handling remarks before this loads; a reply
 * reopens a Resolved ticket and is refused on a Closed one (the server says so in words).
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetSelfTicketQuery,
  useReplySelfTicketMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/modules/helpdesk/ticketPresentation';
import { useBrandName } from '@/shared/hooks/useBrandName';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatDate } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

const BADGE: Record<string, string> = {
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function MerchantTicketPage() {
  const { id = '' } = useParams<{ id: string }>();
  const brand = useBrandName();
  const [reply, setReply] = useState('');

  const ticketQuery = useGetSelfTicketQuery(id, { skip: !id });
  const [sendReply, replyState] = useReplySelfTicketMutation();
  const ticket = ticketQuery.data?.data ?? null;

  const submit = async () => {
    if (!reply.trim()) { toast.error('Write a reply first.'); return; }
    try {
      await sendReply({ ticketId: id, content: reply.trim() }).unwrap();
      toast.success('Reply sent.');
      setReply('');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The reply could not be sent'));
    }
  };

  if (ticketQuery.isLoading) {
    return <div className="p-6 text-center text-sm text-surface-500">Loading ticket…</div>;
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <div className="space-y-4">
        <Link to="/merchant/support" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Support
        </Link>
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">This ticket could not be found. It may belong to another account.</p>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.Open;
  const priority = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.Medium;
  const closed = ticket.status === 'Closed';

  return (
    <div className="space-y-6 w-full">
      <Link to="/merchant/support" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Support
      </Link>

      <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-surface-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs text-surface-500">{ticket.ticketNumber}</p>
            <h1 className="mt-1 text-xl font-semibold">{ticket.subject}</h1>
            <p className="mt-1 text-xs text-surface-500">
              Opened {formatDate(ticket.createdAt, 'datetime')}{ticket.category ? ` · ${ticket.category}` : ''}
              {ticket.handledBy ? ` · handled by ${ticket.handledBy}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', BADGE[priority.variant])}>{priority.label}</span>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', BADGE[status.variant])}>{status.label}</span>
          </div>
        </div>
        <div className="mt-4 whitespace-pre-wrap rounded-lg bg-surface-50 p-4 text-sm dark:bg-surface-900">{ticket.description}</div>
        {ticket.resolvedAt && (
          <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
            Marked resolved {formatDate(ticket.resolvedAt, 'datetime')}. Reply below if the problem is not fixed and it will reopen.
          </p>
        )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-surface-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-surface-500">Conversation</h2>
        {ticket.comments.length === 0 ? (
          <p className="mt-3 text-sm text-surface-500">No replies yet. The support team has been notified and will answer here.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {ticket.comments.map((c) => {
              const mine = c.authorType === 'Merchant';
              return (
                <li key={c.commentId} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[85%] rounded-xl px-4 py-3 text-sm', mine ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-900')}>
                    <p className={cn('mb-1 text-[11px] font-semibold', mine ? 'text-white/80' : 'text-surface-500')}>
                      {mine ? 'You' : `${brand} support`} · {formatDate(c.createdAt, 'datetime')}
                    </p>
                    <p className="whitespace-pre-wrap">{c.content}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 border-t border-surface-200 pt-4 dark:border-surface-700">
          {closed ? (
            <p className="text-sm text-surface-500">
              This ticket is closed. If the problem has come back, open a new ticket and mention {ticket.ticketNumber}.
            </p>
          ) : (
            <>
              <textarea
                className="min-h-[110px] w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm dark:border-surface-600 dark:bg-surface-900 dark:text-gray-100"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply to the support team…"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => { void submit(); }}
                  disabled={replyState.isLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" /> {replyState.isLoading ? 'Sending…' : 'Send reply'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
