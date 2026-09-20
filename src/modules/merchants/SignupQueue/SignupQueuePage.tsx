/**
 * Signup Queue page — 2026-08-12 rework: the enquiry inbox. See SignupQueueWrapper for
 * the model. Row click → enquiry details; decisions: Onboard (wizard) / Reject (reason).
 */

import React, { useState } from 'react';
import {
  Building2, Globe, UserCog, Search, RefreshCw, Plus, ArrowRight, X,
} from 'lucide-react';

import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMTextArea } from '@/shared/ui/ATMTextArea';
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-500/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Signup Queue</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              New merchant enquiries. Review the details, then decide — onboard or reject.
              Onboarded merchants appear in All Merchants once activated.
            </p>
          </div>
        </div>
        <ATMButton variant="primary" icon={Plus} onClick={onNewSignup}>
          New Signup
        </ATMButton>
      </div>

      {/* Triage stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="p-4 rounded-xl border border-[var(--zen-border)] bg-[var(--zen-surface)]">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {t.label}
            </span>
            <span className={cn('text-xl font-black mt-1 inline-block', t.accent)}>{t.value}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <ATMCard className="glass-card" padding="md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--zen-border)] bg-white dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
              placeholder="Search by business name, email, or nature…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60">
                  {['Business', 'Source', 'Business Nature', 'Status', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {filteredSignups.map((s) => {
                  const awaiting = isAwaitingDecision(s);
                  return (
                    <tr
                      key={s.merchantId}
                      className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
                      onClick={() => setSelected(s)}
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{s.companyName}</p>
                        <p className="text-[11px] text-slate-400">{s.basicInfo?.contactEmail}</p>
                      </td>
                      <td className="px-4 py-3"><SourceBadge source={s.signupSource} /></td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {s.basicInfo?.businessNature || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {awaiting ? (
                          <ATMBadge variant="warning" size="sm">Awaiting decision</ATMBadge>
                        ) : (
                          <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
                            Onboarding — Step {stepNumber(s)} of {stepTotal(s)} ({STEP_LABEL[s.currentStep]})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {formatDate((s as any).createdAt ?? '', 'short') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <ATMButton
                            variant="outline" size="sm" icon={ArrowRight}
                            onClick={() => onContinue(s.merchantId)}
                          >
                            {awaiting ? 'Onboard' : 'Continue'}
                          </ATMButton>
                          <button
                            type="button"
                            title="Reject signup"
                            onClick={() => openReject(s)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
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

      {/* Enquiry details */}
      <ATMModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.companyName ?? 'Enquiry'}
        subtitle="Signup enquiry details"
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ['Company / Individual', selected.companyName],
                ['Contact person', selected.basicInfo?.contactName],
                ['Email', selected.basicInfo?.contactEmail],
                ['Phone', selected.basicInfo?.contactPhone || '—'],
                ['Business nature', selected.basicInfo?.businessNature || '—'],
                ['Country', selected.basicInfo?.country],
                ['Submitted', formatDate((selected as any).createdAt ?? '', 'long') || '—'],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Source</p>
                <p className="mt-0.5"><SourceBadge source={selected.signupSource} /></p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                  {isAwaitingDecision(selected)
                    ? 'Awaiting decision'
                    : `Onboarding — Step ${stepNumber(selected)} of ${stepTotal(selected)} (${STEP_LABEL[selected.currentStep]})`}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <ATMButton variant="outline" size="sm" onClick={() => openReject(selected)}>
                Reject
              </ATMButton>
              <ATMButton
                variant="primary" size="sm" icon={ArrowRight}
                onClick={() => onContinue(selected.merchantId)}
              >
                {isAwaitingDecision(selected) ? 'Onboard' : 'Continue Onboarding'}
              </ATMButton>
            </div>
          </div>
        )}
      </ATMModal>

      {/* Reject dialog */}
      <ATMModal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={`Reject "${rejecting?.companyName ?? ''}"?`}
        subtitle="The signup is removed from the queue permanently (audit-logged)."
        size="md"
      >
        <div className="space-y-4">
          <ATMTextArea
            name="rejectReason"
            label="Reason (required)"
            placeholder="e.g. Duplicate enquiry, spam signup, business type not supported…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <ATMButton variant="outline" size="sm" onClick={() => setRejecting(null)}>
              Cancel
            </ATMButton>
            <ATMButton
              variant="primary" size="sm" icon={X}
              isLoading={isRejecting}
              disabled={!rejectReason.trim()}
              onClick={submitReject}
            >
              Reject Signup
            </ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
};

export default SignupQueuePage;
