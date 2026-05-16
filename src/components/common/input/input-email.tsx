"use client"
import { InputRegister, InputRegisterProps } from "./input-register";
import { twMerge } from "tailwind-merge";
import { Mail } from "lucide-react";

export type InputEmailProps = Omit<InputRegisterProps, "label" | "name"> & {
    label?: string,
    name?: string,
}

export function InputEmail({label="Email", name='email;', placeholder="exemplo@email.com", className, ...props}: InputEmailProps){
    
    
    return(
            <InputRegister 
                {...props}
                type={'email'} 
                label={label} 
                name={name} 
                placeholder={placeholder}
                className={twMerge(
                    `pl-10 pr-10`,
                    className
                )}
            >
                <Mail size={20} className="absolute left-2.5 text-j-transparent-white"/>
            </InputRegister>

    );
}

export default InputEmail;