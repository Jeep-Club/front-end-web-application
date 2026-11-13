import { KeyRound, LoaderCircle, UsersRound } from "lucide-react";

export function RoleManagementLoading({ label, cards = false, assignments = false }: {
    label: string;
    cards?: boolean;
    assignments?: boolean;
}) {
    const Icon = assignments ? UsersRound : KeyRound;
    return (
        <div className="relative min-h-56 p-4 md:p-6" aria-busy="true">
            <div aria-hidden="true" className={`grid gap-3 opacity-60 motion-safe:animate-pulse ${cards ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
                {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl border border-j-gray-200 bg-j-white p-4">
                        <div className="size-10 shrink-0 rounded-lg bg-j-gray-200" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-2/3 rounded bg-j-gray-200" />
                            <div className="h-3 w-1/2 rounded bg-j-gray-200" />
                            {cards && <div className="mt-4 h-10 rounded-lg bg-j-gray-200" />}
                        </div>
                    </div>
                ))}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 grid h-64 place-items-center p-4">
                <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl border border-j-gray-200 bg-j-white px-5 py-6 text-center shadow-xl">
                    <span className="grid size-12 place-items-center rounded-2xl bg-j-yellow-300 text-j-blue-900">
                        <Icon size={24} aria-hidden="true" />
                    </span>
                    <p className="text-lg font-extrabold text-primary">{assignments ? "Cargos por pessoa" : "Organizando os acessos do clube"}</p>
                    <span role="status" className="inline-flex items-center gap-2 text-sm text-secondary">
                        <LoaderCircle size={16} aria-hidden="true" className="motion-safe:animate-spin" />
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
}
