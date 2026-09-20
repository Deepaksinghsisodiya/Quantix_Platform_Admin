/**
 * Token Detail — 2026-08-29 rebuild. The former wrapper synthesized a Validity-Started/
 * Expiry timeline from validFrom/validTo fields the server never sent, and its
 * "Email to Merchant" button only toasted "Sending…" without making any request.
 * The timeline now reflects the real lifecycle: generated → activated (if applied) →
 * expires → revoked (with the recorded actor and reason).
 */
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ROUTES } from '@/lib/config/routes';
import { useSendTokenMutation } from '../services/tokenApi';
import { useToken, useRevokeToken } from '../services/useTokens';
import { TokenView, TimelineEvent } from './TokenView';

export const TokenViewWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [revokeModal, setRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  const { data, isLoading, isError, refetch } = useToken(id);
  const revokeMutation = useRevokeToken();
  const [sendToken, sendTokenState] = useSendTokenMutation();

  const token = data?.data;

  // Days remaining only exists once the merchant applies the token (Rule 7).
  const daysRemaining = useMemo(() => {
    if (!token?.expiresAt) return null;
    return Math.max(0, Math.ceil((new Date(token.expiresAt).getTime() - Date.now()) / 86_400_000));
  }, [token]);

  const expiryPercent = useMemo(() => {
    if (daysRemaining == null || !token || token.validityDays <= 0) return 0;
    return Math.min(100, Math.round((daysRemaining / token.validityDays) * 100));
  }, [daysRemaining, token]);

  const timeline = useMemo<TimelineEvent[]>(() => {
    if (!token) return [];
    const events: TimelineEvent[] = [
      {
        id: 'gen',
        timestamp: token.createdAt,
        title: 'Token Generated',
        description: `Sequence #${token.sequence}, ${token.validityDays}-day validity`,
        user: token.generatedBy,
        type: 'success',
      },
    ];
    if (token.activatedAt) {
      events.push({
        id: 'activated',
        timestamp: token.activatedAt,
        title: 'Token Applied',
        description: token.activatedTerminalId
          ? `Applied on terminal ${token.activatedTerminalId}`
          : 'Applied by the merchant',
        user: 'Merchant',
        type: 'info',
      });
    }
    if (token.expiresAt) {
      events.push({
        id: 'expiry',
        timestamp: token.expiresAt,
        title: token.status === 'Expired' ? 'Token Expired' : 'Token Expiry',
        description:
          token.status === 'Expired'
            ? 'Token expired and is no longer usable'
            : `Coverage ends (${token.validityDays}-day validity)`,
        user: 'System',
        type: token.status === 'Expired' ? 'error' : 'warning',
      });
    }
    if (token.status === 'Revoked' && token.revokedAt) {
      events.push({
        id: 'revoked',
        timestamp: token.revokedAt,
        title: 'Token Revoked',
        description: token.revokedReason ?? 'No reason recorded',
        user: token.revokedBy ?? 'Unknown',
        type: 'error',
      });
    }
    return events;
  }, [token]);

  const handleCopy = useCallback(() => {
    if (!token) return;
    navigator.clipboard.writeText(token.encodedToken).then(
      () => {
        setCopied(true);
        toast.success('Token copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      },
      () => toast.error('Failed to copy token'),
    );
  }, [token]);

  const handleRevoke = useCallback(() => {
    if (!revokeReason.trim() || !token) return;
    revokeMutation.mutate(
      { tokenId: token.tokenId, reason: revokeReason },
      {
        onSuccess: () => {
          toast.success('Token revoked');
          setRevokeModal(false);
          setRevokeReason('');
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to revoke token');
        },
      },
    );
  }, [revokeReason, token, revokeMutation]);

  const handleSend = useCallback(async () => {
    if (!token) return;
    try {
      await sendToken(token.tokenId).unwrap();
      toast.success(`Token emailed to ${token.merchantName || 'the merchant'}`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to email the token');
    }
  }, [token, sendToken]);

  const handleBack = useCallback(() => {
    navigate(ROUTES.TOKENS.LIST);
  }, [navigate]);

  return (
    <TokenView
      token={token}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      daysRemaining={daysRemaining}
      expiryPercent={expiryPercent}
      copied={copied}
      handleCopy={handleCopy}
      handleSend={handleSend}
      isSending={sendTokenState.isLoading}
      revokeModal={revokeModal}
      setRevokeModal={setRevokeModal}
      revokeReason={revokeReason}
      setRevokeReason={setRevokeReason}
      handleRevoke={handleRevoke}
      isRevoking={revokeMutation.isPending}
      timeline={timeline}
      onBack={handleBack}
    />
  );
};

export default TokenViewWrapper;
