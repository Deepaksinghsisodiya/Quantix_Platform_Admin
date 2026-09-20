/**
 * CardChargePanel — the ONE card-checkout surface (2026-08-30, similarity-first).
 * Extracted from the token wizard's PaymentStep so the onboarding wizard renders the
 * IDENTICAL eCommerce-style card form (user directive: "just we did for tokens").
 * The card is tokenized by the gateway's client script — PAN/CVV never reach the API.
 */
import React from 'react';
import { AlertTriangle, Coins } from 'lucide-react';

import { ATMCard, ATMButton, ATMBadge, ATMTextField } from '@/shared/ui';
import { formatCardNumber } from '@/lib/payments/cardTokenizer';
import { formatCurrencyOrDash } from '@/lib/utils/formatCurrency';

/** Structural mirror of the API's CardChargeResultDto — shared by every caller. */
export interface CardChargeLike {
  readonly status: string;
  readonly amount: number;
  readonly currencyCode: string;
  readonly provider: string;
  readonly gatewayTransactionId: string | null;
  readonly cardBrand: string | null;
  readonly cardLast4: string | null;
}

export interface CardChargePanelProps {
  /** The total to charge (null while unknown — button disabled). */
  amount: number | null;
  /** 2026-09-05: the deployment currency (platform.currency). Undefined until setup-status
   *  arrives — the amount then renders as an em dash rather than a bare number the operator
   *  could read in the wrong currency. */
  currency: string | undefined;
  cardName: string;
  onCardNameChange: (val: string) => void;
  cardNumber: string;
  onCardNumberChange: (val: string) => void;
  cardExpiry: string;
  onCardExpiryChange: (val: string) => void;
  cardCvv: string;
  onCardCvvChange: (val: string) => void;
  cardBrand: string;
  cardCharge: CardChargeLike | null;
  chargeError: string | null;
  charging: boolean;
  onChargeCard: () => void;
  /** Trailing sentence on the success panel, e.g. "Continue to generate." */
  successNote: string;
}

export const CardChargePanel: React.FC<CardChargePanelProps> = (p) => (
  <ATMCard title="Card Payment" padding="md" className="shadow-sm border border-gray-100 dark:border-gray-800">
    {p.cardCharge?.status === 'Succeeded' ? (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div>
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              Payment captured — {p.cardCharge.amount.toFixed(2)} {p.cardCharge.currencyCode}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
              {p.cardCharge.cardBrand} ****{p.cardCharge.cardLast4} · via {p.cardCharge.provider}
            </p>
          </div>
          <ATMBadge color="success" label="Paid" />
        </div>
        <p className="text-[11px] text-gray-400 font-medium">
          Gateway transaction <span className="font-mono font-bold">{p.cardCharge.gatewayTransactionId}</span>{' '}
          is recorded as the payment reference. {p.successNote}
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900 shadow-inner">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Amount to charge</span>
          <span className="text-sm font-extrabold text-accent-600 dark:text-accent-400">
            {formatCurrencyOrDash(p.amount, p.currency)}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ATMTextField
            name="cardName"
            label="Cardholder Name"
            placeholder="Name on the card"
            value={p.cardName}
            onChange={(e) => p.onCardNameChange(e.target.value)}
          />
          <ATMTextField
            name="cardNumber"
            label={`Card Number${p.cardNumber.trim() ? ` (${p.cardBrand})` : ''}`}
            placeholder="1234 5678 9012 3456"
            inputMode="numeric"
            autoComplete="off"
            value={p.cardNumber}
            onChange={(e) => p.onCardNumberChange(formatCardNumber(e.target.value))}
          />
          <ATMTextField
            name="cardExpiry"
            label="Expiry (MM/YY)"
            placeholder="08/28"
            inputMode="numeric"
            autoComplete="off"
            value={p.cardExpiry}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
              p.onCardExpiryChange(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
            }}
          />
          <ATMTextField
            name="cardCvv"
            label="CVV"
            placeholder="123"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={p.cardCvv}
            onChange={(e) => p.onCardCvvChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </div>
        {p.chargeError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2 dark:border-red-900/40 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <p className="text-xs font-semibold text-red-700 dark:text-red-300">{p.chargeError}</p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-[11px] text-gray-400 font-medium max-w-md">
            The card is tokenized by the gateway's script — the full number and CVV
            never reach or get stored on this platform. Success or failure is recorded
            with the gateway request/response.
          </p>
          {/* 2026-09-05: charging without a known deployment currency is blocked — the
              operator must not authorise an amount the screen cannot name a currency for. */}
          <ATMButton
            type="button"
            variant="primary"
            icon={Coins}
            isLoading={p.charging}
            disabled={p.amount == null || !p.currency || !p.cardName.trim() || !p.cardNumber.trim() || !p.cardExpiry.trim() || !p.cardCvv.trim()}
            onClick={p.onChargeCard}
          >
            Pay {formatCurrencyOrDash(p.amount, p.currency)}
          </ATMButton>
        </div>
      </div>
    )}
  </ATMCard>
);

export default CardChargePanel;
