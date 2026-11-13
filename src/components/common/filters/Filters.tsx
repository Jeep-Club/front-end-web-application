'use client';

import { useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Select } from '@/components/common/select/select';

export interface FilterItem {
    id: string;
    label: string;
    content: ReactNode;
}

/** Organiza os filtros recebidos sem conhecer seus valores ou regras. */
export function Filters({ filters, requiredVisible = [], onRemove, onClear }: { filters: FilterItem[]; requiredVisible?: string[]; onRemove?: (id: string) => void; onClear: () => void }) {
    const [visible, setVisible] = useState(() => Array.from(new Set([...filters.slice(0, 3).map(filter => filter.id), ...requiredVisible])));
    const addRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const requiredKey = requiredVisible.join('|');
    const [previousRequiredKey, setPreviousRequiredKey] = useState(requiredKey);

    if (previousRequiredKey !== requiredKey) {
        setPreviousRequiredKey(requiredKey);
        if (requiredKey) setVisible(current => Array.from(new Set([...current, ...requiredKey.split('|')])));
    }

    const available = filters.filter(filter => !visible.includes(filter.id));
    return <div ref={containerRef} className="flex min-w-0 flex-wrap items-end gap-3">
        {visible.map(id => {
            const filter = filters.find(item => item.id === id);
            if (!filter) return null;
            return <div key={id} className="group relative min-w-0 max-w-full">
                {filter.content}
                <button type="button" data-filter-id={id} title="Remover filtro" aria-label={`Remover filtro ${filter.label}`} onClick={() => {
                    setVisible(current => current.filter(value => value !== id));
                    onRemove?.(id);
                    requestAnimationFrame(() => addRef.current?.focus());
                }} className="absolute -right-1 -top-1 flex h-6 w-6 cursor-pointer items-center justify-center text-j-gray-500 opacity-0 transition-all hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"><X size={14} aria-hidden="true" /></button>
            </div>;
        })}
        {available.length > 0 && <div className="w-full sm:w-44"><Select key={available.map(filter => filter.id).join('|')} ref={addRef} name="addFilter" label="Adicionar filtro" placeholder="+ Adicionar filtro" value="" options={available.map(filter => ({ value: filter.id, label: filter.label }))} onValueChange={next => {
            const id = String(next);
            setVisible(current => [...current, id]);
            requestAnimationFrame(() => containerRef.current?.querySelector<HTMLElement>(`[data-filter-id="${CSS.escape(id)}"]`)?.focus());
        }} /></div>}
        <button type="button" className="min-h-10 cursor-pointer text-sm font-bold text-j-gray-700 underline focus-visible:outline-2" onClick={() => { setVisible(filters.slice(0, 3).map(filter => filter.id)); onClear(); }}>Limpar filtros</button>
    </div>;
}
