import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PaginationParams {
  page: number;
  pageSize: number;
  search: string;
  sortBy?: string;
  sortDescending?: boolean;
  [key: string]: any;
}

export function usePagination(initialParams: Partial<PaginationParams> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [params, setParams] = useState<PaginationParams>({
    page: Number(searchParams.get('page')) || 1,
    pageSize: Number(searchParams.get('pageSize')) || 10,
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || initialParams.sortBy,
    sortDescending: searchParams.get('sortDescending') === 'true' || initialParams.sortDescending || false,
    ...initialParams
  });

  // 🧪 Automatic URL Sync
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (params.search) newParams.set('search', params.search);
    if (params.page > 1) newParams.set('page', String(params.page));
    if (params.pageSize !== 10) newParams.set('pageSize', String(params.pageSize));
    if (params.sortBy) newParams.set('sortBy', params.sortBy);
    if (params.sortDescending) newParams.set('sortDescending', String(params.sortDescending));

    // Sync custom filters
    Object.keys(params).forEach(key => {
      if (!['search', 'page', 'pageSize', 'sortBy', 'sortDescending'].includes(key)) {
        if (params[key] && params[key] !== 'all') {
          newParams.set(key, String(params[key]));
        }
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [params, setSearchParams]);

  const onPageChange = useCallback((page: number) => 
    setParams(prev => ({ ...prev, page })), []);

  const onPageSizeChange = useCallback((pageSize: number) => 
    setParams(prev => ({ ...prev, pageSize, page: 1 })), []);

  const onSearchChange = useCallback((search: string) => 
    setParams(prev => ({ ...prev, search, page: 1 })), []);

  const onSort = useCallback((field: string) => 
    setParams(prev => ({
      ...prev,
      sortBy: field,
      sortDescending: prev.sortBy === field ? !prev.sortDescending : true,
      page: 1
    })), []);

  const onFilterChange = useCallback((key: string, value: any) => 
    setParams(prev => ({ ...prev, [key]: value, page: 1 })), []);

  return {
    params,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSort,
    onFilterChange
  };
}
