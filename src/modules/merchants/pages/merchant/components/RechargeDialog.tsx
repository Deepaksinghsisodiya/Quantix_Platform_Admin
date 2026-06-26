/**
 * Pass 40m (2026-05-25) â€” Enterprise merchant wallet recharge dialog.
 *
 * Two-step flow: (1) merchant enters token amount + currency amount (token rate
 * could be exchange-rate driven later); (2) PspMount captures the card via the
 * hosted iframe and returns a paymentToken which is forwarded to merchantSelf.
 * rechargeWallet.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { useRechargeSelfWalletMutation } from '@/modules/merchants/services/merchantSelfApi';
import { ATMModal } from '@/shared/ui';
import PspMount from './PspMount';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCurrency?: string;
}

export default function RechargeDialog({ open, onClose, defaultCurrency = 'USD' }: Props) {
  const [step, setStep] = useState<'amount' | 'pay'>('amount');
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [currencyAmount, setCurrencyAmount] = useState<number>(100);
  const [currency] = useState<string>(defaultCurrency);

  const [rechargeWallet, { isLoading: isRecharging }] = useRechargeSelfWalletMutation();

  async function handleRecharge(paymentToken: string) {
    try {
      await rechargeWallet({
        tokenAmount,
        currencyAmount,
        currencyCode: currency,
        paymentToken,
        description: 'Self-service recharge',
      }).unwrap();
      toast.success(`${tokenAmount} tokens added to your wallet.`);
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Recharge failed.');
    }
  }


  function handleClose() {
    setStep('amount');
    setTokenAmount(100);
    setCurrencyAmount(100);
    onClose();
  }

  return (
    <ATMModal open={open} onClose={handleClose} title="Recharge wallet">
      {step === 'amount' && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Tokens to add</span>
            <input
              type="number"
              min={1}
              step={1}
              value={tokenAmount}
              onChange={(e) => setTokenAmount(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Charge amount ({currency})</span>
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={currencyAmount}
              onChange={(e) => setCurrencyAmount(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700 px-3 py-2 text-sm"
            />
          </label>
          <p className="text-xs text-surface-500">
            For the first recharge, plan to cover at least 30 days of subscription + your expected
            commission for the month.
          </p>
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
              disabled={tokenAmount <= 0 || currencyAmount <= 0}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
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
              <span className="text-surface-500">Tokens</span>
              <strong>{tokenAmount.toLocaleString()}</strong>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-surface-500">Charge</span>
              <strong>{currencyAmount.toFixed(2)} {currency}</strong>
            </div>
          </div>
          <PspMount
            amount={currencyAmount}
            currency={currency}
            submitting={isRecharging}
            onCancel={() => setStep('amount')}
            onToken={(token) => handleRecharge(token)}
          />
        </div>
      )}
    </ATMModal>
  );
}
