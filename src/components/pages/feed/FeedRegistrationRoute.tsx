'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPublicationFeedDetailAction } from '@/server/actions/publications/feed';
import { EventParticipation } from './EventParticipation';
import { publicationReadError } from './feedDisplay';
import { useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';

export function FeedRegistrationRoute({ id }: { id: number }) {
    const router = useRouter();
    const params = useSearchParams();
    const back = `/feed/${id}${params.size ? `?${params}` : ''}`;
    const dialog = useRef<HTMLDialogElement>(null);
    const permissions = useUserStore(state => state.permissions);
    const canRegister = hasPermission(permissions, 'PUBLICATIONS', 'EVENT_REGISTER');
    const close = () => router.replace(back, { scroll: false });
    useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
    const query = useQuery({ queryKey: ['publications', 'registration-detail', id], queryFn: () => getPublicationFeedDetailAction(id), retry: false });
    return <dialog ref={dialog} onCancel={event => { event.preventDefault(); close(); }} aria-labelledby="feed-register-title" className="m-auto max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-3xl border-0 bg-j-white p-6 text-j-gray-700 shadow-2xl backdrop:bg-black/60">
        <h1 id="feed-register-title" className="text-xl font-extrabold text-j-blue-800">Inscrição no evento</h1>
        <Link className="cursor-pointer font-bold underline" href={back}>Voltar à publicação</Link>
        {query.isPending && <p role="status">Carregando evento...</p>}
        {query.isError && <p role="alert">{publicationReadError(query.error).message}</p>}
        {!canRegister && <p role="alert">Você não tem permissão para se inscrever neste evento.</p>}
        {canRegister && query.data && (query.data.type === 'EVENT'
            ? <EventParticipation eventId={id} eventStatus={query.data.details.status} autoOpenRegistration onRegistrationClose={() => { close(); router.refresh(); }} />
            : <p role="alert">Esta publicação não é um evento.</p>)}
    </dialog>;
}
