'use client';

import { twMerge } from "tailwind-merge";
import { useId } from "react";

export type InputVariant = "white" | "gray";

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'name' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    children?: React.ReactNode;
    labelClassName?: string;
    errorClassName?: string;
    variant?: InputVariant;
}


export function Input({label, error, name, value, className, labelClassName, errorClassName, variant = "white", type="text", children, required, ...props}: InputProps) {
    const id = useId();
    const isError = Boolean(error && error !== 'undefined');
    const errorId = id + '-error';
    
    return (
        <div className="w-full flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className={twMerge("text-xs md:text-sm font-bold text-j-gray-700", labelClassName)}
            >
                {label} {required ? <span className="text-j-red-500">*</span> : null}
            </label>
            <div className="w-full relative flex items-center">
                <input
                    {...props}
                    id={id}
                    type={type}
                    name={name}
                    value={value}
                    required={required}
                    aria-invalid={isError}
                    aria-describedby={[props['aria-describedby'], isError ? errorId : undefined].filter(Boolean).join(' ') || undefined}
                    className={twMerge(
                        `
                        w-full border-2 border-transparent py-2 px-2.5 rounded-lg font-light text-base
                        placeholder:text-j-transparent-white
                        transition-colors
                        duration-300
                        bg-input-bg text-input-text
                        focus:outline-2 focus:border-j-yellow-400
                        focus:outline-j-yellow-400
                        disabled:bg-j-gray-200 disabled:hover:bg-j-gray-200
                        `,
                        variant === "white"
                            ? "border-j-gray-300 bg-j-white px-3 py-2.5 text-sm font-normal text-j-gray-700 placeholder:text-j-gray-500 focus:border-j-blue-500 focus:outline-j-blue-500 disabled:bg-j-gray-100 disabled:text-j-gray-500"
                            : "placeholder:text-j-white/70",
                        `
                            ${isError ? "border-j-red-500 focus:outline-j-red-500 focus:border-j-red-500" : ""}
                        `,
                        className
                    )}
                />
                {children}
            </div>

            {isError ? <p id={errorId} className={twMerge("text-j-red-500 text-sm", errorClassName)}>{error}</p> : null}
        </div>
    );
}

