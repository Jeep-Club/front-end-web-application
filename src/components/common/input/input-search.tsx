"use client";

import type { ChangeEvent } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

import { Form } from "@/components/common/form";
import { InputRegister, type InputRegisterProps } from "./input-register";

const inputSearchSchema = z.object({
    search: z.string(),
});

type InputSearchFormData = z.infer<typeof inputSearchSchema>;

export interface InputSearchProps
    extends Omit<
        InputRegisterProps,
        | "children"
        | "label"
        | "name"
        | "onChange"
        | "onSubmit"
        | "type"
        | "value"
    > {
    value: string;
    onSubmit: (value: string) => void;
    submitOnChange?: boolean;
    label?: string;
    isLoading?: boolean;
    formClassName?: string;
    iconClassName?: string;
    clearButtonClassName?: string;
}

interface InputSearchFieldProps
    extends Omit<InputSearchProps, "formClassName" | "onSubmit" | "value"> {
    onSearchSubmit: (data: InputSearchFormData) => void;
}

function InputSearchField({
    onSearchSubmit,
    submitOnChange = true,
    label = "Buscar",
    placeholder = "Buscar...",
    isLoading = false,
    disabled,
    className,
    labelClassName,
    iconClassName,
    clearButtonClassName,
    ...props
}: InputSearchFieldProps) {
    const { handleSubmit, setValue, watch } = useFormContext<InputSearchFormData>();
    const currentValue = watch("search");
    const submitSearch = handleSubmit(onSearchSubmit);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setValue("search", event.target.value, {
            shouldDirty: true,
            shouldValidate: true,
        });

        if (submitOnChange) {
            void submitSearch();
        }
    }

    function handleClear() {
        setValue("search", "", {
            shouldDirty: true,
            shouldValidate: true,
        });
        void submitSearch();
    }

    return (
        <InputRegister
            {...props}
            type="search"
            name="search"
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            onChange={handleChange}
            className={twMerge("pl-10 pr-10", className)}
            labelClassName={twMerge("sr-only", labelClassName)}
        >
            <Search
                aria-hidden="true"
                size={18}
                className={twMerge(
                    "pointer-events-none absolute left-3 text-j-transparent-white",
                    iconClassName,
                )}
            />

            {isLoading ? (
                <LoaderCircle
                    aria-hidden="true"
                    size={17}
                    className="pointer-events-none absolute right-3 animate-spin text-j-yellow-300"
                />
            ) : currentValue ? (
                <button
                    type="button"
                    aria-label="Limpar busca"
                    onClick={handleClear}
                    className={twMerge(
                        "absolute right-2 cursor-pointer rounded-md p-1 text-j-transparent-white transition-colors hover:text-j-yellow-300 focus-visible:outline-2 focus-visible:outline-j-yellow-400",
                        clearButtonClassName,
                    )}
                >
                    <X size={16} />
                </button>
            ) : null}
        </InputRegister>
    );
}

export function InputSearch({
    value,
    onSubmit,
    submitOnChange = true,
    formClassName,
    ...props
}: InputSearchProps) {
    function handleSubmit(data: InputSearchFormData) {
        onSubmit(data.search);
    }

    return (
        <Form<InputSearchFormData>
            schema={inputSearchSchema}
            onSubmit={handleSubmit}
            onError={() => undefined}
            formOptions={{
                values: { search: value },
            }}
            className={twMerge("w-full items-stretch gap-0", formClassName)}
        >
            <InputSearchField
                {...props}
                submitOnChange={submitOnChange}
                onSearchSubmit={handleSubmit}
            />
        </Form>
    );
}

export default InputSearch;
