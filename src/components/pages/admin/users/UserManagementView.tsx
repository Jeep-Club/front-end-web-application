"use client";

import { useMemo } from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Archive, ArchiveRestore, Eye, KeyRound, Plus, Power, PowerOff } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { ButtonIcon } from "@/components/common/button";
import { AdminExport } from "@/components/common/admin-export/AdminExport";
import type { AdminExportFile } from "@/components/common/admin-export/AdminExport";
import { Avatar } from "@/components/common/avatar";
import { Select } from "@/components/common/select";
import { Table } from "@/components/common/table";
import { maskCPF, maskPhoneNumber } from "@/utils/masks";

import { USER_STATUS_LABEL, USER_STATUS_STYLE } from "./user-display";

export type UserSearchType = "q" | "name" | "membershipNumber" | "email" | "cpf" | "rg" | "phoneNumber";

interface UserManagementViewProps {
    users: AdminUser[];
    query: AdminUserSearchParams;
    permissions: UserManagementPermissions;
    totalItems: number;
    totalPages: number;
    pageIndex: number;
    pageSize: number;
    isLoading: boolean;
    isFetching: boolean;
    error?: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (status: UserStatus | "ALL") => void;
    onClearFilters: () => void;
    onPaginationChange: (pagination: PaginationState) => void;
    onSortChange: (field: string) => void;
    onViewUser: (userId: number) => void;
    onCreateUser: () => void;
    onChangeUserStatus: (user: AdminUser, action: AdminUserLifecycleAction) => void;
    onManageMembershipNumber: (user: AdminUser) => void;
    onExportUsers?: (format: "CSV" | "PDF") => Promise<AdminExportFile>;
    searchType: UserSearchType;
    setSearchType: (type: UserSearchType) => void;
}

export function UserManagementView({
    users,
    query,
    permissions,
    totalItems,
    totalPages,
    pageIndex,
    pageSize,
    isLoading,
    isFetching,
    error,
    onSearchChange,
    onStatusChange,
    onClearFilters,
    onPaginationChange,
    onSortChange,
    onViewUser,
    onCreateUser,
    onChangeUserStatus,
    onManageMembershipNumber,
    onExportUsers,
    searchType,
    setSearchType,
}: UserManagementViewProps) {
    const hasActiveFilters = Boolean(
        query.q
        || query.name
        || query.membershipNumber
        || query.email
        || query.cpf
        || query.rg
        || query.phoneNumber
        || query.id
        || (query.status && query.status !== "ACTIVE")
        || query.createdFrom
        || query.createdTo
        || query.updatedFrom
        || query.updatedTo,
    );

    const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(() => {
        const baseColumns: ColumnDef<AdminUser, unknown>[] = [
            {
                accessorKey: "membershipNumber",
                header: "MAT",
                meta: { label: "MAT" },
                cell: ({ row }) => (
                    <span className="font-bold text-j-gray-700">
                        {row.original.membershipNumber ?? "—"}
                    </span>
                ),
            },
            {
                accessorKey: "name",
                header: () => (
                    <Table.Sortable field="name" label="Nome" sort={query.sort} onSortChange={onSortChange} />
                ),
                meta: { label: "Nome completo" },
                cell: ({ row }) => (
                    <div className="flex min-w-0 max-w-full flex-1 items-center gap-2">
                        {row.original.profilePhotoUrl ? (
                            <Avatar
                                src={row.original.profilePhotoUrl}
                                alt={`Foto de ${row.original.name}`}
                                className="h-10 w-10 shrink-0 bg-j-gray-200"
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-j-blue-100 text-sm font-bold text-j-blue-800"
                            >
                                {row.original.name
                                    .trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .map((part) => part[0])
                                    .join("")
                                    .toLocaleUpperCase("pt-BR")}
                            </span>
                        )}
                        <span className="min-w-0 whitespace-normal break-words text-sm font-bold text-j-gray-700">{row.original.name}</span>
                    </div>
                ),
            },
            {
                accessorKey: "email",
                header: () => (
                    <Table.Sortable field="email" label="E-mail" sort={query.sort} onSortChange={onSortChange} />
                ),
                meta: { label: "E-mail" },
                cell: ({ row }) => row.original.email ?? "—",
            },
            {
                accessorKey: "cpf",
                header: () => (
                    <Table.Sortable field="cpf" label="CPF" sort={query.sort} onSortChange={onSortChange} />
                ),
                meta: { label: "CPF" },
                cell: ({ row }) => maskCPF(row.original.cpf),
            },
            {
                accessorKey: "phoneNumber",
                header: () => (
                    <Table.Sortable field="phoneNumber" label="Telefone" sort={query.sort} onSortChange={onSortChange} />
                ),
                meta: { label: "Telefone" },
                cell: ({ row }) =>
                    row.original.phoneNumber ? maskPhoneNumber(row.original.phoneNumber) : "—",
            },
            {
                accessorKey: "status",
                header: "Status",
                meta: { label: "Status" },
                cell: ({ row }) => (
                    <span
                        className={twMerge(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                            USER_STATUS_STYLE[row.original.status],
                        )}
                    >
                        {USER_STATUS_LABEL[row.original.status] ?? row.original.status}
                    </span>
                ),
            },
            {
                id: "actions",
                header: "Ações",
                meta: { label: "Ações" },
                cell: ({ row }) => {
                    const user = row.original;
                    const canDisable = user.status === "ACTIVE" && permissions.canDisableUsers;
                    const canEnable = user.status === "INACTIVE" && permissions.canEnableUsers;
                    const canArchive =
                        (user.status === "ACTIVE" || user.status === "INACTIVE") && permissions.canArchiveUsers;
                    const canUnarchive = user.status === "ARCHIVED" && permissions.canUnarchiveUsers;
                    const canManageMembershipNumber = permissions.canManageMembershipRegistration && user.status === "ACTIVE";

                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            {canDisable && (
                                <ButtonIcon
                                    type="button"
                                    title="Inativar usuário"
                                    aria-label={`Inativar ${user.name}`}
                                    onClick={() => onChangeUserStatus(user, "disable")}
                                    className="rounded-lg bg-j-red-500 p-2 text-white hover:bg-j-red-600 hover:text-white"
                                >
                                    <PowerOff size={18} />
                                </ButtonIcon>
                            )}

                            {canEnable && (
                                <ButtonIcon
                                    type="button"
                                    title="Reativar usuário"
                                    aria-label={`Reativar ${user.name}`}
                                    onClick={() => onChangeUserStatus(user, "enable")}
                                    className="rounded-lg bg-j-green-600 p-2 text-white hover:bg-j-green-700 hover:text-white"
                                >
                                    <Power size={18} />
                                </ButtonIcon>
                            )}

                            {canArchive && (
                                <ButtonIcon
                                    type="button"
                                    title="Arquivar usuário"
                                    aria-label={`Arquivar ${user.name}`}
                                    onClick={() => onChangeUserStatus(user, "archive")}
                                    className="rounded-lg bg-amber-600 p-2 text-white hover:bg-amber-700 hover:text-white"
                                >
                                    <Archive size={18} />
                                </ButtonIcon>
                            )}

                            {canUnarchive && (
                                <ButtonIcon
                                    type="button"
                                    title="Desarquivar usuário"
                                    aria-label={`Desarquivar ${user.name}`}
                                    onClick={() => onChangeUserStatus(user, "unarchive")}
                                    className="rounded-lg bg-j-blue-700 p-2 text-white hover:bg-j-blue-600 hover:text-white"
                                >
                                    <ArchiveRestore size={18} />
                                </ButtonIcon>
                            )}

                            {canManageMembershipNumber && (
                                <ButtonIcon
                                    type="button"
                                    title="Gerenciar matrícula"
                                    aria-label={`Gerenciar matrícula de ${user.name}`}
                                    onClick={() => onManageMembershipNumber(user)}
                                    className="rounded-lg bg-j-blue-700 p-2 text-white hover:bg-j-blue-600 hover:text-white"
                                >
                                    <KeyRound size={18} />
                                </ButtonIcon>
                            )}

                            <ButtonIcon
                                type="button"
                                title="Ver detalhes"
                                aria-label={`Ver detalhes de ${user.name}`}
                                onClick={() => onViewUser(user.id)}
                                className="rounded-lg bg-j-blue-800 p-2 text-white hover:bg-j-blue-600 hover:text-white"
                            >
                                <Eye size={18} />
                            </ButtonIcon>
                        </div>
                    );
                },
            },
        ];

        return baseColumns;
    }, [onChangeUserStatus, onManageMembershipNumber, onSortChange, onViewUser, permissions, query.sort]);

    return (
        <Table.Root
            data={users}
            columns={columns}
            getRowId={(user) => String(user.id)}
            pagination={{
                pageIndex,
                pageSize,
                pageCount: totalPages,
                rowCount: totalItems,
                pageSizeOptions: [5, 10, 20, 50],
                onChange: onPaginationChange,
            }}
            footer={<Table.Pagination itemLabel="usuário" />}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            emptyState={
                hasActiveFilters
                    ? "Nenhum usuário corresponde à busca ou aos filtros atuais."
                    : "Nenhum usuário cadastrado."
            }
        >
            <Table.Header className="items-stretch border-b-0">
                <div className="grid w-full min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto] lg:items-start">
                    <div id="tour-users-search" className="flex w-full min-w-0 items-end">
                        <Table.Search
                            value={
                                searchType === "cpf"
                                    ? maskCPF(query.cpf ?? "")
                                    : searchType === "phoneNumber"
                                        ? maskPhoneNumber(query.phoneNumber ?? "")
                                        : query[searchType] ?? ""
                            }
                            onValueChange={onSearchChange}
                            label="Buscar usuários"
                            placeholder="Digite a busca e pressione Enter"
                            submitOnChange={false}
                            mask={
                                searchType === "cpf"
                                    ? maskCPF
                                    : searchType === "phoneNumber"
                                        ? maskPhoneNumber
                                        : undefined
                            }
                            inputMode={
                                searchType === "cpf" || searchType === "phoneNumber" || searchType === "membershipNumber"
                                    ? "numeric"
                                    : "search"
                            }
                            formClassName="min-w-0 flex-1 sm:min-w-0"
                            className="rounded-r-none"
                        />
                        <div className="w-fit shrink-0">
                            <Select.Unregister
                                label="Buscar por"
                                labelClassName="sr-only"
                                name="searchType"
                                value={searchType}
                                onChange={(event) => setSearchType(event.target.value as UserSearchType)}
                                className="h-10 w-fit rounded-l-none bg-j-blue-600 py-2 text-sm text-j-white focus:bg-j-blue-700"
                            >
                                <option value="q">Geral</option>
                                <option value="name">Nome</option>
                                <option value="membershipNumber">Matrícula</option>
                                <option value="cpf">CPF</option>
                                <option value="rg">RG</option>
                                <option value="email">E-mail</option>
                                <option value="phoneNumber">Telefone</option>
                            </Select.Unregister>
                        </div>
                    </div>

                    <div id="tour-users-status-filter" className="flex w-full min-w-0 flex-col gap-3 lg:w-auto lg:flex-row lg:flex-nowrap lg:items-center lg:justify-end">
                        <div className="w-full lg:w-auto lg:shrink-0">
                        <Select.Unregister
                            label="Status"
                            labelClassName="sr-only"
                            name="status"
                            value={query.status ?? "ACTIVE"}
                            onChange={(event) =>
                                onStatusChange(event.target.value as UserStatus | "ALL")
                            }
                            className="h-10 w-full border-j-gray-200 bg-j-gray-100 py-2 text-sm text-j-gray-700 focus:bg-input-bg-focus lg:w-auto"
                        >
                            <option value="ALL">Todos os status</option>
                            <option value="ACTIVE">{USER_STATUS_LABEL.ACTIVE}</option>
                            <option value="INACTIVE">{USER_STATUS_LABEL.INACTIVE}</option>
                            <option value="ARCHIVED">{USER_STATUS_LABEL.ARCHIVED}</option>
                        </Select.Unregister>
                        </div>

                        {permissions.canExportUsers && onExportUsers && (
                            <AdminExport formats={["CSV", "PDF"]} className="w-full lg:w-auto lg:shrink-0" onExport={async (format) => { if (!onExportUsers) return; return onExportUsers(format); }} />
                        )}

                        {permissions.canCreateUsers && (
                            <button
                                type="button"
                                id="tour-users-create-btn"
                                onClick={onCreateUser}
                                className="flex w-full shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-button-primary-bg p-2.5 text-sm font-bold text-button-primary-text transition-colors duration-300 hover:bg-button-primary-bg-hover hover:text-button-primary-text-hover focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-button-outline-border md:text-base lg:w-auto"
                            >
                                Novo usuário
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>
            </Table.Header>

            <Table.Filters
                hasActiveFilters={hasActiveFilters}
                onClear={onClearFilters}
                className="justify-end border-b border-j-gray-200 bg-j-white px-4 pb-3 md:px-6 [&_label]:text-j-gray-700"
            />

            <div id="tour-users-table">
                <Table.Content
                    loadingRows={pageSize}
                    mobileColumnHeaders
                    mobileFirstColumnClassName="w-10"
                />
            </div>
        </Table.Root>
    );
}
