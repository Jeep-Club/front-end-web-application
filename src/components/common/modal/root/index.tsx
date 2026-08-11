'use client';

import { useEffect } from "react";

export interface ModalRootProps {
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
}

export function ModalRoot({ children, onClose, isOpen }: ModalRootProps) {
    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center p-4 overflow-y-auto z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            style={{ backgroundColor: '#000000CC' }}
        >
            <div className="flex w-full max-w-3xl justify-center"
                onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
