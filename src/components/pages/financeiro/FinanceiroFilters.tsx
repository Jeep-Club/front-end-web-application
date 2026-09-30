"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";

interface FinanceiroFiltersProps {
    initialStatus?: MemberChargeStatus;
    initialSort: string;
}

export function FinanceiroFilters({ initialStatus, initialSort }: FinanceiroFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState(initialStatus ?? "");
    const [sort, setSort] = useState(initialSort);
    const [isPending, startTransition] = useTransition();

    function applyFilters(nextStatus: string, nextSort: string) {
        const params = new URLSearchParams();
        if (nextStatus) params.set("status", nextStatus);
        if (nextSort) params.set("sort", nextSort);
        params.set("page", "0");

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
    }

    function handleStatusChange(value: string) {
        setStatus(value);
        applyFilters(value, sort);
    }

    function handleSortChange(value: string) {
        setSort(value);
        applyFilters(status, value);
    }

    return (
        <div className="mb-5 grid gap-3 rounded-xl bg-j-gray-50 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="flex flex-col gap-2 text-xs font-bold text-j-gray-600">
                Status da cobrança
                <select
                    name="status"
                    value={status}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    className="rounded-lg border border-j-gray-200 bg-white px-3 py-2.5 text-sm font-normal text-j-gray-700 focus:border-j-blue-500 focus:outline-none"
                >
                    <option value="">Todos os status</option>
                    <option value="PENDING">Em aberto (pendente, em atraso ou expirada)</option>
                    <option value="PAID">Paga</option>
                    <option value="CANCELED">Cancelada</option>
                </select>
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold text-j-gray-600">
                Ordenar por vencimento
                <select
                    name="sort"
                    value={sort}
                    onChange={(event) => handleSortChange(event.target.value)}
                    className="rounded-lg border border-j-gray-200 bg-white px-3 py-2.5 text-sm font-normal text-j-gray-700 focus:border-j-blue-500 focus:outline-none"
                >
                    <option value="dueDate,desc">Mais recentes primeiro</option>
                    <option value="dueDate,asc">Mais antigas primeiro</option>
                </select>
            </label>
            <span aria-live="polite" className="flex min-h-10 items-center gap-2 text-xs text-j-gray-500">
                {isPending ? <><LoaderCircle size={15} className="animate-spin" /> Atualizando resultados...</> : ""}
            </span>
        </div>
    );
}
