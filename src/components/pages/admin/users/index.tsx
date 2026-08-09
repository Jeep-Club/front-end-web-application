"use client";

import { useCallback, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { ShieldX } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { createMockAdminUsersDataSource } from "@/mocks/admin/users";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import type {
    AdminRole,
    UserListItem,
    UserListQuery,
    UserManagementPermissions,
    UserStatus,
} from "@/types/admin/users";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { hasPermission } from "@/utils/permission/hasPermission";
import { UserDetailsModal } from "./UserDetailsModal";
import { UserManagementView } from "./UserManagementView";
import { UserRolesModal } from "./UserRolesModal";
import { UserStatusConfirmationModal } from "./UserStatusConfirmationModal";

const INITIAL_QUERY: UserListQuery = {
    search: "",
    statuses: [],
    roleIds: [],
    page: 0,
    pageSize: 10,
    // sort: "name,asc",
};

export default function AdminUsersPage() {
    const permissionsFromStore = useUserStore((state) => state.permissions);
    const { setContent, setOpen } = useModal();
    const queryClient = useQueryClient();
    const [query, setQuery] = useState<UserListQuery>(INITIAL_QUERY);
    const dataSource = useMemo(() => createMockAdminUsersDataSource(), []);

    const permissions = useMemo<UserManagementPermissions>(() => ({
        canReadUsers: hasPermission(permissionsFromStore, "AUTHENTICATION", "USER_READ"),
        canDisableUsers: hasPermission(permissionsFromStore, "AUTHENTICATION", "USER_DISABLE"),
        canEnableUsers: hasPermission(permissionsFromStore, "AUTHENTICATION", "USER_ENABLE"),
        canReadRoleCatalog: hasPermission(permissionsFromStore, "AUTHORIZATION", "ROLE_READ"),
        canReadUserRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_READ"),
        canAssignRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_ASSIGN"),
        canRevokeRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_REVOKE"),
    }), [permissionsFromStore]);

    const usersQuery = useQuery({
        queryKey: ["admin-users", "list", query],
        queryFn: () => dataSource.listUsers(query),
        enabled: permissions.canReadUsers,
        placeholderData: keepPreviousData,
        retry: false,
    });

    const rolesQuery = useQuery({
        queryKey: ["admin-users", "role-catalog"],
        queryFn: dataSource.listRoles,
        enabled: permissions.canReadRoleCatalog && permissions.canReadUserRoles,
        retry: false,
    });

    const refreshUsers = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ["admin-users", "list"] });
        void queryClient.invalidateQueries({ queryKey: ["admin-users", "details"] });
    }, [queryClient]);

    const updateUserInCache = useCallback((updatedUser: UserListItem) => {
        queryClient.setQueriesData<PageResponse<UserListItem>>(
            { queryKey: ["admin-users", "list"] },
            (current) => current
                ? {
                    ...current,
                    content: current.content.map((user) => user.id === updatedUser.id ? updatedUser : user),
                }
                : current,
        );
        queryClient.setQueryData(["admin-users", "details", updatedUser.id], updatedUser);
        refreshUsers();
    }, [queryClient, refreshUsers]);

    const updateRolesInCache = useCallback((userId: number, roles: AdminRole[]) => {
        queryClient.setQueriesData<PageResponse<UserListItem>>(
            { queryKey: ["admin-users", "list"] },
            (current) => current
                ? {
                    ...current,
                    content: current.content.map((user) => user.id === userId ? { ...user, roles } : user),
                }
                : current,
        );
        refreshUsers();
    }, [queryClient, refreshUsers]);

    const handleViewUser = useCallback((userId: number) => {
        setContent(
            <UserDetailsModal
                userId={userId}
                canReadRoles={permissions.canReadUserRoles}
                onLoadUser={dataSource.getUser}
            />,
        );
        setOpen();
    }, [dataSource, permissions.canReadUserRoles, setContent, setOpen]);

    const handleChangeUserStatus = useCallback((user: UserListItem) => {
        const onConfirm = user.status === "DISABLED"
            ? dataSource.enableUser
            : dataSource.disableUser;

        setContent(
            <UserStatusConfirmationModal
                user={user}
                onConfirm={onConfirm}
                onSuccess={updateUserInCache}
            />,
        );
        setOpen();
    }, [dataSource, setContent, setOpen, updateUserInCache]);

    const handleManageRoles = useCallback((user: UserListItem) => {
        setContent(
            <UserRolesModal
                user={user}
                onLoadRoles={dataSource.listRoles}
                onSaveRoles={dataSource.replaceUserRoles}
                onSuccess={updateRolesInCache}
            />,
        );
        setOpen();
    }, [dataSource, setContent, setOpen, updateRolesInCache]);

    function updateFilters(patch: Partial<UserListQuery>) {
        setQuery((current) => ({ ...current, ...patch, page: 0 }));
    }

    function handlePaginationChange(pagination: PaginationState) {
        setQuery((current) => ({
            ...current,
            page: pagination.pageSize === current.pageSize ? pagination.pageIndex : 0,
            pageSize: pagination.pageSize,
        }));
    }

    if (!permissions.canReadUsers) {
        return (
            <div className="h-full w-full p-3 md:p-4">
                <div className="flex w-full flex-col gap-6">
                    <PageHeader
                        title="Gestão de usuários"
                        breadcrumbs={[
                            { label: "Início", href: "/feed" },
                            { label: "Painel admin", href: "/admin" },
                            { label: "Usuários" },
                        ]}
                    />
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ShieldX size={42} className="mb-3 text-j-gray-400" />
                        <h2 className="text-lg font-black text-j-blue-800">Acesso não permitido</h2>
                        <p className="mt-1 max-w-md text-sm text-j-gray-600">
                            Seu usuário não possui permissão para visualizar a gestão de usuários.
                        </p>
                    </section>
                </div>
            </div>
        );
    }

    const page = usersQuery.data;

    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    title="Gestão de usuários"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Painel admin", href: "/admin" },
                        { label: "Usuários" },
                    ]}
                />

                <UserManagementView
                    users={page?.content ?? []}
                    query={query}
                    roles={rolesQuery.data ?? []}
                    permissions={permissions}
                    totalItems={page?.totalElements ?? 0}
                    totalPages={page?.totalPages ?? 0}
                    isLoading={usersQuery.isLoading}
                    isFetching={usersQuery.isFetching}
                    error={usersQuery.error
                        ? extractApiErrorMessage(usersQuery.error, "Não foi possível carregar os usuários. Tente novamente.")
                        : undefined}
                    onSearchChange={(search) => updateFilters({ search })}
                    onStatusChange={(statuses: UserStatus[]) => updateFilters({ statuses })}
                    onRoleChange={(roleIds) => updateFilters({ roleIds })}
                    onClearFilters={() => setQuery((current) => ({
                        ...current,
                        search: "",
                        statuses: [],
                        roleIds: [],
                        page: 0,
                    }))}
                    onPaginationChange={handlePaginationChange}
                    onViewUser={handleViewUser}
                    onChangeUserStatus={handleChangeUserStatus}
                    onManageRoles={handleManageRoles}
                />
            </div>
        </div>
    );
}
