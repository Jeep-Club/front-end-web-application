"use client";

import { useMemo } from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Eye, Plus, Power, PowerOff } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button, ButtonIcon } from "@/components/common/button";
import { Select } from "@/components/common/select";
import { Table } from "@/components/common/table";
import { maskCPF, maskDate, maskPhoneNumber } from "@/utils/masks";

import { USER_STATUS_LABEL, USER_STATUS_STYLE } from "./user-display";

type SearchType = "q" | "name" | "email" | "cpf" | "phoneNumber";

interface UserManagementViewProps {
    users: AdminUser[];
    query: AdminUserSearchParams;
    // roles: AdminRole[];
    permissions: UserManagementPermissions;
    totalItems: number;
    totalPages: number;
    pageIndex: number;
    pageSize: number;
    isLoading: boolean;
    isFetching: boolean;
    error?: string;
    onSearchChange: (value: string) => void;
    onStatusChange: (status: "ACTIVE" | "DISABLED" | undefined) => void;
    // onRoleChange: (roleIds: number[]) => void;
    onClearFilters: () => void;
    onPaginationChange: (pagination: PaginationState) => void;
    onSortChange: (field: string) => void;
    onViewUser: (userId: number) => void;
    onChangeUserStatus: (user: AdminUser) => void;
    onCreateUser: () => void;
    searchType: SearchType;
    setSearchType: (type: SearchType) => void;
}

export function UserManagementView({
    users,
    query,
    // roles,
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
    // onRoleChange,
    onClearFilters,
    onPaginationChange,
    onSortChange,
    onViewUser,
    onChangeUserStatus,
    onCreateUser,
    searchType,
    setSearchType,
}: UserManagementViewProps) {
    const hasActiveFilters = Boolean(
        query.q
        || query.name
        || query.email
        || query.cpf
        || query.phoneNumber
        || query.id
        || query.accountStatus
        || query.authenticationStatus
        || query.credentialStatus
        || query.passwordChangeRequired
        || query.createdFrom
        || query.createdTo
        || query.updatedFrom
        || query.updatedTo
        || query.fields,
    );

    const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(() => {
        const baseColumns: ColumnDef<AdminUser, unknown>[] = [
            {
                accessorKey: "id",
                header: "Matrícula",
                meta: { label: "Matrícula" },
                cell: ({ row }) => (
                    <span className="font-bold text-j-gray-700">{row.original.id}</span>
                ),
            },
            {
                accessorKey: "name",
                header: () => (
                    <Table.Sortable field="name" label="Nome" sort={query.sort} onSortChange={onSortChange} />
                ),
                meta: { label: "Nome completo" },
                cell: ({ row }) => (
                    <span className="font-bold text-j-gray-700">{row.original.name}</span>
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
                accessorKey: "phone",
                header: () => (
                    <Table.Sortable field="phoneNumber" label="Telefone" sort={query.sort} onSortChange={onSortChange} />
                ),
                meta: { label: "Telefone" },
                cell: ({ row }) => row.original.phone
                    ? maskPhoneNumber(row.original.phone)
                    : "—",
            },
            {
                accessorKey: "accountStatus",
                header: "Status",
                meta: { label: "Status" },
                cell: ({ row }) => (
                    <span
                        className={twMerge(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                            USER_STATUS_STYLE[row.original.accountStatus],
                        )}
                    >
                        {USER_STATUS_LABEL[row.original.accountStatus]}
                    </span>
                ),
            },
        ];

        // if (permissions.canReadUserRoles) {
        //     baseColumns.push({
        //         accessorKey: "roles",
        //         header: "Papéis",
        //         cell: ({ row }) => {
        //             const userRoles = row.original.roles;
        //             if (!userRoles.length) return "—";

        //             return (
        //                 <div className="flex max-w-64 flex-wrap gap-1.5">
        //                     {userRoles.map((role) => (
        //                         <span
        //                             key={role.id}
        //                             className={twMerge(
        //                                 "rounded-full border px-2 py-0.5 text-[11px] font-bold",
        //                                 role.status === "ACTIVE"
        //                                     ? "border-j-blue-200 bg-j-blue-100/20 text-j-blue-800"
        //                                     : "border-j-gray-200 bg-j-gray-100 text-j-gray-500",
        //                             )}
        //                         >
        //                             {role.name}{role.status !== "ACTIVE" ? ` · ${role.status === "INACTIVE" ? "inativo" : "excluído"}` : ""}
        //                         </span>
        //                     ))}
        //                 </div>
        //             );
        //         },
        //     });
        // }

        baseColumns.push(
            {
                accessorKey: "createdAt",
                header: () => (
                    <Table.Sortable field="createdAt" label="Cadastro" sort={query.sort} onSortChange={onSortChange} />
                ),
                meta: { label: "Cadastro" },
                cell: ({ row }) => maskDate(row.original.createdAt),
            },
            {
                id: "actions",
                header: "Ações",
                meta: { label: "Ações" },
                cell: ({ row }) => {
                    const user = row.original;
                    const canChangeStatus = user.accountStatus === "DISABLED"
                        ? permissions.canEnableUsers
                        : permissions.canDisableUsers;

                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            {canChangeStatus && (
                                <ButtonIcon
                                    type="button"
                                    title={user.accountStatus === "DISABLED" ? "Reativar usuário" : "Desativar usuário"}
                                    aria-label={`${user.accountStatus === "DISABLED" ? "Reativar" : "Desativar"} ${user.name}`}
                                    onClick={() => onChangeUserStatus(user)}
                                    className={twMerge(
                                        "rounded-lg p-2 text-white hover:text-white",
                                        user.accountStatus === "DISABLED"
                                            ? "bg-j-green-600 hover:bg-j-green-700"
                                            : "bg-j-red-500 hover:bg-j-red-600",
                                    )}
                                >
                                    {user.accountStatus === "DISABLED" ? <Power size={18} /> : <PowerOff size={18} />}
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
    }, [onChangeUserStatus, onSortChange, onViewUser, permissions, query.sort]);

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
                pageSizeOptions: [5, 10, 20, 50, 100],
                onChange: onPaginationChange,
            }}
            footer={<Table.Pagination itemLabel="usuário" showCount={false} />}
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
                <div className="flex w-full flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                    <div className="flex w-full lg:min-w-64 lg:flex-1">
                        <Table.Search
                            value={searchType === "cpf"
                                ? maskCPF(query.cpf ?? "")
                                : searchType === "phoneNumber"
                                    ? maskPhoneNumber(query.phoneNumber ?? "")
                                    : query[searchType] ?? ""}
                            onValueChange={onSearchChange}
                            label="Buscar usuários"
                            placeholder="Digite a busca e pressione Enter"
                            submitOnChange={false}
                            mask={searchType === "cpf"
                                ? maskCPF
                                : searchType === "phoneNumber"
                                    ? maskPhoneNumber
                                    : undefined}
                            inputMode={searchType === "cpf" || searchType === "phoneNumber" ? "numeric" : "search"}
                            formClassName="w-full lg:flex-1"
                            className="rounded-r-none"
                        />
                        <div className="w-fit shrink-0">
                            <Select.Unregister
                                label="Buscar por"
                                labelClassName="sr-only"
                                name="searchType"
                                value={searchType}
                                onChange={(event) => setSearchType(event.target.value as SearchType)}
                                className="h-10 w-fit rounded-l-none bg-j-blue-600 py-2 text-sm text-j-white focus:bg-j-blue-700"
                            >
                                <option value="q">Geral</option>
                                <option value="name">Nome</option>
                                <option value="cpf">CPF</option>
                                <option value="email">E-mail</option>
                                <option value="phoneNumber">Telefone</option>
                            </Select.Unregister>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-end">
                        <Select.Unregister
                            label="Status"
                            labelClassName="sr-only"
                            name="status"
                            value={query.accountStatus ?? ""}
                            onChange={(event) => onStatusChange(
                                event.target.value
                                    ? event.target.value as "ACTIVE" | "DISABLED"
                                    : undefined,
                            )}
                            className="h-10 w-full border-j-gray-200 bg-j-gray-100 py-2 text-sm text-j-gray-700 focus:bg-j-white lg:w-auto"
                        >
                            <option value="">Todos os status</option>
                            <option value="ACTIVE">{USER_STATUS_LABEL.ACTIVE}</option>
                            <option value="DISABLED">{USER_STATUS_LABEL.DISABLED}</option>
                        </Select.Unregister>

                        {permissions.canAssignRoles && (
                            <Button
                                type="button"
                                onClick={onCreateUser}
                                disabled={isFetching}
                                className="w-full shrink-0 whitespace-nowrap px-5 lg:w-auto"
                            >
                                Novo usuário
                                <Plus size={16} strokeWidth={3} />
                            </Button>
                        )}
                    </div>
                </div>
            </Table.Header>

            <Table.Filters
                hasActiveFilters={hasActiveFilters}
                onClear={onClearFilters}
                className="justify-end border-b border-j-gray-200 bg-j-white px-4 pb-3 md:px-6 [&_label]:text-j-gray-700"
            >
                {/* {permissions.canReadRoleCatalog && permissions.canReadUserRoles && (
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
                )} */}
            </Table.Filters>

            <Table.Content loadingRows={pageSize} />
        </Table.Root>
    );
}
