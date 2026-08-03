'use client';

import { useFormContext, useController } from "react-hook-form";
import { Check } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface InputCheckboxProps {
    label: string;
    name: string;
    className?: string;
}

export function InputCheckbox({ label, name, className }: InputCheckboxProps) {
    const { control } = useFormContext();
    const {
        field: { value, onChange, onBlur, ref }
    } = useController({ name, control, defaultValue: false });

    return (
        <label className={twMerge("flex w-full cursor-pointer items-center gap-3", className)}>
            <input
                ref={ref}
                type="checkbox"
                name={name}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={onBlur}
                className="peer sr-only"
            />
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-j-transparent-white bg-input-bg text-transparent transition-colors peer-checked:border-j-yellow-400 peer-checked:bg-j-yellow-400 peer-checked:text-j-blue-800 peer-focus-visible:outline-2 peer-focus-visible:outline-j-yellow-400">
                <Check size={14} strokeWidth={3} />
            </span>
            <span className="text-sm font-medium text-j-white">{label}</span>
        </label>
    );
}

export default InputCheckbox;
