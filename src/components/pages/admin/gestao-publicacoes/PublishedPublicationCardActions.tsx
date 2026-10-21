"use client";

import { Archive, Flag, Pencil, Trash2, XCircle } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useModal } from "@/providers/ModalProvider";
import { availablePublishedActions } from "@/config/publicationPublishedActions";
import { DraftPublicationActionModal } from "./DraftPublicationActionModal";
import type { PublicationListItem } from "./PublicationList";

const buttons = {
    edit: { label: "Editar", icon: Pencil, color: "bg-yellow-50 text-j-gray-700 hover:bg-yellow-100" },
    archive: { label: "Arquivar", icon: Archive, color: "bg-blue-50 text-j-blue-700 hover:bg-blue-100" },
    cancel: { label: "Cancelar", icon: XCircle, color: "bg-red-50 text-red-500 hover:bg-red-100" },
    finish: { label: "Encerrar", icon: Flag, color: "bg-blue-50 text-j-blue-700 hover:bg-blue-100" },
    delete: { label: "Excluir", icon: Trash2, color: "bg-red-50 text-red-500 hover:bg-red-100" },
};

export function PublishedPublicationCardActions({ publication }: { publication: PublicationListItem }) {
    const permissions = useUserStore((state) => state.permissions);
    const { setContent, setOpen } = useModal();
    const actions = availablePublishedActions(publication, permissions);
    if (publication.status !== "PUBLISHED" || !actions.length) return null;
    const target = { ...publication, status: publication.status };
    return <div aria-label="Ações da publicação" className={`mt-auto grid gap-2 border-t border-j-gray-200 p-4 ${actions.length === 1 ? "grid-cols-1" : actions.length === 2 || actions.length === 4 ? "grid-cols-2" : "grid-cols-3"}`}>
        {actions.map((action) => {
            const { label, icon: Icon, color } = buttons[action];
            return <button key={action} type="button" aria-label={`${label}: ${publication.title}`} title={label}
                onClick={() => { setContent(<DraftPublicationActionModal publication={target} action={action} />); setOpen(); }}
                className={`flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 ${color}`}>
                <Icon size={15} className="shrink-0" aria-hidden="true" />{label}
            </button>;
        })}
    </div>;
}