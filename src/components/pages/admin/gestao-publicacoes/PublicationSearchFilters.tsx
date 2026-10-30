'use client';

import { useId, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input/input';
import { Select } from '@/components/common/select/select';
import { DatePicker } from '@/components/common/date-picker';
import { localPeriodValueToUtcInstant, utcInstantToLocalPeriodValue } from '@/utils/publications/periodDateTime';
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
    const [periodError, setPeriodError] = useState('');
    const helpId = useId();
    const value = search.trim();
    const searchMode = mode === 'AUTO' ? (!value || /^\d+$/.test(value) ? 'ID' : 'TITLE') : mode;

    function applyPeriod(value: { start: string | null; end: string | null }) {
        const from = value.start ? localPeriodValueToUtcInstant(value.start, { original: publishedFrom, boundary: 'start' }) : undefined;
        const to = value.end ? localPeriodValueToUtcInstant(value.end, { original: publishedTo, boundary: 'end' }) : undefined;
        if ((value.start && !from) || (value.end && !to)) {
            setPeriodError('Horário inválido ou ambíguo.');
            return false;
        }
        const result = publicationFeedFiltersSchema.safeParse({ publishedFrom: from, publishedTo: to });
        if (!result.success) {
            setPeriodError(result.error.issues[0]?.message ?? 'Período inválido.');
            return false;
        }
        setPeriodError('');
        onPeriod(result.data);
    }

    const filters: FilterItem[] = [
        { id: 'editorialStatus', label: 'Estado editorial', content: <div className="w-full sm:w-44"><Select name="editorialStatus" label="Estado editorial" disabled value="ALL" options={[{ value: 'ALL', label: type === 'EVENT' ? 'Todos os estados' : 'Publicados no feed' }, { value: 'DRAFT', label: 'Rascunho' }, { value: 'PUBLISHED', label: 'Publicado' }, { value: 'ARCHIVED', label: 'Arquivado' }]} /></div> },
        ...(type === 'EVENT' ? [{ id: 'eventStatus', label: 'Situação do evento', content: <div className="w-full sm:w-44"><Select name="eventStatus" label="Situação do evento" disabled value="ALL" options={[{ value: 'ALL', label: 'Todas' }, { value: 'OPEN', label: 'Aberto' }, { value: 'IN_PROGRESS', label: 'Em andamento' }, { value: 'FINISHED', label: 'Finalizado' }, { value: 'CANCELLED', label: 'Cancelado' }]} /></div> }] : []),
        ...(type === 'NOTICE' ? [{ id: 'noticePriority', label: 'Prioridade', content: <div className="w-full sm:w-44"><Select name="noticePriority" label="Prioridade" disabled placeholder="Sem suporte na API" /></div> }] : []),
        ...(type === 'SERVICE' ? [{ id: 'serviceCategory', label: 'Categoria do serviço', content: <div className="w-full sm:w-44"><Select name="serviceCategory" label="Categoria do serviço" disabled placeholder="Sem suporte na API" /></div> }] : []),
        ...(type === 'EVENT' ? [{ id: 'eventPeriod', label: 'Período do evento', content: <div className="w-full sm:w-44"><Select name="eventPeriod" label="Período do evento" disabled placeholder="Sem suporte na API" /></div> }] : [{ id: 'publishedPeriod', label: 'Período de publicação', content: <div className="w-full sm:w-72">
            <DatePicker mode="range" label="Período de publicação" disabled={!canReadList}
                value={{ start: publishedFrom ? utcInstantToLocalPeriodValue(publishedFrom) : null, end: publishedTo ? utcInstantToLocalPeriodValue(publishedTo) : null }} onChange={applyPeriod} />
            {periodError && <p role="alert" className="text-sm text-input-error-text">{periodError}</p>}
        </div> }]),
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
            if (id === 'publishedPeriod') { setPeriodError(''); if (publishedFrom || publishedTo) onPeriod({}); }
        }} onClear={() => { setPeriodError(''); onClear(); }} />
        <p className="text-xs text-j-gray-600">Filtros desabilitados ainda não têm suporte na API.</p>
    </div>;
}
