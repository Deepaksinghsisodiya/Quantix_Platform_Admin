/**
 * Format a numeric amount as a currency string.
 *
 * 2026-09-05 (user-locked rule: currency ALWAYS comes from configuration): the `currency`
 * argument is REQUIRED. It used to default to 'USD', so any screen that forgot to pass one
 * rendered every figure as dollars — on a deployment that may run in any currency. A caller
 * that does not yet know the currency should render a placeholder instead of a wrong symbol;
 * `formatCurrencyOrDash` does exactly that.
 *
 * The locale stays 'en-US' for digit grouping only; the currency itself is the deployment's.
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * The same, but honest while the currency is still loading or absent: renders an em dash
 * rather than guessing a symbol. Use wherever the deployment currency arrives asynchronously.
 */
export function formatCurrencyOrDash(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (amount === null || amount === undefined || !currency) return '—';
  return formatCurrency(amount, currency);
}

/**
 * Token balances are NOT money — they are the wallet's own unit. Rendering them through a
 * currency formatter (as several screens did) stamped a currency symbol on a token count.
 */
export function formatTokens(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tokens`;
}
