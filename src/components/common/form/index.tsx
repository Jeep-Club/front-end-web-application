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
import { twMerge } from "tailwind-merge";


interface FormProps<T extends FieldValues>{
    children: React.ReactNode;
    onSubmit: SubmitHandler<T>; 
    className?: string;
    formOptions?: UseFormProps<T>;
    schema: z.ZodType;
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
            className={twMerge(
                "w-full flex flex-col items-center gap-6",
                className
            )}
            noValidate
            >
            {children}
        </form>
    </FormProvider>
    );

}