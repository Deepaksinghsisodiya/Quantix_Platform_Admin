import { useState, useCallback, useEffect } from 'react';

export function useColumnVisibility(
  defaultColumns: string[],
  storageKey?: string
) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return defaultColumns;
        }
      }
    }
    return defaultColumns;
  });

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, storageKey]);

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key)
        ? prev.filter((col) => col !== key)
        : [...prev, key]
    );
  }, []);

  const isVisible = useCallback((key: string) => visibleColumns.includes(key), [visibleColumns]);

  const resetToDefault = useCallback(() => setVisibleColumns(defaultColumns), [defaultColumns]);

  return { visibleColumns, toggleColumn, isVisible, resetToDefault };
}
