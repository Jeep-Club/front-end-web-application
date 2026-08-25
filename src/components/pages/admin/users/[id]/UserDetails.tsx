"use client";

import { UserRound, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { ButtonIcon } from "@/components/common/button";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";
import { ROLE_STATUS_LABEL, USER_STATUS_LABEL, USER_STATUS_STYLE } from "../user-display";
import { useEffect } from "react";
import { ModalRoot } from '@/components/common/modal/root';
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";

interface UserDetailsModalProps {
    roles: RoleListResponse;
    user: AdminUser;
    modal?: boolean;
}

export function AdminUserDetailsPage({ user, roles, modal = false }: UserDetailsModalProps) {
    if (!modal) {
        return (
            <UserDetails user={user} roles={roles} />
        );
    }

    return <UserDetailsModal user={user} roles={roles} />;
}

export function UserDetails({ user, roles }: UserDetailsModalProps) {
    return (
        <div
            className="relative flex w-full flex-col gap-5 bg-j-white-800 p-4 text-j-black shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8"
        >
            <PageHeader
                title=""
                breadcrumbs={[
                    { label: "Início", href: "/feed" },
                    { label: "Gestão Administrativa", href: "/admin" },
                    { label: "Usuários", href: "/admin/users" },
                    { label: "Detalhes do usuário " + user.name },
                ]}
            />
            <div className="flex flex-col gap-2 pr-8">
                <div className="flex items-center gap-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                        <UserRound size={20} />
                    </span>
                    <h2 id="user-details-title" className="text-lg font-extrabold md:text-2xl">
                        Detalhes do usuário
                    </h2>
                </div>
                <p className="text-xs text-j-gray-500 md:text-sm">
                    Informações administrativas somente para consulta.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-j-blue-800 p-4 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] rounded-2xl md:p-8">
                <ReadOnlyField label="Matrícula" value={user.id} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Nome" value={user.name} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="E-mail" value={user.email} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="CPF" value={maskCPF(user.cpf)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-j-white md:text-sm">Status</span>
                    <span
                        className={twMerge(
                            "w-fit rounded-full px-3 py-1 text-xs font-bold",
                            USER_STATUS_STYLE[user.accountStatus],
                        )}
                    >
                        {USER_STATUS_LABEL[user.accountStatus]}
                    </span>
                </div>

                <ReadOnlyField
                    label="Troca de senha pendente"
                    value={user.passwordChangeRequired ? "Sim" : "Não"}
                    valueClassName="bg-j-gray-500 font-normal text-j-white"
                />
                <ReadOnlyField label="Data de cadastro" value={maskDate(user.createdAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Última atualização" value={maskDate(user.updatedAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                <UserRoles roles={roles} id={user.id} />

            </div>

        </div>
    );
}

export function UserDetailsModal({
    user,
    roles,
}: UserDetailsModalProps) {
    const router = useRouter();

    return (
        <ModalRoot isOpen={true} onClose={() => router.back()}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-details-title"
                className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-y-auto overflow-x-hidden rounded-3xl bg-j-white shadow-2xl"
            >
                <ButtonIcon
                    autoFocus
                    onClick={() => router.back()}
                    aria-label="Fechar detalhes do usuário"
                    className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800 md:right-6 md:top-6"
                >
                    <X className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </ButtonIcon>

                <header className="border-b border-j-gray-200 px-5 pb-5 pr-16 pt-6 md:px-8 md:pb-6 md:pr-20 md:pt-8">
                    <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                            <UserRound size={20} />
                        </span>
                        <div>
                            <h2 id="user-details-title" className="text-xl font-extrabold text-j-blue-800 md:text-2xl">
                                Detalhes do usuário
                            </h2>
                            <p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">
                                Informações administrativas somente para consulta.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 md:px-8 md:py-6">
                    <ReadOnlyField label="Matrícula" value={user.id} labelClassName="text-j-gray-700" valueClassName="border-2 border-j-gray-200 bg-j-gray-100 font-normal text-j-gray-700" />
                    <ReadOnlyField label="Nome" value={user.name} labelClassName="text-j-gray-700" valueClassName="border-2 border-j-gray-200 bg-j-gray-100 font-normal text-j-gray-700" />
                    <ReadOnlyField label="E-mail" value={user.email} labelClassName="text-j-gray-700" valueClassName="border-2 border-j-gray-200 bg-j-gray-100 font-normal text-j-gray-700" />
                    <ReadOnlyField label="CPF" value={maskCPF(user.cpf)} labelClassName="text-j-gray-700" valueClassName="border-2 border-j-gray-200 bg-j-gray-100 font-normal text-j-gray-700" />
                    <ReadOnlyField label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} labelClassName="text-j-gray-700" valueClassName="border-2 border-j-gray-200 bg-j-gray-100 font-normal text-j-gray-700" />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-j-gray-700 md:text-sm">Status</span>
                        <span
                            className={twMerge(
                                "w-fit rounded-full px-3 py-1 text-xs font-bold",
                                USER_STATUS_STYLE[user.accountStatus],
                            )}
                        >
                            {USER_STATUS_LABEL[user.accountStatus]}
                        </span>
                    </div>

                    <ReadOnlyField
                        label="Troca de senha pendente"
                        value={user.passwordChangeRequired ? "Sim" : "Não"}
                        labelClassName="text-j-gray-700"
                        valueClassName="border-2 border-j-gray-200 bg-j-gray-100 font-normal text-j-gray-700"
                    />
                    <ReadOnlyField label="Data de cadastro" value={maskDate(user.createdAt)} labelClassName="text-j-gray-700" valueClassName="border-2 border-j-gray-200 bg-j-gray-100 font-normal text-j-gray-700" />
                    <ReadOnlyField label="Última atualização" value={maskDate(user.updatedAt)} labelClassName="text-j-gray-700" valueClassName="border-2 border-j-gray-200 bg-j-gray-100 font-normal text-j-gray-700" />

                    <UserRoles roles={roles} id={user.id} />
                </div>
            </div>
        </ModalRoot>
    );
}

export function UserRoles({ roles }: { roles: RoleListResponse, id: number }) {
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#roles") {
            const element = document.getElementById("roles");
            if (element) {
                // Um pequeno delay garante que o DOM do modal/página esteja totalmente renderizado
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 150);
            }
        }
    }, []);

    return (
        <div
            id="roles"
            className="flex flex-col gap-2 sm:col-span-2 scroll-mt-24"
        >
            <span className="text-xs font-bold text-j-gray-700 md:text-sm">Cargos atribuídos</span>

            {roles.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="flex flex-col gap-1 rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <span className="font-bold text-j-blue-800 text-sm md:text-base">
                                    {role.name}
                                </span>
                                <span
                                    className={twMerge(
                                        "rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-wider",
                                        role.status === "ACTIVE"
                                            ? "bg-j-green-100 text-j-green-700"
                                            : "bg-j-gray-200 text-j-gray-600"
                                    )}
                                >
                                    {ROLE_STATUS_LABEL[role.status] || role.status}
                                </span>
                            </div>
                            <span className="text-xs text-j-gray-500 md:text-sm leading-relaxed">
                                {role.description}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-sm text-j-gray-400 italic">
                    Nenhum papel de acesso vinculado a este usuário.
                </span>
            )}
        </div>
    );
}
