'use client';

import { Input, InputProps  } from "./input";
import { useFormContext, useController } from "react-hook-form"; 

export type InputRegisterProps = InputProps &{
    /**
     * Função de Mascara
     * @param value e.target.value - valor do input para ser alterado
     * @returns String com mascara adicionada
     */
    mask?: (value: string)=>string;
}


export function InputRegister({label, name, value, onChange, children, mask, ...props}: InputRegisterProps) {
    const { control } = useFormContext();
    const {
        fieldState: {error},
        field: {value: fieldValue, onChange: fieldOnChange, onBlur, ref}
    } = useController({name, control, defaultValue: value ?? ''})

    return (
        <Input 
            {...props}
            ref={ref}
            label={label}
            name={name}
            value={fieldValue}
            onBlur={onBlur}
            onChange={(e)=>{
                if(mask) e.target.value = mask(e.target.value);
                fieldOnChange(e);
                onChange?.(e);
            }}
            error={String(error?.message)}
        >{children}</Input>
    );
}