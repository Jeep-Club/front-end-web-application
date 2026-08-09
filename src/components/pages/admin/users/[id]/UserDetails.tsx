"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, UserRound, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button, ButtonIcon } from "@/components/common/button";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { useModal } from "@/providers/ModalProvider";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";
import { ROLE_STATUS_LABEL, USER_STATUS_LABEL, USER_STATUS_STYLE } from "../user-display";
import { useModalFocusRestoration } from "../useModalFocusRestoration";
import { useEffect } from "react";
import { ModalRoot } from '@/components/common/modal/root';
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";

interface UserDetailsModalProps {
    // userId: number;
    // canReadRoles: boolean;
    // onLoadUser: (userId: number) => Promise<UserListItem>;
    user: AdminUser;
    modal?: boolean;
}

export function AdminUserDetailsPage({ user, modal = false }: UserDetailsModalProps) {


    if (!modal) {
        return (
            <UserDetails user={user} />
        );
    }


    return <UserDetailsModal user={user} />;
}

export function UserDetails({ user }: UserDetailsModalProps) {
    return (
        <div
            className="relative flex w-full flex-col gap-5 bg-j-white-800 p-4 text-j-black shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8"
        >
            <PageHeader
                title=""
                breadcrumbs={[
                    { label: "Início", href: "/feed" },
                    { label: "Painel admin", href: "/admin" },
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
                <ReadOnlyField label="ID" value={user.id} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Nome" value={user.name} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="E-mail" value={user.email} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="CPF" value={maskCPF(user.cpf)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-j-white md:text-sm">Status</span>
                    <span
                        className={twMerge(
                            "w-fit rounded-full px-3 py-1 text-xs font-bold",
                            USER_STATUS_STYLE[user.status],
                        )}
                    >
                        {USER_STATUS_LABEL[user.status]}
                    </span>
                </div>

                <ReadOnlyField
                    label="Troca de senha pendente"
                    value={user.passwordChangeRequired ? "Sim" : "Não"}
                    valueClassName="bg-j-gray-500 font-normal text-j-white"
                />
                <ReadOnlyField label="Data de cadastro" value={maskDate(user.createdAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                <ReadOnlyField label="Última atualização" value={maskDate(user.updatedAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />

            </div>
        </div>
    );
}

export function UserDetailsModal({
    // userId,
    // canReadRoles,
    // onLoadUser,
    user,
}: UserDetailsModalProps) {
    // useModalFocusRestoration();
    const router = useRouter()
    // const { data: user, isLoading, error, refetch, isFetching } = useQuery({
    //     queryKey: ["admin-users", "details", userId],
    //     queryFn: () => onLoadUser(userId),
    //     retry: false,
    // });
    return (
        <ModalRoot isOpen={true} onClose={() => router.back()} >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-details-title"
                className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-2xl bg-j-blue-800 p-4 text-j-white shadow-[-1px_16px_23px_1px_rgba(0,0,0,0.35)] md:p-8"
            >
                <ButtonIcon
                    autoFocus
                    onClick={() => router.back()}
                    aria-label="Fechar detalhes do usuário"
                    className="absolute right-3 top-3 text-j-transparent-white hover:text-j-yellow-300 md:right-4 md:top-4"
                >
                    <X size={22} />
                </ButtonIcon>

                <div className="flex flex-col gap-2 pr-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-j-blue-700 text-j-yellow-300">
                        <UserRound size={20} />
                    </span>
                    <h2 id="user-details-title" className="text-lg font-extrabold md:text-2xl">
                        Detalhes do usuário
                    </h2>
                    <p className="text-xs text-j-transparent-white md:text-sm">
                        Informações administrativas somente para consulta.
                    </p>
                </div>

                {/* {isLoading ? (
                <div className="flex min-h-56 items-center justify-center gap-2 text-j-transparent-white">
                    <LoaderCircle className="animate-spin" size={20} />
                    Carregando detalhes...
                </div>
            ) : error || !user ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="text-j-red-200" size={34} />
                    <p className="max-w-md text-sm text-j-white">
                        {extractApiErrorMessage(error, "Não foi possível carregar os detalhes do usuário.")}
                    </p>
                    <Button
                        type="button"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                        className="bg-j-yellow-300 text-j-blue-800 hover:bg-j-yellow-400 hover:text-j-blue-800"
                    >
                        {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="ID" value={user.id} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Nome" value={user.name} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="E-mail" value={user.email} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="CPF" value={maskCPF(user.cpf)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-j-white md:text-sm">Status</span>
                        <span
                            className={twMerge(
                                "w-fit rounded-full px-3 py-1 text-xs font-bold",
                                USER_STATUS_STYLE[user.status],
                            )}
                        >
                            {USER_STATUS_LABEL[user.status]}
                        </span>
                    </div>

                    <ReadOnlyField
                        label="Troca de senha pendente"
                        value={user.passwordChangeRequired ? "Sim" : "Não"}
                        valueClassName="bg-j-gray-500 font-normal text-j-white"
                    />
                    <ReadOnlyField label="Data de cadastro" value={maskDate(user.createdAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Última atualização" value={maskDate(user.updatedAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                    {canReadRoles && (
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <span className="text-xs font-bold text-j-white md:text-sm">Papéis de acesso</span>
                            {user.roles.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <span
                                            key={role.id}
                                            className={twMerge(
                                                "rounded-full px-3 py-1 text-xs font-bold",
                                                role.status === "ACTIVE"
                                                    ? "bg-j-yellow-300 text-j-blue-800"
                                                    : "bg-j-gray-200 text-j-gray-600",
                                            )}
                                        >
                                            {role.name} · {ROLE_STATUS_LABEL[role.status]}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-sm text-j-transparent-white">Nenhum papel vinculado.</span>
                            )}
                        </div>
                    )}
                </div>

                
            )} */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="ID" value={user.id} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Nome" value={user.name} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="E-mail" value={user.email} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="CPF" value={maskCPF(user.cpf)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-j-white md:text-sm">Status</span>
                        <span
                            className={twMerge(
                                "w-fit rounded-full px-3 py-1 text-xs font-bold",
                                USER_STATUS_STYLE[user.status],
                            )}
                        >
                            {USER_STATUS_LABEL[user.status]}
                        </span>
                    </div>

                    <ReadOnlyField
                        label="Troca de senha pendente"
                        value={user.passwordChangeRequired ? "Sim" : "Não"}
                        valueClassName="bg-j-gray-500 font-normal text-j-white"
                    />
                    <ReadOnlyField label="Data de cadastro" value={maskDate(user.createdAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />
                    <ReadOnlyField label="Última atualização" value={maskDate(user.updatedAt)} valueClassName="bg-j-gray-500 font-normal text-j-white" />

                </div>
            </div>
        </ModalRoot>
    );
}
