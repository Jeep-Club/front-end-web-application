"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { handleVehicleModalEnter } from "@/utils/vehicles/modalEnter";

type VehicleStep = { fields: readonly string[] };

export function useVehicleModalSteps(currentStep: number, steps: readonly VehicleStep[], onNext: () => void) {
    const rootRef = useRef<HTMLDivElement>(null);
    const advancing = useRef(false);
    const { trigger, formState: { isSubmitting } } = useFormContext();

    const handleNext = useCallback(async () => {
        if (advancing.current || isSubmitting) return;
        advancing.current = true;
        try {
            const valid = await trigger([...steps[currentStep - 1].fields], { shouldFocus: true });
            if (valid) onNext();
        } finally {
            advancing.current = false;
        }
    }, [currentStep, isSubmitting, onNext, steps, trigger]);

    useEffect(() => {
        // Opening and changing steps must not leave focus behind the modal or in a hidden field.
        rootRef.current?.focus({ preventScroll: true });
    }, [currentStep]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const onKeyDown = (event: KeyboardEvent) => handleVehicleModalEnter(event, root, () => {
            if (isSubmitting) return;
            if (currentStep < steps.length) void handleNext();
            else root.closest('form')?.requestSubmit();
        });
        const document = root.ownerDocument;
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [currentStep, handleNext, isSubmitting, steps.length]);

    return { rootRef, handleNext };
}
