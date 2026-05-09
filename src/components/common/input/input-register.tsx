'use client';

import { Input, InputProps  } from "./input";
import { useFormContext, useController } from "react-hook-form"; 

// interface InputRegisterProps extends InputProps{
// }


export function InputRegister({label, name, value, onChange, ...props}: InputProps) {
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
                fieldOnChange(e);
                onChange?.(e);
            }}
            error={String(error?.message)}
        />
    );
}