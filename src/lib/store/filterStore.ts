import { useSelector, useDispatch } from 'react-redux';
import { store } from '@/app/store';
import * as actions from './filterSlice';
import type { MerchantTypeFilter, BusinessTypeFilter } from './filterSlice';

export function useFilterStore<T = any>(selector?: (state: any) => T): T {
  const dispatch = useDispatch();
  const filters = useSelector((state: any) => state.filters);

  const combined = {
    merchantTypeFilter: filters.merchantTypeFilter,
    businessTypeFilter: filters.businessTypeFilter,
    setMerchantType: (type: MerchantTypeFilter) => dispatch(actions.setMerchantType(type)),
    setBusinessType: (type: BusinessTypeFilter) => dispatch(actions.setBusinessType(type)),
    resetFilters: () => dispatch(actions.resetFilters()),
  };

  if (selector) {
    return selector(combined);
  }
  return combined as any;
}

// Support vanilla JS calls (e.g. useFilterStore.getState().merchantTypeFilter)
useFilterStore.getState = () => {
  const filters = store.getState().filters;
  return {
    merchantTypeFilter: filters.merchantTypeFilter,
    businessTypeFilter: filters.businessTypeFilter,
    setMerchantType: (type: MerchantTypeFilter) => store.dispatch(actions.setMerchantType(type)),
    setBusinessType: (type: BusinessTypeFilter) => store.dispatch(actions.setBusinessType(type)),
    resetFilters: () => store.dispatch(actions.resetFilters()),
  };
};

useFilterStore.setState = (update: any) => {
  if (typeof update === 'function') {
    const nextState = update(useFilterStore.getState());
    if (nextState.merchantTypeFilter !== undefined) store.dispatch(actions.setMerchantType(nextState.merchantTypeFilter));
    if (nextState.businessTypeFilter !== undefined) store.dispatch(actions.setBusinessType(nextState.businessTypeFilter));
  } else {
    if (update.merchantTypeFilter !== undefined) store.dispatch(actions.setMerchantType(update.merchantTypeFilter));
    if (update.businessTypeFilter !== undefined) store.dispatch(actions.setBusinessType(update.businessTypeFilter));
  }
};
