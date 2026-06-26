import React from 'react';
import { X } from 'lucide-react';

interface Props { label: string; value: string; onRemove: () => void; }

export const ATMFilterChip: React.FC<Props> = ({ label, value, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-accent-50 text-accent-700 text-xs font-medium px-2.5 py-1 rounded-full border border-accent-100">
    <span className="text-accent-400">{label}:</span> {value}
    <button onClick={onRemove} className="hover:text-red-500 ml-0.5"><X size={12} /></button>
  </span>
);

export default ATMFilterChip;
