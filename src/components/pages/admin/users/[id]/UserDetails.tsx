"use client";

import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { ModalRoot } from "@/components/common/modal/root";
import { useUserStore } from "@/stores/userStore";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";
import { hasPermission } from "@/utils/permission/hasPermission";
import { ROLE_STATUS_LABEL, USER_STATUS_LABEL, USER_STATUS_STYLE } from "../user-display";
import { UserWorkspace, type UserWorkspaceOption } from "../UserWorkspace";
import { hasAdminSecurityReadPermission, UserSecurityTab } from "./UserSecurityTab";

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
    return <UserDetailsWorkspace user={user} roles={roles} />;
}

export function UserDetailsModal({ user, roles }: UserDetailsModalProps) {
    const router = useRouter();

    return (
        <ModalRoot isOpen={true} onClose={() => router.back()} contentClassName="max-w-4xl">
            <div role="dialog" aria-modal="true" aria-label={`Detalhes do usuário ${user.name}`} className="max-h-[92dvh] w-full overflow-y-auto rounded-xl bg-j-gray-100 shadow-2xl">
                <UserDetailsWorkspace user={user} roles={roles} />
            </div>
        </ModalRoot>
    );
}

function UserDetailsWorkspace({ user, roles }: UserDetailsModalProps) {
    const router = useRouter();
    const permissions = useUserStore((state) => state.permissions);
    const canReadUserRoles = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_READ");
    const canReadSecurity = hasAdminSecurityReadPermission(permissions);
    const [selected, setSelected] = useState(() =>
        typeof window !== "undefined" && window.location.hash === "#roles" && canReadUserRoles ? "roles" : "personal",
    );

    const options = useMemo<UserWorkspaceOption[]>(() => {
        const base: UserWorkspaceOption[] = [
            { key: "personal", label: "Dados", description: "Identificação e contato", icon: UserRound },
            { key: "access", label: "Acesso", description: "Situação e histórico do cadastro", icon: LockKeyhole },
        ];
        if (canReadUserRoles) base.push({ key: "roles", label: "Cargos", description: "Papéis de acesso do usuário", icon: ShieldCheck });
        if (canReadSecurity) base.push({ key: "security", label: "Segurança", description: "Sessões, tokens e recuperação de senha", icon: LockKeyhole });
        return base;
    }, [canReadSecurity, canReadUserRoles]);

    return (
        <UserWorkspace
            title="Detalhes do usuário"
            description="Informações da conta, permissões e segurança."
            options={options}
            selected={selected}
            onSelect={setSelected}
            summary={(
                <div className="flex items-center gap-3 bg-j-blue-800 px-4 py-5 sm:px-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-j-white/10 text-j-yellow-300"><UserRound size={22} aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                        <p className="break-words text-base font-bold text-j-white">{user.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-j-white/70">Matrícula {user.id}</span>
                            <span className={twMerge("rounded-full px-2 py-0.5 text-xs font-semibold", USER_STATUS_STYLE[user.status])}>{USER_STATUS_LABEL[user.status]}</span>
                        </div>
                    </div>
                </div>
            )}
            onBack={() => router.push("/admin/users")}
        >
            <div className="p-4 sm:p-6">
                {selected === "personal" && (
                    <section aria-label="Dados pessoais">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <ReadOnlyField {...fieldStyle} label="CPF" value={maskCPF(user.cpf)} />
                            <ReadOnlyField {...fieldStyle} label="E-mail" value={user.email} />
                            <ReadOnlyField {...fieldStyle} label="Telefone" value={user.phoneNumber ? maskPhoneNumber(user.phoneNumber) : null} />
                        </div>
                    </section>
                )}
                {selected === "access" && (
                    <section aria-label="Conta e acesso" className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex flex-col items-start gap-2">
                            <span className="text-sm font-bold text-j-gray-600">Status da conta</span>
                            <span className={twMerge("rounded-full px-3 py-1 text-xs font-bold", USER_STATUS_STYLE[user.status])}>{USER_STATUS_LABEL[user.status]}</span>
                        </div>
                        <ReadOnlyField {...fieldStyle} label="Data de desativação" value={maskDate(user.disabledAt)} />
                        <ReadOnlyField {...fieldStyle} label="Data de cadastro" value={maskDate(user.createdAt)} />
                        <ReadOnlyField {...fieldStyle} label="Última atualização" value={maskDate(user.updatedAt)} />
                    </section>
                )}
                {selected === "roles" && canReadUserRoles && <UserRoles roles={roles} />}
                {selected === "security" && canReadSecurity && <UserSecurityTab userId={user.id} />}
            </div>
        </UserWorkspace>
    );
}

export function UserRoles({ roles }: { roles: RoleListResponse }) {
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#roles") {
            const element = document.getElementById("roles");
            if (element) setTimeout(() => element.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
        }
    }, []);

    return (
        <div id="roles" className="flex scroll-mt-24 flex-col gap-2">
            <span className="text-xs font-bold text-j-gray-700 md:text-sm">Cargos atribuídos</span>
            {roles.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {roles.map((role) => (
                        <div key={role.id} className="flex flex-col gap-1 rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-bold text-j-blue-800 md:text-base">{role.name}</span>
                                <span className={twMerge("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider", role.status === "ACTIVE" ? "bg-j-green-100 text-j-green-700" : "bg-j-gray-200 text-j-gray-600")}>
                                    {ROLE_STATUS_LABEL[role.status] || role.status}
                                </span>
                            </div>
                            <span className="text-xs leading-relaxed text-j-gray-500 md:text-sm">{role.description}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-sm italic text-j-gray-400">Nenhum papel de acesso vinculado a este usuário.</span>
            )}
        </div>
    );
}
