'use client';

import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
export interface ModalRootProps {
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
    ref?: React.RefObject<HTMLDivElement | null>;
    isEscapable?: boolean;
    contentClassName?: string;
}

export function ModalRoot({ children, onClose, isOpen, ref, isEscapable = true, contentClassName }: ModalRootProps) {
    useEffect(() => {
        if (!isEscapable) return;
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, isEscapable]);

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center p-4 overflow-y-auto z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={ref ? undefined : onClose}
            style={{ backgroundColor: '#000000CC' }}
        >
            <div
                ref={ref}
                className={twMerge("flex w-full max-w-3xl justify-center", contentClassName)}
                onClick={ref ? undefined : (event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
