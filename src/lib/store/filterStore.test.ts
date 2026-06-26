import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from './filterStore';

describe('filterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({
      merchantTypeFilter: 'All',
      businessTypeFilter: 'All',
    });
  });

  it('has All as initial merchant type filter', () => {
    expect(useFilterStore.getState().merchantTypeFilter).toBe('All');
  });

  it('has All as initial business type filter', () => {
    expect(useFilterStore.getState().businessTypeFilter).toBe('All');
  });

  describe('setMerchantType', () => {
    it('sets merchant type to Enterprise', () => {
      useFilterStore.getState().setMerchantType('Enterprise');
      expect(useFilterStore.getState().merchantTypeFilter).toBe('Enterprise');
    });

    it('sets merchant type to Standalone', () => {
      useFilterStore.getState().setMerchantType('Standalone');
      expect(useFilterStore.getState().merchantTypeFilter).toBe('Standalone');
    });

    it('sets merchant type back to All', () => {
      useFilterStore.getState().setMerchantType('Enterprise');
      useFilterStore.getState().setMerchantType('All');
      expect(useFilterStore.getState().merchantTypeFilter).toBe('All');
    });
  });

  describe('setBusinessType', () => {
    it('sets business type to Restaurant', () => {
      useFilterStore.getState().setBusinessType('Restaurant');
      expect(useFilterStore.getState().businessTypeFilter).toBe('Restaurant');
    });

    it('sets business type to Retail', () => {
      useFilterStore.getState().setBusinessType('Retail');
      expect(useFilterStore.getState().businessTypeFilter).toBe('Retail');
    });

    it('sets business type to Both', () => {
      useFilterStore.getState().setBusinessType('Both');
      expect(useFilterStore.getState().businessTypeFilter).toBe('Both');
    });
  });

  describe('resetFilters', () => {
    it('resets all filters to All', () => {
      useFilterStore.getState().setMerchantType('Enterprise');
      useFilterStore.getState().setBusinessType('Restaurant');
      useFilterStore.getState().resetFilters();

      const state = useFilterStore.getState();
      expect(state.merchantTypeFilter).toBe('All');
      expect(state.businessTypeFilter).toBe('All');
    });
  });
});
