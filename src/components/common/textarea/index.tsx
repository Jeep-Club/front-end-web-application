'use client';

import { useFormContext, useController } from "react-hook-form";

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'value' | 'onChange' | 'defaultValue'> {
    label: string;
    name: string;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
}

interface BaseTextareaProps extends TextareaProps {
    register?: boolean;
}

export function Textarea({ register = true, ...props }: BaseTextareaProps) {
    if (register) {
        return <TextareaRegister {...props} />
    }
    return <TextareaUnregister {...props} />
}

function TextareaRegister({ label, error, name, value: externalValue, onChange: externalOnChange, ...rest }: TextareaProps) {
    const { className, ...textareaProps } = rest;

    const { control, formState: { errors } } = useFormContext();
    const {
        field: { value: fieldValue, onChange: fieldOnChange, onBlur, ref }
    } = useController({
        name,
        control,
        defaultValue: externalValue ?? '', // <-- RHF inicializa com o valor
    });
    const resolvedError = (errors[name]?.message as string) ?? error;

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const newValue = e.target.value;
        fieldOnChange(newValue);
        externalOnChange?.(newValue);
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <textarea
                {...textareaProps}
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

function TextareaUnregister({ label, error, name, value, onChange, ...rest }: TextareaProps) {
    const { className, ...textareaProps } = rest;
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <textarea
                {...textareaProps}
                name={name}
                value={value}
                onChange={e => onChange?.(e.target.value)}
                className={`bg-white text-black ${className || ''}`}
            />
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
}