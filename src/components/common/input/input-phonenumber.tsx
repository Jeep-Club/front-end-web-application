"use client"
import { InputRegister, InputRegisterProps } from "./input-register";
import { twMerge } from "tailwind-merge";
import { Phone } from "lucide-react";
import { maskPhoneNumber } from "@/utils/masks";

export type InputPhoneNumberProps = Omit<InputRegisterProps, "label" | "name"> & {
    label?: string,
    name?: string,
}

export function InputPhoneNumber({label="Telefone", name='phoneNumber', placeholder="(00) 00000-0000", className, type='tel', ...props}: InputPhoneNumberProps){
    
    
    return(
            <InputRegister 
                {...props}
                type={type}
                label={label}
                name={name}
                placeholder={placeholder}
                className={twMerge(
                    `pl-10`,
                    className
                )}
                mask={maskPhoneNumber}
            >
                <Phone size={23} className="absolute left-2.5 text-j-transparent-white"/>
            </InputRegister>

    );
}

export default InputPhoneNumber;