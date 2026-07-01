import { useGetSessionsQuery, useRevokeSessionMutation, useRevokeAllSessionsMutation } from '../services/authApi';

export const useSession = () => {
  const { data: sessionsResponse, isLoading, refetch } = useGetSessionsQuery();
  const [revokeSessionMutation, { isLoading: isRevoking }] = useRevokeSessionMutation();
  const [revokeAllSessionsMutation, { isLoading: isRevokingAll }] = useRevokeAllSessionsMutation();

  const sessions = sessionsResponse?.data || [];

  const revokeSession = async (sessionId: string) => {
    await revokeSessionMutation(sessionId).unwrap();
  };

  const revokeAllSessions = async () => {
    await revokeAllSessionsMutation().unwrap();
  };

  return {
    sessions,
    isLoading,
    isRevoking,
    isRevokingAll,
    refetch,
    revokeSession,
    revokeAllSessions,
  };
};

export default useSession;
