'use client';

import { Input as InputBase, InputProps } from "./input";
import { InputRegister } from "./input-register";

interface BaseInputProps extends InputProps {
    register?: boolean;
}


export function Input({register = true, ...props}: BaseInputProps) {
    if (register) {
        return <InputRegister {...props} />
    }
    return <InputBase {...props} />
}