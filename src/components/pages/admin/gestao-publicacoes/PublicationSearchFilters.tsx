'use client';

import { useId, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input/input';
import { Select } from '@/components/common/select/select';
import { Filters, type FilterItem } from '@/components/common/filters/Filters';
import { publicationFeedFiltersSchema, type PublicationFeedFilters } from '@/schemas/publications/feed';

export interface PublicationSearchFiltersProps {
    type: 'EVENT' | 'NOTICE' | 'SERVICE';
    canReadId: boolean;
    canReadList: boolean;
    publishedFrom?: string;
    publishedTo?: string;
    onOpenId: (id: number) => void;
    onPeriod: (filters: Pick<PublicationFeedFilters, 'publishedFrom' | 'publishedTo'>) => void;
    onClear: () => void;
}

/** Filtros sem contrato continuam desabilitados; o período do feed preserva instantes UTC. */
export function PublicationSearchFilters({ type, canReadId, canReadList, publishedFrom, publishedTo, onOpenId, onPeriod, onClear }: PublicationSearchFiltersProps) {
    const [mode, setMode] = useState<'AUTO' | 'ID' | 'TITLE'>('AUTO');
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [pending, startTransition] = useTransition();
    const [from, setFrom] = useState(publishedFrom ?? '');
    const [to, setTo] = useState(publishedTo ?? '');
    const [periodErrors, setPeriodErrors] = useState<Record<string, string>>({});
    const [applied, setApplied] = useState({ publishedFrom, publishedTo });
    const helpId = useId();
    const value = search.trim();
    const searchMode = mode === 'AUTO' ? (!value || /^\d+$/.test(value) ? 'ID' : 'TITLE') : mode;

    // Browser history can restore a period independently of the local fields.
    if (applied.publishedFrom !== publishedFrom || applied.publishedTo !== publishedTo) {
        setApplied({ publishedFrom, publishedTo });
        setFrom(publishedFrom ?? '');
        setTo(publishedTo ?? '');
        setPeriodErrors({});
    }
    function applyPeriod(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = publicationFeedFiltersSchema.safeParse({ publishedFrom: from || undefined, publishedTo: to || undefined });
        if (!result.success) { setPeriodErrors(Object.fromEntries(result.error.issues.map(issue => [issue.path.join('.'), issue.message]))); return; }
        setPeriodErrors({}); onPeriod(result.data);
    }

    const filters: FilterItem[] = [
        { id: 'editorialStatus', label: 'Estado editorial', content: <div className="w-full sm:w-44"><Select name="editorialStatus" label="Estado editorial" disabled value="ALL" options={[{ value: 'ALL', label: type === 'EVENT' ? 'Todos os estados' : 'Publicados no feed' }, { value: 'DRAFT', label: 'Rascunho' }, { value: 'PUBLISHED', label: 'Publicado' }, { value: 'ARCHIVED', label: 'Arquivado' }]} /></div> },
        ...(type === 'EVENT' ? [{ id: 'eventStatus', label: 'Situação do evento', content: <div className="w-full sm:w-44"><Select name="eventStatus" label="Situação do evento" disabled value="ALL" options={[{ value: 'ALL', label: 'Todas' }, { value: 'OPEN', label: 'Aberto' }, { value: 'IN_PROGRESS', label: 'Em andamento' }, { value: 'FINISHED', label: 'Finalizado' }, { value: 'CANCELLED', label: 'Cancelado' }]} /></div> }] : []),
        ...(type === 'NOTICE' ? [{ id: 'noticePriority', label: 'Prioridade', content: <div className="w-full sm:w-44"><Select name="noticePriority" label="Prioridade" disabled placeholder="Sem suporte na API" /></div> }] : []),
        ...(type === 'SERVICE' ? [{ id: 'serviceCategory', label: 'Categoria do serviço', content: <div className="w-full sm:w-44"><Select name="serviceCategory" label="Categoria do serviço" disabled placeholder="Sem suporte na API" /></div> }] : []),
        ...(type === 'EVENT' ? [{ id: 'eventPeriod', label: 'Período do evento', content: <div className="w-full sm:w-44"><Select name="eventPeriod" label="Período do evento" disabled placeholder="Sem suporte na API" /></div> }] : [{ id: 'publishedPeriod', label: 'Período de publicação', content: <form aria-label="Período de publicação" className="flex min-w-0 max-w-full flex-wrap items-end gap-2" onSubmit={applyPeriod}>
            <div className="w-full sm:w-52"><Input name="publishedFrom" label="Publicada a partir de (UTC)" value={from} onChange={event => setFrom(event.target.value)} error={periodErrors.publishedFrom} disabled={!canReadList} placeholder="2026-10-01T00:00:00Z" /></div>
            <div className="w-full sm:w-52"><Input name="publishedTo" label="Publicada até (UTC)" value={to} onChange={event => setTo(event.target.value)} error={periodErrors.publishedTo} disabled={!canReadList} placeholder="2026-10-31T23:59:59Z" /></div>
            <Button type="submit" disabled={!canReadList}>Aplicar</Button>
        </form> }]),
        ...(type === 'NOTICE' ? [{ id: 'noticeValidity', label: 'Validade', content: <div className="w-full sm:w-44"><Select name="noticeValidity" label="Validade" disabled placeholder="Sem suporte na API" /></div> }] : []),
    ];

    return <div className="mt-5 space-y-3 border-t border-j-gray-200 pt-4">
        <form aria-label="Pesquisa de publicações" className="space-y-2" onSubmit={event => {
            event.preventDefault();
            if (searchMode !== 'ID' || !canReadId || pending) return;
            if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) <= 0) { setError('Informe um ID positivo válido.'); return; }
            setError(''); startTransition(() => onOpenId(Number(value)));
        }}>
            <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                <div className="w-36 shrink-0"><Select name="searchMode" label="Tipo de busca" labelClassName="sr-only" value={mode} disabled={pending} onValueChange={next => { setMode(next as typeof mode); setError(''); }} options={[{ value: 'AUTO', label: 'Automático' }, { value: 'ID', label: 'ID' }, { value: 'TITLE', label: 'Título' }]} /></div>
                <div className="min-w-0 flex-1 basis-48"><Input name="publicationSearch" label="Pesquisar por título ou ID" labelClassName="sr-only" placeholder="Pesquisar por título ou ID da publicação..." value={search} disabled={pending} inputMode={mode === 'ID' ? 'numeric' : 'text'} aria-describedby={helpId} error={error || undefined} onChange={event => { setSearch(event.target.value); setError(''); }} /></div>
                <Button type="submit" disabled={pending || searchMode === 'TITLE' || !canReadId}><Search size={16} aria-hidden="true" />{pending ? 'Abrindo...' : 'Buscar'}</Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2"><p id={helpId} className="text-xs text-j-gray-600">{searchMode === 'TITLE' ? 'Busca por título ainda indisponível.' : !canReadId ? 'Sem permissão para consultar por ID.' : mode === 'AUTO' ? 'Números buscam por ID; textos, por título.' : 'Busca direta por ID.'}</p>
                {search && <button type="button" disabled={pending} className="flex cursor-pointer items-center gap-1 text-sm text-j-gray-700 underline focus-visible:outline-2" onClick={() => { setSearch(''); setError(''); }}><X size={14} aria-hidden="true" />Limpar pesquisa</button>}
            </div>
        </form>
        <Filters filters={filters} requiredVisible={publishedFrom || publishedTo ? ['publishedPeriod'] : []} onRemove={id => {
            if (id === 'publishedPeriod') { setFrom(''); setTo(''); setPeriodErrors({}); if (publishedFrom || publishedTo) onPeriod({}); }
        }} onClear={() => { setFrom(''); setTo(''); setPeriodErrors({}); onClear(); }} />
        <p className="text-xs text-j-gray-600">Filtros desabilitados ainda não têm suporte na API.</p>
    </div>;
}
