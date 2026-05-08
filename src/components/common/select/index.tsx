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

const selectBaseClass = `
    w-full px-3 py-2
    bg-[var(--background)]
    text-[var(--text-primary)]
    border border-[var(--input-border)]
    rounded-[var(--r-md)]
    text-[var(--fs-sm)]
    transition-colors duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-[var(--input-border-focus)]
    focus:border-[var(--input-border-focus)]
    disabled:bg-[var(--input-disabled)]
    disabled:cursor-not-allowed
    cursor-pointer
`;

const selectErrorClass = `border-[var(--danger)] focus:ring-[var(--danger)]`;

const labelBaseClass = `
    block
    text-[var(--fs-sm)]
    font-medium
    text-[var(--text-primary)]
    mb-1
`;

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
        defaultValue: externalValue ?? '',
    });

    const resolvedError = (errors[name]?.message as string) ?? error;

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newValue = e.target.value;
        fieldOnChange(newValue);
        externalOnChange?.(newValue);
    }

    return (
        <div className="w-full flex flex-col gap-1">
            <label className={labelBaseClass}>
                {label}
                {selectProps.required && (
                    <span className="text-[var(--danger)] ml-1">*</span>
                )}
            </label>
            <select
                {...selectProps}
                ref={ref}
                name={name}
                onBlur={onBlur}
                value={fieldValue}
                onChange={handleChange}
                className={`
                    ${selectBaseClass}
                    ${resolvedError ? selectErrorClass : ''}
                    ${className || ''}
                `}
            >
                {children}
            </select>
            {resolvedError && (
                <p className="text-[var(--fs-xs)] text-[var(--danger)] mt-0.5">
                    {resolvedError}
                </p>
            )}
        </div>
    );
}

function SelectUnregister({ label, error, name, value, onChange, children, ...rest }: SelectProps) {
    const { className, ...selectProps } = rest;

    return (
        <div className="w-full flex flex-col gap-1">
            <label className={labelBaseClass}>
                {label}
                {selectProps.required && (
                    <span className="text-[var(--danger)] ml-1">*</span>
                )}
            </label>
            <select
                {...selectProps}
                name={name}
                value={value}
                onChange={e => onChange?.(e.target.value)}
                className={`
                    ${selectBaseClass}
                    ${error ? selectErrorClass : ''}
                    ${className || ''}
                `}
            >
                {children}
            </select>
            {error && (
                <p className="text-[var(--fs-xs)] text-[var(--danger)] mt-0.5">
                    {error}
                </p>
            )}
        </div>
    );
}