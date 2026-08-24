"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Globe, ShieldCheck, UserRound } from "lucide-react";

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
    phoneNumber?: string | null;
    roleLabel?: string | null;
    registrationNumber?: string | null;
    bloodType?: string | null;
    exportFileName?: string;
}

type CardSide = "front" | "back";

function displayValue(value?: string | null) {
    return value?.trim() || "--";
}

function formatMembershipId(value?: string | null) {
    if (!value) {
        return "--";
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
    return (
        <div className="min-w-0 border-b border-j-blue-100 pb-[clamp(5px,1.1cqw,8px)]">
            <p className="text-[clamp(5px,0.95cqw,7px)] font-bold uppercase tracking-[0.14em] text-j-blue-500">{label}</p>
            <p className="mt-[clamp(2px,0.4cqw,3px)] truncate text-[clamp(9px,2cqw,15px)] font-extrabold leading-tight text-j-blue-950">{displayValue(value)}</p>
        </div>
    );
}

interface MembershipCardFaceProps {
    profilePhotoUrl?: string | null;
    fullName?: string | null;
    birthDate?: string | null;
    memberSince?: string | null;
    phoneNumber?: string | null;
    roleLabel?: string | null;
    registrationNumber?: string | null;
    bloodType?: string | null;
}

function MembershipCardFront({
    profilePhotoUrl,
    fullName,
    birthDate,
    memberSince,
    phoneNumber,
    roleLabel,
    registrationNumber,
    bloodType,
}: MembershipCardFaceProps) {
    return (
        <div
            id="membership-card-front"
            data-card-side="front"
            className="relative flex aspect-[856/540] w-full flex-col overflow-hidden rounded-[clamp(9px,2cqw,15px)] border border-j-blue-950 bg-j-white shadow-[0_10px_24px_rgba(6,30,80,0.16)] [container-type:inline-size] [print-color-adjust:exact] [-webkit-print-color-adjust:exact] print:rounded-none print:shadow-none"
        >
            <header className="flex h-[26%] shrink-0 items-center bg-j-blue-950 px-[clamp(16px,4.8cqw,33px)] text-j-white">
                <div className="relative h-[clamp(42px,11.5cqw,78px)] w-[clamp(42px,11.5cqw,78px)] shrink-0 overflow-hidden rounded-full border-[clamp(2px,0.45cqw,3px)] border-j-yellow-300 bg-j-white">
                    <Image
                        src="/images/logo_grande.jpg"
                        alt="Jeep Clube Tamoios"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <div className="ml-[clamp(11px,3.2cqw,22px)] min-w-0 flex-1">
                    <p className="text-[clamp(5px,1.15cqw,9px)] font-bold uppercase tracking-[0.2em] text-j-yellow-300">
                        Jeep Clube Tamoios
                    </p>
                    <h3 className="mt-[clamp(2px,0.45cqw,3px)] truncate text-[clamp(14px,3.7cqw,27px)] font-black uppercase leading-none tracking-[-0.02em]">
                        Carteira de associado
                    </h3>
                    <p className="mt-[clamp(3px,0.7cqw,5px)] text-[clamp(5px,1cqw,8px)] font-semibold uppercase tracking-[0.09em] text-j-blue-200">
                        Documento de identificação do clube
                    </p>
                </div>

                <div className="ml-[clamp(8px,2cqw,14px)] flex shrink-0 items-center gap-[clamp(4px,0.9cqw,6px)] border-l border-j-blue-700 pl-[clamp(8px,2.2cqw,15px)]">
                    <ShieldCheck className="h-[clamp(12px,2.8cqw,20px)] w-[clamp(12px,2.8cqw,20px)] text-j-yellow-300" />
                    <div>
                        <p className="text-[clamp(4px,0.8cqw,6px)] font-bold uppercase tracking-wider text-j-blue-300">Situação</p>
                        <p className="text-[clamp(6px,1.25cqw,9px)] font-extrabold uppercase text-j-white">Associado</p>
                    </div>
                </div>
            </header>

            <div className="h-[clamp(3px,0.75cqw,5px)] shrink-0 bg-j-yellow-300" />

            <main className="grid min-h-0 flex-1 grid-cols-[27%_1fr] gap-[clamp(14px,4cqw,27px)] px-[clamp(17px,5cqw,34px)] py-[clamp(13px,3.8cqw,26px)]">
                <div className="flex min-h-0 flex-col">
                    <div className="min-h-0 flex-1 overflow-hidden rounded-[clamp(5px,1.1cqw,8px)] border-[clamp(2px,0.45cqw,3px)] border-j-blue-950 bg-j-blue-50">
                        {profilePhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profilePhotoUrl}
                                alt={fullName ? `Foto de ${fullName}` : "Foto do associado"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <UserRound className="h-[clamp(34px,9cqw,62px)] w-[clamp(34px,9cqw,62px)] text-j-blue-400" strokeWidth={1.6} />
                            </div>
                        )}
                    </div>

                    <div className="mt-[clamp(5px,1.2cqw,8px)] flex items-end justify-between border-t-2 border-j-yellow-300 pt-[clamp(4px,0.8cqw,6px)]">
                        <span className="text-[clamp(5px,0.95cqw,7px)] font-bold uppercase tracking-[0.13em] text-j-blue-500">Registro</span>
                        <span className="text-[clamp(10px,2.5cqw,18px)] font-black leading-none tracking-wide text-j-blue-950">{formatMembershipId(registrationNumber)}</span>
                    </div>
                </div>

                <div className="flex min-h-0 flex-col">
                    <div className="border-b-2 border-j-blue-950 pb-[clamp(6px,1.5cqw,10px)]">
                        <p className="text-[clamp(5px,1cqw,8px)] font-bold uppercase tracking-[0.16em] text-j-blue-500">Nome do associado</p>
                        <p className="mt-[clamp(2px,0.45cqw,3px)] truncate text-[clamp(13px,3.3cqw,24px)] font-black leading-tight tracking-tight text-j-blue-950">{displayValue(fullName)}</p>
                    </div>

                    <div className="mt-[clamp(8px,2cqw,14px)] grid grid-cols-2 gap-x-[clamp(13px,3.5cqw,24px)] gap-y-[clamp(8px,2cqw,14px)]">
                        <CardField label="Nascimento" value={maskDate(birthDate, { includeTime: false })} />
                        <CardField label="Telefone" value={phoneNumber} />
                        <CardField label="Categoria" value={roleLabel} />
                        <CardField label="Membro desde" value={maskDate(memberSince, { includeTime: false })} />
                    </div>

                    <div className="mt-auto flex items-center justify-end border-t border-j-blue-100 pt-[clamp(7px,1.7cqw,12px)]">
                        <div className="shrink-0 rounded-[clamp(5px,1cqw,8px)] border-2 border-j-yellow-300 bg-j-yellow-50 px-[clamp(10px,2.4cqw,17px)] py-[clamp(5px,1.1cqw,8px)]">
                            <div>
                                <p className="text-[clamp(4px,0.85cqw,6px)] font-bold uppercase tracking-[0.1em] text-j-blue-600">Tipo sanguíneo</p>
                                <p className="text-[clamp(12px,2.9cqw,21px)] font-black leading-none text-j-blue-950">{displayValue(bloodType)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="flex h-[clamp(12px,3cqw,20px)] shrink-0 items-center justify-center bg-j-blue-950 px-4 text-[clamp(4px,0.8cqw,6px)] font-semibold uppercase tracking-[0.18em] text-j-blue-200">
                Uso pessoal e intransferível
            </footer>
        </div>
    );
}
function MembershipCardBack() {
    return (
        <div
            id="membership-card-back"
            data-card-side="back"
            className="flex aspect-[856/540] w-full flex-col overflow-hidden rounded-[clamp(10px,2.4cqw,18px)] border border-j-blue-200 bg-j-white shadow-[0_12px_32px_rgba(6,30,80,0.18)] [container-type:inline-size]"
        >
            <header className="flex h-[38%] shrink-0 items-center gap-[clamp(12px,4cqw,28px)] bg-j-blue-800 px-[clamp(20px,7cqw,48px)] text-j-white">
                <div className="relative h-[clamp(54px,15cqw,102px)] w-[clamp(54px,15cqw,102px)] shrink-0 rounded-full bg-j-white p-[clamp(3px,0.7cqw,5px)]">
                    <Image
                        src="/images/logo_grande.jpg"
                        alt="Jeep Clube Tamoios"
                        fill
                        className="rounded-full object-contain"
                    />
                </div>
                <div className="min-w-0">
                    <p className="text-[clamp(6px,1.3cqw,10px)] font-bold uppercase tracking-[0.2em] text-j-yellow-300">Clube de jipeiros</p>
                    <h3 className="mt-[clamp(2px,0.5cqw,4px)] text-[clamp(17px,4.5cqw,32px)] font-black uppercase leading-none">Jeep Clube Tamoios</h3>
                    <p className="mt-[clamp(4px,1cqw,7px)] text-[clamp(7px,1.5cqw,11px)] font-medium text-j-blue-100">Caraguatatuba - Sao Paulo</p>
                </div>
            </header>
            <div className="h-[clamp(4px,1cqw,7px)] shrink-0 bg-j-yellow-300" />

            <div className="flex min-h-0 flex-1 flex-col px-[clamp(20px,7cqw,48px)] py-[clamp(13px,4cqw,27px)]">
                <p className="text-center text-[clamp(7px,1.5cqw,11px)] font-bold leading-relaxed text-j-blue-800">
                    Esta carteirinha identifica o associado ativo do Jeep Clube Tamoios.
                </p>
                <div className="mt-[clamp(12px,3.5cqw,24px)] grid grid-cols-3 divide-x divide-j-blue-100 border-y border-j-blue-100 py-[clamp(8px,2.3cqw,16px)]">
                    <div className="flex flex-col items-center px-[clamp(6px,1.8cqw,12px)] text-center">
                        <Globe className="h-[clamp(15px,3.8cqw,27px)] w-[clamp(15px,3.8cqw,27px)] text-j-blue-700" />
                        <span className="mt-[clamp(4px,0.9cqw,6px)] text-[clamp(5px,1.1cqw,8px)] font-extrabold uppercase tracking-[0.1em] text-j-blue-500">Site</span>
                        <span className="mt-[clamp(2px,0.45cqw,3px)] text-[clamp(6px,1.25cqw,9px)] font-bold text-j-blue-950">JeepTamoios.com</span>
                    </div>
                    <div className="flex flex-col items-center px-[clamp(6px,1.8cqw,12px)] text-center">
                        <Image src="/svgs/insta.svg" alt="Instagram" width={28} height={28} className="h-[clamp(15px,3.8cqw,27px)] w-[clamp(15px,3.8cqw,27px)]" />
                        <span className="mt-[clamp(4px,0.9cqw,6px)] text-[clamp(5px,1.1cqw,8px)] font-extrabold uppercase tracking-[0.1em] text-j-blue-500">Instagram</span>
                        <span className="mt-[clamp(2px,0.45cqw,3px)] text-[clamp(6px,1.25cqw,9px)] font-bold text-j-blue-950">@JeepTamoios</span>
                    </div>
                    <div className="flex flex-col items-center px-[clamp(6px,1.8cqw,12px)] text-center">
                        <span className="flex h-[clamp(15px,3.8cqw,27px)] w-[clamp(15px,3.8cqw,27px)] items-center justify-center rounded-full bg-j-blue-700 text-[clamp(7px,1.6cqw,12px)] font-black text-j-yellow-300">J</span>
                        <span className="mt-[clamp(4px,0.9cqw,6px)] text-[clamp(5px,1.1cqw,8px)] font-extrabold uppercase tracking-[0.1em] text-j-blue-500">Desde</span>
                        <span className="mt-[clamp(2px,0.45cqw,3px)] text-[clamp(6px,1.25cqw,9px)] font-bold text-j-blue-950">1999</span>
                    </div>
                </div>
                <p className="mt-auto text-center text-[clamp(5px,1cqw,8px)] font-medium uppercase tracking-[0.12em] text-j-gray-400">
                    Uso pessoal e intransferivel
                </p>
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
                    "Nao foi possivel localizar a frente da carteirinha",
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
                        "Nao foi possivel localizar o verso da carteirinha",
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
                        Padrao 85,6 x 53,98 mm
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
                        phoneNumber={phoneNumber}
                        roleLabel={roleLabel}
                        registrationNumber={registrationNumber}
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
