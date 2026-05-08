import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import React from "react";
import { 
    useForm,
    FormProvider, 
    SubmitHandler, 
    FieldValues,
    UseFormProps,
    SubmitErrorHandler
 } from "react-hook-form";


interface FormProps<T extends FieldValues>{
    children: React.ReactNode;
    onSubmit: SubmitHandler<T>; 
    className?: string;
    formOptions?: UseFormProps<T>;
    schema: z.ZodType<T>;
    onError: SubmitErrorHandler<T>;
}

export function Form<T extends FieldValues>({
    children, 
    onSubmit, 
    className, 
    formOptions,
    schema,
    onError
}: FormProps<T>) {

    formOptions = {
        ...formOptions,
        //falta tipar o formOptions para garantir que o resolver seja do tipo zodResolver, mas funciona mesmo sem a tipagem específica
        resolver: zodResolver(schema as any),
    }

    const methods = useForm<T>(formOptions);

    return (
    <FormProvider {...methods}>
        <form
            onSubmit={methods.handleSubmit(onSubmit, onError)}
            className={className || "w-full grid grid-cols-1 md:grid-cols-12 gap-6"}
            noValidate
            >
            {children}
        </form>
    </FormProvider>
    );

}