import React from 'react';
import { useField } from 'formik';
import { Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ATMTimePickerFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    required?: boolean;
    className?: string;
}

const ATMTimePickerField: React.FC<ATMTimePickerFieldProps> = ({
    label,
    required,
    className,
    ...props
}) => {
    const [field, meta] = useField(props.name);
    const isError = meta.touched && meta.error;

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            <label 
                htmlFor={props.name} 
                className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1"
            >
                {label}
                {required && <span className="text-red-500 animate-pulse text-[14px] leading-none">*</span>}
            </label>
            
            <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-500 transition-all duration-300 pointer-events-none">
                    <Clock size={18} strokeWidth={2.5} />
                </div>
                <input
                    {...field}
                    {...props}
                    type="time"
                    id={props.name}
                    className={cn(
                        "w-full h-[52px] pl-12 pr-5 bg-zen-surface border-2 border-gray-100 rounded-[1.25rem] text-sm font-bold transition-all duration-300 outline-none shadow-sm",
                        "hover:border-accent-100 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/5 focus:shadow-md",
                        isError && "border-red-500/50 bg-red-50/10 focus:border-red-500 focus:ring-red-500/10",
                        props.disabled && "opacity-50 cursor-not-allowed bg-gray-50 grayscale"
                    )}
                />
            </div>

            {isError && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-tight px-1 animate-in fade-in slide-in-from-top-1">
                    {meta.error}
                </p>
            )}
        </div>
    );
};

export default ATMTimePickerField;
