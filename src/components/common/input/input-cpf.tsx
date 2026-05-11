"use client"
import { InputRegister, InputRegisterProps } from "./input-register";
import { twMerge } from "tailwind-merge";
import { IdCard } from "lucide-react";
import { maskCPF } from "@/utils/masks/maskCPF";

export type InputCPFProps = Omit<InputRegisterProps, "label" | "name"> & {
    label?: string,
}

export function InputCPF({label="CPF", placeholder, className, type='text'}: InputCPFProps){
    
    
    return(
            <InputRegister 
                type={type}
                label={label} 
                name="cpf" 
                placeholder={placeholder || "000.000.000-00"}
                className={twMerge(
                    `pl-10`,
                    className
                )}
                mask={maskCPF}
            >
                <IdCard size={25} className="absolute left-2.5 text-j-transparent-white"/>
            </InputRegister>

    );
}

export default InputCPF;