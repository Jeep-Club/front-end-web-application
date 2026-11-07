import { ButtonProps } from "./Button";
import { twMerge } from "tailwind-merge";

export type ButtonIconProps = ButtonProps & {}

export function ButtonIcon({children, type='button', tabIndex=0, className, ...props}: ButtonIconProps){
    return(
        <button
            {...props}
            tabIndex={tabIndex}
            type={type}
            className={twMerge(
                `
                cursor-pointer
                text-placeholder
                transition-[background-color,color,box-shadow,transform]
                duration-200 ease-out
                border-none
                hover:text-button-primary-bg-hover
                active:scale-[0.96]
                border-2 border-transparent
                p-0.5
                focus-visible:text-button-primary-bg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-button-primary-bg focus-visible:rounded-md
                focus-visible:border-button-primary-bg
                disabled:hidden
                motion-reduce:transition-none motion-reduce:active:scale-100
                `,
                className
            )}
        >
            {children}
        </button>
    );
}
