import { ButtonProps } from "./Button";
import { twMerge } from "tailwind-merge";

// export interface ButtonIconProps exports ButtonIcon {}

export function ButtonIcon({children, type='button', tabIndex=0, className, ...props}: ButtonProps){
    return(
        <button
            {...props}
            tabIndex={tabIndex}
            type={type}
            className={twMerge(
                `
                cursor-pointer
                text-placeholder
                transition-color
                duration-200
                hover:text-button-primary-bg-hover
                border-2 border-transparent
                p-0.5
                focus-visible:text-button-primary-bg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-button-primary-bg focus-visible:rounded-md
                focus-visible:border-button-primary-bg
                `,
                className
            )}
        >
            {children}
        </button>
    );
}