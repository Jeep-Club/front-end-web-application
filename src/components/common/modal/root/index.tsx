'use client';

export interface ModalRootProps {
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
}

export function ModalRoot({ children, onClose, isOpen }: ModalRootProps) {
    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            style={{ backgroundColor: '#000000CC' }}
        >
            <div className={``}
                onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}