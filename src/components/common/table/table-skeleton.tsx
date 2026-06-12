import { twMerge } from "tailwind-merge";

export function TableSkeleton({ rows = 5, className }: { rows?: number, className?: string }) {
    return (
        <div className={twMerge("w-full overflow-x-auto rounded-lg bg-j-gray-700 border border-j-gray-400/80", className)}>
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-j-gray-600 text-j-gray-400">
                    <tr>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <th key={i} className="p-4">
                                <div className="h-3 bg-j-white/30 rounded animate-pulse w-24"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-j-gray-500/50 hover:bg-input-bg/30 transition-colors">
                            {Array.from({ length: 4 }).map((_, colIndex) => (
                                <td key={colIndex} className="p-4">
                                    <div className="h-3 bg-j-gray-500 rounded animate-pulse w-full max-w-40"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}