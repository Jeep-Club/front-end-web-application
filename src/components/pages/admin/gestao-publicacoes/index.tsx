"use client";
import { useModal } from "@/providers/ModalProvider";
import { publicationCreationTypes } from "@/config/publicationCreation";
import { CreatePublicationModal } from "./CreatePublicationModal";
import { Button } from "@/components/common/button";
import { useQuery } from "@tanstack/react-query";
import { listAdminPublicationsAction } from "@/actions/publications/list";
import { publicationStatusOptions, parsePublicationStatus } from "@/utils/publications/statusFilters";
import { PublicationList } from "./PublicationList";
import { parsePublicationPagination, updatePublicationPagination } from "@/utils/publications/pagination";


import { usePathname, useSearchParams } from "next/navigation";
import { resolvePublicationTypes, togglePublicationType } from "@/utils/publications/typeFilters";
import { CalendarDays, Megaphone, Wrench, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { publicationManagementSections } from "@/config/publicationManagement";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";

const sectionIcons = { events: CalendarDays, notices: Megaphone, services: Wrench };

export default function PublicationManagement() {
    const permissions = useUserStore((state) => state.permissions);
    const { setContent, setOpen } = useModal();
    const canCreate = publicationCreationTypes.some((entry) => hasPermission(permissions, "PUBLICATIONS", entry.action));
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const pagination = parsePublicationPagination(searchParams);
    const status = parsePublicationStatus(searchParams.get("status"));
    const sections = publicationManagementSections.filter((section) =>
        section.readActions.some((action) => hasPermission(permissions, "PUBLICATIONS", action)),
    );
    const selectedTypes = resolvePublicationTypes(
        sections.map((section) => section.type),
        searchParams.getAll("type"),
    );
    const selectedSections = sections.filter((section) => selectedTypes.includes(section.type));

    const publications = useQuery({
        queryKey: ["publications", "admin", selectedTypes, status, pagination.pageIndex, pagination.pageSize, permissions],
        queryFn: () => listAdminPublicationsAction({ types: selectedTypes, status, page: pagination.pageIndex, size: pagination.pageSize }),
        enabled: selectedTypes.length > 0,
        refetchOnWindowFocus: false,
    });

    function toggleType(type: string) {
        const nextTypes = togglePublicationType(selectedTypes, type);
        if (nextTypes === selectedTypes) return;
        const params = new URLSearchParams(searchParams.toString());
        params.delete("type");
        sections.filter((section) => nextTypes.includes(section.type)).forEach((section) => params.append("type", section.type));
        params.delete("page");
        window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    }

    return (
        <div className="min-h-full w-full p-3 pb-8 md:p-4">
            <div className="flex w-full flex-col gap-6">
                <PageHeader
                    title="Gestão de publicações"
                    breadcrumbs={[
                        { label: "Home", href: "/feed" },
                        { label: "Gestão Administrativa", href: "/admin" },
                        { label: "Gestão de publicações" },
                    ]}
                />
                {sections.length > 0 || canCreate ? (
                    <>
                        <nav aria-label="Filtrar por tipo de publicação" className={`grid gap-2 md:gap-3 ${sections.length === 3 ? "grid-cols-3" : sections.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                            {sections.map((section) => {
                                const Icon = sectionIcons[section.key as keyof typeof sectionIcons];
                                const selected = selectedTypes.includes(section.type);
                                return (
                                    <button
                                        key={section.key}
                                        type="button"
                                        title={section.title}
                                        aria-pressed={selected}
                                        aria-controls="publication-management-content"
                                        aria-disabled={selected && selectedTypes.length === 1}
                                        onClick={() => toggleType(section.type)}
                                        className={`flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-colors md:flex-row md:justify-center md:p-4 ${selected ? "border-j-blue-800 bg-j-blue-800 text-j-white shadow-md" : "border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-blue-300 hover:text-j-blue-800"}`}
                                    >
                                        <Icon size={20} aria-hidden="true" className="shrink-0" />
                                        <span className="text-xs font-bold md:text-sm">{section.title}</span>
                                    </button>
                                );
                            })}
                        </nav>
                        <section id="publication-management-content" aria-labelledby="publication-management-title" className="rounded-xl border border-j-gray-200 bg-j-white p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <h2 id="publication-management-title" className="text-lg font-bold text-j-blue-800">{selectedSections.map((section) => section.title).join(" · ") || "Publicações"}</h2>
                                {canCreate && (
                                    <Button onClick={() => { setContent(<CreatePublicationModal />); setOpen(); }} className="w-full sm:w-auto">
                                        <Plus size={18} />
                                        Criar publicação
                                    </Button>
                                )}
                            </div>
                            <div className="mt-5 flex flex-col gap-2 sm:max-w-xs">
                                <label htmlFor="publication-status-filter" className="text-sm font-bold text-j-gray-700">Estado da publicação</label>
                                <select
                                    id="publication-status-filter"
                                    value={status}
                                    onChange={(event) => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.set("status", event.target.value);
                                        params.delete("page");
                                        window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
                                    }}
                                    aria-controls="publication-status-results"
                                    className="w-full rounded-lg border border-j-gray-200 bg-j-white px-3 py-2.5 text-sm text-j-gray-700 focus-visible:outline-2 focus-visible:outline-j-blue-800"
                                >
                                    {publicationStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                            <div id="publication-status-results">
                            <PublicationList
                                page={publications.data}
                                isLoading={publications.isLoading}
                                isFetching={publications.isFetching}
                                error={publications.error?.message}
                                pageIndex={pagination.pageIndex}
                                pageSize={pagination.pageSize}
                                onPaginationChange={(next) => {
                                    const params = updatePublicationPagination(new URLSearchParams(searchParams.toString()), next);
                                    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
                                }}
                            />
                            </div>
                        </section>
                    </>
                ) : (
                    <p className="text-sm text-j-gray-600">Nenhuma área de publicações disponível para suas permissões.</p>
                )}
            </div>
        </div>
    );
}