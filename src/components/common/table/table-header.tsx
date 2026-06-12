import { twMerge } from "tailwind-merge";

export type DataTableHeaderProps = {
    title?: string;
    children?: React.ReactNode;
    className?: string;
}

export function TableHeader({ title, children, className }: DataTableHeaderProps) {
    return (
        <div className={twMerge("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full mb-4", className)}>
            
            {title && <h2 className="text-lg font-semibold text-j-white">{title}</h2>}
               
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {children}
            </div>
        </div>
    );
}