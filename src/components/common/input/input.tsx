'use client';

import { twMerge } from "tailwind-merge";
import { useId } from "react";

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'name' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
}


export function Input({label, error, name, value, className, type="text", ...props}: InputProps) {
    const id = useId();
    const isError = error !== 'undefined' && error !== undefined && error !== null;
    
    return (
        <div className="w-full flex flex-col gap-2">
            <label 
                htmlFor={id}
                className="text-sm font-medium text-j-gray-300"
            >
                {label}
            </label>
            <input 
                {...props}
                id={id}
                type={type}
                name={name}
                value={value}
                className={twMerge(
                    `
                    w-full border border-transparent p-2.5 rounded-lg font-light
                    placeholder:text-j-transparent-white
                    transition-colors
                    duration-300
                    bg-input-bg text-input-text
                    focus:outline-2 focus:outline-offset-1
                    focus:outline-j-yellow-400
                    disabled:bg-j-gray-200 disabled:hover:bg-j-gray-200
                    `,
                    `
                        ${isError ? "border border-input-border-error text-input-border-error" : "border-transparent text-input-text"} 
                        ${isError ? "focus:outline-input-border-error" : "focus:outline-j-yellow-400"}
                    `,
                    className
                )}
            />

            {isError ? <p className="text-j-red-300 text-sm">{error}</p> : null}
        </div>
    );
}