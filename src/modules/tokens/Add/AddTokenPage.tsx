/**
 * Generate Tokens — presentational 3-step wizard (Pass 44).
 * Step 1 Merchant & Plan · Step 2 Payment · Step 3 Generate.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Key, Coins, AlertTriangle, Mail, Store, Wallet, Sparkles } from 'lucide-react';

import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard, ATMButton, ATMBadge, ATMTextField, ATMSelectField, ATMBreadcrumbs, ATMSkeleton } from '@/shared/ui';
import { ATMFieldCell, ATMFormGrid } from '@/shared/components/form';
import { formatDate } from '@/lib/utils/formatDate';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';
import { PLAN_TYPE_LABEL } from '@/lib/types/platform-enums';
import type { TokenIssueResult } from '@/lib/types';
import type { MerchantTerminal } from '@/modules/merchants/types/merchant.types';
import type { PlatformPaymentMethod } from '@/modules/settings/services/settingsApi';
import type { MerchantSubscriptionInfo, CardChargeResult, TokenPreview } from '../services/tokenApi';
import { FLAVOUR_LABELS } from '@/lib/types/licensing';
import { TokenBreakdown } from '../components/TokenBreakdown';
import { PaymentStep } from '../components/PaymentStep';
import { WizardStepper } from '../components/WizardStepper';
import { TokenWizardCard, TokenWizardSection } from '../components/TokenWizardCard';
import type { WizardStep } from './AddTokenWrapper';
import { TokenDisplay } from './TokenDisplay';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 1, label: 'Merchant & Plan' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Generate' },
];

export interface AddTokenPageProps {
  canGenerate: boolean;
  step: WizardStep;
  onStepChange: (s: WizardStep) => void;
  merchantOptions: { label: string; value: string }[];
  merchantsLoading: boolean;
  merchantsError?: string | null;
  merchantId: string;
  onMerchantChange: (id: string) => void;
  subscription: MerchantSubscriptionInfo | null;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  activeTokenInfo: { count: number; latestExpiry: string | null } | null;
  isPos: boolean;
  terminals: MerchantTerminal[];
  terminalsLoading?: boolean;
  terminalId: string;
  onTerminalChange: (id: string) => void;
  validityDays: number;
  onValidityDaysChange: (days: number) => void;
  expectedPrice: number | null;
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
  preview: TokenPreview | null;
  previewLoading: boolean;
  previewError: string | null;
  step2Valid: boolean;
  isSubmitting: boolean;
  onIssue: () => void;
  result: TokenIssueResult | null;
  sendingToken: boolean;
  onSendToken: () => void;
  onReset: () => void;
}

export const AddTokenPage: React.FC<AddTokenPageProps> = (p) => {
  const maxReachable: WizardStep = !p.step1Valid ? 1 : !p.step2Valid && !p.result ? 2 : 3;

  if (!p.canGenerate) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-3">
          <ATMBreadcrumbs />
          <ATMPageHeader title="Generate Tokens" subtitle="Issue a paid recharge token for a Standalone merchant." />
        </div>
        <ATMCard padding="md" className="max-w-xl mx-auto">
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ATMBadge variant="solid" color="danger" label="Access Denied" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
              Your role does not include <code className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 text-xs">token.generate</code>.
            </p>
          </div>
        </ATMCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3">
        <ATMBreadcrumbs />
        <ATMPageHeader
          title="Generate Tokens"
          icon={Key}
          subtitle="Select the merchant, take the payment, then generate — plan and price derive from the subscription."
        />
        {!p.result && (
          <WizardStepper steps={STEPS} step={p.step} maxReachable={maxReachable} onStepChange={(s) => p.onStepChange(s as WizardStep)} />
        )}
      </div>

      {/* ── Step 1: Merchant & Plan ─────────────────────────────────── */}
        {!p.result && p.step === 1 && (
          <div className="max-w-3xl mx-auto w-full">
            <TokenWizardCard
              step={1}
              title="Merchant & Plan"
              icon={Store}
              description="Select the Standalone merchant, review the subscribed plan, then set the validity window and terminal binding."
            >
              <div className="space-y-7">
                <TokenWizardSection title="Merchant">
                  <ATMSelectField
                    name="merchantId"
                    label="Standalone Merchant"
                    placeholder={p.merchantsLoading ? 'Loading merchants…' : 'Select a merchant…'}
                    options={p.merchantOptions}
                    value={p.merchantId || null}
                    onChange={(val) => p.onMerchantChange((val as string) || '')}
                    helperText="Enterprise merchants never receive license tokens — they fund via wallet recharge."
                  />
                  {p.merchantsError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2 dark:border-red-900/40 dark:bg-red-950/20">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                      <p className="text-xs font-semibold text-red-800 dark:text-red-300">{p.merchantsError}</p>
                    </div>
                  )}
                </TokenWizardSection>

                {p.merchantId && (
                  <TokenWizardSection
                    title="Subscribed Plan"
                    className="border-t border-slate-100 dark:border-slate-800 pt-6"
                  >
                    {p.subscriptionLoading ? (
                      <div className="space-y-3">
                        <ATMSkeleton variant="text" className="h-4 w-40" />
                        <ATMSkeleton variant="text" className="h-4 w-56" />
                      </div>
                    ) : p.subscriptionError ? (
                      <div className="flex items-start gap-2 py-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{p.subscriptionError}</p>
                      </div>
                    ) : p.subscription ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Plan</span>
                          <span className="mt-1 block text-sm font-extrabold text-gray-900 dark:text-gray-100">
                            {p.subscription.planDisplayName}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Deployment</span>
                          <ATMBadge color="primary" label={PLAN_TYPE_LABEL[p.subscription.planType] ?? p.subscription.planType} className="mt-1" />
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Daily Price</span>
                          <span className="mt-1 block text-sm font-extrabold text-gray-900 dark:text-gray-100">
                            {formatCurrencyOrDash(p.subscription.dailySubscriptionPrice, p.currency)}/day
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Coverage</span>
                          <span className="mt-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
                            {p.activeTokenInfo
                              ? p.activeTokenInfo.latestExpiry
                                ? `Active token until ${formatDate(p.activeTokenInfo.latestExpiry, 'short')}`
                                : `${p.activeTokenInfo.count} active token(s), not yet applied`
                              : 'No active token'}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </TokenWizardSection>
                )}

                {p.merchantId && p.subscription && (
                  <TokenWizardSection
                    title="Validity & Terminal"
                    description="The token's coverage window only starts when the merchant applies it (Rule 7)."
                    className="border-t border-slate-100 dark:border-slate-800 pt-6"
                  >
                    <div className="space-y-5">
                      <ATMFormGrid cols={2}>
                        <ATMFieldCell label="Validity (days)">
                          <ATMTextField
                            name="validityDays"
                            type="number"
                            value={String(p.validityDays)}
                            onChange={(e) => p.onValidityDaysChange(parseInt(e.target.value, 10) || 0)}
                            error={p.validityDays < 30 ? 'Minimum 30 days' : undefined}
                          />
                        </ATMFieldCell>
                        <ATMFieldCell label="Price to Collect" hint={`${p.subscription.dailySubscriptionPrice.toFixed(2)} × ${p.validityDays} day${p.validityDays === 1 ? '' : 's'}`}>
                          <div className="flex h-11 items-center rounded-xl border border-[var(--zen-border)] bg-gray-50/60 px-3.5 dark:bg-gray-900">
                            <span className="text-sm font-extrabold text-accent-600 dark:text-accent-400">
                              {formatCurrencyOrDash(p.expectedPrice, p.currency)}
                            </span>
                          </div>
                        </ATMFieldCell>
                      </ATMFormGrid>

                      {p.isPos ? (
                        <div className="space-y-2">
                          <ATMSelectField
                            name="terminalId"
                            label="Terminal (required — the token applies only on this terminal)"
                            placeholder={p.terminalsLoading ? 'Loading terminals…' : p.terminals.length === 0 ? 'No terminals registered' : 'Select a terminal…'}
                            options={p.terminals.map((t) => ({
                              label: `${t.terminalName} (${t.terminalCode})`,
                              value: t.terminalId,
                            }))}
                            value={p.terminalId || null}
                            onChange={(val) => p.onTerminalChange((val as string) || '')}
                          />
                          {!p.terminalsLoading && p.terminals.length === 0 && (
                            <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/20">
                              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                This Standalone POS merchant has no terminals yet — create one on{' '}
                                <Link to={`/merchants/${p.merchantId}/terminals`} className="underline font-bold">the Terminals page</Link>{' '}
                                before generating a token.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 font-medium">
                          Standalone Cloud — the token applies to the merchant's cloud instance; no terminal binding.
                        </p>
                      )}

                      <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-5">
                        <ATMButton type="button" variant="primary" disabled={!p.step1Valid} onClick={() => p.onStepChange(2)}>
                          Continue to Payment
                        </ATMButton>
                      </div>
                    </div>
                  </TokenWizardSection>
                )}
              </div>
            </TokenWizardCard>
          </div>
        )}

        {/* ── Step 2: Payment ─────────────────────────────────────────── */}
        {!p.result && p.step === 2 && (
          <div className="max-w-3xl mx-auto w-full">
            <TokenWizardCard
              step={2}
              title="Payment"
              icon={Wallet}
              description="Choose how the merchant paid, record the evidence, and confirm the amount before generating."
            >
              <div className="space-y-6">
                <PaymentStep
                  enabledMethods={p.enabledMethods}
                  methodsLoading={p.methodsLoading}
                  paymentMethod={p.paymentMethod}
                  onSelectMethod={p.onSelectMethod}
                  expectedPrice={p.expectedPrice}
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
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
                  <ATMButton type="button" variant="secondary" onClick={() => p.onStepChange(1)}>
                    Back
                  </ATMButton>
                  <ATMButton type="button" variant="primary" disabled={!p.step2Valid} onClick={() => p.onStepChange(3)}>
                    Continue to Generate
                  </ATMButton>
                </div>
              </div>
            </TokenWizardCard>
          </div>
        )}

        {/* ── Step 3: Generate ────────────────────────────────────────── */}
        {!p.result && p.step === 3 && (
          <div className="max-w-3xl mx-auto w-full">
            <TokenWizardCard
              step={3}
              title="Generate"
              icon={Sparkles}
              description="Review the summary and the server dry-run preview, then mint the token."
            >
              <div className="space-y-7">
                <TokenWizardSection title="Summary">
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
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Validity</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">{p.validityDays} days</dd>
                    </div>
                    {p.isPos && (
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Terminal</dt>
                        <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                          {(() => { const t = p.terminals.find((x) => x.terminalId === p.terminalId); return t ? `${t.terminalName} (${t.terminalCode})` : '—'; })()}
                        </dd>
                      </div>
                    )}
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
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
                    <ATMButton type="button" variant="secondary" onClick={() => p.onStepChange(2)}>
                      Back
                    </ATMButton>
                    <ATMButton type="button" variant="primary" icon={Coins} isLoading={p.isSubmitting} onClick={p.onIssue}>
                      Generate Token
                    </ATMButton>
                  </div>
                  <p className="mt-3 text-[11px] text-gray-400 font-medium text-right">
                    Creates the token and a paid Token Purchase invoice in one transaction.
                  </p>
                </TokenWizardSection>

                {/* V4 (2026-08-30): server dry-run preview — exactly what will be minted. */}
                <TokenWizardSection
                  title="Token Preview — What Will Be Generated"
                  className="border-t border-slate-100 dark:border-slate-800 pt-6"
                >
                  {p.previewLoading ? (
                    <div className="space-y-4">
                      <ATMSkeleton variant="text" className="h-4 w-72" />
                      <ATMSkeleton variant="text" className="h-4 w-96" />
                      <ATMSkeleton variant="card" className="h-40 w-full" />
                    </div>
                  ) : p.previewError ? (
                    <div className="flex items-start gap-2 py-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">{p.previewError}</p>
                    </div>
                  ) : p.preview ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Sequence</span>
                          <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">#{p.preview.sequence}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Plan</span>
                          <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{p.preview.planName}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Cut For</span>
                          <ATMBadge color="primary" label={FLAVOUR_LABELS[p.preview.flavour] ?? p.preview.flavour} />
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Validity</span>
                          <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{p.preview.validityDays} days from apply</span>
                        </div>
                      </div>

                      <TokenBreakdown
                        limitsPayload={p.preview.limitsPayload}
                        featurePayload={p.preview.featurePayload}
                        gracePolicyDays={p.preview.gracePolicyDays}
                        servicesPayload={p.preview.servicesPayload}
                        paymentsPayload={p.preview.paymentsPayload}
                      />

                      {p.preview.revokedSequences.length > 0 && (
                        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 border-t border-[var(--zen-border)] pt-3">
                          This token will also carry the revocation notice for sequence
                          {p.preview.revokedSequences.length === 1 ? '' : 's'}{' '}
                          {p.preview.revokedSequences.map((n) => `#${n}`).join(', ')} — the merchant's
                          system will purge and reject those tokens once this one is accepted.
                        </p>
                      )}
                    </div>
                  ) : null}
                </TokenWizardSection>
              </div>
            </TokenWizardCard>
          </div>
        )}

        {/* ── Result ──────────────────────────────────────────────────── */}
        {p.result && (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <TokenDisplay token={p.result.token} />

            <ATMCard title="Token Purchase Invoice" padding="md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Invoice</span>
                  <Link
                    to={`/billing/invoices/${p.result.invoiceId}`}
                    className="mt-1 block text-sm font-extrabold text-accent-600 hover:underline dark:text-accent-400"
                  >
                    {p.result.invoiceNumber}
                  </Link>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount</span>
                  <span className="mt-1 block text-sm font-extrabold text-gray-900 dark:text-gray-100">
                    {p.result.amountCharged.toFixed(2)} {p.result.currencyCode}
                  </span>
                </div>
                <ATMBadge color="success" label="Paid" />
              </div>
            </ATMCard>

            <div className="flex items-center gap-3 pt-2">
              <ATMButton type="button" variant="secondary" icon={Mail} isLoading={p.sendingToken} onClick={p.onSendToken}>
                Email Token to Merchant
              </ATMButton>
              <ATMButton type="button" variant="primary" onClick={p.onReset}>
                Generate Another Token
              </ATMButton>
              <Link
                to="/tokens"
                className="text-sm font-bold text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Back to Token History
              </Link>
            </div>
          </div>
        )}
    </div>
  );
};

export default AddTokenPage;
