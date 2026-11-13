'use client';

import { createContext, useState, useContext, useLayoutEffect, useRef } from 'react';
import { ModalRoot } from '@/components/common/modal/root';
import { useModalScrollCorners } from '@/hooks/useModalScrollCorners';

interface ModalContextProps  {
    content: React.ReactNode;
    setContent: (content: React.ReactNode) => void;
    setOpen: () => void;
    openFromTrigger: (origin: HTMLElement) => void;
    setClose: () => void;
    ref: React.RefObject<HTMLDivElement | null>;
}

const ModalContext = createContext<ModalContextProps>({
    content: null,
    setContent: () => { },
    setOpen: () => { },
    openFromTrigger: () => { },
    setClose: () => { },
    ref: { current: null },
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useModalScrollCorners();
    const [content, setContent] = useState<React.ReactNode>(null);
    const [isOpen, setIsOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const [origin, setOrigin] = useState<DOMRect | null>(null);

    const openModal = (trigger?: HTMLElement) => {
        setOrigin(trigger?.getBoundingClientRect() ?? null);
        setIsOpen(true);
    };

    useLayoutEffect(() => {
        const panel = ref.current?.firstElementChild;
        if (!isOpen || !origin || !panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const target = panel.getBoundingClientRect();
        if (!target.width || !target.height) return;

        const animation = panel.animate(
            [
                {
                    transformOrigin: "top left",
                    transform: `translate(${origin.left - target.left}px, ${origin.top - target.top}px) scale(${origin.width / target.width}, ${origin.height / target.height})`,
                    opacity: 0.6,
                },
                { transformOrigin: "top left", transform: "none", opacity: 1 },
            ],
            { duration: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        );
        return () => animation.cancel();
    }, [isOpen, origin]);

    const closeModal = () => {
        setContent(null);
        setIsOpen(false);
    };

    

    return (
        <ModalContext.Provider value={{ content, setContent, setClose: closeModal, setOpen: () => openModal(), openFromTrigger: openModal, ref }}>
            {children}
            <ModalRoot onClose={closeModal} isOpen={isOpen} ref={ref} animateContent={!origin}>
                {content}
            </ModalRoot>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    return context;
}
