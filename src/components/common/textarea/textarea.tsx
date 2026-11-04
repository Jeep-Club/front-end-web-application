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
    id: idProp,
    ...props
}: TextareaProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const isError = Boolean(error && error !== 'undefined');
    const errorId = `${id}-error`;

    return (
        <div className="w-full flex flex-col gap-2">
            <label
                htmlFor={id}
                className={twMerge("text-sm font-medium text-primary", labelClassName)}
            >
                {label} {required ? <span aria-hidden="true" className="text-input-error-text">*</span> : null}
            </label>
            <div className="w-full relative flex items-start">
                <textarea 
                    {...props}
                    id={id}
                    name={name}
                    value={value}
                    required={required}
                    aria-invalid={isError}
                    aria-describedby={[props['aria-describedby'], isError ? errorId : undefined].filter(Boolean).join(' ') || undefined}
                    className={twMerge(
                        `
                        w-full border-2 border-input-border p-2.5 rounded-lg font-normal text-sm
                        placeholder:text-input-placeholder
                        transition-colors
                        duration-300
                        bg-input-bg text-input-text
                        focus:outline-2 focus:border-input-border-focus focus:outline-input-border-focus
                        disabled:bg-input-bg-disabled disabled:text-input-text-disabled disabled:cursor-not-allowed
                        min-h-25 resize-y
                        `,
                        isError && "border-input-border-error focus:outline-input-border-error focus:border-input-border-error",
                        className
                    )}
                />
            </div>

            {isError ? <p id={errorId} className="text-input-error-text text-sm">{error}</p> : null}
        </div>
    );
}
