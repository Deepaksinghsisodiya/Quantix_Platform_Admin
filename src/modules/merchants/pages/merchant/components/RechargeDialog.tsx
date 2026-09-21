/**
 * Enterprise merchant wallet recharge dialog (Pass 40m, 2026-05-25; rebuilt 2026-09-04).
 *
 * What the previous version did wrong, found on the first real Enterprise walk:
 *   • It read the admin-only /settings/setup-status route for the currency and the
 *     online-payment flag — 403 for every merchant, so opening the dialog fired
 *     "Access denied" toasts and the charge label read "()".
 *   • It let the merchant type BOTH the token amount and the currency amount — i.e. set
 *     their own exchange rate — and the API charged that figure verbatim, falling back to
 *     a hardcoded "USD" when the (blank) currency arrived.
 * Now the merchant chooses how many tokens; GET /merchant-self/wallet/quote prices them
 * from the platform's exchange rate and deployment currency (and carries the payment flag),
 * and the recharge charges exactly the quote. Same shape as the token purchase dialog.
 */
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  useGetSelfWalletQuoteQuery,
  useRechargeSelfWalletMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import { apiErrorMessage } from '@/lib/utils/apiError';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { ATMModal, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import PspMount from './PspMount';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Suggested amount — 30 days of the plan's daily charge when the wallet page knows it. */
  suggestedTokens?: number;
}

const DEFAULT_TOKENS = 100;
const QUOTE_DEBOUNCE_MS = 400;

const TOP_UP_CHIPS = [
  { days: 7, label: '1 week' },
  { days: 15, label: '15 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export default function RechargeDialog({ open, onClose, suggestedTokens }: Props) {
  const initial = suggestedTokens && suggestedTokens > 0 ? Math.ceil(suggestedTokens) : DEFAULT_TOKENS;
  const [step, setStep] = useState<'amount' | 'pay'>('amount');
  const [tokenInput, setTokenInput] = useState<string>(String(initial));
  const [tokenAmount, setTokenAmount] = useState<number>(initial);

  useEffect(() => {
    if (open) {
      setStep('amount');
      setTokenInput(String(initial));
      setTokenAmount(initial);
    }
  }, [open, initial]);

  // Re-quote a moment after typing stops, not on every keystroke.
  useEffect(() => {
    const n = Number(tokenInput);
    const timer = setTimeout(
      () => setTokenAmount(Number.isFinite(n) && n > 0 ? Math.floor(n) : 0),
      QUOTE_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [tokenInput]);

  const quoteQuery = useGetSelfWalletQuoteQuery(tokenAmount, { skip: !open || tokenAmount <= 0 });
  // currentData: a quote for a previous amount is not a quote for this one.
  const quote = quoteQuery.currentData?.data ?? null;
  const quoting = quoteQuery.isLoading || quoteQuery.isFetching;
  // The payment flag does not vary by amount, so the last known answer is safe to keep.
  const onlinePaymentEnabled = (quote ?? quoteQuery.data?.data)?.onlinePaymentEnabled !== false;
  const quoteError = quoteQuery.isError
    ? apiErrorMessage(quoteQuery.error, 'We could not price this recharge.')
    : null;

  const [rechargeWallet, { isLoading: isRecharging }] = useRechargeSelfWalletMutation();

  async function handleRecharge(paymentToken: string) {
    if (!quote) return;
    try {
      await rechargeWallet({
        tokenAmount: quote.tokenAmount,
        paymentToken,
        description: 'Self-service recharge',
      }).unwrap();
      toast.success(`${quote.tokenAmount.toLocaleString()} tokens added to your wallet.`);
      handleClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'The recharge could not be completed.'));
    }
  }

  function handleClose() {
    setStep('amount');
    onClose();
  }

  // 2026-09-05 (decision B): the wallet must end up covering 30 days of subscription plus
  // expected commission, or 90 days without a revenue estimate. The server refuses a short
  // recharge, so the dialog states the shortfall rather than letting the merchant pay first.
  const coverage = quote?.coverage ?? null;
  const coverageShort = !!coverage && !coverage.isMet;
  const canContinue =
    !!quote && !quoting && tokenAmount > 0 && quote.tokenAmount === tokenAmount && !coverageShort;

  return (
    <ATMModal open={open} onClose={handleClose} title="Recharge wallet">
      {!onlinePaymentEnabled && (
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">
            Online payment is not enabled on this deployment. Please contact support to
            arrange an offline recharge (bank transfer / cash) — it will be credited to
            your wallet by the platform team.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-surface-300 dark:border-surface-600 px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {onlinePaymentEnabled && step === 'amount' && (
        <div className="space-y-4">
          <div>
            <label className="block">
              <span className="text-sm font-medium">Tokens to add</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-surface-600 dark:bg-surface-900/60 dark:text-slate-100 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
              />
            </label>

            {suggestedTokens && suggestedTokens > 0 && (
              <div className="mt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                  One-tap top-ups
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {TOP_UP_CHIPS.map((chip) => {
                    const amount = Math.max(1, Math.round((suggestedTokens / 30) * chip.days));
                    const isActive = Number(tokenInput) === amount;
                    return (
                      <button
                        key={chip.days}
                        type="button"
                        onClick={() => {
                          setTokenInput(String(amount));
                          setTokenAmount(amount);
                        }}
                        className={cn(
                          'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                          isActive
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                            : 'border-surface-200 text-surface-600 hover:border-primary-300 hover:text-primary-600 dark:border-surface-700 dark:text-surface-300',
                        )}
                      >
                        {chip.label} · {amount.toLocaleString()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-surface-50 dark:bg-surface-900 p-3 text-sm" aria-live="polite">
            {tokenAmount <= 0 && <p className="text-surface-500">Enter how many tokens to add.</p>}
            {tokenAmount > 0 && quoting && !quote && <ATMSkeleton width="120px" height="14px" />}
            {tokenAmount > 0 && quoteError && (
              <p role="alert" className="font-semibold text-red-600 dark:text-red-400">{quoteError}</p>
            )}
            {coverage && coverage.requirement.minimumTokens > 0 && (
              <p className={coverageShort
                ? 'font-semibold text-amber-700 dark:text-amber-300'
                : 'text-emerald-700 dark:text-emerald-300'}>
                {coverageShort
                  ? `Add at least ${coverage.shortfallTokens.toLocaleString()} more tokens — ${coverage.requirement.explanation}`
                  : `Meets the minimum wallet cover of ${coverage.requirement.minimumTokens.toLocaleString()} tokens.`}
              </p>
            )}
            {quote && (
              <>
                <div className="flex justify-between">
                  <span className="text-surface-500">Charge</span>
                  <strong>{formatCurrency(quote.currencyAmount, quote.currencyCode)}</strong>
                </div>
                <p className="mt-1 text-xs text-surface-500">
                  {quote.tokensPerCurrencyUnit} token{quote.tokensPerCurrencyUnit === 1 ? '' : 's'} per{' '}
                  {quote.currencyCode}
                  {quote.daysCovered !== null && quote.plannedDailyCharge > 0
                    ? ` · covers ≈ ${quote.daysCovered} day${quote.daysCovered === 1 ? '' : 's'} at your ${quote.plannedDailyCharge.toFixed(2)} tokens/day subscription`
                    : ''}
                </p>
              </>
            )}
          </div>

          <p className="text-xs text-surface-500">
            Subscription is deducted daily from the wallet; commission is charged at cycle end.
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
              disabled={!canContinue}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              Continue to payment
            </button>
          </div>
        </div>
      )}

      {onlinePaymentEnabled && step === 'pay' && quote && (
        <div className="space-y-4">
          <div className="rounded-lg bg-surface-50 dark:bg-surface-900 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-surface-500">Tokens</span>
              <strong>{quote.tokenAmount.toLocaleString()}</strong>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-surface-500">Charge</span>
              <strong>{formatCurrency(quote.currencyAmount, quote.currencyCode)}</strong>
            </div>
          </div>
          <PspMount
            amount={quote.currencyAmount}
            currency={quote.currencyCode}
            submitting={isRecharging}
            onCancel={() => setStep('amount')}
            onToken={(token) => void handleRecharge(token)}
          />
        </div>
      )}
    </ATMModal>
  );
}
