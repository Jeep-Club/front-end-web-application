"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { KeyRound,ShieldX } from "lucide-react";
import { useMemo,useState } from "react";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/common/button";
import { Avatar } from "@/components/common/avatar";
import { Select } from "@/components/common/select";
import { Table } from "@/components/common/table";
import { USER_STATUS_LABEL, USER_STATUS_STYLE } from "@/components/pages/admin/users/user-display";
import { useModal } from "@/providers/ModalProvider";
import { listAdminUsersAction } from "@/server/actions/admin/users/list";
import { useUserStore } from "@/stores/userStore";
import { maskCPF,maskPhoneNumber,unMaskCPF,unMaskPhoneNumber } from "@/utils/masks";
import { hasPermission } from "@/utils/permission/hasPermission";
import { UserRolesViewModal } from "./UserRolesViewModal";
import { RoleManagementLoading } from "./RoleManagementLoading";

type SearchType = "q" | "name" | "email" | "cpf" | "phoneNumber";

const PAGE_SIZE = 10;

function normalizeSearchValue(value: string, type: SearchType) {
    if (type === "cpf") return unMaskCPF(value);
    if (type === "phoneNumber") return unMaskPhoneNumber(value);
    return value.trim();
}

export function UserRoleAssignmentsTab() {
    const { setContent, openFromTrigger } = useModal();

    const permissions = useUserStore((state) => state.permissions);
    const canReadUserRoles = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_READ");
    const canAssignUserRoles = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_ASSIGN");

    const [searchType, setSearchType] = useState<SearchType>("q");
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

    // A aba de atribuições só lista sócios ativos — filtro fixo, não é alterável pelo usuário.
    const searchParams: AdminUserSearchParams = {
        page: String(page),
        size: String(pageSize),
        status: "ACTIVE",
        ...(searchValue ? { [searchType]: searchValue } : {}),
    };

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ["admin-users", "role-assignments", searchParams],
        queryFn: () => listAdminUsersAction(searchParams),
        placeholderData: (previous) => previous,
        enabled: canReadUserRoles,
    });

    const hasActiveFilters = Boolean(searchValue);

    const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(() => [
        {
            id: "photo",
            header: "Foto",
            meta: { label: "Foto" },
            cell: ({ row }) => row.original.profilePhotoUrl ? (
                <Avatar src={row.original.profilePhotoUrl} alt={`Foto de ${row.original.name}`} />
            ) : (
                <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-j-blue-100 text-xs font-bold text-j-blue-800"
                >
                    {row.original.name
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toLocaleUpperCase("pt-BR")}
                </span>
            ),
        },
        {
            accessorKey: "name",
            header: "Nome",
            meta: { label: "Nome" },
            cell: ({ row }) => {
                const name = row.original.name;
                const parts = name.trim().split(/\s+/);
                const shortName = parts.length > 1 ? `${parts[0]} ${parts.at(-1)}` : parts[0];
                return <span className="font-bold text-j-gray-700">
                    <span className="lg:hidden">{shortName}</span>
                    <span className="hidden lg:inline">{name}</span>
                </span>;
            },
        },
        {
            accessorKey: "membershipNumber",
            header: "Matrícula",
            meta: { label: "Matrícula" },
            cell: ({ row }) => (
                <span className="font-bold text-j-gray-700">
                    {row.original.membershipNumber ?? "—"}
                </span>
            ),
        },
        {
            accessorKey: "cpf",
            header: "CPF",
            meta: { label: "CPF" },
            cell: ({ row }) => maskCPF(row.original.cpf),
        },
        {
            accessorKey: "phoneNumber",
            header: "Telefone",
            meta: { label: "Telefone" },
            cell: ({ row }) => row.original.phoneNumber
                ? maskPhoneNumber(row.original.phoneNumber)
                : "—",
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
                    {USER_STATUS_LABEL[row.original.status]}
                </span>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Ações</div>,
            meta: { label: "Ações" },
            cell: ({ row }) => (
                <div className="flex items-center justify-end">
                    <Button
                        type="button"
                        title={canAssignUserRoles ? "Gerenciar cargos" : "Ver cargos"}
                        aria-label={`${canAssignUserRoles ? "Gerenciar" : "Ver"} cargos de ${row.original.name}`}
                        onClick={(event) => {
                            setContent(
                                <UserRolesViewModal userId={row.original.id} userName={row.original.name} />,
                            );
                            openFromTrigger(event.currentTarget);
                        }}
                        className="min-h-10 whitespace-nowrap px-3 py-2 text-sm"
                    >
                        <KeyRound size={17} />
                        {canAssignUserRoles ? "Gerenciar cargos" : "Ver cargos"}
                    </Button>
                </div>
            ),
        },
    ], [canAssignUserRoles, setContent, openFromTrigger]);

    if (!canReadUserRoles) {
        return (
            <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                <ShieldX size={42} className="mb-3 text-j-gray-400" />
                <h3 className="text-lg font-black text-j-blue-800">Acesso não permitido</h3>
                <p className="mt-1 max-w-md text-sm text-j-gray-600">
                    Seu usuário não possui permissão para visualizar as atribuições de cargos.
                </p>
            </section>
        );
    }

    return (
        <div className="flex w-full flex-col gap-4">
            <Table.Root
                data={data?.content ?? []}
                columns={columns}
                getRowId={(user) => String(user.id)}
                pagination={{
                    pageIndex: page,
                    pageSize,
                    pageCount: data?.totalPages ?? 0,
                    rowCount: data?.totalElements,
                    pageSizeOptions: [5, 10, 20, 50],
                    onChange: (next) => {
                        setPage(next.pageIndex);
                        setPageSize(next.pageSize);
                    },
                }}
                footer={<Table.Pagination itemLabel="usuário" showCount={false} />}
                isLoading={isLoading}
                isFetching={isFetching}
                error={error ? error.message : undefined}
                emptyState={
                    hasActiveFilters
                        ? "Nenhum usuário corresponde à busca ou aos filtros atuais."
                        : "Nenhum usuário cadastrado."
                }
            >
                <Table.Header className="items-stretch border-b-0">
                <div className="flex w-full items-end sm:min-w-64">
                    <Table.Search
                        value={searchType === "cpf"
                            ? maskCPF(searchValue)
                            : searchType === "phoneNumber"
                                ? maskPhoneNumber(searchValue)
                                : searchValue}
                        onValueChange={(value) => {
                            setSearchValue(normalizeSearchValue(value, searchType));
                            setPage(0);
                        }}
                        label="Buscar usuários"
                        placeholder="Buscar usuário"
                        submitOnChange={false}
                        mask={searchType === "cpf"
                            ? maskCPF
                            : searchType === "phoneNumber"
                                ? maskPhoneNumber
                                : undefined}
                        inputMode={searchType === "cpf" || searchType === "phoneNumber" ? "numeric" : "search"}
                        formClassName="w-0 min-w-0 flex-1"
                        className="rounded-r-none max-sm:pr-8"
                    />
                    <div className="w-fit shrink-0">
                        <Select.Unregister
                            label="Buscar por"
                            labelClassName="sr-only"
                            name="searchType"
                            value={searchType}
                            onChange={(event) => {
                                setSearchType(event.target.value as SearchType);
                                setSearchValue("");
                                setPage(0);
                            }}
                            className="h-10 w-20 min-w-0 rounded-l-none border border-l-0 border-input-border bg-background-secondary px-2 py-2 text-sm text-primary focus:bg-input-bg-focus max-sm:gap-1 max-sm:text-xs max-sm:[&>svg]:size-3.5 sm:w-32 sm:px-3"
                        >
                            <option value="q">Geral</option>
                            <option value="name">Nome</option>
                            <option value="cpf">CPF</option>
                            <option value="email">E-mail</option>
                            <option value="phoneNumber">Telefone</option>
                        </Select.Unregister>
                    </div>
                </div>
                </Table.Header>

                <Table.Filters
                    hasActiveFilters={hasActiveFilters}
                    onClear={() => {
                        setSearchValue("");
                        setPage(0);
                    }}
                    className="justify-end border-b border-j-gray-200 bg-j-white px-4 pb-3 md:px-6"
                />

                {isFetching ? (
                    <RoleManagementLoading label="Buscando usuários e seus cargos…" assignments />
                ) : (
                    <Table.Content />
                )}
            </Table.Root>
        </div>
    );
}

export default UserRoleAssignmentsTab;
