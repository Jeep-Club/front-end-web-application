"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, WalletCards } from "lucide-react";
import { listPaymentsAction } from "@/actions/payments";
import { Button } from "@/components/common/button";
import { paymentPermissions } from "@/config/paymentPermissions";
import type { PaymentFilters, PaymentStatus } from "@/schemas/payments";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { formatAmount, formatDate, methodLabels, paymentKeys, PaymentStatusBadge, statusLabels } from "./presentation";

export default function PaymentsPage({ filters }: { filters: PaymentFilters }) {
    const router = useRouter();
    const [isNavigating, startTransition] = useTransition();
    const permissions = useUserStore(state => state.permissions);
    const canRead = hasPermission(permissions, paymentPermissions.module, paymentPermissions.read);
    const { data, error, isPending, isFetching, refetch } = useQuery({
        queryKey: [...paymentKeys.lists, filters],
        queryFn: () => listPaymentsAction(filters),
        enabled: canRead,
    });

    function navigate(next: PaymentFilters) {
        const params = new URLSearchParams({ page: String(next.page), size: String(next.size) });
        if (next.status) params.set("status", next.status);
        startTransition(() => router.push(`/admin/pagamentos?${params}`));
    }

    if (!canRead) return <p className="p-6 text-j-gray-600">Acesso à análise de pagamentos indisponível.</p>;

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
            <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-j-blue-800"><ArrowLeft size={16} /> Painel administrativo</Link>
            <header className="flex items-center gap-4">
                <span className="rounded-2xl bg-j-blue-800 p-3 text-j-yellow-300"><WalletCards size={26} /></span>
                <div><h1 className="text-2xl font-black text-j-blue-800">Análise de pagamentos</h1><p className="text-sm text-j-gray-600">Consulte os comprovantes enviados e decida sobre os pagamentos.</p></div>
            </header>

            <section aria-label="Filtros de pagamentos" className="flex flex-wrap items-end gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-4">
                <label className="flex min-w-52 flex-col gap-1 text-sm font-bold text-j-blue-800">
                    Status
                    <select value={filters.status ?? ""} disabled={isNavigating} onChange={event => navigate({ ...filters, status: (event.target.value || undefined) as PaymentStatus | undefined, page: 0 })} className="rounded-lg border border-j-gray-200 bg-j-white p-2.5 font-normal">
                        <option value="">Todos os status</option>
                        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold text-j-blue-800">
                    Por página
                    <select value={filters.size} disabled={isNavigating} onChange={event => navigate({ ...filters, size: Number(event.target.value), page: 0 })} className="rounded-lg border border-j-gray-200 bg-j-white p-2.5 font-normal">
                        {[10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </label>
                <Button disabled={isNavigating || isFetching} onClick={() => { void refetch(); }}>Atualizar</Button>
                {filters.status && <Button disabled={isNavigating} onClick={() => navigate({ page: 0, size: filters.size })} className="bg-j-gray-100 text-j-blue-800">Limpar filtros</Button>}
            </section>

            <section aria-label="Pagamentos" aria-busy={isFetching || isNavigating} className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                <div className="border-b border-j-gray-200 p-4 text-sm text-j-gray-600" aria-live="polite">
                    {isPending ? "Carregando pagamentos..." : `${data?.totalElements ?? 0} pagamento(s) encontrado(s)`}
                </div>
                {error ? <div role="alert" className="flex flex-col items-start gap-3 p-6 text-red-700"><p>{error.message}</p><Button onClick={() => { void refetch(); }}>Tentar novamente</Button></div> : data && (
                    <>
                        {data.content.length === 0 ? <p className="p-8 text-center text-j-gray-600">Nenhum pagamento encontrado nesta página.</p> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <caption className="sr-only">Pagamentos enviados para análise</caption>
                                    <thead className="bg-j-gray-100 text-j-blue-800"><tr>{["Pagamento", "Cobrança", "Valor", "Método", "Pago em", "Status", "Ações"].map(title => <th key={title} scope="col" className="whitespace-nowrap px-4 py-3">{title}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-j-gray-100">
                                        {data.content.map(payment => <tr key={payment.id}>
                                            <td className="px-4 py-4 font-bold text-j-blue-800">#{payment.id}</td>
                                            <td className="px-4 py-4">#{payment.memberChargeId}</td>
                                            <td className="whitespace-nowrap px-4 py-4">{formatAmount(payment.amount)}</td>
                                            <td className="px-4 py-4">{methodLabels[payment.paymentMethod]}</td>
                                            <td className="whitespace-nowrap px-4 py-4">{formatDate(payment.paidAt)}</td>
                                            <td className="px-4 py-4"><PaymentStatusBadge status={payment.status} /></td>
                                            <td className="px-4 py-4"><Link href={`/admin/pagamentos/${payment.id}`} aria-label={`Analisar pagamento ${payment.id}`} className="inline-flex items-center gap-2 rounded-lg p-2 font-bold text-j-blue-700 hover:bg-j-gray-100"><Eye size={16} /> Detalhes</Link></td>
                                        </tr>)}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <nav aria-label="Paginação de pagamentos" className="flex flex-wrap items-center justify-between gap-3 border-t border-j-gray-200 p-4">
                            <p className="text-sm text-j-gray-600">{data.totalPages > 0 && data.number < data.totalPages ? `Página ${data.number + 1} de ${data.totalPages}` : "Nenhum resultado nesta página"}</p>
                            <div className="flex gap-2">
                                {filters.page > 0 && <Button disabled={isNavigating || isFetching} onClick={() => navigate({ ...filters, page: 0 })}>Primeira</Button>}
                                <Button disabled={filters.page === 0 || isNavigating || isFetching} onClick={() => navigate({ ...filters, page: Math.max(0, Math.min(filters.page - 1, data.totalPages - 1)) })}>Anterior</Button>
                                <Button disabled={data.last || filters.page + 1 >= data.totalPages || isNavigating || isFetching} onClick={() => navigate({ ...filters, page: filters.page + 1 })}>Próxima</Button>
                            </div>
                        </nav>
                    </>
                )}
            </section>
        </div>
    );
}
