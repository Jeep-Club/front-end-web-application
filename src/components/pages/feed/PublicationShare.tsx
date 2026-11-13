"use client";

import { useState } from "react";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { Link2, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

export function PublicationShare({ id, title, compact = false }: { id: number; title: string; compact?: boolean }) {
    const [portalContainer, setPortalContainer] = useState<HTMLDialogElement | null>(null);
    const link = `/feed?publication=${id}`;

    return (
        <DialogTrigger>
            <Button ref={element => { if (element) setPortalContainer(element.closest("dialog")); }} aria-label={`Compartilhar: ${title}`} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-j-gray-100 px-3 text-sm font-bold text-j-blue-800 hover:bg-j-gray-200 focus-visible:outline-2">
                <Share2 size={16} aria-hidden="true" />
                <span className={compact ? "hidden sm:inline" : undefined}>Compartilhar</span>
            </Button>
            <Popover placement="top end" offset={8} UNSTABLE_portalContainer={portalContainer ?? undefined} className="feed-period-popover z-[100] w-64 max-w-[calc(100vw-2rem)] data-[placement=top]:origin-bottom-right data-[placement=bottom]:origin-top-right rounded-xl border border-input-border bg-background p-2 text-primary shadow-lg">
                <Dialog aria-label="Opções de compartilhamento" className="grid gap-1 outline-none">
                    {({ close }) => (
                        <>
                            <button type="button" className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm hover:bg-background-secondary focus-visible:outline-2" onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(new URL(link, window.location.origin).href);
                                    toast.success("Link copiado.");
                                    close();
                                } catch {
                                    toast.error("Não foi possível copiar o link.");
                                }
                            }}>
                                <Link2 size={17} aria-hidden="true" /> Copiar link da publicação
                            </button>
                            <a href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${new URL(link, window.location.origin).href}`)}`} target="_blank" rel="noopener noreferrer" onClick={close} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm hover:bg-background-secondary focus-visible:outline-2">
                                <FaWhatsapp size={19} aria-hidden="true" className="shrink-0 text-green-600 dark:text-green-400" /> Compartilhar no WhatsApp
                            </a>
                        </>
                    )}
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
}
