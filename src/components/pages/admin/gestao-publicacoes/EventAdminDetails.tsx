'use client';
import Link from 'next/link';
import { EventDashboard } from './EventDashboard';
import { availablePublishedActions } from '@/config/publicationPublishedActions';
import { useModal } from '@/providers/ModalProvider';
import { DraftPublicationActionModal } from './DraftPublicationActionModal';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/common/button';
import { PageHeader } from '@/components/common/page-header';
import { RichTextContent } from '@/components/common/rich-text/RichTextContent';
import { PublicationPhotoCarousel } from '@/components/pages/feed/PublicationPhotoCarousel';
import { getAdminEventAction, getEventChargesAction, getAdminEventDashboardAction } from '@/server/actions/publications/events';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { getActionFailure } from '@/utils/http/ActionError';

export function EventAdminDetails({ id }: { id: number }) {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore(state => state.permissions);
    const params = useSearchParams();
    const back = new URLSearchParams();
    for (const name of ['page', 'size']) if (params.get(name)) back.set(name, params.get(name)!);
    const canRead = hasPermission(permissions, 'PUBLICATIONS', 'EVENT_READ_ADMIN');
    const event = useQuery({ queryKey: ['publications', 'admin', 'events', 'detail', id, permissions], queryFn: () => getAdminEventAction(id), enabled: canRead, retry: false });
    const charges = useQuery({ queryKey: ['publications', 'admin', 'events', 'charges', id, permissions], queryFn: () => getEventChargesAction(id), enabled: canRead, retry: false });
    const canDashboard = hasPermission(permissions, 'PUBLICATIONS', 'EVENT_ADMIN_DASHBOARD_READ');
    const dashboard = useQuery({ queryKey: ['publications', 'admin', 'events', 'dashboard', id, permissions], queryFn: () => getAdminEventDashboardAction(id), enabled: canRead && canDashboard, retry: false });
    const knownLocked = !!(canDashboard && !dashboard.isError && dashboard.data && (dashboard.data.registrations.length || dashboard.data.financial.length));
    const data = !event.isError && canRead ? event.data : undefined;
    return <div className="flex min-w-0 flex-col gap-5 p-3 md:p-4">
        <PageHeader title="Administrar evento" breadcrumbs={[{ label: 'Evento', href: `/admin/publications/event?${back}` }, { label: data?.title ?? (event.isLoading ? 'Carregando...' : 'Evento indisponível') }]} />
        <Link className="cursor-pointer text-j-blue-800 underline" href={`/admin/publications/event?${back}`}>Voltar aos eventos</Link>
        {!canRead && <p role="alert">Você não possui permissão para consultar eventos.</p>}
        {event.isLoading && <p role="status">Carregando evento...</p>}
        {event.isError && <div role="alert"><p>{getActionFailure(event.error)?.status === 404 ? 'Evento não encontrado.' : event.error.message}</p><Button onClick={() => void event.refetch()}>Tentar novamente</Button></div>}
        {data && <article aria-busy={event.isFetching} className="min-w-0 space-y-5 rounded-xl border border-j-gray-200 bg-j-white p-4 md:p-6">
            <h2 className="break-words text-xl font-bold text-j-blue-800">{data.title}</h2>
            <p>Estado editorial: {data.publicationStatus}</p><p>Estado operacional: {data.eventStatus}</p>
            <p>Início: {new Date(data.startsAt).toLocaleString('pt-BR')} · Término: {data.endsAt ? new Date(data.endsAt).toLocaleString('pt-BR') : 'Não informado'}</p>
            <p>Horários no fuso do navegador. Autor #{data.authorUserId} · Publicação #{data.id}</p>
            <PublicationPhotoCarousel images={data.images} title={data.title} />
            <RichTextContent content={data.content} />
            <section aria-label="Regras atuais" className="space-y-3"><h3 className="text-lg font-bold">Regras atuais</h3>
                {charges.isLoading && <p role="status">Carregando regras...</p>}
                {charges.isError && <div role="alert"><p>{charges.error.message}</p><Button onClick={() => void charges.refetch()}>Tentar regras novamente</Button></div>}
                {!charges.isError && charges.data && (charges.data.length ? <ul className="space-y-3">{charges.data.map(rule => <li key={rule.chargeDefinitionId}>Definição #{rule.chargeDefinitionId} · Exige para participação: {rule.requiredForParticipation ? 'Sim' : 'Não'} · Cutoff UTC: {rule.participationCutoff} · Vencimento: {rule.financialDueDate ?? 'Não informado'}</li>)}</ul> : <p>Sem regras de cobrança.</p>)}
                {hasPermission(permissions, 'PUBLICATIONS', 'EVENT_UPDATE') && data.eventStatus === 'OPEN' && data.publicationStatus !== 'ARCHIVED' && charges.data && !charges.isError && <Button disabled={knownLocked} onClick={() => { setContent(<DraftPublicationActionModal publication={{ ...data, type: 'EVENT', status: data.publicationStatus, chargeRules: charges.data }} action="charges" agendaLocked={knownLocked} />); setOpen(); }}>Configurar cobranças</Button>}
            </section>
            {hasPermission(permissions, 'PUBLICATIONS', 'EVENT_UPDATE') && data.publicationStatus !== 'ARCHIVED' && <Button onClick={() => { setContent(<DraftPublicationActionModal publication={{ ...data, type: 'EVENT', status: data.publicationStatus }} action="edit" agendaLocked={knownLocked} />); setOpen(); }}>Editar evento</Button>}
            <section aria-label="Participação e cobranças" className="min-w-0 space-y-3"><h3 className="text-lg font-bold">Participação e cobranças</h3>
                {!canDashboard && <p>Sem permissão para consultar o dashboard. Não é possível antecipar bloqueios de agenda e cobranças; o servidor decide.</p>}
                {canDashboard && dashboard.isLoading && <p role="status">Carregando participação...</p>}
                {canDashboard && dashboard.isError && <div role="alert"><p>{dashboard.error.message}</p><Button onClick={() => void dashboard.refetch()}>Tentar dashboard novamente</Button></div>}
                {knownLocked && <p role="status">Agenda e cobranças bloqueadas: existe inscrição (inclusive cancelada) ou fato financeiro.</p>}
                {canDashboard && !dashboard.isError && dashboard.data && <EventDashboard data={dashboard.data} />}
            </section>
            <div className="flex flex-wrap gap-3">
                {data.publicationStatus === 'DRAFT' && hasPermission(permissions, 'PUBLICATIONS', 'EVENT_PUBLISH') && <Button onClick={() => { setContent(<DraftPublicationActionModal publication={{ ...data, type: 'EVENT', status: data.publicationStatus }} action="publish" />); setOpen(); }}>Publicar evento</Button>}
                {availablePublishedActions({ type: 'EVENT', status: data.publicationStatus, eventStatus: data.eventStatus }, permissions).filter(action => action !== 'edit').map(action => <Button key={action} onClick={() => { setContent(<DraftPublicationActionModal publication={{ ...data, type: 'EVENT', status: data.publicationStatus }} action={action} returnHref={`/admin/publications/event?${back}`} />); setOpen(); }}>{({ cancel: 'Cancelar evento', finish: 'Encerrar evento', delete: 'Excluir evento', archive: 'Arquivar', edit: 'Editar' })[action]}</Button>)}
            </div>
            <Button disabled={event.isFetching} onClick={() => void event.refetch()}>Atualizar evento</Button>
        </article>}
    </div>;
}
