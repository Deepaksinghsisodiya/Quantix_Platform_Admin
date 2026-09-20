/**
 * Signup Queue — 2026-08-12 rework (user-locked model): the queue is the ENQUIRY INBOX,
 * not a wizard dashboard. What matters: who signed up NEW (and from where), the business
 * enquiry details (row click), and the DECISION — Onboard (opens the wizard = acceptance)
 * or Reject (reason required, audit-logged, clears junk/spam signups). Rows already in
 * onboarding show "Step X of 7" and leave the queue on activation. The All Merchants
 * directory now starts where this queue ends (activated onward) — no shared rows.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useGetWizardInProgressQuery, useWizardRejectMutation } from '../OnboardingWizard/wizardApi';
import type { WizardState } from '../OnboardingWizard/wizard.types';
import SignupQueuePage, { isAwaitingDecision } from './SignupQueuePage';

export const SignupQueueWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'website' | 'admin'>('all');
  const [stageFilter, setStageFilter] = useState<'all' | 'awaiting' | 'onboarding'>('all');

  const { data, isLoading, isFetching, refetch } = useGetWizardInProgressQuery(undefined, {
    pollingInterval: autoRefresh ? 30_000 : 0,
  });
  const [rejectSignup, { isLoading: isRejecting }] = useWizardRejectMutation();

  const signups: WizardState[] = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    return signups.filter((s) => {
      if (sourceFilter !== 'all') {
        const isAdmin = (s.signupSource ?? '').startsWith('admin');
        if (sourceFilter === 'admin' && !isAdmin) return false;
        if (sourceFilter === 'website' && isAdmin) return false;
      }
      if (stageFilter === 'awaiting' && !isAwaitingDecision(s)) return false;
      if (stageFilter === 'onboarding' && isAwaitingDecision(s)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = s.companyName?.toLowerCase() ?? '';
        const email = s.basicInfo?.contactEmail?.toLowerCase() ?? '';
        const nature = s.basicInfo?.businessNature?.toLowerCase() ?? '';
        if (!name.includes(q) && !email.includes(q) && !nature.includes(q)) return false;
      }
      return true;
    });
  }, [signups, sourceFilter, stageFilter, searchQuery]);

  const handleReject = async (merchantId: string, reason: string): Promise<boolean> => {
    try {
      await rejectSignup({ merchantId, reason }).unwrap();
      toast.success('Signup rejected and removed from the queue.');
      refetch();
      return true;
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || 'Failed to reject the signup.');
      return false;
    }
  };

  return (
    <SignupQueuePage
      isLoading={isLoading}
      isFetching={isFetching}
      refetch={refetch}
      signups={signups}
      filteredSignups={filtered}
      autoRefresh={autoRefresh}
      setAutoRefresh={setAutoRefresh}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      sourceFilter={sourceFilter}
      setSourceFilter={setSourceFilter}
      stageFilter={stageFilter}
      setStageFilter={setStageFilter}
      isRejecting={isRejecting}
      onNewSignup={() => navigate('/merchants/signups/new')}
      onContinue={(id) => navigate(`/merchants/onboard/${id}`)}
      onReject={handleReject}
    />
  );
};

export default SignupQueueWrapper;
