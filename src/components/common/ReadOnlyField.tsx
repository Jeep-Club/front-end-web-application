import type { ElementType, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface ReadOnlyFieldProps {
    label: string;
    value: ReactNode;
    fallback?: ReactNode;
    icon?: ElementType;
    variant?: "field" | "summary";
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
}

export function ReadOnlyField({
    label,
    value,
    fallback = "—",
    icon: Icon,
    variant = "field",
    className,
    labelClassName,
    valueClassName,
}: ReadOnlyFieldProps) {
    const displayedValue = value ?? fallback;

    if (variant === "summary") {
        return (
            <div
                className={twMerge(
                    "flex min-w-0 items-center gap-3 rounded-xl bg-j-white/80 px-3 py-2.5",
                    className,
                )}
            >
                {Icon && <Icon size={17} className="shrink-0 text-j-blue-600" />}

                <div className="min-w-0">
                    <span
                        className={twMerge(
                            "block text-[10px] font-bold uppercase tracking-wide text-j-gray-400",
                            labelClassName,
                        )}
                    >
                        {label}
                    </span>
                    <span
                        className={twMerge(
                            "block truncate text-sm font-semibold text-j-gray-700",
                            valueClassName,
                        )}
                    >
                        {displayedValue}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={twMerge("flex w-full min-w-0 flex-col gap-1.5", className)}>
            <span
                className={twMerge(
                    "text-xs font-bold text-j-white md:text-sm",
                    labelClassName,
                )}
            >
                {label}
            </span>
            <div
                className={twMerge(
                    "min-h-10 w-full rounded-lg border-2 border-transparent bg-input-bg px-2.5 py-2 text-sm font-light text-input-text md:text-base",
                    valueClassName,
                )}
            >
                {displayedValue}
            </div>
        </div>
    );
}

export default ReadOnlyField;
