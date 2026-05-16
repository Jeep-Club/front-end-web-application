"use client"
import { InputRegister, InputRegisterProps } from "./input-register";
import { twMerge } from "tailwind-merge";
import { FingerprintPattern } from "lucide-react";
import { maskRG } from "@/utils/masks/";

export type InputRGProps = Omit<InputRegisterProps, "label" | "name"> & {
    label?: string,
}

export function InputRG({label="RG", placeholder, className, type='text', ...props}: InputRGProps){
    
    
    return(
            <InputRegister 
                {...props}
                type={type}
                label={label} 
                name="rg" 
                placeholder={placeholder || "00.000.000-0"}
                className={twMerge(
                    `pl-10`,
                    className
                )}
                mask={maskRG}
            >
                <FingerprintPattern size={25} className="absolute left-2.5 text-j-transparent-white"/>
            </InputRegister>

    );
}

export default InputRG;