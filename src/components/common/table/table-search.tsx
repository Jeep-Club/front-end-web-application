"use client";

import { twMerge } from "tailwind-merge";

import {
    InputSearch,
    type InputSearchProps,
} from "@/components/common/input/input-search";
import { useTableContext } from "./table-context";

export interface TableSearchProps
    extends Omit<InputSearchProps, "isLoading" | "onSubmit"> {
    onValueChange: (value: string) => void;
}

export function TableSearch({
    value,
    onValueChange,
    label = "Buscar",
    placeholder = "Buscar...",
    disabled,
    className,
    formClassName,
    iconClassName,
    clearButtonClassName,
    ...props
}: TableSearchProps) {
    const { isLoading, isFetching } = useTableContext();

    return (
        <InputSearch
            {...props}
            value={value}
            onSubmit={onValueChange}
            label={label}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            isLoading={isFetching}
            formClassName={twMerge("w-full sm:min-w-64", formClassName)}
            className={twMerge(
                "h-10 border border-j-gray-200 bg-j-gray-100 py-2 pl-10 pr-10 text-sm font-normal text-j-gray-700",
                "placeholder:text-j-gray-400 hover:border-j-gray-300",
                "focus:border-j-yellow-400 focus:bg-j-white focus:text-j-gray-700 focus:outline-j-yellow-400",
                "disabled:cursor-not-allowed disabled:bg-j-gray-100 disabled:text-j-gray-400 disabled:opacity-60",
                "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
                className,
            )}
            labelClassName="sr-only"
            iconClassName={twMerge("text-j-gray-400", iconClassName)}
            clearButtonClassName={twMerge(
                "text-j-gray-400 hover:bg-j-gray-200 hover:text-j-blue-800",
                clearButtonClassName,
            )}
        />
    );
}
