"use client";

import { useEffect, useRef } from "react";

export function useModalFocusRestoration() {
    const triggerRef = useRef<HTMLElement | null>(
        typeof document !== "undefined" && document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null,
    );

    useEffect(() => {
        const trigger = triggerRef.current;
        return () => trigger?.focus();
    }, []);
}
