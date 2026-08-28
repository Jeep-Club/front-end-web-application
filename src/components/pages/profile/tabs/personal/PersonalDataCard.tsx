"use client";

import {
    ChevronDown,
    Edit3,
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

function displayValue(
    value?: string | null,
) {
    return value?.trim() || "—";
}

function InfoField({ label, value }: InfoFieldProps) {
    return (
        <div className="rounded-xl bg-j-gray-100 px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-j-gray-400">
                {label}
            </span>

            <p className="mt-1 truncate text-base font-extrabold text-j-blue-800">
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
            <header className="flex items-center justify-between gap-3 border-b border-j-gray-200 px-4 py-3">
                <div className="min-w-0">
                    <h2 className="text-sm font-extrabold text-j-gray-700">
                        Dados pessoais
                    </h2>

                    <p className="text-xs text-j-gray-400">
                        Informações do associado
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={onEdit}
                    disabled={!onEdit}
                    title="Editar dados pessoais"
                    className="shrink-0 gap-2 px-3 py-2"
                >
                    <Edit3 size={15} />

                    <span className="text-xs">
                        Editar
                    </span>
                </Button>
            </header>

            <div className="p-4 sm:p-5">
                <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-j-gray-100 sm:h-24 sm:w-24">
                        {photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={photoUrl}
                                alt={
                                    fullName ||
                                    "Foto do associado"
                                }
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <UserRound
                                    size={42}
                                    className="text-j-gray-300"
                                />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <span className="rounded-full bg-j-yellow-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-j-blue-800">
                            {displayValue(roleLabel)}
                        </span>

                        <div className="mt-2 min-w-0">
                            <h3 className="truncate text-lg font-extrabold leading-tight text-j-gray-700 sm:text-xl">
                                {displayValue(fullName)}
                            </h3>

                            <p className="mt-1 text-xs text-j-gray-500 sm:text-sm">
                                Membro desde{" "}
                                {displayValue(
                                    memberSince,
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsExpanded((current) => !current)}
                    aria-expanded={isExpanded}
                    aria-controls="personal-data-details"
                    className="mt-4 flex w-full cursor-pointer items-center justify-between border-t border-j-gray-200 pt-4 text-left text-sm font-bold text-j-blue-800 transition-colors hover:text-j-blue-600"
                >
                    <span>{isExpanded ? "Ocultar dados pessoais" : "Ver dados pessoais"}</span>
                    <ChevronDown size={20} aria-hidden="true" className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                <div id="personal-data-details" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoField label="Matrícula" value={registrationNumber} />
                    <InfoField label="E-mail" value={email} />
                    <InfoField label="CPF" value={cpf} />
                    <InfoField label="RG" value={rg} />
                    <InfoField label="Telefone" value={phoneNumber} />
                    <InfoField label="Nascimento" value={birthDate} />
                </div>
                )}
            </div>
        </section>
    );
}

export default PersonalDataCard;
