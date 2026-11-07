import { CalendarDays, Phone } from "lucide-react";
import type { PublicationFeedItem, PublicationFeedDetail } from "@/schemas/publications/feed";
import { feedDate } from "./feedDisplay";

export function FeedMetadata({ publication }: { publication: PublicationFeedItem | PublicationFeedDetail }) {
    if (publication.type === "EVENT") {
        const labels = { OPEN: "Aberto", IN_PROGRESS: "Em andamento", FINISHED: "Encerrado", CANCELLED: "Cancelado" };
        return <div className="flex flex-col gap-1 rounded-xl bg-j-gray-100 p-3 text-xs text-j-gray-600"><span className="inline-flex items-center gap-2"><CalendarDays size={15} aria-hidden="true" />{feedDate(publication.details.startsAt)}</span><span>{labels[publication.details.status]}</span></div>;
    }
    if (publication.type === "SERVICE") return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-j-gray-100 p-3 text-sm">
        <span className="font-bold text-j-blue-800">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(publication.details.amount)}</span>
        <a href={`tel:${publication.details.contactPhone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 text-j-gray-600 hover:text-j-blue-800"><Phone size={15} aria-hidden="true" />{publication.details.contactPhone}</a>
    </div>;
    return null;
}