"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Compass,
    Monitor,
    Smartphone,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import type { TutorialImageStep } from "@/config/tutorialVisualGuides";

type DevicePreview = "desktop" | "mobile";

interface TutorialImageViewerModalProps {
    title: string;
    steps: TutorialImageStep[];
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    completeLabel?: string;
    onOpenLiveTour?: () => void;
}

export function TutorialImageViewerModal({
    title,
    steps,
    isOpen,
    onClose,
    onComplete,
    completeLabel,
    onOpenLiveTour,
}: TutorialImageViewerModalProps) {
    if (!isOpen || steps.length === 0) return null;

    return (
        <TutorialImageViewerDialog
            key={title}
            title={title}
            steps={steps}
            onClose={onClose}
            onComplete={onComplete}
            completeLabel={completeLabel}
            onOpenLiveTour={onOpenLiveTour}
        />
    );
}

function TutorialImageViewerDialog({
    title,
    steps,
    onClose,
    onComplete,
    completeLabel = "Concluir",
    onOpenLiveTour,
}: Omit<TutorialImageViewerModalProps, "isOpen">) {
    const titleId = useId();
    const captionId = useId();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const touchStartX = useRef<number | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [deviceView, setDeviceView] = useState<DevicePreview>(() =>
        typeof window !== "undefined" && window.innerWidth < 768 ? "mobile" : "desktop",
    );
    const [isZoomed, setIsZoomed] = useState(false);
    const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        document.body.style.overflow = "hidden";

        const focusTimer = window.setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 10);

        return () => {
            window.clearTimeout(focusTimer);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, []);

    const total = steps.length;
    const safeIndex = Math.min(currentIndex, Math.max(total - 1, 0));
    const currentStep = steps[safeIndex];
    const isLastStep = safeIndex === total - 1;

    const handleNext = useCallback(() => {
        if (isLastStep) {
            onComplete();
            onClose();
            return;
        }
        setIsZoomed(false);
        setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
    }, [isLastStep, onClose, onComplete, total]);

    const handlePrev = useCallback(() => {
        setIsZoomed(false);
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                if (safeIndex < total - 1) {
                    setIsZoomed(false);
                    setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
                }
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                if (safeIndex > 0) {
                    setIsZoomed(false);
                    setCurrentIndex((prev) => Math.max(prev - 1, 0));
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, safeIndex, total]);

    if (!currentStep) return null;

    const activeSrc =
        deviceView === "mobile"
            ? currentStep.mobileSrc
            : currentStep.desktopSrc;
    const hasImageError = Boolean(failedSrcs[activeSrc]);

    return (
        <div
            role="presentation"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-j-black/70 p-2 backdrop-blur-[2px] sm:p-5"
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={captionId}
                className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-2xl"
            >
                {/* Cabeçalho */}
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-j-gray-200 px-4 py-3 sm:px-6">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-j-yellow-300 px-2 py-0.5 text-xs font-extrabold text-j-blue-900">
                                Passo {safeIndex + 1} de {total}
                            </span>
                            <h2
                                id={titleId}
                                className="truncate text-base font-extrabold text-j-blue-800 sm:text-lg"
                            >
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Alternador Computador / Celular */}
                        <div
                            role="group"
                            aria-label="Formato das imagens do tutorial"
                            className="inline-flex rounded-xl border border-j-gray-200 bg-j-gray-100 p-0.5"
                        >
                            <button
                                type="button"
                                aria-pressed={deviceView === "desktop"}
                                onClick={() => {
                                    setDeviceView("desktop");
                                    setIsZoomed(false);
                                }}
                                className={twMerge(
                                    "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-j-blue-800",
                                    deviceView === "desktop"
                                        ? "bg-j-white text-j-blue-800 shadow-xs"
                                        : "text-j-gray-600 hover:text-j-blue-800",
                                )}
                            >
                                <Monitor size={14} aria-hidden="true" />
                                <span className="hidden sm:inline">Computador</span>
                            </button>
                            <button
                                type="button"
                                aria-pressed={deviceView === "mobile"}
                                onClick={() => {
                                    setDeviceView("mobile");
                                    setIsZoomed(false);
                                }}
                                className={twMerge(
                                    "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-j-blue-800",
                                    deviceView === "mobile"
                                        ? "bg-j-white text-j-blue-800 shadow-xs"
                                        : "text-j-gray-600 hover:text-j-blue-800",
                                )}
                            >
                                <Smartphone size={14} aria-hidden="true" />
                                <span className="hidden sm:inline">Celular</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            aria-pressed={isZoomed}
                            aria-label={isZoomed ? "Reduzir zoom da imagem" : "Ampliar imagem"}
                            title={isZoomed ? "Reduzir zoom" : "Ampliar imagem"}
                            onClick={() => setIsZoomed((prev) => !prev)}
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-j-gray-200 bg-j-white text-j-gray-700 transition-colors hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800"
                        >
                            {isZoomed ? (
                                <ZoomOut size={16} aria-hidden="true" />
                            ) : (
                                <ZoomIn size={16} aria-hidden="true" />
                            )}
                        </button>

                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar tutorial ilustrado"
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-j-gray-200 bg-j-white text-j-gray-700 transition-colors hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>
                </header>

                {/* Área da Imagem */}
                <div
                    onTouchStart={(event) => {
                        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
                    }}
                    onTouchEnd={(event) => {
                        if (touchStartX.current === null) return;
                        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
                        const delta = endX - touchStartX.current;
                        touchStartX.current = null;
                        if (delta <= -50 && safeIndex < total - 1) {
                            handleNext();
                        } else if (delta >= 50 && safeIndex > 0) {
                            handlePrev();
                        }
                    }}
                    className={twMerge(
                        "relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-j-gray-100 p-3 sm:p-5",
                    )}
                >
                    {hasImageError ? (
                        <div className="flex max-w-md flex-col items-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                            <p className="text-sm font-bold text-j-blue-800">
                                Imagem do passo indisponível no momento
                            </p>
                            <p className="mt-1 text-xs text-j-gray-500">
                                Você pode alternar para outro formato acima ou iniciar o tour guiado direto na tela.
                            </p>
                        </div>
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={activeSrc}
                            alt={currentStep.alt}
                            onClick={() => setIsZoomed((prev) => !prev)}
                            onError={() =>
                                setFailedSrcs((prev) => ({
                                    ...prev,
                                    [activeSrc]: true,
                                }))
                            }
                            className={twMerge(
                                "rounded-xl border border-j-gray-200 bg-j-white shadow-md transition-transform duration-200",
                                isZoomed
                                    ? "max-h-none w-full max-w-none cursor-zoom-out sm:w-[135%]"
                                    : deviceView === "mobile"
                                      ? "max-h-[60dvh] w-auto max-w-full cursor-zoom-in object-contain"
                                      : "max-h-[60dvh] w-auto max-w-full cursor-zoom-in object-contain",
                            )}
                        />
                    )}
                </div>

                {/* Legenda curta + Rodapé de navegação */}
                <footer className="flex flex-col gap-3 border-t border-j-gray-200 bg-j-white px-4 py-3 sm:px-6 sm:py-4">
                    <p
                        id={captionId}
                        className="text-center text-sm font-semibold text-j-blue-800 sm:text-base"
                    >
                        {currentStep.caption}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={safeIndex === 0}
                                className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-j-gray-300 bg-j-white px-3.5 py-2 text-xs font-bold text-j-blue-800 transition-colors hover:bg-j-gray-100 focus-visible:outline-2 focus-visible:outline-j-blue-800 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                            >
                                <ChevronLeft size={16} aria-hidden="true" />
                                Anterior
                            </button>

                            <div
                                role="tablist"
                                aria-label="Passos do tutorial"
                                className="flex items-center gap-1.5 px-1"
                            >
                                {steps.map((step, index) => {
                                    const active = index === safeIndex;
                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            aria-label={`Ir para o passo ${index + 1}`}
                                            onClick={() => {
                                                setIsZoomed(false);
                                                setCurrentIndex(index);
                                            }}
                                            className={twMerge(
                                                "h-2.5 cursor-pointer rounded-full transition-all focus-visible:outline-2 focus-visible:outline-j-blue-800",
                                                active
                                                    ? "w-7 bg-j-blue-800"
                                                    : "w-2.5 bg-j-gray-300 hover:bg-j-gray-400",
                                            )}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {onOpenLiveTour && (
                                <button
                                    type="button"
                                    onClick={onOpenLiveTour}
                                    className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-j-gray-300 bg-j-gray-100 px-3 py-2 text-xs font-bold text-j-blue-800 transition-colors hover:bg-j-gray-200 focus-visible:outline-2 focus-visible:outline-j-blue-800"
                                >
                                    <Compass size={15} aria-hidden="true" />
                                    Abrir na tela
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-j-yellow-300 px-4 py-2 text-xs font-extrabold text-j-blue-900 shadow-xs transition-colors hover:bg-j-yellow-400 focus-visible:outline-2 focus-visible:outline-j-blue-800 sm:text-sm"
                            >
                                {isLastStep ? (
                                    <>
                                        <Check size={16} aria-hidden="true" />
                                        {completeLabel}
                                    </>
                                ) : (
                                    <>
                                        Próximo
                                        <ChevronRight size={16} aria-hidden="true" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </footer>
            </section>
        </div>
    );
}
