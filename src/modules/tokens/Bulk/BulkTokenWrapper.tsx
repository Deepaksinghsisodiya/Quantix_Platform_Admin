/**
 * Batch Generate — 3-step wizard (2026-08-30, user directive: "wizard is missing").
 *
 * Step 1 Merchant & Batch — merchant, subscribed plan, validity, POS = one token per
 *   selected terminal (mandatory), Cloud = plain quantity.
 * Step 2 Payment — the BATCH TOTAL (plan daily × validity × quantity) collected via the
 *   shared PaymentStep (catalog methods; Card = real online charge of the total;
 *   External = outside collection with mandatory reference).
 * Step 3 Generate — summary + per-terminal-type dry-run previews → POST /tokens/issue-bulk:
 *   every token's invoice is marked PAID against the collected evidence (the old
 *   "unpaid invoices, collect via Billing" flow is gone).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { BulkTokenResult } from '@/lib/types';
import { useGetMerchantsQuery, useGetTerminalsByMerchantQuery } from '@/modules/merchants/services/merchantApi';
import { useGetSetupStatusQuery, useGetPaymentMethodsQuery } from '@/modules/settings/services/settingsApi';
import { useGetMerchantSubscriptionQuery, useChargeCardMutation, type CardChargeResult } from '../services/tokenApi';
import { tokenizeCard, detectBrand } from '@/lib/payments/cardTokenizer';
import { useBulkGenerateTokens } from '../services/useTokens';
import { BulkTokenPage } from './BulkTokenPage';

export type BulkWizardStep = 1 | 2 | 3;

export const BulkTokenWrapper: React.FC = () => {
  const [step, setStep] = useState<BulkWizardStep>(1);
  const [merchantId, setMerchantId] = useState('');
  const [validityDays, setValidityDays] = useState(90);
  const [quantity, setQuantity] = useState(2);
  const [selectedTerminalIds, setSelectedTerminalIds] = useState<string[]>([]);
  const [result, setResult] = useState<BulkTokenResult | null>(null);

  // ── Payment state (mirrors the single-token wizard) ──
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [note, setNote] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardCharge, setCardCharge] = useState<CardChargeResult | null>(null);
  const [chargeError, setChargeError] = useState<string | null>(null);

  const merchantsQuery = useGetMerchantsQuery({});
  const subscriptionQuery = useGetMerchantSubscriptionQuery(merchantId, { skip: !merchantId });
  const terminalsQuery = useGetTerminalsByMerchantQuery(merchantId, { skip: !merchantId });
  const setupQuery = useGetSetupStatusQuery();
  const methodsQuery = useGetPaymentMethodsQuery({ enabledOnly: true });
  const bulkMutation = useBulkGenerateTokens();
  const [chargeCard, chargeCardState] = useChargeCardMutation();

  const merchantOptions = useMemo(
    () =>
      (merchantsQuery.data?.data ?? [])
        .filter((m) => m.merchantType === 'Standalone')
        .map((m) => ({ label: m.businessName, value: m.id })),
    [merchantsQuery.data],
  );

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

  const effectiveQuantity = isPos ? selectedTerminalIds.length : quantity;
  const expectedTotal = useMemo(() => {
    if (!subscription || validityDays <= 0 || effectiveQuantity <= 0) return null;
    return subscription.dailySubscriptionPrice * validityDays * effectiveQuantity;
  }, [subscription, validityDays, effectiveQuantity]);

  useEffect(() => {
    if (!amountTouched) {
      setAmountReceived(expectedTotal != null ? expectedTotal.toFixed(2) : '');
    }
  }, [expectedTotal, amountTouched]);

  // Step-3 preview targets: one dry-run per DISTINCT terminal type among the selection
  // (a Restaurant token differs from a Retail one via masking); Cloud batches get one.
  const previewTargets = useMemo(() => {
    if (!isPos) return [{ label: `Cloud tokens (${effectiveQuantity})`, terminalId: null as string | null }];
    const byType = new Map<string, { terminalId: string; count: number }>();
    for (const id of selectedTerminalIds) {
      const t = terminals.find((x) => x.terminalId === id);
      // Untyped terminals group together — the server resolves their flavour from the
      // plan (or refuses when the plan is Both), and the preview badge shows the truth.
      const type = t?.terminalType?.trim() ?? '';
      const cur = byType.get(type);
      if (cur) cur.count += 1;
      else byType.set(type, { terminalId: id, count: 1 });
    }
    return [...byType.entries()].map(([type, v]) => ({
      label: type
        ? `${type} terminal${v.count === 1 ? '' : 's'} (${v.count})`
        : `Selected terminal${v.count === 1 ? '' : 's'} (${v.count})`,
      terminalId: v.terminalId,
    }));
  }, [isPos, selectedTerminalIds, terminals, effectiveQuantity]);

  // ── Gating ──
  const step1Valid =
    !!merchantId && !!subscription && validityDays >= 30 && effectiveQuantity > 0;
  const amountNumber = parseFloat(amountReceived);
  const amountValid =
    Number.isFinite(amountNumber) &&
    amountNumber > 0 &&
    (expectedTotal == null || amountNumber + 0.001 >= expectedTotal);
  const referenceValid = paymentMethod !== 'External' || paymentReference.trim() !== '';
  const cardValid = paymentMethod !== 'Card' || cardCharge?.status === 'Succeeded';
  const step2Valid = !!paymentMethod && paymentConfirmed && amountValid && referenceValid && cardValid;

  // ── Handlers ──
  const resetPayment = () => {
    setPaymentMethod('');
    setPaymentConfirmed(false);
    setPaymentReference('');
    setCardCharge(null);
    setChargeError(null);
    setAmountTouched(false);
  };

  const handleMerchantChange = (id: string) => {
    setMerchantId(id);
    setSelectedTerminalIds([]);
    resetPayment();
  };

  const handleToggleTerminal = (terminalId: string) => {
    setSelectedTerminalIds((prev) =>
      prev.includes(terminalId) ? prev.filter((t) => t !== terminalId) : [...prev, terminalId],
    );
    // Quantity (and thus the total) changed — any captured payment no longer matches.
    setPaymentConfirmed(false);
    setCardCharge(null);
    setAmountTouched(false);
  };

  const handleSelectMethod = (method: string) => {
    setPaymentMethod(method);
    setPaymentConfirmed(false);
    setPaymentReference('');
    setCardCharge(null);
    setChargeError(null);
  };

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
        quantity: effectiveQuantity,
        paymentToken: cardToken.token,
        cardBrand: cardToken.brand,
        cardLast4: cardToken.last4,
        cardholderName: cardName.trim(),
        idempotencyKey: `tokbatch-${merchantId}-${Date.now()}`,
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

  const handleGenerate = () => {
    if (!step1Valid || !step2Valid) return;
    bulkMutation.mutate(
      {
        merchantId,
        validityDays,
        quantity: effectiveQuantity,
        terminalBindings: isPos ? selectedTerminalIds : null,
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
          toast.success(`${res.data.totalGenerated} token(s) issued — ${res.data.invoiceNumbers.length} invoice(s) marked paid`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Batch issuance failed');
        },
      },
    );
  };

  const handleDownloadCsv = () => {
    if (!result || result.tokens.length === 0) return;
    try {
      const headers = ['TokenId', 'Sequence', 'Plan', 'ValidityDays', 'Status', 'EncodedToken'];
      const rows = result.tokens.map((t) => [
        t.tokenId,
        String(t.sequence),
        t.planName || t.plan,
        String(t.validityDays),
        t.status,
        t.encodedToken,
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `bulk_tokens_${merchantId}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV downloaded');
    } catch {
      toast.error('Failed to generate CSV');
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setSelectedTerminalIds([]);
    setNote('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    resetPayment();
  };

  return (
    <BulkTokenPage
      step={step}
      onStepChange={setStep}
      merchantOptions={merchantOptions}
      merchantsLoading={merchantsQuery.isLoading}
      merchantId={merchantId}
      onMerchantChange={handleMerchantChange}
      subscription={subscription}
      subscriptionLoading={!!merchantId && subscriptionQuery.isFetching}
      subscriptionError={
        !!merchantId && !subscriptionQuery.isFetching && subscriptionQuery.isError
          ? 'No active subscription found for this merchant — attach a plan before generating tokens.'
          : null
      }
      terminals={terminals}
      isPos={isPos}
      selectedTerminalIds={selectedTerminalIds}
      onToggleTerminal={handleToggleTerminal}
      quantity={quantity}
      onQuantityChange={(v) => { setQuantity(v); setPaymentConfirmed(false); setCardCharge(null); setAmountTouched(false); }}
      effectiveQuantity={effectiveQuantity}
      validityDays={validityDays}
      onValidityDaysChange={(v) => { setValidityDays(v); setPaymentConfirmed(false); setCardCharge(null); setAmountTouched(false); }}
      expectedTotal={expectedTotal}
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
      step2Valid={step2Valid}
      previewTargets={previewTargets}
      generating={bulkMutation.isPending}
      result={result}
      onGenerate={handleGenerate}
      onDownloadCsv={handleDownloadCsv}
      onReset={handleReset}
    />
  );
};

export default BulkTokenWrapper;
