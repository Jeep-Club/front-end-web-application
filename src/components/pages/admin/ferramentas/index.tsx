"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Power, RotateCcw, ShieldX, Trash2, Wrench } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { PageHeader } from "@/components/common/page-header";
import { ManagementBackButton } from "@/components/pages/admin/ManagementBackButton";
import { Button } from "@/components/common/button";
import { InputSearch } from "@/components/common/input/input-search";
import { ListPagination } from "@/components/common/table/ListPagination";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { listToolsAdminAction } from "@/actions/admin/tools/list";

import { ToolDetailModal } from "./ToolDetailModal";
import { IncludeAdminToolModal } from "./IncludeAdminToolModal";
import { ToggleAdminToolStatusModal } from "./ToggleAdminToolStatusModal";
import { DeleteAdminToolModal } from "./DeleteAdminToolModal";
import {
    ADMIN_TOOL_STATUS_FILTER_OPTIONS,
    TOOL_STATUS_BADGE_CLASS,
    TOOL_STATUS_LABEL,
} from "./toolDisplay";

const DEFAULT_PAGE_SIZE = 10;

export default function ToolManagement() {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);

    const canRead = hasPermission(permissions, "TOOLS", "TOOL_READ");
    const canCreate = hasPermission(permissions, "TOOLS", "TOOL_CREATE");
    const canUpdate = hasPermission(permissions, "TOOLS", "TOOL_UPDATE");
    const canActivate = hasPermission(permissions, "TOOLS", "TOOL_ACTIVATE");
    const canDeactivate = hasPermission(permissions, "TOOLS", "TOOL_DEACTIVATE");
    const canDelete = hasPermission(permissions, "TOOLS", "TOOL_DELETE");

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [nameFilter, setNameFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<AdminToolStatusFilter | "">("");

    const hasActiveFilters = Boolean(nameFilter.trim() || statusFilter);

    const query = useQuery({
        queryKey: [
            "admin",
            "tools",
            {
                page,
                size: pageSize,
                name: nameFilter.trim() || undefined,
                status: statusFilter || undefined,
            },
        ],
        queryFn: () =>
            listToolsAdminAction({
                page,
                size: pageSize,
                name: nameFilter.trim() || undefined,
                status: statusFilter || undefined,
            }),
        placeholderData: (previous) => previous,
        enabled: canRead,
    });

    const { data, isLoading, isFetching, error } = query;

    const handleSearchName = (value: string) => {
        setNameFilter(value);
        setPage(0);
    };

    const handleStatusFilterChange = (value: AdminToolStatusFilter | "") => {
        setStatusFilter(value);
        setPage(0);
    };

    const handleClearFilters = () => {
        setNameFilter("");
        setStatusFilter("");
        setPage(0);
    };

    const handleOpenCreate = () => {
        setContent(<IncludeAdminToolModal />);
        setOpen();
    };

    const handleOpenDetail = (toolId: number) => {
        setContent(<ToolDetailModal toolId={toolId} />);
        setOpen();
    };

    const handleOpenEdit = (toolId: number) => {
        setContent(<IncludeAdminToolModal toolId={toolId} />);
        setOpen();
    };

    const handleOpenToggleStatus = (tool: AdminToolListItem) => {
        setContent(
            <ToggleAdminToolStatusModal
                toolId={tool.id}
                toolName={tool.name}
                nextStatus={tool.status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE"}
            />,
        );
        setOpen();
    };

    const handleOpenDelete = (tool: AdminToolListItem) => {
        setContent(<DeleteAdminToolModal toolId={tool.id} toolLabel={tool.name} />);
        setOpen();
    };

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    title="Gestão de ferramentas"
                    breadcrumbs={[
                        { label: "Home", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: "Ferramentas" },
                    ]}
                />

                {!canRead ? (
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ShieldX size={42} className="mb-3 text-j-gray-400" />
                        <h3 className="text-lg font-black text-j-blue-800">Acesso não permitido</h3>
                        <p className="mt-1 text-sm text-j-gray-600">
                            Seu usuário não possui permissão para visualizar a administração de ferramentas.
                        </p>
                    </section>
                ) : (
                    <section className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                                <ManagementBackButton />
                                <div>
                                <h3 className="text-base font-bold text-j-gray-700">
                                    Ferramentas cadastradas
                                </h3>
                                <p className="text-xs text-j-gray-500">
                                    Consulte e gerencie ferramentas vinculadas aos associados do clube.
                                </p>
                                </div>
                            </div>

                            {canCreate && (
                                <Button
                                    onClick={handleOpenCreate}
                                    className="h-11 shrink-0 gap-2"
                                >
                                    <Plus size={16} />
                                    <span className="hidden sm:inline">Cadastrar ferramenta</span>
                                    <span className="sm:hidden">Cadastrar</span>
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-3 lg:flex-row lg:items-center">
                            <div className="flex-1">
                                <InputSearch
                                    value={nameFilter}
                                    onSubmit={handleSearchName}
                                    submitOnChange
                                    isLoading={isFetching}
                                    label="Buscar ferramenta pelo nome"
                                    placeholder="Buscar ferramenta pelo nome..."
                                    className="h-10 border border-j-gray-200 bg-j-white py-2 pl-10 pr-10 text-sm font-normal text-j-gray-700 placeholder:text-j-gray-400 focus:border-j-yellow-400 focus:bg-j-white focus:text-j-gray-700"
                                    iconClassName="text-j-gray-400"
                                    clearButtonClassName="text-j-gray-400 hover:bg-j-gray-200 hover:text-j-blue-800"
                                />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <label htmlFor="admin-tool-status-filter" className="sr-only">
                                    Filtrar por status
                                </label>
                                <select
                                    id="admin-tool-status-filter"
                                    aria-label="Filtrar por status"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        handleStatusFilterChange(
                                            event.target.value as AdminToolStatusFilter | "",
                                        )
                                    }
                                    className="h-10 cursor-pointer rounded-lg border border-j-gray-200 bg-j-white px-3 py-2 text-sm font-medium text-j-gray-700 transition-colors focus:border-j-yellow-400 focus:outline-none"
                                >
                                    {ADMIN_TOOL_STATUS_FILTER_OPTIONS.map((option) => (
                                        <option key={option.value || "ALL"} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
                                        className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-j-gray-200 bg-j-white px-3 text-xs font-bold text-j-gray-600 transition-colors hover:border-j-gray-300 hover:bg-j-gray-100 hover:text-j-blue-800"
                                    >
                                        <RotateCcw size={14} />
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoading && (
                            <p className="text-sm text-j-gray-400">Carregando ferramentas...</p>
                        )}

                        {error && (
                            <div
                                role="alert"
                                className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                            >
                                <p>{error.message}</p>
                                <Button onClick={() => void query.refetch()} disabled={isFetching}>
                                    Tentar novamente
                                </Button>
                            </div>
                        )}

                        {!isLoading && !error && !data?.content.length && (
                            <p className="text-sm text-j-gray-400">
                                {hasActiveFilters
                                    ? "Nenhuma ferramenta encontrada para os filtros informados."
                                    : "Nenhuma ferramenta cadastrada."}
                            </p>
                        )}

                        {!isLoading && !error && Boolean(data?.content.length) && (
                            <div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                                <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(120px,0.6fr)_minmax(100px,0.5fr)_360px] items-center gap-3 border-b border-j-gray-200 bg-j-gray-100/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400 xl:grid">
                                    <span>Ferramenta</span>
                                    <span className="text-center">Associado</span>
                                    <span className="text-center">Status</span>
                                    <span className="text-center">Ações</span>
                                </div>

                                <div className="divide-y divide-j-gray-100">
                                    {data?.content.map((tool) => {
                                        const isArchived = tool.status === "ARCHIVED";
                                        const canToggleToolStatus =
                                            !isArchived &&
                                            (tool.status === "ACTIVE"
                                                ? canDeactivate
                                                : tool.status === "INACTIVE"
                                                    ? canActivate
                                                    : false);

                                        return (
                                            <div
                                                key={tool.id}
                                                className="flex flex-col gap-3 p-4 transition-colors hover:bg-blue-50/30 xl:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(120px,0.6fr)_minmax(100px,0.5fr)_360px] xl:items-center xl:gap-3"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    {tool.photoStorageKey ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={getMediaImageUrl(tool.photoStorageKey)}
                                                            alt={`Foto de ${tool.name}`}
                                                            className="h-16 w-28 shrink-0 rounded-lg border border-j-gray-200 object-cover sm:h-20 sm:w-36"
                                                        />
                                                    ) : (
                                                        <span className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg border border-j-gray-200 bg-j-blue-800 text-j-yellow-300 sm:h-20 sm:w-36">
                                                            <Wrench size={20} aria-hidden="true" />
                                                        </span>
                                                    )}

                                                    <div className="min-w-0">
                                                        <h4
                                                            className="truncate font-extrabold text-j-blue-800"
                                                            title={tool.name}
                                                        >
                                                            {tool.name}
                                                        </h4>
                                                        <p className="text-xs text-j-gray-500">
                                                            ID #{tool.id}
                                                        </p>
                                                        <span
                                                            className={twMerge(
                                                                "mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold xl:hidden",
                                                                TOOL_STATUS_BADGE_CLASS[tool.status],
                                                            )}
                                                        >
                                                            {TOOL_STATUS_LABEL[tool.status] ?? tool.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-sm font-semibold text-j-gray-600 xl:text-center">
                                                    <span className="mr-1 text-xs font-bold xl:hidden">
                                                        Associado:
                                                    </span>
                                                    ID #{tool.userId}
                                                </p>

                                                <span
                                                    className={twMerge(
                                                        "hidden w-fit justify-self-center rounded-full px-2.5 py-1 text-xs font-bold xl:inline-flex",
                                                        TOOL_STATUS_BADGE_CLASS[tool.status],
                                                    )}
                                                >
                                                    {TOOL_STATUS_LABEL[tool.status] ?? tool.status}
                                                </span>

                                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDetail(tool.id)}
                                                        aria-label={`Visualizar ${tool.name}`}
                                                        title="Visualizar"
                                                        className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2 text-xs font-bold text-j-blue-700 transition-colors hover:bg-blue-100"
                                                    >
                                                        <Eye size={15} aria-hidden="true" />
                                                        <span className="hidden sm:inline">Visualizar</span>
                                                    </button>

                                                    {canUpdate && !isArchived && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEdit(tool.id)}
                                                            aria-label={`Editar ${tool.name}`}
                                                            title="Editar"
                                                            className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-yellow-50 px-2 py-2 text-xs font-bold text-j-gray-700 transition-colors hover:bg-yellow-100"
                                                        >
                                                            <Pencil
                                                                size={15}
                                                                className="text-j-yellow-500"
                                                                aria-hidden="true"
                                                            />
                                                            <span className="hidden sm:inline">Editar</span>
                                                        </button>
                                                    )}

                                                    {canToggleToolStatus && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenToggleStatus(tool)}
                                                            aria-label={`${tool.status === "ACTIVE" ? "Desativar" : "Ativar"} ${tool.name}`}
                                                            title={tool.status === "ACTIVE" ? "Desativar" : "Ativar"}
                                                            className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-purple-50 px-2 py-2 text-xs font-bold text-purple-600 transition-colors hover:bg-purple-100"
                                                        >
                                                            <Power size={15} aria-hidden="true" />
                                                            <span className="hidden sm:inline">
                                                                {tool.status === "ACTIVE"
                                                                    ? "Desativar"
                                                                    : "Ativar"}
                                                            </span>
                                                        </button>
                                                    )}

                                                    {canDelete && !isArchived && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDelete(tool)}
                                                            aria-label={`Excluir ${tool.name}`}
                                                            title="Excluir"
                                                            className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-100"
                                                        >
                                                            <Trash2 size={15} aria-hidden="true" />
                                                            <span className="hidden sm:inline">Excluir</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {data && !error && (
                            <ListPagination
                                itemLabel="ferramenta"
                                isFetching={isFetching}
                                pagination={{
                                    pageIndex: data.number,
                                    pageSize,
                                    pageCount: data.totalPages,
                                    rowCount: data.totalElements,
                                    onChange: (next) => {
                                        setPage(next.pageSize !== pageSize ? 0 : next.pageIndex);
                                        setPageSize(next.pageSize);
                                    },
                                }}
                            />
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
