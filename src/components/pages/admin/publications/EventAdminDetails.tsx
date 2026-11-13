'use client';
import Link from 'next/link';
import { EventDashboard } from './EventDashboard';
import { useModal } from '@/providers/ModalProvider';
import { DraftPublicationActionModal } from './DraftPublicationActionModal';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/common/button';
import { PublicationDetailHeader, PublicationDetailLayout, PublicationDetailField } from './PublicationDetailLayout';
import { PublicationActionMenu } from './PublicationActionMenu';
import { getAdminEventAction, getEventChargesAction, getAdminEventDashboardAction } from '@/server/actions/publications/events';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { getActionFailure } from '@/utils/http/ActionError';
import { publicationAdministrationHref } from '@/utils/publications/administration';

export function EventAdminDetails({ id }: { id: number }) {
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore(state => state.permissions);
    const back = publicationAdministrationHref('EVENT', useSearchParams());
    const canRead = hasPermission(permissions, 'PUBLICATIONS', 'EVENT_READ_ADMIN');
    const event = useQuery({ queryKey: ['publications', 'admin', 'events', 'detail', id, permissions], queryFn: () => getAdminEventAction(id), enabled: canRead, retry: false });
    const charges = useQuery({ queryKey: ['publications', 'admin', 'events', 'charges', id, permissions], queryFn: () => getEventChargesAction(id), enabled: canRead, retry: false });
    const canDashboard = hasPermission(permissions, 'PUBLICATIONS', 'EVENT_ADMIN_DASHBOARD_READ');
    const dashboard = useQuery({ queryKey: ['publications', 'admin', 'events', 'dashboard', id, permissions], queryFn: () => getAdminEventDashboardAction(id), enabled: canRead && canDashboard, retry: false });
    const knownLocked = !!(canDashboard && !dashboard.isError && dashboard.data && (dashboard.data.registrations.length || dashboard.data.financial.length));
    const data = !event.isError && canRead ? event.data : undefined;
    return <div className="flex min-w-0 flex-col gap-5 p-3 md:p-4">
        <PublicationDetailHeader type="Evento" id={data?.id} status={data?.publicationStatus} eventStatus={data?.eventStatus} title={data?.title ?? 'Administrar evento'} actions={data && <PublicationActionMenu publication={{ ...data, type: 'EVENT', status: data.publicationStatus }} complete returnHref={back} agendaLocked={knownLocked} />} breadcrumbs={[{ label: 'Home', href: '/feed' }, { label: 'Gestão Administrativa', href: '/admin' }, { label: 'Publicações', href: '/admin/publications' }, { label: 'Eventos', href: back }, { label: data?.title ?? (event.isLoading ? 'Carregando...' : 'Evento indisponível') }]} />
        <Link className="w-fit cursor-pointer rounded-sm text-secondary underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus" href={back}>Voltar aos eventos</Link>
        {!canRead && <p role="alert">Você não possui permissão para consultar eventos.</p>}
        {event.isLoading && <p role="status">Carregando evento...</p>}
        {event.isError && <div role="alert"><p>{getActionFailure(event.error)?.status === 404 ? 'Evento não encontrado.' : event.error.message}</p><Button onClick={() => void event.refetch()}>Tentar novamente</Button></div>}
        {data && <PublicationDetailLayout title={data.title} images={data.images} content={data.content} busy={event.isFetching} information={<><PublicationDetailField label="Início">{new Date(data.startsAt).toLocaleString('pt-BR')}</PublicationDetailField>
                <PublicationDetailField label="Término">{data.endsAt ? new Date(data.endsAt).toLocaleString('pt-BR') : 'Não informado'}</PublicationDetailField>
                <PublicationDetailField label="Fuso horário">Horários no fuso do navegador.</PublicationDetailField>
                <PublicationDetailField label="Autor">#{data.authorUserId}</PublicationDetailField></>}>
            <section aria-label="Regras atuais" className="min-w-0 space-y-3 rounded-xl border border-input-border bg-background p-4 md:p-5"><h3 className="text-lg font-bold">Regras atuais</h3>
                {charges.isLoading && <p role="status">Carregando regras...</p>}
                {charges.isError && <div role="alert"><p>{charges.error.message}</p><Button onClick={() => void charges.refetch()}>Tentar regras novamente</Button></div>}
                {!charges.isError && charges.data && (charges.data.length ? <ul className="space-y-3">{charges.data.map(rule => <li key={rule.chargeDefinitionId}>Definição #{rule.chargeDefinitionId} · Prazo para confirmar participação: {new Date(rule.participationCutoff).toLocaleString('pt-BR')} · Vencimento: {rule.financialDueDate ? new Date(`${rule.financialDueDate}T12:00:00`).toLocaleDateString('pt-BR') : 'Não informado'}</li>)}</ul> : <p>Sem regras de cobrança.</p>)}
                {hasPermission(permissions, 'PUBLICATIONS', 'EVENT_UPDATE') && data.eventStatus === 'OPEN' && data.publicationStatus !== 'ARCHIVED' && charges.data && !charges.isError && <Button disabled={knownLocked} onClick={() => { setContent(<DraftPublicationActionModal publication={{ ...data, type: 'EVENT', status: data.publicationStatus, chargeRules: charges.data }} action="charges" agendaLocked={knownLocked} />); setOpen(); }}>Configurar associação</Button>}
            </section>
            <section aria-label="Participação e cobranças" className="min-w-0 space-y-3 rounded-xl border border-input-border bg-background p-4 md:p-5"><h3 className="text-lg font-bold">Participação e cobranças</h3>
                {!canDashboard && <p>Sem permissão para consultar o dashboard. Não é possível antecipar bloqueios de agenda e cobranças; o servidor decide.</p>}
                {canDashboard && dashboard.isLoading && <p role="status">Carregando participação...</p>}
                {canDashboard && dashboard.isError && <div role="alert"><p>{dashboard.error.message}</p><Button onClick={() => void dashboard.refetch()}>Tentar dashboard novamente</Button></div>}
                {knownLocked && <p role="status">Agenda e cobranças bloqueadas: existe inscrição (inclusive cancelada) ou fato financeiro.</p>}
                {canDashboard && !dashboard.isError && dashboard.data && <EventDashboard data={dashboard.data} />}
            </section>
            <Button disabled={event.isFetching} onClick={() => void event.refetch()}>Atualizar evento</Button>
        </PublicationDetailLayout>}
    </div>;
}
