import { twMerge } from "tailwind-merge";


export interface ButtonProps extends React.ComponentProps<'button'>{
    children: React.ReactNode,
}

export function Button({children, type='button', tabIndex=0, className, ...props}: ButtonProps){
    return(
        <button
            {...props}
            tabIndex={tabIndex}
            type={type}
            className={twMerge(
                `
                flex gap-1 items-center justify-center
                p-2.5 rounded-lg font-bold cursor-pointer text-sm md:text-base
                transition-[background-color,color,box-shadow,transform]
                duration-200 ease-out
                bg-button-primary-bg text-button-primary-text
                hover:bg-button-primary-bg-hover hover:text-button-primary-text-hover
                enabled:hover:-translate-y-px enabled:hover:shadow-sm active:scale-[0.98]
                focus-visible:bg-button-primary-bg-hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-button-outline-border
                disabled:bg-button-disabled disabled:cursor-not-allowed disabled:text-button-text-disabled
                motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100
                `,
                className
            )}
        >
            {children}
        </button>
    );
}
