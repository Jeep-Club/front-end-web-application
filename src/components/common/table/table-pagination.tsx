"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { ButtonIcon } from "@/components/common/button/ButtonIcon";
import { twMerge } from "tailwind-merge";

export type DataTablePaginationProps = {
    pageIndex: number;
    pageCount: number;
    onPageChange: (newPageIndex: number) => void;
    className?: string;
}

export function TablePagination({ pageIndex, pageCount, onPageChange, className }: DataTablePaginationProps) {
    if (pageCount <= 1) return null;

    return (
        <div className={twMerge("flex items-center justify-center py-4 ", className)}>
            <ButtonIcon
                className="disabled:flex disabled:opacity-40 disabled:cursor-auto disabled:text-j-gray-300 text-j-gray-300"
                onClick={() => onPageChange(1)}
                disabled={pageIndex <= 1}
                aria-label="Primeira página"
            >
                <ChevronsLeft size={20} />
            </ButtonIcon>
            <ButtonIcon
                className="disabled:flex disabled:opacity-40 disabled:cursor-auto disabled:text-j-gray-300 text-j-gray-300"
                onClick={() => onPageChange(pageIndex - 1)}
                disabled={pageIndex <= 1}
                aria-label="Página anterior"
            >
                <ChevronLeft size={20} />
            </ButtonIcon>

            <div className="text-sm text-j-gray-300 disabled:opacity-40 mx-5">
                {pageIndex} de {pageCount}
            </div>

            <ButtonIcon
                className="disabled:flex disabled:opacity-40 disabled:cursor-auto disabled:text-j-gray-300 text-j-gray-300"
                onClick={() => onPageChange(pageIndex + 1)}
                disabled={pageIndex >= pageCount}
                aria-label="Próxima página"
            >
                <ChevronRight size={20} />
            </ButtonIcon>
            <ButtonIcon
                className="disabled:flex disabled:opacity-40 disabled:cursor-auto disabled:text-j-gray-300 text-j-gray-300"
                onClick={() => onPageChange(pageCount)}
                disabled={pageIndex >= pageCount}
                aria-label="Última página"
            >
                <ChevronsRight size={20} />
            </ButtonIcon>
    </div>
    );
}