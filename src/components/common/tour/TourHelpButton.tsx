'use client';

import { HelpCircle } from "lucide-react";

interface TourHelpButtonProps {
    onClick: () => void;
    label?: string;
    id?: string;
    variant?: "button" | "icon" | "badge";
    className?: string;
}

export function TourHelpButton({
    onClick,
    label = "Como usar esta tela?",
    id,
    variant = "button",
    className = "",
}: TourHelpButtonProps) {
    if (variant === "icon") {
        return (
            <button
                type="button"
                id={id}
                onClick={onClick}
                title={label}
                aria-label={label}
                className={`
                    inline-flex items-center justify-center
                    rounded-full p-2
                    text-j-blue-800/80 hover:text-j-blue-800
                    hover:bg-j-yellow-300/20 active:scale-95
                    transition-all duration-200 cursor-pointer
                    ${className}
                `}
            >
                <HelpCircle size={18} />
            </button>
        );
    }

    if (variant === "badge") {
        return (
            <button
                type="button"
                id={id}
                onClick={onClick}
                className={`
                    inline-flex items-center gap-1.5
                    rounded-full border border-j-gray-300/80
                    bg-j-white/90 px-2.5 py-1 sm:px-3 text-[11px] sm:text-xs font-semibold
                    text-j-blue-800 shadow-sm
                    hover:border-j-yellow-300 hover:bg-j-yellow-50/50
                    active:scale-95 transition-all duration-200 cursor-pointer
                    ${className}
                `}
            >
                <HelpCircle size={14} className="text-j-yellow-500 shrink-0" />
                <span>{label}</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            id={id}
            onClick={onClick}
            className={`
                inline-flex items-center gap-1.5
                rounded-lg border border-j-gray-300
                bg-j-white px-2.5 py-1.5 sm:px-3 text-[11px] sm:text-xs font-bold text-j-blue-800
                shadow-sm hover:border-j-yellow-400 hover:bg-j-yellow-50/40
                active:scale-95 transition-all duration-200 cursor-pointer
                ${className}
            `}
        >
            <HelpCircle size={15} className="text-j-blue-700 shrink-0" />
            <span>{label}</span>
        </button>
    );
}

export default TourHelpButton;
