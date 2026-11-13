'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicationDetailModal } from './PublicationDetailModal';

export function FeedDetailRoute({ id }: { id: number }) {
    const router = useRouter();
    const params = useSearchParams();
    return <PublicationDetailModal publicationId={id} routedRegistration onClose={() => router.replace(`/feed${params.size ? `?${params}` : ''}`, { scroll: false })} />;
}
