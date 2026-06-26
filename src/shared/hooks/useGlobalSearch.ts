import { useState } from 'react';
import { useDebounce } from './useDebounce';

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'employee' | 'project' | 'task' | 'leave' | 'meeting';
  url: string;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  // Placeholder — will integrate with API in future flow
  const results: GlobalSearchResult[] = [];
  const isLoading = false;

  return {
    query, setQuery,
    results,
    isLoading,
    isOpen, setIsOpen,
    debouncedQuery,
  };
}
