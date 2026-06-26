import React from 'react';
import { useField } from 'formik';
import { Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ATMCheckboxFieldProps {
    label: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    labelClassName?: string;
}

const ATMCheckboxField: React.FC<ATMCheckboxFieldProps> = ({
    label,
    name,
    required,
    disabled,
    className,
    labelClassName,
}) => {
    const [field, meta, helpers] = useField(name);
    const isChecked = !!field.value;
    const isError = meta.touched && meta.error;

    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <label className={cn(
                "group flex items-center gap-3 cursor-pointer select-none py-1",
                disabled && "opacity-50 cursor-not-allowed"
            )}>
                <div className="relative">
                    <input
                        type="checkbox"
                        {...field}
                        id={name}
                        className="sr-only"
                        disabled={disabled}
                        checked={isChecked}
                        onChange={(e) => helpers.setValue(e.target.checked)}
                    />
                    {/* Premium Checkbox Design */}
                    <div className={cn(
                        "w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center",
                        isChecked 
                            ? "bg-accent-600 border-accent-600 shadow-lg shadow-accent-600/20" 
                            : "bg-white border-slate-300 group-hover:border-accent-600",
                        isError && "border-rose-500"
                    )}>
                        {isChecked && (
                            <Check 
                                size={10} 
                                strokeWidth={4} 
                                className="text-white animate-in zoom-in duration-300" 
                            />
                        )}
                    </div>
                </div>
                <span className={cn(
                    "text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-slate-600",
                    isChecked && "text-slate-600",
                    labelClassName
                )}>
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </span>
            </label>
            {isError && (
                <p className="text-[9px] font-bold text-rose-500 mt-0.5 px-1 animate-in fade-in slide-in-from-top-1 uppercase tracking-wider">
                    {meta.error}
                </p>
            )}
        </div>
    );
};

export default ATMCheckboxField;
