"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, ShieldX } from "lucide-react";
import { listPaymentsAction } from "@/actions/payments";
import { Button } from "@/components/common/button";
import { PageHeader } from "@/components/common/page-header";
import { ManagementBackButton } from "@/components/pages/admin/ManagementBackButton";
import { ListPagination } from "@/components/common/table/ListPagination";
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

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader title="Análise de pagamentos" breadcrumbs={[
                    { label: "Home", href: "/feed" },
                    { label: "Gestão Administrativa", href: "/admin" },
                    { label: "Análise de pagamentos" },
                ]} />
                {!canRead ? (
                    <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center">
                        <ShieldX size={42} className="mb-3 text-j-gray-400" />
                        <h3 className="text-lg font-black text-j-blue-800">Acesso não permitido</h3>
                        <p className="mt-1 text-sm text-j-gray-600">Seu usuário não possui permissão para visualizar a análise de pagamentos.</p>
                    </section>
                ) : (
                    <section className="flex flex-col gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm sm:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <ManagementBackButton />
                            <h3 className="text-base font-bold text-j-gray-700">Pagamentos enviados</h3>
                        </div>
                        <p className="text-sm text-j-gray-600">Consulte os comprovantes enviados e decida sobre os pagamentos.</p>
                        <section aria-label="Filtros de pagamentos" className="flex flex-wrap items-end gap-4 rounded-2xl border border-j-gray-200 bg-j-white p-4">
                            <label className="flex min-w-52 flex-col gap-1 text-sm font-bold text-j-blue-800">
                                Status
                                <select value={filters.status ?? ""} disabled={isNavigating} onChange={event => navigate({ ...filters, status: (event.target.value || undefined) as PaymentStatus | undefined, page: 0 })} className="rounded-lg border border-j-gray-200 bg-j-white p-2.5 font-normal">
                                    <option value="">Todos os status</option>
                                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
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
                                                <thead className="bg-j-gray-100/70 text-[10px] font-extrabold uppercase tracking-wide text-j-gray-400"><tr>{["Pagamento", "Cobrança", "Valor", "Método", "Pago em", "Status", "Ações"].map(title => <th key={title} scope="col" className="whitespace-nowrap px-4 py-3">{title}</th>)}</tr></thead>
                                                <tbody className="divide-y divide-j-gray-100">
                                                    {data.content.map(payment => <tr key={payment.id} className="transition-colors hover:bg-blue-50/30">
                                                        <td className="px-4 py-4 font-bold text-j-blue-800">#{payment.id}</td>
                                                        <td className="px-4 py-4">#{payment.memberChargeId}</td>
                                                        <td className="whitespace-nowrap px-4 py-4">{formatAmount(payment.amount)}</td>
                                                        <td className="px-4 py-4">{methodLabels[payment.paymentMethod]}</td>
                                                        <td className="whitespace-nowrap px-4 py-4">{formatDate(payment.paidAt)}</td>
                                                        <td className="px-4 py-4"><PaymentStatusBadge status={payment.status} /></td>
                                                        <td className="px-4 py-4"><Link href={`/admin/pagamentos/${payment.id}`} aria-label={`Analisar pagamento ${payment.id}`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-j-blue-700 hover:bg-blue-100"><Eye size={16} /> Detalhes</Link></td>
                                                    </tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                </>
                            )}
                        </section>
                        {data && !error && <ListPagination itemLabel="pagamento" isFetching={isFetching || isNavigating} pagination={{
                            pageIndex: filters.page,
                            pageSize: filters.size,
                            pageCount: data.totalPages,
                            rowCount: data.totalElements,
                            pageSizeOptions: [10, 20, 50],
                            onChange: next => navigate({ ...filters, page: next.pageSize !== filters.size ? 0 : next.pageIndex, size: next.pageSize }),
                        }} />}
                    </section>
                )}
            </div>
        </div>
    );
}
