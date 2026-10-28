"use client";

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { listPublicationCommentsAction } from '@/actions/publications/feed';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { PublicationCommentAuthor } from './PublicationCommentAuthor';

/** The current API has no comment likes; its stable newest-first order is the fallback. */
export function PublicationCommentPreview({ publicationId, count, onOpen }: { publicationId: number; count: number; onOpen?: () => void }) {
    const permissions = useUserStore(state => state.permissions);
    const canRead = hasPermission(permissions, 'PUBLICATIONS', 'COMMENT_READ');
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        if (!canRead || !count || !ref.current || visible) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
        }, { root: ref.current.closest('[data-dashboard-scroll]'), rootMargin: '200px 0px' });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [canRead, count, visible]);
    const query = useQuery({
        queryKey: ['publications', 'comments', publicationId, 'preview', permissions],
        queryFn: () => listPublicationCommentsAction({ id: publicationId, page: 0, size: 3 }),
        enabled: canRead && count > 0 && visible && expanded,
        staleTime: 30_000,
    });
    if (!canRead || !count) return null;
    return <section ref={ref} aria-label="Comentários recentes" className="border-t border-j-gray-200 pt-3">


        <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-j-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-j-blue-800">
            {expanded ? <><ChevronUp size={16} aria-hidden="true" />Ocultar comentários</> : <><ChevronDown size={16} aria-hidden="true" />Mostrar comentários ({count})</>}
        </button>
        {expanded && <>
            {query.isLoading && <p role="status" className="text-sm text-j-gray-500">Carregando comentários...</p>}
            {query.isError && <button type="button" onClick={() => void query.refetch()} className="min-h-11 text-sm font-semibold text-j-blue-700">Tentar carregar comentários novamente</button>}
            <div className="flex flex-col gap-3">
                {query.data?.content.map(comment => <div key={comment.id} className="rounded-xl bg-j-gray-100/60 p-3">
                    <PublicationCommentAuthor
                        name={comment.authorName}
                        photo={comment.authorPhotoStorageKey ?? comment.authorProfilePhotoStorageKey ?? comment.authorPhotoUrl ?? comment.authorProfilePhotoUrl}
                        createdAt={comment.createdAt}
                    />
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm text-j-gray-700">{comment.text}</p>
                </div>)}
            </div>
            {count > 3 && onOpen && <button type="button" onClick={onOpen} className="mt-2 min-h-11 text-sm font-bold text-j-blue-700 hover:underline">Ver todos os comentários</button>}
        </>}


    </section>;
}
