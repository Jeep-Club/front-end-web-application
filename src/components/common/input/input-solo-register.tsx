'use client';

import { useFormContext, useController } from 'react-hook-form';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'value' | 'onChange' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    mask?: (value: string) => string;
}

interface BaseInputProps extends InputProps {
    register?: boolean;
}

const inputBaseClass = `
    w-full px-3 py-2.5
    bg-white
    text-[#1c1c1c]
    border border-[#d0d0d0]
    rounded-md
    text-[0.875rem]
    placeholder:text-[#858585]
    transition-colors duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-[#3f72a0]/30
    focus:border-[#3f72a0]
    disabled:bg-[#efefef]
    disabled:cursor-not-allowed
`;

const inputErrorClass = `border-[#ec3538] focus:ring-[#ec3538]/30 focus:border-[#ec3538]`;

const labelBaseClass = `
    block
    text-[0.875rem]
    font-medium
    text-[#1c1c1c]
    mb-1
`;

export function InputRegistro({ register = true, ...props }: BaseInputProps) {
    if (register) {
        return <InputRegister {...props} />;
    }
    return <InputUnregister {...props} />;
}

function InputRegister({ label, error, name, value: externalValue, onChange: externalOnChange, mask, ...rest }: InputProps) {
    const { className, ...inputProps } = rest;

    const { control, formState: { errors } } = useFormContext();

    const {
        field: { value: fieldValue, onChange: fieldOnChange, onBlur, ref }
    } = useController({
        name,
        control,
        defaultValue: externalValue ?? '',
    });

    const resolvedError = (errors[name]?.message as string) ?? error;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        let newValue = e.target.value;
        if (mask) newValue = mask(newValue);
        fieldOnChange(newValue);
        externalOnChange?.(newValue);
    }

    return (
        <div className="w-full flex flex-col gap-1">
            <label className={labelBaseClass}>
                {label}
                {inputProps.required && (
                    <span className="text-[#ec3538] ml-1">*</span>
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
                <p className="text-[0.75rem] text-[#ec3538] mt-0.5">
                    {resolvedError}
                </p>
            )}
        </div>
    );
}

function InputUnregister({ label, error, name, value, onChange, mask, ...rest }: InputProps) {
    const { className, ...inputProps } = rest;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        let newValue = e.target.value;
        if (mask) newValue = mask(newValue);
        onChange?.(newValue);
    }

    return (
        <div className="w-full flex flex-col gap-1">
            <label className={labelBaseClass}>
                {label}
                {inputProps.required && (
                    <span className="text-[#ec3538] ml-1">*</span>
                )}
            </label>
            <input
                {...inputProps}
                name={name}
                value={value}
                onChange={handleChange}
                className={`
                    ${inputBaseClass}
                    ${error ? inputErrorClass : ''}
                    ${className || ''}
                `}
            />
            {error && (
                <p className="text-[0.75rem] text-[#ec3538] mt-0.5">
                    {error}
                </p>
            )}
        </div>
    );
}