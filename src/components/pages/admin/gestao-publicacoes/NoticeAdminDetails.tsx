'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/common/button';
import { RichTextContent } from '@/components/common/rich-text/RichTextContent';
import { PublicationPhotoCarousel } from '@/components/pages/feed/PublicationPhotoCarousel';
import { getAdminNoticeAction } from '@/server/actions/publications/notices';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { getActionFailure } from '@/utils/http/ActionError';
import { useModal } from '@/providers/ModalProvider';
import { DraftPublicationActionModal } from './DraftPublicationActionModal';

export function NoticeAdminDetails({ id }: { id: number }) {
    const permissions = useUserStore(state => state.permissions);
    const { setContent, setOpen } = useModal();
    const can = (action: string) => hasPermission(permissions, 'PUBLICATIONS', action);
    const query = useQuery({ queryKey: ['publications', 'admin', 'notices', 'detail', id, permissions], queryFn: () => getAdminNoticeAction(id), enabled: can('NOTICE_READ'), retry: false });
    const data = !query.isError && can('NOTICE_READ') ? query.data : undefined;
    return <div className="flex min-w-0 flex-col gap-5 p-3 md:p-4"><PageHeader title="Administrar aviso" breadcrumbs={[{ label: 'Aviso', href: '/admin/publications/notice' }, { label: data?.title ?? (query.isLoading ? 'Carregando...' : 'Aviso indisponível') }]} />
        <Link className="cursor-pointer text-j-blue-800 underline" href="/admin/publications/notice">Voltar aos avisos</Link>
        {!can('NOTICE_READ') && <p role="alert">Sem permissão para consultar avisos.</p>}
        {query.isLoading && <p role="status">Carregando aviso...</p>}
        {query.isError && <div role="alert"><p>{getActionFailure(query.error)?.status === 404 ? 'Aviso não encontrado.' : query.error.message}</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
        {data && <article aria-busy={query.isFetching} className="min-w-0 space-y-5 rounded-xl border border-j-gray-200 bg-j-white p-4 md:p-6">
            <h2 className="break-words text-xl font-bold text-j-blue-800">{data.title}</h2><p>Estado editorial: {data.status}</p><p>Publicação #{data.id} · Autor #{data.authorUserId}</p>
            <dl className="space-y-2">{([['Criado em', data.createdAt], ['Atualizado em', data.updatedAt], ['Publicado em', data.publishedAt], ['Arquivado em', data.archivedAt]] as const).map(([label, value]) => <div key={label}><dt className="font-bold">{label}</dt><dd>{value ? new Date(value).toLocaleString('pt-BR') : 'Não informado'}</dd></div>)}</dl>
            <PublicationPhotoCarousel images={data.images} title={data.title} /><RichTextContent content={data.content} />
            {data.status === 'ARCHIVED' && <p>Arquivado: edição e republicação indisponíveis. A consulta permanece acessível por este ID.</p>}
            <div className="flex flex-wrap gap-3">{([
                { action: 'edit', permission: 'NOTICE_UPDATE', eligible: data.status !== 'ARCHIVED', label: 'Editar aviso' },
                { action: 'publish', permission: 'NOTICE_PUBLISH', eligible: data.status === 'DRAFT', label: 'Publicar aviso' },
                { action: 'archive', permission: 'NOTICE_ARCHIVE', eligible: data.status === 'PUBLISHED', label: 'Arquivar aviso' },
                { action: 'delete', permission: 'NOTICE_DELETE', eligible: true, label: 'Excluir aviso' },
            ] as const).filter(entry => entry.eligible && can(entry.permission)).map(entry => <Button key={entry.action} onClick={() => { setContent(<DraftPublicationActionModal publication={{ ...data, type: 'NOTICE' }} action={entry.action} returnHref="/admin/publications/notice" />); setOpen(); }}>{entry.label}</Button>)}<Button disabled={query.isFetching} onClick={() => void query.refetch()}>Atualizar aviso</Button></div>
        </article>}
    </div>;
}
