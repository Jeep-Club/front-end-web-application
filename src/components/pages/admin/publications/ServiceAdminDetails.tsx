'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { publicationAdministrationHref } from '@/utils/publications/administration';
import { useQuery } from '@tanstack/react-query';
import { PublicationDetailHeader, PublicationDetailLayout, PublicationDetailField } from './PublicationDetailLayout';
import { PublicationActionMenu } from './PublicationActionMenu';
import { Button } from '@/components/common/button';
import { getAdminServicePublicationAction } from '@/server/actions/publications/services';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { getActionFailure } from '@/utils/http/ActionError';

export function ServiceAdminDetails({ id }: { id: number }) {
    const back = publicationAdministrationHref('SERVICE', useSearchParams());
    const permissions = useUserStore(state => state.permissions);
    const canRead = hasPermission(permissions, 'PUBLICATIONS', 'SERVICE_ADMIN_READ');
    const query = useQuery({ queryKey: ['publications', 'admin', 'services', 'detail', id, permissions], queryFn: () => getAdminServicePublicationAction(id), enabled: canRead, retry: false });
    const data = !query.isError && canRead ? query.data : undefined;
    return <div className="flex min-w-0 flex-col gap-5 p-3 md:p-4"><PublicationDetailHeader type="Serviço" id={data?.id} status={data?.status} title={data?.title ?? 'Administrar serviço'} actions={data && <PublicationActionMenu publication={{ ...data, type: 'SERVICE', status: data.status }} complete returnHref={back} />} breadcrumbs={[{ label: 'Home', href: '/feed' }, { label: 'Gestão Administrativa', href: '/admin' }, { label: 'Publicações', href: '/admin/publications' }, { label: 'Serviços', href: back }, { label: data?.title ?? (query.isLoading ? 'Carregando...' : 'Serviço indisponível') }]} />
        <Link className="w-fit cursor-pointer rounded-sm text-secondary underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus" href={back}>Voltar aos serviços</Link>
        {!canRead && <p role="alert">Sem permissão para consultar serviços.</p>}
        {query.isLoading && <p role="status">Carregando serviço...</p>}
        {query.isError && <div role="alert"><p>{getActionFailure(query.error)?.status === 404 ? 'Serviço não encontrado.' : query.error.message}</p><Button onClick={() => void query.refetch()}>Tentar novamente</Button></div>}
        {data && <PublicationDetailLayout title={data.title} images={data.images} content={data.content} busy={query.isFetching} information={<><PublicationDetailField label="Valor anunciado">{data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</PublicationDetailField>
                <PublicationDetailField label="Contato">{data.contactPhone}</PublicationDetailField>
                <PublicationDetailField label="Autor">#{data.authorUserId}</PublicationDetailField>
                <PublicationDetailField label="Solicitação de origem">#{data.sourceRequestId}</PublicationDetailField>
                {([['Criação', data.createdAt], ['Atualização', data.updatedAt], ['Publicação', data.publishedAt], ['Arquivamento', data.archivedAt]] as const).map(([label, value]) => <PublicationDetailField key={label} label={label}>{value ? new Date(value).toLocaleString('pt-BR') : 'Não informado'}</PublicationDetailField>)}</>}>
            <p className="text-sm text-secondary">Alterações dependem de proposta do proprietário e revisão. Não há edição ou publicação administrativa direta. Filas de revisão: WEB-227.</p>
            <Button disabled={query.isFetching} onClick={() => void query.refetch()}>Atualizar serviço</Button>
        </PublicationDetailLayout>}
    </div>;
}
