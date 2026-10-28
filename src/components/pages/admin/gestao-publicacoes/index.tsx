"use client";
import { Button } from "@/components/common/button";
import { publicationCreationTypes } from "@/config/publicationCreation";
import { useModal } from "@/providers/ModalProvider";
import { listAdminPublicationsAction } from "@/server/actions/publications/list";
import { parsePublicationPagination,updatePublicationPagination } from "@/utils/publications/pagination";
import { parsePublicationStatus,publicationStatusOptions } from "@/utils/publications/statusFilters";
import { useQuery } from "@tanstack/react-query";
import { CreatePublicationModal } from "./CreatePublicationModal";
import { PublicationList } from "./PublicationList";

import { PageHeader } from "@/components/common/page-header";
import { ManagementBackButton } from "@/components/pages/admin/ManagementBackButton";
import { publicationManagementSections } from "@/config/publicationManagement";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { resolvePublicationTypes } from "@/utils/publications/typeFilters";
import { CalendarDays,LayoutGrid,Megaphone,Plus,Wrench } from "lucide-react";
import { usePathname,useSearchParams } from "next/navigation";

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
    const allTypesSelected = sections.length > 0 && selectedTypes.length === sections.length;
    const orderedSections = [...sections].sort((a, b) => ["SERVICE", "NOTICE", "EVENT"].indexOf(a.type) - ["SERVICE", "NOTICE", "EVENT"].indexOf(b.type));
    const selectedSections = sections.filter((section) => selectedTypes.includes(section.type));

    const publications = useQuery({
        queryKey: ["publications", "admin", selectedTypes, status, pagination.pageIndex, pagination.pageSize, permissions],
        queryFn: () => listAdminPublicationsAction({ types: selectedTypes, status, page: pagination.pageIndex, size: pagination.pageSize }),
        enabled: selectedTypes.length > 0,
        refetchOnWindowFocus: false,
    });

    function selectType(type?: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("type");
        if (type) params.append("type", type);
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
                        <nav aria-label="Filtrar por tipo de publicação" className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                            <button type="button" aria-pressed={allTypesSelected} aria-controls="publication-management-content" onClick={() => selectType()} className={`flex min-h-14 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 p-3 text-sm font-bold transition-colors ${allTypesSelected ? "border-j-blue-800 bg-j-blue-800 text-j-white shadow-md" : "border-j-gray-200 bg-j-white text-j-gray-600 hover:border-j-blue-300 hover:text-j-blue-800"}`}><LayoutGrid size={20} aria-hidden="true" />Todos</button>
                            {orderedSections.map((section) => {
                                const Icon = sectionIcons[section.key as keyof typeof sectionIcons];
                                const selected = !allTypesSelected && selectedTypes.includes(section.type);
                                return (
                                    <button
                                        key={section.key}
                                        type="button"
                                        title={section.title}
                                        aria-pressed={selected}
                                        aria-controls="publication-management-content"
                                        onClick={() => selectType(section.type)}
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
                                <div className="flex min-w-0 items-center gap-3">
                                    <ManagementBackButton />
                                    <h2 id="publication-management-title" className="text-center text-lg font-bold text-j-blue-800 sm:text-left">{selectedSections.map((section) => section.title).join(" · ") || "Publicações"}</h2>
                                </div>
                                {canCreate && (
                                    <Button onClick={() => { setContent(<CreatePublicationModal />); setOpen(); }} className="w-full sm:w-auto">
                                        <Plus size={18} />
                                        Criar publicação
                                    </Button>
                                )}
                            </div>
                            <fieldset className="mt-5 w-full min-w-0">
                                <legend className="mb-3 text-base font-bold text-j-gray-700">Estado da publicação</legend>
                                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {publicationStatusOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            aria-pressed={status === option.value}
                                            aria-controls="publication-status-results"
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams.toString());
                                                params.set("status", option.value);
                                                params.delete("page");
                                                window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
                                            }}
                                            className={`min-h-14 w-full cursor-pointer rounded-xl border-2 px-4 py-3 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${status === option.value ? "border-j-blue-800 bg-j-blue-800 text-j-white shadow-sm" : "border-j-gray-300 bg-j-white text-j-gray-700 hover:border-j-blue-800 hover:bg-j-gray-100"}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
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
