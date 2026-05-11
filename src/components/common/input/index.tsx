'use client';

import { useFormContext, useController } from 'react-hook-form';

interface InputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'name' | 'value' | 'onChange' | 'defaultValue'
> {
    label: string;
    name: string;
    error?: string;
    value?: string;

    onChange?: (value: string) => string;
}

interface BaseInputProps extends InputProps {
    register?: boolean;
}

const inputBaseClass = `
    w-full
    px-3
    py-2
    bg-[var(--background)]
    text-[var(--text-primary)]
    border
    border-[var(--input-border)]
    rounded-[var(--r-md)]
    text-[var(--fs-sm)]
    placeholder:text-[var(--text-secundary)]
    transition-colors
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-[var(--input-border-focus)]
    focus:border-[var(--input-border-focus)]
    disabled:bg-[var(--input-disabled)]
    disabled:cursor-not-allowed
`;

const inputErrorClass = `
    border-red-500
    focus:ring-red-500
    focus:border-red-500
`;

const labelBaseClass = `
    block
    text-[var(--fs-sm)]
    font-medium
    text-[var(--text-primary)]
    mb-1
`;

export function Input({
    register = true,
    ...props
}: BaseInputProps) {
    if (register) {
        return <InputRegister {...props} />;
    }

    return <InputUnregister {...props} />;
}

function InputRegister({
    label,
    error,
    name,
    value: externalValue,
    onChange: externalOnChange,
    ...rest
}: InputProps) {

    const { className, ...inputProps } = rest;

    const {
        control,
        formState: { errors }
    } = useFormContext();

    const {
        field: {
            value: fieldValue,
            onChange: fieldOnChange,
            onBlur,
            ref
        }
    } = useController({
        name,
        control,
        defaultValue: externalValue ?? '',
    });

    const resolvedError =
        (errors[name]?.message as string) ?? error;

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {

        let newValue = e.target.value;

        // Mascara
        if (externalOnChange) {
            newValue = externalOnChange(newValue);
        }

        fieldOnChange(newValue);
    }

    return (
        <div className="w-full flex flex-col gap-1">

            <label className={labelBaseClass}>
                {label}

                {inputProps.required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            <input
                {...inputProps}
                ref={ref}
                name={name}
                onBlur={onBlur}
                value={fieldValue}
                onChange={handleChange}
                className={`
                    ${inputBaseClass}
                    ${resolvedError ? inputErrorClass : ''}
                    ${className || ''}
                `}
            />

            {resolvedError && (
                <p className="text-[var(--fs-xs)] text-red-500 mt-0.5">
                    {resolvedError}
                </p>
            )}
        </div>
    );
}

function InputUnregister({
    label,
    error,
    name,
    value,
    onChange,
    ...rest
}: InputProps) {

    const { className, ...inputProps } = rest;

    return (
        <div className="w-full flex flex-col gap-1">

            <label className={labelBaseClass}>
                {label}

                {inputProps.required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}
            </label>

            <input
                {...inputProps}
                name={name}
                value={value}
                onChange={(e) => {
                    let newValue = e.target.value;

                    if (onChange) {
                        newValue = onChange(newValue);
                    }

                    onChange?.(newValue);
                }}
                className={`
                    ${inputBaseClass}
                    ${error ? inputErrorClass : ''}
                    ${className || ''}
                `}
            />

            {error && (
                <p className="text-[var(--fs-xs)] text-red-500 mt-0.5">
                    {error}
                </p>
            )}
        </div>
    );
}