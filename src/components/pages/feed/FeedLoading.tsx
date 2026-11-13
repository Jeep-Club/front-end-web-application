import { LoaderCircle, Mountain } from "lucide-react";

export function FeedLoading({ label }: { label: string }) {
    return (
        <span role="status" className="inline-flex items-center gap-2 text-sm text-secondary">
            <LoaderCircle size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
            {label}
        </span>
    );
}

export function PublicationSkeletons({ label, count = 2, featured = false }: { label: string; count?: number; featured?: boolean }) {
    return (
        <div className="relative grid gap-4">
            {featured ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 grid h-[min(55dvh,28rem)] min-h-56 place-items-center px-4">
                    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl border border-j-gray-200 bg-background px-5 py-6 text-center shadow-xl sm:px-8 sm:py-8">
                        <div className="grid size-12 place-items-center rounded-2xl bg-j-yellow-300 text-j-blue-900">
                            <Mountain size={25} aria-hidden="true" />
                        </div>
                        <p className="text-lg font-extrabold text-primary sm:text-xl">A próxima trilha começa aqui.</p>
                        <FeedLoading label={label} />
                    </div>
                </div>
            ) : <FeedLoading label={label} />}
            {Array.from({ length: count }, (_, index) => (
                <div key={index} aria-hidden="true" className={`space-y-4 rounded-2xl border border-j-gray-200 bg-j-white p-4 motion-safe:animate-pulse ${featured ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-j-gray-200" />
                        <div className="space-y-2">
                            <div className="h-3 w-28 rounded bg-j-gray-200" />
                            <div className="h-2 w-16 rounded bg-j-gray-200" />
                        </div>
                    </div>
                    <div className="h-4 w-3/4 rounded bg-j-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-j-gray-200" />
                    <div className="aspect-video rounded-xl bg-j-gray-200" />
                    <div className="h-3 w-24 rounded bg-j-gray-200" />
                </div>
            ))}
        </div>
    );
}

export function SidebarSkeleton({ label, variant }: { label: string; variant: "event" | "birthday" | "notice" }) {
    return (
        <div className="space-y-2">
            <span className="sr-only" role="status">{label}</span>
            <div aria-hidden="true" className="flex items-center gap-3 motion-safe:animate-pulse">
                {variant === "event" && <div className="h-12 w-14 shrink-0 rounded-lg bg-j-gray-200" />}
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-j-gray-200" />
                    {variant !== "birthday" && <div className="h-2 w-1/2 rounded bg-j-gray-200" />}
                </div>
                {variant === "birthday" && <div className="h-5 w-14 shrink-0 rounded-full bg-j-gray-200" />}
            </div>
        </div>
    );
}
