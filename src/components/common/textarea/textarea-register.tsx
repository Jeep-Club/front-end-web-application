'use client';

import { Textarea, TextareaProps } from "./textarea";
import { useFormContext, useController } from "react-hook-form"; 

export type TextareaRegisterProps = TextareaProps & {
    /**
     * Função de Mascara opcional (caso precise formatar quebras de linha ou caracteres específicos)
     */
    mask?: (value: string) => string;
}

export function TextareaRegister({
    label, 
    name, 
    value, 
    onChange, 
    mask, 
    ...props
}: TextareaRegisterProps) {
    const { control } = useFormContext();
    const {
        fieldState: { error },
        field: { value: fieldValue, onChange: fieldOnChange, onBlur, ref }
    } = useController({ name, control, defaultValue: value ?? '' });

    return (
        <Textarea 
            {...props}
            ref={ref}
            label={label}
            name={name}
            value={fieldValue}
            onBlur={onBlur}
            onChange={(e) => {
                if(mask) e.target.value = mask(e.target.value);
                fieldOnChange(e);
                onChange?.(e);
            }}
            error={String(error?.message)}
        />
    );
}