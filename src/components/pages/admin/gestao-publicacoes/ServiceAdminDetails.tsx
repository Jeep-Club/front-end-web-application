'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/common/button';
import { RichTextContent } from '@/components/common/rich-text/RichTextContent';
import { PublicationPhotoCarousel } from '@/components/pages/feed/PublicationPhotoCarousel';
import { getAdminServicePublicationAction } from '@/server/actions/publications/services';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { getActionFailure } from '@/utils/http/ActionError';
import { useModal } from '@/providers/ModalProvider';
import { DraftPublicationActionModal } from './DraftPublicationActionModal';

export function ServiceAdminDetails({ id }: { id: number }) {
    const permissions = useUserStore(state => state.permissions);
    const { setContent, setOpen } = useModal();
    const canRead = hasPermission(permissions, 'PUBLICATIONS', 'SERVICE_ADMIN_READ');
    const query = useQuery({ queryKey: ['publications', 'admin', 'services', 'detail', id, permissions], queryFn: () => getAdminServicePublicationAction(id), enabled: canRead, retry: false });
    const data = !query.isError && canRead ? query.data : undefined;
    return <div className="flex min-w-0 flex-col gap-5 p-3 md:p-4"><PageHeader title="Administrar serviço" breadcrumbs={[{ label: 'Serviço', href: '/admin/publications/service' }, { label: data?.title ?? (query.isLoading ? 'Carregando...' : 'Serviço indisponível') }]} />
        <Link className="cursor-pointer text-j-blue-800 underline" href="/admin/publications/service">Voltar aos serviços</Link>
        {!canRead && <p role="alert">Sem permissão para consultar serviços.</p>}
        {query.isLoading && <p role="status">Carregando serviço...</p>}
        {query.isError && <div role="alert"><p>{getActionFailure(query.error)?.status === 404 ? 'Serviço não encontrado.' : query.error.message}</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
        {data && <article aria-busy={query.isFetching} className="min-w-0 space-y-5 rounded-xl border border-j-gray-200 bg-j-white p-4 md:p-6"><h2 className="break-words text-xl font-bold text-j-blue-800">{data.title}</h2>
            <p>Estado editorial: {data.status}</p><p>Publicação #{data.id} · Autor #{data.authorUserId} · Solicitação de origem #{data.sourceRequestId}</p>
            <p>Valor anunciado: {data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · Contato: {data.contactPhone}</p>
            <p>Criação: {new Date(data.createdAt).toLocaleString('pt-BR')} · Atualização: {new Date(data.updatedAt).toLocaleString('pt-BR')}</p>
            <p>Publicação: {data.publishedAt ? new Date(data.publishedAt).toLocaleString('pt-BR') : 'Não informada'} · Arquivamento: {data.archivedAt ? new Date(data.archivedAt).toLocaleString('pt-BR') : 'Não informado'}</p>
            <PublicationPhotoCarousel images={data.images} title={data.title} /><RichTextContent content={data.content} />
            <p>Alterações dependem de proposta do proprietário e revisão. Não há edição ou publicação administrativa direta. Filas de revisão: WEB-227.</p>
            <div className="flex flex-wrap gap-3">{hasPermission(permissions, 'PUBLICATIONS', 'SERVICE_ADMIN_DELETE') && <Button onClick={() => { setContent(<DraftPublicationActionModal publication={{ ...data, type: 'SERVICE' }} action="delete" returnHref="/admin/publications/service" />); setOpen(); }}>Excluir serviço</Button>}<Button disabled={query.isFetching} onClick={() => void query.refetch()}>Atualizar serviço</Button></div>
        </article>}
    </div>;
}
