"use client";

import Image from "next/image";
import {
    useRef,
    useState,
} from "react";
import toast from "react-hot-toast";
import {
    captureCardElement,
    exportCardImages,
} from "@/utils/card-export/exportCard";
import {
    Globe,
    UserRound,
} from "lucide-react";

import {
    CardExportActions,
    type CardExportRequest,
} from "@/components/common/card-export/CardExportActions";

interface MembershipCardProps {
    profilePhotoUrl?: string | null;
    fullName?: string | null;
    birthDate?: string | null;
    memberSince?: string | null;
    phoneNumber?: string | null;
    roleLabel?: string | null;
    registrationNumber?: string | null;
    cityState?: string | null;
    driverLicense?: string | null;
    bloodType?: string | null;
    exportFileName?: string;
}

type CardSide = "front" | "back";

function displayValue(
    value?: string | null,
) {
    return value?.trim() || "—";
}

function formatDate(
    value?: string | null,
) {
    if (!value) {
        return "—";
    }

    const normalizedDate =
        /^\d{4}-\d{2}-\d{2}$/.test(
            value,
        )
            ? `${value}T12:00:00`
            : value;

    const date = new Date(
        normalizedDate,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
    ).format(date);
}

function formatMembershipId(
    value?: string | null,
) {
    if (!value) {
        return "0000-0";
    }

    const digits =
        value.replace(/\D/g, "");

    if (!digits) {
        return value;
    }

    const normalizedDigits =
        digits.padStart(5, "0");

    return `${normalizedDigits.slice(
        0,
        -1,
    )}-${normalizedDigits.slice(-1)}`;
}

function waitForRender() {
    return new Promise<void>(
        (resolve) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(
                    () => resolve(),
                );
            });
        },
    );
}

interface CardFieldProps {
    label: string;
    value?: string | null;
}

function CardField({
    label,
    value,
}: CardFieldProps) {
    return (
        <div className="flex min-w-0 flex-col gap-[clamp(1px,0.45cqw,4px)]">
            <span className="max-w-full truncate text-[clamp(6px,1.35cqw,11px)] font-extrabold uppercase tracking-[0.08em] text-j-blue-400">
                {label}
            </span>

            <div className="flex min-h-[clamp(16px,5.2cqw,38px)] items-center overflow-hidden rounded-[clamp(4px,0.9cqw,8px)] border border-j-blue-100 bg-j-gray-100/70 px-[clamp(3px,1.25cqw,10px)] py-[clamp(1px,0.65cqw,5px)]">
                <span className="w-full truncate text-[clamp(7px,1.75cqw,14px)] font-bold leading-tight text-j-blue-800">
                    {displayValue(value)}
                </span>
            </div>
        </div>
    );
}

export function MembershipCard({
    profilePhotoUrl,
    fullName,
    birthDate,
    memberSince,
    phoneNumber,
    roleLabel,
    registrationNumber,
    cityState,
    driverLicense,
    bloodType,
    exportFileName,
}: MembershipCardProps) {
    const [
        currentSide,
        setCurrentSide,
    ] = useState<CardSide>("front");

    const cardContainerRef =
        useRef<HTMLDivElement>(null);

    const handleExport = async ({
        format,
        scope,
    }: CardExportRequest) => {
        const previousSide = currentSide;

        try {
            setCurrentSide("front");

            await waitForRender();

            const frontElement =
                cardContainerRef.current
                    ?.querySelector<HTMLElement>(
                        '[data-card-side="front"]',
                    );

            if (!frontElement) {
                throw new Error(
                    "Não foi possível localizar a frente da carteirinha",
                );
            }

            const frontImage =
                await captureCardElement(
                    frontElement,
                );

            let backImage:
                | string
                | undefined;

            if (
                scope ===
                "front-and-back"
            ) {
                setCurrentSide("back");

                await waitForRender();

                const backElement =
                    cardContainerRef.current
                        ?.querySelector<HTMLElement>(
                            '[data-card-side="back"]',
                        );

                if (!backElement) {
                    throw new Error(
                        "Não foi possível localizar o verso da carteirinha",
                    );
                }

                backImage =
                    await captureCardElement(
                        backElement,
                    );
            }

            await exportCardImages({
                format,
                scope,
                frontImage,
                backImage,
                fileName:
                    exportFileName ??
                    `carteirinha-${
                        registrationNumber ??
                        fullName ??
                        "associado"
                    }`,
            });

            toast.success(
                `${
                    format === "pdf"
                        ? "PDF"
                        : "Imagem"
                } gerado com sucesso!`,
            );
        } catch (error) {
            console.error(
                "Erro ao exportar carteirinha:",
                error,
            );

            const message =
                error instanceof Error
                    ? error.message
                    : "Erro ao exportar a carteirinha";

            toast.error(message);
        } finally {
            setCurrentSide(
                previousSide,
            );
        }
    };

    return (
        <section className="flex w-full min-w-0 flex-col gap-3">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-sm font-extrabold text-j-gray-700">
                        Carteirinha digital
                    </h2>

                    <p className="text-[11px] text-j-gray-400">
                        Frente e verso
                    </p>
                </div>

                <div
                    className="flex items-center gap-2"
                    aria-label="Selecionar lado da carteirinha"
                >
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentSide(
                                "front",
                            )
                        }
                        aria-label="Visualizar frente"
                        aria-pressed={
                            currentSide ===
                            "front"
                        }
                        title="Frente"
                        className={`h-2.5 w-2.5 cursor-pointer rounded-full transition-colors ${
                            currentSide ===
                            "front"
                                ? "bg-j-yellow-400"
                                : "bg-j-gray-300 hover:bg-j-gray-400"
                        }`}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setCurrentSide(
                                "back",
                            )
                        }
                        aria-label="Visualizar verso"
                        aria-pressed={
                            currentSide ===
                            "back"
                        }
                        title="Verso"
                        className={`h-2.5 w-2.5 cursor-pointer rounded-full transition-colors ${
                            currentSide ===
                            "back"
                                ? "bg-j-yellow-400"
                                : "bg-j-gray-300 hover:bg-j-gray-400"
                        }`}
                    />
                </div>
            </header>

            <div
                ref={cardContainerRef}
                className="w-full [container-type:inline-size]"
            >
                {currentSide ===
                "front" ? (
                    <div
                        id="membership-card-front"
                        data-card-side="front"
                        className="flex aspect-[1050/656] w-full flex-col overflow-hidden rounded-[clamp(10px,2.4cqw,18px)] border border-j-blue-100 bg-j-white shadow-[0_12px_32px_rgba(6,30,80,0.18)]"
                    >
                        <div className="h-[clamp(3px,0.75cqw,6px)] w-full shrink-0 bg-j-yellow-300" />
                        <div className="h-[clamp(14px,5.8cqw,40px)] w-full shrink-0 bg-j-blue-800" />

                        <div className="flex min-h-0 flex-1 flex-col px-[clamp(9px,4.7cqw,30px)] pb-[clamp(7px,2.5cqw,18px)]">
                            <header className="grid shrink-0 grid-cols-[clamp(54px,16cqw,105px)_1fr] items-center gap-[clamp(5px,2cqw,14px)]">
                                <div className="mt-[clamp(3px,0.8cqw,6px)] flex justify-center">
                                    <div className="relative h-[clamp(36px,10cqw,68px)] w-[clamp(36px,10cqw,68px)] overflow-hidden">
                                        <Image
                                            src="/images/logo_grande.jpg"
                                            alt="Jeep Clube Tamoios"
                                            fill
                                            className="object-contain mix-blend-multiply"
                                            priority
                                        />
                                    </div>
                                </div>

                                <div className="min-w-0 text-center">
                                    <h3 className="whitespace-nowrap text-[clamp(12px,3.55cqw,27px)] font-black uppercase leading-none tracking-tight text-j-blue-800">
                                        Jeep Clube Tamoios
                                    </h3>

                                    <p className="mt-[clamp(2px,0.7cqw,5px)] text-[clamp(7px,1.65cqw,12px)] font-bold uppercase tracking-[0.12em] text-j-blue-300">
                                        Caraguatatuba • Fundado em 09/09/1999
                                    </p>
                                </div>
                            </header>

                            <div className="grid shrink-0 grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)] gap-[clamp(5px,3.8cqw,30px)]">
                                <CardField
                                    label="Nome e sobrenome"
                                    value={fullName}
                                />

                                <CardField
                                    label="Data nascimento"
                                    value={formatDate(birthDate)}
                                />
                            </div>

                            <div className="mt-[clamp(2px,1.5cqw,10px)] grid min-h-0 flex-1 grid-cols-[35%_1fr] gap-[clamp(6px,2cqw,14px)]">
                                <div className="flex min-h-0 flex-col gap-[clamp(4px,1cqw,8px)] rounded-[clamp(7px,1.7cqw,14px)] bg-j-blue-800 p-[clamp(4px,1.2cqw,10px)]">
                                    <div className="min-h-0 flex-1 overflow-hidden rounded-[clamp(5px,1.4cqw,11px)] border-[clamp(2px,0.45cqw,3px)] border-j-yellow-300 bg-j-white shadow-inner">
                                        {profilePhotoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={
                                                    profilePhotoUrl
                                                }
                                                alt={
                                                    fullName
                                                        ? `Foto de ${fullName}`
                                                        : "Foto do associado"
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-j-blue-900">
                                                <UserRound className="h-[clamp(22px,8cqw,50px)] w-[clamp(22px,8cqw,50px)] text-j-blue-100" />
                                            </div>
                                        )}
                                    </div>

                                    <p className="truncate rounded-[clamp(4px,0.8cqw,7px)] bg-j-yellow-300 px-[clamp(4px,1cqw,8px)] py-[clamp(2px,0.6cqw,5px)] text-center text-[clamp(10px,3.5cqw,22px)] font-black leading-none tracking-wide text-j-blue-950">
                                        {formatMembershipId(
                                            registrationNumber,
                                        )}
                                    </p>
                                </div>

                                <div className="grid min-h-0 content-start gap-[clamp(2px,0.9cqw,6px)] rounded-[clamp(7px,1.7cqw,14px)] border border-j-blue-100 bg-j-white/90 p-[clamp(3px,1.4cqw,11px)] shadow-sm">
                                    <CardField
                                        label="UF e cidade"
                                        value={
                                            cityState
                                        }
                                    />

                                    <div className="grid grid-cols-2 gap-[clamp(3px,1.2cqw,8px)]">
                                        <CardField
                                            label="Habilitação"
                                            value={
                                                driverLicense
                                            }
                                        />

                                        <CardField
                                            label="Membro desde"
                                            value={formatDate(
                                                memberSince,
                                            )}
                                        />
                                    </div>

                                    <CardField
                                        label="Telefone"
                                        value={
                                            phoneNumber
                                        }
                                    />

                                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.52fr)_minmax(24px,0.42fr)] items-end gap-[clamp(4px,1.2cqw,9px)]">
                                        <CardField
                                            label="Função"
                                            value={
                                                roleLabel
                                            }
                                        />

                                        <CardField
                                            label="T sanguíneo"
                                            value={
                                                bloodType
                                            }
                                        />

                                        <div
                                            aria-label="Espaço reservado para QR Code"
                                            className="flex aspect-square w-full items-center justify-center rounded-[clamp(4px,1cqw,8px)] border-[clamp(1px,0.3cqw,2px)] border-dashed border-j-blue-200 bg-j-blue-100/10"
                                        >
                                            <span className="text-center text-[clamp(4px,0.8cqw,7px)] font-bold uppercase tracking-wide text-j-blue-200">
                                                QR Code
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        id="membership-card-back"
                        data-card-side="back"
                        className="flex aspect-[1050/656] w-full flex-col overflow-hidden rounded-[clamp(10px,2.4cqw,18px)] border border-j-blue-800 bg-j-blue-800 shadow-[0_12px_32px_rgba(6,30,80,0.22)]"
                    >
                        <div className="flex min-h-0 flex-1 flex-col">
                            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                                <div className="absolute -right-[8%] -top-[28%] aspect-square w-[42%] rounded-full border-[clamp(8px,4cqw,28px)] border-j-white/5" />
                                <div className="absolute -bottom-[48%] -left-[10%] aspect-square w-[48%] rounded-full border-[clamp(8px,4cqw,28px)] border-j-yellow-300/10" />

                                <div className="relative flex items-center gap-[clamp(10px,3cqw,22px)]">
                                    <div className="relative h-[clamp(62px,18cqw,120px)] w-[clamp(62px,18cqw,120px)] overflow-hidden rounded-[clamp(12px,2.2cqw,18px)] bg-j-white p-1 shadow-xl">
                                        <Image
                                            src="/images/logo_grande.jpg"
                                            alt="Jeep Clube Tamoios"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>

                                    <div className="text-j-white">
                                        <p className="text-[clamp(7px,1.5cqw,11px)] font-bold uppercase tracking-[0.18em] text-j-yellow-300">
                                            Desde 1999
                                        </p>
                                        <p className="mt-1 text-[clamp(14px,4cqw,28px)] font-black uppercase leading-[0.9]">
                                            Jeep Clube
                                            <br />
                                            Tamoios
                                        </p>
                                        <p className="mt-[clamp(3px,0.8cqw,6px)] text-[clamp(6px,1.35cqw,10px)] font-medium text-j-blue-100">
                                            Caraguatatuba • SP
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[clamp(5px,1.2cqw,9px)] w-full shrink-0 bg-j-yellow-300" />

                            <footer className="flex min-h-[20%] shrink-0 items-center justify-center gap-[clamp(24px,12cqw,90px)] bg-j-white px-[clamp(14px,5cqw,36px)] py-[clamp(10px,3cqw,22px)] text-j-blue-950">
                                <div className="flex min-w-0 items-center gap-[clamp(4px,1.5cqw,8px)]">
                                    <Image
                                        src="/svgs/insta.svg"
                                        alt="Instagram"
                                        width={
                                            22
                                        }
                                        height={
                                            22
                                        }
                                        className="h-[clamp(12px,3.5cqw,22px)] w-[clamp(12px,3.5cqw,22px)] shrink-0"
                                    />

                                    <span className="truncate text-[clamp(7px,2cqw,14px)] font-medium">
                                        JeepTamoios
                                    </span>
                                </div>

                                <div className="flex min-w-0 items-center gap-[clamp(4px,1.5cqw,8px)]">
                                    <Globe className="h-[clamp(12px,3.5cqw,22px)] w-[clamp(12px,3.5cqw,22px)] shrink-0" />

                                    <span className="truncate text-[clamp(7px,2cqw,14px)] font-medium">
                                        www.JeepTamoios.com
                                    </span>
                                </div>
                            </footer>
                        </div>
                    </div>
                )}
            </div>

            <CardExportActions
                onExport={handleExport}
            />
        </section>
    );
}

export default MembershipCard;
