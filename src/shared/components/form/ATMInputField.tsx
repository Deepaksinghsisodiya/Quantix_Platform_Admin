import React, { useState } from 'react';
import { useField } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ATMInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    required?: boolean;
    className?: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    isError?: boolean;
    hint?: string;
}

const ATMInputField: React.FC<ATMInputFieldProps> = ({
    label,
    required,
    className,
    icon,
    suffix,
    isError: externalError,
    type = 'text',
    hint,
    ...props
}) => {
    const [field, meta] = useField(props.name);
    const [showPassword, setShowPassword] = useState(false);
    const isError = externalError ?? (meta.touched && meta.error);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            <label 
                htmlFor={props.name} 
                className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1 px-1"
            >
                {label}
                {required && <span className="text-red-500 text-[14px] leading-none ml-0.5">*</span>}
            </label>
            
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-500 transition-all duration-300">
                        {icon}
                    </div>
                )}
                <input
                    {...field}
                    {...props}
                    value={field.value ?? ''}
                    type={inputType}
                    id={props.name}
                    className={cn(
                        "w-full h-10 px-3.5 bg-gray-50/30 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium transition-all duration-300 outline-none",
                        "placeholder:text-gray-400 placeholder:font-normal",
                        "hover:border-accent-300 dark:hover:border-accent-700/50 focus:border-accent-500 focus:bg-zen-surface focus:ring-4 focus:ring-accent-500/5",
                        icon && "pl-12",
                        (suffix || isPassword) && "pr-10",
                        isError && "border-rose-500/50 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10",
                        props.disabled && "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                    )}
                />
                {(suffix || isPassword) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400">
                        {isPassword ? (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1 hover:text-accent-600 transition-colors outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        ) : suffix}
                    </div>
                )}
            </div>

            {hint && !isError && (
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-550 mt-1 px-1 leading-normal">
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

export default ATMInputField;
