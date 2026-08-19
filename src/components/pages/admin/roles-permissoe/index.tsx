"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Eye, KeyRound, ListChecks, Lock, Pencil, Plus, Power, PowerOff, ShieldCheck, Trash2, Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { listRolesAction } from "@/actions/authorization/list-roles";
import { listPermissionsAction } from "@/actions/authorization/list-permissions";
import { CreateRoleModal } from "./CreateRoleModal";
import { ViewRoleModal } from "./ViewRoleModal";
import { EditRoleModal } from "./EditRoleModal";
import { ToggleRoleStatusModal } from "./ToggleRoleStatusModal";
import { DeleteRoleModal } from "./DeleteRoleModal";
import { RolePermissionsModal } from "./RolePermissionsModal";
import { ManageRolePermissionsModal } from "./ManageRolePermissionsModal";
import { getModuleLabel, getPermissionName } from "./permissionLabels";
import { usePageTour } from "@/hooks/useTour";
import { getRolesTourSteps } from "@/config/tourSteps";
import TourHelpButton from "@/components/common/tour/TourHelpButton";

const ROLE_STATUS_LABEL: Record<RoleStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    DELETED: "Excluído",
};

const ROLE_STATUS_DOT_STYLE: Record<RoleStatus, string> = {
    ACTIVE: "bg-j-green-500",
    INACTIVE: "bg-j-gray-400",
    DELETED: "bg-red-500",
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
    const canUpdateRole = hasPermission(permissions, "AUTHORIZATION", "ROLE_UPDATE");
    const canEnableRole = hasPermission(permissions, "AUTHORIZATION", "ROLE_ENABLE");
    const canDisableRole = hasPermission(permissions, "AUTHORIZATION", "ROLE_DISABLE");
    const canDeleteRole = hasPermission(permissions, "AUTHORIZATION", "ROLE_DELETE");
    const canReadPermission = hasPermission(permissions, "AUTHORIZATION", "PERMISSION_READ");
    const canAssignPermission = hasPermission(permissions, "AUTHORIZATION", "PERMISSION_ASSIGN");
    const canRevokePermission = hasPermission(permissions, "AUTHORIZATION", "PERMISSION_REVOKE");

    const visibleTabs = TABS.filter((tab) =>
        hasPermission(permissions, tab.module, tab.action)
    );
    const isTabVisible = (key: TabKey) =>
        visibleTabs.some((tab) => tab.key === key);

    const { setContent, setOpen } = useModal();

    const [activeTab, setActiveTab] = useState<TabKey>(
        () => visibleTabs[0]?.key ?? TABS[0].key
    );

    // Tour do módulo de Roles e Permissões (Mobile e Desktop)
    const { restartTour } = usePageTour({
        storageKey: "tour_completed_admin_roles",
        steps: getRolesTourSteps,
        autoStartOnFirstVisit: true,
        enabled: permissions.length > 0,
    });

    const handleRestartTour = () => {
        if (activeTab !== "roles") {
            setActiveTab("roles");
            setTimeout(() => {
                restartTour();
            }, 100);
        } else {
            restartTour();
        }
    };

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

    const {
        data: permissionsList,
        isLoading: isLoadingPermissions,
        isError: isPermissionsError,
    } = useQuery({
        queryKey: ["authorization", "permissions"],
        queryFn: listPermissionsAction,
        enabled: activeTab === "permissions" && isTabVisible("permissions"),
    });

    const permissionsByModule = (permissionsList ?? []).reduce<Record<string, PermissionResponse[]>>((acc, permission) => {
        (acc[permission.module] ??= []).push(permission);
        return acc;
    }, {});

    const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label;

    const handleOpenCreateRole = () => {
        setContent(<CreateRoleModal />);
        setOpen();
    };

    const handleOpenViewRole = (roleId: number) => {
        setContent(<ViewRoleModal roleId={roleId} />);
        setOpen();
    };

    const handleOpenEditRole = (roleId: number) => {
        setContent(<EditRoleModal roleId={roleId} />);
        setOpen();
    };

    const handleOpenToggleRoleStatus = (role: RoleResponse) => {
        setContent(
            <ToggleRoleStatusModal
                roleId={role.id}
                roleName={role.name}
                nextStatus={role.status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE"}
            />
        );
        setOpen();
    };

    const handleOpenDeleteRole = (role: RoleResponse) => {
        setContent(<DeleteRoleModal roleId={role.id} roleName={role.name} />);
        setOpen();
    };

    const handleOpenRolePermissions = (role: RoleResponse) => {
        setContent(<RolePermissionsModal roleId={role.id} roleName={role.name} />);
        setOpen();
    };

    const handleOpenManageRolePermissions = (role: RoleResponse) => {
        setContent(<ManageRolePermissionsModal roleId={role.id} roleName={role.name} roleKind={role.kind} />);
        setOpen();
    };

    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    id="tour-roles-header"
                    title="Cargos e permissões"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Painel admin", href: "/admin" },
                        { label: "Gestão" },
                        { label: activeTabLabel ?? "" },
                    ]}
                    actions={
                        activeTab === "roles" ? (
                            <TourHelpButton
                                id="tour-roles-help-btn"
                                onClick={handleRestartTour}
                                label="Como gerenciar cargos?"
                            />
                        ) : undefined
                    }
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
                        <section id="tour-roles-table" className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-j-gray-200 p-4 md:px-6">
                                <div>
                                    <h2 className="font-black text-j-blue-800">Cargos cadastrados</h2>
                                    <p className="text-sm text-j-gray-600">
                                        {isLoading ? "Carregando..." : `${roles?.length ?? 0} cadastrado(s)`}
                                    </p>
                                </div>

                                {canCreateRole && (
                                    <Button id="tour-create-role-btn" onClick={handleOpenCreateRole}>
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
                                    {roles.map((role, index) => (
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
                                                        <div className="flex min-w-0 items-center gap-1.5">
                                                            <h3 className="truncate font-black text-j-blue-800">{role.name}</h3>
                                                            {role.kind === "ROOT" && (
                                                                <Lock size={13} className="shrink-0 text-j-gray-400" />
                                                            )}
                                                        </div>
                                                        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-j-black">
                                                            <span className={twMerge("h-1.5 w-1.5 rounded-full", ROLE_STATUS_DOT_STYLE[role.status])} />
                                                            {ROLE_STATUS_LABEL[role.status]}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-j-gray-600">
                                                        {role.description ?? "Sem descrição."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                id={index === 0 ? "tour-role-actions" : undefined}
                                                className="mt-3 grid grid-cols-1 gap-0.5 border-t border-j-gray-100 pt-3 sm:grid-cols-2"
                                            >
                                                {role.status !== "DELETED" && !(role.kind === "ROOT" && role.status === "ACTIVE") && (
                                                    (role.status === "ACTIVE" ? canDisableRole : canEnableRole) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenToggleRoleStatus(role)}
                                                            className={twMerge(
                                                                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors",
                                                                role.status === "ACTIVE"
                                                                    ? "bg-red-50 hover:bg-red-100"
                                                                    : "bg-green-50 hover:bg-green-100"
                                                            )}
                                                        >
                                                            {role.status === "ACTIVE"
                                                                ? <PowerOff size={16} className="text-red-500" />
                                                                : <Power size={16} className="text-j-green-600" />}
                                                            {role.status === "ACTIVE" ? "Desativar" : "Ativar"}
                                                        </button>
                                                    )
                                                )}
                                                {canUpdateRole && role.kind !== "ROOT" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditRole(role.id)}
                                                        className="flex items-center gap-2.5 rounded-lg bg-yellow-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-yellow-100"
                                                    >
                                                        <Pencil size={16} className="text-yellow-500" />
                                                        Editar
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenViewRole(role.id)}
                                                    className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-blue-100"
                                                >
                                                    <Eye size={16} className="text-j-blue-800" />
                                                    Visualizar
                                                </button>
                                                {canReadPermission && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenRolePermissions(role)}
                                                        className="flex items-center gap-2.5 rounded-lg bg-j-gray-100/60 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-j-gray-100"
                                                    >
                                                        <ShieldCheck size={16} className="text-j-gray-500" />
                                                        Ver permissões
                                                    </button>
                                                )}
                                                {(canAssignPermission || canRevokePermission) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenManageRolePermissions(role)}
                                                        className="flex items-center gap-2.5 rounded-lg bg-purple-50 px-2.5 py-2 text-left text-sm font-bold text-j-gray-700 transition-colors hover:bg-purple-100"
                                                    >
                                                        <ListChecks size={16} className="text-purple-600" />
                                                        Gerenciar permissões
                                                    </button>
                                                )}
                                                {canDeleteRole && role.status !== "DELETED" && role.kind !== "ROOT" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDeleteRole(role)}
                                                        className="flex items-center gap-2.5 rounded-lg bg-red-50 px-2.5 py-2 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-100"
                                                    >
                                                        <Trash2 size={16} />
                                                        Excluir
                                                    </button>
                                                )}
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
                                <h2 className="font-black text-j-blue-800">Permissões cadastradas</h2>
                                <p className="text-sm text-j-gray-600">
                                    {isLoadingPermissions ? "Carregando..." : `${permissionsList?.length ?? 0} cadastrada(s)`}
                                </p>
                            </div>

                            <ShieldCheck size={24} className="text-j-gray-400" />
                        </div>

                        {isPermissionsError && (
                            <p className="p-4 text-sm text-red-600 md:px-6">
                                Não foi possível carregar as permissões.
                            </p>
                        )}

                        {!isLoadingPermissions && !isPermissionsError && permissionsList && permissionsList.length > 0 && (
                            <div className="flex flex-col divide-y divide-j-gray-100">
                                {Object.entries(permissionsByModule).map(([module, items]) => (
                                    <div key={module} className="p-4 md:px-6">
                                        <h3 className="mb-3 text-sm font-black text-j-blue-800">
                                            {getModuleLabel(module)}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {items.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex items-start gap-3 rounded-xl border border-j-gray-200 p-3"
                                                >
                                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-j-blue-800 text-j-yellow-300">
                                                        <ShieldCheck size={18} />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-base font-black text-j-blue-800">
                                                            {getPermissionName(permission)}
                                                        </p>
                                                        <p className="mt-0.5 text-sm text-j-gray-600">
                                                            {permission.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLoadingPermissions && !isPermissionsError && permissionsList && permissionsList.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-center min-h-72">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                                    <ShieldCheck size={31} />
                                </div>

                                <h3 className="text-lg font-black text-j-blue-800">
                                    Nenhuma permissão cadastrada
                                </h3>

                                <p className="mt-1 max-w-md text-sm text-j-gray-600">
                                    As permissões sincronizadas pelo sistema vão aparecer aqui.
                                </p>
                            </div>
                        )}
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
