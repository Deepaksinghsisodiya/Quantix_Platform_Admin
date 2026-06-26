import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelect?: boolean;
}

export const ATMPagination: React.FC<Props> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelect = true,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-zen-surface border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium order-2 sm:order-1">
        Showing <span className="text-gray-900 dark:text-gray-100 font-bold">{start}</span>–
        <span className="text-gray-900 dark:text-gray-100 font-bold">{end}</span> of 
        <span className="text-gray-900 dark:text-gray-100 font-bold ml-1">{total}</span> results
      </div>

      <div className="flex items-center gap-6 order-1 sm:order-2">
        {showPageSizeSelect && onPageSizeChange && (
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-sm font-bold text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/30 px-2 py-1 rounded-lg outline-none border border-accent-100 dark:border-accent-900/50 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-1">
            {/* Simple page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && page > 3) {
                pageNum = page - 3 + i;
                if (pageNum + (5 - i - 1) > totalPages) {
                   pageNum = totalPages - 4 + i;
                }
              }
              if (pageNum <= 0) return null;
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`
                    min-w-[32px] h-8 px-2 rounded-lg text-sm font-bold transition-all duration-200
                    ${page === pageNum 
                      ? 'bg-accent-600 text-white shadow-md shadow-accent-600/20 ring-2 ring-accent-600 ring-offset-1 dark:ring-offset-gray-900' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
