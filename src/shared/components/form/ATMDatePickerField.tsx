import React from 'react';
import { useField } from 'formik';
import { Calendar } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ATMDatePickerFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    required?: boolean;
    className?: string;
}

const ATMDatePickerField: React.FC<ATMDatePickerFieldProps> = ({
    label,
    required,
    className,
    ...props
}) => {
    const [field, meta] = useField(props.name);
    const isError = meta.touched && meta.error;

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            <label 
                htmlFor={props.name} 
                className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 px-1"
            >
                {label}
                {required && <span className="text-red-500 text-[12px]">*</span>}
            </label>
            
            <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-500 transition-all duration-300 pointer-events-none">
                    <Calendar size={16} />
                </div>
                <input
                    {...field}
                    {...props}
                    type="date"
                    id={props.name}
                    className={cn(
                        "w-full h-10 pl-10 pr-3.5 bg-gray-50/30 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium transition-all duration-300 outline-none appearance-none",
                        "hover:border-accent-300 dark:hover:border-accent-700/50 focus:border-accent-500 focus:bg-zen-surface focus:ring-4 focus:ring-accent-500/5",
                        isError && "border-rose-500/50 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10",
                        props.disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
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

export default ATMDatePickerField;
