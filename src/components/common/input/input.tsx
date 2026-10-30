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
    /** @deprecated Compatibilidade visual; novos usos seguem os tokens de data-theme. */
    variant?: InputVariant;
}


export function Input({label, error, name, value, className, labelClassName, errorClassName, variant, type="text", children, required, id: idProp, ...props}: InputProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const isError = Boolean(error && error !== 'undefined');
    const errorId = id + '-error';
    
    return (
        <div className="w-full flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className={twMerge("text-xs md:text-sm font-bold text-j-gray-700", labelClassName)}
            >
                {label} {required ? <span aria-hidden="true" className="text-input-error-text">*</span> : null}
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
                        w-full border-2 border-input-border px-3 py-2.5 rounded-lg font-normal text-sm
                        placeholder:text-input-placeholder transition-colors duration-300
                        bg-input-bg text-input-text
                        focus:outline-2 focus:border-input-border-focus focus:outline-input-border-focus
                        disabled:bg-input-bg-disabled disabled:text-input-text-disabled disabled:cursor-not-allowed
                        `,
                        variant === "gray" && "border-transparent bg-input-legacy-bg text-input-legacy-text placeholder:text-input-legacy-text/70 px-2.5 py-2 font-light text-base",
                        isError && "border-input-border-error focus:outline-input-border-error focus:border-input-border-error",
                        className
                    )}
                />
                {children}
            </div>

            {isError ? <p id={errorId} className={twMerge("text-input-error-text text-sm", errorClassName)}>{error}</p> : null}
        </div>
    );
}

