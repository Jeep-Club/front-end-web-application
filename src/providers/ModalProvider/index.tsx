'use client';

import React, { createContext, useState, useContext } from 'react';
import { ModalRoot } from '@/components/common/modal/root';

interface ModalContextProps  {
    content: React.ReactNode;
    setContent: (content: React.ReactNode) => void;
    setOpen: () => void;
    setClose: () => void;
}

const ModalContext = createContext<ModalContextProps>({
    content: null,
    setContent: () => { },
    setOpen: () => { },
    setClose: () => { },
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<React.ReactNode>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setContent(null);
        setIsOpen(false);
    };

    return (
        <ModalContext.Provider value={{ content, setContent, setClose: closeModal, setOpen: openModal }}>
            {children}
            <ModalRoot onClose={closeModal} isOpen={isOpen}>
                {content}
            </ModalRoot>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    return context;
}