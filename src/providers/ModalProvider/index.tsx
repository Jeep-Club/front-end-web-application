'use client';

import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { ModalRoot } from '@/components/common/modal/root';

interface ModalContextProps  {
    content: React.ReactNode;
    setContent: (content: React.ReactNode) => void;
    setOpen: () => void;
    setClose: () => void;
    ref: React.RefObject<HTMLDivElement | null>;
}

const ModalContext = createContext<ModalContextProps>({
    content: null,
    setContent: () => { },
    setOpen: () => { },
    setClose: () => { },
    ref: { current: null },
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<React.ReactNode>(null);
    const [isOpen, setIsOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setContent(null);
        setIsOpen(false);
    };

    

    return (
        <ModalContext.Provider value={{ content, setContent, setClose: closeModal, setOpen: openModal, ref }}>
            {children}
            <ModalRoot onClose={closeModal} isOpen={isOpen} ref={ref}>
                {content}
            </ModalRoot>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    return context;
}
