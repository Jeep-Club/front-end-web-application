"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Globe, UserRound } from "lucide-react";

import {
    CardExportActions,
    type CardExportRequest,
} from "@/components/common/card-export/CardExportActions";
import {
    captureCardElement,
    exportCardImages,
} from "@/utils/card-export/exportCard";
import { maskDate } from "@/utils/masks";

interface MembershipCardProps {
    profilePhotoUrl?: string | null;
    fullName?: string | null;
    birthDate?: string | null;
    memberSince?: string | null;
    issuedAt?: string | null;
    phoneNumber?: string | null;
    roleLabel?: string | null;
    registrationNumber?: string | null;
    cityState?: string | null;
    driverLicense?: string | null;
    bloodType?: string | null;
    exportFileName?: string;
}

type CardSide = "front" | "back";

function displayValue(value?: string | null) {
    return value?.trim() || "—";
}

function formatMembershipId(value?: string | null) {
    if (!value) {
        return "0000-0";
    }

    const digits = value.replace(/\D/g, "");

    if (!digits) {
        return value;
    }

    const normalizedDigits = digits.padStart(5, "0");

    return `${normalizedDigits.slice(0, -1)}-${normalizedDigits.slice(-1)}`;
}

function waitForRender() {
    return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}

interface CardFieldProps {
    label: string;
    value?: string | null;
}

function CardField({ label, value }: CardFieldProps) {
    const displayedValue = displayValue(value);

    return (
        <div className="flex min-w-0 flex-col gap-[clamp(1px,0.35cqw,3px)]">
            <span className="truncate text-[clamp(5px,1.2cqw,9px)] font-extrabold uppercase leading-none tracking-[0.08em] text-j-blue-400">
                {label}
            </span>

            <div className="flex min-h-[clamp(11px,3.7cqw,25px)] items-center overflow-hidden rounded-[clamp(3px,0.8cqw,7px)] border border-j-blue-100 bg-j-gray-100/70 px-[clamp(3px,1cqw,8px)] py-[clamp(1px,0.35cqw,3px)]">
                <span
                    title={displayedValue}
                    className="w-full truncate text-[clamp(6px,1.65cqw,12px)] font-bold leading-tight text-j-blue-800"
                >
                    {displayedValue}
                </span>
            </div>
        </div>
    );
}

interface MembershipCardFaceProps {
    profilePhotoUrl?: string | null;
    fullName?: string | null;
    birthDate?: string | null;
    memberSince?: string | null;
    issuedAt?: string | null;
    phoneNumber?: string | null;
    roleLabel?: string | null;
    registrationNumber?: string | null;
    cityState?: string | null;
    driverLicense?: string | null;
    bloodType?: string | null;
}

function MembershipCardFront({
    profilePhotoUrl,
    fullName,
    birthDate,
    memberSince,
    issuedAt,
    phoneNumber,
    roleLabel,
    registrationNumber,
    cityState,
    driverLicense,
    bloodType,
}: MembershipCardFaceProps) {
    return (
        <div
            id="membership-card-front"
            data-card-side="front"
            className="flex aspect-[856/540] w-full flex-col overflow-hidden rounded-[clamp(10px,2.4cqw,18px)] border border-j-blue-100 bg-j-white shadow-[0_12px_32px_rgba(6,30,80,0.18)] [container-type:inline-size]"
        >
            <div className="flex h-[clamp(12px,4cqw,26px)] w-full shrink-0 items-center justify-end bg-j-blue-800 px-[clamp(7px,2.6cqw,17px)]">
                <span className="truncate text-[clamp(5px,1.15cqw,8px)] font-bold uppercase tracking-[0.08em] text-j-white/90">
                    Expedida em {maskDate(issuedAt, { includeTime: false })}
                </span>
            </div>
            <div className="h-[clamp(2px,0.65cqw,4px)] w-full shrink-0 bg-j-yellow-300" />

            <header className="grid h-[clamp(30px,10cqw,64px)] shrink-0 grid-cols-[18%_1fr] items-center px-[clamp(8px,3cqw,20px)]">
                <div className="flex justify-center">
                    <div className="relative h-[clamp(26px,8cqw,52px)] w-[clamp(26px,8cqw,52px)] overflow-hidden">
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
                    <h3 className="whitespace-nowrap text-[clamp(10px,3.3cqw,24px)] font-black uppercase leading-none tracking-tight text-j-blue-800">
                        Jeep Clube Tamoios
                    </h3>

                    <p className="mt-[clamp(2px,0.6cqw,4px)] truncate text-[clamp(5px,1.45cqw,11px)] font-bold uppercase tracking-[0.1em] text-j-blue-300">
                        Caraguatatuba • Fundado em 09/09/1999
                    </p>
                </div>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-[26%_1fr] gap-[clamp(5px,1.7cqw,11px)] px-[clamp(7px,2.6cqw,17px)] pb-[clamp(9px,2.8cqw,18px)] @[480px]:grid-cols-[30%_1fr]">
                <div className="flex min-h-0 flex-col gap-[clamp(3px,0.8cqw,6px)] rounded-[clamp(6px,1.5cqw,12px)] bg-j-blue-800 p-[clamp(3px,1cqw,7px)]">
                    <div className="min-h-0 flex-1 overflow-hidden rounded-[clamp(4px,1.1cqw,9px)] border-[clamp(2px,0.4cqw,3px)] border-j-yellow-300 bg-j-white">
                        {profilePhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profilePhotoUrl}
                                alt={
                                    fullName
                                        ? `Foto de ${fullName}`
                                        : "Foto do associado"
                                }
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-j-blue-900">
                                <UserRound className="h-[clamp(22px,7cqw,46px)] w-[clamp(22px,7cqw,46px)] text-j-blue-100" />
                            </div>
                        )}
                    </div>

                    <p className="truncate rounded-[clamp(3px,0.7cqw,6px)] bg-j-yellow-300 px-[clamp(3px,0.8cqw,6px)] py-[clamp(2px,0.45cqw,4px)] text-center text-[clamp(9px,3cqw,20px)] font-black leading-none tracking-wide text-j-blue-950">
                        {formatMembershipId(registrationNumber)}
                    </p>
                </div>

                <div className="flex min-h-0 flex-col justify-between gap-[clamp(2px,0.65cqw,4px)]">
                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[clamp(3px,1cqw,7px)]">
                        <CardField
                            label="Nome e sobrenome"
                            value={fullName}
                        />
                        <CardField
                            label="Nascimento"
                            value={maskDate(birthDate, { includeTime: false })}
                        />
                    </div>

                    <CardField label="UF e cidade" value={cityState} />

                    <div className="grid grid-cols-2 gap-[clamp(3px,1cqw,7px)]">
                        <CardField
                            label="Habilitação"
                            value={driverLicense}
                        />
                        <CardField
                            label="Membro desde"
                            value={maskDate(memberSince, { includeTime: false })}
                        />
                    </div>

                    <CardField label="Telefone" value={phoneNumber} />

                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)_auto] items-end gap-[clamp(3px,1cqw,7px)]">
                        <CardField label="Função" value={roleLabel} />
                        <CardField label="T sanguíneo" value={bloodType} />

                        <div
                            aria-label="Espaço reservado para QR Code"
                            className="flex aspect-square w-[clamp(22px,7cqw,46px)] shrink-0 items-center justify-center rounded-[clamp(3px,0.8cqw,7px)] border-[clamp(1px,0.3cqw,2px)] border-dashed border-j-blue-200 bg-j-blue-100/10"
                        >
                            <span className="text-center text-[clamp(4px,0.7cqw,6px)] font-bold uppercase leading-tight tracking-wide text-j-blue-200">
                                QR Code
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MembershipCardBack() {
    return (
        <div
            id="membership-card-back"
            data-card-side="back"
            className="flex aspect-[856/540] w-full flex-col overflow-hidden rounded-[clamp(10px,2.4cqw,18px)] border border-j-blue-800 bg-j-blue-800 shadow-[0_12px_32px_rgba(6,30,80,0.22)] [container-type:inline-size]"
        >
            <div className="h-[clamp(3px,0.75cqw,5px)] w-full shrink-0 bg-j-yellow-300" />

            <div className="relative grid min-h-0 flex-1 grid-cols-[38%_1fr] items-center overflow-hidden px-[clamp(14px,5cqw,32px)]">
                <div className="absolute -right-[10%] -top-[42%] aspect-square w-[45%] rounded-full border-[clamp(8px,4cqw,28px)] border-j-white/5" />
                <div className="absolute -bottom-[62%] -left-[10%] aspect-square w-[50%] rounded-full border-[clamp(8px,4cqw,28px)] border-j-yellow-300/10" />

                <div className="relative flex justify-center">
                    <div className="relative aspect-square w-[clamp(58px,18cqw,116px)] overflow-hidden rounded-[clamp(9px,2cqw,16px)] bg-j-white p-1 shadow-lg">
                        <Image
                            src="/images/logo_grande.jpg"
                            alt="Jeep Clube Tamoios"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className="relative min-w-0 text-j-white">
                    <p className="text-[clamp(6px,1.45cqw,10px)] font-bold uppercase tracking-[0.18em] text-j-yellow-300">
                        Desde 1999
                    </p>
                    <p className="mt-[clamp(2px,0.6cqw,4px)] text-[clamp(15px,4.2cqw,29px)] font-black uppercase leading-[0.9]">
                        Jeep Clube
                        <br />
                        Tamoios
                    </p>
                    <p className="mt-[clamp(3px,0.8cqw,6px)] text-[clamp(6px,1.4cqw,10px)] font-medium text-j-blue-100">
                        Caraguatatuba • SP
                    </p>
                </div>
            </div>

            <div className="h-[clamp(4px,1cqw,7px)] w-full shrink-0 bg-j-yellow-300" />

            <footer className="grid min-h-[19%] shrink-0 grid-cols-2 items-center gap-[clamp(8px,5cqw,32px)] bg-j-white px-[clamp(12px,5cqw,32px)] py-[clamp(7px,2.5cqw,16px)] text-j-blue-950">
                <div className="flex min-w-0 items-center gap-[clamp(4px,1.4cqw,8px)]">
                    <Image
                        src="/svgs/insta.svg"
                        alt="Instagram"
                        width={22}
                        height={22}
                        className="h-[clamp(11px,3.2cqw,21px)] w-[clamp(11px,3.2cqw,21px)] shrink-0"
                    />
                    <span className="truncate text-[clamp(6px,1.8cqw,13px)] font-medium">
                        JeepTamoios
                    </span>
                </div>

                <div className="flex min-w-0 items-center gap-[clamp(4px,1.4cqw,8px)]">
                    <Globe className="h-[clamp(11px,3.2cqw,21px)] w-[clamp(11px,3.2cqw,21px)] shrink-0" />
                    <span className="truncate text-[clamp(6px,1.8cqw,13px)] font-medium">
                        www.JeepTamoios.com
                    </span>
                </div>
            </footer>
        </div>
    );
}

export function MembershipCard({
    profilePhotoUrl,
    fullName,
    birthDate,
    memberSince,
    issuedAt,
    phoneNumber,
    roleLabel,
    registrationNumber,
    cityState,
    driverLicense,
    bloodType,
    exportFileName,
}: MembershipCardProps) {
    const [currentSide, setCurrentSide] = useState<CardSide>("front");
    const cardContainerRef = useRef<HTMLDivElement>(null);

    const handleExport = async ({ format, scope }: CardExportRequest) => {
        const previousSide = currentSide;

        try {
            setCurrentSide("front");
            await waitForRender();

            const frontElement =
                cardContainerRef.current?.querySelector<HTMLElement>(
                    '[data-card-side="front"]',
                );

            if (!frontElement) {
                throw new Error(
                    "Não foi possível localizar a frente da carteirinha",
                );
            }

            const frontImage = await captureCardElement(frontElement);
            let backImage: string | undefined;

            if (scope === "front-and-back") {
                setCurrentSide("back");
                await waitForRender();

                const backElement =
                    cardContainerRef.current?.querySelector<HTMLElement>(
                        '[data-card-side="back"]',
                    );

                if (!backElement) {
                    throw new Error(
                        "Não foi possível localizar o verso da carteirinha",
                    );
                }

                backImage = await captureCardElement(backElement);
            }

            await exportCardImages({
                format,
                scope,
                frontImage,
                backImage,
                fileName:
                    exportFileName ??
                    `carteirinha-${
                        registrationNumber ?? fullName ?? "associado"
                    }`,
            });

            toast.success(
                `${format === "pdf" ? "PDF" : "Imagem"} gerado com sucesso!`,
            );
        } catch (error) {
            console.error("Erro ao exportar carteirinha:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao exportar a carteirinha",
            );
        } finally {
            setCurrentSide(previousSide);
        }
    };

    return (
        <section className="mx-auto flex w-full max-w-[720px] min-w-0 flex-col gap-3">
            <header className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                    <h2 className="text-sm font-extrabold text-j-gray-700">
                        Carteirinha digital
                    </h2>
                    <p className="text-[11px] text-j-gray-400">
                        Padrão 85,6 × 53,98 mm
                    </p>
                </div>

                <div
                    className="grid w-full grid-cols-2 gap-1 rounded-xl bg-j-gray-100 p-1 sm:w-auto"
                    aria-label="Selecionar lado da carteirinha"
                >
                    {(["front", "back"] as const).map((side) => {
                        const isActive = currentSide === side;
                        const label = side === "front" ? "Frente" : "Verso";

                        return (
                            <button
                                key={side}
                                type="button"
                                onClick={() => setCurrentSide(side)}
                                aria-label={`Visualizar ${label.toLowerCase()}`}
                                aria-pressed={isActive}
                                className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-bold transition-colors sm:py-1.5 ${
                                    isActive
                                        ? "bg-j-blue-800 text-j-white shadow-sm"
                                        : "text-j-gray-500 hover:bg-j-white"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </header>

            <div
                ref={cardContainerRef}
                className="w-full min-w-0 [container-type:inline-size]"
            >
                {currentSide === "front" ? (
                    <MembershipCardFront
                        profilePhotoUrl={profilePhotoUrl}
                        fullName={fullName}
                        birthDate={birthDate}
                        memberSince={memberSince}
                        issuedAt={issuedAt}
                        phoneNumber={phoneNumber}
                        roleLabel={roleLabel}
                        registrationNumber={registrationNumber}
                        cityState={cityState}
                        driverLicense={driverLicense}
                        bloodType={bloodType}
                    />
                ) : (
                    <MembershipCardBack />
                )}
            </div>

            <CardExportActions onExport={handleExport} />
        </section>
    );
}

export default MembershipCard;
