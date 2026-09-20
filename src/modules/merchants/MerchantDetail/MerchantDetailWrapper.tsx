import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useGetMerchantQuery,
  useGetMerchantDetailQuery,
  useGetMerchantNotesQuery,
  useGetMerchantTimelineQuery,
  useActivateMerchantMutation,
  useSuspendMerchantMutation,
  useReactivateMerchantWithResolutionMutation,
  useRetryProvisioningMutation,
  useExportMerchantDataMutation,
  useAddMerchantNoteMutation,
  useChangePlanMutation,
  useGetDeboardingByMerchantQuery,
  useGiveDeboardingConsentMutation,
  useDeactivateDeboardingMutation,
  useGenerateFinalInvoiceMutation,
  useSettleDeboardingMutation,
  useAskRechargeMutation,
  useIssueRefundMutation,
  useCancelDeboardingMutation,
  useRetryDeboardingSettleMutation,
  useSoftDeleteDeboardingMutation,
} from '../services/merchantApi';

import { useGetPlansListQuery } from '@/modules/plans/services/planApi';
import type { WizardPlanOption } from '../OnboardingWizard/wizard.types';

import MerchantDetailPage from './MerchantDetailPage';

export const MerchantDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries (skip invalid IDs like 'register', 'new', 'undefined')
  const isValidId = !!id && id !== 'register' && id !== 'new' && id !== 'undefined';
  const { data: merchantRes, isLoading: isMerchantLoading, error: merchantError } = useGetMerchantQuery(id ?? '', { skip: !isValidId });
  const { data: notesRes } = useGetMerchantNotesQuery(id ?? '', { skip: !isValidId });
  const { data: timelineRes } = useGetMerchantTimelineQuery(id ?? '', { skip: !isValidId });
  // FRS-SAP-402 (2026-08-05): rich detail payload backing the type-specific panels
  // (token history / renewal for Standalone; commission / bridge / usage for Enterprise).
  const { data: detailRes, isLoading: isDetailLoading } = useGetMerchantDetailQuery(id ?? '', { skip: !isValidId });
  const merchant = merchantRes?.data;
  const merchantStatus = merchant?.status || (merchant as any)?.merchantStatus;

  // 2026-08-30 (deboarding audit): ALWAYS fetch when the merchant is loaded. The old gate
  // required status ∈ ['Suspended','Cancelled','Deactivated'] — two of those enum values
  // were RETIRED in Pass 39, and a mid-deboarding merchant keeps status 'Active' (only the
  // IsActive metadata flips), so in-flight deboardings never displayed at all.
  const { data: deboardingRes } = useGetDeboardingByMerchantQuery(id ?? '', { skip: !isValidId || !merchant });

  const notes = notesRes?.data || [];
  const timeline = timelineRes?.data || [];
  const [activateMerchant, { isLoading: isActivating }] = useActivateMerchantMutation();
  const [suspendMerchant, { isLoading: isSuspending }] = useSuspendMerchantMutation();
  const [reactivateMerchant, { isLoading: isReactivating }] = useReactivateMerchantWithResolutionMutation();
  // 2026-08-30: cancelMerchant/deleteMerchant dropped — "Cancel" silently flipped
  // IsActive while toasting about a retired 30-day wind-down, and DELETE /merchants/{id}
  // returns 410 Gone. Deboarding (Pass 39) is the one exit path.
  const [retryProvisioning, { isLoading: isRetrying }] = useRetryProvisioningMutation();
  const [exportMerchant, { isLoading: isExporting }] = useExportMerchantDataMutation();
  const [addNote] = useAddMerchantNoteMutation();
  const [changePlan, { isLoading: isChangingPlan }] = useChangePlanMutation();

  // 2026-08-30 (user directive: "change tier has no meaning"): the plan-change modal
  // offers the REAL catalog — same deployment kind as the active subscription, active,
  // not deprecated, and not the plan the merchant is already on.
  const { data: plansRes } = useGetPlansListQuery(undefined, { skip: !isValidId });
  const activeSub = detailRes?.data?.activeSubscription;
  const planOptions = ((plansRes?.data ?? []) as unknown as WizardPlanOption[]).filter(
    (p) =>
      p.isActive &&
      !p.isDeprecated &&
      p.planId !== activeSub?.planId &&
      (!activeSub?.planType || p.planType === activeSub.planType)
  );

  const [giveConsent] = useGiveDeboardingConsentMutation();
  const [deactivateDeboarding] = useDeactivateDeboardingMutation();
  const [generateFinalInvoice] = useGenerateFinalInvoiceMutation();
  const [settleDeboarding] = useSettleDeboardingMutation();
  const [askRecharge] = useAskRechargeMutation();
  const [issueRefund] = useIssueRefundMutation();
  const [cancelDeboarding] = useCancelDeboardingMutation();
  // 2026-08-30 (deboarding audit): retry-settle + soft-delete existed in the API slice
  // but had no UI wiring — the final step of every deboarding was unreachable.
  const [retryDeboardingSettle] = useRetryDeboardingSettleMutation();
  const [softDeleteDeboarding] = useSoftDeleteDeboardingMutation();

  // Modals state
  const [suspendModal, setSuspendModal] = useState(false);
  const [reactivateModal, setReactivateModal] = useState(false);
  const [planChangeModal, setPlanChangeModal] = useState(false);
  // 2026-08-30: Admin-consent gate — the entry point into the Pass-39 deboarding workflow.
  const [deboardModal, setDeboardModal] = useState(false);

  // Form states inside modals
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendCategory, setSuspendCategory] = useState('');
  const [reactivateResolution, setReactivateResolution] = useState('');
  const [deboardNote, setDeboardNote] = useState('');
  // Plan-change modal: catalog planId + optional audit reason (selectedNewTier retired
  // with the tier fiction — plans are the only subscription unit).
  const [selectedNewPlan, setSelectedNewPlan] = useState<string | null>(null);
  const [planChangeReason, setPlanChangeReason] = useState('');
  // 2026-08-30 (user: "the merchant specific discount is missing"): same per-merchant
  // discount as onboarding's assign-plan — sent as dailyPriceOverride (the negotiated
  // daily rate). Prefilled with the discount implied by the CURRENT subscription
  // (baseDailyPrice vs the current plan's catalog price) so the deal carries over
  // visibly instead of silently resetting to catalog.
  const [planDiscountPct, setPlanDiscountPct] = useState<number>(0);
  const impliedCurrentDiscountPct = (() => {
    const allPlans = (plansRes?.data ?? []) as unknown as WizardPlanOption[];
    const currentCatalog = allPlans.find((p) => p.planId === activeSub?.planId)?.planPricePerDay ?? 0;
    const base = activeSub?.baseDailyPrice;
    if (!currentCatalog || base == null || base >= currentCatalog) return 0;
    return Math.round((1 - base / currentCatalog) * 100);
  })();

  // Action state loading
  const actionLoading =
    isActivating ||
    isSuspending ||
    isReactivating ||
    isRetrying ||
    isExporting ||
    isChangingPlan;

  // Dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);


  const handleAction = async (action: string) => {
    setMenuOpen(false);
    if (action === 'suspend') {
      setSuspendModal(true);
      return;
    }
    if (action === 'deboard') {
      setDeboardModal(true);
      return;
    }
    if (action === 'reactivate') {
      setReactivateModal(true);
      return;
    }
    if (action === 'change-plan') {
      setPlanDiscountPct(impliedCurrentDiscountPct);
      setPlanChangeModal(true);
      return;
    }
    if (action === 'terminals') {
      navigate(`/merchants/${id}/terminals`);
      return;
    }
    if (action === 'edit') {
      navigate(`/merchants/${id}/edit`);
      return;
    }

    if (!id) return;

    try {
      if (action === 'activate') {
        await activateMerchant(id).unwrap();
        toast.success(
          merchant?.merchantType === 'Enterprise'
            ? 'Merchant activated — provisioning triggered, welcome email sent, billing started'
            : 'Merchant activated — first token generated, welcome email with token sent'
        );
      } else if (action === 'retry-provisioning') {
        await retryProvisioning(id).unwrap();
        toast.success('Provisioning retried — monitoring status');
      } else if (action === 'export') {
        // 2026-08-30: the server streams the export document ITSELF as a JSON attachment
        // (FRS-SPA-507); the old handler threw the body away and toasted a fictional
        // async "package". Now it downloads as a file. Platform-side records only for
        // EVERY merchant type — Tier-4 cloud data exports from the merchant cloud itself.
        const doc = await exportMerchant(id).unwrap();
        if (!doc || typeof doc !== 'object' || !('schemaVersion' in doc)) {
          toast.error('Export returned no payload — nothing to download.');
          return;
        }
        const payload = JSON.stringify(doc, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `merchant-export-${(merchant?.businessName || id).replace(/[^A-Za-z0-9_-]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(
          `Export downloaded (${Math.max(1, Math.round(payload.length / 1024))} KB) — all platform-side records for this merchant.`
        );
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || `Failed to ${action} merchant`);
    }
  };

  const handleSuspendConfirm = async () => {
    if (!id) return;
    if (!suspendReason.trim() || !suspendCategory) {
      toast.error('Category and Reason are required.');
      return;
    }
    try {
      await suspendMerchant({ id, reason: `[${suspendCategory}] ${suspendReason.trim()}` }).unwrap();
      toast.success('Merchant suspended');
      setSuspendModal(false);
      setSuspendReason('');
      setSuspendCategory('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to suspend merchant');
    }
  };

  const handleReactivateConfirm = async () => {
    if (!id) return;
    if (!reactivateResolution.trim()) {
      toast.error('Resolution details are required.');
      return;
    }
    try {
      await reactivateMerchant({ id, resolution: reactivateResolution.trim() }).unwrap();
      toast.success(
        merchant?.merchantType === 'Enterprise'
          ? 'Merchant reactivated — sync resumed, API access restored'
          : 'Merchant reactivated — active tokens unsuspended'
      );
      setReactivateModal(false);
      setReactivateResolution('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to reactivate merchant');
    }
  };

  // 2026-08-30: Admin consent — starts the Pass-39 deboarding workflow.
  const handleDeboardConfirm = async () => {
    if (!id) return;
    try {
      await giveConsent({ merchantId: id, note: deboardNote.trim() || undefined }).unwrap();
      toast.success('Deboarding initiated — Admin consent recorded. Operations executes the checklist below.');
      setDeboardModal(false);
      setDeboardNote('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to record consent');
    }
  };

  // 2026-09-04: the "Impersonate (View-Only)" action, its modal and handler are REMOVED.
  // The API minted a token nothing could consume and never returned the `sessionUrl` this
  // handler waited for, so the operator saw "session started" and nothing happened.

  const handleAddNote = async (content: string) => {
    if (!id) return;
    try {
      await addNote({ id, content }).unwrap();
      toast.success('Note added');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to add note');
    }
  };

  // 2026-08-30: ONE honest path for both merchant types. The old handler sent a body the
  // server never read (so every change failed), toasted a fictional pro-rata/wind-down
  // policy, and for Standalone hit the 410-Gone /change-tier then bounced to token
  // generation. Now: POST /change-plan with the catalog planId; the server cuts the
  // subscription over immediately (per-day accrual absorbs the transition).
  const handleApplyPlanChange = async () => {
    if (!id || !selectedNewPlan) return;
    if (planDiscountPct < 0 || planDiscountPct >= 100) {
      toast.error('Discount must be between 0 and 99%.');
      return;
    }
    const target = planOptions.find((p) => p.planId === selectedNewPlan);
    // Same per-merchant pricing semantics as onboarding: the override IS the discounted
    // daily rate; no override ⇒ catalog price.
    const targetCatalog = target?.planPricePerDay ?? 0;
    const effectiveDaily = Number((targetCatalog * (1 - planDiscountPct / 100)).toFixed(2));
    try {
      await changePlan({
        id,
        newPlanId: selectedNewPlan,
        dailyPriceOverride: planDiscountPct > 0 && targetCatalog > 0 ? effectiveDaily : undefined,
        reason: planChangeReason.trim() || undefined,
      }).unwrap();
      const rateNote = planDiscountPct > 0 ? ` at ${effectiveDaily}/day (${planDiscountPct}% off)` : '';
      toast.success(
        merchant?.merchantType === 'Standalone'
          ? `Plan changed to ${target?.displayName ?? 'the new plan'}${rateNote} — tokens issued from now derive from it; already-issued tokens keep their original grants.`
          : `Plan changed to ${target?.displayName ?? 'the new plan'}${rateNote} — effective immediately; the daily deduction now uses the new rate.`
      );
      setPlanChangeModal(false);
      setSelectedNewPlan(null);
      setPlanChangeReason('');
      setPlanDiscountPct(0);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to change plan');
    }
  };

  const handleDeactivateDeboarding = async (deboardingId: string) => {
    try {
      await deactivateDeboarding(deboardingId).unwrap();
      toast.success('Merchant deactivated for deboarding.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to deactivate merchant');
    }
  };

  const handleGenerateFinalInvoice = async (deboardingId: string) => {
    try {
      await generateFinalInvoice(deboardingId).unwrap();
      toast.success('Final invoice generated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to generate final invoice');
    }
  };

  const handleSettleDeboarding = async (deboardingId: string) => {
    try {
      await settleDeboarding(deboardingId).unwrap();
      toast.success('Billing settled successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to settle billing');
    }
  };

  const handleAskRecharge = async (deboardingId: string, shortfallAmount: number, note?: string) => {
    try {
      await askRecharge({ deboardingId, shortfallAmount, note }).unwrap();
      toast.success('Shortfall recharge notice sent to merchant.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to request recharge');
    }
  };

  const handleIssueRefund = async (deboardingId: string, channel: string, reference?: string, note?: string) => {
    try {
      await issueRefund({ deboardingId, channel, payoutReference: reference, note }).unwrap();
      toast.success('Refund recorded successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to issue refund');
    }
  };

  const handleCancelDeboarding = async (deboardingId: string, reason: string) => {
    try {
      await cancelDeboarding({ deboardingId, reason }).unwrap();
      toast.success('Deboarding cancelled.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to cancel deboarding');
    }
  };

  const handleRetrySettleDeboarding = async (deboardingId: string) => {
    try {
      await retryDeboardingSettle(deboardingId).unwrap();
      toast.success('Settlement retried after recharge.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to retry settlement');
    }
  };

  const handleSoftDeleteDeboarding = async (deboardingId: string) => {
    try {
      await softDeleteDeboarding(deboardingId).unwrap();
      toast.success('Merchant soft-deleted — deboarding complete.');
      navigate('/merchants');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to soft-delete the merchant');
    }
  };

  return (
    <MerchantDetailPage
      id={id ?? ''}
      merchant={merchant}
      detail={detailRes?.data ?? null}
      isDetailLoading={isDetailLoading}
      isMerchantLoading={isMerchantLoading}
      merchantError={merchantError}
      notes={notes}
      timeline={timeline}
      actionLoading={actionLoading}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      menuRef={menuRef}
      handleAction={handleAction}
      
      suspendModal={suspendModal}
      setSuspendModal={setSuspendModal}
      suspendReason={suspendReason}
      setSuspendReason={setSuspendReason}
      suspendCategory={suspendCategory}
      setSuspendCategory={setSuspendCategory}
      handleSuspendConfirm={handleSuspendConfirm}
      isSuspending={isSuspending}

      reactivateModal={reactivateModal}
      setReactivateModal={setReactivateModal}
      reactivateResolution={reactivateResolution}
      setReactivateResolution={setReactivateResolution}
      handleReactivateConfirm={handleReactivateConfirm}
      isReactivating={isReactivating}

      deboardModal={deboardModal}
      setDeboardModal={setDeboardModal}
      deboardNote={deboardNote}
      setDeboardNote={setDeboardNote}
      handleDeboardConfirm={handleDeboardConfirm}

      planChangeModal={planChangeModal}
      setPlanChangeModal={setPlanChangeModal}
      planOptions={planOptions}
      selectedNewPlan={selectedNewPlan}
      setSelectedNewPlan={setSelectedNewPlan}
      planChangeReason={planChangeReason}
      setPlanChangeReason={setPlanChangeReason}
      planDiscountPct={planDiscountPct}
      setPlanDiscountPct={setPlanDiscountPct}
      handleApplyPlanChange={handleApplyPlanChange}
      isChangingPlan={isChangingPlan}

      handleAddNote={handleAddNote}
      onBack={() => navigate('/merchants')}

      deboarding={deboardingRes?.data}
      handleDeactivateDeboarding={handleDeactivateDeboarding}
      handleGenerateFinalInvoice={handleGenerateFinalInvoice}
      handleSettleDeboarding={handleSettleDeboarding}
      handleAskRecharge={handleAskRecharge}
      handleIssueRefund={handleIssueRefund}
      handleCancelDeboarding={handleCancelDeboarding}
      handleRetrySettleDeboarding={handleRetrySettleDeboarding}
      handleSoftDeleteDeboarding={handleSoftDeleteDeboarding}
    />
  );
};

export default MerchantDetailWrapper;
