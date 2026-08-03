"use client"
import { InputRegister, InputRegisterProps } from "./input-register";
import { twMerge } from "tailwind-merge";
import { IdCard } from "lucide-react";
import { maskCPF } from "@/utils/masks/maskCPF";

export type InputCPFProps = Omit<InputRegisterProps, "label" | "name"> & {
    label?: string,
    name?: string,
}

export function InputCPF({label="CPF", name='cpf', placeholder, className, type='text', autoComplete='off', ...props}: InputCPFProps){


    return(
            <InputRegister
                {...props}
                type={type}
                autoComplete={autoComplete}
                label={label}
                name={name}
                placeholder={placeholder || "000.000.000-00"}
                className={twMerge(
                    `pl-10`,
                    className
                )}
                mask={maskCPF}
            >
                <IdCard size={25} className="absolute left-2.5 text-j-blue-800"/>
            </InputRegister>

    );
}

export default InputCPF;