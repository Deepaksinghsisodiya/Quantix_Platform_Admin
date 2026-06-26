import { useState, useCallback, useMemo } from 'react';

export interface TableState {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string | null;
  sortDesc: boolean;
  filters: Record<string, any>;
}

export function useTableState(defaults?: Partial<TableState>) {
  const [state, setState] = useState<TableState>({
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: null,
    sortDesc: true,
    filters: {},
    ...defaults,
  });

  const setPage = useCallback((page: number) => 
    setState(prev => ({ ...prev, page })), []);

  const setPageSize = useCallback((pageSize: number) => 
    setState(prev => ({ ...prev, pageSize, page: 1 })), []);

  const setSearch = useCallback((search: string) => 
    setState(prev => ({ ...prev, search, page: 1 })), []);

  const setSortBy = useCallback((sortBy: string | null) => 
    setState(prev => ({
      ...prev,
      sortBy,
      sortDesc: prev.sortBy === sortBy ? !prev.sortDesc : true,
      page: 1
    })), []);

  const setFilters = useCallback((filters: Record<string, any>) => 
    setState(prev => ({ ...prev, filters, page: 1 })), []);

  const resetFilters = useCallback(() => 
    setState(prev => ({ ...prev, filters: {}, search: '', page: 1 })), []);

  const queryParams = useMemo(() => ({
    page: state.page,
    pageSize: state.pageSize,
    search: state.search,
    sortBy: state.sortBy,
    sortDesc: state.sortDesc,
    ...state.filters
  }), [state]);

  return { 
    ...state, 
    setPage, 
    setPageSize, 
    setSearch, 
    setSortBy, 
    setFilters, 
    resetFilters, 
    queryParams 
  };
}
