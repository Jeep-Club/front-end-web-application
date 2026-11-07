'use client';

import { useFormContext, useController } from "react-hook-form";
import { Check } from "lucide-react";
import { twMerge } from "tailwind-merge";
import type { InputVariant } from "./input";

export interface InputCheckboxProps {
    label: string;
    name: string;
    value?: boolean;
    className?: string;
    required?: boolean;
    variant?: InputVariant;
}

export function InputCheckbox({ label, name, value, className, required = false, variant = "white" }: InputCheckboxProps) {
    const { control } = useFormContext();
    const {
        field: { value: fieldValue, onChange, onBlur, ref }
    } = useController({ name, control, defaultValue: value ?? false });

    return (
        <label className={twMerge("flex w-full cursor-pointer items-center gap-3", className)}>
            <input
                ref={ref}
                type="checkbox"
                name={name}
                required={required}
                aria-required={required}
                checked={!!fieldValue}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={onBlur}
                className="peer sr-only"
            />
            <span className={twMerge("flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-transparent transition-colors peer-checked:border-j-yellow-400 peer-checked:bg-j-yellow-400 peer-checked:text-j-blue-800 peer-focus-visible:outline-2 peer-focus-visible:outline-j-blue-500", variant === "white" ? "border-j-gray-300 bg-j-white" : "border-j-gray-400 bg-input-bg")}>
                <Check size={14} strokeWidth={3} />
            </span>
            <span className="text-sm font-medium text-j-gray-700">{label}{required && <span className="ml-1 text-j-red-500" aria-hidden="true">*</span>}</span>
        </label>
    );
}

export default InputCheckbox;
