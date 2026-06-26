import React, { useState, useRef, useEffect } from 'react';
import { useField } from 'formik';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Option {
    value: string | number;
    label: string;
    icon?: React.ReactNode;
}

interface ATMMultiSelectFieldProps {
    label: string;
    name: string;
    options: Option[];
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

const ATMMultiSelectField: React.FC<ATMMultiSelectFieldProps> = ({
    label,
    name,
    options,
    required,
    placeholder = 'ATMSelect multiple',
    disabled,
    className,
}) => {
    const [field, meta, helpers] = useField<any[]>(name);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const isError = meta.touched && meta.error;
    const values = Array.isArray(field.value) ? field.value : [];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                helpers.setTouched(true);
            }
        }
    };

    const handleSelect = (optionValue: string | number) => {
        const newValues = values.includes(optionValue)
            ? values.filter(v => v !== optionValue)
            : [...values, optionValue];
        helpers.setValue(newValues);
    };

    const removeValue = (e: React.MouseEvent, optionValue: string | number) => {
        e.stopPropagation();
        helpers.setValue(values.filter(v => v !== optionValue));
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 px-1">
                {label}
                {required && <span className="text-red-500 text-[12px]">*</span>}
            </label>

            <div className="relative group">
                <div
                    onClick={handleToggle}
                    className={cn(
                        "w-full min-h-[40px] px-3 py-1.5 flex flex-wrap gap-1.5 items-center bg-gray-50/30 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer",
                        "hover:border-accent-300 dark:hover:border-accent-700/50 focus-within:border-accent-500 focus-within:bg-zen-surface focus-within:ring-4 focus-within:ring-accent-500/5",
                        isOpen && "border-accent-500 bg-zen-surface ring-4 ring-accent-500/5",
                        isError && "border-rose-500/50 bg-rose-50/10",
                        disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                    )}
                >
                    {values.length > 0 ? (
                        values.map(val => {
                            const opt = options.find(o => o.value === val);
                            return (
                                <div key={val} className="flex items-center gap-1.5 px-2 py-0.5 bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 rounded-md text-[11px] font-semibold border border-accent-100/50 dark:border-accent-500/20 animate-in zoom-in duration-200">
                                    {opt?.label || val}
                                    {!disabled && (
                                        <button type="button" onClick={(e) => removeValue(e, val)} className="hover:text-rose-500 transition-colors">
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <span className="text-gray-400 font-normal ml-1 text-sm">{placeholder}</span>
                    )}
                    
                    <div className="ml-auto pr-0.5">
                        <ChevronDown size={16} className={cn("text-gray-400 transition-transform duration-300", isOpen && "rotate-180 text-accent-500")} />
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-[100] w-full mt-1.5 bg-zen-surface border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                            <Search size={14} className="text-gray-400 ml-1" />
                            <input
                                autoFocus
                                className="w-full text-xs outline-none py-1 bg-transparent placeholder:text-gray-400"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-6 text-[11px] text-gray-400 text-center italic">No results found</div>
                            ) : (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors text-left",
                                            "hover:bg-gray-50 dark:hover:bg-gray-900",
                                            values.includes(opt.value) ? "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-semibold" : "text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                            <span className="truncate">{opt.label}</span>
                                        </div>
                                        {values.includes(opt.value) && <Check size={14} className="text-accent-500" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isError && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 px-1 animate-in fade-in slide-in-from-top-1">
                    {meta.error}
                </p>
            )}
        </div>
    );
};

export default ATMMultiSelectField;
