'use client';

import { useTour } from "@/hooks/useTour";
import { TourContext } from "./TourContext";

interface GuidedTourProps {
    children: React.ReactNode;
    setMobileMenuOpen?: (open: boolean) => void;
}

export function GuidedTour({ children, setMobileMenuOpen }: GuidedTourProps) {
    const {
        isTourCompleted,
        startTour,
        restartTour,
        startCurrentPageTour,
        registerPageTour,
    } = useTour(setMobileMenuOpen);

    return (
        <TourContext.Provider
            value={{
                isTourCompleted,
                startTour,
                restartTour,
                startCurrentPageTour,
                registerPageTour,
            }}
        >
            {children}
        </TourContext.Provider>
    );
}

export default GuidedTour;
