import { BellRing } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

export default function NotificationsPage() {
    return (
        <div className="min-h-full w-full p-3 md:p-5">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
                <PageHeader
                    title="Notificações"
                    breadcrumbs={[
                        { label: "Home", href: "/feed" },
                        { label: "Notificações" },
                    ]}
                />
                <section
                    aria-labelledby="notifications-empty-title"
                    className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-j-gray-200 bg-j-white p-8 text-center shadow-sm"
                >
                    <BellRing size={28} className="text-j-blue-700" aria-hidden="true" />
                    <h2 id="notifications-empty-title" className="mt-3 text-base font-bold text-j-blue-900">
                        Nenhuma notificação por enquanto
                    </h2>
                    <p className="mt-1 text-sm text-j-gray-500">
                        Quando houver novidades, elas aparecerão aqui.
                    </p>
                </section>
            </div>
        </div>
    );
}
