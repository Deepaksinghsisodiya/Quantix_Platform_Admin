import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MerchantType, BusinessType } from '@/lib/types';

type MerchantTypeFilter = 'All' | MerchantType;
type BusinessTypeFilter = 'All' | BusinessType;

interface FilterState {
  merchantTypeFilter: MerchantTypeFilter;
  businessTypeFilter: BusinessTypeFilter;

  setMerchantType: (type: MerchantTypeFilter) => void;
  setBusinessType: (type: BusinessTypeFilter) => void;
  resetFilters: () => void;
}

const INITIAL_STATE: Pick<FilterState, 'merchantTypeFilter' | 'businessTypeFilter'> = {
  merchantTypeFilter: 'All',
  businessTypeFilter: 'All',
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setMerchantType: (type: MerchantTypeFilter) => {
        set({ merchantTypeFilter: type });
      },

      setBusinessType: (type: BusinessTypeFilter) => {
        set({ businessTypeFilter: type });
      },

      resetFilters: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: 'quantix-platform-filters',
    },
  ),
);
