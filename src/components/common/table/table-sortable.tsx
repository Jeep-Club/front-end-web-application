import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface TableSortableProps {
    field: string;
    label: string;
    sort?: string;
    onSortChange: (field: string) => void;
}

export function TableSortable({
    field,
    label,
    sort,
    onSortChange,
}: TableSortableProps) {
    const [sortedField, sortedDirection] = sort?.split(",") ?? [];
    const isActive = sortedField === field;
    const direction = sortedDirection?.toLowerCase();
    const nextAction = !isActive
        ? `Não ordenado por ${label}, clique para ordenar`
        : direction === "asc"
            ? `${label} ordenado em ordem crescente, clique para ordenar em decrescente`
            : `${label} ordenado em ordem decrescente, clique para remover ordenação`;

    return (
        <button
            type="button"
            onClick={() => onSortChange(field)}
            aria-label={nextAction}
            title={nextAction}
            className={twMerge(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-md py-1 text-left transition-colors",
                "hover:text-j-blue-600 focus-visible:outline-2 focus-visible:outline-j-yellow-400",
                "uppercase",
                isActive && "text-j-blue-500",
            )}
        >
            <span>{label}</span>
            {isActive && direction === "asc" ? (
                <ArrowUp aria-hidden="true" size={15} strokeWidth={2.5} />
            ) : isActive && direction === "desc" ? (
                <ArrowDown aria-hidden="true" size={15} strokeWidth={2.5} />
            ) : (
                <ArrowUpDown aria-hidden="true" size={14} className="text-j-gray-400" />
            )}
        </button>
    );
}
