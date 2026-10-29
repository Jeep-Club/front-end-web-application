import { ChevronDown, UsersRound } from "lucide-react";
import { Avatar } from "@/components/common/avatar";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import type { PublicationFeedDetail, PublicationFeedItem } from "@/schemas/publications/feed";

type EventDetails = Extract<PublicationFeedItem | PublicationFeedDetail, { type: "EVENT" }>["details"];
type Participant = NonNullable<EventDetails["participants"]>[number];

function participantPhoto(participant: Participant) {
    const photo = participant.profilePhotoStorageKey
        ?? participant.profilePhotoUrl
        ?? participant.photoStorageKey
        ?? participant.photoUrl;

    return photo ? getMediaImageUrl(photo) : null;
}

function participantInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => Array.from(part)[0]?.toLocaleUpperCase("pt-BR"))
        .join("");
}

function ParticipantAvatar({ participant, compact = false }: { participant: Participant; compact?: boolean }) {
    const photo = participantPhoto(participant);
    const size = compact ? "h-8 w-8" : "h-9 w-9";
    return photo
        ? <Avatar src={photo} alt="" className={`${size} border-2 border-j-white bg-j-gray-200`} />
        : <span aria-hidden="true" className={`flex ${size} items-center justify-center rounded-full border-2 border-j-white bg-j-blue-800 text-[10px] font-extrabold text-j-white`}>
            {participantInitials(participant.name) || "A"}
        </span>;
}

export function EventParticipants({ details }: { details: EventDetails }) {
    const participants = details.participants ?? [];
    const count = details.registrationCount ?? participants.length;
    const preview = participants.slice(0, Math.min(3, count));

    if (details.registrationCount === undefined && !participants.length) return null;

    return <details
        className="group"
        onClick={(event) => event.stopPropagation()}
    >
        <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-lg text-left text-sm text-j-gray-500 focus-visible:outline-2 focus-visible:outline-j-blue-800 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center" aria-hidden="true">
                {preview.map((participant, index) => <span key={participant.id ?? participant.userId ?? `${participant.name}-${index}`} className={index ? "-ml-2" : ""}>
                    <ParticipantAvatar participant={participant} compact />
                </span>)}
                {!preview.length && count > 0 && <UsersRound size={18} className="text-j-gray-400" />}
            </span>
            <span className="font-medium">
                <strong className="font-semibold text-j-gray-700">{count}</strong>{" "}
                {count === 1 ? "pessoa" : "pessoas"}
            </span>
            <ChevronDown size={14} aria-hidden="true" className="shrink-0 text-j-gray-400 transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-2 border-t border-j-gray-200 pt-3">
            {participants.length > 0 ? <>
                <ul className="flex flex-col gap-2">
                    {participants.map((participant, index) => <li key={participant.id ?? participant.userId ?? `${participant.name}-${index}`} className="flex min-w-0 items-center gap-2.5">
                        <ParticipantAvatar participant={participant} />
                        <span className="truncate text-sm font-semibold text-j-gray-700">{participant.name}</span>
                    </li>)}
                </ul>
                {participants.length < count && <p className="mt-3 text-xs text-j-gray-500">
                    Exibindo {participants.length} de {count} participantes.
                </p>}
            </> : <p className="text-sm text-j-gray-500">
                A API ainda não retornou os nomes dos participantes.
            </p>}
        </div>
    </details>;
}
