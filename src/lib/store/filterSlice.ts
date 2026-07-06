import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MerchantType, BusinessType } from '@/lib/types';

export type MerchantTypeFilter = 'All' | MerchantType;
export type BusinessTypeFilter = 'All' | BusinessType;

export interface FilterState {
  merchantTypeFilter: MerchantTypeFilter;
  businessTypeFilter: BusinessTypeFilter;
}

const loadSavedFilters = (): FilterState => {
  if (typeof window === 'undefined') return { merchantTypeFilter: 'All', businessTypeFilter: 'All' };
  try {
    const saved = localStorage.getItem('quantix-platform-filters');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        merchantTypeFilter: parsed.merchantTypeFilter || 'All',
        businessTypeFilter: parsed.businessTypeFilter || 'All',
      };
    }
  } catch (e) {
    // Ignore
  }
  return { merchantTypeFilter: 'All', businessTypeFilter: 'All' };
};

const initialState: FilterState = loadSavedFilters();

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setMerchantType: (state, action: PayloadAction<MerchantTypeFilter>) => {
      state.merchantTypeFilter = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('quantix-platform-filters', JSON.stringify({
          merchantTypeFilter: state.merchantTypeFilter,
          businessTypeFilter: state.businessTypeFilter,
        }));
      }
    },
    setBusinessType: (state, action: PayloadAction<BusinessTypeFilter>) => {
      state.businessTypeFilter = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('quantix-platform-filters', JSON.stringify({
          merchantTypeFilter: state.merchantTypeFilter,
          businessTypeFilter: state.businessTypeFilter,
        }));
      }
    },
    resetFilters: (state) => {
      state.merchantTypeFilter = 'All';
      state.businessTypeFilter = 'All';
      if (typeof window !== 'undefined') {
        localStorage.removeItem('quantix-platform-filters');
      }
    },
  },
});

export const { setMerchantType, setBusinessType, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
export const selectMerchantTypeFilter = (state: any) => state.filters.merchantTypeFilter;
export const selectBusinessTypeFilter = (state: any) => state.filters.businessTypeFilter;
