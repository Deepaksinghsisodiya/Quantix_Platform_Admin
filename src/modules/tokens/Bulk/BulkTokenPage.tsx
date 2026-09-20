/**
 * Batch Generate — 3-step wizard, presentational side (2026-08-30, user directive).
 * Step 1 Merchant & Batch · Step 2 Payment (batch total, shared PaymentStep) ·
 * Step 3 Generate (summary + per-terminal-type dry-run previews).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Download, AlertTriangle, Layers } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton, ATMBadge, ATMTextField, ATMSelectField, ATMBreadcrumbs } from '@/shared/ui';
import { PLAN_TYPE_LABEL } from '@/lib/types/platform-enums';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { FLAVOUR_LABELS } from '@/lib/types/licensing';
import type { BulkTokenResult } from '@/lib/types';
import type { MerchantTerminal } from '@/modules/merchants/types/merchant.types';
import type { PlatformPaymentMethod } from '@/modules/settings/services/settingsApi';
import { usePreviewTokenQuery, type MerchantSubscriptionInfo, type CardChargeResult } from '../services/tokenApi';
import { WizardStepper } from '../components/WizardStepper';
import { PaymentStep } from '../components/PaymentStep';
import { TokenBreakdown } from '../components/TokenBreakdown';
import { TokenStatusBadge } from '../components/TokenStatusBadge';
import type { BulkWizardStep } from './BulkTokenWrapper';

const STEPS = [
  { id: 1, label: 'Merchant & Batch' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Generate' },
];

/** One dry-run preview per distinct terminal type (hook-per-component pattern). */
const BulkPreviewSection: React.FC<{
  merchantId: string;
  terminalId: string | null;
  validityDays: number;
  label: string;
}> = ({ merchantId, terminalId, validityDays, label }) => {
  const q = usePreviewTokenQuery({ merchantId, terminalId, validityDays });
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{label}</h4>
        {q.data?.data && (
          <ATMBadge color="primary" label={FLAVOUR_LABELS[q.data.data.flavour] ?? q.data.data.flavour} />
        )}
      </div>
      {q.isFetching ? (
        <p className="text-sm font-semibold text-gray-400">Assembling preview…</p>
      ) : q.isError ? (
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <p className="text-xs font-semibold text-red-700 dark:text-red-400">
            {(q.error as any)?.data?.message || 'Failed to load the preview.'}
          </p>
        </div>
      ) : q.data?.data ? (
        <>
          <TokenBreakdown
            limitsPayload={q.data.data.limitsPayload}
            featurePayload={q.data.data.featurePayload}
            gracePolicyDays={q.data.data.gracePolicyDays}
            servicesPayload={q.data.data.servicesPayload}
            paymentsPayload={q.data.data.paymentsPayload}
          />
          {q.data.data.revokedSequences.length > 0 && (
            <p className="mt-3 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Each token also carries the revocation notice for sequence
              {q.data.data.revokedSequences.length === 1 ? '' : 's'}{' '}
              {q.data.data.revokedSequences.map((n) => `#${n}`).join(', ')}.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
};

export interface BulkTokenPageProps {
  step: BulkWizardStep;
  onStepChange: (s: BulkWizardStep) => void;
  merchantOptions: { label: string; value: string }[];
  merchantsLoading: boolean;
  merchantId: string;
  onMerchantChange: (id: string) => void;
  subscription: MerchantSubscriptionInfo | null;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  terminals: MerchantTerminal[];
  /** Standalone POS — bindings mandatory (one token per selected terminal). */
  isPos: boolean;
  selectedTerminalIds: string[];
  onToggleTerminal: (terminalId: string) => void;
  quantity: number;
  onQuantityChange: (val: number) => void;
  effectiveQuantity: number;
  validityDays: number;
  onValidityDaysChange: (val: number) => void;
  expectedTotal: number | null;
  /** 2026-09-05: deployment currency (platform.currency); undefined until setup-status loads. */
  currency: string | undefined;
  step1Valid: boolean;
  enabledMethods: PlatformPaymentMethod[];
  methodsLoading: boolean;
  paymentMethod: string;
  onSelectMethod: (method: string) => void;
  amountReceived: string;
  onAmountReceivedChange: (val: string) => void;
  amountValid: boolean;
  paymentReference: string;
  onPaymentReferenceChange: (val: string) => void;
  note: string;
  onNoteChange: (val: string) => void;
  paymentConfirmed: boolean;
  onPaymentConfirmedChange: (val: boolean) => void;
  cardName: string;
  onCardNameChange: (val: string) => void;
  cardNumber: string;
  onCardNumberChange: (val: string) => void;
  cardExpiry: string;
  onCardExpiryChange: (val: string) => void;
  cardCvv: string;
  onCardCvvChange: (val: string) => void;
  cardBrand: string;
  cardCharge: CardChargeResult | null;
  chargeError: string | null;
  charging: boolean;
  onChargeCard: () => void;
  step2Valid: boolean;
  previewTargets: { label: string; terminalId: string | null }[];
  generating: boolean;
  result: BulkTokenResult | null;
  onGenerate: () => void;
  onDownloadCsv: () => void;
  onReset: () => void;
}

export const BulkTokenPage: React.FC<BulkTokenPageProps> = (p) => {
  const maxReachable: BulkWizardStep = !p.step1Valid ? 1 : !p.step2Valid && !p.result ? 2 : 3;

  return (
    <div className="flex flex-col h-full bg-zen-surface animate-in fade-in duration-500 overflow-hidden w-full">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
        <div className="flex flex-col gap-3">
          <ATMBreadcrumbs />
          <ATMPageHeader
            title="Batch Generate"
            icon={Layers}
            subtitle="Generate multiple recharge tokens for one Standalone merchant — plan and price derive from its subscription."
          />
          {!p.result && (
            <WizardStepper steps={STEPS} step={p.step} maxReachable={maxReachable} onStepChange={(s) => p.onStepChange(s as BulkWizardStep)} />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/10 dark:bg-gray-900/10">
        {/* ── Step 1: Merchant & Batch ─────────────────────────────────── */}
        {!p.result && p.step === 1 && (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <ATMCard title="Merchant" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <ATMSelectField
                name="merchantId"
                label="Standalone Merchant"
                placeholder={p.merchantsLoading ? 'Loading merchants…' : 'Select a merchant…'}
                options={p.merchantOptions}
                value={p.merchantId || null}
                onChange={(val) => p.onMerchantChange((val as string) || '')}
              />
            </ATMCard>

            {p.merchantId && (
              <ATMCard title="Subscribed Plan" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
                {p.subscriptionLoading ? (
                  <p className="py-4 text-sm font-semibold text-gray-400">Loading subscription…</p>
                ) : p.subscriptionError ? (
                  <div className="flex items-start gap-2 py-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{p.subscriptionError}</p>
                  </div>
                ) : p.subscription ? (
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Plan</span>
                      <span className="mt-1 block text-sm font-extrabold text-gray-900 dark:text-gray-100">
                        {p.subscription.planDisplayName}
                      </span>
                    </div>
                    <ATMBadge color="primary" label={PLAN_TYPE_LABEL[p.subscription.planType] ?? p.subscription.planType} />
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Daily Price</span>
                      <span className="mt-1 block text-sm font-extrabold text-gray-900 dark:text-gray-100">
                        {formatCurrencyOrDash(p.subscription.dailySubscriptionPrice, p.currency)}/day
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Batch Total</span>
                      <span className="mt-1 block text-sm font-extrabold text-accent-600 dark:text-accent-400">
                        {formatCurrencyOrDash(p.expectedTotal, p.currency)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </ATMCard>
            )}

            {p.merchantId && p.subscription && (
              <ATMCard title="Batch Settings" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ATMTextField
                      name="validityDays"
                      label="Validity (days, per token)"
                      type="number"
                      value={String(p.validityDays)}
                      onChange={(e) => p.onValidityDaysChange(parseInt(e.target.value, 10) || 0)}
                      error={p.validityDays < 30 ? 'Minimum 30 days' : undefined}
                    />
                    <ATMTextField
                      name="quantity"
                      label="Quantity"
                      type="number"
                      value={String(p.isPos ? p.effectiveQuantity : p.quantity)}
                      onChange={(e) => p.onQuantityChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      disabled={p.isPos}
                      helperText={p.isPos ? 'Driven by the terminal selection below' : undefined}
                    />
                  </div>

                  <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                    {p.isPos ? (
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Select terminals — one token is generated per terminal (required for Standalone POS)
                      </span>
                    ) : (
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Standalone Cloud — tokens apply to the cloud instance; no terminal binding.
                      </p>
                    )}
                    {p.isPos && p.terminals.length === 0 && (
                      <p className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                        No terminals registered — create them on the merchant's detail page first.
                      </p>
                    )}
                    {p.isPos && p.terminals.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {p.terminals.map((t) => (
                          <label
                            key={t.terminalId}
                            className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2 cursor-pointer hover:bg-gray-50/60 dark:hover:bg-zinc-900/40"
                          >
                            <input
                              type="checkbox"
                              checked={p.selectedTerminalIds.includes(t.terminalId)}
                              onChange={() => p.onToggleTerminal(t.terminalId)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{t.terminalName}</span>
                            <span className="text-[10px] font-mono text-gray-400">{t.terminalCode}</span>
                            {t.terminalType && (
                              <span className="ml-auto text-[10px] font-semibold text-gray-400">{t.terminalType}</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-4">
                    <ATMButton type="button" variant="primary" disabled={!p.step1Valid} onClick={() => p.onStepChange(2)}>
                      Continue to Payment
                    </ATMButton>
                  </div>
                </div>
              </ATMCard>
            )}
          </div>
        )}

        {/* ── Step 2: Payment (batch total) ────────────────────────────── */}
        {!p.result && p.step === 2 && (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <PaymentStep
              enabledMethods={p.enabledMethods}
              methodsLoading={p.methodsLoading}
              paymentMethod={p.paymentMethod}
              onSelectMethod={p.onSelectMethod}
              expectedPrice={p.expectedTotal}
              currency={p.currency}
              amountReceived={p.amountReceived}
              onAmountReceivedChange={p.onAmountReceivedChange}
              amountValid={p.amountValid}
              paymentReference={p.paymentReference}
              onPaymentReferenceChange={p.onPaymentReferenceChange}
              note={p.note}
              onNoteChange={p.onNoteChange}
              paymentConfirmed={p.paymentConfirmed}
              onPaymentConfirmedChange={p.onPaymentConfirmedChange}
              cardName={p.cardName}
              onCardNameChange={p.onCardNameChange}
              cardNumber={p.cardNumber}
              onCardNumberChange={p.onCardNumberChange}
              cardExpiry={p.cardExpiry}
              onCardExpiryChange={p.onCardExpiryChange}
              cardCvv={p.cardCvv}
              onCardCvvChange={p.onCardCvvChange}
              cardBrand={p.cardBrand}
              cardCharge={p.cardCharge}
              chargeError={p.chargeError}
              charging={p.charging}
              onChargeCard={p.onChargeCard}
            />

            <div className="flex items-center justify-between">
              <ATMButton type="button" variant="secondary" onClick={() => p.onStepChange(1)}>
                Back
              </ATMButton>
              <ATMButton type="button" variant="primary" disabled={!p.step2Valid} onClick={() => p.onStepChange(3)}>
                Continue to Generate
              </ATMButton>
            </div>
          </div>
        )}

        {/* ── Step 3: Generate ─────────────────────────────────────────── */}
        {!p.result && p.step === 3 && (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <ATMCard title="Summary" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Merchant</dt>
                  <dd className="mt-1 text-sm font-extrabold text-gray-900 dark:text-gray-100">
                    {p.merchantOptions.find((o) => o.value === p.merchantId)?.label ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plan</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">{p.subscription?.planDisplayName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tokens</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {p.effectiveQuantity} × {p.validityDays} days
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                    {p.paymentMethod} · {formatCurrencyOrDash(Number(p.amountReceived), p.currency)}
                  </dd>
                </div>
                {p.paymentReference && (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reference</dt>
                    <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100 break-all">{p.paymentReference}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <ATMButton type="button" variant="secondary" onClick={() => p.onStepChange(2)}>
                  Back
                </ATMButton>
                <ATMButton type="button" variant="primary" icon={Coins} isLoading={p.generating} onClick={p.onGenerate}>
                  Generate {p.effectiveQuantity} Token{p.effectiveQuantity === 1 ? '' : 's'}
                </ATMButton>
              </div>
              <p className="mt-3 text-[11px] text-gray-400 font-medium text-right">
                Creates every token and its paid Token Purchase invoice against this payment.
              </p>
            </ATMCard>

            <ATMCard title="Token Preview — What Will Be Generated" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="space-y-4">
                {p.previewTargets.map((t) => (
                  <BulkPreviewSection
                    key={t.label}
                    merchantId={p.merchantId}
                    terminalId={t.terminalId}
                    validityDays={p.validityDays}
                    label={t.label}
                  />
                ))}
              </div>
            </ATMCard>
          </div>
        )}

        {/* ── Result ───────────────────────────────────────────────────── */}
        {p.result && (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <ATMCard title="Generated Tokens" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {p.result.totalGenerated} token(s) issued
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {p.result.totalCharged.toFixed(2)} {p.result.currencyCode} collected ·{' '}
                    {p.result.invoiceNumbers.length} invoice(s) marked paid
                    {p.result.invoiceNumbers.length > 0 && ` (${p.result.invoiceNumbers.join(', ')})`}
                  </p>
                </div>
                <ATMButton type="button" variant="outline" size="sm" icon={Download} onClick={p.onDownloadCsv}>
                  Download CSV
                </ATMButton>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {['Seq', 'Token ID', 'Plan', 'Validity', 'Status', 'Token String'].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                    {p.result.tokens.map((t) => (
                      <tr key={t.tokenId}>
                        <td className="px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-gray-100">#{t.sequence}</td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-gray-600 dark:text-gray-300" title={t.tokenId}>
                          {t.tokenId.slice(0, 8)}…
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {t.planName || (PLAN_TYPE_LABEL[t.plan] ?? t.plan)}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400">{t.validityDays}d</td>
                        <td className="px-3 py-2.5"><TokenStatusBadge status={t.status} /></td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-gray-500 max-w-[220px] truncate" title={t.encodedToken}>
                          {t.encodedToken}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ATMCard>

            <div className="flex items-center gap-4 pt-2">
              <ATMButton type="button" variant="primary" onClick={p.onReset}>
                Generate Another Batch
              </ATMButton>
              <Link
                to="/tokens"
                className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Back to Token History
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkTokenPage;
