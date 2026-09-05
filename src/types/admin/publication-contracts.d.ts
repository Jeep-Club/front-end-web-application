type PublicationStatus = "draft" | "published" | "archived";

interface PublicationMediaInput {
    id?: bigint;
    type: PublicationMediaType;
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    caption?: string;
}

interface PublicationSearchParams {
    q?: string;
    title?: string;
    type?: PublicationType;
    status?: PublicationStatus;
    noticePriority?: NoticePriority;
    serviceCategory?: ServiceCategory;
    createdFrom?: string;
    createdTo?: string;
    publishedFrom?: string;
    publishedTo?: string;
    page?: string;
    size?: string;
    sort?: string;
}

interface PublicationListQuery {
    q?: string;
    title?: string;
    type?: PublicationType;
    status?: PublicationStatus;
    noticePriority?: NoticePriority;
    serviceCategory?: ServiceCategory;
    createdFrom?: string;
    createdTo?: string;
    publishedFrom?: string;
    publishedTo?: string;
    page: number;
    size: number;
    sort?: string;
}

interface PublicationInputBase {
    title: string;
    summary?: string;
    content: string;
    thumbnailUrl?: string;
    media: PublicationMediaInput[];
    status: PublicationStatus;
}

interface CreateEventPublicationInput extends PublicationInputBase {
    type: "event";
    startAt: string;
    endAt: string;
    addressId: bigint;
    maxParticipants: number | null;
    requiresConfirmation: boolean;
}

interface CreateNoticePublicationInput extends PublicationInputBase {
    type: "notice";
    expiresAt: string | null;
    noticePriority: NoticePriority;
}

interface CreateServicePublicationInput extends PublicationInputBase {
    type: "service";
    serviceCategory: ServiceCategory;
}

type CreatePublicationInput = CreateEventPublicationInput | CreateNoticePublicationInput | CreateServicePublicationInput;
type UpdatePublicationInput = CreatePublicationInput;

