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
    const rows = data?.data ?? [];
    return rows.map((r: SignupQueueEntry) => {
      const status: SignupStatus =
        r.status === 'Pending' ? 'PendingVerification'
        : r.status === 'Verified' ? 'PendingPayment'
        : r.status === 'Provisioning' ? 'Provisioning'
        : r.status === 'Completed' ? 'Active'
        : 'Failed';
      return {
        id: r.id,
        businessName: r.businessName,
        merchantType: r.merchantType as 'Enterprise' | 'Standalone',
        businessNature: '',
        email: r.email,
        status,
        submittedAt: r.submittedAt,
        error: r.error || null,
      };
    });
  }, [data]);

  // Client-side filtering for type
  const filteredSignups = useMemo(() => {
    return signups.filter((s) => {
      if (typeFilter && s.merchantType !== typeFilter) return false;
      return true;
    });
  }, [signups, typeFilter]);

  const handleAction = useCallback(async (id: string, action: string) => {
    try {
      if (action === 'resend') {
        await resendVerification(id).unwrap();
        toast.success(`Verification email resent for ${id}`);
      } else if (action === 'bypass') {
        await bypassPayment({ id }).unwrap();
        toast.success(`Payment bypassed for ${id} (trial activation)`);
      } else if (action === 'retry') {
        await retryProvisioning(id).unwrap();
        toast.success(`Provisioning retry initiated for ${id}`);
      } else if (action === 'generate-token') {
        navigate(`/tokens/generate?merchantId=${id}`);
      } else if (action === 'accept') {
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
    setAccepting(true);
    try {
      await activateMerchant(acceptCandidate.id).unwrap();
      toast.success(`${acceptCandidate.businessName} accepted. Credentials emailed.`);
      setAcceptCandidate(null);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || `Failed to accept ${acceptCandidate.id}`;
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
