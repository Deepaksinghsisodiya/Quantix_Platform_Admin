import React, { useState } from 'react';
import {
  Mail,
  Send,
  Download,
  FileText,
  User,
  Key,
  CheckCircle2,
  Clock,
  BookOpen,
  Headphones,
} from 'lucide-react';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMCard } from '@/shared/ui/ATMCard';
import { cn } from '@/lib/utils/cn';
import type { MerchantType } from '@/lib/types';

/* -------------------------------------------------------------------------- */
/*  FRS-SAP-307: Welcome Communications                                      */
/*                                                                            */
/*  Enterprise: welcome email with login credentials, getting-started guide, */
/*              assigned support contact                                      */
/*  Standalone: welcome email with recharge token, installation guide        */
/*              download link, offline setup instructions, support contact    */
/* -------------------------------------------------------------------------- */

interface CommunicationLog {
  id: string;
  type: string;
  recipient: string;
  sentAt: string | null;
  status: 'Sent' | 'Pending' | 'Failed';
}

export interface WelcomeCommunicationsProps {
  merchantType: MerchantType;
  merchantId: string;
  email: string;
  contactPerson: string;
}

const STATUS_CONFIG = {
  Sent: { variant: 'success' as const, icon: CheckCircle2 },
  Pending: { variant: 'warning' as const, icon: Clock },
  Failed: { variant: 'danger' as const, icon: Clock },
};

export function WelcomeCommunications({
  merchantType,
  merchantId,
  email,
  contactPerson,
}: WelcomeCommunicationsProps) {
  const [sending, setSending] = useState<string | null>(null);

  // Mock communication log based on merchant type
  const [communications, setCommunications] = useState<CommunicationLog[]>(() => {
    if (merchantType === 'Enterprise') {
      return [
        { id: 'wc-1', type: 'Welcome Email + Login Credentials', recipient: email, sentAt: '2026-03-28T10:00:00Z', status: 'Sent' },
        { id: 'wc-2', type: 'Getting Started Guide', recipient: email, sentAt: '2026-03-28T10:00:00Z', status: 'Sent' },
        { id: 'wc-3', type: 'Support Contact Assignment', recipient: email, sentAt: null, status: 'Pending' },
      ];
    }
    return [
      { id: 'wc-1', type: 'Welcome Email + Recharge Token', recipient: email, sentAt: '2026-03-28T10:00:00Z', status: 'Sent' },
      { id: 'wc-2', type: 'Installation Guide Download Link', recipient: email, sentAt: '2026-03-28T10:00:00Z', status: 'Sent' },
      { id: 'wc-3', type: 'Offline Setup Instructions', recipient: email, sentAt: null, status: 'Pending' },
      { id: 'wc-4', type: 'Support Contact Details', recipient: email, sentAt: null, status: 'Pending' },
    ];
  });

  const handleSend = async (commId: string) => {
    setSending(commId);
    await new Promise((r) => setTimeout(r, 800));
    setCommunications((prev) =>
      prev.map((c) =>
        c.id === commId
          ? { ...c, status: 'Sent' as const, sentAt: new Date().toISOString() }
          : c,
      ),
    );
    setSending(null);
  };

  const handleResendAll = async () => {
    setSending('all');
    await new Promise((r) => setTimeout(r, 1200));
    setCommunications((prev) =>
      prev.map((c) => ({ ...c, status: 'Sent' as const, sentAt: new Date().toISOString() })),
    );
    setSending(null);
  };

  const formatTime = (ts: string | null) => {
    if (!ts) return 'Pending send';
    return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ATMCard title="Welcome Communications" padding="md">
      <div className="space-y-4 pt-1">
        {/* Recipient info */}
        <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 px-3.5 py-2.5">
          <User className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <div className="text-xs flex items-center gap-2 flex-wrap font-semibold text-gray-600 dark:text-gray-300">
            <span className="font-bold text-gray-900 dark:text-white">{contactPerson}</span>
            <span className="text-gray-400 dark:text-gray-600">&middot;</span>
            <span className="font-mono text-gray-550 dark:text-gray-400">{email}</span>
          </div>
        </div>

        {/* Communication items */}
        <div className="space-y-2.5">
          {communications.map((comm) => {
            const cfg = STATUS_CONFIG[comm.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={comm.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-zen-surface px-4 py-3 dark:border-gray-800/80 shadow-sm transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusIcon className={cn('h-4.5 w-4.5 shrink-0', comm.status === 'Sent' ? 'text-emerald-500' : comm.status === 'Failed' ? 'text-red-500' : 'text-amber-500')} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{comm.type}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">{formatTime(comm.sentAt)}</p>
                  </div>
                </div>
                {comm.status !== 'Sent' && (
                  <ATMButton
                    variant="ghost"
                    size="sm"
                    isLoading={sending === comm.id}
                    onClick={() => handleSend(comm.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <Send className="h-3.5 w-3.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
                  </ATMButton>
                )}
                {comm.status === 'Sent' && (
                  <ATMBadge label="Sent" color="success" size="sm" />
                )}
              </div>
            );
          })}
        </div>

        {/* Type-specific actions */}
        <div className="space-y-2.5 py-1">
          {merchantType === 'Enterprise' && (
            <>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <BookOpen className="h-4.5 w-4.5 text-accent-500/80 shrink-0" />
                <span>Getting-started guide included in welcome email</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <Headphones className="h-4.5 w-4.5 text-accent-500/80 shrink-0" />
                <span>Assigned support contact: <strong className="text-gray-700 dark:text-gray-300 font-bold">Li Wei</strong></span>
              </div>
            </>
          )}
          {merchantType === 'Standalone' && (
            <>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <Key className="h-4.5 w-4.5 text-accent-500/80 shrink-0" />
                <span>Recharge token attached to welcome email</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <Download className="h-4.5 w-4.5 text-accent-500/80 shrink-0" />
                <span>Installation guide download link included</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <FileText className="h-4.5 w-4.5 text-accent-500/80 shrink-0" />
                <span>Offline setup instructions PDF attached</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <Headphones className="h-4.5 w-4.5 text-accent-500/80 shrink-0" />
                <span>Support contact: <strong className="text-gray-700 dark:text-gray-300 font-bold">Li Wei</strong></span>
              </div>
            </>
          )}
        </div>

        {/* Resend all */}
        <ATMButton
          variant="secondary"
          size="sm"
          fullWidth
          icon={Mail}
          isLoading={sending === 'all'}
          onClick={handleResendAll}
          className="mt-2"
        >
          Resend All Communications
        </ATMButton>
      </div>
    </ATMCard>
  );
}
