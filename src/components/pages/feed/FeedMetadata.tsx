import { CalendarDays, Clock, Phone } from "lucide-react";
import type { PublicationFeedItem, PublicationFeedDetail } from "@/schemas/publications/feed";
import { feedDate } from "./feedDisplay";

export function FeedMetadata({ publication }: { publication: PublicationFeedItem | PublicationFeedDetail }) {
    if (publication.type === "EVENT") {
        const labels = { OPEN: "Aberto", IN_PROGRESS: "Em andamento", FINISHED: "Encerrado", CANCELLED: "Cancelado" };
        const { startsAt, endsAt, status } = publication.details;
        return (
            <section aria-label="Horários e situação do evento" className="rounded-xl border border-input-border bg-background-secondary p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-primary">Horários do evento</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "OPEN" ? "bg-j-yellow-300 text-j-blue-900" : "bg-background text-primary"}`}>
                        {labels[status]}
                    </span>
                </div>
                <dl className="mt-3 divide-y divide-input-border border-t border-input-border">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 py-3 last:pb-0">
                        <dt className="contents"><CalendarDays size={22} aria-hidden="true" className="row-span-2 self-center text-secondary" /><span className="text-xs font-semibold text-secondary">Início</span></dt>
                        <dd className="col-start-2 text-sm font-bold text-primary"><time dateTime={startsAt}>{feedDate(startsAt)}</time></dd>
                    </div>
                    {endsAt && (
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 pt-3">
                            <dt className="contents"><Clock size={22} aria-hidden="true" className="row-span-2 self-center text-secondary" /><span className="text-xs font-semibold text-secondary">Término</span></dt>
                            <dd className="col-start-2 text-sm font-bold text-primary"><time dateTime={endsAt}>{feedDate(endsAt)}</time></dd>
                        </div>
                    )}
                </dl>
            </section>
        );
    }
    if (publication.type === "SERVICE") return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-j-gray-100 p-3 text-sm">
        <span className="font-bold text-j-blue-800">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(publication.details.amount)}</span>
        <a href={`tel:${publication.details.contactPhone.replace(/[^\d+]/g, "")}`} className="cursor-pointer rounded inline-flex items-center gap-1.5 text-j-gray-600 hover:text-j-blue-800 focus-visible:outline-2 focus-visible:outline-j-blue-800"><Phone size={15} aria-hidden="true" />{publication.details.contactPhone}</a>
    </div>;
    return null;
}
