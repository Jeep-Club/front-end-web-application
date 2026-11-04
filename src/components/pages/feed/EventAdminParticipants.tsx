"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, UsersRound } from "lucide-react";
import { listEventParticipantsAction } from "@/server/actions/publications/event-participants";
import { Avatar } from "@/components/common/avatar";
import { getMediaImageUrl } from "@/utils/media/imageUrl";

const currency = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
const date = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export function EventAdminParticipants({ eventId }: { eventId: number }) {
    const query = useQuery({ queryKey: ["admin", "event-participants", eventId], queryFn: () => listEventParticipantsAction(eventId), staleTime: 10_000 });
    return <section aria-labelledby="admin-event-participants-title" className="rounded-2xl border border-j-gray-200 bg-white p-4 md:p-5">
        <div className="flex items-center gap-2"><UsersRound size={18} className="text-j-blue-800" aria-hidden="true" /><h3 id="admin-event-participants-title" className="font-extrabold text-j-blue-800">Participantes inscritos</h3></div>
        {query.isLoading && <p role="status" className="mt-4 text-sm text-j-gray-500">Carregando participantes...</p>}
        {query.isError && <div role="alert" className="mt-4 flex flex-col gap-2 text-sm text-red-700"><p>{query.error.message}</p><button type="button" onClick={() => void query.refetch()} className="self-start font-bold underline">Tentar novamente</button></div>}
        {query.data && query.data.length === 0 && <p className="mt-4 text-sm text-j-gray-500">Ainda não há participantes inscritos.</p>}
        {query.data && query.data.length > 0 && <ul className="mt-4 divide-y divide-j-gray-200">{query.data.map((participant) => {
            const charges = participant.charges;
            const paid = charges.length > 0 && charges.every((charge) => charge.status === "PAID");
            const paymentLabel = charges.length === 0 ? "Gratuito" : paid ? "Pago" : charges.some((charge) => charge.paymentStatus === "PENDING_VALIDATION") ? "Comprovante enviado" : "Pendente";
            const photo = participant.profilePhotoStorageKey ? getMediaImageUrl(participant.profilePhotoStorageKey) : null;
            const initials = (participant.name || "A").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]?.toLocaleUpperCase("pt-BR")).join("") || "A";
            return <li key={participant.registrationId ?? participant.userId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">{photo ? <Avatar src={photo} alt="" className="h-10 w-10 shrink-0 bg-j-gray-200" /> : <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-j-blue-800 text-xs font-extrabold text-white">{initials}</span>}<div className="min-w-0"><p className="truncate text-sm font-bold text-j-gray-800">{participant.name || `Associado #${participant.userId}`}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-j-gray-500"><CalendarClock size={13} aria-hidden="true" />Inscrição em {date(participant.registeredAt)}</p></div></div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end"><span className={`rounded-full px-3 py-1 text-xs font-bold ${paymentLabel === "Pago" ? "bg-emerald-100 text-emerald-800" : paymentLabel === "Gratuito" ? "bg-j-gray-100 text-j-gray-700" : "bg-amber-100 text-amber-900"}`}>{paymentLabel}</span>{charges.map((charge) => <span key={charge.memberChargeId ?? charge.chargeDefinitionId} className="text-xs text-j-gray-600">{charge.name}: {charge.amount == null ? "—" : currency(charge.amount)}</span>)}</div>
            </li>;
        })}</ul>}
    </section>;
}
