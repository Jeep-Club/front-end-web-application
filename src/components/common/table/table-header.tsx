import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface TableHeaderProps {
    title?: string;
    description?: string;
    children?: ReactNode;
    className?: string;
}

export function TableHeader({
    title,
    description,
    children,
    className,
}: TableHeaderProps) {
    return (
        <header
            className={twMerge(
                "flex flex-col gap-4 border-b border-j-gray-200 p-4 md:px-6",
                "lg:flex-row lg:items-center lg:justify-between",
                className,
            )}
        >
            {(title || description) && (
                <div className="min-w-0">
                    {title && (
                        <h2 className="font-black text-j-blue-800">{title}</h2>
                    )}
                    {description && (
                        <p className="mt-0.5 text-sm text-j-gray-600">{description}</p>
                    )}
                </div>
            )}

            {children && (
                <div
                    className={twMerge(
                        "flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:justify-end",
                        (title || description) && "lg:w-auto",
                    )}
                >
                    {children}
                </div>
            )}
        </header>
    );
}
