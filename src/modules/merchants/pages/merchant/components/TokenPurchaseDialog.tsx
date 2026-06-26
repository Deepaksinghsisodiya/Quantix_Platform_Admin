/**
 * Pass 40n (2026-05-25) â€” Standalone merchant token purchase wizard.
 *
 * 3-step flow:
 *   1. Choose validity period (30/60/90/180/365 days)
 *   2. PSP capture via hosted iframe
 *   3. Success â€” token issued + invoice marked paid
 *
 * Price computation: client shows DailySubscriptionPrice Ã— validityDays as the
 * expected charge, taken from the merchant subscription if known (passed in as
 * `dailyPrice`). The backend re-validates the price server-side; the client
 * estimate is only for display.
 */
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { usePurchaseSelfTokenMutation } from '@/modules/merchants/services/merchantSelfApi';
import { ATMModal } from '@/shared/ui';
import PspMount from './PspMount';

const VALIDITY_OPTIONS = [
  { days: 30, label: '1 month' },
  { days: 60, label: '2 months' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months' },
  { days: 365, label: '12 months' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Per-day price snapshot from MerchantSubscription. Null = unknown (estimate suppressed). */
  dailyPrice: number | null;
  currency: string;
}

export default function TokenPurchaseDialog({ open, onClose, dailyPrice, currency }: Props) {
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const [validityDays, setValidityDays] = useState(30);

  const expectedCharge = useMemo(
    () => (dailyPrice ? dailyPrice * validityDays : 0),
    [dailyPrice, validityDays],
  );

  const [purchaseToken, { isLoading: isPurchasing }] = usePurchaseSelfTokenMutation();

  async function handlePurchase(paymentToken: string) {
    try {
      await purchaseToken({
        validityDays,
        currencyAmount: expectedCharge,
        currencyCode: currency,
        paymentToken,
      }).unwrap();
      toast.success(`License token issued (${validityDays} days).`);
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Token purchase failed.');
    }
  }


  function handleClose() {
    setStep('select');
    setValidityDays(30);
    onClose();
  }

  return (
    <ATMModal open={open} onClose={handleClose} title="Buy a license token" size="lg">
      {step === 'select' && (
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Choose how long you'd like the new license to cover. You can stack tokens â€” the next
            token's validity starts where the current one ends.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {VALIDITY_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setValidityDays(opt.days)}
                className={`rounded-lg border p-3 text-sm transition ${
                  validityDays === opt.days
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-surface-200 dark:border-surface-700 hover:border-primary-300'
                }`}
              >
                <div className="font-semibold">{opt.label}</div>
                <div className="text-xs text-surface-500">{opt.days} days</div>
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-surface-50 dark:bg-surface-900 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-surface-500">Validity</span>
              <strong>{validityDays} days</strong>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-surface-500">Expected charge</span>
              <strong>
                {dailyPrice ? `${expectedCharge.toFixed(2)} ${currency}` : '— (server will calculate)'}
              </strong>
            </div>
            {dailyPrice && (
              <div className="mt-1 text-xs text-surface-500">
                {dailyPrice.toFixed(2)} {currency} per day Ã— {validityDays} days
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-surface-300 dark:border-surface-600 px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep('pay')}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Continue to payment
            </button>
          </div>
        </div>
      )}
      {step === 'pay' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-surface-50 dark:bg-surface-900 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-surface-500">Validity</span>
              <strong>{validityDays} days</strong>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-surface-500">Charge</span>
              <strong>{expectedCharge.toFixed(2)} {currency}</strong>
            </div>
          </div>
          <PspMount
            amount={expectedCharge}
            currency={currency}
            submitting={isPurchasing}
            onCancel={() => setStep('select')}
            onToken={(token) => handlePurchase(token)}
          />
        </div>
      )}
    </ATMModal>
  );
}
