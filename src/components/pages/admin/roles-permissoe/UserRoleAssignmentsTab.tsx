"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { KeyRound, ShieldX } from "lucide-react";

import { ButtonIcon } from "@/components/common/button";
import { Select } from "@/components/common/select";
import { Table } from "@/components/common/table";
import { listAdminUsersAction } from "@/actions/admin/users/list";
import { maskCPF, maskPhoneNumber, unMaskCPF, unMaskPhoneNumber } from "@/utils/masks";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useModal } from "@/providers/ModalProvider";
import { UserRolesViewModal } from "./UserRolesViewModal";

type SearchType = "q" | "name" | "email" | "cpf" | "phoneNumber";

const PAGE_SIZE = 10;

function normalizeSearchValue(value: string, type: SearchType) {
    if (type === "cpf") return unMaskCPF(value);
    if (type === "phoneNumber") return unMaskPhoneNumber(value);
    return value.trim();
}

export function UserRoleAssignmentsTab() {
    const { setContent, setOpen } = useModal();

    const permissions = useUserStore((state) => state.permissions);
    const canReadUserRoles = hasPermission(permissions, "AUTHORIZATION", "USER_ROLE_READ");

    const [searchType, setSearchType] = useState<SearchType>("q");
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

    // A aba de atribuições só lista sócios ativos — filtro fixo, não é alterável pelo usuário.
    const searchParams: AdminUserSearchParams = {
        page: String(page),
        size: String(pageSize),
        accountStatus: "ACTIVE",
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
            accessorKey: "id",
            header: "Matrícula",
            meta: { label: "Matrícula" },
            cell: ({ row }) => (
                <span className="font-bold text-j-gray-700">{row.original.id}</span>
            ),
        },
        {
            accessorKey: "name",
            header: "Nome",
            meta: { label: "Nome completo" },
            cell: ({ row }) => (
                <span className="font-bold text-j-gray-700">{row.original.name}</span>
            ),
        },
        {
            accessorKey: "email",
            header: "E-mail",
            meta: { label: "E-mail" },
            cell: ({ row }) => row.original.email ?? "—",
        },
        {
            accessorKey: "cpf",
            header: "CPF",
            meta: { label: "CPF" },
            cell: ({ row }) => maskCPF(row.original.cpf),
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            meta: { label: "Telefone" },
            cell: ({ row }) => row.original.phone
                ? maskPhoneNumber(row.original.phone)
                : "—",
        },
        {
            id: "actions",
            header: "Ações",
            meta: { label: "Ações" },
            cell: ({ row }) => (
                <div className="flex items-center justify-end">
                    <ButtonIcon
                        type="button"
                        title="Ver cargos"
                        aria-label={`Ver cargos de ${row.original.name}`}
                        onClick={() => {
                            setContent(
                                <UserRolesViewModal userId={row.original.id} userName={row.original.name} />,
                            );
                            setOpen();
                        }}
                        className="rounded-lg bg-j-blue-800 p-2 text-j-yellow-300 hover:bg-j-blue-600 hover:text-j-yellow-300"
                    >
                        <KeyRound size={18} />
                    </ButtonIcon>
                </div>
            ),
        },
    ], [setContent, setOpen]);

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
        <Table.Root
            data={data?.content ?? []}
            columns={columns}
            getRowId={(user) => String(user.id)}
            pagination={{
                pageIndex: page,
                pageSize,
                pageCount: data?.totalPages ?? 0,
                rowCount: data?.totalElements,
                pageSizeOptions: [5, 10, 20, 50, 100],
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
                <div className="flex w-full sm:min-w-64">
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
                        placeholder="Digite a busca e pressione Enter"
                        submitOnChange={false}
                        mask={searchType === "cpf"
                            ? maskCPF
                            : searchType === "phoneNumber"
                                ? maskPhoneNumber
                                : undefined}
                        inputMode={searchType === "cpf" || searchType === "phoneNumber" ? "numeric" : "search"}
                        formClassName="w-full sm:flex-1"
                        className="rounded-r-none"
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
            </Table.Header>

            <Table.Filters
                hasActiveFilters={hasActiveFilters}
                onClear={() => {
                    setSearchValue("");
                    setPage(0);
                }}
                className="justify-end border-b border-j-gray-200 bg-j-white px-4 pb-3 md:px-6"
            />

            <Table.Content loadingRows={pageSize} />
        </Table.Root>
    );
}

export default UserRoleAssignmentsTab;
