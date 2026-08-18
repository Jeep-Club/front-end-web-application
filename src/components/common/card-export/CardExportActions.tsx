"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Check,
    ChevronDown,
    FileDown,
    ImageDown,
    LoaderCircle,
    type LucideIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/common/button";

export type CardExportFormat =
    | "pdf"
    | "png";

export type CardExportScope =
    | "front"
    | "front-and-back";

export interface CardExportRequest {
    format: CardExportFormat;
    scope: CardExportScope;
}

interface CardExportActionsProps {
    onExport?: (
        request: CardExportRequest,
    ) => void | Promise<void>;
    disabled?: boolean;
    className?: string;
}

interface CardExportButtonProps {
    format: CardExportFormat;
    label: string;
    icon: LucideIcon;
    onExport?: (
        request: CardExportRequest,
    ) => void | Promise<void>;
    disabled?: boolean;
}

const exportScopeOptions: Array<{
    value: CardExportScope;
    label: string;
    description: string;
}> = [
    {
        value: "front",
        label: "Somente frente",
        description:
            "Exporta apenas a parte frontal da carteirinha.",
    },
    {
        value: "front-and-back",
        label: "Frente e verso",
        description:
            "Exporta os dois lados da carteirinha.",
    },
];

function CardExportButton({
    format,
    label,
    icon: Icon,
    onExport,
    disabled,
}: CardExportButtonProps) {
    const containerRef =
        useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] =
        useState(false);

    const [isExporting, setIsExporting] =
        useState(false);

    useEffect(() => {
        function handleOutsideClick(
            event: MouseEvent,
        ) {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );
        };
    }, []);

    const handleExport = async (
        scope: CardExportScope,
    ) => {
        if (!onExport || isExporting) {
            return;
        }

        try {
            setIsExporting(true);
            setIsOpen(false);

            await onExport({
                format,
                scope,
            });
        } finally {
            setIsExporting(false);
        }
    };

    const isDisabled =
        disabled ||
        !onExport ||
        isExporting;

    return (
        <div
            ref={containerRef}
            className="relative"
        >
            <Button
                type="button"
                disabled={isDisabled}
                onClick={() =>
                    setIsOpen(
                        (current) =>
                            !current,
                    )
                }
                title={`Exportar carteirinha em ${label}`}
                className="w-full gap-2 px-3 py-2 sm:w-auto"
            >
                {isExporting ? (
                    <LoaderCircle
                        size={15}
                        className="animate-spin"
                    />
                ) : (
                    <Icon size={15} />
                )}

                <span className="text-xs">
                    {isExporting
                        ? "Exportando..."
                        : label}
                </span>

                {!isExporting && (
                    <ChevronDown
                        size={14}
                        className={`transition-transform ${
                            isOpen
                                ? "rotate-180"
                                : ""
                        }`}
                    />
                )}
            </Button>

            {isOpen && !isDisabled && (
                <div className="fixed inset-x-4 bottom-4 z-50 max-h-[70dvh] overflow-y-auto rounded-xl border border-j-gray-200 bg-j-white p-2 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-[calc(100%+8px)] sm:right-0 sm:w-64 sm:overflow-hidden sm:shadow-xl">
                    <div className="border-b border-j-gray-100 px-3 py-2">
                        <p className="text-xs font-extrabold text-j-gray-700">
                            Exportar em{" "}
                            {label}
                        </p>

                        <p className="text-[11px] text-j-gray-400">
                            Escolha quais lados
                            deseja exportar.
                        </p>
                    </div>

                    <div className="mt-1 flex flex-col gap-1">
                        {exportScopeOptions.map(
                            (option) => (
                                <button
                                    key={
                                        option.value
                                    }
                                    type="button"
                                    onClick={() =>
                                        handleExport(
                                            option.value,
                                        )
                                    }
                                    className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-j-gray-100"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-j-yellow-400 text-j-blue-800">
                                        <Check
                                            size={
                                                12
                                            }
                                            strokeWidth={
                                                3
                                            }
                                        />
                                    </span>

                                    <span className="min-w-0">
                                        <span className="block text-xs font-bold text-j-gray-700">
                                            {
                                                option.label
                                            }
                                        </span>

                                        <span className="mt-0.5 block text-[10px] leading-relaxed text-j-gray-400">
                                            {
                                                option.description
                                            }
                                        </span>
                                    </span>
                                </button>
                            ),
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function CardExportActions({
    onExport,
    disabled,
    className,
}: CardExportActionsProps) {
    return (
        <div
            className={twMerge(
                "grid grid-cols-2 gap-2 sm:flex sm:justify-end",
                className,
            )}
        >
            <CardExportButton
                format="pdf"
                label="PDF"
                icon={FileDown}
                onExport={onExport}
                disabled={disabled}
            />

            <CardExportButton
                format="png"
                label="PNG"
                icon={ImageDown}
                onExport={onExport}
                disabled={disabled}
            />
        </div>
    );
}

export default CardExportActions;
