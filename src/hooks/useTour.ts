'use client';

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { driver, type Driver, type DriveStep } from "driver.js";
import { resolveRouteTourSteps } from "@/config/tourSteps";
import { useUserStore } from "@/stores/userStore";
import { hasAnyAdminAccess } from "@/config/adminModules";
import { confirmTourExit } from "@/components/common/tour/confirmTourExit";
import { TourContext } from "@/components/common/tour/TourContext";

const INITIAL_TOUR_SEEN_KEY = "tour_initial_seen_v1";
export const FORCE_START_TOUR_KEY = "tour_force_start_target";

export function getTourStorageKey(canAccessAdmin: boolean): string {
    return canAccessAdmin ? "tour_completed_admin" : "tour_completed_member";
}

/**
 * Solicita que o tutorial da rota ou chave informada inicie automaticamente
 * assim que a página de destino terminar de montar.
 */
export function requestTourStart(target: string = "current") {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(FORCE_START_TOUR_KEY, target);
}

export function resetAllTours() {
    if (typeof window === "undefined") return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("tour_") || key.includes("tour"))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(INITIAL_TOUR_SEEN_KEY);
    sessionStorage.removeItem("force_branch_tour");
    sessionStorage.removeItem(FORCE_START_TOUR_KEY);
}

export interface PageTourOptions {
    storageKey?: string;
    steps: DriveStep[] | ((isMobile: boolean) => DriveStep[]);
    autoStartOnFirstVisit?: boolean;
    enabled?: boolean;
    confirmOnExit?: boolean;
    exitConfirmMessage?: string;
    onBeforeStart?: () => void;
    onCompleted?: () => void;
    isShellTour?: boolean;
}

export function usePageTour({
    storageKey,
    steps,
    autoStartOnFirstVisit = false,
    enabled = true,
    confirmOnExit = true,
    exitConfirmMessage = "Deseja realmente sair do tutorial? Você poderá reiniciá-lo a qualquer momento pelo botão de ajuda.",
    onBeforeStart,
    onCompleted,
    isShellTour = false,
}: PageTourOptions) {
    const tourContext = useContext(TourContext);
    const registerPageTour = tourContext?.registerPageTour;

    const [completedKeys, setCompletedKeys] = useState<Record<string, boolean>>({});
    const isTourCompleted = Boolean(
        storageKey && (
            completedKeys[storageKey] ?? (typeof window !== "undefined" && localStorage.getItem(storageKey) === "true")
        )
    );

    const driverRef = useRef<Driver | null>(null);
    const exitConfirmationRef = useRef<AbortController | null>(null);
    const enabledRef = useRef<boolean>(enabled);

    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    useEffect(() => () => exitConfirmationRef.current?.abort(), []);

    const markAsCompleted = useCallback(() => {
        if (typeof window !== "undefined" && storageKey) {
            localStorage.setItem(storageKey, "true");
            setCompletedKeys((prev) => ({ ...prev, [storageKey]: true }));
        }
        onCompleted?.();
    }, [storageKey, onCompleted]);

    useEffect(() => {
        const handleDiverge = () => {
            if (driverRef.current) {
                driverRef.current.destroy();
                driverRef.current = null;
            }
            markAsCompleted();
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
                document.querySelectorAll('.driver-overlay, .driver-popover').forEach((el) => el.remove());
            }
        };

        window.addEventListener('tour:destroy-and-diverge', handleDiverge);
        return () => {
            window.removeEventListener('tour:destroy-and-diverge', handleDiverge);
        };
    }, [markAsCompleted]);

    const startTour = useCallback(() => {
        if (typeof window === "undefined") return;

        onBeforeStart?.();
        localStorage.setItem(INITIAL_TOUR_SEEN_KEY, "true");

        if (driverRef.current) {
            driverRef.current.destroy();
            driverRef.current = null;
        }

        document.querySelectorAll('.driver-overlay, .driver-popover').forEach((el) => el.remove());

        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const resolvedSteps = typeof steps === "function" ? steps(isMobile) : steps;

        if (!resolvedSteps || resolvedSteps.length === 0) return;

        const firstElementSelector = resolvedSteps.find((s) => s.element)?.element as string | undefined;

        const executeDrive = () => {
            const requestExit = async (_element: unknown, _step: unknown, { driver: d }: { driver: Driver }) => {
                if (confirmOnExit) {
                    if (exitConfirmationRef.current) return;
                    const controller = new AbortController();
                    exitConfirmationRef.current = controller;
                    const confirmed = await confirmTourExit(exitConfirmMessage, controller.signal);
                    exitConfirmationRef.current = null;
                    if (!confirmed || !d.isActive()) return;
                }
                markAsCompleted();
                window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
                d.destroy();
            };

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
                steps: resolvedSteps,
                onCloseClick: requestExit,
                onDestroyStarted: requestExit,
                onDoneClick: (_element, _step, { driver: d }) => {
                    markAsCompleted();
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
                    }
                    d.destroy();
                },
                onDestroyed: () => {
                    exitConfirmationRef.current?.abort();
                    markAsCompleted();
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
                    }
                },
            });

            driverRef.current = driverObj;
            driverObj.drive();
        };

        if (firstElementSelector && !document.querySelector(firstElementSelector)) {
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (document.querySelector(firstElementSelector)) {
                    clearInterval(interval);
                    executeDrive();
                } else if (attempts > 20) {
                    clearInterval(interval);
                    executeDrive();
                }
            }, 100);
        } else {
            executeDrive();
        }
    }, [steps, confirmOnExit, exitConfirmMessage, markAsCompleted, onBeforeStart]);

    const restartTour = useCallback(() => {
        if (typeof window !== "undefined" && storageKey) {
            localStorage.removeItem(storageKey);
            setCompletedKeys((prev) => ({ ...prev, [storageKey]: false }));
        }
        if (driverRef.current) {
            driverRef.current.destroy();
            driverRef.current = null;
        }
        setTimeout(() => {
            startTour();
        }, 100);
    }, [storageKey, startTour]);

    // Registra o tour específico da página no TourContext para que o botão "Precisa de ajuda?" no Topbar o acione.
    useEffect(() => {
        if (isShellTour || !registerPageTour) return;
        registerPageTour(restartTour);
        return () => {
            registerPageTour(null);
        };
    }, [isShellTour, registerPageTour, restartTour]);

    // Disparo sob demanda quando o usuário solicita explicitamente iniciar um tutorial de outra rota (ex.: via /tutoriais).
    useEffect(() => {
        if (typeof window === "undefined") return;

        const forcedTarget = sessionStorage.getItem(FORCE_START_TOUR_KEY);
        if (!forcedTarget) return;

        const currentPath = window.location.pathname;
        const currentFullRoute = `${currentPath}${window.location.search}`;

        const matchesTarget = isShellTour
            ? forcedTarget === storageKey
            : (forcedTarget === "current" || forcedTarget === storageKey || forcedTarget === currentPath || forcedTarget === currentFullRoute);

        if (!matchesTarget) return;

        sessionStorage.removeItem(FORCE_START_TOUR_KEY);

        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (enabledRef.current || attempts > 30) {
                clearInterval(interval);
                if (storageKey) {
                    setCompletedKeys((prev) => ({ ...prev, [storageKey]: false }));
                }
                setTimeout(() => {
                    startTour();
                }, 100);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isShellTour, storageKey, startTour]);

    // O tutorial automático inicial permanece desativado por padrão (autoStartOnFirstVisit = false).
    void autoStartOnFirstVisit;

    return {
        isTourCompleted,
        startTour,
        restartTour,
    };
}

export function useTour(setMobileMenuOpen?: (open: boolean) => void) {
    const permissions = useUserStore((state) => state.permissions);
    const canAccessAdmin = hasAnyAdminAccess(permissions);
    const storageKey = getTourStorageKey(canAccessAdmin);
    const pageTourHandlerRef = useRef<(() => void) | null>(null);

    const registerPageTour = useCallback((handler: (() => void) | null) => {
        pageTourHandlerRef.current = handler;
    }, []);

    const getSteps = useCallback((isMobile: boolean) => {
        const pathname = typeof window !== "undefined" ? window.location.pathname : "/feed";
        const tab = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null;
        return resolveRouteTourSteps(pathname, {
            canAccessAdmin,
            isMobile,
            setMobileMenuOpen,
            tab,
        });
    }, [canAccessAdmin, setMobileMenuOpen]);

    const shellTour = usePageTour({
        storageKey,
        steps: getSteps,
        autoStartOnFirstVisit: false,
        enabled: permissions.length > 0,
        confirmOnExit: true,
        exitConfirmMessage: "Deseja realmente sair do tutorial? Você poderá reiniciá-lo a qualquer momento pelo botão 'Precisa de ajuda?' no topo da tela.",
        isShellTour: true,
    });

    const startCurrentPageTour = useCallback(() => {
        if (pageTourHandlerRef.current) {
            pageTourHandlerRef.current();
            return;
        }
        shellTour.restartTour();
    }, [shellTour]);

    return {
        ...shellTour,
        startCurrentPageTour,
        registerPageTour,
    };
}
