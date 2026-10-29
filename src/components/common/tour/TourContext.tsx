'use client';

import { createContext, useContext } from "react";

export interface TourContextType {
    isTourCompleted: boolean;
    startTour: () => void;
    restartTour: () => void;
}

export const TourContext = createContext<TourContextType | null>(null);

export function useTourContext(): TourContextType {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error("useTourContext deve ser usado dentro de um TourProvider");
    }
    return context;
}
