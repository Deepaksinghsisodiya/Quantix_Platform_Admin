/**
 * Pass 40m/n (2026-05-25) â€” PSP-mount component mirroring the Pass-30 PaymentForm
 * pattern from PlatformWebsite.
 *
 * Renders an empty <div data-quantix-psp-mount> that the configured PSP integration
 * script (Stripe Elements / Square Web Payments SDK / Razorpay Checkout etc.) injects
 * its hosted iframe into. Tokenisation happens INSIDE the iframe; the integration
 * script calls `window.quantixPsp.tokenize(amount, currency)` to capture and returns
 * a one-time `paymentToken` to the parent component via the onToken callback.
 *
 * PCI-DSS posture: raw card data never reaches the React tree. Only the opaque
 * paymentToken is handed back to the calling component (wallet recharge dialog or
 * token purchase wizard), which forwards it to the backend.
 *
 * In dev, the integration script may not be loaded â€” the component degrades to a
 * mock-mode "Use mock payment token" button so the flows are clickable end-to-end.
 */
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    quantixPsp?: {
      mount: (el: HTMLElement, opts: { amount: number; currency: string }) => Promise<void>;
      tokenize: (opts: { amount: number; currency: string }) => Promise<{ token: string; brand?: string; last4?: string }>;
      unmount?: (el: HTMLElement) => void;
    };
  }
}

interface Props {
  amount: number;
  currency: string;
  onToken: (token: string, meta?: { brand?: string; last4?: string }) => void;
  onCancel?: () => void;
  submitting?: boolean;
}

export default function PspMount({ amount, currency, onToken, onCancel, submitting }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [pspReady, setPspReady] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    if (typeof window === 'undefined') return;
    if (!window.quantixPsp) {
      // Integration script not present â€” dev or staging without PSP wiring. Show the
      // mock-mode escape hatch so the flow remains clickable in the SPA.
      setMockMode(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await window.quantixPsp!.mount(mountRef.current!, { amount, currency });
        if (!cancelled) setPspReady(true);
      } catch (err) {
        // Mount failure also drops to mock mode; the user can still cancel.
        if (!cancelled) setMockMode(true);
        console.error('[PspMount] mount failed', err);
      }
    })();
    return () => {
      cancelled = true;
      if (mountRef.current && window.quantixPsp?.unmount) {
        try { window.quantixPsp.unmount(mountRef.current); } catch { /* swallow */ }
      }
    };
  }, [amount, currency]);

  async function handleSubmit() {
    if (!window.quantixPsp) {
      // Dev mock token: deterministic prefix so the backend gateway can identify it
      // as test traffic if needed. Real PSP tokens never start with "mock_".
      onToken(`mock_${Date.now()}_${currency.toLowerCase()}`, { brand: 'mock', last4: '4242' });
      return;
    }
    try {
      const { token, brand, last4 } = await window.quantixPsp.tokenize({ amount, currency });
      onToken(token, { brand, last4 });
    } catch (err) {
      console.error('[PspMount] tokenize failed', err);
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={mountRef}
        data-quantix-psp-mount
        className="min-h-[80px] rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 p-4"
      >
        {mockMode && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            PSP integration script not detected. Dev mode: a mock payment token will be used.
          </p>
        )}
        {!mockMode && !pspReady && (
          <p className="text-xs text-surface-500">Loading payment form…</p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-surface-300 dark:border-surface-600 px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || (!pspReady && !mockMode)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Processing…' : `Pay ${amount.toFixed(2)} ${currency}`}
        </button>
      </div>
    </div>
  );
}
