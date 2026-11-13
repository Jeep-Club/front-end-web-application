'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { publicationAdministrationHref } from '@/utils/publications/administration';
import { useQuery } from '@tanstack/react-query';
import { PublicationDetailHeader, PublicationDetailLayout, PublicationDetailField } from './PublicationDetailLayout';
import { PublicationActionMenu } from './PublicationActionMenu';
import { Button } from '@/components/common/button';
import { getAdminNoticeAction } from '@/server/actions/publications/notices';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { getActionFailure } from '@/utils/http/ActionError';

export function NoticeAdminDetails({ id }: { id: number }) {
    const back = publicationAdministrationHref('NOTICE', useSearchParams());
    const permissions = useUserStore(state => state.permissions);
    const can = (action: string) => hasPermission(permissions, 'PUBLICATIONS', action);
    const query = useQuery({ queryKey: ['publications', 'admin', 'notices', 'detail', id, permissions], queryFn: () => getAdminNoticeAction(id), enabled: can('NOTICE_READ'), retry: false });
    const data = !query.isError && can('NOTICE_READ') ? query.data : undefined;
    return <div className="flex min-w-0 flex-col gap-5 p-3 md:p-4"><PublicationDetailHeader type="Aviso" id={data?.id} status={data?.status} title={data?.title ?? 'Administrar aviso'} actions={data && <PublicationActionMenu publication={{ ...data, type: 'NOTICE', status: data.status }} complete returnHref={back} />} breadcrumbs={[{ label: 'Home', href: '/feed' }, { label: 'Gestão Administrativa', href: '/admin' }, { label: 'Publicações', href: '/admin/publications' }, { label: 'Avisos', href: back }, { label: data?.title ?? (query.isLoading ? 'Carregando...' : 'Aviso indisponível') }]} />
        <Link className="w-fit cursor-pointer rounded-sm text-secondary underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus" href={back}>Voltar aos avisos</Link>
        {!can('NOTICE_READ') && <p role="alert">Sem permissão para consultar avisos.</p>}
        {query.isLoading && <p role="status">Carregando aviso...</p>}
        {query.isError && <div role="alert"><p>{getActionFailure(query.error)?.status === 404 ? 'Aviso não encontrado.' : query.error.message}</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
        {data && <PublicationDetailLayout title={data.title} images={data.images} content={data.content} busy={query.isFetching} information={<><PublicationDetailField label="Autor">#{data.authorUserId}</PublicationDetailField>
                {([['Criado em', data.createdAt], ['Atualizado em', data.updatedAt], ['Publicado em', data.publishedAt], ['Arquivado em', data.archivedAt]] as const).map(([label, value]) => <PublicationDetailField key={label} label={label}>{value ? new Date(value).toLocaleString('pt-BR') : 'Não informado'}</PublicationDetailField>)}</>}>
            {data.status === 'ARCHIVED' && <p className="text-sm text-secondary">Arquivado: edição e republicação indisponíveis. A consulta permanece acessível por este ID.</p>}
            <Button disabled={query.isFetching} onClick={() => void query.refetch()}>Atualizar aviso</Button>
        </PublicationDetailLayout>}
    </div>;
}
