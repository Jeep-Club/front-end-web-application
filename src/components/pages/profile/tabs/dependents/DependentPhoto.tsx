'use client';

import { useState } from 'react';

export function DependentPhoto({ dependent, className = 'h-12 w-12 rounded-xl' }: { dependent: Pick<MemberDependent, 'id' | 'name' | 'photoUrl' | 'updatedAt'>; className?: string }) {
    const [failed, setFailed] = useState<string | null>(null);
    const url = dependent.photoUrl ? `/api/dependents/${dependent.id}/photo?v=${encodeURIComponent(dependent.updatedAt ?? '')}` : null;
    const initials = dependent.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('pt-BR');
    return <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-j-gray-200 bg-j-blue-800 font-bold text-j-yellow-300 ${className}`}>
        {url && failed !== url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={url} alt={`Foto de ${dependent.name}`} loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(url)} />
            : <span aria-label={`Sem foto de ${dependent.name}`}>{initials || '?'}</span>}
    </span>;
}
