import { twMerge } from "tailwind-merge";


export function FallBackFile({className, children}:{className?: string, children: React.ReactNode}){
    return(
        <div
            className={twMerge(
                `
                flex items-center justify-center p-3 mt-2 rounded-lg bg-input-bg text-sm text-j-gray-400 min-h-16
                `,
                className
            )}
        >
            {children}
        </div>
    );
}