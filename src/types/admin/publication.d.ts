type PublicationType = 'event' | 'notice' | 'service';
type PublicationMediaType = 'image' | 'video';
type ServiceCategory = 'benefit' | 'help' | 'general';
type NoticePriority = 'low' | 'medium' | 'high';

interface PublicationMedia {
    id: bigint;

    type: PublicationMediaType;

    url: string;
    thumbnailUrl?: string;

    alt?: string;
    caption?: string;
}

interface PublicationBase {
    id: bigint;

    title: string;

    summary?: string;
    content: string;

    thumbnailUrl?: string;

    media: PublicationMedia[];

    status: PublicationStatus;

    publishedAt?: string;

    createdAt: string;
    updatedAt: string;
}

interface EventPublication extends PublicationBase {
    type: 'event';

    startAt: string;
    endAt: string;

    addressId: bigint;

    maxParticipants: number | null;

    requiresConfirmation: boolean;
}

interface NoticePublication extends PublicationBase {
    type: 'notice';

    expiresAt: string | null;

    noticePriority: NoticePriority;
}

interface ServicePublication extends PublicationBase {
    type: 'service';

    serviceCategory: ServiceCategory;
}

type Publication = EventPublication | NoticePublication | ServicePublication;

type PublicationList = Publication[];