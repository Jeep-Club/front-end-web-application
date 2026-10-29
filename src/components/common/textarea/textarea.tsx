'use client';

import { twMerge } from "tailwind-merge";
import { useId } from "react";

export interface TextareaProps extends Omit<React.ComponentProps<'textarea'>, 'name' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    labelClassName?: string;
}

export function Textarea({
    label,
    error,
    name,
    value,
    className,
    labelClassName,
    required,
    ...props
}: TextareaProps) {
    const id = useId();
    const isError = error !== 'undefined' && error !== undefined && error !== null;

    return (
        <div className="w-full flex flex-col gap-2">
            <label
                htmlFor={id}
                className={twMerge("text-sm font-medium text-j-gray-300", labelClassName)}
            >
                {label} {required ? <span className="text-j-red-200">*</span> : null}
            </label>
            <div className="w-full relative flex items-start">
                <textarea 
                    {...props}
                    id={id}
                    name={name}
                    value={value}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={isError ? error : undefined}
                    className={twMerge(
                        `
                        w-full border-2 border-transparent p-2.5 rounded-lg font-light
                        placeholder:text-j-transparent-white
                        transition-colors
                        duration-300
                        bg-input-bg text-input-text
                        focus:outline-2 focus:border-j-yellow-400
                        focus:outline-j-yellow-400
                        disabled:bg-j-gray-200 disabled:hover:bg-j-gray-200
                        min-h-25 resize-y
                        `,
                        `
                            ${isError ? "border-input-border-error text-input-border-error" : "border-transparent text-input-text"} 
                            ${isError ? "focus:outline-input-border-error focus:border-input-border-error" : "focus:outline-j-yellow-400 focus:border-j-yellow-400"}
                        `,
                        className
                    )}
                />
            </div>

            {isError ? <p className="text-j-red-300 text-sm">{error}</p> : null}
        </div>
    );
}