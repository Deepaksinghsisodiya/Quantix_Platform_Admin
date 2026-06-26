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
    disabled?: boolean;
}

interface ATMSelectFieldProps {
    label: string;
    name: string;
    options: Option[];
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    loading?: boolean;
    className?: string;
    onSearchChange?: (val: string) => void;
    isError?: boolean;
    hint?: string;
}

const ATMSelectField: React.FC<ATMSelectFieldProps> = ({
    label,
    name,
    options,
    required,
    placeholder = 'ATMSelect option',
    disabled,
    searchable = true,
    clearable = true,
    loading,
    className,
    onSearchChange,
    isError: externalError,
    hint,
}) => {
    const [field, meta, helpers] = useField(name);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const isError = externalError ?? (meta.touched && meta.error);
    const selectedOption = options.find((opt) => opt.value === field.value);

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

    const handleSelect = (option: Option) => {
        helpers.setValue(option.value);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        helpers.setValue('');
        setSearchTerm('');
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
            <label 
                htmlFor={name} 
                className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1 px-1"
            >
                {label}
                {required && <span className="text-red-500 text-[14px] leading-none ml-0.5">*</span>}
            </label>

            <div className="relative group">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={handleToggle}
                    className={cn(
                        "w-full h-10 px-3.5 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium transition-all duration-300 outline-none text-left",
                        "hover:border-accent-300 dark:hover:border-accent-700/50 focus:border-accent-500 focus:bg-zen-surface focus:ring-4 focus:ring-accent-500/5",
                        isOpen && "border-accent-500 bg-zen-surface ring-4 ring-accent-500/5",
                        isError && "border-rose-500/50 bg-rose-50/10",
                        disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                    )}
                >
                    <span className={cn(
                        "truncate flex items-center gap-2",
                        !selectedOption && "text-gray-400 font-normal"
                    )}>
                        {selectedOption?.icon}
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    
                    <div className="flex items-center gap-2">
                        {clearable && field.value && !disabled && (
                            <X
                                size={14}
                                className="text-gray-400 hover:text-rose-500 transition-colors"
                                onClick={handleClear}
                            />
                        )}
                        <ChevronDown
                            size={16}
                            className={cn(
                                "text-gray-400 transition-transform duration-300",
                                isOpen && "rotate-180 text-accent-500"
                            )}
                        />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute z-[100] w-full mt-1.5 bg-zen-surface border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {searchable && (
                            <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                                <Search size={14} className="text-gray-400 ml-1" />
                                <input
                                    autoFocus
                                    className="w-full text-xs outline-none py-1 bg-transparent placeholder:text-gray-400"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        onSearchChange?.(e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}

                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                            {loading ? (
                                <div className="px-3 py-4 text-[11px] font-medium text-gray-400 flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                                    Loading...
                                </div>
                            ) : filteredOptions.length === 0 ? (
                                <div className="px-3 py-6 text-[11px] text-gray-400 text-center italic">
                                    No results found
                                </div>
                            ) : (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        disabled={opt.disabled}
                                        onClick={() => handleSelect(opt)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors text-left",
                                            opt.disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-900",
                                            field.value === opt.value ? "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-semibold" : "text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                            <span className="truncate">{opt.label}</span>
                                        </div>
                                        {field.value === opt.value && <Check size={14} className="text-accent-500" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {hint && !isError && (
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-555 mt-1 px-1 leading-normal">
                    {hint}
                </p>
            )}

            {isError && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 px-1 animate-in fade-in slide-in-from-top-1">
                    {meta.error}
                </p>
            )}
        </div>
    );
};

export default ATMSelectField;
