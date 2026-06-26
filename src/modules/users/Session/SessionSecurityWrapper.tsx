import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  useGetActiveSessionsQuery,
  useGetSessionPolicyQuery,
  useUpdateSessionPolicyMutation,
  useTerminateSessionMutation,
} from '../services/userApi';
import type { SessionPolicy, ActiveSession } from '../types/user.types';
import SessionSecurityPage from './SessionSecurityPage';
import { Loader2 } from 'lucide-react';

export const SessionSecurityWrapper: React.FC = () => {
  const { data: sessionsResponse, isLoading: isSessionsLoading, isError: isSessionsError, refetch: refetchSessions } = useGetActiveSessionsQuery();
  const { data: policyResponse, isLoading: isPolicyLoading, isError: isPolicyError, refetch: refetchPolicy } = useGetSessionPolicyQuery();

  const [updatePolicy, { isLoading: isSavingPolicy }] = useUpdateSessionPolicyMutation();
  const [terminateSession, { isLoading: isTerminating }] = useTerminateSessionMutation();

  const [policy, setPolicy] = useState<SessionPolicy>({
    timeoutMinutes: 30,
    maxConcurrentSessions: 1,
    forceLogoutOnPasswordChange: true,
  });

  useEffect(() => {
    const dto = policyResponse?.data;
    if (dto) {
      setPolicy({
        timeoutMinutes: dto.timeoutMinutes,
        maxConcurrentSessions: dto.maxConcurrentSessions,
        forceLogoutOnPasswordChange: dto.forceLogoutOnPasswordChange,
      });
    }
  }, [policyResponse]);

  const handleSavePolicy = async () => {
    try {
      await updatePolicy(policy).unwrap();
      toast.success('Session security policy updated');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Save failed.';
      toast.error(msg);
    }
  };

  const handleTerminateSession = async (session: ActiveSession) => {
    try {
      await terminateSession(session.sessionId).unwrap();
      toast.success(`Session for ${session.username} terminated`);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Terminate failed.';
      toast.error(msg);
    }
  };

  const setPolicyField = <K extends keyof SessionPolicy>(field: K, value: SessionPolicy[K]) => {
    setPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = isSessionsLoading || isPolicyLoading;
  const isError = isSessionsError || isPolicyError;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
        <p className="font-semibold">Failed to load session security configurations.</p>
        <button
          type="button"
          onClick={() => {
            void refetchSessions();
            void refetchPolicy();
          }}
          className="mt-2 text-sm font-medium underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <SessionSecurityPage
      sessions={sessionsResponse?.data ?? []}
      policy={policy}
      setPolicyField={setPolicyField}
      onSavePolicy={handleSavePolicy}
      onTerminateSession={handleTerminateSession}
      isSavingPolicy={isSavingPolicy}
      isTerminating={isTerminating}
    />
  );
};

export default SessionSecurityWrapper;
