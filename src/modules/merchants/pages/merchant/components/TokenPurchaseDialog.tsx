/**
 * Standalone merchant token purchase (Pass 40n, rebuilt 2026-09-02).
 *
 * 2-step flow: choose validity → pay by card. The token and its paid invoice are
 * issued by the server on a successful capture.
 *
 * PRICING — this is what was broken. The dialog used to take a `dailyPrice` prop and
 * compute `dailyPrice × validityDays` itself. For a Standalone merchant that prop was
 * always null (the page passed nothing, because /merchant-self/subscription is
 * Enterprise-only), so `expectedCharge` was 0, the request sent `currencyAmount: 0`,
 * and the server rejected every purchase with INVALID_PRICE after capturing and
 * refunding a zero charge. Self-service token purchase could not succeed at all.
 * The mirror-image hole: a client that sent MORE than the plan price was charged it.
 *
 * The price now comes from GET /merchant-self/tokens/quote and the amount is no longer
 * sent at all — the server prices the token from the merchant's own plan and charges
 * that. What the merchant is shown here is, by construction, what they will be charged.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck } from 'lucide-react';
import {
  useGetSelfTokenQuoteQuery,
  usePurchaseSelfTokenMutation,
} from '@/modules/merchants/services/merchantSelfApi';
import { ATMModal, ATMSkeleton } from '@/shared/ui';
import { cn } from '@/lib/utils/cn';
import PspMount from './PspMount';

const VALIDITY_OPTIONS = [
  { days: 30, label: '1 month' },
  { days: 60, label: '2 months' },
  { days: 90, label: '3 months' },
  { days: 180, label: '6 months', bestValue: true },
  { days: 365, label: '12 months' },
];

const validityLabel = (days: number) =>
  VALIDITY_OPTIONS.find((o) => o.days === days)?.label ?? `${days} days`;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Refetch the caller's token list after a successful purchase. */
  onPurchased?: () => void;
}

export default function TokenPurchaseDialog({ open, onClose, onPurchased }: Props) {
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const [validityDays, setValidityDays] = useState(30);

  // 2026-09-02: online payment can be disabled deployment-wide (Settings → Payment
  // Integration), and the gateway would reject the charge anyway — so the merchant is
  // told up front rather than after entering card details. The flag now rides on the
  // quote: this dialog used to read it from GET /settings/setup-status, an admin-only
  // route that answered 403 for every merchant and popped two "Access denied" toasts
  // on their own purchase screen.
  const quoteQuery = useGetSelfTokenQuoteQuery(validityDays, { skip: !open });
  // currentData, NOT data: while a new validity is being quoted, `data` still holds the
  // PREVIOUS selection's price. Reading it showed "90 days ... 480.00" — the 30-day
  // price against a 90-day choice, on the screen that then charges the card.
  const quote = quoteQuery.currentData?.data ?? null;
  const quoting = quoteQuery.isLoading || quoteQuery.isFetching;
  // Fall back to the last known answer for the payment-enabled flag only — it does not
  // vary by validity, so a stale value is safe where a stale price is not.
  const onlinePaymentEnabled =
    (quote ?? quoteQuery.data?.data)?.onlinePaymentEnabled !== false;
  const quoteError =
    (quoteQuery.error as any)?.data?.message ||
    (quoteQuery.isError ? 'We could not price a token for your account.' : null);

  const [purchaseToken, { isLoading: isPurchasing }] = usePurchaseSelfTokenMutation();

  async function handlePurchase(paymentToken: string) {
    try {
      await purchaseToken({ validityDays, paymentToken }).unwrap();
      toast.success(`Licence token issued (${validityDays} days).`);
      onPurchased?.();
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

  const money = (amount: number) => `${amount.toFixed(2)} ${quote?.currencyCode ?? ''}`.trim();

  return (
    <ATMModal open={open} onClose={handleClose} title="Buy a licence token" size="lg">
      {!onlinePaymentEnabled && (
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-300">
            Online payment is not enabled on this deployment. Please contact support to
            purchase a token offline — the platform team will record the payment and issue
            your token.
          </p>
          <div className="flex justify-end">
            <button type="button" onClick={handleClose} className={btnSecondary}>
              Close
            </button>
          </div>
        </div>
      )}

      {onlinePaymentEnabled && step === 'select' && (
        <div className="space-y-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Choose how long the new licence should cover. You can hold more than one token —
            a token&apos;s validity starts on the day you apply it to your POS, so buying
            ahead costs you nothing in time.
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {VALIDITY_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setValidityDays(opt.days)}
                className={cn(
                  'relative rounded-lg border p-3 text-sm transition',
                  validityDays === opt.days
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : opt.bestValue
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 hover:border-emerald-300'
                      : 'border-surface-200 dark:border-surface-700 hover:border-primary-300',
                )}
              >
                {opt.bestValue && (
                  <span className="absolute -top-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm shadow-emerald-500/30">
                    <BadgeCheck className="h-2.5 w-2.5" />
                    Best value
                  </span>
                )}
                <div className="font-semibold">{opt.label}</div>
                <div className="text-xs text-surface-500">{opt.days} days</div>
              </button>
            ))}
          </div>

          {/* The price, straight from the server that will charge it. */}
          <div className="rounded-lg bg-surface-50 dark:bg-surface-900 p-3 text-sm">
            {quoteError ? (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">{quoteError}</p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                      Total you will be charged
                    </p>
                    <p className="mt-1 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                      {quoting || !quote ? (
                        <ATMSkeleton width="110px" height="26px" className="inline-block align-middle" />
                      ) : (
                        money(quote.amount)
                      )}
                    </p>
                  </div>
                  {quote && !quoting && (
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-surface-600 dark:text-surface-300">
                        {validityLabel(validityDays)}
                      </p>
                      <p className="mt-0.5 text-xs text-surface-400">
                        ≈ {money(Math.round(quote.dailyPrice * 100) / 100)} per day
                      </p>
                    </div>
                  )}
                </div>
                {quote && !quoting && (
                  <p className="mt-2 border-t border-surface-200/70 pt-2 text-xs text-surface-500 dark:border-surface-800">
                    {quote.planName} · {money(Math.round(quote.dailyPrice * 100) / 100)} per day ×{' '}
                    {validityDays} days
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleClose} className={btnSecondary}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep('pay')}
              disabled={!quote || quoting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to payment
            </button>
          </div>
        </div>
      )}

      {onlinePaymentEnabled && step === 'pay' && quote && (
        <div className="space-y-4">
          <div className="rounded-lg bg-surface-50 dark:bg-surface-900 p-3.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                  Charge
                </p>
                <p className="mt-0.5 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
                  {money(quote.amount)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-surface-600 dark:text-surface-300">
                  {validityLabel(validityDays)} · {validityDays} days
                </p>
                <p className="mt-0.5 text-xs text-surface-400">
                  ≈ {money(Math.round(quote.dailyPrice * 100) / 100)} per day
                </p>
              </div>
            </div>
          </div>
          <PspMount
            amount={quote.amount}
            currency={quote.currencyCode}
            submitting={isPurchasing}
            onCancel={() => setStep('select')}
            onToken={(token) => handlePurchase(token)}
          />
        </div>
      )}
    </ATMModal>
  );
}

const btnSecondary =
  'rounded-lg border border-surface-300 dark:border-surface-600 px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800';
