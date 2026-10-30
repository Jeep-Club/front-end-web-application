"use client";

import { Pencil, Send, Trash2 } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useModal } from "@/providers/ModalProvider";
import { publicationDraftActions } from "@/config/publicationDraftActions";
import { DraftPublicationActionModal } from "./DraftPublicationActionModal";
import type { PublicationListItem } from "./PublicationList";

export function DraftPublicationCardActions({ publication }: { publication: PublicationListItem }) {
    const permissions = useUserStore((state) => state.permissions);
    const { setContent, setOpen } = useModal();
    if (publication.status !== "DRAFT" || publication.type === "SERVICE") return null;
    const target = { ...publication, type: publication.type, status: publication.status };
    const config = publicationDraftActions[publication.type];
    const actions = [
        { action: "edit" as const, label: "Editar", icon: Pencil, className: "bg-yellow-50 text-j-gray-700 hover:bg-yellow-100" },
        { action: "publish" as const, label: "Publicar", icon: Send, className: "bg-blue-50 text-j-blue-700 hover:bg-blue-100" },
        { action: "delete" as const, label: "Excluir", icon: Trash2, className: "bg-red-50 text-red-500 hover:bg-red-100" },
    ].filter((entry) => hasPermission(permissions, "PUBLICATIONS", config[entry.action]));
    if (!actions.length) return null;
    return <div aria-label="Ações do rascunho" className={`mt-auto grid gap-2 border-t border-j-gray-200 p-4 ${actions.length === 3 ? "grid-cols-3" : actions.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {actions.map(({ action, label, icon: Icon, className }) => <button key={action} type="button" aria-label={`${label}: ${publication.title}`} title={label}
            onClick={() => { setContent(<DraftPublicationActionModal publication={target} action={action} />); setOpen(); }}
            className={`flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${className}`}>
            <Icon size={15} aria-hidden="true" className="hidden shrink-0 md:block" />{label}
        </button>)}
    </div>;
}