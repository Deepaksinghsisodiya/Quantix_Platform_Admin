/**
 * Generate Tokens — 3-step wizard (2026-08-29 Pass 44, user-locked design).
 *
 * Step 1 Merchant & Plan — Standalone merchant, subscribed plan (read-only), validity
 *   days → price. Terminal binding is MANDATORY for Standalone POS (registry-backed,
 *   payload.tid validated on apply) and absent for Standalone Cloud.
 * Step 2 Payment — methods come from the platform Payment Methods catalog (enabled
 *   only). Every method records evidence in place; "External" means the payment was
 *   collected OUTSIDE the platform (bank transfer, outside settlement, unlinked card…)
 *   so its reference is MANDATORY — it is the accounting trail. (2026-08-29: the
 *   gateway payment-link flow that briefly lived here was removed — user-locked.)
 * Step 3 Generate — issues the token (plan-derived, invoiced paid atomically) and shows
 *   it in the fixed wire format with copy/print/resend.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuthStore } from '@/lib/store/authStore';
import { canAccess } from '@/lib/utils/permissions';
import type { PlatformRole } from '@/lib/types/user';
import type { TokenIssueResult } from '@/lib/types';
import { useGetMerchantsQuery, useGetTerminalsByMerchantQuery } from '@/modules/merchants/services/merchantApi';
import { useGetSetupStatusQuery, useGetPaymentMethodsQuery } from '@/modules/settings/services/settingsApi';
import {
  useGetMerchantSubscriptionQuery,
  usePreviewTokenQuery,
  useChargeCardMutation,
  useSendTokenMutation,
  type CardChargeResult,
} from '../services/tokenApi';
import { tokenizeCard, detectBrand } from '@/lib/payments/cardTokenizer';
import { useIssueToken, useTokensByMerchant } from '../services/useTokens';
import { AddTokenPage } from './AddTokenPage';

export type WizardStep = 1 | 2 | 3;

export const AddTokenWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();

  // ── Wizard state ──
  const [step, setStep] = useState<WizardStep>(1);
  const [merchantId, setMerchantId] = useState(searchParams.get('merchantId') ?? '');
  const [validityDays, setValidityDays] = useState(30);
  const [terminalId, setTerminalId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [note, setNote] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [result, setResult] = useState<TokenIssueResult | null>(null);

  // ── Card checkout state (method "Card" — online, eCommerce-style) ──
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCharge, setCardCharge] = useState<CardChargeResult | null>(null);
  const [chargeError, setChargeError] = useState<string | null>(null);

  // ── Permission ──
  const { user, permissions } = useAuthStore();
  const canGenerate = user
    ? canAccess(user.role as PlatformRole, 'token', 'generate', permissions)
    : false;

  // ── Data ──
  const merchantsQuery = useGetMerchantsQuery({});
  const subscriptionQuery = useGetMerchantSubscriptionQuery(merchantId, { skip: !merchantId });
  const terminalsQuery = useGetTerminalsByMerchantQuery(merchantId, { skip: !merchantId });
  const tokensQuery = useTokensByMerchant(merchantId || undefined);
  const setupQuery = useGetSetupStatusQuery();
  const methodsQuery = useGetPaymentMethodsQuery({ enabledOnly: true });

  const issueMutation = useIssueToken();
  const [chargeCard, chargeCardState] = useChargeCardMutation();
  const [sendToken, sendTokenState] = useSendTokenMutation();

  const merchantOptions = useMemo(
    () =>
      (merchantsQuery.data?.data ?? [])
        .filter((m) => m.merchantType === 'Standalone')
        .map((m) => ({ label: m.businessName, value: m.id })),
    [merchantsQuery.data],
  );

  const merchantsError = merchantsQuery.isError
    ? (merchantsQuery.error as any)?.data?.message ?? 'Failed to load merchants — refresh the page and try again.'
    : null;

  const subscription = merchantId ? subscriptionQuery.data?.data ?? null : null;
  const isPos = subscription?.planType === 'StandalonePos';
  // 2026-09-05: currency comes from configuration (platform.currency) only —
  // no 'USD' fallback. Undefined until setup-status arrives; the screen shows
  // an em dash for money rather than a number in an unnamed currency.
  const currency = setupQuery.data?.data?.currency || undefined;
  const paymentProvider = setupQuery.data?.data?.paymentProvider || 'Mock';
  const terminals = useMemo(
    () => (terminalsQuery.data?.data ?? []).filter((t) => (t as any).isActive !== false),
    [terminalsQuery.data],
  );
  const enabledMethods = methodsQuery.data?.data ?? [];

  // Step-3 confirmation preview — a server dry-run through the SAME assembly path as
  // generation, so the operator sees exactly what will be minted (nothing persists).
  const previewQuery = usePreviewTokenQuery(
    { merchantId, terminalId: isPos && terminalId ? terminalId : null, validityDays },
    { skip: step !== 3 || !merchantId || !subscription || !!result },
  );


  const expectedPrice = useMemo(() => {
    if (!subscription || validityDays <= 0) return null;
    return subscription.dailySubscriptionPrice * validityDays;
  }, [subscription, validityDays]);

  // Amount received tracks the computed price until the operator edits it.
  useEffect(() => {
    if (!amountTouched) {
      setAmountReceived(expectedPrice != null ? expectedPrice.toFixed(2) : '');
    }
  }, [expectedPrice, amountTouched]);

  const activeTokenInfo = useMemo(() => {
    const tokens = tokensQuery.data?.data ?? [];
    const active = tokens.filter((t) => t.status === 'Active');
    if (active.length === 0) return null;
    const withExpiry = active
      .filter((t) => t.expiresAt)
      .sort((a, b) => (b.expiresAt! < a.expiresAt! ? -1 : 1));
    return { count: active.length, latestExpiry: withExpiry[0]?.expiresAt ?? null };
  }, [tokensQuery.data]);

  // ── Step gating ──
  const step1Valid =
    !!merchantId && !!subscription && validityDays >= 30 && (!isPos || !!terminalId);
  const amountNumber = parseFloat(amountReceived);
  const amountValid =
    Number.isFinite(amountNumber) &&
    amountNumber > 0 &&
    (expectedPrice == null || amountNumber + 0.001 >= expectedPrice);
  // "External" = collected outside the platform — the reference is the accounting
  // trail, so it is the one method where a reference is mandatory (server mirrors this).
  const referenceValid = paymentMethod !== 'External' || paymentReference.trim() !== '';
  // "Card" = online charge — valid only once the gateway captured it.
  const cardValid = paymentMethod !== 'Card' || cardCharge?.status === 'Succeeded';
  const step2Valid = !!paymentMethod && paymentConfirmed && amountValid && referenceValid && cardValid;

  // ── Handlers ──
  const handleMerchantChange = (id: string) => {
    setMerchantId(id);
    setTerminalId('');
    setAmountTouched(false);
    setPaymentMethod('');
    setPaymentConfirmed(false);
    setPaymentReference('');
  };

  const handleSelectMethod = (method: string) => {
    setPaymentMethod(method);
    setPaymentConfirmed(false);
    setPaymentReference('');
    setCardCharge(null);
    setChargeError(null);
  };

  // Card checkout: tokenize in the browser (provider script — PAN never reaches our
  // API), then charge server-side. Success locks amount + reference to the gateway txn.
  const handleChargeCard = async () => {
    setChargeError(null);
    const digits = cardNumber.replace(/\D/g, '');
    const [mmRaw, yyRaw] = cardExpiry.split('/').map((s) => s.trim());
    const mm = parseInt(mmRaw ?? '', 10);
    const yyNum = parseInt(yyRaw ?? '', 10);
    const yyyy = Number.isFinite(yyNum) ? (yyNum < 100 ? 2000 + yyNum : yyNum) : NaN;

    try {
      const cardToken = await tokenizeCard(paymentProvider, {
        cardholderName: cardName,
        cardNumber: digits,
        expiryMonth: Number.isFinite(mm) ? mm : 0,
        expiryYear: Number.isFinite(yyyy) ? yyyy : 0,
        cvv: cardCvv,
      });

      const res = await chargeCard({
        merchantId,
        validityDays,
        paymentToken: cardToken.token,
        cardBrand: cardToken.brand,
        cardLast4: cardToken.last4,
        cardholderName: cardName.trim(),
        idempotencyKey: `tokcard-${merchantId}-${Date.now()}`,
      }).unwrap();

      setCardCharge(res.data);
      if (res.data.status === 'Succeeded') {
        setPaymentReference(res.data.gatewayTransactionId ?? '');
        setAmountTouched(true);
        setAmountReceived(res.data.amount.toFixed(2));
        setPaymentConfirmed(true);
        setCardCvv('');
        toast.success(`Payment captured — ${res.data.amount.toFixed(2)} ${res.data.currencyCode} via ${res.data.provider}`);
      } else {
        setPaymentConfirmed(false);
        setChargeError(res.data.declineReason
          ? `Card declined — ${res.data.declineReason}`
          : res.data.gatewayMessage || 'Card declined by the gateway.');
      }
    } catch (err: any) {
      setPaymentConfirmed(false);
      setChargeError(err?.data?.message || err?.message || 'Card charge failed.');
    }
  };

  const handleIssue = () => {
    if (!step1Valid || !step2Valid) return;
    issueMutation.mutate(
      {
        merchantId,
        terminalId: isPos ? terminalId : null,
        validityDays,
        pricePaid: amountNumber,
        // 2026-09-05 (user-locked: currency ALWAYS comes from configuration): no
        // currencyCode is sent — the API books in platform.currency.
        paymentReference: paymentReference.trim(),
        paymentMethod,
        note: note.trim() || null,
      },
      {
        onSuccess: (res) => {
          setResult(res.data);
          toast.success(`Token issued — invoice ${res.data.invoiceNumber} marked paid`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to issue token');
        },
      },
    );
  };

  const handleSendToken = async () => {
    if (!result) return;
    try {
      await sendToken(result.token.tokenId).unwrap();
      toast.success('Token emailed to the merchant');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to email the token');
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setAmountTouched(false);
    setPaymentMethod('');
    setPaymentConfirmed(false);
    setPaymentReference('');
    setNote('');
    setTerminalId('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardCharge(null);
    setChargeError(null);
  };

  return (
    <AddTokenPage
      canGenerate={canGenerate}
      step={step}
      onStepChange={setStep}
      merchantOptions={merchantOptions}
      merchantsLoading={merchantsQuery.isLoading}
      merchantsError={merchantsError}
      merchantId={merchantId}
      onMerchantChange={handleMerchantChange}
      subscription={subscription}
      subscriptionLoading={!!merchantId && subscriptionQuery.isFetching}
      subscriptionError={
        !!merchantId && !subscriptionQuery.isFetching && subscriptionQuery.isError
          ? 'No active subscription found for this merchant — attach a plan before issuing a token.'
          : null
      }
      activeTokenInfo={activeTokenInfo}
      isPos={isPos}
      terminals={terminals}
      terminalsLoading={!!merchantId && terminalsQuery.isFetching}
      terminalId={terminalId}
      onTerminalChange={setTerminalId}
      validityDays={validityDays}
      onValidityDaysChange={setValidityDays}
      expectedPrice={expectedPrice}
      currency={currency}
      step1Valid={step1Valid}
      enabledMethods={enabledMethods}
      methodsLoading={methodsQuery.isLoading}
      paymentMethod={paymentMethod}
      onSelectMethod={handleSelectMethod}
      amountReceived={amountReceived}
      onAmountReceivedChange={(val) => { setAmountTouched(true); setAmountReceived(val); }}
      amountValid={amountValid}
      paymentReference={paymentReference}
      onPaymentReferenceChange={setPaymentReference}
      note={note}
      onNoteChange={setNote}
      paymentConfirmed={paymentConfirmed}
      onPaymentConfirmedChange={setPaymentConfirmed}
      cardName={cardName}
      onCardNameChange={setCardName}
      cardNumber={cardNumber}
      onCardNumberChange={setCardNumber}
      cardExpiry={cardExpiry}
      onCardExpiryChange={setCardExpiry}
      cardCvv={cardCvv}
      onCardCvvChange={setCardCvv}
      cardBrand={detectBrand(cardNumber.replace(/\D/g, ''))}
      cardCharge={cardCharge}
      chargeError={chargeError}
      charging={chargeCardState.isLoading}
      onChargeCard={handleChargeCard}
      preview={previewQuery.data?.data ?? null}
      previewLoading={previewQuery.isFetching}
      previewError={previewQuery.isError
        ? ((previewQuery.error as any)?.data?.message || 'Failed to load the token preview.')
        : null}
      step2Valid={step2Valid}
      isSubmitting={issueMutation.isPending}
      onIssue={handleIssue}
      result={result}
      sendingToken={sendTokenState.isLoading}
      onSendToken={handleSendToken}
      onReset={handleReset}
    />
  );
};

export default AddTokenWrapper;
