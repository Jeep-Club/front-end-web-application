import { twMerge } from "tailwind-merge";
import { Image as ImageIcon } from "lucide-react";


export function FallBackImageFile({className}:{className?: string}){
    return(
        <div
            className={twMerge(
                `
                flex items-center justify-center rounded-lg text-j-gray-400 
                h-24 w-24 sm:w-28 sm:h-28
                border-2 border-dashed
                `,
                className
            )}
        >
            <ImageIcon size={32} strokeWidth={2}/>
        </div>
    );
}