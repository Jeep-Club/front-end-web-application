import { Avatar } from "@/components/common/avatar";
import { CurrentUserContext } from "@/contexts/CurrentUserContext";
import { getMediaImageUrl } from "@/utils/media/imageUrl";
import { useContext } from "react";
import { RelativeTime } from "./RelativeTime";

interface PublicationCommentAuthorProps {
    authorUserId: number;
    name?: string | null;
    photo?: string | null;
    createdAt: string;
}

function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]?.toLocaleUpperCase("pt-BR")).join("");
}

export function PublicationCommentAuthor({ authorUserId, name, photo, createdAt }: PublicationCommentAuthorProps) {

    const currentUser = useContext(CurrentUserContext);
    const isCurrentUser = String(currentUser?.userId) === String(authorUserId);
    const displayName = name?.trim() || (isCurrentUser ? currentUser?.name : null) || `Associado #${authorUserId}`;
    const photoUrl = getMediaImageUrl(photo ?? (isCurrentUser ? currentUser?.photoUrl : null));

    return <div className="flex min-w-0 items-center gap-2.5">
        {photoUrl ? <Avatar src={photoUrl} alt={`Foto de ${displayName}`} className="h-9 w-9 shrink-0 bg-j-gray-200" /> : <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-j-blue-800 text-xs font-extrabold text-j-white">{initials(displayName) || "A"}</span>}
        <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold text-j-blue-800">{displayName}</span>
            <RelativeTime value={createdAt} className="text-xs text-j-gray-500" />
        </div>
    </div>;
}
