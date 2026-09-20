import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Cloud,
  CreditCard,
  Download,
  FileText,
  Globe,
  Mail,
  MoreVertical,
  Pause,
  Phone,
  PlayCircle,
  RefreshCw,
  Sliders,
  Store,
  Trash2,
  User,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Monitor,
  Check,
  AlertCircle,
  Pencil,
} from 'lucide-react';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, StatusBadge, BadgeColor } from '@/shared/ui/ATMBadge';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSelectField } from '@/shared/ui/ATMSelectField';
import { ATMModal } from '@/shared/ui/ATMModal';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMTabs, ATMAvatar, ATMDetailRow, ATMSectionHeader, ATMActionSidebarItem } from '@/shared/ui';
import { WelcomeCommunications } from '../components/WelcomeCommunications';
import EnterprisePanels from '../components/EnterprisePanels';
import StandalonePanels from '../components/StandalonePanels';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import type {
  Merchant,
  MerchantNote,
  OnboardingChecklist,
  MerchantStatus,
  MerchantType,
  MerchantDeboarding,
  DeboardingStatus,
} from '../types/merchant.types';
import { DEBOARDING_STATUS_LABEL } from '../types/merchant.types';
import type { WizardPlanOption } from '../OnboardingWizard/wizard.types';
import { useGetSetupStatusQuery } from '@/modules/settings/services/settingsApi';

interface MerchantDetailPageProps {
  id: string;
  merchant: Merchant | undefined;
  /** FRS-SAP-402 (2026-08-05): rich detail payload for the type-specific panels. */
  detail: import('../types/merchantDetail.types').MerchantDetailPayload | null;
  isDetailLoading: boolean;
  isMerchantLoading: boolean;
  merchantError: any;
  notes: readonly MerchantNote[];
  timeline: readonly any[];
  actionLoading: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  handleAction: (action: string) => Promise<void>;

  suspendModal: boolean;
  setSuspendModal: (open: boolean) => void;
  suspendReason: string;
  setSuspendReason: (val: string) => void;
  suspendCategory: string;
  setSuspendCategory: (val: string) => void;
  handleSuspendConfirm: () => Promise<void>;
  isSuspending: boolean;

  reactivateModal: boolean;
  setReactivateModal: (open: boolean) => void;
  reactivateResolution: string;
  setReactivateResolution: (val: string) => void;
  handleReactivateConfirm: () => Promise<void>;
  isReactivating: boolean;

  // 2026-08-30: legacy Cancel/Delete modals removed (retired Pass-39 flows; DELETE
  // endpoint returns 410) — the deboard consent modal is the one exit entry point.
  deboardModal: boolean;
  setDeboardModal: (open: boolean) => void;
  deboardNote: string;
  setDeboardNote: (val: string) => void;
  handleDeboardConfirm: () => Promise<void>;

  // 2026-08-30: tier fiction removed — the modal lists real catalog plans (same
  // deployment kind, active, not deprecated) and submits the planId.
  planChangeModal: boolean;
  setPlanChangeModal: (open: boolean) => void;
  planOptions: WizardPlanOption[];
  selectedNewPlan: string | null;
  setSelectedNewPlan: (val: string | null) => void;
  planChangeReason: string;
  setPlanChangeReason: (val: string) => void;
  /** Per-merchant discount (%) — onboarding parity; sent as dailyPriceOverride. */
  planDiscountPct: number;
  setPlanDiscountPct: (val: number) => void;
  handleApplyPlanChange: () => Promise<void>;
  isChangingPlan: boolean;

  handleAddNote: (content: string) => Promise<void>;
  onBack: () => void;

  deboarding: MerchantDeboarding | undefined;
  handleDeactivateDeboarding: (deboardingId: string) => Promise<void>;
  handleGenerateFinalInvoice: (deboardingId: string) => Promise<void>;
  handleSettleDeboarding: (deboardingId: string) => Promise<void>;
  handleAskRecharge: (deboardingId: string, shortfallAmount: number, note?: string) => Promise<void>;
  handleIssueRefund: (deboardingId: string, channel: string, reference?: string, note?: string) => Promise<void>;
  handleCancelDeboarding: (deboardingId: string, reason: string) => Promise<void>;
  handleRetrySettleDeboarding: (deboardingId: string) => Promise<void>;
  handleSoftDeleteDeboarding: (deboardingId: string) => Promise<void>;
}

// Action dropdown item helper
function ActionItem({
  icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'warning' | 'danger';
}) {
  const colorMap = {
    default: 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800/50',
    warning: 'text-amber-600 hover:bg-amber-50/50 dark:text-amber-400 dark:hover:bg-amber-950/20',
    danger: 'text-red-600 hover:bg-red-50/50 dark:text-red-400 dark:hover:bg-red-950/20',
  };
  return (
    <button
      type="button"
      className={cn('flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-bold transition-colors', colorMap[variant])}
      onClick={onClick}
    >
      <span className="shrink-0 opacity-80">{icon}</span>
      {label}
    </button>
  );
}

function MerchantTypeBadge({ type }: { type: MerchantType }) {
  return (
    <ATMBadge
      label={type}
      color={type === 'Enterprise' ? 'purple' : 'muted'}
      size="sm"
    />
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</dt>
        <dd className="mt-0.5 text-sm font-bold text-gray-950 dark:text-white break-words">{value}</dd>
      </div>
    </div>
  );
}

function OnboardingChecklistPanel({ checklist }: { checklist: OnboardingChecklist }) {
  const items: { key: keyof OnboardingChecklist; label: string }[] = [
    { key: 'accountVerified', label: 'Account verified' },
    { key: 'profileCompleted', label: 'Profile completed' },
    { key: 'firstLocationAdded', label: 'First location added' },
    { key: 'firstTerminalActivated', label: 'First terminal activated' },
    { key: 'paymentMethodConfigured', label: 'Payment method configured' },
    { key: 'firstTransactionCompleted', label: 'First transaction completed' },
  ];
  const completed = items.filter((i) => checklist[i.key] === true).length;
  const progress = Math.round((completed / items.length) * 100);

  return (
    <ATMCard title="Onboarding Checklist" className="glass-card">
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400">
          <span>Progress</span>
          <span className="text-gray-900 dark:text-white font-black">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className={cn('h-full rounded-full transition-all duration-500', progress === 100 ? 'bg-emerald-500' : 'bg-accent-600')}
          />
        </div>
        <ul className="space-y-2.5">
          {items.map((item) => {
            const done = checklist[item.key] === true;
            return (
              <li key={item.key} className="flex items-center gap-3 text-sm">
                {done ? (
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-4.5 w-4.5 shrink-0 text-gray-300 dark:text-gray-700" />
                )}
                <span className={cn('font-semibold', done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100')}>
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
        {checklist.completedAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold italic mt-2">
            Completed {formatDate(checklist.completedAt, 'relative')}
          </p>
        )}
      </div>
    </ATMCard>
  );
}

const STATUS_COLOR: Record<DeboardingStatus, BadgeColor> = {
  ConsentGiven: 'primary',
  Deactivated: 'warning',
  AwaitingSettlement: 'warning',
  AwaitingRecharge: 'warning',
  AdminEscalated: 'danger',
  BillingSettled: 'primary',
  RefundIssued: 'primary',
  Completed: 'success',
  Cancelled: 'muted',
};

function latestActivity(d: MerchantDeboarding): string {
  const candidates = [
    d.completedAt, d.cancelledAt, d.refundIssuedAt, d.billingSettledAt,
    d.merchantRechargedAt, d.merchantRechargeAskedAt, d.finalInvoiceGeneratedAt,
    d.deactivatedAt, d.consentGivenAt
  ].filter((x): x is string => !!x);
  return candidates[0] ?? d.consentGivenAt;
}

// 2026-08-30 (user: "UI not clean"): readable status chips + a one-line purpose under
// each step so the checklist explains itself. The Deactivate description also draws the
// line against Suspend — both actions were visible with no hint of the difference.
const STEP_STATUS_LABEL: Record<string, string> = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Completed: 'Completed',
  NotApplicable: 'Not Applicable',
};

const STEP_DESCRIPTION: Record<string, string> = {
  ConsentGiven: 'Admin approval that starts the exit workflow.',
  AccountDeactivated: 'Stops service and revokes tokens as part of leaving — unlike Suspend, which is a temporary pause outside deboarding.',
  FinalInvoiceGenerated: 'Bills all unbilled subscription days up to deactivation.',
  BillingSettled: 'Clears the final invoice from the wallet (or requests a shortfall recharge).',
  RefundIssued: 'Returns the remaining wallet balance and security deposit.',
  SoftDeleted: 'Archives the merchant. Point of no return.',
};

function DeboardingWorkflowCard({
  deboarding,
  onDeactivate,
  onGenerateInvoice,
  onSettle,
  onAskRecharge,
  onIssueRefund,
  onCancel,
  onRetrySettle,
  onSoftDelete,
}: {
  deboarding: MerchantDeboarding;
  onDeactivate: (dbId: string) => Promise<void>;
  onGenerateInvoice: (dbId: string) => Promise<void>;
  onSettle: (dbId: string) => Promise<void>;
  onAskRecharge: (dbId: string, amount: number, note?: string) => Promise<void>;
  onIssueRefund: (dbId: string, channel: string, ref?: string, note?: string) => Promise<void>;
  onCancel: (dbId: string, reason: string) => Promise<void>;
  onRetrySettle: (dbId: string) => Promise<void>;
  onSoftDelete: (dbId: string) => Promise<void>;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundChannel, setRefundChannel] = useState('CreditCard');
  const [refundRef, setRefundRef] = useState('');
  const [softDeleteOpen, setSoftDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const steps = deboarding.steps || [];
  // AwaitingRecharge / AdminEscalated: settlement is waiting on the merchant's recharge —
  // "Settle Billing" would be refused; the correct action is the retry endpoint.
  const awaitingRecharge = deboarding.status === 'AwaitingRecharge' || deboarding.status === 'AdminEscalated';
  // 2026-08-30: the service never emits step-status "InProgress" (rows go Pending →
  // Completed), so buttons keyed on it alone NEVER rendered. The actionable step is the
  // first non-completed, applicable one while the workflow is open.
  const workflowOpen = deboarding.status !== 'Completed' && deboarding.status !== 'Cancelled';
  const nextActionableKey = workflowOpen
    ? steps.find((s) => s.status === 'Pending' || s.status === 'InProgress')?.stepKey
    : undefined;

  return (
    <ATMCard title="Deboarding Workflow" className="border-amber-250 bg-amber-50/10 dark:border-amber-900/30">
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Deboarding</span>
            <span
              className="font-mono text-[11px] uppercase text-gray-400 dark:text-gray-500"
              title={deboarding.deboardingId}
            >
              {deboarding.deboardingId.slice(0, 8)}
            </span>
          </div>
          <ATMBadge label={DEBOARDING_STATUS_LABEL[deboarding.status] ?? deboarding.status} color={STATUS_COLOR[deboarding.status]} size="sm" />
        </div>

        {deboarding.status !== 'Completed' && deboarding.status !== 'Cancelled' && (
          <div className="flex justify-end gap-2">
            <ATMButton variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
              Cancel Workflow
            </ATMButton>
          </div>
        )}

        {/* Steps List */}
        <div className="relative pl-8 pt-2 space-y-5">
          <div className="absolute left-[13px] top-3 bottom-3 w-px bg-gray-200 dark:bg-gray-800" />
          {steps.map((step) => {
            const isCompleted = step.status === 'Completed';
            const isInProgress = step.status === 'InProgress';
            const isNotApplicable = step.status === 'NotApplicable';

            return (
              <div key={step.stepKey} className={cn('relative flex gap-3 items-start animate-fade-in', isNotApplicable && 'opacity-60')}>
                <span className={cn(
                  "absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-gray-950 text-white",
                  isCompleted ? "bg-emerald-500" : isInProgress ? "bg-amber-500" : isNotApplicable ? "bg-slate-300 dark:bg-slate-700" : "bg-gray-200 dark:bg-gray-800"
                )}>
                  {isCompleted ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{step.stepLabel}</p>
                    <ATMBadge
                      size="sm"
                      color={isCompleted ? 'success' : isInProgress ? 'warning' : 'muted'}
                      label={STEP_STATUS_LABEL[step.status] ?? step.status}
                    />
                  </div>
                  {!isCompleted && STEP_DESCRIPTION[step.stepKey] && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-md">
                      {STEP_DESCRIPTION[step.stepKey]}
                    </p>
                  )}
                  {step.completedAt && (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">
                      Completed {formatDate(step.completedAt, 'datetime')}
                      {step.completedByName ? <> &middot; by {step.completedByName}</> : null}
                    </p>
                  )}
                  {step.note && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                      Note: {step.note}
                    </p>
                  )}

                  {/* Step Action Triggers — first open step (service never emits InProgress) */}
                  {(isInProgress || step.stepKey === nextActionableKey) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.stepKey === 'AccountDeactivated' && (
                        <ATMButton
                          size="sm"
                          variant="primary"
                          onClick={async () => {
                            setSubmitting(true);
                            await onDeactivate(deboarding.deboardingId);
                            setSubmitting(false);
                          }}
                          isLoading={submitting}
                        >
                          Deactivate Account
                        </ATMButton>
                      )}
                      {step.stepKey === 'FinalInvoiceGenerated' && (
                        <ATMButton
                          size="sm"
                          variant="primary"
                          onClick={async () => {
                            setSubmitting(true);
                            await onGenerateInvoice(deboarding.deboardingId);
                            setSubmitting(false);
                          }}
                          isLoading={submitting}
                        >
                          Generate Final Invoice
                        </ATMButton>
                      )}
                      {step.stepKey === 'BillingSettled' && (awaitingRecharge ? (
                        <ATMButton
                          size="sm"
                          variant="primary"
                          onClick={async () => {
                            setSubmitting(true);
                            await onRetrySettle(deboarding.deboardingId);
                            setSubmitting(false);
                          }}
                          isLoading={submitting}
                        >
                          Retry Settle (after recharge)
                        </ATMButton>
                      ) : (
                        <>
                          <ATMButton
                            size="sm"
                            variant="primary"
                            onClick={async () => {
                              setSubmitting(true);
                              await onSettle(deboarding.deboardingId);
                              setSubmitting(false);
                            }}
                            isLoading={submitting}
                          >
                            Settle Billing
                          </ATMButton>
                          <ATMButton
                            size="sm"
                            variant="outline"
                            onClick={() => setRechargeOpen(true)}
                          >
                            Request Recharge
                          </ATMButton>
                        </>
                      ))}
                      {step.stepKey === 'RefundIssued' && (
                        <ATMButton
                          size="sm"
                          variant="primary"
                          onClick={() => setRefundOpen(true)}
                        >
                          Issue Refund
                        </ATMButton>
                      )}
                      {/* 2026-08-30: the FINAL step had no trigger — every deboarding
                          stalled at RefundIssued forever. Point of no return: confirmed. */}
                      {step.stepKey === 'SoftDeleted' && (
                        <ATMButton
                          size="sm"
                          variant="danger"
                          onClick={() => setSoftDeleteOpen(true)}
                        >
                          Soft-Delete Merchant
                        </ATMButton>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel Deboarding Dialog */}
      <ATMModal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Deboarding">
        <div className="space-y-4">
          <p className="text-sm text-surface-500 font-medium">
            Are you sure you want to cancel the deboarding process? This will resume normal billing.
          </p>
          <ATMTextField
            label="Reason for Cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Merchant changed mind..."
            required
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <ATMButton variant="secondary" size="sm" onClick={() => setCancelOpen(false)}>Cancel</ATMButton>
          <ATMButton
            variant="danger"
            size="sm"
            onClick={async () => {
              if (!cancelReason.trim()) return;
              setSubmitting(true);
              await onCancel(deboarding.deboardingId, cancelReason.trim());
              setCancelOpen(false);
              setCancelReason('');
              setSubmitting(false);
            }}
            isLoading={submitting}
            disabled={!cancelReason.trim()}
          >
            Cancel Deboarding
          </ATMButton>
        </div>
      </ATMModal>

      {/* Soft-Delete Confirmation — the point of no return */}
      <ATMModal isOpen={softDeleteOpen} onClose={() => setSoftDeleteOpen(false)} title="Soft-Delete Merchant">
        <div className="space-y-3">
          <p className="text-sm text-surface-500 font-medium">
            This completes the deboarding. The merchant record is soft-deleted: their login is
            disabled, the row disappears from All Merchants, and the deboarding can no longer
            be cancelled or reversed.
          </p>
          <p className="text-xs font-bold text-red-600 dark:text-red-400">
            This is the point of no return — every earlier step was reversible; this one is not.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <ATMButton variant="secondary" size="sm" onClick={() => setSoftDeleteOpen(false)}>Keep Merchant</ATMButton>
          <ATMButton
            variant="danger"
            size="sm"
            onClick={async () => {
              setSubmitting(true);
              await onSoftDelete(deboarding.deboardingId);
              setSoftDeleteOpen(false);
              setSubmitting(false);
            }}
            isLoading={submitting}
          >
            Soft-Delete Permanently
          </ATMButton>
        </div>
      </ATMModal>

      {/* Request Recharge Dialog */}
      <ATMModal isOpen={rechargeOpen} onClose={() => setRechargeOpen(false)} title="Request Shortfall Recharge">
        <div className="space-y-4">
          <p className="text-sm text-surface-500 font-medium">
            Enter the shortfall amount the merchant needs to deposit to complete settlement.
          </p>
          <ATMTextField
            label="Shortfall Amount ($)"
            type="number"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <ATMButton variant="secondary" size="sm" onClick={() => setRechargeOpen(false)}>Cancel</ATMButton>
          <ATMButton
            variant="primary"
            size="sm"
            onClick={async () => {
              const amt = parseFloat(rechargeAmount);
              if (isNaN(amt) || amt <= 0) return;
              setSubmitting(true);
              await onAskRecharge(deboarding.deboardingId, amt);
              setRechargeOpen(false);
              setRechargeAmount('');
              setSubmitting(false);
            }}
            isLoading={submitting}
            disabled={!rechargeAmount || parseFloat(rechargeAmount) <= 0}
          >
            Send Request
          </ATMButton>
        </div>
      </ATMModal>

      {/* Issue Refund Dialog */}
      <ATMModal isOpen={refundOpen} onClose={() => setRefundOpen(false)} title="Issue Settlement Refund">
        <div className="space-y-4">
          <ATMSelectField
            name="refundChannel"
            label="Refund Method"
            options={[
              { label: 'Credit Card Reversal', value: 'CreditCard' },
              { label: 'Bank Wire / ACH', value: 'BankTransfer' },
              { label: 'Platform Credit / Balance Credit', value: 'Balance' },
            ]}
            value={refundChannel}
            onChange={(val) => setRefundChannel(val ? String(val) : 'CreditCard')}
          />
          <ATMTextField
            label="Transaction Reference ID"
            value={refundRef}
            onChange={(e) => setRefundRef(e.target.value)}
            placeholder="tx_abc123"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <ATMButton variant="secondary" size="sm" onClick={() => setRefundOpen(false)}>Cancel</ATMButton>
          <ATMButton
            variant="primary"
            size="sm"
            onClick={async () => {
              setSubmitting(true);
              await onIssueRefund(deboarding.deboardingId, refundChannel, refundRef || undefined);
              setRefundOpen(false);
              setRefundRef('');
              setSubmitting(false);
            }}
            isLoading={submitting}
          >
            Record Refund
          </ATMButton>
        </div>
      </ATMModal>
    </ATMCard>
  );
}

// Notes tab helper section
interface NotesTabProps {
  notes: readonly MerchantNote[];
  onAddNote: (content: string) => Promise<void>;
}

const NotesTabSection: React.FC<NotesTabProps> = ({ notes, onAddNote }) => {
  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setIsSubmitting(true);
    await onAddNote(noteContent.trim());
    setNoteContent('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 pt-2">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="w-full rounded-xl border border-gray-200 bg-zen-surface px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent-500 dark:border-gray-800 dark:text-white"
          rows={3}
          placeholder="Add an internal staff note..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
        />
        <div className="flex justify-end">
          <ATMButton type="submit" size="sm" isLoading={isSubmitting} disabled={!noteContent.trim() || isSubmitting}>
            Add Note
          </ATMButton>
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500 font-semibold">No notes yet.</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800/80 bg-gray-50/20 dark:bg-gray-900/10">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold whitespace-pre-wrap">{note.content}</p>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-bold">
                <User className="h-3.5 w-3.5" />
                <span className="text-gray-600 dark:text-gray-300">{note.authorName}</span>
                <span>&middot;</span>
                <span>{formatDate(note.createdAt, 'datetime')}</span>
                {note.updatedAt && (
                  <>
                    <span>&middot;</span>
                    <span className="italic font-medium text-gray-400">edited</span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const MerchantDetailPage: React.FC<MerchantDetailPageProps> = ({
  id,
  merchant,
  detail,
  isDetailLoading,
  isMerchantLoading,
  merchantError,
  notes,
  timeline,
  actionLoading,
  menuOpen,
  setMenuOpen,
  menuRef,
  handleAction,

  suspendModal,
  setSuspendModal,
  suspendReason,
  setSuspendReason,
  suspendCategory,
  setSuspendCategory,
  handleSuspendConfirm,
  isSuspending,

  reactivateModal,
  setReactivateModal,
  reactivateResolution,
  setReactivateResolution,
  handleReactivateConfirm,
  isReactivating,

  deboardModal,
  setDeboardModal,
  deboardNote,
  setDeboardNote,
  handleDeboardConfirm,

  planChangeModal,
  setPlanChangeModal,
  planOptions,
  selectedNewPlan,
  setSelectedNewPlan,
  planChangeReason,
  setPlanChangeReason,
  planDiscountPct,
  setPlanDiscountPct,
  handleApplyPlanChange,
  isChangingPlan,

  handleAddNote,
  onBack,

  deboarding,
  handleDeactivateDeboarding,
  handleGenerateFinalInvoice,
  handleSettleDeboarding,
  handleAskRecharge,
  handleIssueRefund,
  handleCancelDeboarding,
  handleRetrySettleDeboarding,
  handleSoftDeleteDeboarding,
}) => {
  // Deployment currency (frozen at platform setup) — plan prices in the change-plan
  // modal are always shown in it; never a hardcoded 'USD'.
  const { data: setupRes } = useGetSetupStatusQuery();
  // undefined (not '') while loading — Intl throws on an empty currency code.
  const platformCurrency = setupRes?.data?.currency || undefined;

  // 2026-08-30 (user: "what is the difference between deactivate and suspend"): while a
  // deboarding is in flight the exit workflow owns the lifecycle — Suspend (a temporary,
  // reversible pause outside deboarding) is hidden so the two shutdown actions never
  // compete on the same screen.
  const deboardingInFlight = !!deboarding && deboarding.status !== 'Cancelled' && deboarding.status !== 'Completed';

  if (isMerchantLoading) {
    return (
      <div className="flex flex-col space-y-5 animate-fade-in w-full">
        <ATMSkeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ATMSkeleton className="h-52 w-full rounded-2xl" />
            <ATMSkeleton className="h-52 w-full rounded-2xl" />
          </div>
          <ATMSkeleton className="h-[420px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (merchantError || !merchant) {
    return (
      <div className="flex flex-col items-center justify-center p-6 lg:p-8 py-20 text-center w-full animate-fade-in min-h-[400px]">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mb-3">
          <AlertCircle className="h-8 w-8" />
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white">
          {merchantError ? 'Error loading merchant details' : 'Merchant not found'}
        </p>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
          The requested merchant could not be found or an error occurred while connecting to the server.
        </p>
        <ATMButton variant="outline" size="sm" className="mt-5" onClick={onBack}>
          Back to All Merchants
        </ATMButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5 animate-fade-in w-full">
      {/* Premium Unified Header */}
      <ATMPageHeader
        onBack={onBack}
        icon={merchant.merchantType === 'Enterprise' ? Cloud : Store}
        iconColor="theme"
        title={
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">{merchant.businessName}</span>
            <StatusBadge status={merchant.status} />
            <MerchantTypeBadge type={merchant.merchantType} />
            {merchant.businessNature && (
              <ATMBadge label={merchant.businessNature} color="purple" variant="outline" size="sm" />
            )}
          </div>
        }
        subtitle={
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            Merchant ID: <span className="font-mono text-xs">{merchant.id}</span>
          </span>
        }
        extraActions={
          <div ref={menuRef} className="relative">
            <ATMButton
              variant="outline"
              size="md"
              onClick={() => setMenuOpen(!menuOpen)}
              disabled={actionLoading}
              rightIcon={<MoreVertical className="h-4 w-4" />}
            >
              Actions
            </ATMButton>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 py-1.5 shadow-xl dark:border-gray-800 dark:bg-gray-950/95 backdrop-blur-xl">
                {merchant.status === 'Pending' && (
                  <ActionItem icon={<PlayCircle className="h-4 w-4" />} label="Activate" onClick={() => handleAction('activate')} />
                )}
                {merchant.status === 'Active' && !deboardingInFlight && (
                  <ActionItem icon={<Pause className="h-4 w-4" />} label="Suspend" onClick={() => handleAction('suspend')} variant="warning" />
                )}
                {merchant.status === 'Suspended' && (
                  <ActionItem icon={<PlayCircle className="h-4 w-4" />} label="Reactivate" onClick={() => handleAction('reactivate')} />
                )}
                {/* 2026-08-30 (deboarding audit): the retired "Cancel" (silent IsActive
                    flip + fictional wind-down toast) and "Delete (Compliance)" (410 Gone
                    endpoint) actions are gone — deboarding is the ONE exit path. A
                    Cancelled workflow may be re-initiated (server allows fresh consent). */}
                {(!deboarding || deboarding.status === 'Cancelled') && (
                  <ActionItem icon={<XCircle className="h-4 w-4" />} label="Initiate Deboarding" onClick={() => handleAction('deboard')} variant="danger" />
                )}
                {merchant.status === 'Failed' && merchant.merchantType === 'Enterprise' && (
                  <ActionItem icon={<RefreshCw className="h-4 w-4" />} label="Retry Provisioning" onClick={() => handleAction('retry-provisioning')} />
                )}

                <div className="my-1.5 border-t border-gray-100 dark:border-gray-800" />

                {merchant.status === 'Active' && (
                  <ActionItem
                    icon={<Sliders className="h-4 w-4" />}
                    label="Change Plan"
                    onClick={() => handleAction('change-plan')}
                  />
                )}
                <ActionItem icon={<FileText className="h-4 w-4" />} label="Export Merchant Data" onClick={() => handleAction('export')} />
                {/* 2026-09-04: "Impersonate (View-Only)" REMOVED — see MerchantDetailWrapper. */}
                {merchant.merchantType === 'Standalone' && (
                  <ActionItem icon={<Monitor className="h-4 w-4" />} label="Manage Terminals" onClick={() => handleAction('terminals')} />
                )}
                <div className="my-1.5 border-t border-gray-100 dark:border-gray-800" />
                <ActionItem icon={<Pencil className="h-4 w-4" />} label="Edit Details" onClick={() => handleAction('edit')} />
              </div>
            )}
          </div>
        }
      />

      {/* Main Content Tabs & Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column Tabs */}
        <div className="lg:col-span-2">
          <ATMTabs
            tabs={[
              {
                label: 'Overview',
                content: (
                  <div className="space-y-6">
                    {/* 2026-08-30: the old "Initiate Deboarding" card was gated on
                        merchant.status === 'Cancelled' — an enum value retired in Pass 39,
                        so deboarding could never be started. Entry now lives in the
                        Actions menu ("Initiate Deboarding" → Admin consent modal). */}
                    {deboarding && (
                      <DeboardingWorkflowCard
                        deboarding={deboarding}
                        onDeactivate={handleDeactivateDeboarding}
                        onGenerateInvoice={handleGenerateFinalInvoice}
                        onSettle={handleSettleDeboarding}
                        onAskRecharge={handleAskRecharge}
                        onIssueRefund={handleIssueRefund}
                        onCancel={handleCancelDeboarding}
                        onRetrySettle={handleRetrySettleDeboarding}
                        onSoftDelete={handleSoftDeleteDeboarding}
                      />
                    )}

                    {/* Profile Identity Card matching UserDetailPage (Image 1) */}
                    <div className="bg-zen-card p-8 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.05] grayscale pointer-events-none group-hover:opacity-[0.05] dark:group-hover:opacity-[0.08] transition-opacity">
                        <Building2 size={200} className="dark:text-white" />
                      </div>

                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                        <div className="relative">
                          <ATMAvatar
                            name={merchant.businessName}
                            size="xl"
                            className="ring-4 ring-slate-50 dark:ring-gray-800 shadow-xl"
                          />
                          <div className="absolute -bottom-2 -right-2">
                            <StatusBadge status={merchant.status} />
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                              {merchant.businessName}
                            </h2>
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 px-3 py-1 rounded border border-slate-200 dark:border-gray-700 uppercase tracking-widest font-mono">
                                ID: {merchant.id.slice(0, 8)}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-700" />
                              <MerchantTypeBadge type={merchant.merchantType} />
                              {merchant.businessNature && (
                                <ATMBadge label={merchant.businessNature} color="purple" variant="outline" size="sm" />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                              <User size={14} className="text-slate-400 dark:text-gray-500" />
                              <span className="text-xs font-bold tracking-tight">{merchant.contactPerson}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                              <Mail size={14} className="text-slate-400 dark:text-gray-500" />
                              <span className="text-xs font-bold lowercase tracking-tight">{merchant.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                              <Globe size={14} className="text-slate-400 dark:text-gray-500" />
                              <span className="text-xs font-bold uppercase tracking-tight">{merchant.country}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2-Column Grid matching UserDetailPage (Image 1) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Business Contact Metadata */}
                      <div className="bg-zen-card p-8 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm">
                        <ATMSectionHeader title="Contact & Business Metadata" />
                        <div className="space-y-1">
                          <ATMDetailRow icon={Building2} label="Business Name" value={merchant.businessName} />
                          <ATMDetailRow icon={User} label="Primary Contact" value={merchant.contactPerson} />
                          <ATMDetailRow icon={Mail} label="Corporate Email" value={merchant.email} />
                          <ATMDetailRow icon={Phone} label="Phone Number" value={merchant.phone} />
                          <ATMDetailRow icon={Globe} label="Country Location" value={merchant.country} />
                          {/* 2026-08-31: was `merchant.signupDate || new Date().toISOString()` —
                              a missing signup date silently rendered TODAY as the merchant's
                              commencement date. An unknown date says so. */}
                          <ATMDetailRow
                            icon={Calendar}
                            label="Commencement Date"
                            value={merchant.signupDate ? formatDate(merchant.signupDate, 'long') : 'Not recorded'}
                            isLast
                          />
                        </div>
                      </div>

                      {/* Infrastructure & Subscription Details */}
                      <div className="bg-zen-card p-8 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm">
                        <ATMSectionHeader title="Infrastructure & Subscription" />
                        <div className="space-y-1">
                          <ATMDetailRow icon={Cloud} label="Merchant Model" value={merchant.merchantType} />
                          {/* 2026-08-31: was `merchant.plan || merchant.tier || 'Starter'`.
                              MerchantDto carries neither field, so EVERY merchant read
                              "Starter" — a tier name that no longer exists anywhere in the
                              platform. The real plan is the active subscription's. */}
                          <ATMDetailRow
                            icon={Sliders}
                            label="Subscription Plan"
                            value={detail?.activeSubscription?.planDisplayName || 'No plan attached'}
                          />
                          {/* 2026-08-31: "Billing Cadence" and "Payment Option" rows REMOVED.
                              Cadence defaulted to "Monthly" from a field the wire never sent —
                              and post-Pass-36 the invoice cadence is a platform-wide admin
                              setting (Billing → Cadence), not a per-merchant value, so showing
                              it here implied a per-merchant choice that does not exist.
                              Payment Option defaulted to "Invoice" from Merchant.
                              PreferredPaymentMethod, which the onboarding wizard never
                              collects (null for every merchant in the database). */}
                          <ATMDetailRow
                            icon={Monitor}
                            label="Registered Devices"
                            value={`${detail?.registeredTerminalCount ?? 0} active ${
                              (detail?.registeredTerminalCount ?? 0) === 1 ? 'device' : 'devices'
                            }`}
                            isLast
                          />
                        </div>
                      </div>
                    </div>

                    {/* System Health Status Card matching UserDetailPage Security & Auth */}
                    <div className="bg-zen-card p-8 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm">
                      <ATMSectionHeader title="System & Health Status" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Cloud API Health</p>
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Connected (99.97% Uptime)</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Sync Pipeline</p>
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Real-Time Sync Active</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Merchant Status</p>
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${merchant.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{merchant.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {merchant.merchantType === 'Enterprise' ? (
                      <EnterprisePanels
                        bridgeHealth={detail?.platformBridgeHealth}
                        usageSummary={detail?.usageSummary}
                        commissionSummary={detail?.commissionSummary}
                        subscription={detail?.activeSubscription}
                        wallet={detail?.wallet}
                        isLoading={isDetailLoading}
                      />
                    ) : (
                      <StandalonePanels
                        merchantId={merchant.id}
                        activeToken={detail?.activeToken}
                        tokenHistory={detail?.tokenHistory}
                        isLoading={isDetailLoading}
                      />
                    )}
                  </div>
                ),
              },
              {
                label: 'Billing',
                content: (
                  <div className="space-y-6">
                    <ATMCard title="Invoices" className="glass-card">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold pt-2">
                        Invoice history and payment records will appear here once billing statements are generated.
                      </p>
                    </ATMCard>
                    <ATMCard title="Payment Methods" className="glass-card">
                      <div className="py-6 text-center text-sm text-gray-400 dark:text-gray-500 font-semibold">
                        No credit card or payment methods configured.
                      </div>
                    </ATMCard>
                  </div>
                ),
              },
              {
                label: 'Activity',
                content: (
                  <ATMCard title="Audit Log" className="glass-card">
                    {timeline.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6 font-semibold">No activity logs found.</p>
                    ) : (
                      <div className="relative pl-6 pt-2">
                        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />
                        <ul className="space-y-6">
                          {timeline.map((entry, index) => (
                            <li key={entry.id || entry.eventId || `timeline-entry-${index}`} className="relative flex gap-4">
                              <span className="absolute -left-3.5 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-accent-500 dark:border-gray-900">
                                <span className="h-2 w-2 rounded-full bg-white" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.event}</p>
                                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 font-semibold">{entry.description}</p>
                                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-bold">
                                  {formatDate(entry.timestamp, 'datetime')} &middot; {entry.performedBy}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </ATMCard>
                ),
              },
              {
                label: 'Notes',
                content: (
                  <ATMCard title="Internal Staff Notes" className="glass-card">
                    <NotesTabSection notes={notes} onAddNote={handleAddNote} />
                  </ATMCard>
                ),
              },
              {
                label: 'Compliance',
                content: (
                  <div className="space-y-6">
                    <ATMCard title="GDPR & Data Rights" className="glass-card">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold pt-2">
                        No GDPR compliance requests or data subject access requests (DSAR) recorded.
                      </p>
                    </ATMCard>
                    <ATMCard title="Platform Consent Records" className="glass-card">
                      <div className="py-6 text-center text-sm text-gray-400 dark:text-gray-500 font-semibold">
                        Merchant has consented to standard End User License Agreements.
                      </div>
                    </ATMCard>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Right Column Sidebar matching UserDetailPage (Image 1) */}
        <div className="space-y-6">
          {/* Management Actions Card matching Image 1 */}
          <div className="bg-zen-card border border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-gray-950 px-6 py-4 border-b border-slate-200 dark:border-gray-800">
              <h3 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Management & Actions</h3>
            </div>

            <div className="p-6 space-y-3">
              <ATMActionSidebarItem
                label="Modify Details"
                icon={Pencil}
                onClick={() => handleAction('edit')}
              />
              {/* 2026-08-30: "Change Tier" retired — tiers don't exist (plans are the
                  one catalog); the same real plan-change flow serves both types. */}
              {merchant.status === 'Active' && (
                <ATMActionSidebarItem
                  label="Change Plan"
                  icon={Sliders}
                  onClick={() => handleAction('change-plan')}
                />
              )}
              {merchant.merchantType === 'Standalone' && (
                <ATMActionSidebarItem
                  label="Manage Terminals"
                  icon={Monitor}
                  onClick={() => handleAction('terminals')}
                />
              )}
              <ATMActionSidebarItem
                label="Export Merchant Data"
                icon={FileText}
                onClick={() => handleAction('export')}
              />
              {merchant.status === 'Active' && !deboardingInFlight && (
                <ATMActionSidebarItem
                  label="Suspend Account"
                  icon={Pause}
                  onClick={() => handleAction('suspend')}
                  variant="rose"
                />
              )}
              {merchant.status === 'Suspended' && (
                <ATMActionSidebarItem
                  label="Reactivate Account"
                  icon={PlayCircle}
                  onClick={() => handleAction('reactivate')}
                />
              )}
              {/* 2026-08-30 (user: "where is the deboarding button"): the exit path,
                  surfaced here as well as in the Actions menu. */}
              {(!deboarding || deboarding.status === 'Cancelled') && (
                <ATMActionSidebarItem
                  label="Initiate Deboarding"
                  icon={XCircle}
                  onClick={() => handleAction('deboard')}
                  variant="rose"
                />
              )}
            </div>
          </div>

          {merchant.onboardingChecklist && (
            <OnboardingChecklistPanel checklist={merchant.onboardingChecklist} />
          )}

          {/* 2026-08-31: the panel reads its own data from the server now — recipient,
              merchant type and delivery state all come from the real record, so the
              page no longer feeds it props it used only to decorate a hardcoded log. */}
          <WelcomeCommunications merchantId={merchant.id} />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Action Modals                                                 */}
      {/* ------------------------------------------------------------- */}

      {/* Suspend Modal */}
      <ATMModal
        isOpen={suspendModal}
        onClose={() => setSuspendModal(false)}
        title="Suspend Merchant"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Temporarily deactivate API access and suspend active terminals.
        </p>
        <div className="space-y-4">
          <ATMSelectField
            name="suspensionCategory"
            label="Suspension Reason Category"
            options={[
              { label: 'Billing Non-Payment', value: 'Billing' },
              { label: 'Compliance Violation', value: 'Compliance' },
              { label: 'Suspected Fraud Activity', value: 'Fraud' },
              { label: 'Other Support Reason', value: 'Other' },
            ]}
            value={suspendCategory}
            onChange={(val) => setSuspendCategory(val ? String(val) : '')}
            placeholder="Select a category"
            size="sm"
          />
          <ATMTextField
            label="Detailed Reasons"
            placeholder="Details of the violation..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <ATMButton variant="outline" size="sm" onClick={() => setSuspendModal(false)}>
            Cancel
          </ATMButton>
          <ATMButton variant="danger" size="sm" onClick={handleSuspendConfirm} isLoading={isSuspending}>
            Suspend Account
          </ATMButton>
        </div>
      </ATMModal>

      {/* Reactivate Modal */}
      <ATMModal
        isOpen={reactivateModal}
        onClose={() => setReactivateModal(false)}
        title="Reactivate Merchant"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Restore full API access, token sync, and resume monthly subscription billing cycles.
        </p>
        <div>
          <ATMTextField
            label="Resolution Notes"
            placeholder="Resolution reason (e.g. Invoice paid)..."
            value={reactivateResolution}
            onChange={(e) => setReactivateResolution(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <ATMButton variant="outline" size="sm" onClick={() => setReactivateModal(false)}>
            Cancel
          </ATMButton>
          <ATMButton variant="primary" size="sm" onClick={handleReactivateConfirm} isLoading={isReactivating}>
            Reactivate Account
          </ATMButton>
        </div>
      </ATMModal>

      {/* 2026-08-30: legacy Cancel (fictional wind-down) + Delete (410 endpoint) modals
          removed — replaced by the deboarding consent gate below (Pass-39 design). */}
      <ATMModal
        isOpen={deboardModal}
        onClose={() => setDeboardModal(false)}
        title="Initiate Deboarding"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Records the Admin consent that starts the deboarding workflow for{' '}
            <strong className="text-gray-900 dark:text-white">{merchant.businessName}</strong>.
            Operations then executes the checklist: deactivate, final invoice, settlement,
            refund, and finally soft-delete.
          </p>
          <p className="text-xs text-gray-400 font-medium">
            Reversible at every step until the final soft-delete — cancelling restores billing
            and access.
          </p>
          <ATMTextField
            label="Consent Note (optional)"
            placeholder="Reason / ticket reference…"
            value={deboardNote}
            onChange={(e) => setDeboardNote(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <ATMButton variant="outline" size="sm" onClick={() => setDeboardModal(false)}>
            Cancel
          </ATMButton>
          <ATMButton variant="danger" size="sm" onClick={handleDeboardConfirm}>
            Record Consent & Start
          </ATMButton>
        </div>
      </ATMModal>

      {/* Plan Change Modal — 2026-08-30: real catalog plans (same deployment kind as the
          active subscription); the hardcoded Starter/Professional/Business/Enterprise +
          Basic/Standard/Advance/Premium tier lists were pure fiction. */}
      <ATMModal
        isOpen={planChangeModal}
        onClose={() => {
          setPlanChangeModal(false);
          setSelectedNewPlan(null);
          setPlanChangeReason('');
          setPlanDiscountPct(0);
        }}
        title="Change Plan"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
            Current plan:{' '}
            <strong className="text-gray-900 dark:text-white font-bold">
              {detail?.activeSubscription?.planDisplayName || merchant.plan || '—'}
            </strong>
            {typeof detail?.activeSubscription?.dailySubscriptionPrice === 'number' && (
              <span className="ml-1.5 text-gray-500 dark:text-gray-400 font-medium">
                ({formatCurrencyOrDash(detail.activeSubscription.dailySubscriptionPrice, platformCurrency)}/day)
              </span>
            )}
          </p>
          {planOptions.length === 0 ? (
            <p className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
              No other active plan of this deployment kind exists in the catalog. Create one
              under Plans first, then change the merchant to it.
            </p>
          ) : (
            <div className="space-y-2.5">
              {planOptions.map((plan) => (
                <button
                  key={plan.planId}
                  type="button"
                  onClick={() => setSelectedNewPlan(plan.planId)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all font-bold',
                    selectedNewPlan === plan.planId
                      ? 'border-accent-500 bg-accent-50/50 dark:border-accent-500 dark:bg-accent-950/20'
                      : 'border-gray-100 hover:border-gray-200 dark:border-gray-800/80 dark:hover:border-gray-700',
                  )}
                >
                  <span className="text-sm text-gray-900 dark:text-white">
                    {plan.displayName}
                    {plan.flavour && plan.flavour !== 'BOT' && (
                      <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {plan.flavour === 'RES' ? 'Restaurant' : 'Retail'}
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrencyOrDash(plan.planPricePerDay ?? 0, platformCurrency)}/day
                  </span>
                </button>
              ))}
            </div>
          )}
          {merchant.merchantType === 'Standalone' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Tokens issued from now on derive from the new plan. Already-issued tokens keep
              the grants they were minted with.
            </p>
          )}
          {/* Per-merchant pricing — same semantics as onboarding's assign-plan: the
              discounted rate is stored as this merchant's daily price. Prefilled with the
              current subscription's implied discount so the deal carries over. */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <ATMTextField
              label="Merchant Discount (%)"
              type="number"
              value={String(planDiscountPct)}
              onChange={(e) => setPlanDiscountPct(Number(e.target.value) || 0)}
            />
            <div className="pb-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Effective daily rate
              </p>
              {(() => {
                const sel = planOptions.find((p) => p.planId === selectedNewPlan);
                if (!sel) {
                  return <p className="text-sm font-bold text-gray-400 dark:text-gray-500">Select a plan</p>;
                }
                const eff = Number(((sel.planPricePerDay ?? 0) * (1 - (planDiscountPct || 0) / 100)).toFixed(2));
                return (
                  <p className={cn('text-lg font-black', planDiscountPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white')}>
                    {formatCurrencyOrDash(eff, platformCurrency)}/day
                  </p>
                );
              })()}
            </div>
          </div>
          <ATMTextField
            label="Reason (optional)"
            placeholder="Reason / ticket reference…"
            value={planChangeReason}
            onChange={(e) => setPlanChangeReason(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <ATMButton
            variant="outline"
            size="sm"
            onClick={() => {
              setPlanChangeModal(false);
              setSelectedNewPlan(null);
              setPlanChangeReason('');
              setPlanDiscountPct(0);
            }}
          >
            Cancel
          </ATMButton>
          <ATMButton
            variant="primary"
            size="sm"
            onClick={handleApplyPlanChange}
            isLoading={isChangingPlan}
            disabled={!selectedNewPlan}
          >
            Apply Change
          </ATMButton>
        </div>
      </ATMModal>

      {/* 2026-09-04: the Impersonate modal is gone with the action (see MerchantDetailWrapper). */}
    </div>
  );
};

export default MerchantDetailPage;
