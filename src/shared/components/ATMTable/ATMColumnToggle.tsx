import React, { useState, useRef, useEffect } from 'react';
import { Columns3 } from 'lucide-react';

interface Column { key: string; header: string; visible: boolean; }
interface Props { columns: Column[]; onChange: (cols: Column[]) => void; }

export const ATMColumnToggle: React.FC<Props> = ({ columns, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (key: string) => {
    onChange(columns.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        <Columns3 size={16} /> Columns
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 w-56 bg-zen-card border border-gray-200 rounded-xl shadow-lg py-2">
          {columns.map(col => (
            <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer select-none">
              <input type="checkbox" checked={col.visible} onChange={() => toggle(col.key)} className="rounded border-gray-300 text-accent-600 focus:ring-accent-500" />
              {col.header}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ATMColumnToggle;
