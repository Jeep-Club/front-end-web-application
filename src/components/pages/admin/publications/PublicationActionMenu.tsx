"use client";

import { MoreHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { getAdminEventAction, getAdminEventDashboardAction } from "@/server/actions/publications/events";
import { getAdminNoticeAction } from "@/server/actions/publications/notices";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";
import { availablePublishedActions } from "@/config/publicationPublishedActions";
import { publicationDraftActions } from "@/config/publicationDraftActions";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { DraftPublicationActionModal, type DraftPublicationTarget } from "./DraftPublicationActionModal";

type Action = "edit" | "publish" | "archive" | "cancel" | "finish" | "delete";
const labels: Record<Action, string> = { edit: "Editar", publish: "Publicar", archive: "Arquivar", cancel: "Cancelar evento", finish: "Encerrar evento", delete: "Excluir" };

/** Load the full resource before editing a summary, including known event locks. */
export function PublicationActionMenu({ publication, href, complete = false, agendaLocked = false, returnHref, allowActions = true }: { publication: DraftPublicationTarget; href?: string; complete?: boolean; agendaLocked?: boolean; returnHref?: string; allowActions?: boolean }) {
    const trigger = useRef<HTMLButtonElement>(null);
    const [loading, setLoading] = useState(false);
    const permissions = useUserStore(state => state.permissions);
    const { setContent, setOpen } = useModal();
    const can = (permission: string) => hasPermission(permissions, "PUBLICATIONS", permission);
    const actions: Action[] = !allowActions ? [] : availablePublishedActions({ type: publication.type, status: publication.status ?? "", eventStatus: publication.eventStatus }, permissions);
    if (allowActions && publication.status === "DRAFT" && publication.type !== "SERVICE") {
        const config = publicationDraftActions[publication.type];
        if (can(config.edit) && !actions.includes("edit")) actions.unshift("edit");
        if (can(config.publish)) actions.splice(actions.includes("edit") ? 1 : 0, 0, "publish");
    }
    if (!href && !actions.length) return null;
    return <MenuTrigger>
        <Button ref={trigger} isDisabled={loading} aria-busy={loading} aria-label={`Ações: ${publication.title}`} className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg text-primary hover:bg-background-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus"><MoreHorizontal size={20} aria-hidden="true" /></Button>
        <Popover placement="bottom end" className="z-[100] min-w-44 rounded-lg border border-input-border bg-background p-1 text-primary shadow-lg outline-none">
            <Menu aria-label={`Ações de ${publication.title}`} className="outline-none" onAction={async key => {
                if (key === "access") return;
                const action = key as Action;
                let target = publication;
                let locked = agendaLocked;
                try {
                    if (action === "edit" && !complete) {
                        setLoading(true);
                        if (publication.type === "EVENT") {
                            const event = await getAdminEventAction(publication.id);
                            target = { ...event, type: "EVENT", status: event.publicationStatus };
                            if (can("EVENT_ADMIN_DASHBOARD_READ")) {
                                const dashboard = await getAdminEventDashboardAction(publication.id).catch(() => null);
                                locked = !!dashboard && !!(dashboard.registrations.length || dashboard.financial.length);
                            }
                        } else if (publication.type === "NOTICE") {
                            const notice = await getAdminNoticeAction(publication.id);
                            target = { ...notice, type: "NOTICE" };
                        }
                    }
                    if (action === "edit" && target.status === "ARCHIVED") {
                        toast.error("Esta publicação foi arquivada e não pode mais ser editada.");
                        return;
                    }
                    setContent(<DraftPublicationActionModal publication={target} action={action} returnHref={returnHref} agendaLocked={locked} returnFocus={trigger.current} />);
                    setOpen();
                } catch {
                    toast.error("Não foi possível carregar a publicação. Tente novamente.");
                } finally {
                    setLoading(false);
                }
            }}>
                {href && <MenuItem href={href} id="access" className="block cursor-pointer rounded-md px-3 py-2 text-sm font-medium outline-none data-[focused]:bg-background-tertiary data-[hovered]:bg-background-tertiary">Acessar</MenuItem>}
                {actions.map(action => <MenuItem key={action} id={action} className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium outline-none data-[focused]:bg-background-tertiary data-[hovered]:bg-background-tertiary ${action === "delete" || action === "cancel" ? "text-input-error-text" : "text-primary"}`}>{labels[action]}</MenuItem>)}
            </Menu>
        </Popover>
    </MenuTrigger>;
}
