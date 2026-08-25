"use client";

import {
    Edit3,
    UserRound,
} from "lucide-react";

import { Button } from "@/components/common/button";

interface PersonalDataCardProps {
    photoUrl?: string | null;
    fullName?: string | null;
    roleLabel?: string | null;
    memberSince?: string | null;
    registrationNumber?: string | null;
    onEdit?: () => void;
}

function displayValue(
    value?: string | null,
) {
    return value?.trim() || "—";
}

export function PersonalDataCard({
    photoUrl,
    fullName,
    roleLabel,
    memberSince,
    registrationNumber,
    onEdit,
}: PersonalDataCardProps) {
    return (
        <section className="mx-auto flex w-full max-w-[720px] xl:max-w-[360px] flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
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

            <div className="flex flex-col gap-4 p-4">
                <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-j-gray-100 sm:h-52">
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
                                size={64}
                                className="text-j-gray-300"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-start gap-3">
                    <span className="rounded-full bg-j-yellow-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-j-blue-800">
                        {displayValue(roleLabel)}
                    </span>

                    <div className="w-full min-w-0">
                        <h3 className="break-words text-xl font-extrabold leading-tight text-j-gray-700">
                            {displayValue(fullName)}
                        </h3>

                        <p className="mt-1 text-xs text-j-gray-500">
                            Membro desde{" "}
                            {displayValue(
                                memberSince,
                            )}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl bg-j-gray-100 px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-j-gray-400">
                        Matrícula
                    </span>

                    <p className="mt-1 text-base font-extrabold text-j-blue-800">
                        {displayValue(
                            registrationNumber,
                        )}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default PersonalDataCard;
