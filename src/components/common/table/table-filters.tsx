import type { ReactNode } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ButtonIcon } from "../button";

export interface TableFiltersProps {
    children?: ReactNode;
    onClear?: () => void;
    hasActiveFilters?: boolean;
    clearLabel?: string;
    className?: string;
}

export function TableFilters({
    children,
    onClear,
    hasActiveFilters = false,
    clearLabel = "Limpar filtros",
    className,
}: TableFiltersProps) {
    return (
        <div
            className={twMerge(
                "flex w-full flex-col gap-2 sm:flex-row sm:items-end",
                className,
            )}
        >
            <span className="sr-only">
                <Filter aria-hidden="true" size={16} />
                Filtros da tabela
            </span>
            {children}

            {onClear && hasActiveFilters && (
                <ButtonIcon
                    type="button"
                    onClick={onClear}
                    title={clearLabel}
                    className="flex py-2.5 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-bold text-j-blue-800 transition-colors hover:text-j-blue-800 hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-yellow-400 focus-visible:text-j-blue-800"
                >
                    <RotateCcw aria-hidden="true" size={16} />
                    {clearLabel}
                </ButtonIcon>
            )}
        </div>
    );
}
