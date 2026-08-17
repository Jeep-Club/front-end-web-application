"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { ShieldX } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { createMockAdminUsersDataSource } from "@/mocks/admin/users";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { extractApiErrorMessage } from "@/utils/http/apiError";
import { hasPermission } from "@/utils/permission/hasPermission";
import { UserManagementView } from "./UserManagementView";
import { UserRolesModal } from "./UserRolesModal";
import { UserStatusConfirmationModal } from "./UserStatusConfirmationModal";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { patchUserStatusAction } from "@/actions/admin/users/patchStatus";
import toast from "react-hot-toast";

const INITIAL_QUERY: AdminUserSearchParams = {
    q: "",
    page: "1",
    size: "10",
    // sort: "id,asc",
};

interface Props {
    users: PageResponse<AdminUser>;
}

export default function AdminUsersPage({ users }: Props) {
    const permissionsFromStore = useUserStore((state) => state.permissions);
    const { setContent, setOpen } = useModal();
    // const queryClient = useQueryClient();
    const [query, setQuery] = useState<AdminUserSearchParams>({});
    const [searchType, setSearchType] = useState<"q" | "name" | "email" | "cpf" | "phone">("q");
    // const dataSource = useMemo(() => createMockAdminUsersDataSource(), []);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const permissions = useMemo<UserManagementPermissions>(() => ({
        canReadUsers: hasPermission(permissionsFromStore, "AUTHENTICATION", "USER_READ"),
        canDisableUsers: hasPermission(permissionsFromStore, "AUTHENTICATION", "USER_DISABLE"),
        canEnableUsers: hasPermission(permissionsFromStore, "AUTHENTICATION", "USER_ENABLE"),
        canReadRoleCatalog: hasPermission(permissionsFromStore, "AUTHORIZATION", "ROLE_READ"),
        canReadUserRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_READ"),
        canAssignRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_ASSIGN"),
        canRevokeRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_REVOKE"),
    }), [permissionsFromStore]);

    // const usersQuery = useQuery({
    //     queryKey: ["admin-users", "list", query],
    //     queryFn: () => dataSource.listUsers(query),
    //     enabled: permissions.canReadUsers,
    //     placeholderData: keepPreviousData,
    //     retry: false,
    // });
    // const rolesQuery = useQuery({
    //     queryKey: ["admin-users", "role-catalog"],
    //     queryFn: dataSource.listRoles,
    //     enabled: permissions.canReadRoleCatalog && permissions.canReadUserRoles,
    //     retry: false,
    // });

    // const refreshUsers = useCallback(() => {
    //     void queryClient.invalidateQueries({ queryKey: ["admin-users", "list"] });
    //     void queryClient.invalidateQueries({ queryKey: ["admin-users", "details"] });
    // }, [queryClient]);

    // const updateUserInCache = useCallback((updatedUser: AdminUser) => {
    //     queryClient.setQueriesData<PageResponse<UserListItem>>(
    //         { queryKey: ["admin-users", "list"] },
    //         (current) => current
    //             ? {
    //                 ...current,
    //                 content: current.content.map((user) => user.id === updatedUser.id ? updatedUser : user),
    //             }
    //             : current,
    //     );
    //     queryClient.setQueryData(["admin-users", "details", updatedUser.id], updatedUser);
    //     refreshUsers();
    // }, [queryClient, refreshUsers]);

    const updateUserInCache = useCallback((updatedUser: AdminUser) => {
        users.content = users.content.map((user) => user.id === updatedUser.id ? updatedUser : user);
    }, [users]);

    // const updateRolesInCache = useCallback((userId: number, roles: AdminRole[]) => {
    //     queryClient.setQueriesData<PageResponse<UserListItem>>(
    //         { queryKey: ["admin-users", "list"] },
    //         (current) => current
    //             ? {
    //                 ...current,
    //                 content: current.content.map((user) => user.id === userId ? { ...user, roles } : user),
    //             }
    //             : current,
    //     );
    //     refreshUsers();
    // }, [queryClient, refreshUsers]);

    // const handleViewUser = useCallback((userId: number) => {
    //     setContent(
    //         <UserDetailsModal
    //             userId={userId}
    //             canReadRoles={permissions.canReadUserRoles}
    //             onLoadUser={dataSource.getUser}
    //         />,
    //     );
    //     setOpen();
    // }, [dataSource, permissions.canReadUserRoles, setContent, setOpen]);

    const handleViewUser = useCallback((userId: number) => {
        router.push(`/admin/users/${userId}`);
    }, [router]);

    const updateUserStatusMutation = useMutation({
        mutationFn: patchUserStatusAction,
        onSuccess: (updatedUser) => {
            toast.success(`Usuário ${updatedUser.accountStatus === "ACTIVE" ? "reativado" : "desativado"} com sucesso!`);
            updateUserInCache(updatedUser);
        }
    });

    const updateUserStatus = useCallback(async (userId: number, status: "enable" | "disable"): Promise<void> => {
        updateUserStatusMutation.mutateAsync({ userId, status });
    }, []);

    const handleChangeUserStatus = useCallback((user: AdminUser) => {
        // const onConfirm = user.accountStatus === "DISABLED"
        //     ? dataSource.enableUser
        //     : dataSource.disableUser;

        setContent(
            <UserStatusConfirmationModal
                user={user}
                onConfirm={updateUserStatus}
                onSuccess={updateUserInCache}
            />,
        );
        setOpen();
    }, [, setContent, setOpen]);

    // const handleManageRoles = useCallback((user: AdminUser) => {
    //     setContent(
    //         <UserRolesModal
    //             user={user}
    //             onLoadRoles={dataSource.listRoles}
    //             onSaveRoles={dataSource.replaceUserRoles}
    //             onSuccess={updateRolesInCache}
    //         />,
    //     );
    //     setOpen();
    // }, [dataSource, setContent, setOpen, updateRolesInCache]);

    const handleManageRoles = useCallback((user: AdminUser) => {
        router.push(`/admin/users/${user.id}/roles`);
    }, [router]);

    function updateFilters(patch: Partial<AdminUserSearchParams>) {
        // Agora passando "page" como string "0" para resetar a paginação ao filtrar
        setQuery((current) => ({ ...current, ...patch, page: "0" }));
    }

    function handlePaginationChange(pagination: PaginationState) {
        setQuery((current) => ({
            ...current,
            page: pagination.pageSize.toString() === current.size ? pagination.pageIndex.toString() : "0",
            size: pagination.pageSize.toString(),
        }));
    }
    useEffect(() => {
        setFetching(false);
    }, [users]);

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
                    users={users.content}
                    query={query}
                    searchType={searchType}
                    setSearchType={setSearchType}
                    // roles={rolesQuery.data ?? []}
                    permissions={permissions}
                    totalItems={users.totalElements}
                    totalPages={users.totalPages}
                    isLoading={loading}
                    isFetching={fetching}
                    // error={usersQuery.error
                    //     ? extractApiErrorMessage(usersQuery.error, "Não foi possível carregar os usuários. Tente novamente.")
                    //     : undefined}
                    onSearchChange={(search) => updateFilters({ q: search })}

                    // Atualizado para usar `accountStatus` no lugar de `statuses`
                    // OBS: O frontend parece enviar um array, mas a nova tipagem recebe string.
                    // Extraímos o primeiro valor do array como fallback.
                    onStatusChange={(statuses: UserStatus[]) => updateFilters({
                        accountStatus: statuses.length > 0 ? (statuses[0] as "ACTIVE" | "DISABLED") : undefined
                    })}

                    // onRoleChange não existe na nova tipagem explicitamente (a não ser que backend use Q ou fields)
                    // onRoleChange={(roleIds) => updateFilters({ roleIds })} // Reavalie se precisa manter

                    onClearFilters={() => setQuery(INITIAL_QUERY)}
                    onPaginationChange={handlePaginationChange}
                    onViewUser={handleViewUser}
                    onChangeUserStatus={handleChangeUserStatus}
                    onManageRoles={handleManageRoles}
                />
            </div>
        </div>
    );
}
