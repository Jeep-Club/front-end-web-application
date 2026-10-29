'use client';

import { twMerge } from "tailwind-merge";
import { useId } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends Omit<React.ComponentProps<'select'>, 'name' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    labelClassName?: string;
}

export function Select({
    label,
    error,
    name,
    value,
    className,
    required,
    children,
    labelClassName,
    ...props
}: SelectProps) {
    const id = useId();
    const isError = error !== 'undefined' && error !== undefined && error !== null;

    return (
        <div className="w-full flex flex-col gap-2">
            <label
                htmlFor={id}
                className={twMerge("text-xs md:text-sm font-bold text-j-white", labelClassName)}
            >
                {label} {required ? <span className="text-j-red-200">*</span> : null}
            </label>
            <div className="w-full relative flex items-center">
                <select 
                    {...props}
                    id={id}
                    name={name}
                    value={value}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={isError ? error : undefined}
                    className={twMerge(
                        `
                        w-full border-2 border-transparent p-2.5 pr-10 rounded-lg font-light
                        transition-colors
                        duration-300
                        bg-input-bg text-input-text
                        appearance-none cursor-pointer
                        focus:outline-2 focus:border-j-yellow-400
                        focus:outline-j-yellow-400
                        disabled:bg-j-gray-200 disabled:hover:bg-j-gray-200 disabled:cursor-not-allowed
                        `,
                        `
                            ${isError ? "border-input-border-error text-input-border-error" : "border-transparent text-input-text"} 
                            ${isError ? "focus:outline-input-border-error focus:border-input-border-error" : "focus:outline-j-yellow-400 focus:border-j-yellow-400"}
                        `,
                        className
                    )}
                >
                    {children}
                </select>
                
                {/* Ícone customizado para o Select */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-j-gray-400">
                    <ChevronDown size={20} />
                </div>
            </div>

            {isError ? <p className="text-j-red-300 text-sm">{error}</p> : null}
        </div>
    );
}