import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function ProfileTabEmptyState({
    icon: Icon,
    title,
    description,
    emptyTitle,
    emptyDescription,
    action,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    action: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-5 rounded-3xl border border-j-gray-200 bg-j-gray-100 p-4 shadow-sm sm:p-6" aria-label={title}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                        <Icon size={23} aria-hidden="true" />
                    </span>
                    <div>
                        <h3 className="text-lg font-extrabold text-j-blue-800">{title}</h3>
                        <p className="mt-0.5 text-sm text-j-gray-500">{description}</p>
                    </div>
                </div>
                <div className="w-full shrink-0 sm:w-60">{action}</div>
            </div>

            <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white px-5 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-j-blue-50 text-j-blue-700">
                    <Icon size={22} aria-hidden="true" />
                </span>
                <p className="mt-3 font-bold text-j-gray-700">{emptyTitle}</p>
                <p className="mt-1 max-w-md text-sm text-j-gray-500">{emptyDescription}</p>
            </div>
        </section>
    );
}
