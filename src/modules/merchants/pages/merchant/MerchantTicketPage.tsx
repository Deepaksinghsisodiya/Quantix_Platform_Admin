/**
 * One of the merchant's tickets — 2026-09-08. The conversation with the support team and a
 * reply box. The API strips internal notes and handling remarks before this loads; a reply
 * reopens a Resolved ticket and is refused on a Closed one (the server says so in words).
 */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, LifeBuoy, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
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
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function MerchantTicketPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    return (
      <div className="w-full space-y-5">
        <ATMSkeleton width="220px" height="20px" className="rounded-lg" />
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 dark:border-gray-800/80 dark:bg-[#13151a]/95">
          <div className="flex items-center justify-between gap-4">
            <ATMSkeleton width="45%" height="18px" className="rounded-lg" />
            <ATMSkeleton width="80px" height="24px" className="rounded-full" />
          </div>
          <div className="mt-5 space-y-3">
            <ATMSkeleton height="60px" className="rounded-xl" />
            <ATMSkeleton height="60px" className="rounded-xl" />
            <ATMSkeleton width="70%" height="60px" className="rounded-xl" />
          </div>
          <div className="mt-5 space-y-2">
            <ATMSkeleton height="80px" className="rounded-xl" />
            <ATMSkeleton width="120px" height="38px" className="rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <div className="w-full space-y-4 animate-fade-in">
        <Link to="/merchant/support" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
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
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={LifeBuoy}
        iconColor="theme"
        title={ticket.subject}
        subtitle={
          <>
            {ticket.ticketNumber}
            {' · '}Opened {formatDate(ticket.createdAt, 'datetime')}
            {ticket.category ? ` · ${ticket.category}` : ''}
            {ticket.handledBy ? ` · handled by ${ticket.handledBy}` : ''}
          </>
        }
        extraActions={
          <div className="flex shrink-0 gap-2">
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', BADGE[priority.variant])}>{priority.label}</span>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', BADGE[status.variant])}>{status.label}</span>
          </div>
        }
        onBack={() => navigate('/merchant/support')}
      />

      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
        <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">{ticket.description}</div>
        {ticket.resolvedAt && (
          <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Marked resolved {formatDate(ticket.resolvedAt, 'datetime')}. Reply below if the problem is not fixed and it will reopen.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Conversation</h2>
        {ticket.comments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No replies yet. The support team has been notified and will answer here.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {ticket.comments.map((c) => {
              const mine = c.authorType === 'Merchant';
              return (
                <li key={c.commentId} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[85%] rounded-xl px-4 py-3 text-sm', mine ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-900')}>
                    <p className={cn('mb-1 text-[11px] font-semibold', mine ? 'text-white/80' : 'text-slate-500 dark:text-slate-400')}>
                      {mine ? 'You' : `${brand} support`} · {formatDate(c.createdAt, 'datetime')}
                    </p>
                    <p className="whitespace-pre-wrap">{c.content}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          {closed ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This ticket is closed. If the problem has come back, open a new ticket and mention {ticket.ticketNumber}.
            </p>
          ) : (
            <>
              <textarea
                className="min-h-[110px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply to the support team…"
              />
              <div className="mt-2 flex justify-end">
                <ATMButton
                  type="button"
                  onClick={() => { void submit(); }}
                  variant="primary"
                  icon={Send}
                  isLoading={replyState.isLoading}
                >
                  {replyState.isLoading ? 'Sending…' : 'Send reply'}
                </ATMButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}