import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useGetSignupQueueQuery,
  useResendVerificationMutation,
  useBypassPaymentMutation,
  useRetryProvisioningMutation,
  useActivateMerchantMutation,
} from '../services/merchantApi';
import type { SignupQueueEntry } from '../types/merchant.types';
import SignupQueuePage, { SignupEntry, SignupStatus } from './SignupQueuePage';

export const SignupQueueWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [acceptCandidate, setAcceptCandidate] = useState<SignupEntry | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Mutations
  const [resendVerification] = useResendVerificationMutation();
  const [bypassPayment] = useBypassPaymentMutation();
  const [retryProvisioning] = useRetryProvisioningMutation();
  const [activateMerchant] = useActivateMerchantMutation();

  // Map local statusFilter to server status string
  const serverStatus = useMemo(() => {
    switch (statusFilter) {
      case 'PendingVerification': return 'Pending';
      case 'PendingPayment': return 'Verified';
      case 'Provisioning': return 'Provisioning';
      case 'Active': return 'Completed';
      case 'Failed': return 'Failed';
      default: return undefined;
    }
  }, [statusFilter]);

  // Fetch using RTK Query
  const { data, isLoading, isFetching, refetch } = useGetSignupQueueQuery({
    page: 1,
    pageSize: 100,
    ...(serverStatus ? { status: serverStatus } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  }, {
    pollingInterval: autoRefresh ? 30000 : 0,
  });

  // Map server rows to local formats
  const signups: SignupEntry[] = useMemo(() => {
    const rows = (data?.data as any[]) ?? [];
    return rows.map((r: any) => {
      const rawStatus = r.status || r.merchantStatus;
      const status: SignupStatus =
        rawStatus === 'Pending' || rawStatus === 'PendingApproval' ? 'PendingVerification'
        : rawStatus === 'Verified' ? 'PendingPayment'
        : rawStatus === 'Provisioning' ? 'Provisioning'
        : rawStatus === 'Completed' || rawStatus === 'Active' ? 'Active'
        : 'Failed';

      return {
        id: r.id || r.signupId,
        businessName: r.businessName || r.companyName || 'Merchant Candidate',
        email: r.email || r.adminEmail || 'admin@business.com',
        phone: r.phone || '—',
        merchantType: (r.merchantType || 'Enterprise') as 'Enterprise' | 'Standalone',
        planName: r.plan || r.selectedPlan || (r.merchantType === 'Standalone' ? 'Standalone POS Pro' : 'Professional Enterprise'),
        signupDate: r.createdAt || r.signupDate || new Date().toISOString(),
        status,
        subdomain: r.subdomain || r.businessName?.toLowerCase().replace(/[^a-z0-9]/g, ''),
        verificationSentAt: r.verificationSentAt || r.createdAt,
        dbStatus: r.dbStatus || (status === 'Active' ? 'Ready' : status === 'Provisioning' ? 'Creating...' : 'Not Started'),
        businessNature: r.businessNature || 'General Retail',
        submittedAt: r.createdAt || r.signupDate || new Date().toISOString(),
        error: r.error || null,
      };
    });
  }, [data]);

  // Apply filters
  const filteredSignups = useMemo(() => {
    return signups.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (typeFilter && s.merchantType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.businessName.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [signups, statusFilter, typeFilter, searchQuery]);

  const handleAction = useCallback(async (id: string, action: string) => {
    try {
      if (action === 'resend-verification') {
        await resendVerification(id).unwrap();
        toast.success(`Verification email resent to merchant ${id}`);
      } else if (action === 'bypass-payment') {
        await bypassPayment({ id }).unwrap();
        toast.success(`Payment bypassed for merchant ${id}`);
        refetch();
      } else if (action === 'retry-provisioning') {
        await retryProvisioning(id).unwrap();
        toast.success(`Provisioning retried for merchant ${id}`);
        refetch();
      } else if (action === 'generate-token') {
        toast.info(`Token generated for candidate ${id}`);
      } else if (action === 'accept-candidate') {
        const entry = signups.find((s) => s.id === id);
        if (entry) setAcceptCandidate(entry);
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || `Failed to perform ${action}`;
      toast.error(msg);
    }
  }, [navigate, signups, resendVerification, bypassPayment, retryProvisioning]);

  const confirmAccept = useCallback(async () => {
    if (!acceptCandidate) return;
    const targetId = acceptCandidate.id ?? (acceptCandidate as any).merchantId ?? (acceptCandidate as any).signupId;
    if (!targetId) {
      toast.error('Merchant ID is missing for activation');
      return;
    }
    setAccepting(true);
    try {
      await activateMerchant(targetId).unwrap();
      toast.success(`${acceptCandidate.businessName} accepted. Credentials emailed.`);
      setAcceptCandidate(null);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || `Failed to accept ${targetId}`;
      toast.error(msg);
    } finally {
      setAccepting(false);
    }
  }, [acceptCandidate, activateMerchant]);

  return (
    <SignupQueuePage
      isLoading={isLoading}
      isFetching={isFetching}
      refetch={refetch}
      signups={signups}
      filteredSignups={filteredSignups}
      autoRefresh={autoRefresh}
      setAutoRefresh={setAutoRefresh}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      typeFilter={typeFilter}
      setTypeFilter={setTypeFilter}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      acceptCandidate={acceptCandidate}
      setAcceptCandidate={setAcceptCandidate}
      accepting={accepting}
      confirmAccept={confirmAccept}
      handleAction={handleAction}
    />
  );
};

export default SignupQueueWrapper;
