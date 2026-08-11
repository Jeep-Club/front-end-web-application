'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type Driver } from "driver.js";
import { getTourSteps } from "@/config/tourSteps";
import { useUserStore } from "@/stores/userStore";
import { hasAnyAdminAccess } from "@/config/adminModules";

export function getTourStorageKey(canAccessAdmin: boolean): string {
    return canAccessAdmin ? "tour_completed_admin" : "tour_completed_member";
}

export function useTour() {
    const [isTourCompleted, setIsTourCompleted] = useState<boolean>(true);
    const driverRef = useRef<Driver | null>(null);

    const permissions = useUserStore((state) => state.permissions);
    const canAccessAdmin = hasAnyAdminAccess(permissions);

    const storageKey = getTourStorageKey(canAccessAdmin);

    // Carrega o estado salvo no localStorage para o perfil específico
    useEffect(() => {
        if (typeof window !== "undefined") {
            const completed = localStorage.getItem(storageKey) === "true";
            setIsTourCompleted(completed);
        }
    }, [storageKey]);

    const markAsCompleted = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, "true");
            setIsTourCompleted(true);
        }
    }, [storageKey]);

    const startTour = useCallback(() => {
        if (typeof window === "undefined") return;

        if (driverRef.current) {
            driverRef.current.destroy();
            driverRef.current = null;
        }

        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const steps = getTourSteps(canAccessAdmin, isMobile);

        const driverObj = driver({
            animate: true,
            duration: 400,
            smoothScroll: true,
            showProgress: true,
            progressText: "Passo {{current}} de {{total}}",
            nextBtnText: "Próximo →",
            prevBtnText: "← Anterior",
            doneBtnText: "Concluir ✓",
            skipMissingElement: true,
            steps,
            onCloseClick: (_element, _step, { driver: d }) => {
                if (!d.isLastStep()) {
                    const confirmed = window.confirm(
                        "Deseja realmente sair do tutorial? Você poderá reiniciá-lo a qualquer momento pelo menu do seu perfil."
                    );
                    if (!confirmed) {
                        return;
                    }
                }
                markAsCompleted();
                d.destroy();
            },
            onDoneClick: (_element, _step, { driver: d }) => {
                markAsCompleted();
                d.destroy();
            },
            onDestroyed: () => {
                markAsCompleted();
            },
        });

        driverRef.current = driverObj;
        driverObj.drive();
    }, [canAccessAdmin, markAsCompleted]);

    const restartTour = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(storageKey);
            setIsTourCompleted(false);
        }
        if (driverRef.current) {
            driverRef.current.destroy();
            driverRef.current = null;
        }
        setTimeout(() => {
            startTour();
        }, 100);
    }, [storageKey, startTour]);

    return {
        isTourCompleted,
        startTour,
        restartTour,
    };
}
