"use client";

import { LockKeyhole, ShieldCheck, UserRound, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonIcon } from "@/components/common/button";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { ModalRoot } from "@/components/common/modal/root";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";
import { ROLE_STATUS_LABEL, USER_STATUS_LABEL, USER_STATUS_STYLE } from "../user-display";
import { UserWorkspace } from "../UserWorkspace";

interface UserDetailsModalProps {
    roles: RoleListResponse;
    user: AdminUser;
    modal?: boolean;
}

const fieldStyle = {
    labelClassName: "text-xs font-medium text-j-gray-500",
    valueClassName: "min-h-0 break-words rounded-none border-0 bg-transparent p-0 font-medium text-j-gray-700",
};

export function AdminUserDetailsPage({ user, roles, modal = false }: UserDetailsModalProps) {
    return modal ? <UserDetailsModal user={user} roles={roles} /> : <UserDetails user={user} roles={roles} />;
}

export function UserDetails({ user, roles }: UserDetailsModalProps) {
    const router = useRouter();
    const [selected, setSelected] = useState("personal");

    useEffect(() => {
        const syncHash = () => {
            if (window.location.hash === "#roles") setSelected("roles");
        };
        syncHash();
        window.addEventListener("hashchange", syncHash);
        return () => window.removeEventListener("hashchange", syncHash);
    }, []);

    return (
        <UserWorkspace
            title="Detalhes do usuário"
            description="Informações da conta e permissões."
            options={[
                { key: "personal", label: "Dados", description: "Identificação e contato", icon: UserRound },
                { key: "access", label: "Acesso", description: "Situação e histórico do cadastro", icon: LockKeyhole },
                { key: "roles", label: "Cargos", description: "Papéis de acesso do usuário", icon: ShieldCheck },
            ]}
            summary={
                <div className="flex items-center gap-3 bg-j-blue-800 px-4 py-5 sm:px-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-j-white/10 text-j-yellow-300"><UserRound size={22} aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                        <p className="break-words text-base font-bold text-j-white">{user.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-j-white/70">Matrícula {user.id}</span>
                            <span className={twMerge("rounded-full px-2 py-0.5 text-xs font-semibold", USER_STATUS_STYLE[user.accountStatus])}>{USER_STATUS_LABEL[user.accountStatus]}</span>
                        </div>
                    </div>
                </div>
            }
            selected={selected}
            onSelect={setSelected}
            onBack={() => router.push("/admin/users")}
        >
            <div className="p-4 sm:p-6">
                <section hidden={selected !== "personal"} aria-label="Dados pessoais">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <ReadOnlyField {...fieldStyle} label="CPF" value={maskCPF(user.cpf)} />
                        <ReadOnlyField {...fieldStyle} label="E-mail" value={user.email} />
                        <ReadOnlyField {...fieldStyle} label="Telefone" value={user.phone ? maskPhoneNumber(user.phone) : null} />
                    </div>
                </section>
                <section hidden={selected !== "access"} aria-label="Conta e segurança">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex flex-col items-start gap-2">
                            <span className="text-sm font-bold text-j-gray-600">Status da conta</span>
                            <span className={twMerge("rounded-full px-3 py-1 text-xs font-bold", USER_STATUS_STYLE[user.accountStatus])}>
                                {USER_STATUS_LABEL[user.accountStatus]}
                            </span>
                        </div>
                        <ReadOnlyField {...fieldStyle} label="Troca de senha pendente" value={user.passwordChangeRequired ? "Sim" : "Não"} />
                        <ReadOnlyField {...fieldStyle} label="Data de cadastro" value={maskDate(user.createdAt)} />
                        <ReadOnlyField {...fieldStyle} label="Última atualização" value={maskDate(user.updatedAt)} />
                    </div>
                </section>
                {selected === "roles" && <UserRoles roles={roles} id={user.id} />}
            </div>
        </UserWorkspace>
    );
}

export function UserDetailsModal({ user, roles }: UserDetailsModalProps) {
    const router = useRouter();

    return (
        <ModalRoot isOpen={true} onClose={() => router.back()} contentClassName="max-w-3xl">
            <div role="dialog" aria-modal="true" aria-label="Detalhes do usuário" className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-xl bg-j-gray-100 shadow-2xl">
                <ButtonIcon autoFocus onClick={() => router.back()} aria-label="Fechar detalhes do usuário" className="absolute right-4 top-3 z-10 rounded-full bg-j-white p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800">
                    <X size={20} />
                </ButtonIcon>
                <UserDetails user={user} roles={roles} />
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
