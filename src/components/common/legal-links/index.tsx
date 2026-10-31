import Link from "next/link";
import { twMerge } from "tailwind-merge";

export const legalLinks = [
    { href: "/politica-de-privacidade", label: "Política de Privacidade" },
    { href: "/termos-de-uso", label: "Termos de Uso" },
    { href: "/contato", label: "Contato" },
] as const;

export default function LegalLinks({ className }: { className?: string }) {
    return (
        <nav aria-label="Informações legais e contato" className={twMerge("flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs", className)}>
            {legalLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="rounded-sm underline-offset-4 transition-colors hover:text-j-yellow-300 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-j-yellow-300">
                    {label}
                </Link>
            ))}
        </nav>
    );
}
