"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { ShieldX } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { patchUserStatusAction } from "@/actions/admin/users/patchStatus";
import { PageHeader } from "@/components/common/page-header";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { unMaskCPF, unMaskPhoneNumber } from "@/utils/masks";
import { usePageTour } from "@/hooks/useTour";
import { getUsersTourSteps } from "@/config/tourSteps";
import TourHelpButton from "@/components/common/tour/TourHelpButton";
import { hasPermission } from "@/utils/permission/hasPermission";
import { isValidCPF } from "@/utils/validate";
import { UserManagementView } from "./UserManagementView";
import { UserStatusConfirmationModal } from "./UserStatusConfirmationModal";

type SearchType = "q" | "name" | "email" | "cpf" | "phoneNumber";

const SEARCH_PARAMS: SearchType[] = ["q", "name", "email", "cpf", "phoneNumber"];
const PHONE_SEARCH_PATTERN = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
const FILTER_PARAMS: (keyof AdminUserSearchParams)[] = [
    ...SEARCH_PARAMS,
    "id",
    "accountStatus",
    "authenticationStatus",
    "credentialStatus",
    "passwordChangeRequired",
    "createdFrom",
    "createdTo",
    "updatedFrom",
    "updatedTo",
    "fields",
];

function normalizeSearchValue(value: string, type: SearchType) {
    const trimmedValue = value.trim();

    if (type === "cpf") {
        return unMaskCPF(trimmedValue);
    }

    if (type === "phoneNumber") {
        return unMaskPhoneNumber(trimmedValue);
    }

    if (type === "q" && isValidCPF(trimmedValue)) {
        return unMaskCPF(trimmedValue);
    }

    if (type === "q" && PHONE_SEARCH_PATTERN.test(trimmedValue)) {
        return unMaskPhoneNumber(trimmedValue);
    }

    return trimmedValue;
}

interface Props {
    users: PageResponse<AdminUser>;
    searchParams: AdminUserSearchParams;
}

export default function AdminUsersPage({ users, searchParams: query }: Props) {
    const permissionsFromStore = useUserStore((state) => state.permissions);
    const { setContent, setOpen } = useModal();
    // const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const currentSearchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [selectedSearchType, setSelectedSearchType] = useState<SearchType>(() =>
        SEARCH_PARAMS.find((param) => Boolean(query[param])) ?? "q",
    );

    // Tour da tela de gestão de usuários
    const { restartTour } = usePageTour({
        storageKey: "tour_completed_admin_users",
        steps: getUsersTourSteps,
        autoStartOnFirstVisit: true,
        enabled: permissionsFromStore.length > 0,
    });
    const searchType = SEARCH_PARAMS.find((param) => Boolean(query[param]))
        ?? selectedSearchType;

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
    }, [setContent, setOpen]);

    function replaceSearchParams(
        patch: Partial<AdminUserSearchParams>,
        { resetPage = false }: { resetPage?: boolean } = {},
    ) {
        const params = new URLSearchParams(currentSearchParams.toString());
        Object.entries(patch).forEach(([key, value]) => {
            if (value === undefined || value === "") {
                params.delete(key);
                return;
            }

            params.set(key, value);
        });

        if (resetPage) {
            params.set("page", "0");
        }

        const nextUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
        startTransition(() => router.replace(nextUrl, { scroll: false }));
    }

    function updateSearch(value: string) {
        const normalizedValue = normalizeSearchValue(value, searchType);
        const patch = Object.fromEntries(
            SEARCH_PARAMS.map((param) => [
                param,
                param === searchType ? normalizedValue : undefined,
            ]),
        ) as Partial<AdminUserSearchParams>;

        replaceSearchParams(patch, { resetPage: true });
    }

    function updateSearchType(type: SearchType) {
        setSelectedSearchType(type);

        if (SEARCH_PARAMS.some((param) => Boolean(query[param]))) {
            const patch = Object.fromEntries(
                SEARCH_PARAMS.map((param) => [param, undefined]),
            ) as Partial<AdminUserSearchParams>;
            replaceSearchParams(patch, { resetPage: true });
        }
    }

    function clearFilters() {
        const patch = Object.fromEntries(
            FILTER_PARAMS.map((param) => [param, undefined]),
        ) as Partial<AdminUserSearchParams>;

        replaceSearchParams(patch, { resetPage: true });
    }

    function handlePaginationChange(pagination: PaginationState) {
        replaceSearchParams({
            page: pagination.pageSize === users.size ? pagination.pageIndex.toString() : "0",
            size: pagination.pageSize.toString(),
        });
    }

    function handleSortChange(field: string) {
        const [currentField, currentDirection] = query.sort?.split(",") ?? [];
        const normalizedDirection = currentDirection?.toLowerCase();
        const nextSort = currentField !== field
            ? `${field},asc`
            : normalizedDirection === "asc"
                ? `${field},desc`
                : undefined;

        replaceSearchParams({ sort: nextSort }, { resetPage: true });
    }

    if (!permissions.canReadUsers) {
        return (
            <div className="min-h-full w-full p-3 md:p-4">
                <div className="flex w-full flex-col gap-6">
                    <PageHeader
                        title="Gestão de usuários"
                        breadcrumbs={[
                            { label: "Início", href: "/feed" },
                            { label: "Gestão Administrativa", href: "/admin" },
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
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    id="tour-users-header"
                    title={
                        <>
                            Gestão de usuários
                            <span className="ml-2 align-middle text-sm font-normal text-j-gray-400 md:text-base">
                                {users.totalElements} usuário(s) cadastrado(s)
                            </span>
                        </>
                    }
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: "Usuários" },
                    ]}
                    actions={
                        <TourHelpButton
                            id="tour-users-help-btn"
                            onClick={restartTour}
                            label="Como gerenciar usuários?"
                            className="w-full justify-center sm:w-auto"
                        />
                    }
                />

                <UserManagementView
                    users={users.content}
                    query={query}
                    searchType={searchType}
                    // roles={rolesQuery.data ?? []}
                    permissions={permissions}
                    totalItems={users.totalElements}
                    totalPages={users.totalPages}
                    pageIndex={users.number}
                    pageSize={users.size}
                    isLoading={false}
                    isFetching={isPending}
                    // error={usersQuery.error
                    //     ? extractApiErrorMessage(usersQuery.error, "Não foi possível carregar os usuários. Tente novamente.")
                    //     : undefined}
                    onSearchChange={updateSearch}

                    onStatusChange={(accountStatus) => replaceSearchParams(
                        { accountStatus },
                        { resetPage: true },
                    )}

                    // onRoleChange não existe na nova tipagem explicitamente (a não ser que backend use Q ou fields)
                    // onRoleChange={(roleIds) => updateFilters({ roleIds })} // Reavalie se precisa manter

                    onClearFilters={clearFilters}
                    onPaginationChange={handlePaginationChange}
                    onSortChange={handleSortChange}
                    onViewUser={handleViewUser}
                    onChangeUserStatus={handleChangeUserStatus}
                    onCreateUser={() => router.push("/admin/users/new")}
                    setSearchType={updateSearchType}
                />
            </div>
        </div>
    );
}
