import { twMerge } from "tailwind-merge";


export interface ButtonProps extends React.ComponentProps<'button'>{
    children: React.ReactNode,
    isLoading?: boolean,
}

export function Button({children, type='button', tabIndex=0, className, isLoading = false, disabled, ...props}: ButtonProps){
    return(
        <button
            {...props}
            tabIndex={tabIndex}
            type={type}
            disabled={disabled || isLoading}
            aria-busy={isLoading || undefined}
            className={twMerge(
                `
                relative isolate flex gap-1 items-center justify-center overflow-hidden
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
            {isLoading && <span aria-hidden="true" className="button-loading-progress absolute bottom-0 left-0 z-0 h-1 w-1/3 rounded-full bg-j-yellow-300/90" />}
            <span className="relative z-10 inline-flex items-center justify-center gap-1">{children}</span>
            {isLoading && <span className="sr-only" role="status">Carregando</span>}
        </button>
    );
}
