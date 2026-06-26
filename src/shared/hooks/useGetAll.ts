import { useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * useGetAll - Optimized data fetching hook.
 * Only triggers API calls when non-search params change OR when search is debounced.
 */
export function useGetAll<T>(
    queryHook: any, 
    params: any = {}
) {
    const { search, ...otherParams } = params;
    
    // 🧪 Debounce the search string
    const debouncedSearch = useDebounce(search, 500);

    // 🧪 Create memoized query params to prevent unnecessary re-renders
    const queryParams = useMemo(() => {
        const p = {
            ...otherParams,
            search: debouncedSearch
        };

        return p;
    }, [
        JSON.stringify(otherParams), 
        debouncedSearch             
    ]);


    const { data, isLoading, isFetching, error, refetch } = queryHook(queryParams);

    const items = useMemo(() => {
        if (!data) return [] as T[];
        const rawData = data.data || data;
        if (Array.isArray(rawData)) return rawData as T[];
        if (rawData.items && Array.isArray(rawData.items)) return rawData.items as T[];
        return [] as T[];
    }, [data]);

    const totalCount = useMemo(() => {
        if (!data) return 0;
        const rawData = data.data || data;
        return rawData.totalCount ?? rawData.total ?? items.length;
    }, [data, items]);

    return {
        items,
        totalCount,
        isLoading,
        isFetching,
        error,
        refetch
    };
}
