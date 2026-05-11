interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function Button({
    children,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            className={`
                w-full
                bg-[var(--button-active)]
                hover:bg-[var(--button-hover)]
                text-[var(--button-text)]
                font-bold
                text-[var(--fs-sm)]
                uppercase
                tracking-widest
                py-4
                rounded-[var(--r-md)]
                transition-colors
                duration-200
                flex
                items-center
                justify-center
                gap-2
                ${className}
            `}
        >
            {children}
        </button>
    );
}