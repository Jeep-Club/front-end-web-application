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
        <div className="w-full flex flex-col gap-1">
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
                    w-full border p-2.5 rounded-xl font-light
                    placeholder:text-j-gray-300
                    border-j-gray-400 text-primary
                    focus:outline-2 focus:outline-offset-1 focus:border-transparent
                    focus:outline-j-yellow-300
                    disabled:bg-j-gray-200
                    `,
                    className
                )}
            />

            {isError ? <p className="text-j-red-300 text-sm">{error}</p> : null}
        </div>
    );
}