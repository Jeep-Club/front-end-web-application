"use client";

import { useEffect, useRef } from "react";
import { handleVehicleModalEnter } from "@/utils/vehicles/modalEnter";

export function useVehicleDetailsSteps(currentStep: number, stepCount: number, onNext: () => void, onClose: () => void) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        rootRef.current?.focus({ preventScroll: true });
    }, [currentStep]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const onKeyDown = (event: KeyboardEvent) => handleVehicleModalEnter(event, root, () => {
            if (currentStep < stepCount) onNext();
            else onClose();
        });
        const document = root.ownerDocument;
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [currentStep, stepCount, onNext, onClose]);

    return rootRef;
}
