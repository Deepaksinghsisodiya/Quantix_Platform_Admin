import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useGetMerchantQuery,
  useGetMerchantNotesQuery,
  useGetMerchantTimelineQuery,
  useActivateMerchantMutation,
  useSuspendMerchantMutation,
  useReactivateMerchantWithResolutionMutation,
  useCancelMerchantMutation,
  useDeleteMerchantMutation,
  useRetryProvisioningMutation,
  useExportMerchantDataMutation,
  useAddMerchantNoteMutation,
  useChangePlanMutation,
  useChangeTierMutation,
  useImpersonateMerchantMutation,
  useGetDeboardingByMerchantQuery,
  useGiveDeboardingConsentMutation,
  useDeactivateDeboardingMutation,
  useGenerateFinalInvoiceMutation,
  useSettleDeboardingMutation,
  useAskRechargeMutation,
  useIssueRefundMutation,
  useCancelDeboardingMutation,
} from '../services/merchantApi';

import MerchantDetailPage from './MerchantDetailPage';

export const MerchantDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: merchantRes, isLoading: isMerchantLoading, error: merchantError } = useGetMerchantQuery(id ?? '');
  const { data: notesRes } = useGetMerchantNotesQuery(id ?? '');
  const { data: timelineRes } = useGetMerchantTimelineQuery(id ?? '');
  const merchant = merchantRes?.data;
  const merchantStatus = merchant?.status || (merchant as any)?.merchantStatus;

  // Only query deboarding when merchant is in a deboarding-relevant state
  const shouldFetchDeboarding = !!id && !!merchant && ['Suspended', 'Cancelled', 'Deactivated'].includes(merchantStatus);
  const { data: deboardingRes } = useGetDeboardingByMerchantQuery(id ?? '', { skip: !shouldFetchDeboarding });

  const notes = notesRes?.data || [];
  const timeline = timelineRes?.data || [];
  const [activateMerchant, { isLoading: isActivating }] = useActivateMerchantMutation();
  const [suspendMerchant, { isLoading: isSuspending }] = useSuspendMerchantMutation();
  const [reactivateMerchant, { isLoading: isReactivating }] = useReactivateMerchantWithResolutionMutation();
  const [cancelMerchant, { isLoading: isCancelling }] = useCancelMerchantMutation();
  const [deleteMerchant, { isLoading: isDeleting }] = useDeleteMerchantMutation();
  const [retryProvisioning, { isLoading: isRetrying }] = useRetryProvisioningMutation();
  const [exportMerchant, { isLoading: isExporting }] = useExportMerchantDataMutation();
  const [addNote] = useAddMerchantNoteMutation();
  const [changePlan, { isLoading: isChangingPlan }] = useChangePlanMutation();
  const [changeTier, { isLoading: isChangingTier }] = useChangeTierMutation();
  const [impersonateMerchant, { isLoading: isImpersonating }] = useImpersonateMerchantMutation();

  const [giveConsent] = useGiveDeboardingConsentMutation();
  const [deactivateDeboarding] = useDeactivateDeboardingMutation();
  const [generateFinalInvoice] = useGenerateFinalInvoiceMutation();
  const [settleDeboarding] = useSettleDeboardingMutation();
  const [askRecharge] = useAskRechargeMutation();
  const [issueRefund] = useIssueRefundMutation();
  const [cancelDeboarding] = useCancelDeboardingMutation();

  // Modals state
  const [suspendModal, setSuspendModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [reactivateModal, setReactivateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [planChangeModal, setPlanChangeModal] = useState(false);
  const [impersonateModal, setImpersonateModal] = useState(false);

  // Form states inside modals
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendCategory, setSuspendCategory] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [reactivateResolution, setReactivateResolution] = useState('');
  const [selectedNewPlan, setSelectedNewPlan] = useState<string | null>(null);
  const [selectedNewTier, setSelectedNewTier] = useState<string | null>(null);

  // Action state loading
  const actionLoading =
    isActivating ||
    isSuspending ||
    isReactivating ||
    isCancelling ||
    isDeleting ||
    isRetrying ||
    isExporting ||
    isChangingPlan ||
    isChangingTier ||
    isImpersonating;

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
    if (action === 'cancel') {
      setCancelModal(true);
      return;
    }
    if (action === 'reactivate') {
      setReactivateModal(true);
      return;
    }
    if (action === 'delete') {
      setDeleteModal(true);
      return;
    }
    if (action === 'change-plan') {
      setPlanChangeModal(true);
      return;
    }
    if (action === 'impersonate') {
      setImpersonateModal(true);
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
        await exportMerchant(id).unwrap();
        toast.success(
          merchant?.merchantType === 'Enterprise'
            ? 'Data export started — package will include merchant database export'
            : 'Data export started — package will include platform records only (no merchant database)'
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

  const handleCancelConfirm = async () => {
    if (!id) return;
    if (!cancelReason.trim()) {
      toast.error('Cancellation reason is required.');
      return;
    }
    try {
      await cancelMerchant({ id, reason: cancelReason.trim() }).unwrap();
      toast.success('Merchant cancelled — 30-day wind-down period started');
      setCancelModal(false);
      setCancelReason('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to cancel merchant');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await deleteMerchant(id).unwrap();
      toast.success(
        merchant?.merchantType === 'Enterprise'
          ? 'Merchant deleted — database anonymized + records removed'
          : 'Merchant deleted — records removed'
      );
      setDeleteModal(false);
      navigate('/merchants');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete merchant');
    }
  };

  const handleImpersonateConfirm = async () => {
    if (!id) return;
    setImpersonateModal(false);
    try {
      const res = await impersonateMerchant(id).unwrap();
      toast.success(`Impersonation session started for "${merchant?.businessName}" — view-only mode.`);
      if (res.data?.sessionUrl) {
        window.open(res.data.sessionUrl, '_blank');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Impersonation failed.');
    }
  };

  const handleAddNote = async (content: string) => {
    if (!id) return;
    try {
      await addNote({ id, content }).unwrap();
      toast.success('Note added');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to add note');
    }
  };

  const handleApplyPlanChange = async () => {
    if (!id) return;
    if (merchant?.merchantType === 'Enterprise' && selectedNewPlan) {
      try {
        await changePlan({ id, plan: selectedNewPlan }).unwrap();
        const planOrder = ['Starter', 'Professional', 'Business', 'Enterprise'];
        const isUp = planOrder.indexOf(selectedNewPlan) > planOrder.indexOf(merchant.plan || '');
        toast.success(
          isUp
            ? `Upgraded to ${selectedNewPlan} — applied immediately with pro-rata adjustment`
            : `Downgraded to ${selectedNewPlan} — effective at end of billing cycle`
        );
        setPlanChangeModal(false);
        setSelectedNewPlan(null);
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || 'Failed to change plan');
      }
    } else if (merchant?.merchantType === 'Standalone' && selectedNewTier) {
      try {
        await changeTier({ id, tier: selectedNewTier }).unwrap();
        toast.success(`Tier changed to ${selectedNewTier} — redirecting to token generation`);
        setPlanChangeModal(false);
        setSelectedNewTier(null);
        navigate(`/tokens/generate?merchantId=${id}&tier=${selectedNewTier}`);
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || 'Failed to change tier');
      }
    }
  };

  const handleGiveConsent = async (note?: string) => {
    if (!id) return;
    try {
      await giveConsent({ merchantId: id, note }).unwrap();
      toast.success('Deboarding initiated — consent recorded.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to record consent');
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

  return (
    <MerchantDetailPage
      id={id ?? ''}
      merchant={merchant}
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

      cancelModal={cancelModal}
      setCancelModal={setCancelModal}
      cancelReason={cancelReason}
      setCancelReason={setCancelReason}
      handleCancelConfirm={handleCancelConfirm}
      isCancelling={isCancelling}

      deleteModal={deleteModal}
      setDeleteModal={setDeleteModal}
      handleDeleteConfirm={handleDeleteConfirm}
      isDeleting={isDeleting}

      planChangeModal={planChangeModal}
      setPlanChangeModal={setPlanChangeModal}
      selectedNewPlan={selectedNewPlan}
      setSelectedNewPlan={setSelectedNewPlan}
      selectedNewTier={selectedNewTier}
      setSelectedNewTier={setSelectedNewTier}
      handleApplyPlanChange={handleApplyPlanChange}
      isChangingPlan={isChangingPlan}
      isChangingTier={isChangingTier}

      impersonateModal={impersonateModal}
      setImpersonateModal={setImpersonateModal}
      handleImpersonateConfirm={handleImpersonateConfirm}
      isImpersonating={isImpersonating}

      handleAddNote={handleAddNote}
      onBack={() => navigate('/merchants')}

      deboarding={deboardingRes?.data}
      handleGiveConsent={handleGiveConsent}
      handleDeactivateDeboarding={handleDeactivateDeboarding}
      handleGenerateFinalInvoice={handleGenerateFinalInvoice}
      handleSettleDeboarding={handleSettleDeboarding}
      handleAskRecharge={handleAskRecharge}
      handleIssueRefund={handleIssueRefund}
      handleCancelDeboarding={handleCancelDeboarding}
    />
  );
};

export default MerchantDetailWrapper;
