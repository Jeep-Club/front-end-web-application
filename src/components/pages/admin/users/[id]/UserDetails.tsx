"use client";

import { AlertCircle, LoaderCircle, LockKeyhole, Plus, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getAdminUserAction } from "@/actions/admin/users/detail";
import { Button } from "@/components/common/button";
import { ReadOnlyField } from "@/components/common/ReadOnlyField";
import { ModalRoot } from "@/components/common/modal/root";
import { listUserRolesAction } from "@/actions/authorization/list-user-roles";
import { AddUserRoleModal } from "@/components/pages/admin/roles-permissoe/AddUserRoleModal";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";
import { hasPermission } from "@/utils/permission/hasPermission";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { ROLE_STATUS_LABEL, USER_STATUS_LABEL, USER_STATUS_STYLE } from "../user-display";
import { UserWorkspace, type UserWorkspaceOption } from "../UserWorkspace";
import { hasAdminSecurityReadPermission, UserSecurityTab } from "./UserSecurityTab";
import { UserActivationInvitation } from "./UserActivationInvitation";

interface UserDetailsModalProps {
    user: AdminUser;
    modal?: boolean;
}

export function AdminUserDetailsLoader({ userId, modal = false }: { userId: number; modal?: boolean }) {
    const router = useRouter();
    const { data: user, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["admin-users", "details", userId],
        queryFn: () => getAdminUserAction(userId),
        retry: false,
    });

    if (user) return <AdminUserDetailsPage user={user} modal={modal} />;

    const content = isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-j-gray-500">
            <LoaderCircle size={22} className="animate-spin" />
            <span>Carregando dados do usuário...</span>
        </div>
    ) : (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center">
            <AlertCircle size={34} className="text-j-red-500" />
            <div>
                <h2 className="text-lg font-extrabold text-j-blue-800">Não foi possível carregar este usuário</h2>
                <p role="alert" className="mt-2 text-sm text-j-gray-600">
                    {error instanceof Error ? error.message : "Ocorreu uma falha ao carregar os dados."}
                </p>
            </div>
            <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
                <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                {isFetching ? "Tentando novamente..." : "Tentar novamente"}
            </Button>
        </div>
    );

    if (modal) {
        return (
            <ModalRoot isOpen onClose={() => router.back()} contentClassName="max-w-4xl">
                <div className="max-h-[calc(100dvh-2rem)] w-full overscroll-contain overflow-y-auto rounded-xl bg-j-white shadow-2xl [webkit-overflow-scrolling:touch]">{content}</div>
            </ModalRoot>
        );
    }

    return <main className="flex min-h-[70dvh] items-center justify-center p-4">{content}</main>;
}

const fieldStyle = {
    labelClassName: "text-xs font-medium text-j-gray-500",
    valueClassName: "min-h-0 break-words rounded-none border-0 bg-transparent p-0 font-medium text-j-gray-700",
};

export function AdminUserDetailsPage({ user, modal = false }: UserDetailsModalProps) {
    return modal ? <UserDetailsModal user={user} /> : <UserDetails user={user} />;
}

export function UserDetails({ user }: UserDetailsModalProps) {
    return <UserDetailsWorkspace user={user} modal={false} />;
}

export function UserDetailsModal({ user }: UserDetailsModalProps) {
    const router = useRouter();

    return (
        <ModalRoot isOpen={true} onClose={() => router.back()} contentClassName="max-w-4xl">
            <div role="dialog" aria-modal="true" aria-label={`Detalhes do usuário ${user.name}`} className="max-h-[calc(100dvh-2rem)] w-full overscroll-contain overflow-y-auto rounded-xl bg-j-gray-100 shadow-2xl [webkit-overflow-scrolling:touch]">
                <UserDetailsWorkspace user={user} modal />
            </div>
        </ModalRoot>
    );
}

function UserDetailsWorkspace({ user, modal }: UserDetailsModalProps) {
    const router = useRouter();
    const permissions = useUserStore((state) => state.permissions);
    const canReadUserRoles = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_READ");
    const canManageInvitations = hasPermission(permissions, "IDENTITY", "USER_CREATE");
    const canReadSecurity = hasAdminSecurityReadPermission(permissions);
    const [selected, setSelected] = useState(() =>
        typeof window !== "undefined" && window.location.search.includes("invitation=1") && canManageInvitations
            ? "access"
            : typeof window !== "undefined" && window.location.hash === "#roles" && canReadUserRoles ? "roles" : "personal",
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
            onBack={() => modal ? router.back() : router.push("/admin/users")}
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
                        {canManageInvitations && user.email && <UserActivationInvitation userId={user.id} userStatus={user.status} />}
                    </section>
                )}
                {selected === "roles" && canReadUserRoles && <UserRolesPanel userId={user.id} userName={user.name} />}
                {selected === "security" && canReadSecurity && <UserSecurityTab userId={user.id} />}
            </div>
        </UserWorkspace>
    );
}

function UserRolesPanel({ userId, userName }: { userId: number; userName: string }) {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const canAssign = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_ASSIGN");
    const { data: roles, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["authorization", "users", userId, "roles"],
        queryFn: () => listUserRolesAction(userId),
        retry: false,
    });

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold text-j-gray-700 md:text-sm">Cargos atribuídos</span>
                {canAssign && (
                    <Button
                        type="button"
                        disabled={isLoading || !roles}
                        onClick={() => {
                            setContent(<AddUserRoleModal userId={userId} userName={userName} currentRoleIds={roles?.map((role) => role.id) ?? []} />);
                            setOpen();
                        }}
                        className="w-full sm:w-auto"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Adicionar cargo
                    </Button>
                )}
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500"><LoaderCircle size={20} className="animate-spin" />Carregando cargos...</div>
            ) : error || !roles ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <AlertCircle size={34} className="text-red-500" />
                    <p className="max-w-md text-sm text-j-gray-600">{extractApiErrorMessage(error, "Não foi possível carregar os cargos do usuário.")}</p>
                    <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
                        {isFetching ? "Tentando novamente..." : "Tentar novamente"}
                    </Button>
                </div>
            ) : (
                <UserRoles roles={roles} />
            )}
        </section>
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
