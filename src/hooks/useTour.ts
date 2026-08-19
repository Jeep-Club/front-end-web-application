'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type Driver, type DriveStep } from "driver.js";
import { getTourSteps } from "@/config/tourSteps";
import { useUserStore } from "@/stores/userStore";
import { hasAnyAdminAccess } from "@/config/adminModules";

export function getTourStorageKey(canAccessAdmin: boolean): string {
    return canAccessAdmin ? "tour_completed_admin" : "tour_completed_member";
}

/**
 * Remove todas as chaves de tour do localStorage e sessionStorage,
 * fazendo com que o app se comporte como se fosse o primeiro acesso do usuário em todas as telas.
 */
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
    sessionStorage.removeItem("force_branch_tour");
}

export interface PageTourOptions {
    storageKey?: string;
    steps: DriveStep[] | ((isMobile: boolean) => DriveStep[]);
    autoStartOnFirstVisit?: boolean;
    enabled?: boolean;
    confirmOnExit?: boolean;
    exitConfirmMessage?: string;
    onCompleted?: () => void;
}

/**
 * Hook flexível para tours guiados em páginas ou seções específicas com suporte a mobile e desktop.
 */
export function usePageTour({
    storageKey,
    steps,
    autoStartOnFirstVisit = false,
    enabled = true,
    confirmOnExit = false,
    exitConfirmMessage = "Deseja realmente sair do tutorial? Você poderá reiniciá-lo a qualquer momento pelo botão de ajuda.",
    onCompleted,
}: PageTourOptions) {
    const [isTourCompleted, setIsTourCompleted] = useState<boolean>(() => {
        if (typeof window === "undefined" || !storageKey) return false;
        return localStorage.getItem(storageKey) === "true";
    });

    const driverRef = useRef<Driver | null>(null);
    const hasAutoStartedRef = useRef<boolean>(false);

    // Carrega o estado salvo no localStorage
    useEffect(() => {
        if (typeof window !== "undefined" && storageKey) {
            const completed = localStorage.getItem(storageKey) === "true";
            setIsTourCompleted(completed);
        }
    }, [storageKey]);

    const markAsCompleted = useCallback(() => {
        if (typeof window !== "undefined" && storageKey) {
            localStorage.setItem(storageKey, "true");
            setIsTourCompleted(true);
        }
        onCompleted?.();
    }, [storageKey, onCompleted]);

    // Listener para destruição e divergência limpa quando o usuário clica em links durante o tour
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

        if (driverRef.current) {
            driverRef.current.destroy();
            driverRef.current = null;
        }

        // Limpeza de resíduos de overlay anteriores no DOM
        document.querySelectorAll('.driver-overlay, .driver-popover').forEach((el) => el.remove());

        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const resolvedSteps = typeof steps === "function" ? steps(isMobile) : steps;

        if (!resolvedSteps || resolvedSteps.length === 0) return;

        const firstElementSelector = resolvedSteps.find((s) => s.element)?.element as string | undefined;

        const executeDrive = () => {
            const driverObj = driver({
                animate: true,
                duration: 400,
                smoothScroll: true,
                showProgress: true,
                progressText: "Passo {{current}} de {{total}}",
                nextBtnText: "Próximo →",
                prevBtnText: "← Anterior",
                doneBtnText: "Concluir ✓",
                skipMissingElement: false,
                steps: resolvedSteps,
                onCloseClick: (_element, _step, { driver: d }) => {
                    if (confirmOnExit && !d.isLastStep()) {
                        const confirmed = window.confirm(exitConfirmMessage);
                        if (!confirmed) return;
                    }
                    markAsCompleted();
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
                    }
                    d.destroy();
                },
                onDoneClick: (_element, _step, { driver: d }) => {
                    markAsCompleted();
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
                    }
                    d.destroy();
                },
                onDestroyed: () => {
                    markAsCompleted();
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent('tour:close-avatar-menu'));
                    }
                },
            });

            driverRef.current = driverObj;
            driverObj.drive();
        };

        // Se o primeiro elemento ainda não estiver no DOM, aguarda até 2 segundos para o React montar
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
    }, [steps, confirmOnExit, exitConfirmMessage, markAsCompleted]);

    const restartTour = useCallback(() => {
        if (typeof window !== "undefined" && storageKey) {
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

    // ─── Divergência: lê force_branch_tour independentemente de `enabled` ────
    // CRÍTICO: este efeito NUNCA deve depender de `enabled` porque as permissões
    // chegam de forma assíncrona (Zustand) e podem ainda ser [] quando a tela monta.
    // A flag force_branch_tour precisa ser consumida logo que o componente monta.
    useEffect(() => {
        if (typeof window === "undefined") return;

        const isBranchTour = sessionStorage.getItem('force_branch_tour') === 'true';
        if (!isBranchTour) return;

        // Consome a flag imediatamente para não ser reaproveitada
        sessionStorage.removeItem('force_branch_tour');

        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
        hasAutoStartedRef.current = true;

        // Aguarda as permissões do Zustand serem preenchidas (até 3s) antes de iniciar
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            const isEnabled = enabled;
            if (isEnabled || attempts > 30) {
                clearInterval(interval);
                setIsTourCompleted(false);
                setTimeout(() => {
                    startTour();
                }, 100);
            }
        }, 100);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Intencionalmente vazio: deve rodar APENAS na montagem do componente

    // ─── Auto-start na primeira visita (só quando enabled e nunca visitado) ──
    useEffect(() => {
        if (typeof window === "undefined" || !enabled) return;
        if (!autoStartOnFirstVisit || hasAutoStartedRef.current) return;

        const completed = storageKey ? localStorage.getItem(storageKey) === "true" : false;
        if (!completed) {
            hasAutoStartedRef.current = true;
            const timer = setTimeout(() => {
                startTour();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [autoStartOnFirstVisit, enabled, storageKey, startTour]);

    return {
        isTourCompleted,
        startTour,
        restartTour,
    };
}

/**
 * Hook global do layout / feed (compatibilidade total com o sistema anterior e controle do menu mobile).
 */
export function useTour(setMobileMenuOpen?: (open: boolean) => void) {
    const permissions = useUserStore((state) => state.permissions);
    const canAccessAdmin = hasAnyAdminAccess(permissions);
    const storageKey = getTourStorageKey(canAccessAdmin);

    const getSteps = useCallback((isMobile: boolean) => {
        return getTourSteps(canAccessAdmin, isMobile, setMobileMenuOpen);
    }, [canAccessAdmin, setMobileMenuOpen]);

    return usePageTour({
        storageKey,
        steps: getSteps,
        autoStartOnFirstVisit: true,
        enabled: permissions.length > 0,
        confirmOnExit: true,
        exitConfirmMessage: "Deseja realmente sair do tutorial? Você poderá reiniciá-lo a qualquer momento pelo menu do seu perfil.",
    });
}
