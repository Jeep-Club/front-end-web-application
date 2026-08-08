import { twMerge } from "tailwind-merge";

export interface TableSkeletonProps {
    columns: number;
    rows?: number;
    className?: string;
}

export function TableSkeleton({
    columns,
    rows = 5,
    className,
}: TableSkeletonProps) {
    return (
        <div
            aria-label="Carregando dados da tabela"
            aria-busy="true"
            className={twMerge("min-w-full animate-pulse", className)}
        >
            <div
                className="grid border-b border-j-gray-200 bg-j-gray-100"
                style={{ gridTemplateColumns: `repeat(${Math.max(columns, 1)}, minmax(10rem, 1fr))` }}
            >
                {Array.from({ length: Math.max(columns, 1) }).map((_, index) => (
                    <div key={index} className="px-4 py-4">
                        <div className="h-3 w-20 rounded-full bg-j-gray-300" />
                    </div>
                ))}
            </div>

            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="grid border-b border-j-gray-100 last:border-b-0"
                    style={{ gridTemplateColumns: `repeat(${Math.max(columns, 1)}, minmax(10rem, 1fr))` }}
                >
                    {Array.from({ length: Math.max(columns, 1) }).map((_, columnIndex) => (
                        <div key={columnIndex} className="px-4 py-4">
                            <div className="h-3 max-w-32 rounded-full bg-j-gray-200" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
