import type { ReactNode } from 'react';
import { PageHeader, type Breadcrumb } from '@/components/common/page-header';
import { RichTextContent } from '@/components/common/rich-text/RichTextContent';
import { PublicationPhotoCarousel } from '@/components/pages/feed/PublicationPhotoCarousel';

type EditorialStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type EventStatus = 'OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
const editorialLabels: Record<EditorialStatus, string> = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado', ARCHIVED: 'Arquivado' };
const eventLabels: Record<EventStatus, string> = { OPEN: 'Aberto', IN_PROGRESS: 'Em andamento', FINISHED: 'Finalizado', CANCELLED: 'Cancelado' };

export function PublicationDetailHeader({ title, breadcrumbs, actions, type, id, status, eventStatus }: {
    title: string; breadcrumbs: Breadcrumb[]; actions?: ReactNode; type: string; id?: number; status?: EditorialStatus; eventStatus?: EventStatus;
}) {
    return <header className="min-w-0 space-y-3">
        <PageHeader title={title} breadcrumbs={breadcrumbs} actions={actions} />
        {id !== undefined && <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-secondary">{type} · Publicação #{id}</span>
            {status && <span className="rounded-md bg-background-secondary px-2 py-1 font-semibold text-primary">Estado editorial: {editorialLabels[status]}</span>}
            {eventStatus && <span className="rounded-md bg-background-secondary px-2 py-1 font-semibold text-primary">Estado operacional: {eventLabels[eventStatus]}</span>}
        </div>}
    </header>;
}

export function PublicationDetailField({ label, children }: { label: string; children: ReactNode }) {
    return <div className="min-w-0 space-y-1"><dt className="text-xs font-semibold text-secondary">{label}</dt><dd className="break-words text-sm text-primary">{children}</dd></div>;
}

export function PublicationDetailLayout({ title, images, content, busy, information, children }: {
    title: string; images: { storageKey: string; position: number }[]; content: string; busy?: boolean; information: ReactNode; children?: ReactNode;
}) {
    return <article aria-busy={busy} className="min-w-0 space-y-6">
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
            <aside aria-label="Informações gerais" className="order-first min-w-0 rounded-xl border border-input-border bg-background p-4 lg:order-last lg:p-5">
                <h2 className="text-base font-bold text-primary">Informações gerais</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">{information}</dl>
            </aside>
            <div className="min-w-0 space-y-5">
                <section aria-label="Galeria de imagens" className="min-w-0 space-y-3 rounded-xl border border-input-border bg-background p-4 md:p-5">
                    <h2 className="text-lg font-bold text-primary">Galeria de imagens</h2>
                    {images.length ? <PublicationPhotoCarousel images={images} title={title} imageClassName="max-h-96" /> : <p className="rounded-lg bg-background-secondary p-4 text-sm text-secondary">Nenhuma imagem disponível.</p>}
                </section>
                <section aria-label="Conteúdo" className="min-w-0 space-y-3 rounded-xl border border-input-border bg-background p-4 md:p-5">
                    <h2 className="text-lg font-bold text-primary">Conteúdo</h2>
                    <div className="max-w-prose break-words"><RichTextContent content={content} /></div>
                </section>
            </div>
        </div>
        {children}
    </article>;
}
