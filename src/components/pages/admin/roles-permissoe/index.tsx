"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect,useMemo,useRef,useState } from "react";

import { Check,ChevronDown,Eye,KeyRound,ListChecks,Lock,Pencil,Plus,Power,PowerOff,Search,ShieldCheck,Trash2,Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input/input";
import { Table } from "@/components/common/table";
import { PageHeader } from "@/components/common/page-header";
import TourHelpButton from "@/components/common/tour/TourHelpButton";
import { getRolesTourSteps } from "@/config/tourSteps";
import { usePageTour } from "@/hooks/useTour";
import { useModal } from "@/providers/ModalProvider";
import { listPermissionsAction } from "@/server/actions/authorization/list-permissions";
import { listRolesAction } from "@/server/actions/authorization/list-roles";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { CreateRoleModal } from "./CreateRoleModal";
import { DeleteRoleModal } from "./DeleteRoleModal";
import { EditRoleModal } from "./EditRoleModal";
import { ManageRolePermissionsModal } from "./ManageRolePermissionsModal";
import { getModuleLabel,getPermissionDescription,getPermissionName } from "./permissionLabels";
import { RolePermissionsModal } from "./RolePermissionsModal";
import { RoleManagementLoading } from "./RoleManagementLoading";
import { ToggleRoleStatusModal } from "./ToggleRoleStatusModal";
import { UserRoleAssignmentsTab } from "./UserRoleAssignmentsTab";
import { ViewRoleModal } from "./ViewRoleModal";

const ROLE_STATUS_LABEL: Record<RoleStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    ARCHIVED: "Arquivado",
};

const roleCardActionClass = "flex h-12 min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-input-border bg-background-secondary px-3 text-left text-xs font-semibold leading-snug text-primary transition-colors hover:bg-input-bg-focus focus-visible:outline-2 focus-visible:outline-input-border-focus [&>svg]:shrink-0";

const ROLE_STATUS_DOT_STYLE: Record<RoleStatus, string> = {
    ACTIVE: "bg-j-green-500",
    INACTIVE: "bg-j-gray-400",
    ARCHIVED: "bg-red-500",
};

const TABS = [
    { key: "roles", label: "Cargos", icon: KeyRound, module: "AUTHORIZATION", action: "ROLE_READ" },
    { key: "permissions", label: "Permissões", icon: ShieldCheck, module: "AUTHORIZATION", action: "PERMISSION_READ" },
    { key: "users", label: "Atribuições", icon: Users, module: "AUTHORIZATION", action: "USER_ROLE_READ" },
] as const;

type TabKey = typeof TABS[number]["key"];
type RoleStatusFilter = RoleStatus;
const ROLE_FILTERS: Array<{ key: RoleStatusFilter; label: string }> = [
    { key: "ACTIVE", label: "Ativos" },
    { key: "INACTIVE", label: "Inativos" },
    { key: "ARCHIVED", label: "Arquivados" },
];
const deletedDateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

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

    const { setContent, openFromTrigger } = useModal();

    const [selectedTab, setActiveTab] = useState<TabKey>(
        () => visibleTabs[0]?.key ?? TABS[0].key
    );
    const activeTab = isTabVisible(selectedTab) ? selectedTab : visibleTabs[0]?.key ?? TABS[0].key;
    const [roleStatusFilter, setRoleStatusFilter] = useState<RoleStatusFilter>("ACTIVE");
    const [roleSearch, setRoleSearch] = useState("");
    const [rolePage, setRolePage] = useState(0);
    const [rolePageSize, setRolePageSize] = useState(10);
    const [permissionSearch, setPermissionSearch] = useState("");
    const [responsibilityFilter, setResponsibilityFilter] = useState("all");
    const [isResponsibilityMenuOpen, setIsResponsibilityMenuOpen] = useState(false);
    const responsibilityMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isResponsibilityMenuOpen) return;

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!responsibilityMenuRef.current?.contains(event.target as Node)) {
                setIsResponsibilityMenuOpen(false);
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsResponsibilityMenuOpen(false);
        };

        document.addEventListener("pointerdown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [isResponsibilityMenuOpen]);

    // Tour do módulo de Roles e Permissões (Mobile e Desktop)
    const { restartTour } = usePageTour({
        storageKey: "tour_completed_admin_roles",
        steps: getRolesTourSteps,
        autoStartOnFirstVisit: false,
        enabled: permissions.length > 0,
        onBeforeStart: () => {
            if (activeTab !== "roles") {
                setActiveTab("roles");
            }
        },
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

    const { data: roles, isLoading, isError } = useQuery({
        queryKey: ["authorization", "roles"],
        queryFn: listRolesAction,
        enabled: activeTab === "roles" && isTabVisible("roles"),
    });
    const roleSearchTerm = roleSearch.trim().toLocaleLowerCase("pt-BR");
    const filteredRoles = (roles ?? []).filter((role) =>
        role.status === roleStatusFilter &&
        [role.name, role.description ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(roleSearchTerm)),
    );
    const rolePageCount = Math.ceil(filteredRoles.length / rolePageSize);
    const currentRolePage = Math.min(rolePage, Math.max(0, rolePageCount - 1));
    const visibleRoles = filteredRoles.slice(currentRolePage * rolePageSize, (currentRolePage + 1) * rolePageSize);
    const roleCounts = ROLE_FILTERS.reduce<Record<RoleStatusFilter, number>>((counts, filter) => {
        counts[filter.key] = (roles ?? []).filter((role) => role.status === filter.key).length;
        return counts;
    }, { ACTIVE: 0, INACTIVE: 0, ARCHIVED: 0 });

    const {
        data: permissionsList,
        isLoading: isLoadingPermissions,
        isError: isPermissionsError,
    } = useQuery({
        queryKey: ["authorization", "permissions"],
        queryFn: listPermissionsAction,
        enabled: activeTab === "permissions" && isTabVisible("permissions"),
    });

    const permissionResponsibilities = useMemo(
        () => [...new Set((permissionsList ?? []).map((permission) => permission.module))]
            .sort((left, right) => getModuleLabel(left).localeCompare(getModuleLabel(right), "pt-BR")),
        [permissionsList],
    );
    const filteredPermissions = useMemo(() => {
        const query = permissionSearch.trim().toLocaleLowerCase("pt-BR");
        return (permissionsList ?? []).filter((permission) => {
            const matchesResponsibility = responsibilityFilter === "all" || permission.module === responsibilityFilter;
            const searchableText = `${getPermissionName(permission)} ${getPermissionDescription(permission)}`
                .toLocaleLowerCase("pt-BR");
            return matchesResponsibility && (!query || searchableText.includes(query));
        });
    }, [permissionsList, permissionSearch, responsibilityFilter]);
    const permissionsByModule = filteredPermissions.reduce<Record<string, PermissionResponse[]>>((acc, permission) => {
        (acc[permission.module] ??= []).push(permission);
        return acc;
    }, {});

    const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label;

    const handleOpenCreateRole = (trigger: HTMLElement) => {
        setContent(<CreateRoleModal />);
        openFromTrigger(trigger);
    };

    const handleOpenViewRole = (trigger: HTMLElement, roleId: number) => {
        setContent(<ViewRoleModal roleId={roleId} />);
        openFromTrigger(trigger);
    };

    const handleOpenEditRole = (trigger: HTMLElement, roleId: number) => {
        setContent(<EditRoleModal roleId={roleId} />);
        openFromTrigger(trigger);
    };

    const handleOpenToggleRoleStatus = (trigger: HTMLElement, role: RoleResponse) => {
        setContent(
            <ToggleRoleStatusModal
                roleId={role.id}
                roleName={role.name}
                nextStatus={role.status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE"}
            />
        );
        openFromTrigger(trigger);
    };

    const handleOpenDeleteRole = (trigger: HTMLElement, role: RoleResponse) => {
        setContent(<DeleteRoleModal roleId={role.id} roleName={role.name} />);
        openFromTrigger(trigger);
    };

    const handleOpenRolePermissions = (trigger: HTMLElement, role: RoleResponse) => {
        setContent(<RolePermissionsModal roleId={role.id} roleName={role.name} />);
        openFromTrigger(trigger);
    };

    const handleOpenManageRolePermissions = (trigger: HTMLElement, role: RoleResponse) => {
        setContent(<ManageRolePermissionsModal roleId={role.id} roleName={role.name} roleKind={role.kind} />);
        openFromTrigger(trigger);
    };

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    id="tour-roles-header"
                    title={
                        activeTab === "roles"
                            ? "Gestão de cargos"
                            : activeTab === "permissions"
                                ? "Gestão de permissões"
                                : "Atribuição de cargos"
                    }
                    breadcrumbs={[
                        { label: "Home", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: activeTabLabel ?? "" },
                    ]}
                    actions={
                        activeTab === "roles" ? (
                            <TourHelpButton
                                id="tour-roles-help-btn"
                                onClick={handleRestartTour}
                                label="Como gerenciar cargos?"
                                className="w-full justify-center sm:w-auto"
                            />
                        ) : undefined
                    }
                />

                <div id="tour-roles-tabs" className={twMerge("grid gap-2 md:gap-3", TABS_GRID_COLS[visibleTabs.length] ?? "grid-cols-1")}>
                    {visibleTabs.map(({ key, label, icon: Icon }) => {
                        const isActive = key === activeTab;
                        return (
                            <button
                                key={key}
                                type="button"
                                data-active={isActive}
                                aria-pressed={isActive}
                                title={label}
                                onClick={() => setActiveTab(key)}
                                className={twMerge(
                                    "profile-tab flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-2 text-center transition-colors md:p-4",
                                    isActive
                                        ? "border-j-blue-800 bg-j-blue-800 text-j-white shadow-md"
                                        : "border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-blue-300"
                                )}
                            >
                                <Icon size={22} aria-hidden="true" />
                                <span className="text-xs font-bold">{label}</span>
                            </button>
                        );
                    })}
                </div>

                {activeTab === "roles" && isTabVisible("roles") && (
                    <div className="flex w-full flex-col gap-4">
                        <Table.Root
                            data={visibleRoles}
                            columns={[]}
                            isLoading={isLoading}
                            pagination={{
                                pageIndex: currentRolePage,
                                pageSize: rolePageSize,
                                pageCount: rolePageCount,
                                rowCount: filteredRoles.length,
                                onChange: ({ pageIndex, pageSize }) => {
                                    setRolePage(pageSize === rolePageSize ? pageIndex : 0);
                                    setRolePageSize(pageSize);
                                },
                            }}
                            footer={filteredRoles.length > 0 && <Table.Pagination />}
                        >
                        <div id="tour-roles-table">
                            <div className="flex flex-wrap items-center gap-2 border-b border-j-gray-200 px-4 py-3 md:px-6">
                            <div className="w-full min-w-0 lg:flex-[1_1_12rem] [&>div]:gap-0">
                                <Input
                                    label="Buscar cargos"
                                    labelClassName="sr-only"
                                    name="role-search"
                                    type="search"
                                    placeholder="Buscar cargo"
                                    className="h-10 py-0"
                                    value={roleSearch}
                                    onChange={(event) => {
                                        setRoleSearch(event.target.value);
                                        setRolePage(0);
                                    }}
                                />
                            </div>
                                <div className="flex w-full items-center gap-0.5 rounded-lg border border-input-border bg-background-secondary p-0.5 lg:w-auto" role="tablist" aria-label="Filtrar cargos por situação">
                                    {ROLE_FILTERS.map(({ key, label }) => (
                                        <button key={key} type="button" role="tab" aria-selected={roleStatusFilter === key} onClick={() => { setRoleStatusFilter(key); setRolePage(0); }}
                                            className={twMerge(
                                                "inline-flex min-h-8 flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border border-transparent px-2 text-xs font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus motion-reduce:transition-none lg:flex-none",
                                                roleStatusFilter === key
                                                    ? "border-white bg-j-blue-800 text-white [html[data-theme=dark]_&]:bg-[#b8d5fb] [html[data-theme=dark]_&]:text-[#081c43]"
                                                    : "text-secondary hover:bg-input-bg-focus hover:text-primary",
                                            )}>
                                            {label}<span className="tabular-nums opacity-75">{roleCounts[key]}</span>
                                        </button>
                                    ))}
                                </div>
                                {canCreateRole && (
                                    <Button id="tour-create-role-btn" onClick={(event) => handleOpenCreateRole(event.currentTarget)} className="h-10 w-full shrink-0 justify-center whitespace-nowrap px-3 py-0 text-sm lg:ml-auto lg:w-auto">
                                        <Plus size={16} />
                                        Criar cargo
                                    </Button>
                                )}
                            </div>

                            {isError && (
                                <p className="p-4 text-sm text-red-600 md:px-6">
                                    Não foi possível carregar os cargos.
                                </p>
                            )}

                            {isLoading && <RoleManagementLoading label="Carregando cargos…" cards />}
                            <div key={roleStatusFilter} className="app-route-enter min-w-0 motion-reduce:animate-none">
                            {!isLoading && !isError && roles && filteredRoles.length > 0 && (
                                <div className="grid auto-rows-fr grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
                                    {visibleRoles.map((role, index) => (
                                        <article
                                            key={role.id}
                                            className="min-w-0 rounded-xl border border-j-gray-200 p-4"
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
                                                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-input-border bg-background-secondary px-2 py-1 text-[11px] font-bold text-primary">
                                                            <span className={twMerge("h-1.5 w-1.5 rounded-full", ROLE_STATUS_DOT_STYLE[role.status])} />
                                                            {ROLE_STATUS_LABEL[role.status]}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 h-[2lh] text-sm text-j-gray-600 [overflow-wrap:anywhere]">
                                                        {role.description ?? "Sem descrição."}
                                                    </p>
                                                    {role.status === "ARCHIVED" && role.deletedAt && (
                                                        <p className="mt-2 text-xs font-semibold text-j-gray-500">
                                                            Arquivado em {deletedDateFormatter.format(new Date(role.deletedAt))}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                id={index === 0 ? "tour-role-actions" : undefined}
                                                className="mt-3 grid grid-cols-2 gap-2 border-t border-j-gray-200 pt-3"
                                            >
                                                {role.status !== "ARCHIVED" && !(role.kind === "ROOT" && role.status === "ACTIVE") && (
                                                    (role.status === "ACTIVE" ? canDisableRole : canEnableRole) && (
                                                        <button
                                                            type="button"
                                                            onClick={(event) => handleOpenToggleRoleStatus(event.currentTarget, role)}
                                                            className={roleCardActionClass}
                                                        >
                                                            {role.status === "ACTIVE"
                                                                ? <PowerOff size={16} className="text-input-error-text" />
                                                                : <Power size={16} />}
                                                            {role.status === "ACTIVE" ? "Desativar" : "Ativar"}
                                                        </button>
                                                    )
                                                )}
                                                {role.status !== "ARCHIVED" && canUpdateRole && role.kind !== "ROOT" && (
                                                    <button
                                                        type="button"
                                                        onClick={(event) => handleOpenEditRole(event.currentTarget, role.id)}
                                                        className={roleCardActionClass}
                                                    >
                                                        <Pencil size={16} />
                                                        Editar
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(event) => handleOpenViewRole(event.currentTarget, role.id)}
                                                    className={roleCardActionClass}
                                                >
                                                    <Eye size={16} />
                                                    Visualizar
                                                </button>
                                                {canReadPermission && (
                                                    <button
                                                        type="button"
                                                        onClick={(event) => handleOpenRolePermissions(event.currentTarget, role)}
                                                        className={roleCardActionClass}
                                                    >
                                                        <ShieldCheck size={16} />
                                                        Ver permissões
                                                    </button>
                                                )}
                                                {role.status !== "ARCHIVED" && (canAssignPermission || canRevokePermission) && (
                                                    <button
                                                        type="button"
                                                        onClick={(event) => handleOpenManageRolePermissions(event.currentTarget, role)}
                                                        className={roleCardActionClass}
                                                    >
                                                        <ListChecks size={16} />
                                                        Gerenciar permissões
                                                    </button>
                                                )}
                                                {canDeleteRole && role.status !== "ARCHIVED" && role.kind !== "ROOT" && (
                                                    <button
                                                        type="button"
                                                        onClick={(event) => handleOpenDeleteRole(event.currentTarget, role)}
                                                        className={twMerge(roleCardActionClass, "text-input-error-text")}
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

                            {!isLoading && !isError && roles && filteredRoles.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-8 text-center min-h-72">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                                        <KeyRound size={31} />
                                    </div>

                                    <h3 className="text-lg font-black text-j-blue-800">
                                        {roleSearchTerm ? "Nenhum cargo encontrado" : roleStatusFilter === "ARCHIVED" ? "Nenhum cargo arquivado" : roleStatusFilter === "INACTIVE" ? "Nenhum cargo inativo" : "Nenhum cargo ativo"}
                                    </h3>

                                    <p className="mt-1 max-w-md text-sm text-j-gray-600">
                                        {roleSearchTerm ? "Tente outro termo ou selecione outra situação." : roleStatusFilter === "ARCHIVED" ? "Cargos arquivados aparecerão aqui para consulta." : roleStatusFilter === "INACTIVE" ? "Cargos desativados aparecerão aqui." : "Crie um cargo para começar a configurar os acessos."}
                                    </p>
                                </div>
                            )}
                            </div>
                        </div>
                        </Table.Root>
                    </div>
                )}

                {activeTab === "permissions" && isTabVisible("permissions") && (
                    <div className="flex w-full flex-col gap-4">
                        <section className="relative overflow-visible rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                        <div className="grid gap-3 border-b border-j-gray-200 p-4 md:grid-cols-[minmax(0,1fr)_280px] md:px-6">
                            <label className="flex flex-col gap-1.5 text-xs font-bold text-j-gray-600">
                                <span className="sr-only">Pesquisar permissões</span>
                                <span className="relative block">
                                    <Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-j-gray-400" />
                                    <input
                                        type="search"
                                        value={permissionSearch}
                                        onChange={(event) => setPermissionSearch(event.target.value)}
                                        placeholder="Digite o nome ou a descrição"
                                        className="h-11 w-full rounded-xl border border-input-border bg-input-bg pl-10 pr-3 text-sm font-normal text-input-text outline-none placeholder:text-input-placeholder focus:border-input-border-focus focus:bg-input-bg-focus focus:text-input-text-focus"
                                    />
                                </span>
                            </label>
                            <div className="flex flex-col gap-1.5 text-xs font-bold text-j-gray-600">
                                <div className="relative" ref={responsibilityMenuRef}>
                                    <button
                                        type="button"
                                        aria-haspopup="listbox"
                                        aria-expanded={isResponsibilityMenuOpen}
                                        aria-label="Filtrar por responsabilidade"
                                        onClick={() => setIsResponsibilityMenuOpen((open) => !open)}
                                        className="flex h-11 w-full items-center justify-between rounded-xl border border-j-gray-200 bg-j-white px-3 text-left text-sm font-semibold text-j-blue-800 shadow-sm outline-none transition-colors hover:border-j-blue-300 focus-visible:border-j-blue-500 focus-visible:ring-2 focus-visible:ring-j-blue-200"
                                    >
                                        <span>
                                            {responsibilityFilter === "all"
                                                ? "Todas as responsabilidades"
                                                : getModuleLabel(responsibilityFilter)}
                                        </span>
                                        <ChevronDown size={18} className={`text-j-blue-800 transition-transform ${isResponsibilityMenuOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    {isResponsibilityMenuOpen && (
                                        <div
                                            role="listbox"
                                            aria-label="Responsabilidade"
                                            className="absolute left-0 top-full z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-j-blue-200 bg-j-white p-1.5 shadow-xl"
                                        >
                                            {[{ value: "all", label: "Todas as responsabilidades" }, ...permissionResponsibilities.map((responsibility) => ({
                                                value: responsibility,
                                                label: getModuleLabel(responsibility),
                                            }))].map((option) => {
                                                const selected = responsibilityFilter === option.value;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={selected}
                                                        onClick={() => {
                                                            setResponsibilityFilter(option.value);
                                                            setIsResponsibilityMenuOpen(false);
                                                        }}
                                                        className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${selected
                                                            ? "bg-j-blue-800 font-bold text-j-white"
                                                            : "text-j-gray-700 hover:bg-j-yellow-100 hover:text-j-blue-800"
                                                        }`}
                                                    >
                                                        {option.label}
                                                        {selected && <Check size={16} className="text-j-yellow-300" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isPermissionsError && (
                            <p className="p-4 text-sm text-red-600 md:px-6">
                                Não foi possível carregar as permissões.
                            </p>
                        )}

                        {isLoadingPermissions && <RoleManagementLoading label="Carregando permissões…" cards />}
                        {!isLoadingPermissions && !isPermissionsError && filteredPermissions.length > 0 && (
                            <div className="flex flex-col gap-3 p-2 sm:gap-4 sm:p-4 md:p-6">
                                {Object.entries(permissionsByModule).map(([module, items]) => (
                                    <section key={module} className="min-w-0 rounded-xl border border-j-gray-200 bg-j-white p-3 sm:rounded-2xl sm:p-4 sm:shadow-sm md:p-5">
                                        <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                                            <h3 className="text-sm font-black text-j-blue-800">
                                                {getModuleLabel(module)}
                                            </h3>
                                            <span className="shrink-0 rounded-full bg-j-blue-50 px-2 py-0.5 text-xs font-semibold text-j-blue-800">
                                                {items.length} {items.length === 1 ? "permissão" : "permissões"}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 max-sm:divide-y max-sm:divide-j-gray-200 max-sm:border-t max-sm:border-j-gray-200 sm:grid-cols-2 sm:gap-3">
                                            {items.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex min-w-0 items-start py-2.5 sm:gap-3 sm:rounded-xl sm:border sm:border-j-gray-200 sm:p-3"
                                                >
                                                    <span aria-hidden="true" className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-j-blue-800 text-j-yellow-300 sm:flex">
                                                        <ShieldCheck size={18} />
                                                    </span>
                                                    <div className="min-w-0 [overflow-wrap:anywhere]">
                                                        <p className="text-sm font-bold leading-snug text-primary sm:text-base">
                                                            {getPermissionName(permission)}
                                                        </p>
                                                        <p className="mt-1 text-xs leading-relaxed text-secondary sm:text-sm">
                                                            {getPermissionDescription(permission)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}

                        {!isLoadingPermissions && !isPermissionsError && filteredPermissions.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-center min-h-72">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                                    <ShieldCheck size={31} />
                                </div>

                                <h3 className="text-lg font-black text-j-blue-800">
                                    {permissionsList?.length === 0 ? "Nenhuma permissão cadastrada" : "Nenhuma permissão encontrada"}
                                </h3>

                                <p className="mt-1 max-w-md text-sm text-j-gray-600">
                                    {permissionsList?.length === 0
                                        ? "As permissões disponíveis vão aparecer aqui."
                                        : "Ajuste a pesquisa ou escolha outra responsabilidade."}
                                </p>
                            </div>
                        )}
                        </section>
                    </div>
                )}

                {activeTab === "users" && isTabVisible("users") && (
                    <UserRoleAssignmentsTab />
                )}
            </div>
        </div>
    );
}
