"use client";

import { useMemo, useState } from "react";
import { createColumnHelper, type PaginationState } from "@tanstack/react-table";

import { Table } from "@/components/common/table";

type MemberStatus = "Ativo" | "Inativo";

interface JeepMember {
    id: string;
    name: string;
    jeepModel: string;
    role: string;
    status: MemberStatus;
}

const columnHelper = createColumnHelper<JeepMember>();

const columns = [
    columnHelper.accessor("name", {
        header: "Nome do piloto",
        cell: (info) => (
            <span className="font-bold text-j-gray-700">{info.getValue()}</span>
        ),
    }),
    columnHelper.accessor("jeepModel", {
        header: "Veículo",
        cell: (info) => (
            <span className="font-semibold text-j-blue-800">{info.getValue()}</span>
        ),
    }),
    columnHelper.accessor("role", {
        header: "Cargo",
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
            const isActive = info.getValue() === "Ativo";

            return (
                <span
                    className={
                        isActive
                            ? "rounded-full bg-j-green-100 px-2.5 py-1 text-xs font-bold text-j-green-700"
                            : "rounded-full bg-j-gray-200 px-2.5 py-1 text-xs font-bold text-j-gray-600"
                    }
                >
                    {info.getValue()}
                </span>
            );
        },
    }),
];

const members: JeepMember[] = [
    { id: "1", name: "João Passos", jeepModel: "Wrangler Rubicon", role: "Presidente", status: "Ativo" },
    { id: "2", name: "Carlos Silva", jeepModel: "Renegade Trailhawk", role: "Membro", status: "Ativo" },
    { id: "3", name: "Ana Souza", jeepModel: "Compass Limited", role: "Tesoureira", status: "Ativo" },
    { id: "4", name: "Marcos Rocha", jeepModel: "Grand Cherokee", role: "Membro", status: "Inativo" },
    { id: "5", name: "Lucas Mendes", jeepModel: "Wrangler Sahara", role: "Membro", status: "Ativo" },
    { id: "6", name: "Fernanda Costa", jeepModel: "Renegade Sport", role: "Membro", status: "Ativo" },
    { id: "7", name: "Roberto Alves", jeepModel: "Commander Overland", role: "Membro", status: "Inativo" },
    { id: "8", name: "Juliana Dias", jeepModel: "Compass Longitude", role: "Membro", status: "Ativo" },
];

export default function TableExample() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<MemberStatus | "Todos">("Todos");
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });

    const filteredMembers = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

        return members.filter((member) => {
            const matchesStatus = status === "Todos" || member.status === status;
            const matchesSearch =
                !normalizedSearch ||
                member.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
                member.jeepModel.toLocaleLowerCase("pt-BR").includes(normalizedSearch);

            return matchesStatus && matchesSearch;
        });
    }, [search, status]);

    const pageCount = Math.ceil(filteredMembers.length / pagination.pageSize);
    const pageData = filteredMembers.slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize,
    );

    function handleSearchChange(value: string) {
        setSearch(value);
        setPagination((current) => ({ ...current, pageIndex: 0 }));
    }

    function handleStatusChange(value: MemberStatus | "Todos") {
        setStatus(value);
        setPagination((current) => ({ ...current, pageIndex: 0 }));
    }

    return (
        <Table.Root
            columns={columns}
            data={pageData}
            getRowId={(row) => row.id}
            emptyState="Nenhum membro corresponde à busca ou aos filtros."
            pagination={{
                ...pagination,
                pageCount,
                rowCount: filteredMembers.length,
                pageSizeOptions: [5, 10, 20],
                onChange: setPagination,
            }}
        >
            <Table.Header
                title="Gestão de membros"
                description="Exemplo temporário do componente global de tabela."
            >
                <Table.Search
                    value={search}
                    onValueChange={handleSearchChange}
                    placeholder="Buscar por nome ou veículo..."
                />

                <Table.Filters
                    hasActiveFilters={status !== "Todos"}
                    onClear={() => handleStatusChange("Todos")}
                >
                    <label className="flex w-full flex-col gap-1 sm:w-auto">
                        <span className="sr-only">Filtrar por status</span>
                        <select
                            value={status}
                            onChange={(event) =>
                                handleStatusChange(event.target.value as MemberStatus | "Todos")
                            }
                            className="h-10 w-full rounded-lg border border-j-gray-200 bg-j-white px-3 text-sm text-j-gray-700 outline-none focus:border-j-yellow-400 focus:ring-2 focus:ring-j-yellow-300/30 sm:w-36"
                        >
                            <option value="Todos">Todos</option>
                            <option value="Ativo">Ativos</option>
                            <option value="Inativo">Inativos</option>
                        </select>
                    </label>
                </Table.Filters>
            </Table.Header>

            <Table.Content />
            <Table.Pagination />
        </Table.Root>
    );
}
