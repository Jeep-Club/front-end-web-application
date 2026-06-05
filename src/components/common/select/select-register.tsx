'use client';

import { Select, SelectProps } from "./select";
import { useFormContext, useController } from "react-hook-form"; 

export type SelectRegisterProps = SelectProps;

export function SelectRegister({
    label, 
    name, 
    value, 
    onChange, 
    ...props
}: SelectRegisterProps) {
    const { control } = useFormContext();
    
    const {
        fieldState: { error },
        field: { value: fieldValue, onChange: fieldOnChange, onBlur, ref }
    } = useController({ name, control, defaultValue: value ?? '' });

    return (
        <Select 
            {...props}
            ref={ref}
            label={label}
            name={name}
            value={fieldValue}
            onBlur={onBlur}
            onChange={(e) => {
                fieldOnChange(e);
                // Permite ao developer injetar a sua própria lógica extra no onChange, se necessário.
                onChange?.(e);
            }}
            error={String(error?.message)}
        />
    );
}