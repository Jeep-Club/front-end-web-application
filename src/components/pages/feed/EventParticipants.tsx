import { Avatar } from "@/components/common/avatar";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import type { PublicationFeedDetail, PublicationFeedItem } from "@/schemas/publications/feed";

type EventDetails = Extract<PublicationFeedItem | PublicationFeedDetail, { type: "EVENT" }>['details'];

export function EventParticipants({ details }: { details: EventDetails }) {
    const participants = details.participants ?? [];
    const count = details.registrationCount ?? participants.length;
    if (details.registrationCount === undefined && !participants.length) return null;

    return <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-j-gray-100/70 px-3 py-2.5">
        {participants.length > 0 && <div className="flex -space-x-2" aria-hidden="true">
            {participants.slice(0, 4).map((participant, index) => {
                const photo = getMediaImageUrl(participant.profilePhotoStorageKey ?? participant.profilePhotoUrl ?? participant.photoStorageKey ?? participant.photoUrl);
                const initials = participant.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]?.toLocaleUpperCase("pt-BR")).join("");
                return photo
                    ? <Avatar key={participant.id ?? participant.userId ?? `${participant.name}-${index}`} src={photo} alt="" className="h-9 w-9 border-2 border-j-white bg-j-gray-200" />
                    : <span key={participant.id ?? participant.userId ?? `${participant.name}-${index}`} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-j-white bg-j-blue-800 text-[10px] font-extrabold text-j-white">{initials || "A"}</span>;
            })}
        </div>}
        <span className="text-sm font-semibold text-j-gray-700"><strong className="font-extrabold text-j-blue-800">{count}</strong> {count === 1 ? "pessoa vai participar" : "pessoas vão participar"}</span>
    </div>;
}
