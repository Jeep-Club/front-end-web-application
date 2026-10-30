'use client';

import { useId, useState } from 'react';
import { Input } from '@/components/common/input/input';
import { Button } from '@/components/common/button';
import { publicationFeedFiltersSchema, type PublicationFeedFilters } from '@/schemas/publications/feed';

export function FeedPeriodFilters({ publishedFrom = '', publishedTo = '', onApply, disabled = false }: {
    publishedFrom?: string; publishedTo?: string;
    onApply: (filters: Pick<PublicationFeedFilters, 'publishedFrom' | 'publishedTo'>) => void;
    disabled?: boolean;
}) {
    const [from, setFrom] = useState(publishedFrom);
    const [to, setTo] = useState(publishedTo);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [applied, setApplied] = useState({ publishedFrom, publishedTo });
    // History/controlled props replace the draft; typing never changes applied filters.
    if (applied.publishedFrom !== publishedFrom || applied.publishedTo !== publishedTo) {
        setApplied({ publishedFrom, publishedTo });
        setFrom(publishedFrom);
        setTo(publishedTo);
        setErrors({});
    }
    const helpId = useId();
    return <form aria-label="Período de publicação" aria-describedby={helpId} className="rounded-2xl border border-j-gray-200 bg-j-white p-4" onSubmit={event => {
        event.preventDefault();
        const result = publicationFeedFiltersSchema.safeParse({ publishedFrom: from || undefined, publishedTo: to || undefined });
        if (!result.success) {
            setErrors(Object.fromEntries(result.error.issues.map(issue => [issue.path.join('.'), issue.message])));
            return;
        }
        setErrors({});
        onApply(result.data);
    }}>
        <p id={helpId} className="mb-3 text-xs text-j-gray-600">Período de publicação em UTC, com limites inclusivos. Exemplo: 2026-10-29T12:00:00Z. Você pode informar apenas um limite.</p>
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
            <Input name="publishedFrom" label="Publicada a partir de (UTC)" value={from} onChange={event => setFrom(event.target.value)} error={errors.publishedFrom} disabled={disabled} aria-describedby={helpId} placeholder="2026-10-01T00:00:00Z" />
            <Input name="publishedTo" label="Publicada até (UTC)" value={to} onChange={event => setTo(event.target.value)} error={errors.publishedTo} disabled={disabled} aria-describedby={helpId} placeholder="2026-10-31T23:59:59.999999Z" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
            <Button type="submit" disabled={disabled}>Aplicar período</Button>
            <Button type="button" disabled={disabled} onClick={() => { setFrom(''); setTo(''); setErrors({}); onApply({}); }}>Limpar período</Button>
        </div>
    </form>;
}
