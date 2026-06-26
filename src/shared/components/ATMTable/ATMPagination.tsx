import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  page: number; pageSize: number; totalCount: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  hidePageSize?: boolean;
}

export const ATMPagination: React.FC<Props> = ({
  page, pageSize, totalCount, onPageChange, onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100], showInfo = true, hidePageSize = false,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== 'ellipsis') pages.push('ellipsis');
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        {showInfo && <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Showing {start}–{end} of {totalCount}</span>}
        {onPageSizeChange && !hidePageSize && (
          <select value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}
            className="text-[12px] font-bold border border-slate-200 dark:border-gray-800 rounded-lg px-2.5 py-1.5 outline-none bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-300 focus:ring-4 focus:ring-accent-500/5 transition-all cursor-pointer">
            {pageSizeOptions.map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
        {pages.map((p, i) => p === 'ellipsis' ? <span key={`e${i}`} className="px-1 text-gray-400">…</span> : (
          <button key={p} onClick={() => onPageChange(p)}
            className={clsx('w-8 h-8 text-sm rounded-md transition-all', p === page ? 'bg-accent-600 text-white font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white')}>{p}</button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};

export default ATMPagination;
