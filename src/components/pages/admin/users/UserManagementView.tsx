"use client";

import { useMemo } from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Eye, KeyRound, Power, PowerOff } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { ButtonIcon } from "@/components/common/button";
import { Select } from "@/components/common/select";
import { Table } from "@/components/common/table";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";
import type {
    AdminRole,
    UserListItem,
    UserListQuery,
    UserManagementPermissions,
    UserStatus,
} from "@/types/admin/users";
import { USER_STATUS_LABEL, USER_STATUS_STYLE } from "./user-display";

interface UserManagementViewProps {
    users: UserListItem[];
    query: UserListQuery;
    roles: AdminRole[];
    permissions: UserManagementPermissions;
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    isFetching: boolean;
    error?: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (statuses: UserStatus[]) => void;
    onRoleChange: (roleIds: number[]) => void;
    onClearFilters: () => void;
    onPaginationChange: (pagination: PaginationState) => void;
    onViewUser: (userId: number) => void;
    onChangeUserStatus: (user: UserListItem) => void;
    onManageRoles: (user: UserListItem) => void;
}

export function UserManagementView({
    users,
    query,
    roles,
    permissions,
    totalItems,
    totalPages,
    isLoading,
    isFetching,
    error,
    onSearchChange,
    onStatusChange,
    onRoleChange,
    onClearFilters,
    onPaginationChange,
    onViewUser,
    onChangeUserStatus,
    onManageRoles,
}: UserManagementViewProps) {
    const hasActiveFilters = Boolean(
        query.search || query.statuses?.length || query.roleIds?.length,
    );
    const canReplaceRoles = permissions.canReadUserRoles
        && permissions.canReadRoleCatalog
        && permissions.canAssignRoles
        && permissions.canRevokeRoles;

    const columns = useMemo<ColumnDef<UserListItem, unknown>[]>(() => {
        const baseColumns: ColumnDef<UserListItem, unknown>[] = [
            {
                accessorKey: "name",
                header: "Nome",
                cell: ({ row }) => (
                    <span className="font-bold text-j-gray-700">{row.original.name}</span>
                ),
            },
            {
                accessorKey: "email",
                header: "E-mail",
                cell: ({ row }) => row.original.email ?? "—",
            },
            {
                accessorKey: "cpf",
                header: "CPF",
                cell: ({ row }) => maskCPF(row.original.cpf),
            },
            {
                accessorKey: "phone",
                header: "Telefone",
                cell: ({ row }) => row.original.phone
                    ? maskPhoneNumber(row.original.phone)
                    : "—",
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <span
                        className={twMerge(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                            USER_STATUS_STYLE[row.original.status],
                        )}
                    >
                        {USER_STATUS_LABEL[row.original.status]}
                    </span>
                ),
            },
        ];

        if (permissions.canReadUserRoles) {
            baseColumns.push({
                accessorKey: "roles",
                header: "Papéis",
                cell: ({ row }) => {
                    const userRoles = row.original.roles;
                    if (!userRoles.length) return "—";

                    return (
                        <div className="flex max-w-64 flex-wrap gap-1.5">
                            {userRoles.map((role) => (
                                <span
                                    key={role.id}
                                    className={twMerge(
                                        "rounded-full border px-2 py-0.5 text-[11px] font-bold",
                                        role.status === "ACTIVE"
                                            ? "border-j-blue-200 bg-j-blue-100/20 text-j-blue-800"
                                            : "border-j-gray-200 bg-j-gray-100 text-j-gray-500",
                                    )}
                                >
                                    {role.name}{role.status !== "ACTIVE" ? ` · ${role.status === "INACTIVE" ? "inativo" : "excluído"}` : ""}
                                </span>
                            ))}
                        </div>
                    );
                },
            });
        }

        baseColumns.push(
            {
                accessorKey: "createdAt",
                header: "Cadastro",
                cell: ({ row }) => maskDate(row.original.createdAt),
            },
            {
                id: "actions",
                header: "Ações",
                cell: ({ row }) => {
                    const user = row.original;
                    const canChangeStatus = user.status === "DISABLED"
                        ? permissions.canEnableUsers
                        : permissions.canDisableUsers;

                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            {canReplaceRoles && (
                                <ButtonIcon
                                    type="button"
                                    title="Gerenciar papéis"
                                    aria-label={`Gerenciar papéis de ${user.name}`}
                                    onClick={() => onManageRoles(user)}
                                    className="rounded-lg bg-j-yellow-300 p-2 text-j-blue-800 hover:bg-j-yellow-400 hover:text-j-blue-800"
                                >
                                    <KeyRound size={18} />
                                </ButtonIcon>
                            )}

                            {canChangeStatus && (
                                <ButtonIcon
                                    type="button"
                                    title={user.status === "DISABLED" ? "Reativar usuário" : "Desativar usuário"}
                                    aria-label={`${user.status === "DISABLED" ? "Reativar" : "Desativar"} ${user.name}`}
                                    onClick={() => onChangeUserStatus(user)}
                                    className={twMerge(
                                        "rounded-lg p-2 text-white hover:text-white",
                                        user.status === "DISABLED"
                                            ? "bg-j-green-600 hover:bg-j-green-700"
                                            : "bg-j-red-500 hover:bg-j-red-600",
                                    )}
                                >
                                    {user.status === "DISABLED" ? <Power size={18} /> : <PowerOff size={18} />}
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
        );

        return baseColumns;
    }, [canReplaceRoles, onChangeUserStatus, onManageRoles, onViewUser, permissions]);

    return (
        <Table.Root
            data={users}
            columns={columns}
            getRowId={(user) => String(user.id)}
            pagination={{
                pageIndex: query.page,
                pageSize: query.pageSize,
                pageCount: totalPages,
                rowCount: totalItems,
                pageSizeOptions: [5, 10, 20],
                onChange: onPaginationChange,
            }}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            emptyState={
                hasActiveFilters
                    ? "Nenhum usuário corresponde à busca ou aos filtros atuais."
                    : "Nenhum usuário cadastrado."
            }
        >
            <Table.Header
                title="Usuários cadastrados"
                description={isLoading ? "Carregando usuários..." : `${totalItems} usuário(s) encontrado(s)`}
                className="items-stretch"
            >
                <Table.Search
                    value={query.search ?? ""}
                    onValueChange={onSearchChange}
                    label="Buscar usuários"
                    placeholder="Nome, e-mail, CPF ou telefone"
                    formClassName="sm:min-w-80"
                />
            </Table.Header>

            <Table.Filters
                hasActiveFilters={hasActiveFilters}
                onClear={onClearFilters}
                className="border-b border-j-gray-200 bg-j-white px-4 py-3 md:px-6 [&_label]:text-j-gray-700"
            >
                <Select.Unregister
                    label="Status"
                    name="status"
                    value={query.statuses?.[0] ?? ""}
                    onChange={(event) => onStatusChange(event.target.value ? [event.target.value as UserStatus] : [])}
                    className="h-10 min-w-56 border-j-gray-200 bg-j-gray-100 py-2 text-sm text-j-gray-700 focus:bg-j-white"
                >
                    <option value="">Todos os status</option>
                    {Object.entries(USER_STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </Select.Unregister>

                {permissions.canReadRoleCatalog && permissions.canReadUserRoles && (
                    <Select.Unregister
                        label="Papel de acesso"
                        name="role"
                        value={query.roleIds?.[0] ?? ""}
                        onChange={(event) => onRoleChange(event.target.value ? [Number(event.target.value)] : [])}
                        className="h-10 min-w-56 border-j-gray-200 bg-j-gray-100 py-2 text-sm text-j-gray-700 focus:bg-j-white"
                    >
                        <option value="">Todos os papéis</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}{role.status !== "ACTIVE" ? ` (${role.status === "INACTIVE" ? "inativo" : "excluído"})` : ""}
                            </option>
                        ))}
                    </Select.Unregister>
                )}
            </Table.Filters>

            <Table.Content loadingRows={query.pageSize} />
            <Table.Pagination />
        </Table.Root>
    );
}
