"use client";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PaginationState } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/page-header";
import { useModal } from "@/providers/ModalProvider";
import { PublicationDeleteConfirmationModal } from "./PublicationDeleteConfirmationModal";
import { PublicationManagementView } from "./PublicationManagementView";

export default function AdminPublicationsPage({ publications, searchParams: query }: { publications: PageResponse<Publication>; searchParams: PublicationSearchParams }) {
    const router = useRouter(); const pathname = usePathname(); const current = useSearchParams(); const { setContent, setOpen } = useModal(); const [pending, startTransition] = useTransition();
    function replace(patch: Partial<PublicationSearchParams>, resetPage = false) { const params = new URLSearchParams(current.toString()); Object.entries(patch).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key)); if (resetPage) params.set("page", "0"); startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false })); }
    const clear = () => replace({ q: undefined, title: undefined, type: undefined, status: undefined, noticePriority: undefined, serviceCategory: undefined, createdFrom: undefined, createdTo: undefined, publishedFrom: undefined, publishedTo: undefined }, true);
    const remove = (item: Publication) => { setContent(<PublicationDeleteConfirmationModal publication={item} onDeleted={() => { const previous = publications.content.length === 1 && publications.number > 0 ? publications.number - 1 : publications.number; if (previous !== publications.number) replace({ page: String(previous) }); else router.refresh(); }} />); setOpen(); };
    return <div className="min-h-full w-full p-3 md:p-4"><div className="flex flex-col gap-4 pb-6"><PageHeader title={<>Gestão de publicações <span className="ml-2 text-sm font-normal text-j-gray-400">{publications.totalElements} publicação(ões)</span></>} breadcrumbs={[{ label: "Início", href: "/feed" }, { label: "Gestão Administrativa", href: "/admin" }, { label: "Publicações" }]} /><PublicationManagementView publications={publications.content} query={query} totalItems={publications.totalElements} totalPages={publications.totalPages} pageIndex={publications.number} pageSize={publications.size} isFetching={pending} onSearch={(q) => replace({ q: q || undefined }, true)} onFilter={(patch) => replace(patch, true)} onClear={clear} onPagination={(value: PaginationState) => replace({ page: String(value.pageSize === publications.size ? value.pageIndex : 0), size: String(value.pageSize) })} onSort={(field) => { const [active, direction] = query.sort?.split(",") ?? []; replace({ sort: active !== field ? `${field},asc` : direction === "asc" ? `${field},desc` : undefined }, true); }} onCreate={() => router.push("/admin/publications/new")} onView={(item) => router.push(`/admin/publications/${item.id.toString()}`)} onEdit={(item) => router.push(`/admin/publications/${item.id.toString()}/edit`)} onDelete={remove} /></div></div>;
}
