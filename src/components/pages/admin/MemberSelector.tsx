"use client";

import { useEffect, useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check, X } from "lucide-react";
import { listUserOptionsAction } from "@/actions/admin/users/options";

export interface MemberOption { id: number; name: string }

export function MemberSelector({ value, onChange, disabled = false }: { value: MemberOption | null; onChange: (member: MemberOption | null) => void; disabled?: boolean }) {
    const id = useId();
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [page, setPage] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => { setDebounced(search.trim()); setPage(0); }, 300);
        return () => clearTimeout(timer);
    }, [search]);
    const waiting = search.trim() !== debounced;
    const query = useQuery({ queryKey: ["admin", "user-options", debounced, page], queryFn: () => listUserOptionsAction(debounced, page), enabled: !disabled && !value && !!debounced && !waiting, gcTime: 0 });
    return <div className="flex flex-col gap-3">
        <label htmlFor={id} className="text-sm font-bold text-j-gray-700">Associado <span className="text-red-500">*</span></label>
        {value ? <div className="flex items-center justify-between gap-3 rounded-xl border border-j-blue-200 bg-blue-50 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2"><Check size={18} className="shrink-0 text-j-blue-700" aria-hidden="true" /><span className="break-words text-sm font-bold text-j-blue-800">{value.name}</span></div>
            <button type="button" disabled={disabled} onClick={() => { onChange(null); setSearch(""); }} aria-label="Trocar associado" className="rounded-lg p-2 text-j-blue-800 hover:bg-blue-100"><X size={18} /></button>
        </div> : <>
            <div className="relative"><Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-j-gray-400" /><input id={id} type="search" autoComplete="off" maxLength={150} disabled={disabled} value={search} onChange={event => setSearch(event.target.value)} placeholder="Pesquise pelo nome do associado" aria-describedby={`${id}-status`} className="w-full rounded-lg border border-j-gray-200 bg-j-gray-100 py-3 pl-10 pr-4 text-sm text-j-gray-700 focus:bg-white" /></div>
            <div id={`${id}-status`} aria-live="polite" className="text-xs text-j-gray-500">
                {!search.trim() ? "Digite o nome e selecione o associado na lista." : waiting || query.isFetching ? "Pesquisando associados..." : query.isError ? "Não foi possível carregar os associados." : query.data?.empty ? "Nenhum associado encontrado." : query.data ? `${query.data.totalElements} associado(s) encontrado(s).` : ""}
            </div>
            {query.isError && <button type="button" disabled={disabled} onClick={() => void query.refetch()} className="self-start text-sm font-bold text-j-blue-700 hover:underline">Tentar novamente</button>}
            {!waiting && query.data && <>
                <ul aria-label="Associados encontrados" className="max-h-52 overflow-y-auto rounded-xl border border-j-gray-200 bg-white empty:hidden">{query.data.content.map(member => <li key={member.id}><button type="button" disabled={disabled} onClick={() => onChange(member)} className="flex w-full items-center justify-between gap-3 border-b border-j-gray-100 px-4 py-3 text-left text-sm hover:bg-blue-50 focus-visible:bg-blue-50"><span className="font-semibold text-j-blue-800">{member.name}</span></button></li>)}</ul>
                {query.data.totalPages > 1 && <div className="flex items-center justify-between gap-3 text-xs"><button type="button" disabled={disabled || page === 0 || query.isFetching} onClick={() => setPage(current => current - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Anterior</button><span>Página {page + 1} de {query.data.totalPages}</span><button type="button" disabled={disabled || query.data.last || query.isFetching} onClick={() => setPage(current => current + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Próxima</button></div>}
            </>}
        </>}
    </div>;
}
