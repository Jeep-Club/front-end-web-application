import { CalendarDays, CircleAlert, ReceiptText, WalletCards } from "lucide-react";

import { listMyMemberChargesAction } from "@/actions/billing/memberCharges/listMine";
import { PageHeader } from "@/components/common/page-header";

const STATUS_LABEL: Record<MemberChargeEffectiveStatus, string> = {
    PENDING: "Pendente",
    OVERDUE: "Em atraso",
    EXPIRED: "Expirada",
    PAID: "Paga",
    CANCELED: "Cancelada",
};

const STATUS_STYLE: Record<MemberChargeEffectiveStatus, string> = {
    PENDING: "bg-j-yellow-100 text-j-yellow-700",
    OVERDUE: "bg-j-red-100 text-j-red-500",
    EXPIRED: "bg-j-gray-200 text-j-gray-600",
    PAID: "bg-j-green-100 text-j-green-700",
    CANCELED: "bg-j-gray-200 text-j-gray-500",
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default async function Financeiro() {
    let charges: MemberChargeSummary[] = [];
    let loadError = false;

    try {
        const page = await listMyMemberChargesAction({ page: "0", size: "50", sort: "dueDate,desc" });
        charges = page.content;
    } catch {
        loadError = true;
    }

    return (
        <div className="min-h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4">
                <PageHeader
                    title="Histórico financeiro"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Histórico financeiro" },
                    ]}
                />

                <section className="overflow-hidden rounded-xl border border-j-gray-200 bg-j-white">
                    <header className="flex items-start gap-3 border-b border-j-gray-200 px-5 py-4">
                        <span className="rounded-xl bg-j-blue-50 p-2.5 text-j-blue-800">
                            <WalletCards size={20} />
                        </span>
                        <div>
                            <h2 className="text-base font-extrabold text-j-gray-700">Pagamentos e cobranças da minha conta</h2>
                            <p className="mt-0.5 text-xs leading-relaxed text-j-gray-400">
                                Aqui aparecem somente os lançamentos vinculados ao seu cadastro.
                            </p>
                        </div>
                    </header>

                    <div className="p-5">
                        {loadError ? (
                            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-j-red-200 p-6 text-center">
                                <CircleAlert size={30} className="text-j-red-400" />
                                <p className="mt-3 text-sm font-bold text-j-gray-700">Não foi possível carregar o histórico</p>
                                <p className="mt-1 max-w-sm text-xs leading-relaxed text-j-gray-400">
                                    Tente acessar novamente em alguns instantes.
                                </p>
                            </div>
                        ) : charges.length === 0 ? (
                            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-j-gray-300 p-6 text-center">
                                <ReceiptText size={30} className="text-j-gray-400" />
                                <p className="mt-3 text-sm font-bold text-j-gray-700">Nenhum lançamento encontrado</p>
                                <p className="mt-1 max-w-sm text-xs leading-relaxed text-j-gray-400">
                                    Você ainda não possui cobranças em seu histórico.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {charges.map((charge) => (
                                    <article key={charge.id} className="flex flex-col gap-4 rounded-xl border border-j-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-j-gray-100 text-j-blue-800">
                                                <ReceiptText size={19} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-extrabold text-j-gray-700">Cobrança #{charge.id}</p>
                                                <p className="mt-0.5 text-xs text-j-gray-400">
                                                    Ciclo #{charge.chargeCycleId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                                            <div className="flex items-center gap-2 text-xs text-j-gray-500">
                                                <CalendarDays size={15} />
                                                <span>Vencimento <strong className="text-j-gray-700">{formatDate(charge.dueDate)}</strong></span>
                                            </div>
                                            <p className="min-w-24 text-sm font-extrabold text-j-gray-700">{formatCurrency(charge.finalAmount)}</p>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[charge.effectiveStatus]}`}>
                                                {STATUS_LABEL[charge.effectiveStatus]}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
