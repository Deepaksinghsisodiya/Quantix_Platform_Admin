import React, { useState, useRef, useEffect } from 'react';
import { useField, useFormikContext } from 'formik';
import { Calendar, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parse, isValid } from 'date-fns';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ATMDateTimePickerProps {
    label: string;
    name: string;
    required?: boolean;
    className?: string;
    placeholder?: string;
}

const ATMDateTimePicker: React.FC<ATMDateTimePickerProps> = ({
    label,
    name,
    required,
    className,
    placeholder = "ATMSelect Date & Time"
}) => {
    const [field, meta] = useField(name);
    const { setFieldValue } = useFormikContext();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const isError = meta.touched && meta.error;

    // Parse current value
    const currentValue = field.value ? new Date(field.value) : null;
    const displayValue = currentValue && isValid(currentValue)
        ? format(currentValue, 'MMM dd, yyyy — hh:mm a')
        : '';

    // Local state for the picker
    const [tempDate, setTempDate] = useState<string>(
        currentValue && isValid(currentValue) ? format(currentValue, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    );
    const [tempHour, setTempHour] = useState<string>(
        currentValue && isValid(currentValue) ? format(currentValue, 'hh') : '09'
    );
    const [tempMinute, setTempMinute] = useState<string>(
        currentValue && isValid(currentValue) ? format(currentValue, 'mm') : '00'
    );
    const [tempAmPm, setTempAmPm] = useState<'AM' | 'PM'>(
        currentValue && isValid(currentValue) ? (format(currentValue, 'a') as 'AM' | 'PM') : 'AM'
    );

    // Sync temp state when value changes externally
    useEffect(() => {
        if (field.value && isValid(new Date(field.value))) {
            const d = new Date(field.value);
            setTempDate(format(d, 'yyyy-MM-dd'));
            setTempHour(format(d, 'hh'));
            setTempMinute(format(d, 'mm'));
            setTempAmPm(format(d, 'a') as 'AM' | 'PM');
        }
    }, [field.value]);

    const handleApply = () => {
        const timeStr = `${tempHour}:${tempMinute} ${tempAmPm}`;
        const combinedStr = `${tempDate} ${timeStr}`;
        const parsedDate = parse(combinedStr, 'yyyy-MM-dd hh:mm a', new Date());

        if (isValid(parsedDate)) {
            setFieldValue(name, parsedDate.toISOString().slice(0, 16));
        }
        setIsOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    return (
        <div className={cn("flex flex-col gap-2 w-full relative", className)} ref={containerRef}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
                {label}
                {required && <span className="text-red-500 text-[14px] leading-none">*</span>}
            </label>

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-[52px] px-5 bg-white border-2 border-slate-100 rounded-[1.25rem] flex items-center justify-between cursor-pointer transition-all duration-300 shadow-sm",
                    "hover:border-accent-200 focus-within:border-accent-600",
                    isOpen && "border-accent-600 ring-4 ring-accent-600/5",
                    isError && "border-red-500/30 bg-red-50/5"
                )}
            >
                <div className="flex items-center gap-3">
                    <Calendar size={18} className={cn("text-slate-400", isOpen && "text-accent-600")} />
                    <span className={cn("text-sm font-bold", !displayValue ? "text-slate-300" : "text-slate-900")}>
                        {displayValue || placeholder}
                    </span>
                </div>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-[100] w-[340px] bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-6">
                        {/* Date Picker Section */}
                        <div className="space-y-3">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ATMSelect Date</span>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={tempDate}
                                    onChange={(e) => setTempDate(e.target.value)}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent-500"
                                />
                            </div>
                        </div>

                        {/* Time Picker Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Hours</span>
                                <div className="grid grid-cols-3 gap-1">
                                    {hours.map(h => (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => setTempHour(h)}
                                            className={cn(
                                                "h-8 rounded-lg text-[10px] font-bold transition-all",
                                                tempHour === h ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                            )}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Minutes</span>
                                <div className="grid grid-cols-3 gap-1">
                                    {minutes.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setTempMinute(m)}
                                            className={cn(
                                                "h-8 rounded-lg text-[10px] font-bold transition-all",
                                                tempMinute === m ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* AM/PM Toggle */}
                        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
                            {(['AM', 'PM'] as const).map(mode => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setTempAmPm(mode)}
                                    className={cn(
                                        "flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        tempAmPm === mode ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-slate-50 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className="flex-1 h-12 bg-accent-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-600/10 hover:bg-accent-700 active:scale-95 transition-all"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isError && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-tight px-1 mt-1">
                    {meta.error}
                </p>
            )}
        </div>
    );
};

export default ATMDateTimePicker;
