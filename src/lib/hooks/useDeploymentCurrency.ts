import { useGetSetupStatusQuery } from '@/modules/settings/services/settingsApi';

/**
 * 2026-09-05 (user-locked rule: currency ALWAYS comes from configuration).
 *
 * The deployment's single currency, read from first-run setup (`platform.currency`) through
 * GET /settings/setup-status. Screens whose own payload does not carry a currency use this
 * instead of assuming one.
 *
 * Returns `undefined` until the setting arrives (or when setup has not run). Callers must
 * render a placeholder in that window rather than substituting a currency of their own —
 * `formatCurrencyOrDash` does that.
 */
export function useDeploymentCurrency(): { currency: string | undefined; isLoading: boolean } {
  const { data, isLoading } = useGetSetupStatusQuery();
  const currency = data?.data?.currency;
  return { currency: currency && currency.trim() !== '' ? currency : undefined, isLoading };
}
