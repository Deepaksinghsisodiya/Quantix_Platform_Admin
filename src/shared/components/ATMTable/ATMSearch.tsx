import React from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

interface Props { value: string; onChange: (v: string) => void; placeholder?: string; debounce?: number; className?: string; }

export const ATMSearch: React.FC<Props> = ({ value, onChange, placeholder = 'Search...', className }) => (
  <div className={clsx('relative', className)}>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
    {value && <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
  </div>
);

export default ATMSearch;
