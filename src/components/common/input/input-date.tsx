"use client"
import { Input, InputProps } from "./input";
import { twMerge } from "tailwind-merge";
import { Calendar } from "lucide-react";
import { ButtonIcon } from "../button";
import { useFormContext, useController } from "react-hook-form"; 
import { useRef } from "react";

export type InputDateProps = Omit<InputProps, "label" | "name" | "placeholder"> & {
    label?: string,
     /**
     * Função de Mascara
     * @param value e.target.value - valor do input para ser alterado
     * @returns String com mascara adicionada
     * @example
     *  ``` typescript
     *      function maskExample(value: string): string {
     *          //Alguma alteração em value
     *          //[...]
     *          return value;
     *      }
     *  ```
     */
    mask?: (value: string)=>string;
}

export function InputDate({label="Data de Nascimento", className, value, mask, onChange, ...props}: InputDateProps){
    const name = "birthData";
    const refLocal = useRef<HTMLInputElement>(null);
    
    const { control } = useFormContext();
    const {
        fieldState: {error},
        field: {value: fieldValue, onChange: fieldOnChange, onBlur, ref}
    } = useController({name, control, defaultValue: value ?? ''})
    
    const handleOpenPicker = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        refLocal.current?.showPicker();
    };

    return(
            <Input 
                {...props}
                ref={(e)=>{ref(e);refLocal.current = e}}
                type={'date'} 
                label={label} 
                name={name} 
                value={fieldValue}
                onBlur={onBlur}
                error={String(error?.message)}
                onChange={(e)=>{
                    if(mask) e.target.value = mask(e.target.value);
                        fieldOnChange(e);
                        onChange?.(e);
                    }}
                className={twMerge(
                    `
                    pl-10 pr-10
                    [&::-webkit-calendar-picker-indicator]:hidden
                    [&::-webkit-inner-spin-button]:hidden
                    `,
                    className
                )}
            >
                <ButtonIcon 
                    aria-label={`Abrir calendário para selecionar ${label.toLowerCase()}`}
                    aria-haspopup="dialog"
                    title="Mostrar seletor de datas" 
                    className="absolute left-2.5 text-j-transparent-white" 
                    onClick={handleOpenPicker}
                >
                <Calendar size={20}/></ButtonIcon>
            </Input>

    );
}

export default InputDate;