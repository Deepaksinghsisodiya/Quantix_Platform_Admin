import { useAppSelector } from '@/app/hooks';

/**
 * 2026-08-08 (branding): the platform's user-facing name is the operator-set
 * DBA (Doing Business As) name — served by GET /api/v1/settings/public into
 * settings.config.AppName by ConfigLoader. "Quantix" is the product default.
 */
export const DEFAULT_BRAND_NAME = 'Quantix';

export function useBrandName(): string {
  return useAppSelector((s) => s.settings.config.AppName) || DEFAULT_BRAND_NAME;
}

export default useBrandName;
