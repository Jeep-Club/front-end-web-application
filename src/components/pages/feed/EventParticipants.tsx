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

function ParticipantAvatar({ participant }: { participant: Participant }) {
    const photo = participantPhoto(participant);
    return photo
        ? <Avatar src={photo} alt="" className="size-9 border-2 border-j-white bg-j-gray-200" />
        : <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full border-2 border-j-white bg-j-blue-800 text-[10px] font-extrabold text-j-white">
            {participantInitials(participant.name) || "A"}
        </span>;
}

export function EventParticipants({ details }: { details: EventDetails }) {
    const participants = details.participants ?? [];
    const count = details.registrationCount ?? participants.length;
    const preview = participants.slice(0, Math.min(4, count));
    const extraCount = Math.max(0, count - preview.length);

    if (details.registrationCount === undefined && !participants.length) return null;

    return <details
        className="group rounded-2xl bg-j-gray-100/70 px-3 py-2.5"
        onClick={(event) => event.stopPropagation()}
    >
        <summary className="flex min-h-10 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-j-blue-800 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center" aria-hidden="true">
                {preview.map((participant, index) => <span key={participant.id ?? participant.userId ?? `${participant.name}-${index}`} className={index ? "-ml-2" : ""}>
                    <ParticipantAvatar participant={participant} />
                </span>)}
                {extraCount > 0 && <span className={`${preview.length ? "-ml-2" : ""} flex size-9 items-center justify-center rounded-full border-2 border-j-white bg-j-blue-800 px-1 text-[11px] font-extrabold text-j-white`}>
                    +{extraCount}
                </span>}
                {!preview.length && !extraCount && <UsersRound size={18} className="text-j-blue-700" />}
            </span>
            <span className="text-sm font-semibold text-j-gray-700">
                <strong className="font-extrabold text-j-blue-800">{count}</strong>{" "}
                {count === 1 ? "pessoa vai participar" : "pessoas vão participar"}
            </span>
            <ChevronDown size={16} aria-hidden="true" className="ml-auto shrink-0 text-j-gray-500 transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-3 border-t border-j-gray-200 pt-3">
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
