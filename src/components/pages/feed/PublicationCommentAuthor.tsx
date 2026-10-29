import { Avatar } from "@/components/common/avatar";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { RelativeTime } from "./RelativeTime";

interface PublicationCommentAuthorProps {
    name?: string | null;
    photo?: string | null;
    createdAt: string;
}

function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]?.toLocaleUpperCase("pt-BR")).join("");
}

export function PublicationCommentAuthor({ name, photo, createdAt }: PublicationCommentAuthorProps) {
    const displayName = name?.trim() || "Associado";
    const photoUrl = getMediaImageUrl(photo);

    return <div className="flex min-w-0 items-center gap-2.5">
        {photoUrl ? <Avatar src={photoUrl} alt={`Foto de ${displayName}`} className="h-9 w-9 shrink-0 bg-j-gray-200" /> : <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-j-blue-800 text-xs font-extrabold text-j-white">{initials(displayName) || "A"}</span>}
        <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold text-j-blue-800">{displayName}</span>
            <RelativeTime value={createdAt} className="text-xs text-j-gray-500" />
        </div>
    </div>;
}
