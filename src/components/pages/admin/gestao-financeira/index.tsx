"use client";

import { WalletCards } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";

export default function FinancialManagement() {
    return (
        <div className="h-full w-full p-3 md:p-4">
            <div className="flex w-full flex-col gap-4 pb-6">
                <PageHeader
                    title="Gestão financeira"
                    breadcrumbs={[
                        { label: "Início", href: "/feed" },
                        { label: "Painel admin", href: "/admin" },
                        { label: "Gestão financeira" },
                    ]}
                />

                <section className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-j-gray-200 p-4 md:px-6">
                        <div>
                            <h2 className="font-black text-j-blue-800">Gestão financeira</h2>
                            <p className="text-sm text-j-gray-600">
                                Acompanhe mensalidades, faturas e a saúde financeira do clube.
                            </p>
                        </div>

                        <WalletCards size={24} className="text-j-gray-400" />
                    </div>

                    <div className="flex flex-col items-center justify-center p-8 text-center min-h-72">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-j-gray-100 text-j-gray-400">
                            <WalletCards size={31} />
                        </div>

                        <h3 className="text-lg font-black text-j-blue-800">
                            Em construção
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-j-gray-600">
                            O módulo de gestão financeira vai aparecer aqui.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
