"use client";

import { useMutation } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { ShieldX } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/common/page-header";
import { getMembershipApplicationsTourSteps, getUsersTourSteps } from "@/config/tourSteps";
import { usePageTour } from "@/hooks/useTour";
import { ManagementBackButton } from "@/components/pages/admin/ManagementBackButton";
import { useModal } from "@/providers/ModalProvider";
import { exportAdminUsersAction } from "@/server/actions/admin/users/export";
import { patchUserStatusAction } from "@/server/actions/admin/users/patchStatus";
import {
    getAdminMemberRegistrationAction,
    updateAdminMemberRegistrationAction,
} from "@/server/actions/admin/membership/memberRegistry";
import { useUserStore } from "@/stores/userStore";
import { unMaskCPF, unMaskPhoneNumber } from "@/utils/masks";
import { hasPermission } from "@/utils/permission/hasPermission";
import { isValidCPF } from "@/utils/validate";
import { MembershipApplicationsTab } from "./MembershipApplicationsTab";
import { NewAdminUserPage } from "./new";
import { UserMembershipNumberModal } from "./UserMembershipNumberModal";
import { UserManagementView, type UserSearchType } from "./UserManagementView";
import { UserStatusConfirmationModal } from "./UserStatusConfirmationModal";

const SEARCH_PARAMS: UserSearchType[] = [
    "q",
    "name",
    "membershipNumber",
    "email",
    "cpf",
    "rg",
    "phoneNumber",
];
const PHONE_SEARCH_PATTERN = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
const FILTER_PARAMS: (keyof AdminUserSearchParams)[] = [
    ...SEARCH_PARAMS,
    "id",
    "status",
    "createdFrom",
    "createdTo",
    "updatedFrom",
    "updatedTo",
];

function normalizeSearchValue(value: string, type: UserSearchType) {
    const trimmedValue = value.trim();

    if (type === "cpf") {
        return unMaskCPF(trimmedValue);
    }

    if (type === "phoneNumber") {
        return unMaskPhoneNumber(trimmedValue);
    }

    if (type === "rg") {
        return trimmedValue.replace(/\D/g, "");
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
    const { setContent, setOpen, setClose } = useModal();
    const router = useRouter();
    const pathname = usePathname();
    const currentSearchParams = useSearchParams();
    const canReadApplications = hasPermission(permissionsFromStore, "MEMBERSHIP", "MEMBERSHIP_REQUEST_READ");
    const activeTab = currentSearchParams.get("tab") === "applications" && canReadApplications ? "applications" : "users";
    usePageTour({
        storageKey: activeTab === "applications" ? "tour_completed_admin_applications" : "tour_completed_admin_users",
        steps: activeTab === "applications" ? getMembershipApplicationsTourSteps : getUsersTourSteps,
        autoStartOnFirstVisit: false,
        enabled: permissionsFromStore.length > 0 && (canReadApplications || hasPermission(permissionsFromStore, "IDENTITY", "USER_READ")),
    });
    const [isPending, startTransition] = useTransition();
    const [selectedSearchType, setSelectedSearchType] = useState<UserSearchType>(() =>
        SEARCH_PARAMS.find((param) => Boolean(query[param])) ?? "q",
    );
    const searchType = SEARCH_PARAMS.find((param) => Boolean(query[param])) ?? selectedSearchType;

    const permissions = useMemo<UserManagementPermissions>(() => ({
        canReadUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_READ"),
        canCreateUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_CREATE"),
        canUpdateUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_UPDATE"),
        canDisableUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_DISABLE"),
        canEnableUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_ENABLE"),
        canArchiveUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_ARCHIVE"),
        canUnarchiveUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_UNARCHIVE"),
        canDeleteUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_DELETE"),
        canExportUsers: hasPermission(permissionsFromStore, "IDENTITY", "USER_EXPORT"),
        canReadUserHistory: hasPermission(permissionsFromStore, "IDENTITY", "USER_HISTORY_READ"),
        canReadRoleCatalog: hasPermission(permissionsFromStore, "AUTHORIZATION", "ROLE_READ"),
        canReadUserRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_READ"),
        canAssignRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_ASSIGN"),
        canRevokeRoles: hasPermission(permissionsFromStore, "AUTHORIZATION", "USER_ROLE_REVOKE"),
        canManageMembershipRegistration:
            hasPermission(permissionsFromStore, "MEMBERSHIP", "MEMBER_READ")
            && hasPermission(permissionsFromStore, "MEMBERSHIP", "MEMBER_REGISTRATION_MANAGE"),
    }), [permissionsFromStore]);

    const updateUserInCache = useCallback(() => {
        router.refresh();
    }, [router]);

    const handleViewUser = useCallback((userId: number) => {
        router.push(`/admin/users/${userId}`);
    }, [router]);

    const updateUserStatusMutation = useMutation({
        mutationFn: patchUserStatusAction,
        onSuccess: (_updatedUser, variables) => {
            const messages: Record<AdminUserLifecycleAction, string> = {
                enable: "Usuário reativado com sucesso!",
                disable: "Usuário inativado com sucesso!",
                archive: "Usuário arquivado com sucesso!",
                unarchive: "Usuário desarquivado (inativo) com sucesso!",
            };
            toast.success(messages[variables.status]);
        },
    });

    const updateUserStatus = useCallback(
        async (userId: number, status: AdminUserLifecycleAction): Promise<AdminUser> => {
            return updateUserStatusMutation.mutateAsync({ userId, status });
        },
        [updateUserStatusMutation],
    );

    const updateMembershipNumberMutation = useMutation({
        mutationFn: updateAdminMemberRegistrationAction,
    });

    const handleManageMembershipNumber = useCallback((user: AdminUser) => {
        setContent(
            <UserMembershipNumberModal
                user={user}
                onLoad={getAdminMemberRegistrationAction}
                onSave={updateMembershipNumberMutation.mutateAsync}
                onSuccess={() => {
                    router.refresh();
                    toast.success("Matrícula atualizada com sucesso.");
                }}
            />,
        );
        setOpen();
    }, [router, setContent, setOpen, updateMembershipNumberMutation.mutateAsync]);

    const handleChangeUserStatus = useCallback(
        (user: AdminUser, action: AdminUserLifecycleAction) => {
            setContent(
                <UserStatusConfirmationModal
                    user={user}
                    action={action}
                    onConfirm={updateUserStatus}
                    onSuccess={updateUserInCache}
                />,
            );
            setOpen();
        },
        [setContent, setOpen, updateUserInCache, updateUserStatus],
    );

    const handleExportUsers = useCallback(
        async (format: "CSV" | "PDF") => {
            return exportAdminUsersAction(query, format, "MEMBER");
        },
        [query],
    );

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

    function updateSearchType(type: UserSearchType) {
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

    if (!permissions.canReadUsers && !canReadApplications) {
        return (
            <div className="min-h-full w-full p-3 md:p-4">
                <div className="flex w-full flex-col gap-6">
                    <PageHeader
                        id="tour-users-header"
                        title="Gestão de usuários"
                        breadcrumbs={[
                            { label: "Home", href: "/feed" },
                            { label: "Gestão Administrativa", href: "/admin" },
                            { label: "Usuários" },
                        ]}
                    />
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ManagementBackButton />
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
                    title="Gestão de usuários"
                    breadcrumbs={[
                        { label: "Home", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: "Usuários" },
                    ]}
                />

                {(permissions.canReadUsers || canReadApplications) && (
                    <div id="tour-users-tabs" className="flex w-full flex-wrap items-center gap-x-2 border-b border-j-gray-200">
                        <div className="basis-full pb-2">
                            <ManagementBackButton />
                        </div>
                        {permissions.canReadUsers && (
                            <button
                                type="button"
                                onClick={() => replaceSearchParams({ tab: undefined })}
                                className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-bold sm:px-4 sm:text-sm ${
                                    activeTab === "users"
                                        ? "border-j-yellow-400 text-j-blue-800"
                                        : "border-transparent text-j-gray-500"
                                }`}
                            >
                                Usuários
                            </button>
                        )}
                        {canReadApplications && (
                            <button
                                type="button"
                                onClick={() => replaceSearchParams({ tab: "applications" })}
                                className={`min-w-0 flex-1 whitespace-nowrap border-b-2 px-2 py-3 text-[11px] font-bold sm:flex-none sm:px-4 sm:text-sm ${
                                    activeTab === "applications"
                                        ? "border-j-yellow-400 text-j-blue-800"
                                        : "border-transparent text-j-gray-500"
                                }`}
                            >
                                Solicitações de associação
                            </button>
                        )}
                    </div>
                )}

                {activeTab === "applications" && canReadApplications && <MembershipApplicationsTab />}
                {activeTab === "users" && permissions.canReadUsers && (
                    <UserManagementView
                        onCreateUser={() => {
                            setContent(
                                <div
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Novo usuário"
                                    className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-j-white p-2 shadow-2xl sm:p-3"
                                >
                                    <NewAdminUserPage onClose={setClose} onCreated={() => router.refresh()} />
                                </div>,
                            );
                            setOpen();
                        }}
                        users={users.content}
                        query={query}
                        searchType={searchType}
                        permissions={permissions}
                        totalItems={users.totalElements}
                        totalPages={users.totalPages}
                        pageIndex={users.number}
                        pageSize={users.size}
                        isLoading={false}
                        isFetching={isPending}
                        onSearchChange={updateSearch}
                        onStatusChange={(status) =>
                            replaceSearchParams(
                                { status: status === "ACTIVE" ? undefined : status },
                                { resetPage: true },
                            )
                        }
                        onClearFilters={clearFilters}
                        onPaginationChange={handlePaginationChange}
                        onSortChange={handleSortChange}
                        onViewUser={handleViewUser}
                        onChangeUserStatus={handleChangeUserStatus}
                        onManageMembershipNumber={handleManageMembershipNumber}
                        onExportUsers={handleExportUsers}
                        setSearchType={updateSearchType}
                    />
                )}
                {activeTab === "users" && !permissions.canReadUsers && (
                    <section className="rounded-xl border border-dashed border-j-gray-300 bg-j-white p-8 text-center text-sm text-j-gray-600">
                        Você tem acesso à análise de solicitações, mas não à lista de usuários.
                    </section>
                )}
            </div>
        </div>
    );
}
