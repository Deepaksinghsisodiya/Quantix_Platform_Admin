import React from 'react';
import { useField } from 'formik';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ATMTextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    name: string;
    required?: boolean;
    className?: string;
    isError?: boolean;
}

const ATMTextAreaField: React.FC<ATMTextAreaFieldProps> = ({
    label,
    required,
    className,
    isError: externalError,
    ...props
}) => {
    const [field, meta] = useField(props.name);
    const isError = externalError ?? (meta.touched && meta.error);

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            <label 
                htmlFor={props.name} 
                className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 px-1"
            >
                {label}
                {required && <span className="text-red-500 text-[12px]">*</span>}
            </label>
            
            <textarea
                {...field}
                {...props}
                id={props.name}
                className={cn(
                    "w-full px-3.5 py-2.5 bg-gray-50/30 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium transition-all duration-300 outline-none min-h-[100px] resize-none",
                    "placeholder:text-gray-400 placeholder:font-normal",
                    "hover:border-accent-300 dark:hover:border-accent-700/50 focus:border-accent-500 focus:bg-zen-surface focus:ring-4 focus:ring-accent-500/5",
                    isError && "border-rose-500/50 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10",
                    props.disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                )}
            />

            {isError && (
                <p className="text-[11px] font-semibold text-red-500 mt-1 px-1 animate-in fade-in slide-in-from-top-1">
                    {meta.error}
                </p>
            )}
        </div>
    );
};

export default ATMTextAreaField;
