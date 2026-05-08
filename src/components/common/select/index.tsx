'use client';

import { useFormContext, useController } from "react-hook-form";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name' | 'value' | 'onChange' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
}

interface BaseSelectProps extends SelectProps {
    register?: boolean;
}

export function Select({ register = true, ...props }: BaseSelectProps) {
    if (register) {
        return <SelectRegister {...props} />
    }
    return <SelectUnregister {...props} />
}

function SelectRegister({ label, error, name, value: externalValue, onChange: externalOnChange, children, ...rest }: SelectProps) {
    const { className, ...selectProps } = rest;
    const { control, formState: { errors } } = useFormContext();

    const {
        field: { value: fieldValue, onChange: fieldOnChange, onBlur, ref }
    } = useController({
        name,
        control,
        defaultValue: externalValue ?? '', // <-- RHF inicializa com o valor
    });

    const resolvedError = (errors[name]?.message as string) ?? error;

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newValue = e.target.value;
        fieldOnChange(newValue);
        externalOnChange?.(newValue);
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                {...selectProps}
                ref={ref}
                name={name}
                onBlur={onBlur}
                value={fieldValue}      // controlado pelo RHF
                onChange={handleChange}
                className={`bg-white text-black ${className || ''}`}
            >
                {children}

            </select>
            {resolvedError && (
                <p className="text-red-500 text-sm mt-1">{resolvedError}</p>
            )}
        </div>
    );
}

function SelectUnregister({ label, error, name, value, onChange, children, ...rest }: SelectProps) {
    const { className, ...selectProps } = rest;
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                {...selectProps}
                name={name}
                value={value}
                onChange={e => onChange?.(e.target.value)}
                className={`bg-white text-black ${className || ''}`}
            >
                {children}
            </select>
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
}