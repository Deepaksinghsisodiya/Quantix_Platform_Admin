import React from 'react';
import { useField } from 'formik';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ATMSwitchFieldProps {
    label: string;
    name: string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

const ATMSwitchField: React.FC<ATMSwitchFieldProps> = ({
    label,
    name,
    description,
    required,
    disabled,
    className,
}) => {
    const [field, , helpers] = useField(name);
    const isChecked = !!field.value;

    return (
        <div className={cn(
            "group flex items-center justify-between gap-6 p-5 bg-zen-card border border-gray-200 dark:border-gray-800 rounded-[1.5rem] transition-all duration-500 hover:shadow-xl hover:shadow-accent-500/5 hover:border-accent-200 dark:hover:border-accent-800",
            isChecked && "border-accent-100 bg-accent-50/10 dark:bg-accent-500/5",
            className
        )}>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.15em]">{label}</span>
                    {required && <span className="w-1 h-1 rounded-full bg-red-500" />}
                </div>
                {description ? (
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{description}</p>
                ) : (
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                        isChecked ? "text-accent-600 dark:text-accent-400" : "text-gray-400"
                    )}>
                        {isChecked ? 'Active' : 'Inactive'}
                    </p>
                )}
            </div>
            
            <label className={cn(
                "relative inline-flex items-center cursor-pointer select-none",
                disabled && "opacity-50 cursor-not-allowed"
            )}>
                <input 
                    type="checkbox" 
                    {...field} 
                    className="sr-only peer" 
                    checked={isChecked}
                    onChange={(e) => helpers.setValue(e.target.checked)}
                    disabled={disabled}
                />
                <div className={cn(
                    "w-14 h-8 bg-gray-200 dark:bg-gray-800 rounded-full peer transition-all duration-500 ease-in-out",
                    "peer-focus:ring-4 peer-focus:ring-accent-500/10",
                    "after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all after:duration-500 after:shadow-lg after:shadow-black/10 after:z-10",
                    "peer-checked:after:translate-x-6 peer-checked:bg-accent-600 dark:peer-checked:bg-accent-500",
                    "before:content-[''] before:absolute before:inset-0 before:rounded-full before:scale-0 before:bg-accent-500/10 before:transition-transform before:duration-500 peer-hover:before:scale-100"
                )}></div>
            </label>
        </div>
    );
};

export default ATMSwitchField;
