import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export interface TableParams {
    page: number;
    pageSize: number;
    search: string;
    sortBy?: string;
    sortDesc?: boolean;
    [key: string]: any;
}

export function useTableData<T>(
    queryHook: any, 
    initialParams: Partial<TableParams> = {}
) {
    const [params, setParams] = useState<TableParams>({
        page: 1,
        pageSize: 10,
        search: '',
        sortBy: undefined,
        sortDesc: true,
        ...initialParams
    });

    // 🧪 Debounce search to prevent excessive API calls
    const debouncedSearch = useDebounce(params.search, 500);

    // 🧪 Memoize and Clean Query Params
    const queryParams = useMemo(() => {
        const cleaned: Record<string, any> = {
            ...params,
            search: debouncedSearch
        };

        // 🧹 Strip out 'all', empty strings, null, and undefined
        // Except for core pagination which should always be present
        Object.keys(cleaned).forEach(key => {
            const val = cleaned[key];
            if (val === 'all' || val === '' || val === null || val === undefined) {
                // Keep search even if empty to let backend handle default
                if (key !== 'search' && key !== 'page' && key !== 'pageSize') {
                    delete cleaned[key];
                }
            }
        });

        return cleaned;
    }, [params, debouncedSearch]);

    const { data, isLoading, isFetching, error, refetch } = queryHook(queryParams);

    // 🧪 Smart data detection (handle different API response structures)
    const items = useMemo(() => {
        if (!data) return [] as T[];
        
        // Check nesting (sometimes response is { success: true, data: { items: [], totalCount: 0 } })
        const rawData = data.data || data;
        
        if (Array.isArray(rawData)) return rawData as T[];
        if (rawData.items && Array.isArray(rawData.items)) return rawData.items as T[];
        
        // Final fallback
        if (Array.isArray(data)) return data as T[];
        return [] as T[];
    }, [data]);

    const totalCount = useMemo(() => {
        if (!data) return 0;
        const rawData = data.data || data;
        return rawData.totalCount ?? rawData.total ?? items.length;
    }, [data, items]);

    const onPageChange = useCallback((page: number) => {
        setParams(prev => ({ ...prev, page }));
    }, []);

    const onPageSizeChange = useCallback((pageSize: number) => {
        setParams(prev => ({ ...prev, pageSize, page: 1 }));
    }, []);

    const onSearchChange = useCallback((search: string) => {
        setParams(prev => ({ ...prev, search, page: 1 }));
    }, []);

    const onSort = useCallback((field: string) => {
        setParams(prev => ({
            ...prev,
            sortBy: field,
            sortDesc: prev.sortBy === field ? !prev.sortDesc : true,
            page: 1
        }));
    }, []);

    const onFilterChange = useCallback((key: string, value: any) => {
        setParams(prev => ({ ...prev, [key]: value, page: 1 }));
    }, []);

    const onResetFilters = useCallback(() => {
        setParams({
            page: 1,
            pageSize: 10,
            search: '',
            sortBy: undefined,
            sortDesc: true,
            ...initialParams
        });
    }, [initialParams]);

    return {
        // Data states
        items,
        totalCount,
        isLoading,
        isFetching,
        error,
        
        // Control states
        params,
        
        // Handlers
        onPageChange,
        onPageSizeChange,
        onSearchChange,
        onSort,
        onFilterChange,
        onResetFilters,
        refetch
    };
}
