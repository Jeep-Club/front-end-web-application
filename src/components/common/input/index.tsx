'use client';

import { useFormContext, useController } from "react-hook-form";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'value' | 'onChange' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export function Input({ label, error, name, value: externalValue, onChange: externalOnChange, ...rest }: InputProps) {
    const { className, ...inputProps } = rest;

    const { control, formState: { errors } } = useFormContext();

    const {
        field: { value: fieldValue, onChange: fieldOnChange, onBlur, ref }
    } = useController({ name, control });

    const resolvedError = (errors[name]?.message as string) ?? error;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;

        fieldOnChange(newValue);         // atualiza o react-hook-form
        externalOnChange?.(newValue);    // notifica o componente pai, se passado
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                {...inputProps}
                ref={ref}
                name={name}
                onBlur={onBlur}
                defaultValue={externalValue ?? fieldValue ?? ''}
                onChange={handleChange}
                className={`bg-white text-black ${className || ''}`}
            />
            {resolvedError && (
                <p className="text-red-500 text-sm mt-1">{resolvedError}</p>
            )}
        </div>
    );
}