"use client";

import {
    CalendarDays,
    ChevronDown,
    Edit3,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/common/button";

interface PersonalDataCardProps {
    photoUrl?: string | null;
    fullName?: string | null;
    roleLabel?: string | null;
    memberSince?: string | null;
    registrationNumber?: string | null;
    email?: string | null;
    cpf?: string | null;
    rg?: string | null;
    phoneNumber?: string | null;
    birthDate?: string | null;
    onEdit?: () => void;
}

interface InfoFieldProps {
    label: string;
    value?: string | null;
}

function displayValue(value?: string | null) {
    return value?.trim() || "—";
}

function InfoField({ label, value }: InfoFieldProps) {
    return (
        <div className="min-w-0 border-b border-j-gray-200 px-3 py-3 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-j-gray-400">
                {label}
            </span>
            <p className="mt-1 truncate text-sm font-extrabold text-j-blue-800" title={displayValue(value)}>
                {displayValue(value)}
            </p>
        </div>
    );
}

export function PersonalDataCard({
    photoUrl,
    fullName,
    roleLabel,
    memberSince,
    registrationNumber,
    email,
    cpf,
    rg,
    phoneNumber,
    birthDate,
    onEdit,
}: PersonalDataCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="flex w-full flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
            <div className="relative h-32 shrink-0 overflow-hidden bg-j-blue-800 px-5 py-4">
                <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full border-[28px] border-j-blue-700/70" />
                <div className="absolute bottom-0 left-0 h-1 w-full bg-j-yellow-300" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-extrabold text-j-white">Dados pessoais</h2>
                        <p className="mt-0.5 text-xs text-j-white/60">Informações do associado</p>
                    </div>
                    <Button
                        type="button"
                        onClick={onEdit}
                        disabled={!onEdit}
                        title="Editar dados pessoais"
                        className="shrink-0 gap-2 px-3 py-2 shadow-sm"
                    >
                        <Edit3 size={15} />
                        <span className="text-xs">Editar</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 flex-col px-5 pb-5">
                <div className="relative -mt-11 flex items-end justify-between gap-3">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-j-white bg-j-gray-100 shadow-md">
                        {photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={photoUrl}
                                alt={fullName || "Foto do associado"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <UserRound size={42} className="text-j-gray-300" />
                            </div>
                        )}
                    </div>

                    <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border-2 border-j-white bg-j-yellow-300 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-j-blue-800 shadow-sm">
                        <ShieldCheck size={13} />
                        {displayValue(roleLabel)}
                    </span>
                </div>

                <div className="mt-3 min-w-0">
                    <h3 className="truncate text-xl font-black leading-tight text-j-gray-700 sm:text-2xl">
                        {displayValue(fullName)}
                    </h3>
                    <p className="mt-1 text-xs text-j-gray-400">Associado do Jeep Clube Tamoios</p>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-j-gray-200 bg-j-gray-100/60 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-j-white text-j-blue-800 shadow-sm">
                        <CalendarDays size={18} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400">Membro desde</p>
                        <p className="truncate text-sm font-bold text-j-gray-700">{displayValue(memberSince)}</p>
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-j-gray-200">
                    <button
                        type="button"
                        onClick={() => setIsExpanded((current) => !current)}
                        aria-expanded={isExpanded}
                        aria-controls="personal-data-details"
                        className="flex w-full cursor-pointer items-center justify-between bg-j-white px-4 py-3.5 text-left text-sm font-extrabold text-j-blue-800 transition-colors hover:bg-j-gray-100"
                    >
                        <span>{isExpanded ? "Ocultar dados pessoais" : "Ver dados pessoais"}</span>
                        <ChevronDown
                            size={19}
                            aria-hidden="true"
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>

                    {isExpanded && (
                        <div id="personal-data-details" className="border-t border-j-gray-200 bg-j-gray-100/50 p-3">
                            <div className="grid overflow-hidden rounded-xl border border-j-gray-200 bg-j-white sm:grid-cols-3">
                                <InfoField label="Matrícula" value={registrationNumber} />
                                <InfoField label="E-mail" value={email} />
                                <InfoField label="CPF" value={cpf} />
                            </div>
                            <div className="mt-2 grid overflow-hidden rounded-xl border border-j-gray-200 bg-j-white sm:grid-cols-3">
                                <InfoField label="RG" value={rg} />
                                <InfoField label="Telefone" value={phoneNumber} />
                                <InfoField label="Nascimento" value={birthDate} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default PersonalDataCard;
