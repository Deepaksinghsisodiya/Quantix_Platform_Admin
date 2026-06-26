import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useGenerateToken } from '../services/useTokens';
import { useCreateTokenInvoice, useRecordManualPayment, useMarkInvoicePaid } from '@/modules/billing/services/useBilling';
import { emailToken } from '@/lib/api/tokens';
import { useAuthStore } from '@/lib/store/authStore';
import { canAccess } from '@/lib/utils/permissions';
import type { PlatformRole } from '@/lib/types/user';
import type { RechargeToken, TokenGenerateRequest, TokenTier, Invoice } from '@/lib/types';
import { AddTokenPage, PaymentMethod } from './AddTokenPage';

export const AddTokenWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [generatedToken, setGeneratedToken] = useState<RechargeToken | null>(null);
  const [tokenInvoice, setTokenInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [manualPaymentModal, setManualPaymentModal] = useState(false);
  const [manualRef, setManualRef] = useState('');
  const [lastRequest, setLastRequest] = useState<TokenGenerateRequest | null>(null);

  const generateMutation = useGenerateToken();
  const createInvoiceMutation = useCreateTokenInvoice();
  const recordPaymentMutation = useRecordManualPayment();
  const markPaidMutation = useMarkInvoicePaid();

  const { user, permissions } = useAuthStore();
  const canGenerate = user
    ? canAccess(user.role as PlatformRole, 'token', 'generate', permissions)
    : false;

  const prefill = useMemo(() => {
    const merchantId = searchParams.get('merchantId');
    const tier = searchParams.get('tier') as TokenTier | null;
    if (!merchantId) return undefined;
    return { merchantId, tier: tier ?? undefined };
  }, [searchParams]);

  const handleSubmit = useCallback((request: TokenGenerateRequest) => {
    setLastRequest(request);
    generateMutation.mutate(request, {
      onSuccess: async (response) => {
        const token = response.data;
        setGeneratedToken(token);
        toast.success('Token generated successfully');

        try {
          const invoiceRes = await createInvoiceMutation.mutateAsync({
            merchantId: request.merchantId,
            tokenId: token.id,
            tier: request.tier,
            validityDays: request.validityDays,
            quantity: 1,
            unitPrice: token.priceAtGeneration ?? 0,
            bulkDiscountPercent: 0,
            taxRate: 10,
            paymentMethod,
            invoiceOption: request.invoiceOption ?? 'immediate',
          });
          setTokenInvoice(invoiceRes.data);
        } catch {
          toast.warning('Token generated but invoice creation failed. Create invoice manually from billing.');
        }
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to generate token');
      },
    });
  }, [generateMutation, createInvoiceMutation, paymentMethod]);

  const handleEmail = useCallback(async (token: RechargeToken) => {
    try {
      toast.info(`Sending token to ${token.merchantName}...`);
      await emailToken(token.id, token.merchantName);
      toast.success(`Token emailed to ${token.merchantName}`);
    } catch {
      toast.error('Failed to send token email');
    }
  }, []);

  const handleDownloadPdf = useCallback((_token: RechargeToken) => {
    toast.info('Preparing PDF download...');
  }, []);

  const handleRecordManualPayment = useCallback(async () => {
    if (!tokenInvoice || !manualRef.trim()) return;
    try {
      const res = await recordPaymentMutation.mutateAsync({
        invoiceId: tokenInvoice.id,
        amount: tokenInvoice.total,
        method: 'BankTransfer',
        reference: manualRef.trim(),
      });
      setTokenInvoice(res.data);
      setManualPaymentModal(false);
      setManualRef('');
      toast.success('Manual payment recorded — invoice marked as Paid');
    } catch {
      toast.error('Failed to record payment');
    }
  }, [tokenInvoice, manualRef, recordPaymentMutation]);

  const handleMarkPrepaid = useCallback(async () => {
    if (!tokenInvoice) return;
    try {
      const res = await markPaidMutation.mutateAsync({
        invoiceId: tokenInvoice.id,
        paymentRef: 'PREPAID — included in enterprise deal',
      });
      setTokenInvoice({ ...tokenInvoice, status: 'Paid', paidDate: new Date().toISOString() });
      toast.success('Invoice marked as pre-paid');
    } catch {
      toast.error('Failed to mark as pre-paid');
    }
  }, [tokenInvoice, markPaidMutation]);

  const handleGenerateAnother = useCallback(() => {
    setGeneratedToken(null);
    setTokenInvoice(null);
    setLastRequest(null);
  }, []);

  return (
    <AddTokenPage
      canGenerate={canGenerate}
      generatedToken={generatedToken}
      tokenInvoice={tokenInvoice}
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
      manualPaymentModal={manualPaymentModal}
      setManualPaymentModal={setManualPaymentModal}
      manualRef={manualRef}
      setManualRef={setManualRef}
      prefill={prefill}
      isGenerating={generateMutation.isPending}
      isInvoiceCreating={createInvoiceMutation.isPending}
      isRecordingPayment={recordPaymentMutation.isPending}
      isMarkingPaid={markPaidMutation.isPending}
      onSubmit={handleSubmit}
      onEmail={handleEmail}
      onDownloadPdf={handleDownloadPdf}
      onRecordManualPayment={handleRecordManualPayment}
      onMarkPrepaid={handleMarkPrepaid}
      onGenerateAnother={handleGenerateAnother}
    />
  );
};

export default AddTokenWrapper;
