import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ManagementBackButton() {
    return (
        <Link href="/admin" className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-j-gray-200 bg-j-white px-3 text-sm font-bold text-j-blue-800 transition-colors hover:border-j-blue-300 hover:bg-blue-50">
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar
        </Link>
    );
}
