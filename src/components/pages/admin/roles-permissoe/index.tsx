"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Eye, KeyRound, Plus, ShieldCheck, Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { PageHeader } from "@/components/common/page-header";
import { Button, ButtonIcon } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { listRolesAction } from "@/actions/authorization/list-roles";
import { CreateRoleModal } from "./CreateRoleModal";
import { ViewRoleModal } from "./ViewRoleModal";

const ROLE_STATUS_LABEL: Record<RoleStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    DELETED: "Excluído",
};

const ROLE_STATUS_STYLE: Record<RoleStatus, string> = {
    ACTIVE: "bg-j-green-100 text-j-green-700",
    INACTIVE: "bg-j-gray-200 text-j-gray-600",
    DELETED: "bg-red-100 text-red-600",
};

const TABS = [
    { key: "roles", label: "Cargos", icon: KeyRound, module: "AUTHORIZATION", action: "ROLE_READ" },
    { key: "permissions", label: "Permissões", icon: ShieldCheck, module: "AUTHORIZATION", action: "PERMISSION_READ" },
    { key: "users", label: "Atribuições", icon: Users, module: "AUTHORIZATION", action: "USER_ROLE_READ" },
] as const;

type TabKey = typeof TABS[number]["key"];

const TABS_GRID_COLS: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
};

export default function RolesPermissions() {
    const permissions = useUserStore((state) => state.permissions);
    const canCreateRole = hasPermission(permissions, "AUTHORIZATION", "ROLE_CREATE");

    const visibleTabs = TABS.filter((tab) =>
        hasPermission(permissions, tab.module, tab.action)
    );
    const isTabVisible = (key: TabKey) =>
        visibleTabs.some((tab) => tab.key === key);

    const { setContent, setOpen } = useModal();

    const [activeTab, setActiveTab] = useState<TabKey>(
        () => visibleTabs[0]?.key ?? TABS[0].key
    );

    useEffect(() => {
        if (!isTabVisible(activeTab)) {
            setActiveTab(visibleTabs[0]?.key ?? TABS[0].key);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, permissions]);

    const { data: roles, isLoading, isError } = useQuery({
        queryKey: ["authorization", "roles"],
        queryFn: listRolesAction,
        enabled: activeTab === "roles" && isTabVisible("roles"),
    });

    const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label;

    const handleOpenCreateRole = () => {
        setContent(<CreateRoleModal />);
        setOpen();
    };

    const handleOpenViewRole = (roleId: number) => {
        setContent(<ViewRoleModal roleId={roleId} />);
        setOpen();
    };

    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    title="Cargos e permissões"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Painel admin", href: "/admin" },
                        { label: "Gestão" },
                        { label: activeTabLabel ?? "" },
                    ]}
                />

                <div className={twMerge("grid gap-2 md:gap-3", TABS_GRID_COLS[visibleTabs.length] ?? "grid-cols-1")}>
                    {visibleTabs.map(({ key, label, icon: Icon }) => {
                        const isActive = key === activeTab;
                        return (
                            <button
                                key={key}
                                type="button"
                                title={label}
                                onClick={() => setActiveTab(key)}
                                className={twMerge(
                                    "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-colors md:flex-row md:justify-center md:p-4",
                                    isActive
                                        ? "border-j-blue-800 bg-j-blue-800 text-j-white shadow-md"
                                        : "border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-blue-300 hover:text-j-blue-800"
                                )}
                            >
                                <Icon size={20} />
                                <span className="text-xs font-bold md:text-sm">{label}</span>
                            </button>
                        );
                    })}
                </div>

                {activeTab === "roles" && isTabVisible("roles") && (
                    <div className="flex w-full flex-col gap-4">
                        <section className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-j-gray-200 p-4 md:px-6">
                                <div>
                                    <h2 className="font-black text-j-blue-800">Cargos cadastrados</h2>
                                    <p className="text-sm text-j-gray-600">
                                        {isLoading ? "Carregando..." : `${roles?.length ?? 0} cadastrado(s)`}
                                    </p>
                                </div>

                                {canCreateRole && (
                                    <Button onClick={handleOpenCreateRole}>
                                        <Plus size={18} />
                                        Criar cargo
                                    </Button>
                                )}
                            </div>

                            {isError && (
                                <p className="p-4 text-sm text-red-600 md:px-6">
                                    Não foi possível carregar os cargos.
                                </p>
                            )}

                            {!isLoading && !isError && roles && roles.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
                                    {roles.map((role) => (
                                        <article
                                            key={role.id}
                                            className="rounded-xl border border-j-gray-200 p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-yellow-300">
                                                    <KeyRound size={21} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="font-black text-j-blue-800">{role.name}</h3>
                                                        <span className={twMerge("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", ROLE_STATUS_STYLE[role.status])}>
                                                            {ROLE_STATUS_LABEL[role.status]}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-j-gray-600">
                                                        {role.description ?? "Sem descrição."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-end border-t border-j-gray-100 pt-3">
                                                <ButtonIcon
                                                    onClick={() => handleOpenViewRole(role.id)}
                                                    title="Visualizar"
                                                    className="rounded-lg border-none bg-j-blue-800 p-3 text-white hover:bg-j-blue-500 hover:text-white"
                                                >
                                                    <Eye size={20} />
                                                </ButtonIcon>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}

                            {!isLoading && !isError && roles && roles.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-8 text-center min-h-72">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                                        <KeyRound size={31} />
                                    </div>

                                    <h3 className="text-lg font-black text-j-blue-800">
                                        Nenhum cargo cadastrado
                                    </h3>

                                    <p className="mt-1 max-w-md text-sm text-j-gray-600">
                                        Crie um cargo para começar a configurar os acessos.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === "permissions" && isTabVisible("permissions") && (
                    <section className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-j-gray-200 p-4 md:px-6">
                            <div>
                                <h2 className="font-black text-j-blue-800">Permissões</h2>
                                <p className="text-sm text-j-gray-600">
                                    Atribua permissões aos cargos cadastrados.
                                </p>
                            </div>

                            <ShieldCheck size={24} className="text-j-gray-400" />
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 text-center min-h-72">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                                <ShieldCheck size={31} />
                            </div>

                            <h3 className="text-lg font-black text-j-blue-800">Em construção</h3>

                            <p className="mt-1 max-w-md text-sm text-j-gray-600">
                                A atribuição de permissões aos cargos vai aparecer aqui.
                            </p>
                        </div>
                    </section>
                )}

                {activeTab === "users" && isTabVisible("users") && (
                    <section className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-j-gray-200 p-4 md:px-6">
                            <div>
                                <h2 className="font-black text-j-blue-800">Permissões</h2>
                                <p className="text-sm text-j-gray-600">
                                    Veja e gerencie o cargo de cada usuário administrativo.
                                </p>
                            </div>

                            <Users size={24} className="text-j-gray-400" />
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 text-center min-h-72">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                                <Users size={31} />
                            </div>

                            <h3 className="text-lg font-black text-j-blue-800">Em construção</h3>

                            <p className="mt-1 max-w-md text-sm text-j-gray-600">
                                A lista de usuários e seus cargos vai aparecer aqui.
                            </p>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
