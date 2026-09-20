/**
 * Client-side card tokenization — 2026-08-29 (user-locked card checkout).
 *
 * Like every eCommerce checkout: the operator types card number/expiry/CVV into the
 * form, the PROVIDER's client script turns them into an opaque token, and only that
 * token (plus brand/last4 for display) is sent to our API. Raw PAN/CVV never touch
 * the platform's servers and are never stored anywhere.
 *
 * Provider dispatch (from setup-status paymentProvider):
 *  - "Mock"  → deterministic dev tokenizer (token minted in the browser).
 *  - others  → the provider's JS SDK integration (window.quantixPsp) — NOT integrated
 *              yet; tokenize() fails VISIBLY rather than pretending (no silent fakes).
 */

export interface CardDetails {
  readonly cardholderName: string;
  /** Digits only (spaces stripped by the caller). */
  readonly cardNumber: string;
  readonly expiryMonth: number;
  readonly expiryYear: number; // 4-digit
  readonly cvv: string;
}

export interface CardToken {
  readonly token: string;
  readonly brand: string;
  readonly last4: string;
}

export interface CardValidation {
  readonly valid: boolean;
  readonly error?: string;
}

/** Luhn checksum. */
export function luhnValid(digits: string): boolean {
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function detectBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^(60|65|81|82)/.test(digits)) return 'RuPay';
  if (/^6011/.test(digits)) return 'Discover';
  return 'Card';
}

/** Groups digits for display: 4-4-4-4 (Amex 4-6-5). */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  if (/^3[47]/.test(digits)) {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function validateCard(card: CardDetails): CardValidation {
  if (!card.cardholderName.trim()) return { valid: false, error: 'Cardholder name is required' };
  if (!luhnValid(card.cardNumber)) return { valid: false, error: 'Card number is invalid' };
  if (!(card.expiryMonth >= 1 && card.expiryMonth <= 12)) return { valid: false, error: 'Expiry month is invalid' };
  const now = new Date();
  const endOfExpiry = new Date(card.expiryYear, card.expiryMonth, 1); // first day AFTER expiry month
  if (Number.isNaN(endOfExpiry.getTime()) || endOfExpiry <= now) return { valid: false, error: 'Card has expired' };
  if (!/^\d{3,4}$/.test(card.cvv)) return { valid: false, error: 'CVV is invalid' };
  return { valid: true };
}

/**
 * Tokenize the card with the configured provider's CLIENT-side machinery.
 * Throws with a user-readable message on failure — callers surface it, never mask it.
 */
export async function tokenizeCard(provider: string, card: CardDetails): Promise<CardToken> {
  const check = validateCard(card);
  if (!check.valid) throw new Error(check.error);

  const brand = detectBrand(card.cardNumber);
  const last4 = card.cardNumber.slice(-4);

  if (provider === 'Mock' || provider === '') {
    // Dev tokenizer: mints the opaque token in the browser — the PAN goes no further.
    const rand = crypto.getRandomValues(new Uint32Array(2));
    return {
      token: `tok_mock_${rand[0]!.toString(36)}${rand[1]!.toString(36)}`,
      brand,
      last4,
    };
  }

  // Real providers need their own JS SDK (Stripe.js, Razorpay checkout, …) loaded and
  // keyed — parked with the Payment Integration revisit. Fail visibly, never fake.
  throw new Error(
    `Card tokenization for the "${provider}" gateway is not integrated yet — ` +
    'the provider\'s client script must be wired in Settings → Payment Integration.',
  );
}
