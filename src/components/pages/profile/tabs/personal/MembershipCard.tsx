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
} from "@/components/common/card-export/exportCard";
import {
    Globe,
    QrCode,
    UserRound,
} from "lucide-react";

import {
    CardExportActions,
    type CardExportRequest,
} from "@/components/common/card-export/CardExportActions";
import { Logo } from "@/components/common/logo";

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
        <div className="relative min-w-0 pt-[clamp(4px,0.8vw,6px)]">
            <span className="absolute left-[clamp(4px,1vw,8px)] top-0 z-10 max-w-[90%] truncate bg-[#f3f3f3] px-1 text-[clamp(4px,1vw,7px)] font-extrabold uppercase leading-none text-j-black">
                {label}
            </span>

            <div className="flex min-h-[clamp(16px,4vw,28px)] items-center overflow-hidden rounded-[clamp(3px,1vw,6px)] border-[clamp(1px,0.35vw,2px)] border-j-black bg-j-white px-[clamp(4px,1.2vw,8px)] py-[clamp(2px,0.6vw,4px)]">
                <span className="w-full truncate text-[clamp(5px,1.35vw,10px)] font-semibold leading-tight text-j-gray-700">
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
        <section className="flex w-full max-w-[640px] flex-col gap-3">
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
                className="w-full"
            >
                {currentSide ===
                "front" ? (
                    <div
                        id="membership-card-front"
                        data-card-side="front"
                        className="flex aspect-[1011/638] w-full flex-col overflow-hidden rounded-[clamp(8px,2.2vw,16px)] border border-j-gray-200 bg-[#f3f3f3] shadow-sm"
                    >
                        <div className="h-[clamp(12px,4.2vw,28px)] w-full shrink-0 bg-j-blue-700" />

                        <div className="flex min-h-0 flex-1 flex-col px-[clamp(8px,3vw,20px)] pb-[clamp(6px,2vw,16px)]">
                            <header className="grid shrink-0 grid-cols-[clamp(40px,13vw,85px)_1fr] items-center gap-[clamp(4px,2vw,12px)]">
                                <div className="-mt-[clamp(8px,2.5vw,16px)] flex justify-center">
                                    <Logo className="pointer-events-none h-[clamp(38px,11vw,76px)] w-[clamp(38px,11vw,76px)] md:h-[76px] md:w-[76px]" />
                                </div>

                                <div className="min-w-0 text-center">
                                    <h3 className="text-[clamp(9px,3vw,20px)] font-black uppercase leading-none text-j-blue-700">
                                        Jeep Clube
                                        Tamoios
                                        Caraguatatuba
                                    </h3>

                                    <p className="mt-[clamp(1px,0.5vw,4px)] text-[clamp(5px,1.45vw,10px)] font-extrabold uppercase text-j-blue-400">
                                        Fundado em
                                        09/09/1999
                                    </p>
                                </div>
                            </header>

                            <div className="mt-[clamp(2px,1vw,8px)] grid min-h-0 flex-1 grid-cols-[31%_1fr] gap-[clamp(5px,2vw,12px)]">
                                <div className="flex min-h-0 flex-col gap-[clamp(3px,1vw,8px)]">
                                    <div className="min-h-0 flex-1 overflow-hidden rounded-[clamp(5px,2vw,12px)] border-[clamp(1px,0.35vw,2px)] border-j-black bg-j-white">
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
                                            <div className="flex h-full w-full items-center justify-center bg-j-gray-100">
                                                <UserRound className="h-[clamp(22px,8vw,50px)] w-[clamp(22px,8vw,50px)] text-j-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    <p className="truncate text-[clamp(12px,4.5vw,24px)] font-black leading-none text-j-black">
                                        {formatMembershipId(
                                            registrationNumber,
                                        )}
                                    </p>
                                </div>

                                <div className="grid min-h-0 content-start gap-[clamp(2px,0.9vw,6px)]">
                                    <div className="grid grid-cols-[1fr_33%] gap-[clamp(3px,1.2vw,8px)]">
                                        <CardField
                                            label="Nome e sobrenome"
                                            value={
                                                fullName
                                            }
                                        />

                                        <CardField
                                            label="Data nascimento"
                                            value={formatDate(
                                                birthDate,
                                            )}
                                        />
                                    </div>

                                    <CardField
                                        label="UF e cidade"
                                        value={
                                            cityState
                                        }
                                    />

                                    <div className="grid grid-cols-2 gap-[clamp(3px,1.2vw,8px)]">
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

                                    <div className="grid grid-cols-[1fr_25%_20%] items-end gap-[clamp(3px,1.2vw,8px)]">
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
                                            title="QR Code do associado"
                                            className="flex aspect-square w-full items-center justify-center rounded-[clamp(3px,1vw,6px)] bg-j-white text-j-black"
                                        >
                                            <QrCode className="h-[75%] w-[75%]" />
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
                        className="flex aspect-[1011/638] w-full flex-col overflow-hidden rounded-[clamp(8px,2.2vw,16px)] border border-j-gray-200 bg-j-blue-700 shadow-sm"
                    >
                        <div className="h-[clamp(5px,1.8vw,12px)] w-full shrink-0 bg-j-white" />

                        <div className="flex min-h-0 flex-1 flex-col">
                            <div className="flex min-h-0 flex-1 items-start justify-end p-[clamp(8px,3vw,20px)]">
                                <Logo className="pointer-events-none h-[clamp(30px,8vw,56px)] w-[clamp(30px,8vw,56px)]  md:h-14 md:w-14" />
                            </div>

                            <div className="h-[clamp(14px,4vw,32px)] w-full shrink-0 bg-j-yellow-400" />

                            <footer className="flex shrink-0 items-center justify-around gap-[clamp(8px,3vw,24px)] px-[clamp(10px,4vw,24px)] py-[clamp(8px,3vw,20px)] text-j-white">
                                <div className="flex min-w-0 items-center gap-[clamp(4px,1.5vw,8px)]">
                                    <Image
                                        src="/svgs/instaB.svg"
                                        alt="Instagram"
                                        width={
                                            22
                                        }
                                        height={
                                            22
                                        }
                                        className="h-[clamp(12px,3.5vw,22px)] w-[clamp(12px,3.5vw,22px)] shrink-0"
                                    />

                                    <span className="truncate text-[clamp(7px,2vw,14px)] font-medium">
                                        Jeep Clube
                                        Tamoios
                                    </span>
                                </div>

                                <div className="flex min-w-0 items-center gap-[clamp(4px,1.5vw,8px)]">
                                    <Globe className="h-[clamp(12px,3.5vw,22px)] w-[clamp(12px,3.5vw,22px)] shrink-0" />

                                    <span className="truncate text-[clamp(7px,2vw,14px)] font-medium">
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