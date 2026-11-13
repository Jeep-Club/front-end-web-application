'use client';

import { useId, useState } from 'react';
import { DatePicker } from '@/components/common/date-picker';
import { parseAbsoluteToLocal } from '@internationalized/date';
import { Button } from '@/components/common/button';
import { publicationFeedFiltersSchema, type PublicationFeedFilters } from '@/schemas/publications/feed';

export function FeedPeriodFilters({ publishedFrom = '', publishedTo = '', onApply, disabled = false, compact = false }: {
    publishedFrom?: string; publishedTo?: string;
    onApply: (filters: Pick<PublicationFeedFilters, 'publishedFrom' | 'publishedTo'>) => void;
    disabled?: boolean;
    compact?: boolean;
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
    const dateValue = (value: string) => { try { return value ? parseAbsoluteToLocal(new Date(value).toISOString()) : null; } catch { return null; } };
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
        <p id={helpId} className="mb-3 text-xs text-j-gray-600">{compact ? "Preencha uma ou as duas datas." : "Selecione a data e o horário local. Você pode informar apenas um dos limites."}</p>
        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <DatePicker label="Publicada a partir de" granularity="minute" value={dateValue(from)} onChange={value => setFrom(value ? value.toDate().toISOString() : '')} errorMessage={errors.publishedFrom} isInvalid={!!errors.publishedFrom} isDisabled={disabled} />
            <DatePicker label="Publicada até" granularity="minute" value={dateValue(to)} onChange={value => setTo(value ? value.toDate().toISOString() : '')} errorMessage={errors.publishedTo} isInvalid={!!errors.publishedTo} isDisabled={disabled} />
        </div>
        <div className={compact ? "mt-3 grid grid-cols-2 gap-2" : "mt-3 flex flex-wrap items-center justify-between gap-2"}>
            <Button type="button" disabled={disabled} className="border border-input-border bg-background-secondary text-primary hover:bg-background-tertiary hover:text-primary" onClick={() => { setFrom(''); setTo(''); setErrors({}); onApply({}); }}>{compact ? "Limpar" : "Limpar período"}</Button>
            <Button type="submit" disabled={disabled}>{compact ? "Aplicar" : "Aplicar período"}</Button>
        </div>
    </form>;
}
