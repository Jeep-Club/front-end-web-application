'use client';

import { useFormContext, useController } from "react-hook-form";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'value' | 'onChange' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
}

interface BaseInputProps extends InputProps {
    register?: boolean;
}


export function Input({register = true, ...props}: BaseInputProps) {
    if (register) {
        return <InputRegister {...props} />
    }
    return <InputUnregister {...props} />
}

function InputRegister({ label, error, name, value: externalValue, onChange: externalOnChange, ...rest }: InputProps) {
    const { className, ...inputProps } = rest;

    const { control, formState: { errors } } = useFormContext();

    const {
        field: { value: fieldValue, onChange: fieldOnChange, onBlur, ref }
    } = useController({ 
        name, 
        control,
        defaultValue: externalValue ?? '', // <-- RHF inicializa com o valor
    });

    const resolvedError = (errors[name]?.message as string) ?? error;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;
        fieldOnChange(newValue);
        externalOnChange?.(newValue);
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
                value={fieldValue}      // controlado pelo RHF
                onChange={handleChange}
                className={`bg-white text-black ${className || ''}`}
            />
            {resolvedError && (
                <p className="text-red-500 text-sm mt-1">{resolvedError}</p>
            )}
        </div>
    );
}

function InputUnregister({ label, error, name, value, onChange, ...rest }: InputProps) {
    const { className, ...inputProps } = rest;
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                {...inputProps}
                name={name}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className={`bg-white text-black ${className || ''}`}
            />
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
}