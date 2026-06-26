import React, { useState, useRef, useEffect } from 'react';
import { useField } from 'formik';
import { ChevronDown, Search, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

const countries: Country[] = [
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
    { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
    { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
    { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
];

interface ATMPhoneInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    required?: boolean;
    className?: string;
}

const ATMPhoneInputField: React.FC<ATMPhoneInputFieldProps> = ({
    label,
    required,
    className,
    ...props
}) => {
    const [field, meta, helpers] = useField(props.name);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Find country from value or default to India
    const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
        const val = field.value || '';
        const found = countries.find(c => val.startsWith(c.dialCode));
        return found || countries[0]!;
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const isError = meta.touched && meta.error;

    // Extract the number part without the dial code for display
    const displayValue = field.value?.startsWith(selectedCountry.dialCode) 
        ? field.value.slice(selectedCountry.dialCode.length) 
        : field.value || '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.dialCode.includes(searchTerm)
    );

    const handleCountrySelect = (country: Country) => {
        const currentNumber = displayValue || '';
        setSelectedCountry(country);
        helpers.setValue(country.dialCode + currentNumber);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        // If user pastes a full number with a plus, try to detect country
        if (val.startsWith('+')) {
            const foundCountry = countries.find(c => val.startsWith(c.dialCode));
            if (foundCountry) {
                setSelectedCountry(foundCountry);
                val = val.slice(foundCountry.dialCode.length);
            }
        }
        const numericVal = val.replace(/\D/g, ''); 
        helpers.setValue(selectedCountry.dialCode + numericVal);
    };

    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
            <label 
                htmlFor={props.name} 
                className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1 px-1"
            >
                {label}
                {required && <span className="text-red-500 text-[14px] leading-none ml-0.5">*</span>}
            </label>
            
            <div className={cn(
                "relative flex items-center bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg transition-all duration-300",
                isFocused && "border-accent-500 bg-zen-surface ring-4 ring-accent-500/5 shadow-sm",
                isError && "border-rose-500/50 bg-rose-50/10 ring-rose-500/5",
                props.disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
            )}>
                {/* Country Selector */}
                <div className="relative flex shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={props.disabled}
                        className={cn(
                            "flex items-center gap-1.5 h-10 px-3 transition-colors outline-none border-r border-gray-100 dark:border-gray-800",
                            "hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-l-lg",
                            isOpen && "bg-gray-100/80 dark:bg-gray-800"
                        )}
                    >
                        <span className="text-base leading-none mb-0.5">{selectedCountry.flag}</span>
                        <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">{selectedCountry.dialCode}</span>
                        <ChevronDown size={12} className={cn("text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
                    </button>

                    {isOpen && (
                        <div className="absolute z-[100] w-64 mt-11 left-0 bg-zen-surface border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                                <Search size={14} className="text-gray-400 ml-1" />
                                <input
                                    autoFocus
                                    className="w-full text-xs outline-none py-1 bg-transparent placeholder:text-gray-400"
                                    placeholder="Search country..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                {filteredCountries.map((c) => (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => handleCountrySelect(c)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs transition-colors text-left hover:bg-gray-50 dark:hover:bg-gray-900",
                                            selectedCountry.code === c.code ? "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 font-semibold" : "text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{c.flag}</span>
                                            <span className="truncate">{c.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-gray-400 font-medium">{c.dialCode}</span>
                                            {selectedCountry.code === c.code && <Check size={14} className="text-accent-500" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ATMTextField Field */}
                <input
                    {...props}
                    type="text"
                    id={props.name}
                    value={displayValue}
                    onChange={handleNumberChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false);
                        field.onBlur(e);
                    }}
                    className={cn(
                        "w-full h-10 px-3.5 bg-transparent text-sm font-medium outline-none",
                        "placeholder:text-gray-400 placeholder:font-normal",
                        props.disabled && "cursor-not-allowed"
                    )}
                />
            </div>

            {isError && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 px-1 animate-in fade-in slide-in-from-top-1">
                    {meta.error}
                </p>
            )}
        </div>
    );
};

export default ATMPhoneInputField;
