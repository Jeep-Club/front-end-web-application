'use client';

import { Input as InputBase } from "./input";
import type { InputProps } from "./input";
import { InputRegister } from "./input-register";

export type { InputProps } from "./input";

interface BaseInputProps extends InputProps {
    register?: boolean;
}


export function Input({register = true, ...props}: BaseInputProps) {
    if (register) {
        return <InputRegister {...props} />
    }
    return <InputBase {...props} />
}
