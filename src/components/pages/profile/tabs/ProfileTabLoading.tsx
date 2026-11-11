import { LoaderCircle } from "lucide-react";

/** Loading shapes mirror the profile tabs without announcing decorative placeholders. */
export function ProfileTabLoading({ label, layout }: { label: string; layout: "medical" | "cards" | "rows" }) {
    return <div role="status" aria-live="polite" aria-busy="true" className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-j-gray-600">
            <LoaderCircle size={20} aria-hidden="true" className="shrink-0 text-j-blue-800 motion-safe:animate-spin" />
            <span>{label}</span>
        </div>
        <div aria-hidden="true" className="motion-safe:animate-pulse">
            {layout === "medical" ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((item) => <div key={item} className="flex min-h-40 flex-col gap-5 rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-j-gray-200 pb-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-j-gray-200" />
                        <div className="h-4 w-1/2 rounded-full bg-j-gray-300" />
                    </div>
                    <div className="h-3 w-3/4 rounded-full bg-j-gray-200" />
                    <div className="h-3 w-1/2 rounded-full bg-j-gray-200" />
                </div>)}
            </div> : layout === "cards" ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((item) => <div key={item} className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                    <div className="aspect-video bg-j-gray-200" />
                    <div className="flex flex-col gap-3 p-4">
                        <div className="h-5 w-2/3 rounded-full bg-j-gray-300" />
                        <div className="h-3 w-4/5 rounded-full bg-j-gray-200" />
                        <div className="h-3 w-1/2 rounded-full bg-j-gray-200" />
                    </div>
                </div>)}
            </div> : <div className="overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                {[0, 1, 2].map((item) => <div key={item} className="flex items-center gap-4 border-b border-j-gray-200 p-4 last:border-b-0">
                    <div className="h-14 w-20 shrink-0 rounded-lg bg-j-gray-200 sm:w-28" />
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="h-4 w-2/3 max-w-48 rounded-full bg-j-gray-300" />
                        <div className="h-3 w-4/5 max-w-72 rounded-full bg-j-gray-200" />
                    </div>
                </div>)}
            </div>}
        </div>
    </div>;
}
