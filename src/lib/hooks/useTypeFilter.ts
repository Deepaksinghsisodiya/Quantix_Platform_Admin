/**
 * Hook wrapping the filterStore for merchant/business type filtering.
 */

import { useFilterStore } from '@/lib/store/filterStore';
import type { MerchantType, BusinessType } from '@/lib/types';

type MerchantTypeFilter = 'All' | MerchantType;
type BusinessTypeFilter = 'All' | BusinessType;

export function useTypeFilter() {
  const {
    merchantTypeFilter,
    businessTypeFilter,
    setMerchantType,
    setBusinessType,
    resetFilters,
  } = useFilterStore();

  const isFiltered = merchantTypeFilter !== 'All' || businessTypeFilter !== 'All';

  return {
    merchantType: merchantTypeFilter as MerchantTypeFilter,
    businessNature: businessTypeFilter as BusinessTypeFilter,
    setMerchantType,
    setBusinessType,
    resetFilters,
    isFiltered,
  } as const;
}
