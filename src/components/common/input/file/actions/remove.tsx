"use client"

import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ButtonIcon, ButtonIconProps } from "@/components/common/button/ButtonIcon";

export type RemoveProps = Omit<ButtonIconProps, 'children' | 'onClick'> & {
    onClick: () => void;
    iconSize?: number;
}

export function RemoveFile({ onClick, className, iconSize = 18, 'aria-label':ariaLabel="Remover arquivo", ...props }: RemoveProps) {
    return (
        <ButtonIcon
            {...props}
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            aria-label={ariaLabel}
            className={twMerge(
                "hover:text-j-red-400 text-j-gray-400 focus-visible:outline-j-red-400 focus-visible:text-j-red-400",
                className
            )}
        >
            <X size={iconSize} />
        </ButtonIcon>
    );
}