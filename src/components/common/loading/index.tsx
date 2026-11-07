import { LoaderCircle } from "lucide-react";

export default function Loading() {
    return (
        <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center gap-3 text-j-gray-500">
            <LoaderCircle size={24} aria-hidden="true" className="animate-spin text-j-blue-800" />
            <p className="text-sm font-semibold">Carregando...</p>
        </div>
    );
}
