"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/common/button";
import { CreatePublicationModal } from "@/components/pages/admin/publications/CreatePublicationModal";
import { DraftPublicationActionModal, type DraftPublicationTarget } from "@/components/pages/admin/publications/DraftPublicationActionModal";
import { publicationCreationTypes } from "@/config/publicationCreation";
import { feedTypeSchema } from "@/schemas/publications/feed";
import { getPublicationFeedDetailAction } from "@/server/actions/publications/feed";
import { getAdminEventAction } from "@/server/actions/publications/events";
import { getAdminNoticeAction } from "@/server/actions/publications/notices";
import { useUserStore } from "@/stores/userStore";
import { getActionFailure } from "@/utils/http/ActionError";
import { hasPermission } from "@/utils/permission/hasPermission";

interface Props {
    mode: "new" | "edit";
    id?: number;
}

/** Both full-page and intercepted routes use explicit destinations after closing. */
export function FeedFormRoute({ mode, id }: Props) {
    const router = useRouter();
    const params = useSearchParams();
    const permissions = useUserStore(state => state.permissions);
    const context = new URLSearchParams();
    for (const key of ["type", "publishedFrom", "publishedTo", "page"]) {
        const value = params.get(key);
        if (value) context.set(key, value);
    }
    const search = context.size ? `?${context}` : "";
    const back = `/feed${mode === "edit" && id ? `/${id}` : ""}${search}`;
    const close = () => {
        router.replace(back, { scroll: false });
        router.refresh();
    };

    if (mode === "edit" && id) return <EditFeedPublication id={id} onClose={close} back={back} />;

    const typeResult = feedTypeSchema.safeParse(params.get("type"));
    const initialType = typeResult.success ? typeResult.data : undefined;
    const types = publicationCreationTypes.filter(entry => hasPermission(permissions, "PUBLICATIONS", entry.action));
    if (!types.length || (initialType && !types.some(entry => entry.type === initialType))) {
        return <FormRouteState back={back} message="Você não tem permissão para criar esta publicação." />;
    }
    return <CreatePublicationModal initialType={initialType} publishEventImmediately onClose={close} />;
}

function EditFeedPublication({ id, onClose, back }: { id: number; onClose: () => void; back: string }) {
    const permissions = useUserStore(state => state.permissions);
    const detail = useQuery({
        queryKey: ["publications", "detail", id, permissions],
        queryFn: () => getPublicationFeedDetailAction(id),
        retry: false,
    });
    const type = detail.data?.type;
    const canEdit = type === "EVENT"
        ? hasPermission(permissions, "PUBLICATIONS", "EVENT_UPDATE") && hasPermission(permissions, "PUBLICATIONS", "EVENT_READ_ADMIN")
        : type === "NOTICE" && hasPermission(permissions, "PUBLICATIONS", "NOTICE_UPDATE") && hasPermission(permissions, "PUBLICATIONS", "NOTICE_READ");
    const editorial = useQuery<DraftPublicationTarget>({
        queryKey: ["publications", "feed", "editorial", id, type, permissions],
        enabled: canEdit,
        retry: false,
        queryFn: async () => {
            if (type === "EVENT") {
                const event = await getAdminEventAction(id);
                return { ...event, type: "EVENT", status: event.publicationStatus };
            }
            const notice = await getAdminNoticeAction(id);
            return { ...notice, type: "NOTICE" };
        },
    });

    if (detail.isError || editorial.isError) {
        const error = detail.error ?? editorial.error;
        return <FormRouteState back={back} message={getActionFailure(error)?.message ?? "Não foi possível carregar a publicação."} retry={() => {
            if (detail.isError) void detail.refetch();
            else void editorial.refetch();
        }} />;
    }
    if (detail.isPending) return <FormRouteState back={back} loading />;
    if (!canEdit) return <FormRouteState back={back} message="Você não tem permissão para editar esta publicação." />;
    if (editorial.isPending) return <FormRouteState back={back} loading />;
    if (editorial.data.status !== "PUBLISHED") return <FormRouteState back={back} message="Esta publicação não está disponível para edição no feed." />;
    return <DraftPublicationActionModal publication={editorial.data} action="edit" onClose={onClose} />;
}

function FormRouteState({ back, message, loading = false, retry }: { back: string; message?: string; loading?: boolean; retry?: () => void }) {
    return <section className="mx-auto my-6 max-w-3xl space-y-4 rounded-3xl border border-input-border bg-background p-6 text-primary shadow-sm">
        <h1 className="text-xl font-bold">Publicação</h1>
        <p role={loading ? "status" : "alert"}>{loading ? "Carregando publicação..." : message}</p>
        {retry && <Button onClick={retry}>Tentar novamente</Button>}
        <Link href={back} className="block w-fit cursor-pointer rounded text-j-blue-800 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus">Voltar ao feed</Link>
    </section>;
}
