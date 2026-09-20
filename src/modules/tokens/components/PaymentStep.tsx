/**
 * PaymentStep — shared payment surface for the Generate and Batch wizards
 * (2026-08-30, extracted per the similarity-first rule).
 *
 * Methods come from the platform Payment Methods catalog. "Card" is a real online
 * charge (client-side tokenization — PAN/CVV never reach the platform); "External"
 * means collected outside the platform, so its reference is MANDATORY (the accounting
 * trail); other methods record evidence with an optional reference.
 */
import React from 'react';
import { AlertTriangle, Coins } from 'lucide-react';

import { ATMCard, ATMButton, ATMBadge, ATMTextField } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import type { PlatformPaymentMethod } from '@/modules/settings/services/settingsApi';
import type { CardChargeResult } from '../services/tokenApi';
import { CardChargePanel } from '@/shared/components/payments/CardChargePanel';

export interface PaymentStepProps {
  enabledMethods: PlatformPaymentMethod[];
  methodsLoading: boolean;
  paymentMethod: string;
  onSelectMethod: (method: string) => void;
  /** The total to collect (already × quantity for batches). */
  expectedPrice: number | null;
  /** 2026-09-05: deployment currency (platform.currency); undefined until setup-status loads. */
  currency: string | undefined;
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
}

export const PaymentStep: React.FC<PaymentStepProps> = (p) => (
  <>
    <ATMCard title="Payment Method" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
      {p.methodsLoading ? (
        <p className="py-4 text-sm font-semibold text-gray-400">Loading payment methods…</p>
      ) : p.enabledMethods.length === 0 ? (
        <div className="flex items-start gap-2 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            No payment methods are enabled — enable at least one under System Setup → Payment Methods.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {p.enabledMethods.map((m) => (
            <button
              key={m.methodType}
              type="button"
              onClick={() => p.onSelectMethod(m.methodType)}
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-bold transition-colors text-left',
                p.paymentMethod === m.methodType
                  ? 'border-accent-500 bg-accent-50/60 text-accent-700 dark:bg-accent-950/30 dark:text-accent-300'
                  : 'border-gray-150 text-gray-700 hover:border-gray-300 dark:border-gray-800 dark:text-gray-300',
              )}
            >
              {m.displayName}
              {m.methodType === 'External' && (
                <span className="block text-[10px] font-semibold text-gray-400 mt-0.5">Collected outside the platform</span>
              )}
              {m.methodType === 'Card' && (
                <span className="block text-[10px] font-semibold text-gray-400 mt-0.5">Online — charged via gateway</span>
              )}
            </button>
          ))}
        </div>
      )}
    </ATMCard>

    {p.paymentMethod === 'Card' && (
      // 2026-08-30: extracted to the shared CardChargePanel — the onboarding wizard
      // renders the identical checkout (user directive).
      <CardChargePanel
        amount={p.expectedPrice}
        currency={p.currency}
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
        successNote="Continue to generate."
      />
    )}

    {p.paymentMethod && p.paymentMethod !== 'Card' && (
      <ATMCard title="Payment Evidence" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="space-y-4">
          {p.paymentMethod === 'External' && (
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              External — the payment was collected outside the platform (bank transfer,
              outside settlement, unlinked card…). Record the reference: it is the
              accounting trail linking this collection to you.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ATMTextField
              name="amountReceived"
              label={p.currency ? `Amount Received (${p.currency})` : 'Amount Received'}
              type="number"
              value={p.amountReceived}
              onChange={(e) => p.onAmountReceivedChange(e.target.value)}
              error={!p.amountValid && p.amountReceived !== '' ? `At least the total price (${p.expectedPrice?.toFixed(2)})` : undefined}
            />
            <ATMTextField
              name="paymentReference"
              label={p.paymentMethod === 'External' ? 'Payment Reference (required)' : 'Payment Reference (optional)'}
              placeholder={p.paymentMethod === 'External' ? 'Bank/settlement/transaction reference…' : 'Wire ref, cheque no, receipt no…'}
              value={p.paymentReference}
              onChange={(e) => p.onPaymentReferenceChange(e.target.value)}
              error={p.paymentMethod === 'External' && !p.paymentReference.trim() ? 'Required for accounting' : undefined}
            />
          </div>
          <ATMTextField
            name="note"
            label="Note (optional)"
            placeholder="Payer name, remarks…"
            value={p.note}
            onChange={(e) => p.onNoteChange(e.target.value)}
          />
          <label className="flex items-center gap-2 cursor-pointer border-t border-gray-100 dark:border-gray-800 pt-4">
            <input
              type="checkbox"
              checked={p.paymentConfirmed}
              onChange={(e) => p.onPaymentConfirmedChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Payment received in full
            </span>
          </label>
        </div>
      </ATMCard>
    )}
  </>
);

export default PaymentStep;
