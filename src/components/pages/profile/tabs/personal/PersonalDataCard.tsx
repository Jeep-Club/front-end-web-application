"use client";

import {
    CalendarDays,
    Edit3,
    ShieldCheck,
    UserRound,
} from "lucide-react";


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
        <div className="min-w-0 bg-j-white px-3 py-3">
            <dt className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-j-gray-400">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-bold leading-relaxed text-j-blue-800 [overflow-wrap:anywhere]">
                {displayValue(value)}
            </dd>
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


    return (
        <section className="flex w-full flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
            <div className="relative h-20 shrink-0 overflow-hidden bg-j-blue-800 px-5 py-4">
                <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full border-[28px] border-j-blue-700/70" />
                <div className="absolute bottom-0 left-0 h-1 w-full bg-j-yellow-300" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-extrabold text-j-white">Dados pessoais</h2>
                        <p className="mt-0.5 text-xs text-j-white/60">Informações do associado</p>
                    </div>

                </div>
            </div>

            <div className="flex flex-1 flex-col px-5 pb-5">
                <div className="relative -mt-4 flex items-end justify-between gap-3">
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

                    <Button
                        type="button"
                        onClick={onEdit}
                        disabled={!onEdit}
                        title="Editar dados pessoais"
                        className="mt-7 shrink-0 self-start gap-2 px-3 py-2 shadow-sm"
                    >
                        <Edit3 size={15} />
                        <span className="text-xs">Editar</span>
                    </Button>
                </div>

                <div className="mt-3 min-w-0">
                    <h3 className="text-xl font-black leading-tight text-j-gray-700 [overflow-wrap:anywhere] sm:text-2xl">
                        {displayValue(fullName)}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-j-white bg-j-yellow-300 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-j-blue-800 shadow-sm">
                        <ShieldCheck size={13} aria-hidden="true" />
                        {displayValue(roleLabel)}
                    </span>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-j-gray-200 bg-j-gray-100/60 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-j-white text-j-blue-800 shadow-sm">
                        <CalendarDays size={18} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400">Membro desde</p>
                        <p className="text-sm font-bold leading-relaxed text-j-gray-700 [overflow-wrap:anywhere]">{displayValue(memberSince)}</p>
                    </div>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-j-gray-200 bg-j-gray-200 sm:grid-cols-2">
                    <InfoField label="Matrícula" value={registrationNumber} />
                    <InfoField label="E-mail" value={email} />
                    <InfoField label="CPF" value={cpf} />
                    <InfoField label="RG" value={rg} />
                    <InfoField label="Telefone" value={phoneNumber} />
                    <InfoField label="Nascimento" value={birthDate} />
                </dl>
            </div>
        </section>
    );
}

export default PersonalDataCard;
