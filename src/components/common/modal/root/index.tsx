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
            className={`fixed inset-0 z-30 flex items-center justify-center overflow-y-auto p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            onClick={ref ? undefined : onClose}
            style={{ backgroundColor: '#000000CC' }}
        >
            <div
                ref={ref}
                data-modal-content
                className={twMerge("flex w-full max-w-4xl justify-center", isOpen && "modal-content-enter", contentClassName)}
                onClick={ref ? undefined : (event) => event.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
