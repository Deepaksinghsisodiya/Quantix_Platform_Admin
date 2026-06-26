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
  Eye,
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
import { ATMTabs } from '@/shared/ui';
import { WelcomeCommunications } from '../components/WelcomeCommunications';
import EnterprisePanels from '../components/EnterprisePanels';
import StandalonePanels from '../components/StandalonePanels';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/formatDate';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type {
  Merchant,
  MerchantNote,
  OnboardingChecklist,
  MerchantStatus,
  MerchantType,
  MerchantDeboarding,
  DeboardingStatus,
} from '../types/merchant.types';

interface MerchantDetailPageProps {
  id: string;
  merchant: Merchant | undefined;
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

  cancelModal: boolean;
  setCancelModal: (open: boolean) => void;
  cancelReason: string;
  setCancelReason: (val: string) => void;
  handleCancelConfirm: () => Promise<void>;
  isCancelling: boolean;

  deleteModal: boolean;
  setDeleteModal: (open: boolean) => void;
  handleDeleteConfirm: () => Promise<void>;
  isDeleting: boolean;

  planChangeModal: boolean;
  setPlanChangeModal: (open: boolean) => void;
  selectedNewPlan: string | null;
  setSelectedNewPlan: (val: string | null) => void;
  selectedNewTier: string | null;
  setSelectedNewTier: (val: string | null) => void;
  handleApplyPlanChange: () => Promise<void>;
  isChangingPlan: boolean;
  isChangingTier: boolean;

  impersonateModal: boolean;
  setImpersonateModal: (open: boolean) => void;
  handleImpersonateConfirm: () => Promise<void>;
  isImpersonating: boolean;

  handleAddNote: (content: string) => Promise<void>;
  onBack: () => void;
  
  deboarding: MerchantDeboarding | undefined;
  handleGiveConsent: (note?: string) => Promise<void>;
  handleDeactivateDeboarding: (deboardingId: string) => Promise<void>;
  handleGenerateFinalInvoice: (deboardingId: string) => Promise<void>;
  handleSettleDeboarding: (deboardingId: string) => Promise<void>;
  handleAskRecharge: (deboardingId: string, shortfallAmount: number, note?: string) => Promise<void>;
  handleIssueRefund: (deboardingId: string, channel: string, reference?: string, note?: string) => Promise<void>;
  handleCancelDeboarding: (deboardingId: string, reason: string) => Promise<void>;
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

function DeboardingWorkflowCard({
  deboarding,
  onDeactivate,
  onGenerateInvoice,
  onSettle,
  onAskRecharge,
  onIssueRefund,
  onCancel,
}: {
  deboarding: MerchantDeboarding;
  onDeactivate: (dbId: string) => Promise<void>;
  onGenerateInvoice: (dbId: string) => Promise<void>;
  onSettle: (dbId: string) => Promise<void>;
  onAskRecharge: (dbId: string, amount: number, note?: string) => Promise<void>;
  onIssueRefund: (dbId: string, channel: string, ref?: string, note?: string) => Promise<void>;
  onCancel: (dbId: string, reason: string) => Promise<void>;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundChannel, setRefundChannel] = useState('CreditCard');
  const [refundRef, setRefundRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const steps = deboarding.steps || [];

  return (
    <ATMCard title="Deboarding Workflow" className="border-amber-250 bg-amber-50/10 dark:border-amber-900/30">
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Deboarding ID:</span>
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{deboarding.deboardingId}</span>
          </div>
          <ATMBadge label={deboarding.status} color={STATUS_COLOR[deboarding.status]} size="sm" />
        </div>

        {deboarding.status !== 'Completed' && deboarding.status !== 'Cancelled' && (
          <div className="flex justify-end gap-2">
            <ATMButton variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
              Cancel Workflow
            </ATMButton>
          </div>
        )}

        {/* Steps List */}
        <div className="relative pl-6 pt-2 space-y-4">
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />
          {steps.map((step) => {
            const isCompleted = step.status === 'Completed';
            const isInProgress = step.status === 'InProgress';
            const isNotApplicable = step.status === 'NotApplicable';
            
            return (
              <div key={step.stepKey} className="relative flex gap-3 items-start animate-fade-in">
                <span className={cn(
                  "absolute -left-3.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white dark:border-gray-950 text-white",
                  isCompleted ? "bg-emerald-500" : isInProgress ? "bg-amber-500" : isNotApplicable ? "bg-slate-300 dark:bg-slate-700" : "bg-gray-200 dark:bg-gray-800"
                )}>
                  {isCompleted ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{step.stepLabel}</p>
                    <ATMBadge 
                      size="sm" 
                      color={isCompleted ? 'success' : isInProgress ? 'warning' : isNotApplicable ? 'muted' : 'muted'} 
                      label={step.status} 
                    />
                  </div>
                  {step.completedAt && (
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      Completed {formatDate(step.completedAt, 'datetime')} &middot; {step.completedBy}
                    </p>
                  )}
                  {step.note && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                      Note: {step.note}
                    </p>
                  )}
                  
                  {/* Step Action Triggers */}
                  {isInProgress && (
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
                      {step.stepKey === 'BillingSettled' && (
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
                      )}
                      {step.stepKey === 'RefundIssued' && (
                        <ATMButton 
                          size="sm" 
                          variant="primary" 
                          onClick={() => setRefundOpen(true)}
                        >
                          Issue Refund
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

  cancelModal,
  setCancelModal,
  cancelReason,
  setCancelReason,
  handleCancelConfirm,
  isCancelling,

  deleteModal,
  setDeleteModal,
  handleDeleteConfirm,
  isDeleting,

  planChangeModal,
  setPlanChangeModal,
  selectedNewPlan,
  setSelectedNewPlan,
  selectedNewTier,
  setSelectedNewTier,
  handleApplyPlanChange,
  isChangingPlan,
  isChangingTier,

  impersonateModal,
  setImpersonateModal,
  handleImpersonateConfirm,
  isImpersonating,

  handleAddNote,
  onBack,

  deboarding,
  handleGiveConsent,
  handleDeactivateDeboarding,
  handleGenerateFinalInvoice,
  handleSettleDeboarding,
  handleAskRecharge,
  handleIssueRefund,
  handleCancelDeboarding,
}) => {

  if (isMerchantLoading) {
    return (
      <div className="space-y-6 animate-fade-in w-full">
        <ATMSkeleton className="h-24 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ATMSkeleton className="h-48 w-full" />
            <ATMSkeleton className="h-48 w-full" />
          </div>
          <ATMSkeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (merchantError || !merchant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center w-full animate-fade-in">
        <AlertCircle className="mb-3 h-10 w-10 text-rose-500" />
        <p className="text-sm font-bold text-rose-600 dark:text-rose-450">
          {merchantError ? 'Error loading merchant details' : 'Merchant not found'}
        </p>
        <ATMButton variant="outline" size="sm" className="mt-4" onClick={onBack}>
          Back to directory
        </ATMButton>
      </div>
    );
  }

  const TIER_ORDER = ['Basic', 'Standard', 'Advance', 'Premium'];

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 pb-10 animate-fade-in w-full">
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
            >
              Actions <MoreVertical className="h-4 w-4 ml-1.5 shrink-0" />
            </ATMButton>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 py-1.5 shadow-xl dark:border-gray-800 dark:bg-gray-950/95 backdrop-blur-xl">
                {merchant.status === 'Pending' && (
                  <ActionItem icon={<PlayCircle className="h-4 w-4" />} label="Activate" onClick={() => handleAction('activate')} />
                )}
                {merchant.status === 'Active' && (
                  <ActionItem icon={<Pause className="h-4 w-4" />} label="Suspend" onClick={() => handleAction('suspend')} variant="warning" />
                )}
                {merchant.status === 'Suspended' && (
                  <ActionItem icon={<PlayCircle className="h-4 w-4" />} label="Reactivate" onClick={() => handleAction('reactivate')} />
                )}
                {(merchant.status === 'Active' || merchant.status === 'Suspended') && (
                  <ActionItem icon={<XCircle className="h-4 w-4" />} label="Cancel" onClick={() => handleAction('cancel')} variant="danger" />
                )}
                {merchant.status === 'Failed' && merchant.merchantType === 'Enterprise' && (
                  <ActionItem icon={<RefreshCw className="h-4 w-4" />} label="Retry Provisioning" onClick={() => handleAction('retry-provisioning')} />
                )}
                {merchant.status === 'Cancelled' && (
                  <ActionItem icon={<Trash2 className="h-4 w-4" />} label="Delete (Compliance)" onClick={() => handleAction('delete')} variant="danger" />
                )}

                <div className="my-1.5 border-t border-gray-100 dark:border-gray-800" />

                {merchant.status === 'Active' && (
                  <ActionItem
                    icon={<Sliders className="h-4 w-4" />}
                    label={merchant.merchantType === 'Enterprise' ? 'Change Plan' : 'Change Tier'}
                    onClick={() => handleAction('change-plan')}
                  />
                )}
                <ActionItem icon={<FileText className="h-4 w-4" />} label="Export Merchant Data" onClick={() => handleAction('export')} />
                {merchant.merchantType === 'Enterprise' && (
                  <ActionItem icon={<Eye className="h-4 w-4" />} label="Impersonate (View-Only)" onClick={() => handleAction('impersonate')} />
                )}
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
                    {/* Initiate Deboarding Action Card */}
                    {!deboarding && merchant.status === 'Cancelled' && (
                      <ATMCard title="Deboarding Process" className="border-amber-250 bg-amber-50/10 dark:border-amber-900/30">
                        <div className="space-y-4 pt-1">
                          <p className="text-sm text-slate-500 font-semibold">
                            This merchant's subscription was cancelled. You must record consent and initiate the deboarding workflow to deactivate access and settle outstanding invoices.
                          </p>
                          <div className="flex justify-end">
                            <ATMButton 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleGiveConsent("Initiated automatically by admin.")}
                            >
                              Initiate Deboarding Workflow
                            </ATMButton>
                          </div>
                        </div>
                      </ATMCard>
                    )}

                    {deboarding && (
                      <DeboardingWorkflowCard
                        deboarding={deboarding}
                        onDeactivate={handleDeactivateDeboarding}
                        onGenerateInvoice={handleGenerateFinalInvoice}
                        onSettle={handleSettleDeboarding}
                        onAskRecharge={handleAskRecharge}
                        onIssueRefund={handleIssueRefund}
                        onCancel={handleCancelDeboarding}
                      />
                    )}

                    <ATMCard title="Business Information" className="glass-card">
                      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 pt-1">
                        <InfoRow icon={<Building2 className="h-4.5 w-4.5 text-gray-400" />} label="Business Name" value={merchant.businessName} />
                        <InfoRow icon={<User className="h-4.5 w-4.5 text-gray-400" />} label="Contact Person" value={merchant.contactPerson} />
                        <InfoRow icon={<Mail className="h-4.5 w-4.5 text-gray-400" />} label="Email" value={merchant.email} />
                        <InfoRow icon={<Phone className="h-4.5 w-4.5 text-gray-400" />} label="Phone" value={merchant.phone} />
                        <InfoRow icon={<Globe className="h-4.5 w-4.5 text-gray-400" />} label="Country" value={merchant.country} />
                        <InfoRow icon={<Calendar className="h-4.5 w-4.5 text-gray-400" />} label="Signup Date" value={formatDate(merchant.signupDate || new Date().toISOString(), 'long')} />
                      </dl>
                    </ATMCard>

                    {merchant.merchantType === 'Enterprise' ? (
                      <EnterprisePanels />
                    ) : (
                      <StandalonePanels merchantId={merchant.id} />
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
                          {timeline.map((entry) => (
                            <li key={entry.id} className="relative flex gap-4">
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

        {/* Right Column Sidebar */}
        <div className="space-y-6">
          {merchant.onboardingChecklist && (
            <OnboardingChecklistPanel checklist={merchant.onboardingChecklist} />
          )}

          <WelcomeCommunications
            merchantType={merchant.merchantType}
            merchantId={merchant.id}
            email={merchant.email}
            contactPerson={merchant.contactPerson}
          />
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

      {/* Cancel Modal */}
      <ATMModal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancel Merchant"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-4">
          Initiate a 30-day grace wind-down period. This suspends new token issuances, but leaves existing ones active.
        </p>
        <div>
          <ATMTextField
            label="Cancellation Reason"
            placeholder="Customer request, business closed..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <ATMButton variant="outline" size="sm" onClick={() => setCancelModal(false)}>
            Cancel
          </ATMButton>
          <ATMButton variant="danger" size="sm" onClick={handleCancelConfirm} isLoading={isCancelling}>
            Cancel Subscription
          </ATMButton>
        </div>
      </ATMModal>

      {/* Delete Modal */}
      <ATMModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Merchant (Compliance)"
      >
        <p className="text-sm text-rose-600 dark:text-rose-450 font-bold mb-6">
          This action is permanent and deletes all platform records. Enterprise databases are deleted/anonymized.
        </p>
        <div className="flex justify-end gap-3">
          <ATMButton variant="outline" size="sm" onClick={() => setDeleteModal(false)}>
            Cancel
          </ATMButton>
          <ATMButton variant="danger" size="sm" onClick={handleDeleteConfirm} isLoading={isDeleting}>
            Permanently Delete
          </ATMButton>
        </div>
      </ATMModal>

      {/* Plan / Tier Change Modal */}
      <ATMModal
        isOpen={planChangeModal}
        onClose={() => {
          setPlanChangeModal(false);
          setSelectedNewPlan(null);
          setSelectedNewTier(null);
        }}
        title={merchant.merchantType === 'Enterprise' ? 'Change Plan' : 'Change Token Tier'}
      >
        <div className="space-y-4">
          {merchant.merchantType === 'Enterprise' ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                Current plan: <strong className="text-gray-900 dark:text-white font-bold">{merchant.plan}</strong>
              </p>
              <div className="space-y-2.5">
                {['Starter', 'Professional', 'Business', 'Enterprise'].map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setSelectedNewPlan(plan)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all font-bold',
                      selectedNewPlan === plan
                        ? 'border-accent-500 bg-accent-50/50 dark:border-accent-500 dark:bg-accent-950/20'
                        : merchant.plan === plan
                        ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60'
                        : 'border-gray-100 hover:border-gray-200 dark:border-gray-800/80 dark:hover:border-gray-700',
                    )}
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{plan}</span>
                    {merchant.plan === plan && <ATMBadge label="Current" color="muted" variant="soft" />}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                Current tier: <strong className="text-gray-900 dark:text-white font-bold">{merchant.tier}</strong>
              </p>
              <div className="space-y-2.5">
                {TIER_ORDER.map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedNewTier(tier)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all font-bold',
                      selectedNewTier === tier
                        ? 'border-accent-500 bg-accent-50/50 dark:border-accent-500 dark:bg-accent-950/20'
                        : merchant.tier === tier
                        ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60'
                        : 'border-gray-100 hover:border-gray-200 dark:border-gray-800/80 dark:hover:border-gray-700',
                    )}
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{tier}</span>
                    {merchant.tier === tier && <ATMBadge label="Current" color="muted" variant="soft" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <ATMButton
            variant="outline"
            size="sm"
            onClick={() => {
              setPlanChangeModal(false);
              setSelectedNewPlan(null);
              setSelectedNewTier(null);
            }}
          >
            Cancel
          </ATMButton>
          <ATMButton
            variant="primary"
            size="sm"
            onClick={handleApplyPlanChange}
            isLoading={isChangingPlan || isChangingTier}
            disabled={
              merchant.merchantType === 'Enterprise'
                ? !selectedNewPlan || selectedNewPlan === merchant.plan
                : !selectedNewTier || selectedNewTier === merchant.tier
            }
          >
            Apply Change
          </ATMButton>
        </div>
      </ATMModal>

      {/* Impersonate Modal */}
      <ATMModal
        isOpen={impersonateModal}
        onClose={() => setImpersonateModal(false)}
        title="Impersonate Merchant (View-Only)"
      >
        <div className="flex items-start gap-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-250 p-4 mb-6">
          <Eye className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="text-sm text-amber-800 dark:text-amber-300 font-semibold space-y-1">
            <p>You are about to view <strong>{merchant.businessName}</strong>'s Merchant Admin Portal in read-only mode.</p>
            <ul className="list-disc ml-4 text-xs font-semibold space-y-1">
              <li>Platform Admin permission required</li>
              <li>All actions are read-only — no modifications possible</li>
              <li>Session is logged in the audit trail</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <ATMButton variant="outline" size="sm" onClick={() => setImpersonateModal(false)}>
            Cancel
          </ATMButton>
          <ATMButton
            variant="primary"
            size="sm"
            icon={Eye}
            onClick={handleImpersonateConfirm}
            isLoading={isImpersonating}
          >
            Start View-Only Session
          </ATMButton>
        </div>
      </ATMModal>
    </div>
  );
};

export default MerchantDetailPage;
