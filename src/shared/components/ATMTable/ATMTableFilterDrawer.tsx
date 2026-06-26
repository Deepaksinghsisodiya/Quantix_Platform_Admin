import React from 'react';
import { X, RotateCcw, Filter, Search, ChevronRight } from 'lucide-react';
import { ATMButton } from '../../ui/ATMButton';
import { ATMSelectField } from '../../ui/ATMSelectField';
import { ATMTextField } from '../../ui/ATMTextField';
import { ATMSwitch } from '../../ui/ATMSwitch';
import clsx from 'clsx';

export interface FilterOption {
  value: any;
  label: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'switch';
  options?: FilterOption[];
  placeholder?: string;
  description?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fields: FilterFieldConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
  title?: string;
}

export const ATMTableFilterDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  fields,
  values,
  onChange,
  onReset,
  title = 'Filter Records',
}) => {
  const activeFiltersCount = Object.values(values).filter(v => v !== null && v !== '' && v !== undefined && v !== false && v !== 'all').length;

  return (
    <>
      {/* 🎭 Premium Glass Backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-all duration-500 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* 🏛️ The Pro Drawer */}
      <div 
        className={clsx(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-zen-surface z-[101] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-l border-slate-100 dark:border-gray-800",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ✨ Modern Header */}
        <div className="relative px-8 py-7 border-b border-slate-100 dark:border-gray-800 flex-shrink-0 bg-zen-surface">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-accent-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent-100 rotate-3 hover:rotate-0 transition-transform duration-300">
                 <Filter size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[15px] font-black text-slate-900 dark:text-gray-100 uppercase tracking-[0.05em]">{title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Configuration</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="group p-2.5 hover:bg-slate-50 dark:hover:bg-gray-900 rounded-2xl transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-gray-800"
            >
              <X size={20} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>
        </div>

        {/* 📋 Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 scrollbar-none bg-slate-50/30 dark:bg-gray-900/10">
          {fields.map((field, index) => (
            <div 
              key={field.key} 
              className={clsx(
                "space-y-4 transition-all duration-700 delay-[100ms]",
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: `${index * 50 + 100}ms` }}
            >
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {field.label}
                </label>
                {values[field.key] && values[field.key] !== 'all' && (
                   <span className="w-1.5 h-1.5 bg-accent-500 rounded-full" />
                )}
              </div>
              
              <div className="relative group">
                {field.type === 'select' && (
                  <div className="relative">
                    <ATMSelectField
                      name={field.key}
                      options={field.options || []}
                      value={values[field.key]}
                      onChange={(val: any) => onChange(field.key, val)}
                      placeholder={field.placeholder || `ATMSelect ${field.label}...`}
                      className="!gap-0"
                    />
                  </div>
                )}

                {field.type === 'text' && (
                  <div className="relative">
                     <ATMTextField
                        name={field.key}
                        value={values[field.key] || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(field.key, e.target.value)}
                        placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
                        className="!gap-0 pl-11 h-12 bg-zen-surface border-slate-200 dark:border-gray-800 focus:border-accent-500 transition-all rounded-xl"
                     />
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent-500 transition-colors" size={16} strokeWidth={2.5} />
                  </div>
                )}

                {field.type === 'switch' && (
                  <div className={clsx(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                    values[field.key] ? "bg-accent-50/50 dark:bg-accent-950/20 border-accent-100 dark:border-accent-900/30" : "bg-zen-surface border-slate-100 dark:border-gray-800"
                  )}>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-slate-700 dark:text-gray-200 tracking-tight">{field.label}</span>
                        <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider">Toggle State</span>
                      </div>
                      <ATMSwitch
                        name={field.key}
                        checked={values[field.key] || false}
                        onChange={(val: boolean) => onChange(field.key, val)}
                      />
                  </div>
                )}
              </div>
              
              {field.description && (
                <p className="px-1 text-[9px] text-slate-400 font-medium leading-relaxed italic">
                  * {field.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 🛠️ Dynamic Footer */}
        <div className="p-8 bg-zen-surface border-t border-slate-100 dark:border-gray-800 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] space-y-5">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                   Applied Filters
                </span>
                <span className="text-[10px] text-accent-600 font-bold">
                   {activeFiltersCount} Parameters Active
                </span>
              </div>
              
              {activeFiltersCount > 0 && (
                <button 
                  onClick={onReset}
                  className="group flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300 active:scale-95 border border-rose-100/50 dark:border-rose-900/30"
                >
                  <RotateCcw size={12} className="group-hover:-rotate-180 transition-transform duration-500" />
                  Reset
                </button>
              )}
           </div>
           
           <ATMButton 
              onClick={onClose}
              fullWidth
              size="lg"
              className="h-14 rounded-2xl bg-accent-600 hover:bg-accent-700 text-white shadow-[0_15px_30px_-10px_rgba(79,70,229,0.3)] transition-all duration-300 font-black uppercase tracking-[0.1em] text-xs flex items-center justify-center gap-2 group"
           >
              <span>Verify & Apply</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
           </ATMButton>
        </div>
      </div>
    </>
  );
};
