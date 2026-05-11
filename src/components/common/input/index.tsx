'use client';

import { Input as InputBase, InputProps } from "./input";
import { InputRegister } from "./input-register";

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
    return <InputBase {...props} />
}