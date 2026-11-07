"use client"
import { useState } from "react";
import { Input } from "./input";
import type { InputProps } from "./input";
import { ButtonIcon } from "../button";
import { twMerge } from "tailwind-merge";
import { Eye, EyeClosed, KeyRound } from "lucide-react";
import { useFormContext, useController } from "react-hook-form";

export type InputPasswordProps = Omit<InputProps, "label" | "name"> & {
    label?: string,
    notSeePassword?: boolean,
    name?: string,
}

export function InputPassword({label="Senha", name='senha', placeholder, className, value, notSeePassword=false, onChange, autoComplete='new-password', variant = "white", disabled, ...props}: InputPasswordProps){
    const [isVisible, setIsVisible] = useState<boolean>(false);
    
    const { control } = useFormContext();
    const {
        fieldState: {error},
        field: {value: fieldValue, onChange: fieldOnChange, onBlur, ref}
    } = useController({name, control, defaultValue: value ?? ''})

    return(
        <div className="w-full flex flex-col gap-3">
            <Input
                {...props}
                variant={variant}
                disabled={disabled}
                type={isVisible ? 'text' : 'password'}
                autoComplete={autoComplete}
                ref={ref}
                label={label}
                name={name} 
                value={fieldValue}
                onBlur={onBlur}
                error={error?.message ? String(error.message) : undefined}
                onChange={(e)=>{
                    fieldOnChange(e);
                    onChange?.(e);
                }}
                placeholder={placeholder ?? (isVisible ? 'Digite sua senha' : "********")}
                className={twMerge(
                    `pl-10 pr-10`,
                    className
                )}
            >
                <KeyRound aria-hidden="true" size={20} className={twMerge("absolute left-2.5", variant === "white" ? "text-j-blue-800" : "text-j-white/70")}/>
                <ButtonIcon
                    disabled={notSeePassword || disabled}
                    aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={isVisible}
                    onClick={()=>{setIsVisible((prev)=>!prev)}}

                    className={twMerge("absolute right-2.5", variant === "white" ? "text-j-gray-500" : "text-j-white/70")}
                >
                    {isVisible ? <EyeClosed /> : <Eye />}
                </ButtonIcon>
            </Input>
        </div>
    );
}

export default InputPassword;
