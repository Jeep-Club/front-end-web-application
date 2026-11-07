import { useMemo, useState, type ReactNode } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Table } from "./index";

type MemberStatus = "Ativo" | "Inativo";
type SortDirection = "asc" | "desc";
type SortState = { field: keyof Member; direction: SortDirection } | null;

interface Member {
    id: string;
    name: string;
    jeepModel: string;
    role: string;
    status: MemberStatus;
}

const members: Member[] = [
    { id: "1", name: "João Passos", jeepModel: "Wrangler Rubicon", role: "Presidente", status: "Ativo" },
    { id: "2", name: "Carlos Silva", jeepModel: "Renegade Trailhawk", role: "Membro", status: "Ativo" },
    { id: "3", name: "Ana Souza", jeepModel: "Compass Limited", role: "Tesoureira", status: "Ativo" },
    { id: "4", name: "Marcos Rocha", jeepModel: "Grand Cherokee", role: "Membro", status: "Inativo" },
    { id: "5", name: "Lucas Mendes", jeepModel: "Wrangler Sahara", role: "Membro", status: "Ativo" },
    { id: "6", name: "Fernanda Costa", jeepModel: "Renegade Sport", role: "Membro", status: "Ativo" },
    { id: "7", name: "Roberto Alves", jeepModel: "Commander Overland", role: "Membro", status: "Inativo" },
    { id: "8", name: "Juliana Dias", jeepModel: "Compass Longitude", role: "Membro", status: "Ativo" },
];

interface TableStoryArgs {
    isLoading?: boolean;
    isFetching?: boolean;
    error?: ReactNode;
    emptyState?: ReactNode;
}

function StatusBadge({ status }: { status: MemberStatus }) {
    const active = status === "Ativo";

    return (
        <span
            className={active
                ? "rounded-full bg-j-green-100 px-2.5 py-1 text-xs font-bold text-j-green-700"
                : "rounded-full bg-j-gray-200 px-2.5 py-1 text-xs font-bold text-j-gray-600"}
        >
            {status}
        </span>
    );
}

function createColumns(sort: SortState, onSortChange: (field: keyof Member) => void): ColumnDef<Member, unknown>[] {
    const sortableHeader = (field: keyof Member, label: string) => (
        <Table.Sortable
            field={field}
            label={label}
            sort={sort ? `${String(sort.field)},${sort.direction}` : undefined}
            onSortChange={() => onSortChange(field)}
        />
    );

    return [
        {
            accessorKey: "name",
            header: () => sortableHeader("name", "Nome"),
            meta: { label: "Nome" },
            cell: ({ row }) => <span className="font-bold text-j-gray-700">{row.original.name}</span>,
        },
        {
            accessorKey: "jeepModel",
            header: () => sortableHeader("jeepModel", "Veículo"),
            meta: { label: "Veículo" },
            cell: ({ row }) => <span className="font-semibold text-j-blue-800">{row.original.jeepModel}</span>,
        },
        {
            accessorKey: "role",
            header: "Cargo",
            meta: { label: "Cargo" },
        },
        {
            accessorKey: "status",
            header: "Status",
            meta: { label: "Status" },
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
    ];
}

function MembersTable({
    isLoading = false,
    isFetching = false,
    error,
    emptyState = "Nenhum membro corresponde à busca ou aos filtros.",
    forceEmpty = false,
}: TableStoryArgs & { forceEmpty?: boolean }) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<MemberStatus | "Todos">("Todos");
    const [sort, setSort] = useState<SortState>(null);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

    const filteredMembers = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
        const filtered = (forceEmpty ? [] : members).filter((member) => {
            const matchesStatus = status === "Todos" || member.status === status;
            const matchesSearch = !normalizedSearch
                || member.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
                || member.jeepModel.toLocaleLowerCase("pt-BR").includes(normalizedSearch);

            return matchesStatus && matchesSearch;
        });

        if (!sort) return filtered;

        return [...filtered].sort((first, second) => {
            const firstValue = String(first[sort.field]);
            const secondValue = String(second[sort.field]);
            const comparison = firstValue.localeCompare(secondValue, "pt-BR");

            return sort.direction === "asc" ? comparison : -comparison;
        });
    }, [forceEmpty, search, sort, status]);

    const pageCount = Math.ceil(filteredMembers.length / pagination.pageSize);
    const pageData = filteredMembers.slice(
        pagination.pageIndex * pagination.pageSize,
        (pagination.pageIndex + 1) * pagination.pageSize,
    );
    const columns = useMemo(
        () => createColumns(sort, (field) => {
            setSort((current) => {
                if (!current || current.field !== field) return { field, direction: "asc" };
                if (current.direction === "asc") return { field, direction: "desc" };
                return null;
            });
            setPagination((current) => ({ ...current, pageIndex: 0 }));
        }),
        [sort],
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
            error={error}
            emptyState={emptyState}
            isLoading={isLoading}
            isFetching={isFetching}
            pagination={{
                ...pagination,
                pageCount,
                rowCount: filteredMembers.length,
                pageSizeOptions: [5, 10, 20],
                onChange: setPagination,
            }}
            footer={<Table.Pagination itemLabel="membro" />}
        >
            <Table.Header
                title="Gestão de membros"
                description="Composição local com busca, filtros, ordenação e paginação manual."
            >
                <Table.Search
                    value={search}
                    onValueChange={handleSearchChange}
                    label="Buscar membros"
                    placeholder="Buscar por nome ou veículo..."
                />

                <Table.Filters
                    hasActiveFilters={status !== "Todos"}
                    onClear={() => handleStatusChange("Todos")}
                >
                    <label className="flex w-full flex-col gap-1 sm:w-auto">
                        <span className="sr-only">Filtrar por status</span>
                        <select
                            aria-label="Filtrar por status"
                            value={status}
                            onChange={(event) => handleStatusChange(event.target.value as MemberStatus | "Todos")}
                            className="h-10 w-full rounded-lg border border-j-gray-200 bg-j-white px-3 text-sm text-j-gray-700 outline-none focus:border-j-yellow-400 focus:ring-2 focus:ring-j-yellow-300/30 sm:w-36"
                        >
                            <option value="Todos">Todos</option>
                            <option value="Ativo">Ativos</option>
                            <option value="Inativo">Inativos</option>
                        </select>
                    </label>
                </Table.Filters>
            </Table.Header>

            <Table.Content loadingRows={pagination.pageSize} />
        </Table.Root>
    );
}

const meta = {
    title: "Componentes/Table",
    component: Table.Root,
    tags: ["!autodocs"],
    argTypes: {
        isLoading: {
            control: "boolean",
            description: "Substitui o conteúdo por Table.Skeleton durante o carregamento inicial.",
        },
        isFetching: {
            control: "boolean",
            description: "Indica uma atualização mantendo as linhas atuais e desabilitando a paginação.",
        },
        error: {
            control: "text",
            description: "Mensagem ou conteúdo exibido pelo Table.Content quando há erro.",
        },
        emptyState: {
            control: "text",
            description: "Conteúdo exibido quando a tabela não possui linhas.",
        },
        columns: { control: false },
        data: { control: false },
        children: { control: false },
        footer: { control: false },
        getRowId: { control: false },
        pagination: { control: false },
    },
    args: {
        columns: [],
        data: [],
        children: null,
        isLoading: false,
        isFetching: false,
        error: undefined,
        emptyState: "Nenhum membro corresponde à busca ou aos filtros.",
    },
    parameters: {
        docs: {
            description: {
                component: "Table é uma composição de Root e subcomponentes que compartilham o contexto interno da tabela. Root cria o modelo TanStack Table e fornece os estados de carregamento, erro, vazio e paginação; Content decide qual estado renderizar. Search, Filters, Pagination e Sortable apenas comunicam eventos ao consumidor, que continua responsável por busca, filtros, ordenação e dados remotos.",
            },
        },
        controls: {
            include: ["isLoading", "isFetching", "error", "emptyState"],
        },
    },
} satisfies Meta<typeof Table.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComposicaoCompleta: Story = {
    render: (args) => <MembersTable {...args} />,
    play: async ({ canvas, userEvent }) => {
        const search = canvas.getByRole("searchbox", { name: "Buscar membros" });
        await userEvent.type(search, "Ana");
        await expect(search).toHaveValue("Ana");
        await expect(canvas.queryAllByText("João Passos")).toHaveLength(0);
        await expect(canvas.queryAllByText("Ana Souza").length).toBeGreaterThan(0);

        await userEvent.click(canvas.getByRole("button", { name: "Limpar busca" }));
        await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Filtrar por status" }), "Inativo");
        await expect(canvas.queryAllByText("Marcos Rocha").length).toBeGreaterThan(0);
        await expect(canvas.queryAllByText("Ana Souza")).toHaveLength(0);

        await userEvent.click(canvas.getByRole("button", { name: "Limpar filtros" }));
        await userEvent.click(canvas.getByRole("button", { name: "Próxima página" }));
        await expect(canvas.getByLabelText("Página 2 de 2")).toBeInTheDocument();
    },
};

export const Atualizando: Story = {
    render: (args) => <MembersTable {...args} />,
    args: { isFetching: true },
};

export const Carregando: Story = {
    render: (args) => <MembersTable {...args} />,
    args: { isLoading: true },
};

export const Erro: Story = {
    render: (args) => <MembersTable {...args} />,
    args: { error: "Não foi possível carregar os membros. Tente novamente." },
};

export const Vazio: Story = {
    render: (args) => <MembersTable {...args} forceEmpty />,
};

export const AcordeaoMobile: Story = {
    render: (args) => <MembersTable {...args} />,
    parameters: { viewport: { defaultViewport: "mobile1" } },
    play: async ({ canvas, userEvent }) => {
        const row = canvas.getByRole("button", { name: /Nome João Passos/ });
        await userEvent.click(row);
        await expect(canvas.getByText("Cargo:")).toBeInTheDocument();
        await expect(row).toHaveAttribute("aria-expanded", "true");
    },
};
