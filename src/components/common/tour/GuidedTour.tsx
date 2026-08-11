'use client';

import { useEffect, useRef } from "react";
import { useTour } from "@/hooks/useTour";
import { TourContext } from "./TourContext";

interface GuidedTourProps {
    children: React.ReactNode;
}

export function GuidedTour({ children }: GuidedTourProps) {
    const { isTourCompleted, startTour, restartTour } = useTour();
    const hasAutoStarted = useRef(false);

    useEffect(() => {
        if (hasAutoStarted.current) return;
        hasAutoStarted.current = true;

        if (!isTourCompleted) {
            const timer = setTimeout(() => {
                startTour();
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isTourCompleted, startTour]);

    return (
        <TourContext.Provider value={{ isTourCompleted, startTour, restartTour }}>
            {children}
        </TourContext.Provider>
    );
}

export default GuidedTour;
