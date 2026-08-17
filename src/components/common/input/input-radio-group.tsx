'use client';

import { useFormContext, useController } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export interface RadioOption {
    label: string;
    value: string;
}

export interface BaseRadioGroupProps {
    name: string;
    options: RadioOption[];
    className?: string;
    optionClassName?: string;
}

// ---------------------------------------------------------------------------
// VERSÃO BASE (Sem React Hook Form - para usar com useState comum)
// ---------------------------------------------------------------------------
interface InputRadioGroupBaseProps extends BaseRadioGroupProps {
    value?: string;
    onChange?: (value: string) => void;
}

export function InputRadioGroupBase({ name, options, value, onChange, className, optionClassName }: InputRadioGroupBaseProps) {
    return (
        <div className={twMerge("flex flex-wrap items-center gap-4", className)}>
            {options.map((opt) => (
                <label key={opt.value} className={twMerge("flex cursor-pointer items-center gap-2", optionClassName)}>
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={(e) => onChange?.(e.target.value)}
                        className="peer sr-only"
                    />
                    {/* Estilo baseado no seu InputCheckbox, mas arredondado (Radio) */}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-j-transparent-white bg-input-bg transition-colors peer-checked:border-j-yellow-400 peer-focus-visible:outline-2 peer-focus-visible:outline-j-yellow-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-j-blue-800 opacity-0 transition-opacity peer-checked:opacity-100" />
                    </span>
                    <span className="text-sm font-medium text-j-white">{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// VERSÃO REGISTER (Com React Hook Form)
// ---------------------------------------------------------------------------
interface InputRadioGroupRegisterProps extends BaseRadioGroupProps {
    defaultValue?: string;
}

export function InputRadioGroupRegister({ name, options, className, optionClassName, defaultValue }: InputRadioGroupRegisterProps) {
    const { control } = useFormContext();
    const {
        field: { value, onChange, onBlur, ref }
    } = useController({ name, control, defaultValue });

    return (
        <div className={twMerge("flex flex-wrap items-center gap-4", className)} ref={ref}>
            {options.map((opt) => (
                <label key={opt.value} className={twMerge("flex cursor-pointer items-center gap-2", optionClassName)}>
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange(opt.value)}
                        onBlur={onBlur}
                        className="peer sr-only"
                    />
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-j-transparent-white bg-input-bg transition-colors peer-checked:border-j-yellow-400 peer-focus-visible:outline-2 peer-focus-visible:outline-j-yellow-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-j-blue-800 opacity-0 transition-opacity peer-checked:opacity-100" />
                    </span>
                    <span className="text-sm font-medium text-j-white">{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// WRAPPER PRINCIPAL
// ---------------------------------------------------------------------------
type InputRadioGroupProps = (InputRadioGroupBaseProps | InputRadioGroupRegisterProps) & {
    register?: boolean;
};

export function InputRadioGroup({ register = true, ...props }: InputRadioGroupProps) {
    if (register) {
        return <InputRadioGroupRegister {...(props as InputRadioGroupRegisterProps)} />;
    }
    return <InputRadioGroupBase {...(props as InputRadioGroupBaseProps)} />;
}