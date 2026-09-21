/**
 * Signup Queue page — 2026-08-12 rework: the enquiry inbox. See SignupQueueWrapper for
 * the model. Row click → enquiry details; decisions: Onboard (wizard) / Reject (reason).
 */

import React, { useState } from 'react';
import {
  Building2, Globe, UserCog, Search, RefreshCw, Plus, ArrowRight, X, Clock, TrendingUp,
  Mail, Phone, User, Calendar, Briefcase, AlertCircle,
} from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
import { ATMIconButton } from '@/shared/ui/ATMIconButton';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import type { WizardState, WizardStepKey } from '../OnboardingWizard/wizard.types';

// ---------------------------------------------------------------------------

// 2026-08-30: the local STEP_ORDER mirror is gone — the server's `steps` array is the
// single source for both the step number and the total (the label said "of 7" while the
// wizard has 8 steps, producing "Step 8 of 7").
const STEP_LABEL: Record<WizardStepKey, string> = {
  basic_info: 'Basic Info',
  type_plan: 'Type & Plan',
  kyc: 'KYC',
  payment: 'Payment',
  terminals: 'Terminals',
  fund: 'Fund',
  provision: 'Provision',
  activate: 'Ready to Activate',
};

/** Awaiting the onboard/reject decision = no onboarding progress beyond signup yet. */
export function isAwaitingDecision(s: WizardState): boolean {
  return s.currentStep === 'basic_info' || s.currentStep === 'type_plan';
}

function stepNumber(s: WizardState): number {
  const idx = (s.steps ?? []).findIndex((st) => st.key === s.currentStep);
  return idx < 0 ? 1 : idx + 1;
}

function stepTotal(s: WizardState): number {
  return s.steps?.length || 8;
}

function isWebsite(s: WizardState): boolean {
  return !(s.signupSource ?? '').startsWith('admin');
}

function withinDays(iso: string | undefined, days: number): boolean {
  if (!iso) return false;
  const d = new Date(/Z|[+-]\d\d:\d\d$/.test(iso) ? iso : iso + 'Z');
  return Date.now() - d.getTime() < days * 24 * 3600 * 1000;
}

function SourceBadge({ source }: { source: string | null }) {
  const isAdmin = (source ?? '').startsWith('admin');
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider',
      isAdmin
        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
        : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    )}>
      {isAdmin ? <UserCog size={10} /> : <Globe size={10} />}
      {isAdmin ? 'Admin' : 'Website'}
    </span>
  );
}

// ---------------------------------------------------------------------------

interface SignupQueuePageProps {
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  signups: WizardState[];
  filteredSignups: WizardState[];
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sourceFilter: 'all' | 'website' | 'admin';
  setSourceFilter: (v: 'all' | 'website' | 'admin') => void;
  stageFilter: 'all' | 'awaiting' | 'onboarding';
  setStageFilter: (v: 'all' | 'awaiting' | 'onboarding') => void;
  isRejecting: boolean;
  onNewSignup: () => void;
  onContinue: (merchantId: string) => void;
  onReject: (merchantId: string, reason: string) => Promise<boolean>;
}

const SignupQueuePage: React.FC<SignupQueuePageProps> = ({
  isLoading, isFetching, refetch,
  signups, filteredSignups,
  autoRefresh, setAutoRefresh,
  searchQuery, setSearchQuery,
  sourceFilter, setSourceFilter,
  stageFilter, setStageFilter,
  isRejecting,
  onNewSignup, onContinue, onReject,
}) => {
  const [selected, setSelected] = useState<WizardState | null>(null);
  const [rejecting, setRejecting] = useState<WizardState | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const stats = {
    newThisWeek: signups.filter((s) => withinDays((s as any).createdAt, 7)).length,
    website: signups.filter(isWebsite).length,
    admin: signups.filter((s) => !isWebsite(s)).length,
    onboarding: signups.filter((s) => !isAwaitingDecision(s)).length,
  };

  const openReject = (s: WizardState) => {
    setRejectReason('');
    setRejecting(s);
  };

  const submitReject = async () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) return;
    const ok = await onReject(rejecting.merchantId, rejectReason.trim());
    if (ok) {
      setRejecting(null);
      setSelected(null);
    }
  };

  const tiles: { label: string; value: number; accent: string }[] = [
    { label: 'New this week', value: stats.newThisWeek, accent: 'text-sky-600 dark:text-sky-400' },
    { label: 'From website', value: stats.website, accent: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Admin-entered', value: stats.admin, accent: 'text-slate-600 dark:text-slate-300' },
    { label: 'In onboarding', value: stats.onboarding, accent: 'text-violet-600 dark:text-violet-400' },
  ];

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1600px] mx-auto animate-page-enter">
      {/* Page Header */}
      <ATMPageHeader
        title="Signup Queue"
        subtitle="New merchant enquiries. Review the details, then decide — onboard or reject. Onboarded merchants appear in All Merchants once activated."
        icon={Building2}
        iconColor="theme"
        action={{
          label: 'New Signup',
          icon: Plus,
          onClick: onNewSignup,
        }}
      />

      {/* Triage stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ATMStatsCard
          label="New this week"
          value={stats.newThisWeek}
          icon={Clock}
          variant="accent"
        />
        <ATMStatsCard
          label="From website"
          value={stats.website}
          icon={Globe}
          variant="emerald"
        />
        <ATMStatsCard
          label="Admin-entered"
          value={stats.admin}
          icon={UserCog}
          variant="slate"
        />
        <ATMStatsCard
          label="In onboarding"
          value={stats.onboarding}
          icon={TrendingUp}
          variant="purple"
        />
      </div>

      {/* Toolbar */}
      <ATMCard className="glass-card" padding="md">
        <div className="flex items-center gap-3 flex-wrap">
          <ATMTextField
            size="md"
            className="flex-1 min-w-[220px]"
            prefix={<Search size={14} className="text-slate-400" />}
            placeholder="Search by business name, email, or nature…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Stage filter */}
          <div className="flex items-center border border-[var(--zen-border)] rounded-lg p-0.5 bg-slate-50 dark:bg-zinc-950">
            {([['all', 'All'], ['awaiting', 'Awaiting decision'], ['onboarding', 'In onboarding']] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setStageFilter(v)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-[11px] font-bold transition-all',
                  stageFilter === v
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Source filter */}
          <div className="flex items-center border border-[var(--zen-border)] rounded-lg p-0.5 bg-slate-50 dark:bg-zinc-950">
            {(['all', 'website', 'admin'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-[11px] font-bold capitalize transition-all',
                  sourceFilter === s
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2">
              <ATMSwitch name="autoRefresh" checked={autoRefresh} onChange={setAutoRefresh} size="sm" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Auto-refresh</span>
            </div>
            <ATMButton variant="outline" size="sm" icon={RefreshCw} onClick={refetch} isLoading={isFetching}>
              Refresh
            </ATMButton>
          </div>
        </div>
      </ATMCard>

      {/* List */}
      <ATMCard className="glass-card" padding="none">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : filteredSignups.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="mx-auto h-10 w-10 text-slate-200 dark:text-slate-700" />
            <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
              {signups.length === 0 ? 'No signups in the queue.' : 'No signups match the current filters.'}
            </p>
            {signups.length === 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Start one with "New Signup" — or wait for website self-signups to land here.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 dark:bg-[#121215]/80 backdrop-blur-md">
                <tr>
                  {['Business', 'Source', 'Business Nature', 'Status', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-4 border-b border-[var(--zen-border)] text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSignups.map((s) => {
                  const awaiting = isAwaitingDecision(s);
                  return (
                    <tr
                      key={s.merchantId}
                      className="transition-colors duration-200 cursor-pointer border-b border-[var(--zen-border)] hover:bg-slate-50/80 dark:hover:bg-zinc-900/60 group"
                      onClick={() => setSelected(s)}
                    >
                      <td className="px-5 py-4 border-b border-[var(--zen-border)]">
                        <div className="min-w-0">
                          <p className="truncate max-w-[220px] text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" title={s.companyName}>{s.companyName}</p>
                          <p className="truncate max-w-[220px] text-[11px] text-slate-400 font-medium mt-0.5" title={s.basicInfo?.contactEmail}>{s.basicInfo?.contactEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 border-b border-[var(--zen-border)]"><SourceBadge source={s.signupSource} /></td>
                      <td className="px-5 py-4 border-b border-[var(--zen-border)]">
                        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                          {s.basicInfo?.businessNature || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 border-b border-[var(--zen-border)]">
                        {awaiting ? (
                          <ATMBadge variant="warning" size="sm">Awaiting decision</ATMBadge>
                        ) : (
                          <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-1 rounded-md">
                            Onboarding — Step {stepNumber(s)} of {stepTotal(s)} ({STEP_LABEL[s.currentStep]})
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 border-b border-[var(--zen-border)] text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        {formatDate((s as any).createdAt ?? '', 'short') || '—'}
                      </td>
                      <td className="px-5 py-4 border-b border-[var(--zen-border)]">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <ATMButton
                            variant="outline" size="sm" icon={ArrowRight}
                            onClick={() => onContinue(s.merchantId)}
                          >
                            {awaiting ? 'Onboard' : 'Continue'}
                          </ATMButton>
                          <ATMIconButton
                            type="button"
                            icon={X}
                            variant="danger"
                            size="sm"
                            tooltip="Reject signup"
                            onClick={() => openReject(s)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ATMCard>

      {/* Enquiry details modal */}
      <ATMModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.companyName ?? 'Enquiry Details'}
        subtitle="Review prospective merchant profile before onboarding"
        size="2xl"
      >
        {selected && (
          <div className="space-y-6 pt-1">
            {/* Merchant Identity Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[var(--zen-border)] bg-slate-50 dark:bg-zinc-900/60 p-5">
              <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-primary-500/10 blur-2xl" />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 text-white shadow-md shadow-primary-500/20">
                    <Building2 size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{selected.companyName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <SourceBadge source={selected.signupSource} />
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs font-mono text-slate-400">ID: {selected.merchantId.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
                <div>
                  {isAwaitingDecision(selected) ? (
                    <ATMBadge variant="warning" size="md">Awaiting decision</ATMBadge>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 border border-primary-200/50 dark:border-primary-500/20 px-3 py-1.5 rounded-lg">
                      Step {stepNumber(selected)} of {stepTotal(selected)} ({STEP_LABEL[selected.currentStep]})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                <span className="h-px w-4 bg-slate-200 dark:bg-slate-700" />
                Merchant Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-[var(--zen-border)] bg-white dark:bg-zinc-950 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 mt-0.5">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Person</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{selected.basicInfo?.contactName || '—'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--zen-border)] bg-white dark:bg-zinc-950 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Email</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{selected.basicInfo?.contactEmail || '—'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--zen-border)] bg-white dark:bg-zinc-950 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Phone</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{selected.basicInfo?.contactPhone || '—'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--zen-border)] bg-white dark:bg-zinc-950 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 mt-0.5">
                    <Briefcase size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Nature</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{selected.basicInfo?.businessNature || '—'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--zen-border)] bg-white dark:bg-zinc-950 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 mt-0.5">
                    <Globe size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Country</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{selected.basicInfo?.country || '—'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[var(--zen-border)] bg-white dark:bg-zinc-950 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 mt-0.5">
                    <Calendar size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submission Date</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-words">{formatDate((selected as any).createdAt ?? '', 'long') || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="flex items-center justify-between gap-3 border-t border-[var(--zen-border)] pt-5">
              <ATMButton
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/20"
                onClick={() => openReject(selected)}
              >
                Reject Enquiry
              </ATMButton>
              <div className="flex items-center gap-2.5">
                <ATMButton variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  Close
                </ATMButton>
                <ATMButton
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => onContinue(selected.merchantId)}
                >
                  {isAwaitingDecision(selected) ? 'Start Onboarding' : 'Continue Onboarding'}
                </ATMButton>
              </div>
            </div>
          </div>
        )}
      </ATMModal>

      {/* Reject dialog */}
      <ATMModal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={`Reject "${rejecting?.companyName ?? ''}"?`}
        subtitle="This enquiry will be permanently removed from the queue and audit logged."
        size="md"
      >
        <div className="space-y-5 pt-1">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50/70 border border-red-200/60 dark:bg-red-950/20 dark:border-red-900/30">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed font-medium">
              Rejecting will remove this enquiry from the active queue. An audit log entry is created with your specified reason.
            </p>
          </div>

          <ATMTextArea
            name="rejectReason"
            label="Reason for Rejection"
            placeholder="e.g. Duplicate enquiry, unsupported business activity, fake contact info…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 border-t border-[var(--zen-border)] pt-4">
            <ATMButton variant="outline" size="sm" onClick={() => setRejecting(null)}>
              Cancel
            </ATMButton>
            <ATMButton
              variant="danger"
              size="sm"
              icon={X}
              isLoading={isRejecting}
              disabled={!rejectReason.trim()}
              onClick={submitReject}
            >
              Reject & Remove
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
};

export default SignupQueuePage;
