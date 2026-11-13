'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';

const ModalContext = createContext<(active: boolean) => void>(() => {});

export function FeedRouteLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    const [active, setActive] = useState(false);
    const childSegment = useSelectedLayoutSegment();
    return <ModalContext.Provider value={setActive}>{active && childSegment ? null : children}{modal}</ModalContext.Provider>;
}

/** Only intercepted layouts register here; default/catch-all slots stay inactive. */
export function FeedInterceptedModal({ children }: { children: React.ReactNode }) {
    const setActive = useContext(ModalContext);
    useEffect(() => { setActive(true); return () => setActive(false); }, [setActive]);
    return children;
}
