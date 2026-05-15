"use client"
import { useState } from "react";
import { InputRegister, InputRegisterProps } from "./input-register";
import { ButtonIcon } from "../button";
import { twMerge } from "tailwind-merge";
import { Eye, EyeClosed, KeyRound } from "lucide-react";

export type InputPasswordProps = Omit<InputRegisterProps, "label" | "name"> & {
    label?: string,
    notSeePassword?: boolean,
}

export function InputPassword({label="Senha", placeholder, className, notSeePassword=false, ...props}: InputPasswordProps){
    const [isVisible, setIsVisible] = useState<boolean>(false);
    
    
    return(
            <InputRegister 
                {...props}
                type={isVisible ? 'text' : 'password'} 
                label={label} 
                name="senha" 
                placeholder={placeholder || isVisible ? 'Senha-1#' : "********"}
                className={twMerge(
                    `pl-10 pr-10`,
                    className
                )}
            >
                <KeyRound size={20} className="absolute left-2.5 text-j-transparent-white"/>
                <ButtonIcon
                    disabled={notSeePassword}
                    onClick={()=>{setIsVisible((prev)=>!prev)}}

                    className="absolute right-2.5"
                >
                    {isVisible ? <EyeClosed /> : <Eye />}
                </ButtonIcon>
            </InputRegister>

    );
}

export default InputPassword;