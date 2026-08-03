"use client"
import { useState } from "react";
import { Input, InputProps } from "./";
import { ButtonIcon } from "../button";
import { twMerge } from "tailwind-merge";
import { Eye, EyeClosed, KeyRound } from "lucide-react";
import { useFormContext, useController } from "react-hook-form";
import { validPassword } from "@/utils/validate";
import { Check, X } from "lucide-react";

export type InputPasswordProps = Omit<InputProps, "label" | "name"> & {
    label?: string,
    notSeePassword?: boolean,
    name?: string,
    /**
     * Exibe erros do campo password em tempo real, ou seja, a cada alteração do valor do campo. Caso contrário, os erros só serão exibidos aos poucos seguindo o padrão do zod.
     */
    stepErrors?: boolean
}

export function InputPassword({label="Senha", name='senha', placeholder, className, value, notSeePassword=false, onChange, stepErrors=false, autoComplete='new-password', ...props}: InputPasswordProps){
    const [isVisible, setIsVisible] = useState<boolean>(false);
    
    const { control } = useFormContext();
    const {
        fieldState: {error},
        field: {value: fieldValue, onChange: fieldOnChange, onBlur, ref}
    } = useController({name, control, defaultValue: value ?? ''})

    const [stepsErrors, setStepsErrors] = useState<ReturnType<typeof validPassword>>(validPassword(fieldValue));

    return(
        <div className="w-full flex flex-col gap-3">
            <Input
                {...props}
                type={isVisible ? 'text' : 'password'}
                autoComplete={autoComplete}
                ref={ref}
                label={label}
                name={name} 
                value={fieldValue}
                onBlur={onBlur}
                error={stepErrors ? undefined : String(error?.message)}
                onChange={(e)=>{
                    fieldOnChange(e);
                    onChange?.(e);
                    setStepsErrors(validPassword(e.target.value));
                }}
                placeholder={placeholder || isVisible ? 'Senha-1#' : "********"}
                className={twMerge(
                    `pl-10 pr-10`,
                    className
                )}
            >
                <KeyRound size={20} className="absolute left-2.5 text-j-blue-800"/>
                <ButtonIcon
                    disabled={notSeePassword}
                    onClick={()=>{setIsVisible((prev)=>!prev)}}

                    className="absolute right-2.5"
                >
                    {isVisible ? <EyeClosed /> : <Eye />}
                </ButtonIcon>
            </Input>
            {stepErrors && stepsErrors &&
                <ul className="text-xs text-j-red-300 flex flex-col gap-1 text-left">
                    <li className={twMerge(
                            stepsErrors.hasMinLength ? "text-j-green-300" : "text-j-red-500",
                            "flex items-center gap-1"
                        )}>{stepsErrors.hasMinLength ? <Check size={18}/> : <X size={18}/>} Minimo de 8 caracteres</li>
                    <li className={twMerge(
                        stepsErrors.hasNumber ? "text-j-green-300" : "text-j-red-500",
                        "flex items-center gap-1"
                    )}>{stepsErrors.hasNumber ? <Check size={18}/> : <X size={18}/>} Deve conter pelo menos um número</li>
                    <li className={twMerge(
                        stepsErrors.hasUppercase ? "text-j-green-300" : "text-j-red-500",
                        "flex items-center gap-1"
                    )}>{stepsErrors.hasUppercase ? <Check size={18}/> : <X size={18}/>} Deve conter pelo menos uma letra maiúscula</li>
                    <li className={twMerge(
                        stepsErrors.hasLowercase ? "text-j-green-300" : "text-j-red-500",
                        "flex items-center gap-1"
                    )}>{stepsErrors.hasLowercase ? <Check size={18}/> : <X size={18}/>} Deve conter pelo menos uma letra minúscula</li>
                    <li className={twMerge(
                        stepsErrors.hasSpecialChar ? "text-j-green-300" : "text-j-red-500",
                        "flex items-center gap-1"
                    )}>{stepsErrors.hasSpecialChar ? <Check size={18}/> : <X size={18}/>} Deve conter pelo menos um caractere especial</li>
                </ul>
            }
        </div>


    );
}

export default InputPassword;