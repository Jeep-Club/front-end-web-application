"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    Archive,
    ArchiveRestore,
    Download,
    Eye,
    Power,
    RotateCcw,
    ShieldX,
    Trash2,
    User,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { PageHeader } from "@/components/common/page-header";
import TourHelpButton from "@/components/common/tour/TourHelpButton";
import { getDependentsTourSteps } from "@/config/tourSteps";
import { usePageTour } from "@/hooks/useTour";
import { Button } from "@/components/common/button";
import { InputSearch } from "@/components/common/input/input-search";
import { ListPagination } from "@/components/common/table/ListPagination";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { listDependentsAdminAction } from "@/server/actions/admin/dependents/list";
import { exportAdminDependentsAction } from "@/server/actions/admin/dependents/export";

import { DependentDetailModal } from "./DependentDetailModal";
import { LifecycleAdminDependentModal } from "./LifecycleAdminDependentModal";
import { DeleteAdminDependentModal } from "./DeleteAdminDependentModal";
import {
    ADMIN_DEPENDENT_RELATIONSHIP_FILTER_OPTIONS,
    ADMIN_DEPENDENT_STATUS_FILTER_OPTIONS,
    DEPENDENT_RELATIONSHIP_LABEL,
    DEPENDENT_STATUS_BADGE_CLASS,
    DEPENDENT_STATUS_LABEL,
    formatDependentBirthDate,
    formatDependentCpf,
    formatDependentPhone,
    getAdminDependentPhotoUrl,
} from "./dependentDisplay";

const DEFAULT_PAGE_SIZE = 10;

export default function DependentManagement() {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);

    const canRead = hasPermission(permissions, "DEPENDENTS", "DEPENDENT_READ");
    const canActivate = hasPermission(permissions, "DEPENDENTS", "DEPENDENT_ACTIVATE");
    const canDeactivate = hasPermission(permissions, "DEPENDENTS", "DEPENDENT_DEACTIVATE");
    const canArchive = hasPermission(permissions, "DEPENDENTS", "DEPENDENT_ARCHIVE");
    const canUnarchive = hasPermission(permissions, "DEPENDENTS", "DEPENDENT_UNARCHIVE");
    const canDelete = hasPermission(permissions, "DEPENDENTS", "DEPENDENT_DELETE");
    const canExport = hasPermission(permissions, "DEPENDENTS", "DEPENDENT_EXPORT");

    const { restartTour } = usePageTour({
        storageKey: "tour_completed_admin_dependents",
        steps: getDependentsTourSteps,
        autoStartOnFirstVisit: false,
        enabled: canRead,
    });

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [searchQuery, setSearchQuery] = useState("");
    const [relationshipFilter, setRelationshipFilter] = useState<DependentRelationshipType | "">("");
    const [statusFilter, setStatusFilter] = useState<AdminDependentStatus | "">("");
    const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("CSV");
    const [exportHistory, setExportHistory] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const hasActiveFilters = Boolean(
        searchQuery.trim() || relationshipFilter || statusFilter,
    );

    const query = useQuery({
        queryKey: [
            "admin",
            "dependents",
            {
                page,
                size: pageSize,
                q: searchQuery.trim() || undefined,
                relationshipType: relationshipFilter || undefined,
                status: statusFilter || undefined,
            },
        ],
        queryFn: () =>
            listDependentsAdminAction({
                page,
                size: pageSize,
                q: searchQuery.trim() || undefined,
                relationshipType: relationshipFilter || undefined,
                status: statusFilter || undefined,
            }),
        placeholderData: (previous) => previous,
        enabled: canRead,
    });

    const { data, isLoading, isFetching, error } = query;

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setPage(0);
    };

    const handleRelationshipChange = (value: DependentRelationshipType | "") => {
        setRelationshipFilter(value);
        setPage(0);
    };

    const handleStatusChange = (value: AdminDependentStatus | "") => {
        setStatusFilter(value);
        setPage(0);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setRelationshipFilter("");
        setStatusFilter("");
        setPage(0);
    };

    const handleOpenDetail = (dependent: AdminDependentItem) => {
        setContent(
            <DependentDetailModal
                dependentId={dependent.id}
                userId={dependent.userId}
                initialOwnerName={dependent.ownerName}
            />,
        );
        setOpen();
    };

    const handleOpenLifecycle = (
        dependent: AdminDependentItem,
        action: AdminDependentLifecycleAction,
    ) => {
        setContent(
            <LifecycleAdminDependentModal
                dependentId={dependent.id}
                userId={dependent.userId}
                dependentName={dependent.name}
                action={action}
            />,
        );
        setOpen();
    };

    const handleOpenDelete = (dependent: AdminDependentItem) => {
        setContent(
            <DeleteAdminDependentModal
                dependentId={dependent.id}
                userId={dependent.userId}
                dependentName={dependent.name}
            />,
        );
        setOpen();
    };

    const handleExport = async () => {
        if (!canExport || isExporting) return;
        setIsExporting(true);
        try {
            const file = await exportAdminDependentsAction({
                format: exportFormat,
                history: exportHistory,
                name: searchQuery.trim() || undefined,
                status: statusFilter || undefined,
            });
            const bytes = Uint8Array.from(atob(file.base64), (character) =>
                character.charCodeAt(0),
            );
            const url = URL.createObjectURL(
                new Blob([bytes], { type: file.contentType }),
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = file.filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast.success(
                `Relatório ${exportFormat} ${exportHistory ? "do histórico " : ""}gerado com sucesso!`,
            );
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Não foi possível exportar os dependentes.",
            );
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    id="tour-dependents-header"
                    title="Gestão de dependentes"
                    breadcrumbs={[
                        { label: "Home", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: "Dependentes" },
                    ]}
                    actions={
                        canRead ? (
                            <TourHelpButton
                                onClick={restartTour}
                                label="Como usar?"
                            />
                        ) : undefined
                    }
                />

                {!canRead ? (
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ShieldX size={42} className="mb-3 text-j-gray-400" />
                        <h3 className="text-lg font-black text-j-blue-800">
                            Acesso não permitido
                        </h3>
                        <p className="mt-1 text-sm text-j-gray-600">
                            Seu usuário não possui permissão para visualizar a administração de dependentes.
                        </p>
                    </section>
                ) : (
                    <section className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h3 className="text-base font-bold text-j-gray-700">
                                    Dependentes cadastrados
                                </h3>
                                <p className="text-xs text-j-gray-500">
                                    Consulte familiares e convidados vinculados aos associados, audite fotos 3x4 e gerencie situações cadastrais.
                                </p>
                            </div>

                            {canExport && (
                                <div
                                    id="tour-dependents-export"
                                    className="flex flex-wrap items-center gap-2 rounded-xl border border-j-gray-200 bg-j-gray-100/60 p-2"
                                >
                                    <label htmlFor="admin-dependent-export-format" className="sr-only">
                                        Formato de exportação
                                    </label>
                                    <select
                                        id="admin-dependent-export-format"
                                        aria-label="Formato de exportação"
                                        value={exportFormat}
                                        onChange={(e) => setExportFormat(e.target.value as "CSV" | "PDF")}
                                        className="h-9 cursor-pointer rounded-lg border border-j-gray-200 bg-j-white px-2.5 text-xs font-bold text-j-gray-700 focus:border-j-yellow-400 focus:outline-none"
                                    >
                                        <option value="CSV">CSV</option>
                                        <option value="PDF">PDF</option>
                                    </select>

                                    <label className="flex cursor-pointer items-center gap-1.5 px-2 text-xs font-medium text-j-gray-700 select-none">
                                        <input
                                            type="checkbox"
                                            checked={exportHistory}
                                            onChange={(e) => setExportHistory(e.target.checked)}
                                            className="h-3.5 w-3.5 rounded border-j-gray-300 text-j-blue-800 focus:ring-j-blue-800"
                                        />
                                        Histórico de exclusões
                                    </label>

                                    <Button
                                        type="button"
                                        onClick={() => void handleExport()}
                                        disabled={isExporting}
                                        className="h-9 gap-1.5 px-3 text-xs"
                                    >
                                        <Download size={14} />
                                        {isExporting ? "Exportando..." : "Exportar"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div
                            id="tour-dependents-filters"
                            className="flex flex-col gap-3 rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-3 lg:flex-row lg:items-center"
                        >
                            <div className="flex-1">
                                <InputSearch
                                    value={searchQuery}
                                    onSubmit={handleSearch}
                                    submitOnChange
                                    isLoading={isFetching}
                                    label="Buscar dependente por nome, titular, CPF ou telefone"
                                    placeholder="Buscar por nome do dependente, nome do titular, CPF ou telefone..."
                                    className="h-10 border border-j-gray-200 bg-j-white py-2 pl-10 pr-10 text-sm font-normal text-j-gray-700 placeholder:text-j-gray-400 focus:border-j-yellow-400 focus:bg-input-bg-focus focus:text-j-gray-700"
                                    iconClassName="text-j-gray-400"
                                    clearButtonClassName="text-j-gray-400 hover:bg-j-gray-200 hover:text-j-blue-800"
                                />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <label htmlFor="admin-dependent-relationship-filter" className="sr-only">
                                    Filtrar por parentesco
                                </label>
                                <select
                                    id="admin-dependent-relationship-filter"
                                    aria-label="Filtrar por parentesco"
                                    value={relationshipFilter}
                                    onChange={(e) =>
                                        handleRelationshipChange(
                                            e.target.value as DependentRelationshipType | "",
                                        )
                                    }
                                    className="h-10 cursor-pointer rounded-lg border border-j-gray-200 bg-j-white px-3 py-2 text-sm font-medium text-j-gray-700 transition-colors focus:border-j-yellow-400 focus:outline-none"
                                >
                                    {ADMIN_DEPENDENT_RELATIONSHIP_FILTER_OPTIONS.map((option) => (
                                        <option key={option.value || "ALL"} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <label htmlFor="admin-dependent-status-filter" className="sr-only">
                                    Filtrar por status
                                </label>
                                <select
                                    id="admin-dependent-status-filter"
                                    aria-label="Filtrar por status"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        handleStatusChange(
                                            e.target.value as AdminDependentStatus | "",
                                        )
                                    }
                                    className="h-10 cursor-pointer rounded-lg border border-j-gray-200 bg-j-white px-3 py-2 text-sm font-medium text-j-gray-700 transition-colors focus:border-j-yellow-400 focus:outline-none"
                                >
                                    {ADMIN_DEPENDENT_STATUS_FILTER_OPTIONS.map((option) => (
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

                        <div id="tour-dependents-list">
                            {isLoading && (
                                <p className="text-sm text-j-gray-400">
                                    Carregando dependentes...
                                </p>
                            )}

                            {error && (
                                <div
                                    role="alert"
                                    className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                >
                                    <p>{error.message}</p>
                                    <Button
                                        onClick={() => void query.refetch()}
                                        disabled={isFetching}
                                    >
                                        Tentar novamente
                                    </Button>
                                </div>
                            )}

                            {!isLoading && !error && !data?.content.length && (
                                <p className="text-sm text-j-gray-400">
                                    {hasActiveFilters
                                        ? "Nenhum dependente encontrado para os filtros informados."
                                        : "Nenhum dependente cadastrado."}
                                </p>
                            )}

                            {!isLoading && !error && Boolean(data?.content.length) && (
                                <div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                                    <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(150px,0.9fr)_minmax(140px,0.8fr)_minmax(100px,0.5fr)_380px] items-center gap-3 border-b border-j-gray-200 bg-j-gray-100/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400 xl:grid">
                                        <span>Dependente</span>
                                        <span>Titular (Associado)</span>
                                        <span>CPF / Telefone</span>
                                        <span className="text-center">Status</span>
                                        <span className="text-center">Ações</span>
                                    </div>

                                    <div className="divide-y divide-j-gray-100">
                                        {data?.content.map((dependent, index) => {
                                            const isArchived = dependent.status === "ARCHIVED";
                                            const photoUrl = getAdminDependentPhotoUrl(dependent);

                                            const canToggleStatus =
                                                !isArchived &&
                                                (dependent.status === "ACTIVE"
                                                    ? canDeactivate
                                                    : dependent.status === "INACTIVE"
                                                        ? canActivate
                                                        : false);

                                            const canToggleArchive = isArchived
                                                ? canUnarchive
                                                : canArchive;

                                            return (
                                                <div
                                                    key={dependent.id}
                                                    className="flex flex-col gap-3 p-4 transition-colors hover:bg-blue-50/30 xl:grid xl:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.9fr)_minmax(140px,0.8fr)_minmax(100px,0.5fr)_380px] xl:items-center xl:gap-3"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        {photoUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={photoUrl}
                                                                alt={`Foto de ${dependent.name}`}
                                                                className="h-16 w-12 shrink-0 rounded-lg border border-j-gray-200 object-cover"
                                                            />
                                                        ) : (
                                                            <span className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg border border-j-gray-200 bg-j-blue-800 text-j-yellow-300">
                                                                <User size={18} aria-hidden="true" />
                                                            </span>
                                                        )}

                                                        <div className="min-w-0">
                                                            <h4
                                                                className="truncate font-extrabold text-j-blue-800"
                                                                title={dependent.name}
                                                            >
                                                                {dependent.name}
                                                            </h4>
                                                            <p className="text-xs text-j-gray-500">
                                                                {DEPENDENT_RELATIONSHIP_LABEL[
                                                                    dependent.relationshipType
                                                                ] ?? dependent.relationshipType}{" "}
                                                                • Nasc.:{" "}
                                                                {formatDependentBirthDate(
                                                                    dependent.birthDate,
                                                                )}
                                                            </p>
                                                            <p className="text-[11px] text-j-gray-400">
                                                                ID #{dependent.id}
                                                            </p>
                                                            <span
                                                                className={twMerge(
                                                                    "mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold xl:hidden",
                                                                    DEPENDENT_STATUS_BADGE_CLASS[
                                                                        dependent.status
                                                                    ],
                                                                )}
                                                            >
                                                                {DEPENDENT_STATUS_LABEL[
                                                                    dependent.status
                                                                ] ?? dependent.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-j-gray-700">
                                                            <span className="mr-1 text-xs font-bold text-j-gray-400 xl:hidden">
                                                                Titular:
                                                            </span>
                                                            {dependent.ownerName || `Associado #${dependent.userId}`}
                                                        </p>
                                                        <p className="text-xs text-j-gray-500">
                                                            ID #{dependent.userId}
                                                        </p>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-j-gray-700">
                                                            CPF: {formatDependentCpf(dependent.cpf)}
                                                        </p>
                                                        <p className="text-xs text-j-gray-500">
                                                            Tel.:{" "}
                                                            {formatDependentPhone(
                                                                dependent.phoneNumber,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={twMerge(
                                                            "hidden w-fit justify-self-center rounded-full px-2.5 py-1 text-xs font-bold xl:inline-flex",
                                                            DEPENDENT_STATUS_BADGE_CLASS[
                                                                dependent.status
                                                            ],
                                                        )}
                                                    >
                                                        {DEPENDENT_STATUS_LABEL[dependent.status] ??
                                                            dependent.status}
                                                    </span>

                                                    <div
                                                        id={
                                                            index === 0
                                                                ? "tour-dependents-actions"
                                                                : undefined
                                                        }
                                                        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDetail(dependent)}
                                                            aria-label={`Visualizar ${dependent.name}`}
                                                            title="Visualizar"
                                                            className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2 text-xs font-bold text-j-blue-700 transition-colors hover:bg-blue-100"
                                                        >
                                                            <Eye size={15} aria-hidden="true" />
                                                            <span className="hidden sm:inline">
                                                                Visualizar
                                                            </span>
                                                        </button>

                                                        {canToggleStatus && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenLifecycle(
                                                                        dependent,
                                                                        dependent.status === "ACTIVE"
                                                                            ? "DISABLE"
                                                                            : "ENABLE",
                                                                    )
                                                                }
                                                                aria-label={`${dependent.status === "ACTIVE" ? "Desativar" : "Ativar"} ${dependent.name}`}
                                                                title={
                                                                    dependent.status === "ACTIVE"
                                                                        ? "Desativar"
                                                                        : "Ativar"
                                                                }
                                                                className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-purple-50 px-2 py-2 text-xs font-bold text-purple-600 transition-colors hover:bg-purple-100"
                                                            >
                                                                <Power size={15} aria-hidden="true" />
                                                                <span className="hidden sm:inline">
                                                                    {dependent.status === "ACTIVE"
                                                                        ? "Desativar"
                                                                        : "Ativar"}
                                                                </span>
                                                            </button>
                                                        )}

                                                        {canToggleArchive && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenLifecycle(
                                                                        dependent,
                                                                        isArchived
                                                                            ? "UNARCHIVE"
                                                                            : "ARCHIVE",
                                                                    )
                                                                }
                                                                aria-label={`${isArchived ? "Desarquivar" : "Arquivar"} ${dependent.name}`}
                                                                title={
                                                                    isArchived
                                                                        ? "Desarquivar"
                                                                        : "Arquivar"
                                                                }
                                                                className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-2 py-2 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
                                                            >
                                                                {isArchived ? (
                                                                    <ArchiveRestore
                                                                        size={15}
                                                                        aria-hidden="true"
                                                                    />
                                                                ) : (
                                                                    <Archive
                                                                        size={15}
                                                                        aria-hidden="true"
                                                                    />
                                                                )}
                                                                <span className="hidden sm:inline">
                                                                    {isArchived
                                                                        ? "Desarquivar"
                                                                        : "Arquivar"}
                                                                </span>
                                                            </button>
                                                        )}

                                                        {canDelete && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenDelete(dependent)
                                                                }
                                                                aria-label={`Excluir ${dependent.name}`}
                                                                title="Excluir"
                                                                className="flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-100"
                                                            >
                                                                <Trash2 size={15} aria-hidden="true" />
                                                                <span className="hidden sm:inline">
                                                                    Excluir
                                                                </span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {data && !error && (
                            <ListPagination
                                itemLabel="dependente"
                                isFetching={isFetching}
                                pagination={{
                                    pageIndex: data.number,
                                    pageSize,
                                    pageCount: data.totalPages,
                                    rowCount: data.totalElements,
                                    onChange: (next) => {
                                        setPage(
                                            next.pageSize !== pageSize ? 0 : next.pageIndex,
                                        );
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
