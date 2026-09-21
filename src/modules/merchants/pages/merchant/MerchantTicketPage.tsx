/**
 * One of the merchant's tickets — 2026-09-08. The conversation with the support team and a
 * reply box. The API strips internal notes and handling remarks before this loads; a reply
 * reopens a Resolved ticket and is refused on a Closed one (the server says so in words).
 */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  LifeBuoy,
  Send,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMButton, ATMSkeleton } from '@/shared/ui';
import {
  useGetSelfTicketQuery,
  useReplySelfTicketMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import { PRIORITY_CONFIG, PRIORITY_ICONS, STATUS_CONFIG, STATUS_ICONS } from '@/modules/helpdesk/ticketPresentation';
import { HelpdeskBadge } from '@/modules/helpdesk/components/HelpdeskBadge';
import { useBrandName } from '@/shared/hooks/useBrandName';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatDate } from '@/lib/utils/formatDate';
import { cn } from '@/lib/utils/cn';

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
            <HelpdeskBadge tone={priority.variant} icon={PRIORITY_ICONS[ticket.priority] ?? User} label={priority.label} />
            <HelpdeskBadge tone={status.variant} icon={STATUS_ICONS[ticket.status] ?? LifeBuoy} label={status.label} />
          </div>
        }
        onBack={() => navigate('/merchant/support')}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
            <User className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">You</p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {ticket.ticketNumber} · Opened {formatDate(ticket.createdAt, 'datetime')}
              {ticket.category ? ` · ${ticket.category}` : ''}
            </p>
          </div>
        </div>
        <div className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {ticket.description}
        </div>
        {ticket.resolvedAt && (
          <p className="flex items-center gap-1.5 border-t border-slate-100 px-5 py-3 text-xs font-semibold text-emerald-600 dark:border-slate-800 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Marked resolved {formatDate(ticket.resolvedAt, 'datetime')}. Reply below if the problem is not fixed and it will reopen.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#13151a]">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
            <LifeBuoy className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Conversation</h2>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {ticket.comments.length === 0 ? 'Waiting for the support team' : `${ticket.comments.length} message${ticket.comments.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        {ticket.comments.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            No replies yet. The support team has been notified and will answer here.
          </p>
        ) : (
          <ul className="mt-4 max-h-[520px] space-y-4 overflow-y-auto pr-1">
            {ticket.comments.map((c) => {
              const mine = c.authorType === 'Merchant';
              return (
                <li key={c.commentId} className={cn('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
                  {!mine && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <LifeBuoy className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                      mine ? 'rounded-br-sm bg-primary-600 text-white' : 'rounded-bl-sm bg-slate-100 dark:bg-slate-900',
                    )}
                  >
                    <p className={cn('mb-1 text-[11px] font-bold', mine ? 'text-white/85' : 'text-slate-500 dark:text-slate-400')}>
                      {mine ? 'You' : `${brand} support`}
                      <span className={cn('font-medium', mine ? 'text-white/60' : 'text-slate-400 dark:text-slate-500')}>
                        {' · '}{formatDate(c.createdAt, 'datetime')}
                      </span>
                    </p>
                    <p className="whitespace-pre-wrap">{c.content}</p>
                  </div>
                  {mine && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                      <User className="h-4 w-4" />
                    </span>
                  )}
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