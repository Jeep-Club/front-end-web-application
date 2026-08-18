'use client';

import { twMerge } from "tailwind-merge";
import { useId } from "react";

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'name' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    children?: React.ReactNode;
    labelClassName?: string;
}


export function Input({label, error, name, value, className, labelClassName, type="text", children, required, ...props}: InputProps) {
    const id = useId();
    const isError = error !== 'undefined' && error !== undefined && error !== null;
    
    return (
        <div className="w-full flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className={twMerge("text-xs md:text-sm font-bold text-j-white", labelClassName)}
            >
                {label} {required ? <span className="text-j-red-200">*</span> : null}
            </label>
            <div className="w-full relative flex items-center">
                <input
                    {...props}
                    id={id}
                    type={type}
                    name={name}
                    value={value}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={isError ? error : undefined}
                    className={twMerge(
                        `
                        w-full border-2 border-transparent py-2 px-2.5 rounded-lg font-light text-sm md:text-base
                        placeholder:text-j-transparent-white
                        transition-colors
                        duration-300
                        bg-input-bg text-input-text
                        focus:outline-2 focus:border-j-yellow-400
                        focus:outline-j-yellow-400
                        disabled:bg-j-gray-200 disabled:hover:bg-j-gray-200
                        `,
                        `
                            ${isError ? "border-input-border-error text-input-border-error" : "border-transparent text-input-text"} 
                            ${isError ? "focus:outline-input-border-error focus:border-input-border-error" : "focus:outline-j-yellow-400 focus:border-j-yellow-400"}
                        `,
                        className
                    )}
                />
                {children}
            </div>

            {isError ? <p className="text-j-red-300 text-sm">{error}</p> : null}
        </div>
    );
}

